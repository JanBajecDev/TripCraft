import type { TripIntake } from '../types'

const BASE = '/api'

export async function createTrip(intake: TripIntake): Promise<{ tripId: string }> {
  const res = await fetch(`${BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin:      intake.origin,
      destination: intake.destination,
      destCode:    intake.destCode,
      dateMode:    intake.dateMode,
      dateLabel:   intake.dateMode === 'exact' ? intake.dateExact : `Flexible · ${intake.dateMonth}`,
      tripDays:    intake.tripDays,
      travellers:  intake.travellers,
      budgetGbp:   intake.budgetGbp,
      interests:   intake.interests,
    }),
  })
  if (!res.ok) throw new Error(`Failed to create trip: ${res.status}`)
  return res.json()
}

export async function getTrip(tripId: string) {
  const res = await fetch(`${BASE}/trips/${tripId}`)
  if (!res.ok) throw new Error(`Trip not found: ${res.status}`)
  return res.json()
}

export interface DestinationOption {
  id: string
  city: string
  country: string | null
  code: string
  note: string | null
  type: 'origin' | 'destination'
  sortOrder: number
}

export async function fetchDestinations(type?: 'origin' | 'destination'): Promise<DestinationOption[]> {
  const params = type ? `?type=${type}` : ''
  const res = await fetch(`${BASE}/destinations${params}`)
  if (!res.ok) throw new Error(`Failed to fetch destinations: ${res.status}`)
  return res.json()
}
