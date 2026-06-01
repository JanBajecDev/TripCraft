import { streamText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import * as tools from './tools'
import { buildSystemPrompt } from './systemPrompt'
import { db } from '../db/client'
import { messages, itinerary } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { InferSelectModel } from 'drizzle-orm'
import type { trips } from '../db/schema'

type TripRow = InferSelectModel<typeof trips>
type MessageRow = InferSelectModel<typeof messages>

type SseEvent = 'text' | 'tool_start' | 'tool_done' | 'itinerary_update' | 'suggestions' | 'done'
type SendFn = (event: SseEvent, data: unknown) => void

function summariseArgs(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'google_flights':
      return `${args.departure_id} → ${args.arrival_id}, ${args.outbound_date} – ${args.return_date}, ${args.adults} pax`
    case 'google_hotels':
      return `"${args.q}", ${args.check_in_date} – ${args.check_out_date}`
    case 'yelp_search':
      return `"${args.find_desc}" in ${args.find_loc}`
    case 'google_events':
      return `"${args.q}"`
    case 'tripadvisor_search':
      return `"${args.q}" (${args.searchType})`
    case 'tripadvisor_reviews':
      return `location ${args.location_id}`
    default:
      return JSON.stringify(args).slice(0, 80)
  }
}

// Normalize a name for fuzzy-ish cache lookup
function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Map emit tool names → itinerary section keys
const EMIT_SECTION_MAP: Record<string, string> = {
  emit_flights:     'flights',
  emit_hotel:       'hotel',
  emit_days:        'days',
  emit_restaurants: 'restaurants',
  emit_events:      'events',
  emit_car:         'car',
  emit_budget:      'budget',
}

const SILENT_TOOLS = new Set(Object.keys(EMIT_SECTION_MAP).concat(['emit_suggestions']))

export async function runAgent({
  trip,
  history,
  send,
  tripId,
}: {
  trip: TripRow
  history: MessageRow[]
  send: SendFn
  tripId: string
}): Promise<void> {
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! })
  const model = openrouter(process.env.AI_MODEL ?? 'anthropic/claude-sonnet-4-5')

  console.log(`[agent] starting for trip ${tripId} → ${trip.destination}, model: ${process.env.AI_MODEL}`)

  let fullText = ''
  const itineraryUpdates: Record<string, unknown> = {}

  // Link cache: keyed by normalized name → actual URL from SerpAPI
  const linkCache = new Map<string, string>()
  // Thumbnail cache: hotel name → thumbnail URL
  const thumbCache = new Map<string, string>()

  function injectLinks<T extends { name?: string; link?: string; thumbnail?: string }>(
    items: T[],
    cacheMap: Map<string, string>,
    thumbMap?: Map<string, string>
  ): T[] {
    return items.map(item => {
      const key = normalize(item.name ?? '')
      const cachedLink = cacheMap.get(key)
      const cachedThumb = thumbMap?.get(key)
      return {
        ...item,
        link: item.link || cachedLink,
        ...(cachedThumb ? { thumbnail: item.thumbnail || cachedThumb } : {}),
      }
    })
  }

  const { fullStream } = streamText({
    model,
    system: buildSystemPrompt(trip),
    messages: history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    tools: {
      google_flights:      tools.googleFlightsTool,
      google_hotels:       tools.googleHotelsTool,
      yelp_search:         tools.yelpSearchTool,
      google_events:       tools.googleEventsTool,
      tripadvisor_search:  tools.tripadvisorSearchTool,
      tripadvisor_reviews: tools.tripadvisorReviewsTool,
      emit_flights:        tools.emitFlightsTool,
      emit_hotel:          tools.emitHotelTool,
      emit_days:           tools.emitDaysTool,
      emit_restaurants:    tools.emitRestaurantsTool,
      emit_events:         tools.emitEventsTool,
      emit_car:            tools.emitCarTool,
      emit_budget:         tools.emitBudgetTool,
      emit_suggestions:    tools.emitSuggestionsTool,
    },
    maxSteps: 20,
  })

  for await (const chunk of fullStream) {
    switch (chunk.type) {
      case 'text-delta':
        fullText += chunk.textDelta
        send('text', { delta: chunk.textDelta })
        break

      case 'tool-call': {
        const name = chunk.toolName
        const args = chunk.args as Record<string, unknown>

        if (EMIT_SECTION_MAP[name]) {
          const section = EMIT_SECTION_MAP[name]
          console.log(`[agent] emit_${section}`)

          let data: unknown
          if (section === 'restaurants') {
            const rows = args.restaurants as Record<string, unknown>[] | undefined ?? []
            data = injectLinks(rows as { name?: string; link?: string }[], linkCache)
          } else if (section === 'events') {
            const rows = args.events as Record<string, unknown>[] | undefined ?? []
            data = injectLinks(rows as { name?: string; link?: string }[], linkCache)
          } else if (section === 'hotel') {
            const opts = (args.options as { name?: string; link?: string; thumbnail?: string }[] | undefined) ?? []
            data = { options: injectLinks(opts, linkCache, thumbCache) }
          } else if (section === 'flights') {
            data = args  // { options: [...] } already
          } else if (section === 'days') {
            data = args.days
          } else {
            data = args
          }

          send('itinerary_update', { section, data })
          itineraryUpdates[section === 'car' ? 'carRental' : section] = data
        } else if (name === 'emit_suggestions') {
          console.log(`[agent] emit_suggestions: ${JSON.stringify(args.items)}`)
          send('suggestions', { items: args.items })
        } else {
          const keyArgs = summariseArgs(name, args)
          console.log(`[agent] tool call: ${name} — ${keyArgs}`)
          send('tool_start', { toolName: name, label: keyArgs })
        }
        break
      }

      case 'tool-result': {
        const toolName = chunk.toolName
        const result = chunk.result as unknown

        // Cache links and thumbnails from real SerpAPI results
        if (toolName === 'yelp_search' || toolName === 'tripadvisor_search') {
          const rows = Array.isArray(result) ? result : []
          for (const r of rows as Record<string, unknown>[]) {
            const n = normalize(String(r.name ?? ''))
            if (n && r.link) linkCache.set(n, String(r.link))
          }
        }
        if (toolName === 'google_events') {
          const rows = Array.isArray(result) ? result : []
          for (const r of rows as Record<string, unknown>[]) {
            const n = normalize(String(r.title ?? r.name ?? ''))
            if (n && r.link) linkCache.set(n, String(r.link))
          }
        }
        if (toolName === 'google_hotels') {
          const rows = Array.isArray(result) ? result : []
          for (const r of rows as Record<string, unknown>[]) {
            const n = normalize(String(r.name ?? ''))
            if (n && r.link) linkCache.set(n, String(r.link))
            if (n && r.thumbnail) thumbCache.set(n, String(r.thumbnail))
          }
        }

        if (!SILENT_TOOLS.has(toolName)) {
          console.log(`[agent] tool done: ${toolName}`)
          send('tool_done', { toolName })
        }
        break
      }

      case 'error':
        console.error('[agent] stream error:', chunk.error)
        break

      case 'finish':
        console.log(`[agent] finished. text length: ${fullText.length}, itinerary sections: ${Object.keys(itineraryUpdates).join(', ') || 'none'}`)
        await db.insert(messages).values({ tripId, role: 'assistant', content: fullText })

        if (Object.keys(itineraryUpdates).length > 0) {
          await db.update(itinerary)
            .set({ ...itineraryUpdates, updatedAt: new Date() })
            .where(eq(itinerary.tripId, tripId))
        }
        break
    }
  }
}
