import { motion, AnimatePresence } from 'framer-motion'
import type { ItineraryState, FlightLeg, TripIntake } from '../../types'
import { Star as StarIcon, Map, Plane, Hotel, Utensils, Music2, Car, ReceiptIcon as ReceiptLong, CheckCircle, ArrowRight } from 'lucide-react'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" title={`${rating} / 5`}>
      <StarIcon size={16} className="fill-current" />
      <strong>{rating.toFixed(1)}</strong>
    </span>
  )
}

const sectionSpring = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
} as const

function Section({ icon, title, source, color, children, delay = 0 }: {
  icon: React.ReactNode; title: string; source?: string; color?: string; children: React.ReactNode; delay?: number
}) {
  return (
    <motion.section
      className="it-section"
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...sectionSpring, delay: delay / 1000 }}
      layout
    >
      <div className="it-head">
        <span className={`it-ico ${color ?? ''}`}>{icon}</span>
        <h3>{title}</h3>
        {source && <span className="it-source">via {source}</span>}
      </div>
      {children}
    </motion.section>
  )
}

function FlightLegRow({ leg, dir }: { leg: FlightLeg; dir: string }) {
  return (
    <div className="leg">
      <div className="leg-dir">{dir}</div>
      <div className="leg-main">
        <div className="leg-times">
          <strong>{leg.dep}</strong>
          <span className="leg-line"><Plane size={15} /></span>
          <strong>{leg.arr}</strong>
        </div>
        <div className="leg-route">{leg.from} → {leg.to} · {leg.date}</div>
      </div>
      <div className="leg-meta">
        <span className="badge-soft">{leg.stops}</span>
        <span className="leg-dur">{leg.dur}</span>
      </div>
    </div>
  )
}

interface ItineraryPanelProps {
  itinerary: ItineraryState
  state: TripIntake
}

const TOTAL_SLOTS = 5

