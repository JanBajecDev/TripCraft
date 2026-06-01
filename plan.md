# TripCraft — AI Itinerary Builder

**Hackathon plan for 2 developers, ~1 day build time.**

## Stack

- **Backend**: Bun + Fastify, SSE streaming, PostgreSQL (Docker), Drizzle ORM
- **Frontend**: Next.js 15, Tailwind CSS v4, shadcn/ui, Framer Motion
- **AI**: OpenRouter SDK (Claude 3.5 Sonnet) with tool calling
- **DB**: PostgreSQL only — no Firestore (hackathon simplicity)

## Architecture

```
Frontend (Next.js)  POST /api/itineraries/stream  Backend (Bun/Fastify)
                                                    │
Frontend form → streaming cards ← SSE events ← OpenRouter + tools
                                                    │
                                              PostgreSQL (Drizzle)
```

SSE event format (agree on this Hour 1):

```
event: metadata  {"destination":"Paris","totalDays":3}
event: day       {"day":1,"date":"...","slots":[...]}
event: day       {"day":2,"date":"...","slots":[...]}
event: complete  {"shareToken":"abc-123","itineraryId":"uuid"}
event: error     {"message":"..."}
```

## Tools for AI (function calling)

| Tool              | Source                 | Key  |
| ----------------- | ---------------------- | ---- |
| searchFlights     | Amadeus                | One  |
| searchHotels      | Amadeus                | Same |
| searchActivities  | Amadeus Tours          | Same |
| searchRestaurants | Yelp Places            | One  |
| searchEvents      | Ticketmaster Discovery | One  |
| getWeather        | Open-Meteo             | None |

## Shared Types (do this first)

```typescript
interface TripInput {
  destination: string;
  days: number;
  interests: string[];
  budget: string;
  travelers: number;
}
interface TimeSlot {
  time: string;
  title: string;
  place: string;
  description: string;
  rating?: number;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  tip?: string;
}
interface Day {
  day: number;
  date: string;
  slots: TimeSlot[];
}
interface Itinerary {
  days: Day[];
  shareToken: string;
}
```

## DB Schema

```
itineraries: id (PK), share_token (UUID, unique), prompt, status (pending|generating|completed|failed),
             days (jsonb), createdAt, updatedAt
```

## Phase 1 — Foundation (Both, Hour 1-2)

- [ ] Initialize monorepo: `apps/server/`, `apps/web/`, `packages/shared-types/`
- [ ] Person 1: `docker-compose.yml` with PostgreSQL, Bun project init, Drizzle schema + migration
- [ ] Person 2: Next.js 15 scaffold with Tailwind + shadcn/ui, base layout
- [ ] Both: Agree on SSE event format and shared types

## Phase 2 — Backend Core (Person 1, Hours 3-6)

- [ ] OpenRouter service wrapper with tool definitions (stub/mock data first)
- [ ] SSE streaming endpoint: `POST /api/itineraries/stream`
- [ ] Structured JSON enforcement: Zod schema validation on output
- [ ] Fastify routes: `POST /api/itineraries`, `GET /api/itineraries/:id`, `GET /api/itineraries/:id/export`
- [ ] ICS calendar export

## Phase 3 — Frontend Core (Person 2, Hours 3-6)

- [ ] Trip input form (destination, dates, interests, budget, travelers)
- [ ] SSE hook (`useSSE.ts`) — fetch POST + ReadableStream parser
- [ ] Streaming itinerary UI: ChatGPT-like layout, user prompt at top
- [ ] DayCard + TimeSlot components with Framer Motion stagger animations
- [ ] Skeleton loading states with progress text ("Building your route...")

## Phase 4 — Real Data (Person 1, Hours 7-9)

- [ ] Replace tool stubs with real Amadeus, Yelp, Ticketmaster, Open-Meteo calls
- [ ] Add `USE_MOCK_DATA` env flag for API resilience
- [ ] Google Places API: enrich places with photos, ratings, location
- [ ] DB save + share_token generation on stream complete

## Phase 5 — Share, Export, Polish (Both, Hours 9-11)

- [ ] Person 1: Save/share API routes (`POST /api/itineraries`, `GET /api/itineraries/share/:token`)
- [ ] Person 2: Shareable link UI (copy to clipboard), share view page `/i/[id]`
- [ ] Person 2: Export button (.ics download), Google Maps embed per day
- [ ] Both: Error handling, edge cases, demo rehearsal

## Priorities

**MVP (must):** Prompt → streaming itinerary → day cards → save → share link
**Nice if time:** Google Places photos, ICS export, loading animations, share view CTA
**Skip:** Auth, itinerary editing, hotel booking, weather integration, collaborative editing

## Risks

| Risk                            | Level  | Mitigation                                                          |
| ------------------------------- | ------ | ------------------------------------------------------------------- |
| SSE + structured JSON streaming | HIGH   | Stream complete day objects, Zod validate, `event: error` fallback  |
| Free API rate limits            | HIGH   | Mock data first, `USE_MOCK_DATA` flag, only call real APIs for demo |
| Google Places API setup delay   | MEDIUM | AI generates descriptions without photos — still looks great        |
| CORS between frontend/backend   | MEDIUM | Configure early, test with curl                                     |

## Demo Flow (60s)

1. Show landing page
2. Type prompt: "4 days in Barcelona, we love Gaudi, tapas, and hidden beaches"
3. Show streaming animation as itinerary builds
4. Reveal polished day-by-day cards with tips
5. Show shareable link + calendar export
6. Close: "From a single sentence to a complete trip plan"
