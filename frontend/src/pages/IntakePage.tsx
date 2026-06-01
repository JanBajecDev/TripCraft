import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DESTINATIONS as FALLBACK_DESTINATIONS, ORIGINS as FALLBACK_ORIGINS, INTERESTS } from '../lib/constants'
import { fetchDestinations } from '../lib/api'
import { CitySearch, type CityItem } from '../components/intake/CitySearch'
import { Stepper } from '../components/intake/Stepper'
import { FieldCard } from '../components/intake/FieldCard'
import type { TripIntake } from '../types'
import { parseExactDate, formatExactDate, parseMonth, formatMonth } from '../lib/dates'
import { Check, Info, ArrowRight, Utensils as Restaurant, History, Building2, Music2, Palmtree as BeachAccess, Palette, Trees as Forest, ShoppingBag } from 'lucide-react'

interface IntakePageProps {
  state: TripIntake
  set: (partial: Partial<TripIntake>) => void
  onSubmit: () => void
  isLoading?: boolean
}

const iconMap: Record<string, React.ReactNode> = {
  restaurant: <Restaurant size={17} />,
  history_edu: <History size={17} />,
  apartment: <Building2 size={17} />,
  nightlife: <Music2 size={17} />,
  beach_access: <BeachAccess size={17} />,
  palette: <Palette size={17} />,
  forest: <Forest size={17} />,
  music_note: <Music2 size={17} />,
  shopping_bag: <ShoppingBag size={17} />,
}

function CustomInterestInput({ onAdd }: { onAdd: (label: string) => void }) {
  const [value, setValue] = useState('')

  function commit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--color-surface-dim)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', height: 38, paddingLeft: 14, width: '100%', marginTop: 4 }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
        placeholder="Add your own interest…"
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--color-fg-2)', fontFamily: 'var(--font-sans)' }}
      />
      {value.trim() && (
        <button
          type="button"
          onClick={commit}
          style={{ flexShrink: 0, height: '100%', paddingInline: 14, background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)' }}
        >
          Add
        </button>
      )}
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
}

const heroItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const chipSpring = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
} as const