export function ItineraryPanel({ itinerary, state }: ItineraryPanelProps) {
  const revealed = [
    itinerary.flights && 'flights',
    itinerary.hotel && 'hotel',
    itinerary.days && 'days',
    itinerary.restaurants && 'restaurants',
    itinerary.events && 'events',
  ].filter(Boolean) as string[]

  const empty = revealed.length === 0
  const dest = state.destination

  return (
    <aside className="itinerary">
      <div className="it-top">
        <div>
          <div className="eyebrow">Your itinerary</div>
          <h2 className="it-title">{dest.charAt(0).toUpperCase() + dest.slice(1)}, {state.tripDays} days</h2>
        </div>
        {!empty && revealed.length < TOTAL_SLOTS && (
          <span className="it-progress">Drafting… {revealed.length}/{TOTAL_SLOTS}</span>
        )}
        {revealed.length >= TOTAL_SLOTS && (
          <span className="it-progress done"><CheckCircle size={17} />Ready</span>
        )}
      </div>

      {empty && (
        <div className="it-empty">
          <Map size={46} />
          <p>Your flights, stay, day plan, places to eat and events will appear here as TripCraft builds them.</p>
        </div>
      )}

      <AnimatePresence>
        {itinerary.flights && (
          <Section icon={<Plane size={18} />} title="Flights" source="Google Flights" color="p" key="flights">
            <motion.div
              className="card flight-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            >
              <FlightLegRow leg={itinerary.flights.out} dir="Outbound" />
              <div className="leg-div" />
              <FlightLegRow leg={itinerary.flights.ret} dir="Return" />
              <div className="card-foot">
                <span>{itinerary.flights.out.airline} · {itinerary.flights.cabin}</span>
                <span className="price">
                  <strong>£{(itinerary.flights.perPerson * state.travellers).toLocaleString()}</strong>
                  <small>£{itinerary.flights.perPerson} pp</small>
                </span>
              </div>
            </motion.div>
          </Section>
        )}

        {itinerary.hotel && (
          <Section icon={<Hotel size={18} />} title="Where you'll stay" source="Google Hotels" color="s" key="hotel" delay={80}>
            <motion.div
              className="card hotel-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }}
            >
              <div className="hotel-thumb"><Hotel size={34} /></div>
              <div className="hotel-body">
                <div className="hotel-top">
                  <strong>{itinerary.hotel.name}</strong>
                  <Stars rating={itinerary.hotel.rating} />
                </div>
                <div className="hotel-sub">{itinerary.hotel.area} · {itinerary.hotel.reviews.toLocaleString()} reviews</div>
                <p className="hotel-blurb">{itinerary.hotel.blurb}</p>
                <div className="tag-row">{itinerary.hotel.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                <div className="card-foot">
                  <span>£{itinerary.hotel.perNight}/night · {itinerary.hotel.nights} nights</span>
                  <span className="price"><strong>£{(itinerary.hotel.perNight * itinerary.hotel.nights).toLocaleString()}</strong></span>
                </div>
              </div>
            </motion.div>
          </Section>
        )}

        {itinerary.days && (
          <Section icon={<Map size={18} />} title="Day by day" source="TripAdvisor" color="t" key="days" delay={160}>
            <motion.div
              className="days"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {itinerary.days.map((d, idx) => (
                <motion.div
                  className="day"
                  key={d.n}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const, delay: idx * 0.08 }}
                >
                  <div className="day-head">
                    <span className="day-n">{d.n}</span>
                    <div><div className="day-title">{d.title}</div><div className="day-date">{d.date}</div></div>
                  </div>
                  <ul className="day-items">
                    {d.items.map((it, i) => (
                      <li key={i} className={it.added ? 'added' : ''}>
                        <span className="di-time">{it.time}</span>
                        <ArrowRight size={17} className="di-ico" />
                        <span>{it.text}{it.added && <span className="added-tag">added</span>}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {itinerary.restaurants && (
          <Section icon={<Utensils size={18} />} title="Where to eat" source="Yelp + TripAdvisor" color="p" key="restaurants" delay={240}>
            <motion.div
              className="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {itinerary.restaurants.map((r, i) => (
                <motion.div
                  className={`row-card${r.added ? ' added' : ''}`}
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 }}
                >
                  <div className="rc-main">
                    <div className="rc-top"><strong>{r.name}</strong>{r.added && <span className="added-tag">new</span>}</div>
                    <div className="rc-sub">{r.cuisine} · {r.price} · <span className="rc-src">{r.source}</span></div>
                    <p className="rc-note">{r.note}</p>
                  </div>
                  <Stars rating={r.rating} />
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {itinerary.events && (
          <Section icon={<Music2 size={18} />} title="On while you're there" source="Google Events" color="t" key="events" delay={320}>
            <motion.div
              className="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {itinerary.events.map((e, i) => (
                <motion.div
                  className="row-card"
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 }}
                >
                  <span className="ev-ico"><Music2 size={18} /></span>
                  <div className="rc-main">
                    <div className="rc-top"><strong>{e.name}</strong></div>
                    <div className="rc-sub">{e.date} · {e.where}</div>
                    <p className="rc-note">{e.note}</p>
                  </div>
                  <span className="ev-price">{e.price}</span>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {itinerary.car && (
          <Section icon={<Car size={18} />} title="Rental car" color="s" key="car" delay={400}>
            <motion.div
              className="card car-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            >
              <div className="rc-main">
                <div className="rc-top"><strong>{itinerary.car.name}</strong></div>
                <div className="rc-sub">{itinerary.car.cat}</div>
                <p className="rc-note">{itinerary.car.note}</p>
              </div>
              <span className="price"><strong>£{itinerary.car.perDay}</strong><small>{itinerary.car.days} day</small></span>
            </motion.div>
          </Section>
        )}

        {itinerary.budget && revealed.length >= TOTAL_SLOTS && (
          <Section icon={<ReceiptLong size={18} />} title="Budget" color="p" key="budget" delay={480}>
            <motion.div
              className="card budget-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
            >
              {itinerary.budget.lines.map((l, i) => (
                <div className="bl" key={i}>
                  <span className="bl-label">{l.label}<small>{l.detail}</small></span>
                  <span className="bl-amt">{l.amount === 0 ? 'Free' : `£${l.amount.toLocaleString()}`}</span>
                </div>
              ))}
              <div className="bl total">
                <span className="bl-label">Total for {state.travellers}</span>
                <span className="bl-amt">£{itinerary.budget.total.toLocaleString()}</span>
              </div>
              <div className={`budget-bar ${itinerary.budget.total <= state.budgetGbp ? '' : 'over'}`}>
                <motion.div
                  className="bb-fill"
                  initial={{ width: 0 }}
                  animate={{ width: Math.min(100, itinerary.budget.total / state.budgetGbp * 100) + '%' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.3 }}
                />
              </div>
              <div className="budget-msg">
                {itinerary.budget.total <= state.budgetGbp
                  ? <><CheckCircle size={16} />£{(state.budgetGbp - itinerary.budget.total).toLocaleString()} under your £{state.budgetGbp.toLocaleString()} budget</>
                  : <><span className="text-error">Over by £{(itinerary.budget.total - state.budgetGbp).toLocaleString()}</span></>}
              </div>
            </motion.div>
          </Section>
        )}
      </AnimatePresence>
    </aside>
  )
}
