# Expand Origin & Destination Options

## Context

TripCraft currently supports 5 European destinations and 6 European origins. The user wants more variety in both lists to make the trip planning experience feel richer. Target: ~10-12 items each, all European cities.

## Design

### Approach: Simple list expansion

Expand the hardcoded arrays in `constants.ts`. No UI changes needed — the existing chip layout (destinations) and native select/popover (origins) already iterate over these arrays dynamically.

### New ORIGINS (12)

```
London, Manchester, Edinburgh, Dublin, Paris, Amsterdam, Berlin, Zurich, Vienna, Madrid, Milan, Prague
```

Current: 6 items. Adding: Berlin, Zurich, Vienna, Madrid, Milan, Prague.

### New DESTINATIONS (12)

```typescript
{ id: 'lisbon',      city: 'Lisbon',      country: 'Portugal',    code: 'LIS', note: 'Festas de Lisboa on now' },
{ id: 'barcelona',   city: 'Barcelona',   country: 'Spain',       code: 'BCN', note: 'Beaches + Gaudí' },
{ id: 'rome',        city: 'Rome',        country: 'Italy',        code: 'FCO', note: 'Ancient history' },
{ id: 'athens',      city: 'Athens',      country: 'Greece',       code: 'ATH', note: 'Islands nearby' },
{ id: 'copenhagen',  city: 'Copenhagen',  country: 'Denmark',     code: 'CPH', note: 'Design + food' },
{ id: 'berlin',      city: 'Berlin',      country: 'Germany',     code: 'BER', note: 'Art + nightlife' },
{ id: 'prague',      city: 'Prague',      country: 'Czechia',     code: 'PRG', note: 'Fairy-tale old town' },
{ id: 'vienna',      city: 'Vienna',      country: 'Austria',     code: 'VIE', note: 'Music + cafés' },
{ id: 'amsterdam',   city: 'Amsterdam',   country: 'Netherlands', code: 'AMS', note: 'Canals + culture' },
{ id: 'dubrovnik',   city: 'Dubrovnik',   country: 'Croatia',     code: 'DBV', note: 'Adriatic gem' },
{ id: 'santorini',  city: 'Santorini',    country: 'Greece',       code: 'JTR', note: 'Sunsets + caldera' },
{ id: 'nice',        city: 'Nice',        country: 'France',      code: 'NCE', note: 'Côte d\'Azur charm' },
```

Current: 5 items. Adding: Berlin, Prague, Vienna, Amsterdam, Dubrovnik, Santorini, Nice.

### Files to modify

- `frontend/src/lib/constants.ts` — update `ORIGINS` and `DESTINATIONS` arrays only

### No other file changes

The following components already iterate over these arrays dynamically and require no modification:
- `IntakePage.tsx` — renders `ORIGINS.slice(0, 3)` quick-select buttons + `<select>` for full list; renders all `DESTINATIONS` as chips
- `SummaryBar.tsx` — renders `Chip` popovers iterating over both arrays

### Verification

1. Run the dev server (`npm run dev` in frontend/)
2. On IntakePage: confirm origin dropdown shows 12 cities, destination chips show 12 cities
3. On PlanningPage/SummaryBar: confirm both "From" and "To" popovers list all new options
4. Select a new origin and destination — confirm the intake state updates correctly
