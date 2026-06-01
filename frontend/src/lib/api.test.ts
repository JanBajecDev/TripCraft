import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTrip } from './api'
import type { TripIntake } from '../types'

const intake: TripIntake = {
  origin: 'London',
  destination: 'lisbon',
  destCode: 'LIS',
  dateMode: 'flexible',
  dateLabel: '12–16 June 2026',
  dateExact: '12–16 June 2026',
  dateMonth: 'June 2026',
  tripDays: 5,
  travellers: 2,
  budgetGbp: 2500,
  interests: ['food', 'history', 'architecture'],
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('createTrip', () => {
  it('serializes the flexible date label from the selected mode', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ tripId: 'trip-123' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await createTrip(intake)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/trips')
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const body = JSON.parse((options as RequestInit).body as string)
    expect(body).toMatchObject({
      dateMode: 'flexible',
      dateLabel: 'Flexible · June 2026',
    })
  })
})
