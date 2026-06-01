// ItineraryPanel.jsx — persistent right-hand trip itinerary that fills in as the agent works.

function Stars({ rating }) {
  return (
    <span className="stars" title={rating + ' / 5'}>
      <span className="material-symbols-outlined filled">star</span>
      <strong>{rating.toFixed(1)}</strong>
    </span>
  );
}

function Section({ icon, title, source, color, children, delay }) {
  return (
    <section className="it-section" style={{ animationDelay: (delay || 0) + 'ms' }}>
      <div className="it-head">
        <span className={`it-ico ${color || ''}`}><span className="material-symbols-outlined">{icon}</span></span>
        <h3>{title}</h3>
        {source && <span className="it-source">via {source}</span>}
      </div>
      {children}
    </section>
  );
}

function FlightLeg({ leg, dir }) {
  return (
    <div className="leg">
      <div className="leg-dir">{dir}</div>
      <div className="leg-main">
        <div className="leg-times"><strong>{leg.dep}</strong><span className="leg-line"><span className="material-symbols-outlined">flight</span></span><strong>{leg.arr}</strong></div>
        <div className="leg-route">{leg.from} → {leg.to} · {leg.date}</div>
      </div>
      <div className="leg-meta"><span className="badge-soft">{leg.stops}</span><span className="leg-dur">{leg.dur}</span></div>
    </div>
  );
}

