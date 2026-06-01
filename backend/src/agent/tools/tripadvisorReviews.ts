import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const tripadvisorReviewsTool = tool({
  description: 'Fetch TripAdvisor reviews for a specific location. Use the location_id from tripadvisor_search results.',
  parameters: z.object({
    location_id: z.string().describe('TripAdvisor location ID from a previous tripadvisor_search'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine:      'tripadvisor',
      location_id: params.location_id,
      content:     'reviews',
    }) as Record<string, unknown>

    const reviews = data.reviews as Record<string, unknown>[] | undefined
    if (!reviews?.length) return { error: 'No reviews found', raw: data }

    return reviews.slice(0, 5).map(r => ({
      title:  r.title,
      rating: r.rating,
      text:   r.text,
      date:   r.date,
      user:   (r.user as Record<string, unknown>)?.name,
    }))
  },
})
