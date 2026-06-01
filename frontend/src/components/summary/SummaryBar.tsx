import { useState, useRef, useEffect, type ReactNode } from 'react'
import { DESTINATIONS as FALLBACK_DESTINATIONS, ORIGINS as FALLBACK_ORIGINS } from '../../lib/constants'
import { parseExactDate, formatExactDate, parseMonth, formatMonth } from '../../lib/dates'
import { CitySearch, type CityItem } from '../intake/CitySearch'
import { Stepper } from '../intake/Stepper'
import type { TripIntake } from '../../types'
import { MapPin, Compass, Calendar, Users, CreditCard, Lightbulb, Luggage, CheckCircle, ChevronDown, Plane } from 'lucide-react'

function useOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onClose])
}

interface ChipProps {
  icon: ReactNode
  label: string
  value: string
  children?: ReactNode
}

function Chip({ icon, label, value, children }: ChipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))
  return (
    <div className="sum-chip-wrap" ref={ref}>
      <button type="button" className={`sum-chip${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        {icon}
        <span className="sum-chip-text">
          <span className="sum-chip-label">{label}</span>
          <span className="sum-chip-value">{value}</span>
        </span>
        {children && <ChevronDown size={14} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />}
      </button>
      {open && children && (
        <div className="sum-pop" onClick={e => e.stopPropagation()}>{children}</div>
      )}
    </div>
  )
}

interface SummaryBarProps {
  state: TripIntake
  set: (partial: Partial<TripIntake>) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  tripReady: boolean
  total: number
  onBook: () => void
  booked: boolean
  origins?: CityItem[]
  destinations?: CityItem[]
}

function DatesChip({ state, set }: { state: TripIntake; set: (partial: Partial<TripIntake>) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false))

  const dateVal = state.dateMode === 'exact' ? state.dateExact : `Flexible · ${state.dateMonth}`

  const exact = parseExactDate(state.dateExact)
  const [start, setStart] = useState(exact.start)
  const [end, setEnd] = useState(exact.end)

  const flex = parseMonth(state.dateMonth)
  const [month, setMonth] = useState(flex)

  function applyExact(newStart: string, newEnd: string) {
    if (!newStart || !newEnd) return
    const formatted = formatExactDate(newStart, newEnd)
    if (formatted) set({ dateExact: formatted, dateLabel: formatted })
  }

  function applyFlex(newMonth: string) {
    if (!newMonth) return
    const formatted = formatMonth(newMonth)
    if (formatted) set({ dateMonth: formatted, dateLabel: `Flexible · ${formatted}` })
  }

  return (
    <div className="sum-chip-wrap" ref={ref}>
      <button type="button" className={`sum-chip${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <Calendar size={18} />
        <span className="sum-chip-text">
          <span className="sum-chip-label">Dates</span>
          <span className="sum-chip-value">{dateVal}</span>
        </span>
        <ChevronDown size={14} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
      </button>
      {open && (
        <div className="sum-pop" onClick={e => e.stopPropagation()}>
          <div className="pop-title">When</div>
          <div className="seg-group pop-seg">
            <button type="button" className={`seg${state.dateMode === 'exact' ? ' on' : ''}`} onClick={() => set({ dateMode: 'exact' })}>Exact</button>
            <button type="button" className={`seg${state.dateMode === 'flexible' ? ' on' : ''}`} onClick={() => set({ dateMode: 'flexible' })}>Flexible</button>
          </div>
          {state.dateMode === 'exact' ? (
            <div className="date-inputs">
              <label className="date-field">
                <span>Departure</span>
                <input
                  type="date"
                  value={start}
                  onChange={e => {
                    setStart(e.target.value)
                    applyExact(e.target.value, end)
                  }}
                />
              </label>
              <label className="date-field">
                <span>Return</span>
                <input
                  type="date"
                  value={end}
                  onChange={e => {
                    setEnd(e.target.value)
                    applyExact(start, e.target.value)
                  }}
                />
              </label>
            </div>
          ) : (
            <label className="date-field">
              <span>Month</span>
              <input
                type="month"
                value={month}
                onChange={e => {
                  setMonth(e.target.value)
                  applyFlex(e.target.value)
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

export function SummaryBar({ state, set, theme, onToggleTheme, tripReady, total, onBook, booked, origins = FALLBACK_ORIGINS.map((o, i) => ({ id: `origin-${o.toLowerCase()}`, city: o, country: null, code: '', note: null })), destinations = FALLBACK_DESTINATIONS.map(d => ({ id: d.id, city: d.city, country: d.country, code: d.code, note: d.note })) }: SummaryBarProps) {
  const dest = destinations.find(d => d.id === state.destination) ?? destinations[0]
  const pct = ((state.budgetGbp - 800) / (6000 - 800) * 100).toFixed(1)

  return (
    <header className="sum-bar glass-panel">
      <div className="brand">
        <span className="brand-mark"><Compass size={20} /></span>
        <span className="brand-name">TripCraft</span>
      </div>

      <div className="sum-chips">
        <Chip icon={<MapPin size={18} />} label="From" value={state.origin}>
          <div className="pop-title">Flying from</div>
          <CitySearch
            items={origins}
            value={state.origin}
            onSelect={item => set({ origin: item.city })}
            placeholder="Search departure city..."
            label="Flying from"
          />
        </Chip>

        <Plane size={20} className="sum-arrow" />

        <Chip icon={<Compass size={18} />} label="To" value={dest.city}>
          <div className="pop-title">Destination</div>
          <CitySearch
            items={destinations}
            value={state.destination}
            onSelect={item => set({ destination: item.id, destCode: item.code })}
            placeholder="Search destination city..."
            label="Destination"
          />
        </Chip>

        <DatesChip state={state} set={set} />

        <Chip icon={<Users size={18} />} label="Travellers" value={`${state.travellers} ${state.travellers === 1 ? 'person' : 'people'}`}>
          <div className="pop-title">Travellers</div>
          <Stepper value={state.travellers} min={1} max={8} suffix={state.travellers === 1 ? ' person' : ' people'} onChange={v => set({ travellers: v })} />
        </Chip>

        <Chip icon={<CreditCard size={18} />} label="Budget" value={`£${state.budgetGbp.toLocaleString()}`}>
          <div className="pop-title">Total budget</div>
          <div className="budget-value sm">£{state.budgetGbp.toLocaleString()}</div>
          <input type="range" min="800" max="6000" step="100" value={state.budgetGbp}
            onChange={e => set({ budgetGbp: Number(e.target.value) })}
            className="budget-range"
            style={{ '--pct': `${pct}%` } as React.CSSProperties}
          />
        </Chip>
      </div>

      <div className="sum-actions">
        <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Lightbulb size={18} /> : <Lightbulb size={18} />}
        </button>
        <button type="button" className={`btn-primary book${booked ? ' booked' : ''}`} disabled={!tripReady} onClick={onBook}>
          {booked
            ? <><CheckCircle size={19} />Trip booked</>
            : <><Luggage size={19} />Book this trip{tripReady && total > 0 ? ` · £${total.toLocaleString()}` : ''}</>}
        </button>
      </div>
    </header>
  )
}
