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

// Tools that are internal emit helpers — don't show as tool rows in the chat
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
          const data = section === 'days' ? args.days
            : section === 'restaurants' ? args.restaurants
            : section === 'events' ? args.events
            : args
          send('itinerary_update', { section, data })
          itineraryUpdates[section === 'car' ? 'carRental' : section] = data
        } else if (name === 'emit_suggestions') {
          console.log(`[agent] emit_suggestions: ${JSON.stringify(args.items)}`)
          send('suggestions', { items: args.items })
        } else {
          console.log(`[agent] tool call: ${name}`)
          send('tool_start', { toolName: name })
        }
        break
      }

      case 'tool-result': {
        if (!SILENT_TOOLS.has(chunk.toolName)) {
          console.log(`[agent] tool done: ${chunk.toolName}`)
          send('tool_done', { toolName: chunk.toolName })
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
