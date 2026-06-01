import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const googleEventsTool = tool({
  description: 'Search Google Events for local events during the trip dates. Returns concerts, festivals, exhibitions, etc.',
  parameters: z.object({
    q: z.string().describe('Event search query, e.g. "events in Lisbon June 2026"'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine: 'google_events',
      q:      params.q,
    }) as Record<string, unknown>

    const events = data.events_results as Record<string, unknown>[] | undefined
    if (!events?.length) return { error: 'No events found', raw: data }

    return events.slice(0, 5).map(e => ({
      title:    e.title,
      date:     e.date,
      address:  e.address,
      link:     e.link,
      ticket_info: e.ticket_info,
      description: e.description,
    }))
  },
})
