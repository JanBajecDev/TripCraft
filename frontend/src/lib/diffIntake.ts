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
