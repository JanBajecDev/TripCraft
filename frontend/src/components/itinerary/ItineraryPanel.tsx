import type { ItineraryState, FlightLeg, TripIntake } from '../../types'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" title={`${rating} / 5`}>
      <span className="material-symbols-outlined filled">star</span>
      <strong>{rating.toFixed(1)}</strong>
    </span>
  )
}

function Section({ icon, title, source, color, children, delay = 0 }: {
  icon: string; title: string; source?: string; color?: string; children: React.ReactNode; delay?: number
}) {
  return (
    <section className="it-section" style={{ animationDelay: delay + 'ms' }}>
      <div className="it-head">
        <span className={`it-ico ${color ?? ''}`}><span className="material-symbols-outlined">{icon}</span></span>
        <h3>{title}</h3>
        {source && <span className="it-source">via {source}</span>}
      </div>
      {children}
    </section>
  )
}

function FlightLegRow({ leg, dir }: { leg: FlightLeg; dir: string }) {
  return (
    <div className="leg">
      <div className="leg-dir">{dir}</div>
      <div className="leg-main">
        <div className="leg-times">
          <strong>{leg.dep}</strong>
          <span className="leg-line"><span className="material-symbols-outlined">flight</span></span>
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
          <span className="it-progress done"><span className="material-symbols-outlined">check_circle</span>Ready</span>
        )}
      </div>

      {empty && (
        <div className="it-empty">
          <span className="material-symbols-outlined">map</span>
          <p>Your flights, stay, day plan, places to eat and events will appear here as TripCraft builds them.</p>
        </div>
      )}

      {itinerary.flights && (
        <Section icon="flight" title="Flights" source="Google Flights" color="p">
          <div className="card flight-card">
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
          </div>
        </Section>
      )}

      {itinerary.hotel && (
        <Section icon="hotel" title="Where you'll stay" source="Google Hotels" color="s">
          <div className="card hotel-card">
            <div className="hotel-thumb"><span className="material-symbols-outlined">apartment</span></div>
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
          </div>
        </Section>
      )}

      {itinerary.days && (
        <Section icon="map" title="Day by day" source="TripAdvisor" color="t">
          <div className="days">
            {itinerary.days.map(d => (
              <div className="day" key={d.n}>
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
              </div>
            ))}
          </div>
        </Section>
      )}

      {itinerary.restaurants && (
        <Section icon="restaurant" title="Where to eat" source="Yelp + TripAdvisor" color="p">
          <div className="list">
            {itinerary.restaurants.map((r, i) => (
              <div className={`row-card${r.added ? ' added' : ''}`} key={i}>
                <div className="rc-main">
                  <div className="rc-top"><strong>{r.name}</strong>{r.added && <span className="added-tag">new</span>}</div>
                  <div className="rc-sub">{r.cuisine} · {r.price} · <span className="rc-src">{r.source}</span></div>
                  <p className="rc-note">{r.note}</p>
                </div>
                <Stars rating={r.rating} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {itinerary.events && (
        <Section icon="festival" title="On while you're there" source="Google Events" color="t">
          <div className="list">
            {itinerary.events.map((e, i) => (
              <div className="row-card" key={i}>
                <span className="ev-ico"><span className="material-symbols-outlined">{e.icon}</span></span>
                <div className="rc-main">
                  <div className="rc-top"><strong>{e.name}</strong></div>
                  <div className="rc-sub">{e.date} · {e.where}</div>
                  <p className="rc-note">{e.note}</p>
                </div>
                <span className="ev-price">{e.price}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {itinerary.car && (
        <Section icon="directions_car" title="Rental car" color="s">
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
        <Section icon="receipt_long" title="Budget" color="p">
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
                ? <><span className="material-symbols-outlined">check_circle</span>£{(state.budgetGbp - itinerary.budget.total).toLocaleString()} under your £{state.budgetGbp.toLocaleString()} budget</>
                : <><span className="material-symbols-outlined">error</span>£{(itinerary.budget.total - state.budgetGbp).toLocaleString()} over budget</>}
            </div>
          </div>
        </Section>
      )}
    </aside>
  )
}
