# TripCraft — Full-Stack Monorepo Implementation Plan

## Context

The user has a React prototype in `/ClaudeDesign/` (CDN React, no build tooling) that represents the complete design spec for a trip-planning AI agent app called "Wayfare" / TripCraft. The goal is to scaffold a production monorepo on top of this, with a Vite+React frontend and a Hono/Bun backend, wired to OpenRouter's Agent SDK and SerpAPI for real travel data. The existing `.env` already has `OPENROUTER_API_KEY`, `SERP_API_KEY`, and `AI_MODEL`.

---

## Monorepo Structure

```
/TripCraft/
├── package.json              # bun workspaces root
├── docker-compose.yml        # postgres:16-alpine on port 5432
├── .env                      # existing — add DATABASE_URL, PORT, FRONTEND_URL
├── frontend/
│   ├── package.json          # React 19 + Vite, no Tailwind
│   ├── vite.config.ts        # proxy /api → localhost:3001
│   ├── index.html
│   └── src/
└── backend/
    ├── package.json          # hono + drizzle-orm + postgres + ai + zod
    ├── drizzle.config.ts
    └── src/
```

Root `package.json` uses `"workspaces": ["frontend", "backend"]` with bun.

**Dev scripts:**
- `bun run dev:frontend` → `vite`
- `bun run dev:backend` → `bun --watch src/index.ts`
- `bun run db:migrate` → `bun run src/db/migrate.ts`

---

## CSS / Design System

**Do not use Tailwind.** The ClaudeDesign prototype has a complete, mature CSS variable + utility system.

1. Copy `ClaudeDesign/colors_and_type.css` → `frontend/src/styles/tokens.css`
2. Copy `ClaudeDesign/app.css` → `frontend/src/styles/app.css`
3. Copy `ClaudeDesign/fonts/` → `frontend/public/fonts/`
4. Add Google Fonts `<link>` for Plus Jakarta Sans in `index.html`
5. Import both CSS files in `main.tsx`

---

## Database Schema (Drizzle)

File: `backend/src/db/schema.ts`

```
trips        — id, origin, destination, destCode, dateMode, dateLabel, tripDays,
               travellers, budgetGbp, interests[], createdAt, updatedAt
messages     — id, tripId→trips, role ('user'|'assistant'), content, createdAt
itinerary    — id, tripId→trips (unique), flights jsonb, hotel jsonb, days jsonb,
               restaurants jsonb, events jsonb, carRental jsonb, budget jsonb, updatedAt
```

JSON shape types defined in `backend/src/db/types.ts` — FlightData, HotelData, DayData[], RestaurantData[], EventData[], CarData, BudgetData. Mirror these in `frontend/src/types/index.ts`.

---

## Backend API Routes

File: `backend/src/routes/trips.ts` mounted at `/api/trips`

| Method | Path | Action |
|---|---|---|
| POST | `/` | Validate with Zod, insert trip + empty itinerary row, return `{ tripId }` |
| GET | `/:id` | Return trip + current itinerary snapshot |
| POST | `/:id/messages` | Save user message, stream SSE agent response |

Entry point `backend/src/index.ts`:
- Hono app with `cors()` and `logger()` middleware at the top level
- Bun native HTTP: `export default { port: 3001, fetch: app.fetch }`
- Do NOT use `@hono/node-server`

---

## SerpAPI Tools (OpenRouter Agent SDK)

Low-level helper: `backend/src/lib/serp.ts` — single `serpFetch(params)` function that appends `api_key` and hits `https://serpapi.com/search.json`.

Six tool files in `backend/src/agent/tools/`, each using `tool()` from `ai` (Vercel AI SDK, compatible with OpenRouter provider):

| File | `engine` param | SerpAPI Docs |
|---|---|---|
| `googleFlights.ts` | `google_flights` | departure_id, arrival_id, outbound_date, return_date, adults, currency |
| `googleHotels.ts` | `google_hotels` | q, check_in_date, check_out_date, adults, currency |
| `yelpSearch.ts` | `yelp` | find_desc, find_loc | 
| `googleEvents.ts` | `google_events` | q (city + dates) |
| `tripadvisorSearch.ts` | `tripadvisor` | q (city), searchType |
| `tripadvisorReviews.ts` | `tripadvisor` | location_id, content: reviews |

All exported from `tools/index.ts`.

---

## Agent Runner & SSE Streaming

File: `backend/src/agent/runner.ts`

Uses `streamText` from `ai` with `createOpenRouter` provider. `process.env.AI_MODEL` as model ID. `maxSteps: 10`.

**SSE event types emitted to client:**

