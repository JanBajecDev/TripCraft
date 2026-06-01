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

  it('describes a dateMode change from exact to flexible', () => {
    const next = { ...base, dateMode: 'flexible' as const, dateMonth: 'July' }
    const result = diffIntake(base, next)
    expect(result).toContain('date')
    expect(result).toContain('June 15-22')
    expect(result).toContain('Flexible')
  })

  it('describes multiple changes', () => {
    const next = { ...base, destination: 'lisbon', destCode: 'LIS', budgetGbp: 1500 }
    const result = diffIntake(base, next)
    expect(result).toContain('Lisbon')
    expect(result).toContain('budget')
  })
})
