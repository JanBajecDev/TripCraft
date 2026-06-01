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

export const TOOL_PHRASES: Record<string, string[]> = {
  google_flights: [
    'Searching for the best flights…',
    'Checking prices and availability…',
    'Comparing airlines and routes…',
    'Looking for direct options…',
    'Finding the best fare…',
  ],
  google_hotels: [
    'Checking hotels and availability…',
    'Comparing ratings and prices…',
    'Looking for the best location…',
    'Reading through hotel options…',
    'Picking places worth staying…',
  ],
  yelp_search: [
    'Finding top restaurants…',
    'Checking local favourites…',
    'Looking at ratings and reviews…',
    'Hunting down great food spots…',
    'Filtering the best picks…',
  ],
  google_events: [
    'Looking up events during your stay…',
    'Checking what\'s on locally…',
    'Finding concerts, festivals & more…',
    'Scanning local listings…',
    'Seeing what\'s happening in town…',
  ],
  tripadvisor_search: [
    'Researching things to do…',
    'Finding top-rated attractions…',
    'Checking must-see spots…',
    'Looking through traveller favourites…',
    'Scanning activities for your interests…',
  ],
  tripadvisor_reviews: [
    'Reading reviews…',
    'Checking what travellers say…',
    'Looking at recent feedback…',
    'Verifying the top picks…',
  ],
}

export const BETWEEN_TOOL_PHRASES = [
  'Comparing options…',
  'Picking the best results…',
  'Almost there…',
  'Putting it together…',
  'Finding great matches…',
  'Weighing up the choices…',
  'Double-checking details…',
]
