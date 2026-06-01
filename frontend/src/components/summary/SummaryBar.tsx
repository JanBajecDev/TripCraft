import { useState, useRef, useEffect, type ReactNode } from 'react'
import { DESTINATIONS, ORIGINS } from '../../lib/constants'
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
        {children && <ChevronDown size={14} style={{ color: 'var(--fg-4)', flexShrink: 0, opacity: 0.6 }} />}
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
}

export function SummaryBar({ state, set, theme, onToggleTheme, tripReady, total, onBook, booked }: SummaryBarProps) {
  const dest = DESTINATIONS.find(d => d.id === state.destination) ?? DESTINATIONS[0]
  const dateVal = state.dateMode === 'exact' ? state.dateExact : `Flexible · ${state.dateMonth}`
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
          <div className="pop-list">
            {ORIGINS.map(o => (
              <button key={o} type="button" className={`pop-opt${state.origin === o ? ' on' : ''}`} onClick={() => set({ origin: o })}>
                {o}{state.origin === o && <CheckCircle size={18} />}
              </button>
            ))}
          </div>
        </Chip>

        <Plane size={20} className="sum-arrow" />

        <Chip icon={<Compass size={18} />} label="To" value={dest.city}>
          <div className="pop-title">Destination</div>
          <div className="pop-list">
            {DESTINATIONS.map(d => (
              <button key={d.id} type="button" className={`pop-opt${state.destination === d.id ? ' on' : ''}`} onClick={() => set({ destination: d.id, destCode: d.code })}>
                {d.city}, {d.country}{state.destination === d.id && <CheckCircle size={18} />}
              </button>
            ))}
          </div>
        </Chip>

        <Chip icon={<Calendar size={18} />} label="Dates" value={dateVal}>
          <div className="pop-title">When</div>
          <div className="seg-group pop-seg">
            <button type="button" className={`seg${state.dateMode === 'exact' ? ' on' : ''}`} onClick={() => set({ dateMode: 'exact' })}>Exact</button>
            <button type="button" className={`seg${state.dateMode === 'flexible' ? ' on' : ''}`} onClick={() => set({ dateMode: 'flexible' })}>Flexible</button>
          </div>
          <div className="pop-hint">{state.dateMode === 'exact' ? state.dateExact : `Cheapest stretch in ${state.dateMonth}`}</div>
        </Chip>

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
