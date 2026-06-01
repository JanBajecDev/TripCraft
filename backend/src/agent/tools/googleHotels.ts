import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const googleHotelsTool = tool({
  description: 'Search Google Hotels for accommodations. Returns top options with name, rating, price per night, and amenities.',
  parameters: z.object({
    q:              z.string().describe('Hotel search query, e.g. "boutique hotels in Lisbon Alfama"'),
    check_in_date:  z.string().describe('Check-in date YYYY-MM-DD'),
    check_out_date: z.string().describe('Check-out date YYYY-MM-DD'),
    adults:         z.number().int().min(1).max(20).default(2),
    currency:       z.string().default('GBP'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine:         'google_hotels',
      q:              params.q,
      check_in_date:  params.check_in_date,
      check_out_date: params.check_out_date,
      adults:         String(params.adults),
      currency:       params.currency,
    }) as Record<string, unknown>

    const hotels = data.properties as Record<string, unknown>[] | undefined
    if (!hotels?.length) return { error: 'No hotels found', raw: data }

    return hotels.slice(0, 3).map(h => ({
      name:        h.name,
      rating:      h.overall_rating,
      reviews:     h.reviews,
      pricePerNight: h.rate_per_night,
      description: h.description,
      amenities:   (h.amenities as string[] | undefined)?.slice(0, 5),
      thumbnail:   (h.images as Record<string, unknown>[] | undefined)?.[0]?.thumbnail,
      link:        h.link ? `https://www.google.com${h.link}` : `https://www.google.com/search?q=${encodeURIComponent(String(h.name) + ' hotel')}`,
    }))
  },
})