export function IntakePage({ state, set, onSubmit, isLoading }: IntakePageProps) {
  const [origins, setOrigins] = useState<CityItem[]>(
    FALLBACK_ORIGINS.map(o => ({ id: `origin-${o.toLowerCase()}`, city: o, country: null, code: '', note: null }))
  )
  const [destinations, setDestinations] = useState<CityItem[]>(
    FALLBACK_DESTINATIONS.map(d => ({ id: d.id, city: d.city, country: d.country, code: d.code, note: d.note }))
  )

  useEffect(() => {
    fetchDestinations('origin')
      .then(data => setOrigins(data.map(d => ({ id: d.id, city: d.city, country: d.country, code: d.code, note: d.note }))))
      .catch(() => {})
    fetchDestinations('destination')
      .then(data => setDestinations(data.map(d => ({ id: d.id, city: d.city, country: d.country ?? '', code: d.code, note: d.note ?? '' }))))
      .catch(() => {})
  }, [])

  const dest = destinations.find(d => d.id === state.destination) ?? destinations[0]
  const pct = ((state.budgetGbp - 800) / (6000 - 800) * 100).toFixed(1)

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
    <div className="intake-scroll">
      <div className="intake">
        <motion.header
          className="intake-hero"
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="eyebrow" variants={heroItemVariants}>
            Plan with TripCraft
          </motion.div>
          <motion.h1 className="display" variants={heroItemVariants}>
            Tell us the shape of the trip.<br />We'll plan the rest — then talk it through.
          </motion.h1>
          <motion.p className="lede" variants={heroItemVariants}>
            Pick a few essentials below. TripCraft drafts a full itinerary — flights, a place to stay, things to do — and you fine-tune everything by chatting with it.
          </motion.p>
        </motion.header>

        <motion.div
          className="field-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <FieldCard icon="my_location" label="Flying from">
              <CitySearch
                items={origins}
                value={state.origin}
                onSelect={item => set({ origin: item.city })}
                placeholder="Search departure city..."
                label="Flying from"
              />
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FieldCard icon="travel_explore" label="Where to">
              <CitySearch
                items={destinations}
                value={state.destination}
                onSelect={item => set({ destination: item.id, destCode: item.code })}
                placeholder="Search destination city..."
                label="Where to"
              />
              {dest && <p className="field-note"><Info size={15} />{dest.note} · {dest.country}</p>}
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FieldCard icon="event" label="Dates">
              <div className="seg-group">
                <motion.button
                  type="button"
                  className={`seg${state.dateMode === 'exact' ? ' on' : ''}`}
                  onClick={() => set({ dateMode: 'exact' })}
                  whileTap={{ scale: 0.96 }}
                >
                  Exact dates
                </motion.button>
                <motion.button
                  type="button"
                  className={`seg${state.dateMode === 'flexible' ? ' on' : ''}`}
                  onClick={() => set({ dateMode: 'flexible' })}
                  whileTap={{ scale: 0.96 }}
                >
                  Flexible — best value
                </motion.button>
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
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FieldCard icon="schedule" label="Length of stay">
              <Stepper value={state.tripDays} min={2} max={14} suffix=" days" onChange={v => set({ tripDays: v })} />
              <p className="field-note">{state.tripDays - 1} nights away</p>
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FieldCard icon="group" label="Travellers">
              <Stepper value={state.travellers} min={1} max={8} suffix={state.travellers === 1 ? ' person' : ' people'} onChange={v => set({ travellers: v })} />
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FieldCard icon="payments" label="Total budget">
              <motion.div
                className="budget-value"
                key={state.budgetGbp}
                initial={{ scale: 1.1, color: 'var(--color-primary)' }}
                animate={{ scale: 1, color: 'var(--color-fg-1)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                £{state.budgetGbp.toLocaleString()}
              </motion.div>
              <input
                type="range" min="800" max="6000" step="100"
                value={state.budgetGbp}
                onChange={e => set({ budgetGbp: Number(e.target.value) })}
                className="budget-range"
                style={{ '--pct': `${pct}%` } as React.CSSProperties}
              />
              <div className="budget-scale"><span>£800</span><span>£6,000</span></div>
            </FieldCard>
          </motion.div>

          <motion.div variants={itemVariants} className="full">
            <FieldCard icon="interests" label="Interests" full>
              <div className="interest-row">
                {INTERESTS.map(it => {
                  const on = state.interests.includes(it.id)
                  return (
                    <motion.button
                      key={it.id}
                      type="button"
                      className={`interest-chip${on ? ' on' : ''}`}
                      onClick={() => set({ interests: on ? state.interests.filter(x => x !== it.id) : [...state.interests, it.id] })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      transition={chipSpring}
                      layout
                    >
                      {iconMap[it.icon]}
                      {it.label}
                      {on && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={chipSpring}
                        >
                          <Check size={17} className="check" />
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
                {/* Custom interests added by user */}
                {state.interests
                  .filter(id => !INTERESTS.find(it => it.id === id))
                  .map(custom => (
                    <motion.button
                      key={custom}
                      type="button"
                      className="interest-chip on"
                      onClick={() => set({ interests: state.interests.filter(x => x !== custom) })}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      transition={chipSpring}
                      layout
                    >
                      {custom}
                      <Check size={17} className="check" />
                    </motion.button>
                  ))}
                <CustomInterestInput
                  onAdd={label => {
                    const trimmed = label.trim()
                    if (!trimmed || state.interests.includes(trimmed)) return
                    set({ interests: [...state.interests, trimmed] })
                  }}
                />
              </div>
            </FieldCard>
          </motion.div>
        </motion.div>

        <motion.div
          className="intake-cta"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <motion.button
            type="button"
            className={`btn-primary lg${isLoading ? ' loading' : ''}`}
            onClick={onSubmit}
            disabled={state.interests.length === 0 || isLoading}
            whileHover={isLoading ? {} : { scale: 1.03, y: -1 }}
            whileTap={isLoading ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {isLoading ? (
              <>
                Planning your trip
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  …
                </motion.span>
              </>
            ) : (
              <>
                Plan my trip
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
          <p className="cta-note">Free to plan. You only book what you like.</p>
        </motion.div>
      </div>
    </div>
  )
}