function ItineraryPanel({ reveal, flags, state, budget }) {
  const has = k => reveal.includes(k);
  const f = flags || {};
  const hotel = f.cheapHotel ? TRIP.hotelCheap : TRIP.hotel;

  // day data with flags applied
  let days = TRIP.days.map(d => ({ ...d, items: [...d.items] }));
  if (f.noSintra) {
    days[2] = { n: 3, date: 'Sun 14 Jun', title: 'Coast day in Cascais', items: [
      { time: '10:00', icon: 'train', text: 'Train down the Estoril line to Cascais' },
      { time: '12:00', icon: 'fort', text: 'Cidadela fort & the Boca do Inferno cliffs' },
      { time: '14:00', icon: 'restaurant', text: 'Lunch by the marina' },
    ] };
  }
  if (f.beach) {
    days[3] = { ...days[3], items: [...days[3].items, { time: '17:00', icon: 'beach_access', text: 'Beach afternoon at Costa da Caparica', added: true }] };
  }

  let restaurants = TRIP.restaurants;
  if (f.veg) {
    restaurants = [...TRIP.restaurants];
    restaurants[1] = { name: 'Ao 26 — Vegan Food Project', cuisine: 'Vegan Portuguese', price: '££', rating: 4.5, source: 'Yelp', note: 'Chiado favourite for plant-based seitan & desserts.', added: true };
  }

  const empty = reveal.length === 0;
  const totalSlots = 5; // flights, hotel, days, restaurants, events

  return (
    <aside className="itinerary">
      <div className="it-top">
        <div>
          <div className="eyebrow">Your itinerary</div>
          <h2 className="it-title">{(DESTINATIONS.find(d => d.id === state.destination) || {}).city}, {state.days} days</h2>
        </div>
        {!empty && reveal.length < totalSlots && <span className="it-progress">Drafting… {reveal.filter(k => ['flights','hotel','days','restaurants','events'].includes(k)).length}/{totalSlots}</span>}
        {reveal.length >= totalSlots && <span className="it-progress done"><span className="material-symbols-outlined">check_circle</span>Ready</span>}
      </div>

      {empty && (
        <div className="it-empty">
          <span className="material-symbols-outlined">map</span>
          <p>Your flights, stay, day plan, places to eat and events will appear here as Wayfare builds them.</p>
        </div>
      )}

      {has('flights') && (
        <Section icon="flight" title="Flights" source="Google Flights" color="p">
          <div className="card flight-card">
            <FlightLeg leg={TRIP.flights.out} dir="Outbound" />
            <div className="leg-div" />
            <FlightLeg leg={TRIP.flights.ret} dir="Return" />
            <div className="card-foot">
              <span>{TRIP.flights.airline} · {TRIP.flights.cabin}</span>
              <span className="price"><strong>£{(TRIP.flights.perPerson * state.travellers).toLocaleString()}</strong><small>£{TRIP.flights.perPerson} pp</small></span>
            </div>
          </div>
        </Section>
      )}

      {has('hotel') && (
        <Section icon="hotel" title="Where you’ll stay" source="Google Hotels" color="s">
          <div className="card hotel-card">
            <div className="hotel-thumb"><span className="material-symbols-outlined">apartment</span></div>
            <div className="hotel-body">
              <div className="hotel-top"><strong>{hotel.name}</strong><Stars rating={hotel.rating} /></div>
              <div className="hotel-sub">{hotel.area} · {hotel.reviews.toLocaleString()} reviews</div>
              <p className="hotel-blurb">{hotel.blurb}</p>
              <div className="tag-row">{hotel.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
              <div className="card-foot">
                <span>£{hotel.perNight}/night · {hotel.nights} nights</span>
                <span className="price"><strong>£{(hotel.perNight * hotel.nights).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </Section>
      )}

      {has('days') && (
        <Section icon="map" title="Day by day" source="TripAdvisor" color="t">
          <div className="days">
            {days.map(d => (
              <div className="day" key={d.n}>
                <div className="day-head"><span className="day-n">{d.n}</span><div><div className="day-title">{d.title}</div><div className="day-date">{d.date}</div></div></div>
                <ul className="day-items">
                  {d.items.map((it, i) => (
                    <li key={i} className={it.added ? 'added' : ''}>
                      <span className="di-time">{it.time}</span>
                      <span className="material-symbols-outlined di-ico">{it.icon}</span>
                      <span className="di-text">{it.text}{it.added && <span className="added-tag">added</span>}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {has('restaurants') && (
        <Section icon="restaurant" title="Where to eat" source="Yelp + TripAdvisor" color="p">
          <div className="list">
            {restaurants.map((r, i) => (
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

      {has('events') && (
        <Section icon="festival" title="On while you’re there" source="Google Events" color="t">
          <div className="list">
            {TRIP.events.map((e, i) => (
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

      {has('car') && f.car && (
        <Section icon="directions_car" title="Rental car" source="Google Search" color="s">
          <div className="card car-card">
            <div className="rc-main">
              <div className="rc-top"><strong>{TRIP.car.name}</strong></div>
              <div className="rc-sub">{TRIP.car.cat}</div>
              <p className="rc-note">{TRIP.car.note}</p>
            </div>
            <span className="price"><strong>£{TRIP.car.perDay}</strong><small>{TRIP.car.days} day</small></span>
          </div>
        </Section>
      )}

      {budget && reveal.length >= totalSlots && (
        <Section icon="receipt_long" title="Budget" color="p">
          <div className="card budget-card">
            {budget.lines.map((l, i) => (
              <div className="bl" key={i}><span className="bl-label">{l.label}<small>{l.detail}</small></span><span className="bl-amt">{l.amount === 0 ? 'Free' : '£' + l.amount.toLocaleString()}</span></div>
            ))}
            <div className="bl total"><span className="bl-label">Total for {state.travellers}</span><span className="bl-amt">£{budget.total.toLocaleString()}</span></div>
            <div className={`budget-bar ${budget.total <= state.budget ? 'under' : 'over'}`}>
              <div className="bb-fill" style={{ width: Math.min(100, budget.total / state.budget * 100) + '%' }} />
            </div>
            <div className="budget-msg">
              {budget.total <= state.budget
                ? <><span className="material-symbols-outlined">check_circle</span>£{(state.budget - budget.total).toLocaleString()} under your £{state.budget.toLocaleString()} budget</>
                : <><span className="material-symbols-outlined">error</span>£{(budget.total - state.budget).toLocaleString()} over budget</>}
            </div>
          </div>
        </Section>
      )}
    </aside>
  );
}

window.ItineraryPanel = ItineraryPanel;
