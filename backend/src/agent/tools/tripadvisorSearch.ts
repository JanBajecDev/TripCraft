import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const tripadvisorSearchTool = tool({
  description: 'Search TripAdvisor for attractions, activities, and things to do. Returns top-rated options with reviews.',
  parameters: z.object({
    q:          z.string().describe('Search query, e.g. "things to do in Lisbon history architecture"'),
    searchType: z.enum(['attractions', 'restaurants', 'hotels', 'vacation_rentals']).default('attractions'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine: 'tripadvisor',
      q:      params.q,
      searchType: params.searchType,
    }) as Record<string, unknown>

    const results = (data.results as Record<string, unknown>[] | undefined)
      ?? (data.organic_results as Record<string, unknown>[] | undefined)
    if (!results?.length) return { error: 'No results found', raw: data }

    return results.slice(0, 5).map(r => ({
      name:        r.name,
      rating:      r.rating,
      numReviews:  r.num_reviews,
      category:    r.category,
      description: r.description,
      location_id: r.location_id,
    }))
  },
})
