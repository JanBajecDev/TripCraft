# Reactive Itinerary Updates

## Problem

Changing SummaryBar inputs (destination, budget, dates, travellers) only updates local `intake` state. The itinerary data comes exclusively from the SSE stream (agent → emit tools → `onItineraryUpdate`), so without a new agent run, ItineraryPanel stays stale.

## Approach

**Chat message trigger.** When `intake` changes, auto-send a chat message describing the change through the existing agent pipeline. The agent re-runs, streams new itinerary sections via SSE, and its text response serves as the change summary message in the chat.

No backend changes required.

## Design

### 1. Change Detection & Diff

A `useRef` holds the last-committed `intake` snapshot. A `useEffect` compares `intake` against the snapshot on every change.

When a diff is found:
1. Build a human-readable change description via `diffIntake(old, new)` utility
2. Update the ref to the new intake
3. Clear `itinerary` state to `{}`
4. Call `streamSend(changeDescription)`

**`diffIntake(old, new)` utility** — returns array of `{ field, label, oldValue, newValue }`. Only fields that changed are included. Lives in `src/lib/diffIntake.ts`.

Example output: `"Destination changed from Rome to Lisbon. Budget decreased from £2,000 to £1,800."`

### 2. Change Summary Message

After the agent finishes streaming (SSE `done` event), the agent's text response appears as an assistant chat message. This IS the change summary — the agent describes what it updated.

No extra UI component needed. The existing `onDone` callback commits the assistant message to `messages[]`, rendering in the `Chat` component.

### 3. Edge Cases

| Case | Handling |
|------|----------|
| Initial mount | Skip effect if `itinerary` is empty (no data to refresh) or if `hasRunRef` is false |
| Rapid changes | 500ms debounce — each change resets timer, only fires after pause |
| Active streaming | Queue the change; send after current stream finishes |
| Agent vs user changes | Only trigger on user-initiated changes. Set `userChangedRef = true` when `set` is called from SummaryBar |

### 4. Data Flow After Change

```
User changes destination in SummaryBar
  → set({ destination: 'lisbon' })
  → intake state updates
  → useEffect fires (debounced 500ms)
  → diffIntake detects destination change
  → itinerary cleared to {}
  → streamSend("Destination changed from Rome to Lisbon.")
  → POST /api/trips/:id/messages
  → SSE stream: agent searches new destination, emits flights/hotel/etc.
  → onItineraryUpdate merges new sections into itinerary state
  → ItineraryPanel renders new content
  → onDone: assistant message committed to chat ("I've updated your trip to Lisbon...")
```

### 5. Files to Modify

| File | Change |
|------|--------|
| `src/lib/diffIntake.ts` | **New** — diffing utility for TripIntake |
| `src/pages/PlanningPage.tsx` | Add `prevIntakeRef`, `userChangedRef`, `hasRunRef`, debounced effect, pending-change queue logic |
| `src/components/summary/SummaryBar.tsx` | Wrap `set` prop to set `userChangedRef` flag |

No backend changes needed.
