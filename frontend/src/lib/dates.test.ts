import { describe, expect, it } from 'vitest'
import { formatTripDateLabel } from './dates'

describe('formatTripDateLabel', () => {
  it('returns the exact date label in exact mode', () => {
    expect(formatTripDateLabel('exact', '12–16 June 2026', 'June 2026')).toBe('12–16 June 2026')
  })

  it('returns the flexible label in flexible mode', () => {
    expect(formatTripDateLabel('flexible', '12–16 June 2026', 'June 2026')).toBe('Flexible · June 2026')
  })
})
