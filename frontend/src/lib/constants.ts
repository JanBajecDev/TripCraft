export const DESTINATIONS = [
  { id: 'lisbon', city: 'Lisbon', country: 'Portugal', code: 'LIS', note: 'Festas de Lisboa on now' },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', code: 'BCN', note: 'Beaches + Gaudí' },
  { id: 'rome', city: 'Rome', country: 'Italy', code: 'FCO', note: 'Ancient history' },
  { id: 'athens', city: 'Athens', country: 'Greece', code: 'ATH', note: 'Islands nearby' },
  { id: 'copenhagen', city: 'Copenhagen', country: 'Denmark', code: 'CPH', note: 'Design + food' },
] as const

export const ORIGINS = ['London', 'Manchester', 'Edinburgh', 'Dublin', 'Paris', 'Amsterdam'] as const

export const INTERESTS = [
  { id: 'food', label: 'Food & wine', icon: 'restaurant' },
  { id: 'history', label: 'History', icon: 'history_edu' },
  { id: 'architecture', label: 'Architecture', icon: 'apartment' },
  { id: 'nightlife', label: 'Nightlife', icon: 'nightlife' },
  { id: 'beaches', label: 'Beaches', icon: 'beach_access' },
  { id: 'art', label: 'Art & museums', icon: 'palette' },
  { id: 'nature', label: 'Nature & walks', icon: 'forest' },
  { id: 'music', label: 'Live music', icon: 'music_note' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
] as const

export const TOOL_LABELS: Record<string, string> = {
  google_flights:      'Google Flights',
  google_hotels:       'Google Hotels',
  yelp_search:         'Yelp',
  google_events:       'Google Events',
  tripadvisor_search:  'TripAdvisor',
  tripadvisor_reviews: 'TripAdvisor Reviews',
}
