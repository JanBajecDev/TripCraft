# Reactive Itinerary Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user changes SummaryBar inputs (destination, budget, dates, travellers), auto-send a chat message describing the change so the agent re-runs and ItineraryPanel updates reactively.

**Architecture:** Track intake changes via a `useRef` + debounced `useEffect` in `PlanningPage`. Diff the old vs new intake, build a natural-language change description, clear itinerary, and call `streamSend()` with the description. The existing SSE pipeline handles the rest. The agent's text response becomes the change summary in chat.

**Tech Stack:** React 19, TypeScript, existing `useAgentStream` hook

---

### Task 1: Add vitest test runner

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`

No tests exist yet. We need a test runner before writing any tests.

- [ ] **Step 1: Install vitest**

Run: `cd frontend && pnpm add -D vitest`

- [ ] **Step 2: Create vitest config**

Create `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
  },
})
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"` in `frontend/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify test runner works**

Run: `cd frontend && pnpm test`
Expected: "no test files found" or similar — runner installed successfully

- [ ] **Step 5: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml frontend/vitest.config.ts
git commit -m "chore: add vitest test runner"
```

---

### Task 2: Create `diffIntake` utility

**Files:**
- Create: `frontend/src/lib/diffIntake.ts`
- Create: `frontend/src/lib/diffIntake.test.ts`

This utility compares two `TripIntake` objects and returns a human-readable change description string.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/lib/diffIntake.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { diffIntake } from './diffIntake'
import type { TripIntake } from '../types'

const base: TripIntake = {
  origin: 'London',
  destination: 'rome',
  destCode: 'FCO',
  dateMode: 'exact',
  dateLabel: 'June 15-22',
  dateExact: 'June 15-22',
  dateMonth: 'June',
  tripDays: 7,
  travellers: 2,
  budgetGbp: 2000,
  interests: ['food', 'history'],
}

describe('diffIntake', () => {
  it('returns empty string when nothing changed', () => {
    expect(diffIntake(base, base)).toBe('')
  })

  it('describes a destination change', () => {
    const next = { ...base, destination: 'lisbon', destCode: 'LIS' }
    const result = diffIntake(base, next)
    expect(result).toContain('Rome')
    expect(result).toContain('Lisbon')
    expect(result).toContain('destination')
  })

  it('describes a budget increase', () => {
    const next = { ...base, budgetGbp: 3000 }
    const result = diffIntake(base, next)
    expect(result).toContain('budget')
    expect(result).toContain('£2,000')
    expect(result).toContain('£3,000')
    expect(result).toContain('increased')
  })

  it('describes a budget decrease', () => {
    const next = { ...base, budgetGbp: 1500 }
    const result = diffIntake(base, next)
    expect(result).toContain('decreased')
    expect(result).toContain('£1,500')
  })

  it('describes a travellers change', () => {
    const next = { ...base, travellers: 4 }
    const result = diffIntake(base, next)
    expect(result).toContain('travellers')
    expect(result).toContain('2')
    expect(result).toContain('4')
  })

  it('describes an origin change', () => {
    const next = { ...base, origin: 'Paris' }
    const result = diffIntake(base, next)
    expect(result).toContain('origin')
    expect(result).toContain('London')
    expect(result).toContain('Paris')
  })

  it('describes a date change', () => {
    const next = { ...base, dateExact: 'July 1-8' }
    const result = diffIntake(base, next)
    expect(result).toContain('date')
    expect(result).toContain('June 15-22')
    expect(result).toContain('July 1-8')
  })

  it('describes multiple changes', () => {
    const next = { ...base, destination: 'lisbon', destCode: 'LIS', budgetGbp: 1500 }
    const result = diffIntake(base, next)
    expect(result).toContain('Lisbon')
    expect(result).toContain('budget')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && pnpm test -- src/lib/diffIntake.test.ts`
Expected: FAIL — `diffIntake` module does not exist

- [ ] **Step 3: Write the implementation**

Create `frontend/src/lib/diffIntake.ts`:

```typescript
import { DESTINATIONS } from './constants'
import type { TripIntake } from '../types'

interface Change {
  label: string
  oldVal: string
  newVal: string
}

function destCity(id: string): string {
  return DESTINATIONS.find(d => d.id === id)?.city ?? id
}

export function diffIntake(prev: TripIntake, next: TripIntake): string {
  const changes: Change[] = []

  if (prev.origin !== next.origin) {
    changes.push({ label: 'origin', oldVal: prev.origin, newVal: next.origin })
  }

  if (prev.destination !== next.destination) {
    changes.push({ label: 'destination', oldVal: destCity(prev.destination), newVal: destCity(next.destination) })
  }

  if (prev.dateExact !== next.dateExact || prev.dateMonth !== next.dateMonth) {
    const oldDate = prev.dateMode === 'exact' ? prev.dateExact : `Flexible · ${prev.dateMonth}`
    const newDate = next.dateMode === 'exact' ? next.dateExact : `Flexible · ${next.dateMonth}`
    changes.push({ label: 'date', oldVal: oldDate, newVal: newDate })
  }

  if (prev.travellers !== next.travellers) {
    changes.push({ label: 'travellers', oldVal: String(prev.travellers), newVal: String(next.travellers) })
  }

  if (prev.budgetGbp !== next.budgetGbp) {
    const dir = next.budgetGbp > prev.budgetGbp ? 'increased' : 'decreased'
    changes.push({ label: `budget ${dir}`, oldVal: `£${prev.budgetGbp.toLocaleString()}`, newVal: `£${next.budgetGbp.toLocaleString()}` })
  }

  if (changes.length === 0) return ''

  return changes.map(c => `${c.label} changed from ${c.oldVal} to ${c.newVal}`).join('. ') + '.'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && pnpm test -- src/lib/diffIntake.test.ts`
