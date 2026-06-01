// app-data.jsx — intake configuration, Lisbon mock itinerary, and the agent script.
// Shared to window for the other babel scripts.

const DESTINATIONS = [
  { id: 'lisbon', city: 'Lisbon', country: 'Portugal', code: 'LIS', note: 'Festas de Lisboa on now' },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', code: 'BCN', note: 'Beaches + Gaudí' },
  { id: 'rome', city: 'Rome', country: 'Italy', code: 'FCO', note: 'Ancient history' },
  { id: 'athens', city: 'Athens', country: 'Greece', code: 'ATH', note: 'Islands nearby' },
  { id: 'copenhagen', city: 'Copenhagen', country: 'Denmark', code: 'CPH', note: 'Design + food' },
];

const ORIGINS = ['London', 'Manchester', 'Edinburgh', 'Dublin', 'Paris', 'Amsterdam'];

const INTERESTS = [
  { id: 'food', label: 'Food & wine', icon: 'restaurant' },
  { id: 'history', label: 'History', icon: 'history_edu' },
  { id: 'architecture', label: 'Architecture', icon: 'apartment' },
  { id: 'nightlife', label: 'Nightlife', icon: 'nightlife' },
  { id: 'beaches', label: 'Beaches', icon: 'beach_access' },
  { id: 'art', label: 'Art & museums', icon: 'palette' },
  { id: 'nature', label: 'Nature & walks', icon: 'forest' },
  { id: 'music', label: 'Live music', icon: 'music_note' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
];

const INTAKE_DEFAULTS = {
  origin: 'London',
  destination: 'lisbon',
  days: 5,
  dateMode: 'exact', // 'exact' | 'flexible'
  dateExact: '12–16 June 2026',
  dateMonth: 'June 2026',
  travellers: 2,
  budget: 2500,
  interests: ['food', 'history', 'architecture'],
};

// ---- Mock itinerary content (Lisbon, 5 days, 2 people) --------------------

const TRIP = {
  flights: {
    out: { airline: 'TAP Air Portugal', flightNo: 'TP1369', from: 'LHR', to: 'LIS', date: 'Fri 12 Jun', dep: '07:25', arr: '10:10', dur: '2h 45m', stops: 'Direct' },
    ret: { airline: 'TAP Air Portugal', flightNo: 'TP1362', from: 'LIS', to: 'LHR', date: 'Tue 16 Jun', dep: '19:40', arr: '22:25', dur: '2h 45m', stops: 'Direct' },
    perPerson: 214,
    cabin: 'Economy · 1 cabin bag',
  },
  hotel: {
    name: 'Memmo Alfama',
    area: 'Alfama',
    rating: 4.6,
    reviews: 2841,
    nights: 4,
    perNight: 168,
    blurb: 'Boutique design hotel tucked into the old town, with a terrace bar over the Tejo.',
    tags: ['Terrace · river view', 'Breakfast included', 'Adults only'],
  },
  hotelCheap: {
    name: 'Lisboa Pessoa Hotel',
    area: 'Bairro Alto',
    rating: 4.3,
    reviews: 1960,
    nights: 4,
    perNight: 119,
    blurb: 'Smart 4-star with a rooftop pool, walkable to the nightlife of Bairro Alto.',
    tags: ['Rooftop pool', 'Breakfast included', 'Central'],
  },
  days: [
    { n: 1, date: 'Fri 12 Jun', title: 'Arrive · Alfama at dusk',
      items: [
        { time: '10:10', icon: 'flight_land', text: 'Land at Lisbon, check in to the hotel' },
        { time: '15:00', icon: 'directions_walk', text: 'Wander Alfama’s lanes to Miradouro de Santa Luzia' },
        { time: '20:00', icon: 'festival', text: 'Santo António street festivities — grilled sardines & arraiais' },
      ] },
    { n: 2, date: 'Sat 13 Jun', title: 'Old town & Fado',
      items: [
        { time: '10:00', icon: 'tram', text: 'Ride Tram 28 up to Castelo de São Jorge' },
        { time: '13:00', icon: 'restaurant', text: 'Lunch at Time Out Market' },
        { time: '21:00', icon: 'music_note', text: 'Fado dinner at a family casa in Alfama' },
      ] },
    { n: 3, date: 'Sun 14 Jun', title: 'Day trip to Sintra', kind: 'sintra',
      items: [
        { time: '09:30', icon: 'train', text: 'Train from Rossio to Sintra' },
        { time: '11:00', icon: 'castle', text: 'Pena Palace & the gardens of Quinta da Regaleira' },
        { time: '17:00', icon: 'waves', text: 'Sunset at Cabo da Roca, Europe’s westernmost point' },
      ] },
    { n: 4, date: 'Mon 15 Jun', title: 'Belém & LX Factory',
      items: [
        { time: '10:00', icon: 'account_balance', text: 'Jerónimos Monastery & Belém Tower' },
        { time: '12:30', icon: 'bakery_dining', text: 'Pastéis de Belém, straight from the oven' },
        { time: '15:30', icon: 'storefront', text: 'LX Factory — independent shops & galleries' },
      ] },
    { n: 5, date: 'Tue 16 Jun', title: 'Slow morning · fly home',
      items: [
        { time: '10:30', icon: 'local_cafe', text: 'Brunch in Príncipe Real' },
        { time: '14:00', icon: 'shopping_bag', text: 'Last-minute shopping on Rua Augusta' },
        { time: '19:40', icon: 'flight_takeoff', text: 'Evening flight back to London' },
      ] },
  ],
  restaurants: [
    { name: 'Cervejaria Ramiro', cuisine: 'Seafood', price: '£££', rating: 4.5, source: 'TripAdvisor', note: 'The city’s temple to garlic prawns & percebes.' },
    { name: 'A Cevicheria', cuisine: 'Peruvian-Portuguese', price: '££', rating: 4.4, source: 'Yelp', note: 'No reservations — go early, sit under the octopus.' },
    { name: 'O Velho Eurico', cuisine: 'Modern tasca', price: '££', rating: 4.6, source: 'TripAdvisor', note: 'Reinvented Portuguese classics near the cathedral.' },
  ],
  events: [
    { name: 'Festas de Lisboa — Santo António', date: '12–13 Jun', where: 'Alfama & Graça', price: 'Free', icon: 'festival', note: 'Street parties, sardines and marchas populares.' },
    { name: 'Fado ao Centro', date: 'Nightly · 18:00', where: 'Bairro Alto', price: '€22 pp', icon: 'music_note', note: 'A 50-minute intro to Fado for newcomers.' },
    { name: 'Out Jazz Sunday session', date: 'Sun 14 Jun', where: 'Jardim do Príncipe Real', price: 'Free', icon: 'piano', note: 'Open-air DJ & jazz in the park.' },
  ],
  car: {
    name: 'Renault Clio (or similar)',
    cat: 'Compact · automatic',
    days: 1,
    perDay: 52,
    note: 'Picked up for the Sintra–Cascais coast loop, returned the same evening.',
  },
};

// Budget line items derived from TRIP. travellers default 2.
function buildBudget(state, opts = {}) {
  const t = state.travellers || 2;
  const hotel = opts.cheapHotel ? TRIP.hotelCheap : TRIP.hotel;
  const lines = [
    { label: 'Flights', detail: `${t} × £${TRIP.flights.perPerson} return`, amount: TRIP.flights.perPerson * t },
    { label: 'Hotel', detail: `${hotel.nights} nights · ${hotel.name}`, amount: hotel.perNight * hotel.nights },
    { label: 'Activities & tickets', detail: 'Castelo, Pena Palace, Belém', amount: 184 },
    { label: 'Food & drink', detail: 'est. for two', amount: 420 },
    { label: 'Events', detail: 'Festas de Lisboa · free', amount: 0 },
  ];
  if (opts.car) lines.push({ label: 'Rental car', detail: '1 day · compact', amount: TRIP.car.perDay });
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { lines, total };
}

// ---- Agent streaming script (first generation) ----------------------------
// Each step is processed by the Chat driver. Tool steps fire a `populate` key.

function buildAgentScript(state) {
  const dest = DESTINATIONS.find(d => d.id === state.destination) || DESTINATIONS[0];
  return [
    { type: 'text', text: `Right — five days in ${dest.city} for two, ${state.dateExact}. That drops you straight into the Festas de Lisboa, so I'll build the evenings around it. Give me a moment to pull everything together.` },
    { type: 'tool', api: 'Google Flights', label: `Searching return flights · ${state.origin} → ${dest.city}`, populate: 'flights' },
    { type: 'text', text: `Found a direct TAP service both ways — £${TRIP.flights.perPerson} each, return, no connections.` },
    { type: 'tool', api: 'Google Hotels', label: 'Checking boutique hotels in Alfama & Chiado', populate: 'hotel' },
    { type: 'text', text: `Memmo Alfama fits the history-and-views brief — a terrace over the river and 4.6 on TripAdvisor across 2,800 reviews.` },
    { type: 'tool', api: 'TripAdvisor', label: 'Ranking things to do for history + architecture', populate: 'days' },
    { type: 'tool', api: 'Yelp Fusion', label: 'Finding restaurants near your hotel', populate: 'restaurants' },
    { type: 'tool', api: 'Google Events', label: 'Looking up events for 12–16 June', populate: 'events' },
    { type: 'text', text: `Here's the plan: a Sintra day trip, Fado in Alfama and the Santo António festivities on your first night. It comes to about £1,704 all in — comfortably under your £2,500. Have a read on the right, then tell me what to change.` },
    { type: 'suggestions', items: ['Make it cheaper', 'Add a beach afternoon', 'Add a rental car', 'Swap to a vegetarian dinner'] },
  ];
}

// ---- Follow-up chat logic --------------------------------------------------
// Returns { reply, steps, mutate } given the user's message + current trip state.

function respondToMessage(msg, tripState) {
  const m = msg.toLowerCase();
  if (/(cheap|budget|less|save|afford)/.test(m)) {
    return {
      steps: [
        { type: 'tool', api: 'Google Hotels', label: 'Re-searching hotels under £120/night', populate: 'hotelSwap' },
      ],
      reply: 'Done. I’ve swapped the hotel for the Lisboa Pessoa — a 4-star with a rooftop pool in Bairro Alto, £119 a night instead of £168. That brings the trip down to about £1,508. The rest of the plan is unchanged.',
      mutate: { cheapHotel: true },
    };
  }
  if (/(beach|sea|swim|coast|caparica)/.test(m)) {
    return {
      steps: [
        { type: 'tool', api: 'TripAdvisor', label: 'Finding beaches reachable from Lisbon', populate: 'beach' },
      ],
      reply: 'Added a beach afternoon. On Day 4 I’ve slotted in Costa da Caparica after Belém — 25 minutes by car or the seasonal ferry-and-bus. Soft sand, beach bars, and back in time for dinner.',
      mutate: { beach: true },
    };
  }
  if (/(car|drive|rental|hire)/.test(m)) {
    return {
      steps: [
        { type: 'tool', api: 'Google Search', label: 'Comparing car hire at Lisbon airport', populate: 'car' },
      ],
      reply: 'Rental car added — a compact automatic for the Sintra day, £52 including pick-up at the airport and drop-off that evening. It makes the Pena Palace and Cabo da Roca loop far easier than the train.',
      mutate: { car: true },
    };
  }
  if (/(veg|vegan|vegetarian|plant)/.test(m)) {
    return {
      steps: [
        { type: 'tool', api: 'Yelp Fusion', label: 'Finding top vegetarian spots', populate: 'veg' },
      ],
      reply: 'Swapped one dinner for Ao 26 — Vegan Food Project in Chiado, a local favourite for plant-based Portuguese cooking. I’ve kept Ramiro on the list in case the seafood-lovers among you change their minds.',
      mutate: { veg: true },
    };
  }
  if (/(sintra|skip|drop|don'?t|rather not)/.test(m)) {
    return {
      steps: [
        { type: 'tool', api: 'TripAdvisor', label: 'Re-planning Day 3 along the coast', populate: 'noSintra' },
      ],
      reply: 'No problem — I’ve replaced the Sintra day with a slower coast day in Cascais: the old fort, Boca do Inferno, and lunch by the marina. Less climbing, more sea air.',
      mutate: { noSintra: true },
    };
  }
  // default
  return {
    steps: [],
    reply: 'Good question. As it stands the trip is five days, two people, about £1,704 with flights, the Memmo Alfama, a Sintra day and the Festas de Lisboa. Tell me what matters most — budget, pace, food, or nightlife — and I’ll rework it around that.',
    mutate: {},
  };
}

Object.assign(window, {
  DESTINATIONS, ORIGINS, INTERESTS, INTAKE_DEFAULTS, TRIP,
  buildBudget, buildAgentScript, respondToMessage,
});
