export interface FlightLeg {
  airline: string
  flightNo: string
  from: string
  to: string
  date: string
  dep: string
  arr: string
  dur: string
  stops: string
}

export interface FlightOption {
  out: FlightLeg
  ret: FlightLeg
  perPerson: number
  cabin: string
}

export interface FlightData {
  options: FlightOption[]
}

export interface HotelOption {
  name: string
  area: string
  rating: number
  reviews: number
  nights: number
  perNight: number
  blurb: string
  tags: string[]
  thumbnail?: string
  link?: string
}

export interface HotelData {
  options: HotelOption[]
}

export interface DayItem {
  time: string
  icon: string
  text: string
  added?: boolean
}

export interface DayData {
  n: number
  date: string
  title: string
  items: DayItem[]
}

export interface RestaurantData {
  name: string
  cuisine: string
  price: string
  rating: number
  source: string
  note: string
  link?: string
  added?: boolean
}

export interface EventData {
  name: string
  date: string
  where: string
  price: string
  icon: string
  note: string
  link?: string
}

export interface CarData {
  name: string
  cat: string
  days: number
  perDay: number
  note: string
}

export interface BudgetLine {
  label: string
  detail: string
  amount: number
}

export interface BudgetData {
  lines: BudgetLine[]
  total: number
}

export interface ItineraryState {
  flights?: FlightData
  hotel?: HotelData
  days?: DayData[]
  restaurants?: RestaurantData[]
  events?: EventData[]
  car?: CarData
  budget?: BudgetData
}

export interface TripIntake {
  origin: string
  destination: string
  destCode: string
  dateMode: 'exact' | 'flexible'
  dateLabel: string
  dateExact: string
  dateMonth: string
  tripDays: number
  travellers: number
  budgetGbp: number
  interests: string[]
}

// Chat message types
export interface TextBlock { type: 'text'; text: string; streaming?: boolean }
export interface ToolBlock { type: 'tool'; toolName: string; label: string; detail?: string; status: 'running' | 'done' }
export interface SuggestionsBlock { type: 'suggestions'; items: string[] }

export type Block = TextBlock | ToolBlock | SuggestionsBlock

export interface UserMessage { id: string; role: 'user'; text: string }
export interface AssistantMessage { id: string; role: 'assistant'; blocks: Block[] }
export type ChatMessage = UserMessage | AssistantMessage
