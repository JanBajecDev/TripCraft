import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const yelpSearchTool = tool({
  description: 'Search Yelp for restaurants and local businesses. Returns top results with ratings, price, and reviews.',
  parameters: z.object({
    find_desc: z.string().describe('What to search for, e.g. "seafood restaurants"'),
    find_loc:  z.string().describe('Where to search, e.g. "Lisbon, Portugal"'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine:    'yelp',
      find_desc: params.find_desc,
      find_loc:  params.find_loc,
    }) as Record<string, unknown>

    const results = data.organic_results as Record<string, unknown>[] | undefined
    if (!results?.length) return { error: 'No results found', raw: data }

    return results.slice(0, 5).map(r => ({
      name:       r.name,
      rating:     r.rating,
      reviews:    r.reviews,
      price:      r.price,
      categories: r.categories,
      address:    r.address,
      snippet:    r.snippet,
      link:       r.link,
    }))
  },
})
