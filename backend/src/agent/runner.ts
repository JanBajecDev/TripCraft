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

function parseStructuredBlocks(text: string, send: SendFn, emitted: Set<string>): void {
  const jsonPattern = /\{"type":"(itinerary_update|suggestions)"[^}]*(?:\{[^}]*\}[^}]*)*\}/g
  let match: RegExpExecArray | null
  while ((match = jsonPattern.exec(text)) !== null) {
    const raw = match[0]
    if (emitted.has(raw)) continue
    try {
      const parsed = JSON.parse(raw) as { type: string; section?: string; data?: unknown; items?: string[] }
      if (parsed.type === 'itinerary_update' && parsed.section) {
        send('itinerary_update', { section: parsed.section, data: parsed.data })
        emitted.add(raw)
      } else if (parsed.type === 'suggestions' && parsed.items) {
        send('suggestions', { items: parsed.items })
        emitted.add(raw)
      }
    } catch {
      // incomplete JSON yet — will retry on next chunk
    }
  }
}

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

  let fullText = ''
  const emittedBlocks = new Set<string>()
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
    },
    maxSteps: 12,
  })

  for await (const chunk of fullStream) {
    switch (chunk.type) {
      case 'text-delta':
        fullText += chunk.textDelta
        send('text', { delta: chunk.textDelta })
        parseStructuredBlocks(fullText, send, emittedBlocks)
        break

      case 'tool-call':
        send('tool_start', { toolName: chunk.toolName, args: chunk.args })
        break

      case 'tool-result':
        send('tool_done', { toolName: chunk.toolName })
        break

      case 'finish':
        // persist assistant message
        await db.insert(messages).values({ tripId, role: 'assistant', content: fullText })

        // extract itinerary sections from emitted blocks
        for (const raw of emittedBlocks) {
          try {
            const parsed = JSON.parse(raw) as { type: string; section?: string; data?: unknown }
            if (parsed.type === 'itinerary_update' && parsed.section) {
              const col = parsed.section === 'car' ? 'carRental' : parsed.section
              itineraryUpdates[col] = parsed.data
            }
          } catch { /* ignore */ }
        }

        if (Object.keys(itineraryUpdates).length > 0) {
          await db.update(itinerary)
            .set({ ...itineraryUpdates, updatedAt: new Date() })
            .where(eq(itinerary.tripId, tripId))
        }
        break
    }
  }
}