| Event | Payload |
|---|---|
| `text` | `{ delta: string }` |
| `tool_start` | `{ toolName, args }` |
| `tool_done` | `{ toolName, result }` |
| `itinerary_update` | `{ section: 'flights'\|'hotel'\|'days'\|'restaurants'\|'events'\|'car'\|'budget', data: {} }` |
| `done` | `{}` |

**System prompt** (`backend/src/agent/systemPrompt.ts`): instructs the agent to call tools before answering, emit `{"type":"itinerary_update","section":"...","data":{}}` JSON blobs inline as it fills each section, and end each response with `{"type":"suggestions","items":["..."]}`.

The runner parses completed JSON blobs from accumulated text and emits `itinerary_update` SSE events in real-time so the itinerary panel updates section-by-section. After streaming completes, the full assistant text and any itinerary section updates are persisted to the DB.

---

## Frontend Architecture

```
frontend/src/
├── main.tsx                  # imports tokens.css + app.css
├── App.tsx                   # theme, tripId, page state
├── pages/
│   ├── IntakePage.tsx        # full-screen intake form
│   └── PlanningPage.tsx      # summary bar + chat + itinerary layout
├── components/
│   ├── intake/               # DestinationField, OriginField, DateField, etc.
│   ├── summary/SummaryBar.tsx
│   ├── chat/                 # Chat, Message, ToolRow, Composer
│   └── itinerary/            # ItineraryPanel, FlightCard, HotelCard, DayList, etc.
├── hooks/
│   ├── useAgentStream.ts     # fetch-based SSE consumer (NOT EventSource — needs POST)
│   └── useTrip.ts
├── lib/
│   ├── api.ts                # typed fetch wrappers
│   └── constants.ts          # DESTINATIONS, ORIGINS, INTERESTS (from app-data.jsx)
└── types/index.ts
```

**State management:** React state only, no external library. `App.tsx` holds theme + tripId + page. `PlanningPage.tsx` holds messages[], itinerary state, busy flag.

**SSE consumer** (`useAgentStream.ts`): Uses `fetch` + `ReadableStream` reader to parse `event:/data:` pairs. `EventSource` cannot be used because the endpoint requires POST.

**Itinerary panel**: Each section conditionally renders when its data is non-null. Sections animate in with the `.rise` CSS animation from `app.css`.

---

## Environment Variables

`.env` (add to existing):
```
DATABASE_URL=postgres://tripcraft:tripcraft_dev@localhost:5432/tripcraft
PORT=3001
FRONTEND_URL=http://localhost:5173
```

`frontend/.env.local`:
```
VITE_API_URL=http://localhost:5173  # Vite proxy handles /api → 3001
```

---

## Key Gotchas

- **SSE via fetch not EventSource** — POST body requirement rules out native EventSource
- **Bun native HTTP** — `export default { port, fetch: app.fetch }`, no `@hono/node-server`
- **CORS middleware before streaming route** — must apply `cors()` at app level, not route level
- **SerpAPI rate limits** — free plan is ~100 searches/month; add 500ms delay between tool calls in runner or use paid plan
- **Drizzle JSONB** — columns return as `unknown`; cast with Zod at route layer
- **Tool call loops** — `maxSteps: 10` in `streamText` prevents runaway agentic loops

---

## Implementation Sequence

1. **Monorepo scaffold** — root `package.json`, `docker-compose.yml`, bun install
2. **Frontend shell** — `bun create vite`, port CSS files, verify fonts + design tokens render
3. **DB setup** — schema, drizzle-kit generate, migrate, verify connection
4. **Backend routes** — POST/GET trips, stub message route
5. **SerpAPI tools** — implement all 6, test each with a standalone script
6. **Agent runner** — wire `streamText` with tools, verify tool calls work end-to-end
7. **SSE streaming** — add `hono/streaming`, verify `text` and `tool_start/done` events reach browser
8. **IntakePage** — all field components, submit flow, navigate to PlanningPage
9. **PlanningPage** — SummaryBar + Chat + ItineraryPanel wired to live SSE
10. **Itinerary section updates** — parse `itinerary_update` events, animate sections in
11. **Polish** — dark mode toggle (localStorage), mobile (<1080px hide itinerary panel), error handling

---

## Verification

- `docker compose up -d && bun run db:migrate` — migrations apply cleanly
- POST `/api/trips` returns `{ tripId }` with a valid UUID
- POST `/api/trips/:id/messages` with message "Plan my trip" — SSE events stream in browser DevTools Network tab, all 6 tools appear as `tool_start/done` events
- Frontend: intake form submits, planning screen renders, chat streams text, itinerary panel sections appear one-by-one as agent fills them
- Dark mode toggle persists across refresh