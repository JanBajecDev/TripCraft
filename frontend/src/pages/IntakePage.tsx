import { DESTINATIONS, ORIGINS, INTERESTS } from '../lib/constants'
import { Stepper } from '../components/intake/Stepper'
import { FieldCard } from '../components/intake/FieldCard'
import type { TripIntake } from '../types'
import { Check, CalendarDays, Search, Info, ChevronDown, ArrowRight, Utensils as Restaurant, History, Building2, Music2, Palmtree as BeachAccess, Palette, Trees as Forest, ShoppingBag } from 'lucide-react'

interface IntakePageProps {
  state: TripIntake
  set: (partial: Partial<TripIntake>) => void
  onSubmit: () => void
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

export function IntakePage({ state, set, onSubmit }: IntakePageProps) {
  const dest = DESTINATIONS.find(d => d.id === state.destination) ?? DESTINATIONS[0]
  const pct = ((state.budgetGbp - 800) / (6000 - 800) * 100).toFixed(1)

  return (
    <div className="intake-scroll">
      <div className="intake">
        <header className="intake-hero">
          <div className="eyebrow">Plan with TripCraft</div>
          <h1 className="display">Tell us the shape of the trip.<br />We'll plan the rest — then talk it through.</h1>
          <p className="lede">Pick a few essentials below. TripCraft drafts a full itinerary — flights, a place to stay, things to do — and you fine-tune everything by chatting with it.</p>
        </header>

        <div className="field-grid">
          <FieldCard icon="my_location" label="Flying from">
            <div className="seg-select">
              {ORIGINS.slice(0, 3).map(o => (
                <button key={o} type="button" className={`seg${state.origin === o ? ' on' : ''}`} onClick={() => set({ origin: o })}>{o}</button>
              ))}
              <div className="select-wrap">
                <select value={state.origin} onChange={e => set({ origin: e.target.value })}>
                  {ORIGINS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={18} />
              </div>
            </div>
          </FieldCard>

          <FieldCard icon="travel_explore" label="Where to">
            <div className="dest-row">
              {DESTINATIONS.map(d => (
                <button key={d.id} type="button" className={`dest-chip${state.destination === d.id ? ' on' : ''}`}
                  onClick={() => set({ destination: d.id, destCode: d.code })}>
                  <span className="dest-city">{d.city}</span>
                  <span className="dest-code">{d.code}</span>
                </button>
              ))}
            </div>
            <p className="field-note"><Info size={15} />{dest.note} · {dest.country}</p>
          </FieldCard>

          <FieldCard icon="event" label="Dates">
            <div className="seg-group">
              <button type="button" className={`seg${state.dateMode === 'exact' ? ' on' : ''}`} onClick={() => set({ dateMode: 'exact' })}>Exact dates</button>
              <button type="button" className={`seg${state.dateMode === 'flexible' ? ' on' : ''}`} onClick={() => set({ dateMode: 'flexible' })}>Flexible — best value</button>
            </div>
            {state.dateMode === 'exact'
              ? <div className="date-value"><CalendarDays size={19} />{state.dateExact}</div>
              : <div className="date-value"><Search size={19} />We'll find the cheapest stretch in {state.dateMonth}</div>}
          </FieldCard>

          <FieldCard icon="schedule" label="Length of stay">
            <Stepper value={state.tripDays} min={2} max={14} suffix=" days" onChange={v => set({ tripDays: v })} />
            <p className="field-note">{state.tripDays - 1} nights away</p>
          </FieldCard>

          <FieldCard icon="group" label="Travellers">
            <Stepper value={state.travellers} min={1} max={8} suffix={state.travellers === 1 ? ' person' : ' people'} onChange={v => set({ travellers: v })} />
          </FieldCard>

          <FieldCard icon="payments" label="Total budget">
            <div className="budget-value">£{state.budgetGbp.toLocaleString()}</div>
            <input
              type="range" min="800" max="6000" step="100"
              value={state.budgetGbp}
              onChange={e => set({ budgetGbp: Number(e.target.value) })}
              className="budget-range"
              style={{ '--pct': `${pct}%` } as React.CSSProperties}
            />
            <div className="budget-scale"><span>£800</span><span>£6,000</span></div>
          </FieldCard>

          <FieldCard icon="interests" label="Interests" full>
            <div className="interest-row">
              {INTERESTS.map(it => {
                const on = state.interests.includes(it.id)
                return (
                  <button key={it.id} type="button" className={`interest-chip${on ? ' on' : ''}`}
                    onClick={() => set({ interests: on ? state.interests.filter(x => x !== it.id) : [...state.interests, it.id] })}>
                    {iconMap[it.icon]}
                    {it.label}
                    {on && <Check size={17} className="check" />}
                  </button>
                )
              })}
            </div>
          </FieldCard>
        </div>

        <div className="intake-cta">
          <button type="button" className="btn-primary lg" onClick={onSubmit} disabled={state.interests.length === 0}>
            Plan my trip
            Plan my trip
            <ArrowRight size={20} />
          </button>
          <p className="cta-note">Free to plan. You only book what you like.</p>
        </div>
      </div>
    </div>
  )
}
