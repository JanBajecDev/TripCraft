import { tool } from 'ai'
import { z } from 'zod'
import { serpFetch } from '../../lib/serp'

export const googleFlightsTool = tool({
  description: 'Search Google Flights for round-trip flights. Returns best options with price, airline, and times.',
  parameters: z.object({
    departure_id:  z.string().describe('IATA code of departure airport, e.g. LHR'),
    arrival_id:    z.string().describe('IATA code of arrival airport, e.g. LIS'),
    outbound_date: z.string().describe('Departure date YYYY-MM-DD'),
    return_date:   z.string().describe('Return date YYYY-MM-DD'),
    adults:        z.number().int().min(1).max(20).default(2),
    currency:      z.string().default('GBP'),
  }),
  execute: async (params) => {
    const data = await serpFetch({
      engine:        'google_flights',
      departure_id:  params.departure_id,
      arrival_id:    params.arrival_id,
      outbound_date: params.outbound_date,
      return_date:   params.return_date,
      adults:        String(params.adults),
      currency:      params.currency,
      type:          '1',
    }) as Record<string, unknown>

    const best = (data.best_flights as unknown[])?.[0] as Record<string, unknown> | undefined
    if (!best) return { error: 'No flights found', raw: data }

    const flights = best.flights as Record<string, unknown>[]
    const out = flights?.[0] as Record<string, unknown>
    const ret = flights?.[flights.length - 1] as Record<string, unknown>
    const depAirport = out?.departure_airport as Record<string, unknown>
    const arrAirport = (ret ?? out)?.arrival_airport as Record<string, unknown>

    return {
      price:    best.price,
      airline:  out?.airline,
      outbound: { dep: depAirport?.time, arr: (out?.arrival_airport as Record<string, unknown>)?.time, from: depAirport?.id, to: (out?.arrival_airport as Record<string, unknown>)?.id },
      inbound:  ret ? { dep: (ret.departure_airport as Record<string, unknown>)?.time, arr: (ret.arrival_airport as Record<string, unknown>)?.time } : null,
      duration: best.total_duration,
      stops:    flights?.length > 1 ? `${flights.length - 1} stop` : 'Direct',
    }
  },
})
