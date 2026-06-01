import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { ItineraryState, FlightLeg, TripIntake, HotelOption } from '../../types'
import { Star as StarIcon, Map, Plane, Hotel, Utensils, Music2, Car, CheckCircle, ExternalLink, Receipt } from 'lucide-react'
import { DESTINATIONS } from '../../lib/constants'

function usePhoto(query: string | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!query) return
    fetch(`/api/photo?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then((d: { url: string | null }) => { if (d.url) setUrl(d.url) })
      .catch(() => {})
  }, [query])
  return url
}

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #1E7FA0, #88D2E7)',
  'linear-gradient(135deg, #3B6553, #7FA591)',
  'linear-gradient(135deg, #5A4884, #9688B4)',
  'linear-gradient(135deg, #B54708, #FDB022)',
  'linear-gradient(135deg, #027A48, #32D583)',
]

function Thumb({ url, label }: { url: string | null; label: string }) {
  const letter = label.trim()[0]?.toUpperCase() ?? '?'
  const gradient = THUMB_GRADIENTS[label.charCodeAt(0) % THUMB_GRADIENTS.length]
  return (
    <div style={{
      width: 72, height: 72, flexShrink: 0, borderRadius: 10, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: url ? 'transparent' : gradient,
    }}>
      {url
        ? <img src={url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: '#fff', fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-headline)' }}>{letter}</span>}
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" title={`${rating} / 5`}>
      <StarIcon size={16} className="fill-current" style={{ color: '#E8A33D' }} />
      <strong>{rating.toFixed(1)}</strong>
    </span>
  )
}

const ease = [0.22, 1, 0.36, 1] as const
const sectionTransition = { type: 'spring', stiffness: 380, damping: 28 } as const

function OptionNav({ idx, total, onPrev, onNext }: { idx: number; total: number; onPrev: () => void; onNext: () => void }) {
  if (total <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
      <button
        type="button" onClick={onPrev} disabled={idx === 0}
        style={{ width: 28, height: 28, border: '1px solid var(--outline-variant)', borderRadius: 6, background: 'var(--surface-bright)', color: 'var(--fg-2)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
      >‹</button>
      <span style={{ fontSize: 12, color: 'var(--fg-4)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}/{total}</span>
      <button
        type="button" onClick={onNext} disabled={idx === total - 1}
        style={{ width: 28, height: 28, border: '1px solid var(--outline-variant)', borderRadius: 6, background: 'var(--surface-bright)', color: 'var(--fg-2)', cursor: idx === total - 1 ? 'not-allowed' : 'pointer', opacity: idx === total - 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}
      >›</button>
    </div>
  )
}

function Section({ icon, title, source, color, children, delay = 0, nav }: {
  icon: React.ReactNode; title: string; source?: string; color?: string; children: React.ReactNode; delay?: number; nav?: React.ReactNode
}) {
  return (
    <motion.section
      className="it-section"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...sectionTransition, delay: delay / 1000 }}
    >
      <div className="it-head">
        <span className={`it-ico ${color ?? ''}`}>{icon}</span>
        <h3>{title}</h3>
        {source && <span className="it-source">via {source}</span>}
        {nav}
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

function googleSearch(q: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

function ExternalCard({ href, children, className = '', style }: { href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{ textDecoration: 'none', color: 'inherit', ...style }}
    >
      {children}
    </a>
  )
}

function HotelCard({ hotel }: { hotel: HotelOption }) {
  // Always fetch a Google Images fallback — used if the SerpAPI thumbnail is broken
  const fallbackPhoto = usePhoto(`${hotel.name} ${hotel.area} hotel`)
  const [imgSrc, setImgSrc] = useState<string | null>(hotel.thumbnail ?? fallbackPhoto)

  // When fallback arrives, use it if we have no src yet
  useEffect(() => {
    if (!imgSrc && fallbackPhoto) setImgSrc(fallbackPhoto)
  }, [fallbackPhoto, imgSrc])

  return (
    <ExternalCard href={hotel.link ?? googleSearch(`${hotel.name} ${hotel.area} hotel`)} className="card" style={{ overflow: 'hidden' } as React.CSSProperties}>
      <div style={{
        width: '100%', height: 180, overflow: 'hidden', flexShrink: 0,
        background: 'linear-gradient(135deg, color-mix(in srgb, #88D2E7 40%, #ECF2F5), #ECF2F5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-4)',
      }}>
        {imgSrc
          ? <img
              src={imgSrc}
              alt={hotel.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={() => {
                // Primary src broken — fall back to Google Images result
                if (fallbackPhoto && imgSrc !== fallbackPhoto) setImgSrc(fallbackPhoto)
                else setImgSrc(null)
              }}
            />
          : <Hotel size={40} style={{ opacity: 0.4 }} />}
      </div>
      {/* Content */}
      <div className="hotel-body">
        <div className="hotel-top">
          <strong>{hotel.name}</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Stars rating={hotel.rating} />
            <ExternalLink size={13} style={{ color: 'var(--fg-4)', flexShrink: 0 }} />
          </div>
        </div>
        <div className="hotel-sub">{hotel.area} · {hotel.reviews.toLocaleString()} reviews</div>
        <p className="hotel-blurb">{hotel.blurb}</p>
        <div className="tag-row">{hotel.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        <div className="card-foot" style={{ margin: '0 -16px' }}>
          <span>£{hotel.perNight}/night · {hotel.nights} nights</span>
          <span className="price"><strong>£{(hotel.perNight * hotel.nights).toLocaleString()}</strong></span>
        </div>
      </div>
    </ExternalCard>
  )
}

function RestaurantCard({ restaurant: r, index }: { restaurant: NonNullable<ItineraryState['restaurants']>[number]; index: number }) {
  const photo = usePhoto(`${r.name} restaurant food`)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease, delay: index * 0.06 }}>
      <ExternalCard href={r.link ?? googleSearch(`${r.name} restaurant`)} className={`row-card${r.added ? ' added' : ''} clickable`}>
        <Thumb url={photo} label={r.name} />
        <div className="rc-main">
          <div className="rc-top">
            <strong>{r.name}</strong>
            {r.added && <span className="added-tag">new</span>}
            <ExternalLink size={12} style={{ color: 'var(--fg-4)', marginLeft: 4 }} />
          </div>
          <div className="rc-sub">{r.cuisine} · {r.price} · <span className="rc-src">{r.source}</span></div>
          <p className="rc-note">{r.note}</p>
        </div>
        <Stars rating={r.rating} />
      </ExternalCard>
    </motion.div>
  )
}

function EventCard({ event: e, index }: { event: NonNullable<ItineraryState['events']>[number]; index: number }) {
  const photo = usePhoto(`${e.name} ${e.where}`)
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease, delay: index * 0.06 }}>
      <ExternalCard href={e.link ?? googleSearch(`${e.name} ${e.where}`)} className="row-card clickable">
        <Thumb url={photo} label={e.name} />
        <div className="rc-main">
          <div className="rc-top">
            <strong>{e.name}</strong>
            <ExternalLink size={12} style={{ color: 'var(--fg-4)', marginLeft: 4 }} />
          </div>
          <div className="rc-sub">{e.date} · {e.where}</div>
          <p className="rc-note">{e.note}</p>
        </div>
        <span className="ev-price">{e.price}</span>
      </ExternalCard>
    </motion.div>
  )
}

interface ItineraryPanelProps {
  itinerary: ItineraryState
  state: TripIntake
  onTotalChange?: (total: number) => void
}

const TOTAL_SLOTS = 5

export function ItineraryPanel({ itinerary, state, onTotalChange }: ItineraryPanelProps) {
  const [flightIdx, setFlightIdx] = useState(0)
  const [hotelIdx, setHotelIdx] = useState(0)

  // Recalculate total when selection changes
  useEffect(() => {
    if (!itinerary.budget) return
    const flightOpts = itinerary.flights?.options
    const hotelOpts = itinerary.hotel?.options
    if (!flightOpts && !hotelOpts) return

    const baseFlight = flightOpts?.[0]?.perPerson ?? 0
    const selFlight = flightOpts?.[flightIdx]?.perPerson ?? baseFlight
    const baseHotel = hotelOpts ? hotelOpts[0].perNight * hotelOpts[0].nights : 0
    const selHotel = hotelOpts ? hotelOpts[hotelIdx].perNight * hotelOpts[hotelIdx].nights : baseHotel

    const flightDelta = (selFlight - baseFlight) * state.travellers
    const hotelDelta = selHotel - baseHotel
    onTotalChange?.(itinerary.budget.total + flightDelta + hotelDelta)
  }, [flightIdx, hotelIdx, itinerary.flights, itinerary.hotel, itinerary.budget, state.travellers, onTotalChange])
  const revealed = [
    itinerary.flights && 'flights',
    itinerary.hotel && 'hotel',
    itinerary.days && 'days',
    itinerary.restaurants && 'restaurants',
    itinerary.events && 'events',
  ].filter(Boolean) as string[]

  const empty = revealed.length === 0
  const destData = DESTINATIONS.find(d => d.id === state.destination)
  const destName = destData?.city ?? (state.destination.charAt(0).toUpperCase() + state.destination.slice(1))

  return (
    <aside className="itinerary">
      {/* Destination hero photo */}
      {destData?.photo && !empty && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            margin: '-24px -24px 0',
            height: 160,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <img
            src={destData.photo}
            alt={destName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
          }} />
          <div style={{ position: 'absolute', bottom: 14, left: 20, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>Your itinerary</div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-headline)', lineHeight: 1.2 }}>{destName}, {state.tripDays} days</div>
          </div>
          {revealed.length >= TOTAL_SLOTS && (
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <span className="it-progress done"><CheckCircle size={17} />Ready</span>
            </div>
          )}
          {!empty && revealed.length < TOTAL_SLOTS && (
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <span className="it-progress">Drafting… {revealed.length}/{TOTAL_SLOTS}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Title row when no photo yet */}
      {(empty || !destData?.photo) && (
        <div className="it-top">
          <div>
            <div className="eyebrow">Your itinerary</div>
            <h2 className="it-title">{destName}, {state.tripDays} days</h2>
          </div>
          {revealed.length >= TOTAL_SLOTS && <span className="it-progress done"><CheckCircle size={17} />Ready</span>}
          {!empty && revealed.length < TOTAL_SLOTS && <span className="it-progress">Drafting… {revealed.length}/{TOTAL_SLOTS}</span>}
        </div>
      )}

      {empty && (
        <div className="it-empty">
          <Map size={46} />
          <p>Your flights, stay, day plan, places to eat and events will appear here as TripCraft builds them.</p>
        </div>
      )}

      <AnimatePresence>
        {itinerary.flights?.options?.length && (() => {
          const opts = itinerary.flights!.options
          const f = opts[flightIdx] ?? opts[0]
          return (
            <Section
              icon={<Plane size={18} />} title="Flights" source="Google Flights" color="p" key="flights"
              nav={<OptionNav idx={flightIdx} total={opts.length} onPrev={() => setFlightIdx(i => i - 1)} onNext={() => setFlightIdx(i => i + 1)} />}
            >
              <div className="card flight-card">
                <FlightLegRow leg={f.out} dir="Outbound" />
                <div className="leg-div" />
                <FlightLegRow leg={f.ret} dir="Return" />
                <div className="card-foot">
                  <span>{f.out.airline} · {f.cabin}</span>
                  <span className="price">
                    <strong>£{(f.perPerson * state.travellers).toLocaleString()}</strong>
                    <small>£{f.perPerson} pp</small>
                  </span>
                </div>
              </div>
            </Section>
          )
        })()}

        {itinerary.hotel?.options?.length && (() => {
          const opts = itinerary.hotel!.options
          const h = opts[hotelIdx] ?? opts[0]
          return (
            <Section
              icon={<Hotel size={18} />} title="Where you'll stay" source="Google Hotels" color="s" key="hotel" delay={80}
              nav={<OptionNav idx={hotelIdx} total={opts.length} onPrev={() => setHotelIdx(i => i - 1)} onNext={() => setHotelIdx(i => i + 1)} />}
            >
              <HotelCard key={h.name} hotel={h} />
            </Section>
          )
        })()}

        {itinerary.days && (
          <Section icon={<Map size={18} />} title="Day by day" source="TripAdvisor" color="t" key="days" delay={160}>
            <div className="days">
              {itinerary.days.map((d, idx) => (
                <motion.div
                  className="day" key={d.n}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease, delay: idx * 0.07 }}
                >
                  <div className="day-head">
                    <span className="day-n">{d.n}</span>
                    <div><div className="day-title">{d.title}</div><div className="day-date">{d.date}</div></div>
                  </div>
                  <ul className="day-items">
                    {d.items.map((it, i) => (
                      <li key={i} className={it.added ? 'added' : ''}>
                        <span className="di-time">{it.time}</span>
                        <span className="material-symbols-outlined di-ico">{it.icon}</span>
                        <span>{it.text}{it.added && <span className="added-tag">added</span>}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {itinerary.restaurants && (
          <Section icon={<Utensils size={18} />} title="Where to eat" source="Yelp + TripAdvisor" color="p" key="restaurants" delay={240}>
            <div className="list">
              {itinerary.restaurants.map((r, i) => (
                <RestaurantCard key={i} restaurant={r} index={i} />
              ))}
            </div>
          </Section>
        )}

        {itinerary.events && (
          <Section icon={<Music2 size={18} />} title="On while you're there" source="Google Events" color="t" key="events" delay={320}>
            <div className="list">
              {itinerary.events.map((e, i) => (
                <EventCard key={i} event={e} index={i} />
              ))}
            </div>
          </Section>
        )}

        {itinerary.car && (
          <Section icon={<Car size={18} />} title="Rental car" color="s" key="car" delay={400}>
            <div className="card car-card">
              <div className="rc-main">
                <div className="rc-top"><strong>{itinerary.car.name}</strong></div>
                <div className="rc-sub">{itinerary.car.cat}</div>
                <p className="rc-note">{itinerary.car.note}</p>
              </div>
              <span className="price"><strong>£{itinerary.car.perDay}</strong><small>{itinerary.car.days} day</small></span>
            </div>
          </Section>
        )}

        {itinerary.budget && revealed.length >= TOTAL_SLOTS && (
          <Section icon={<Receipt size={18} />} title="Budget" color="p" key="budget" delay={480}>
            <div className="card budget-card">
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
                <div className="bb-fill" style={{ width: Math.min(100, itinerary.budget.total / state.budgetGbp * 100) + '%' }} />
              </div>
              <div className="budget-msg">
                {itinerary.budget.total <= state.budgetGbp
                  ? <><CheckCircle size={16} />£{(state.budgetGbp - itinerary.budget.total).toLocaleString()} under your £{state.budgetGbp.toLocaleString()} budget</>
                  : <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>£{(itinerary.budget.total - state.budgetGbp).toLocaleString()} over budget</>}
              </div>
            </div>
          </Section>
        )}
      </AnimatePresence>
    </aside>
  )
}
