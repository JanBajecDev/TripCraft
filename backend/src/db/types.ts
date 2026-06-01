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

export interface FlightData {
  out: FlightLeg
  ret: FlightLeg
  perPerson: number
  cabin: string
}

export interface HotelData {
  name: string
  area: string
  rating: number
  reviews: number
  nights: number
  perNight: number
  blurb: string
  tags: string[]
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
  added?: boolean
}

export interface EventData {
  name: string
  date: string
  where: string
  price: string
  icon: string
  note: string
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