Expected: PASS — all 8 tests pass

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/diffIntake.ts frontend/src/lib/diffIntake.test.ts
git commit -m "feat: add diffIntake utility for detecting intake changes"
```

---

### Task 3: Add reactive intake-change effect in PlanningPage

**Files:**
- Modify: `frontend/src/pages/PlanningPage.tsx`

This is the core change. Add refs to track previous intake, detect user-initiated changes, debounce, and auto-send a change message through `streamSend`.

- [ ] **Step 1: Add imports and ref declarations**

At the top of `PlanningPage.tsx`, add `diffIntake` to imports:

```typescript
import { diffIntake } from '../lib/diffIntake'
```

Add these refs inside the component, after `const sentInitial = useRef(false)` (line 23):

```typescript
const prevIntakeRef = useRef<TripIntake>(intake)
const userChangedRef = useRef(false)
const pendingChangeRef = useRef<string | null>(null)
const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

- [ ] **Step 2: Create a wrapped setIntake that flags user changes**

Add this after the refs (after line 23 area). This wraps the `setIntake` prop to mark changes as user-initiated:

```typescript
const userSetIntake = useCallback((partial: Partial<TripIntake>) => {
  userChangedRef.current = true
  setIntake(partial)
}, [setIntake])
```

- [ ] **Step 3: Add the debounced change-detection effect**

Add this `useEffect` after the existing `handleSend` function (after line 80):

```typescript
// Reactive itinerary update: when user changes intake, auto-send change message
useEffect(() => {
  // Skip initial mount and non-user changes
  if (!userChangedRef.current) {
    prevIntakeRef.current = intake
    return
  }

  // Skip if no itinerary yet (still on initial generation)
  if (Object.keys(itinerary).length === 0) {
    prevIntakeRef.current = intake
    return
  }

  // If streaming, queue for later
  if (busy) {
    const diff = diffIntake(prevIntakeRef.current, intake)
    if (diff) pendingChangeRef.current = diff
    prevIntakeRef.current = intake
    userChangedRef.current = false
    return
  }

  // Debounce rapid changes
  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

  debounceTimerRef.current = setTimeout(() => {
    const diff = diffIntake(prevIntakeRef.current, intake)
    prevIntakeRef.current = intake
    userChangedRef.current = false

    if (diff) {
      setItinerary({})
      handleSend(diff)
    }
  }, 500)

  return () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
  }
}, [intake]) // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Add pending-change flush on stream completion**

Modify the `onDone` callback inside `callbacks` (around line 43-51). After `setBusy(false)`, add:

```typescript
onDone: () => {
  setActiveBlocks(prev => {
    const committed = markStreamingDone(prev)
    const id = crypto.randomUUID()
    setMessages(msgs => [...msgs, { id, role: 'assistant', blocks: committed }])
    return []
  })
  setBusy(false)

  // Flush pending intake change if one was queued during streaming
  if (pendingChangeRef.current) {
    const msg = pendingChangeRef.current
    pendingChangeRef.current = null
    setTimeout(() => {
      setItinerary({})
      handleSend(msg)
    }, 100)
  }
},
```

- [ ] **Step 5: Pass `userSetIntake` to SummaryBar instead of `setIntake`**

Change line 93 from `set={setIntake}` to `set={userSetIntake}`:

```typescript
<SummaryBar
  state={intake}
  set={userSetIntake}
  theme={theme}
  onToggleTheme={onToggleTheme}
  tripReady={Object.keys(itinerary).length > 0}
  total={total}
  onBook={() => setBooked(true)}
  booked={booked}
/>
```

- [ ] **Step 6: Verify the app builds**

Run: `cd frontend && pnpm build`
Expected: Build succeeds with no TypeScript errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/PlanningPage.tsx
git commit -m "feat: add reactive itinerary updates when SummaryBar inputs change"
```

---

### Task 4: Verify the feature works end-to-end

**Files:** None (manual verification)

- [ ] **Step 1: Start the dev server**

Run: `cd frontend && pnpm dev`

- [ ] **Step 2: Test the full flow**

1. Open the app in a browser
2. Fill the intake form and click "Plan my trip"
3. Wait for the itinerary to fully stream in
4. Change the destination in the SummaryBar header
5. Verify: itinerary clears, a new agent run starts, chat shows a user message like "destination changed from Rome to Lisbon"
6. Wait for streaming to complete
7. Verify: the new itinerary appears with the new destination, and an assistant message summarizes the changes
8. Test changing budget — verify same reactive behavior
9. Test changing travellers — verify same reactive behavior
10. Test rapid changes (change destination then budget quickly) — verify only one agent run fires after debounce

- [ ] **Step 3: If all checks pass, no further code changes needed. If issues found, fix and re-test.**

---

### Task 5: Run full test suite and final build check

**Files:** None

- [ ] **Step 1: Run all tests**

Run: `cd frontend && pnpm test`
Expected: All tests pass

- [ ] **Step 2: Run production build**

Run: `cd frontend && pnpm build`
Expected: Build succeeds

- [ ] **Step 3: Final commit if any fixes were needed**
