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
