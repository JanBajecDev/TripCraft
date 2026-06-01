const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function parseExactDate(dateExact: string): { start: string; end: string } {
  const m = dateExact.match(/(\d{1,2})[–-](\d{1,2})\s+(\w+)\s+(\d{4})/)
  if (!m) return { start: '', end: '' }
  const [, startDay, endDay, monthName, year] = m
  const monthIdx = MONTH_NAMES.findIndex(n => n.toLowerCase() === monthName.toLowerCase())
  if (monthIdx === -1) return { start: '', end: '' }
  const mm = String(monthIdx + 1).padStart(2, '0')
  return {
    start: `${year}-${mm}-${startDay.padStart(2, '0')}`,
    end: `${year}-${mm}-${endDay.padStart(2, '0')}`,
  }
}

export function formatExactDate(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return ''
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()
  if (sameMonth) {
    return `${s.getDate()}–${e.getDate()} ${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`
  }
  return `${s.getDate()} ${SHORT_MONTHS[s.getMonth()]} – ${e.getDate()} ${SHORT_MONTHS[e.getMonth()]} ${s.getFullYear()}`
}

export function parseMonth(dateMonth: string): string {
  const m = dateMonth.match(/(\w+)\s+(\d{4})/)
  if (!m) return ''
  const [, monthName, year] = m
  const monthIdx = MONTH_NAMES.findIndex(n => n.toLowerCase() === monthName.toLowerCase())
  if (monthIdx === -1) return ''
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}`
}

export function formatMonth(value: string): string {
  const [year, mm] = value.split('-')
  if (!year || !mm) return ''
  const monthIdx = parseInt(mm, 10) - 1
  return `${MONTH_NAMES[monthIdx]} ${year}`
}
