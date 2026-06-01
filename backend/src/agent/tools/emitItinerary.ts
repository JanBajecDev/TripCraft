import { tool } from 'ai'
import { z } from 'zod'

const FlightLegSchema = z.object({
  airline: z.string(), flightNo: z.string(),
  from: z.string(), to: z.string(), date: z.string(),
  dep: z.string(), arr: z.string(), dur: z.string(), stops: z.string(),
})

const FlightOptionSchema = z.object({
  out: FlightLegSchema, ret: FlightLegSchema,
  perPerson: z.number(), cabin: z.string(),
})
const FlightsSchema = z.object({
  options: z.array(FlightOptionSchema).min(1).max(3),
})

const HotelOptionSchema = z.object({
  name: z.string(), area: z.string(), rating: z.number(), reviews: z.number(),
  nights: z.number(), perNight: z.number(), blurb: z.string(), tags: z.array(z.string()),
  thumbnail: z.string().optional(), link: z.string().optional(),
})
const HotelSchema = z.object({
  options: z.array(HotelOptionSchema).min(1).max(3),
})

const DayItemSchema = z.object({ time: z.string(), icon: z.string(), text: z.string() })
const DaySchema = z.object({ n: z.number(), date: z.string(), title: z.string(), items: z.array(DayItemSchema) })

const RestaurantSchema = z.object({
  name: z.string(), cuisine: z.string(), price: z.string(),
  rating: z.number(), source: z.string(), note: z.string(),
  link: z.string().optional(),
})

const EventSchema = z.object({
  name: z.string(), date: z.string(), where: z.string(),
  price: z.string(), icon: z.string(), note: z.string(),
  link: z.string().optional(),
})

const CarSchema = z.object({
  name: z.string(), cat: z.string(), days: z.number(), perDay: z.number(), note: z.string(),
})

const BudgetLineSchema = z.object({ label: z.string(), detail: z.string(), amount: z.number() })
const BudgetSchema = z.object({ lines: z.array(BudgetLineSchema), total: z.number() })

export const emitFlightsTool = tool({
  description: 'Emit the flights section to display in the itinerary panel. Call this after searching Google Flights.',
  parameters: FlightsSchema,
  execute: async () => ({ ok: true }),
})

export const emitHotelTool = tool({
  description: 'Emit the hotel section to display in the itinerary panel. Call this after searching Google Hotels.',
  parameters: HotelSchema,
  execute: async () => ({ ok: true }),
})

export const emitDaysTool = tool({
  description: 'Emit the day-by-day itinerary to display in the panel. Call this after planning activities.',
  parameters: z.object({ days: z.array(DaySchema) }),
  execute: async () => ({ ok: true }),
})

export const emitRestaurantsTool = tool({
  description: 'Emit restaurant recommendations to display in the panel. Call this after searching Yelp/TripAdvisor.',
  parameters: z.object({ restaurants: z.array(RestaurantSchema) }),
  execute: async () => ({ ok: true }),
})

export const emitEventsTool = tool({
  description: 'Emit local events to display in the panel. Call this after searching Google Events.',
  parameters: z.object({ events: z.array(EventSchema) }),
  execute: async () => ({ ok: true }),
})

export const emitCarTool = tool({
  description: 'Emit rental car option to display in the panel. Only call if the user requested a car.',
  parameters: CarSchema,
  execute: async () => ({ ok: true }),
})

export const emitBudgetTool = tool({
  description: 'Emit the budget breakdown to display in the panel. Call this at the end of planning.',
  parameters: BudgetSchema,
  execute: async () => ({ ok: true }),
})

export const emitSuggestionsTool = tool({
  description: 'Emit suggestion chips for the user to click to refine the trip. Always call this at the end of your response.',
  parameters: z.object({ items: z.array(z.string()).min(2).max(6) }),
  execute: async () => ({ ok: true }),
})
