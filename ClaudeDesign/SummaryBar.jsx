// SummaryBar.jsx — sticky top bar: logo, editable trip chips, theme toggle, book CTA.

function useOutside(ref, onClose) {
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
}

function Chip({ icon, label, value, children }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  useOutside(ref, () => setOpen(false));
  return (
    <div className="sum-chip-wrap" ref={ref}>
      <button type="button" className={`sum-chip${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="sum-chip-text"><span className="sum-chip-label">{label}</span><span className="sum-chip-value">{value}</span></span>
        {children && <span className="material-symbols-outlined caret">expand_more</span>}
      </button>
      {open && children && <div className="sum-pop" onClick={e => e.stopPropagation()}>{children}</div>}
    </div>
  );
}

function SummaryBar({ state, set, theme, onToggleTheme, tripReady, total, onBook, booked }) {
  const dest = DESTINATIONS.find(d => d.id === state.destination) || DESTINATIONS[0];
  const dateVal = state.dateMode === 'exact' ? state.dateExact : `Flexible · ${state.dateMonth}`;

  return (
    <header className="sum-bar glass-panel">
      <div className="brand">
        <span className="brand-mark"><span className="material-symbols-outlined">explore</span></span>
        <span className="brand-name">Wayfare</span>
      </div>

      <div className="sum-chips">
        <Chip icon="my_location" label="From" value={state.origin}>
          <div className="pop-title">Flying from</div>
          <div className="pop-list">
            {ORIGINS.map(o => (
              <button key={o} type="button" className={`pop-opt${state.origin === o ? ' on' : ''}`} onClick={() => set({ origin: o })}>
                {o}{state.origin === o && <span className="material-symbols-outlined">check</span>}
              </button>
            ))}
          </div>
        </Chip>

        <span className="sum-arrow material-symbols-outlined">arrow_right_alt</span>

        <Chip icon="place" label="To" value={`${dest.city}`}>
          <div className="pop-title">Destination</div>
          <div className="pop-list">
            {DESTINATIONS.map(d => (
              <button key={d.id} type="button" className={`pop-opt${state.destination === d.id ? ' on' : ''}`} onClick={() => set({ destination: d.id })}>
                {d.city}, {d.country}{state.destination === d.id && <span className="material-symbols-outlined">check</span>}
              </button>
            ))}
          </div>
        </Chip>

        <Chip icon="calendar_month" label="Dates" value={dateVal}>
          <div className="pop-title">When</div>
          <div className="seg-group pop-seg">
            <button type="button" className={`seg${state.dateMode === 'exact' ? ' on' : ''}`} onClick={() => set({ dateMode: 'exact' })}>Exact</button>
            <button type="button" className={`seg${state.dateMode === 'flexible' ? ' on' : ''}`} onClick={() => set({ dateMode: 'flexible' })}>Flexible</button>
          </div>
          <div className="pop-hint">{state.dateMode === 'exact' ? state.dateExact : `Cheapest stretch in ${state.dateMonth}`}</div>
        </Chip>

        <Chip icon="group" label="Travellers" value={`${state.travellers} ${state.travellers === 1 ? 'person' : 'people'}`}>
          <div className="pop-title">Travellers</div>
          <Stepper value={state.travellers} min={1} max={8} suffix={state.travellers === 1 ? ' person' : ' people'} onChange={v => set({ travellers: v })} />
        </Chip>

        <Chip icon="payments" label="Budget" value={`£${state.budget.toLocaleString()}`}>
          <div className="pop-title">Total budget</div>
          <div className="budget-value sm">£{state.budget.toLocaleString()}</div>
          <input type="range" min="800" max="6000" step="100" value={state.budget} onChange={e => set({ budget: +e.target.value })} className="budget-range" style={{ '--pct': ((state.budget - 800) / (6000 - 800) * 100) + '%' }} />
        </Chip>
      </div>

      <div className="sum-actions">
        <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle theme">
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button type="button" className={`btn-primary book${booked ? ' booked' : ''}`} disabled={!tripReady} onClick={onBook}>
          {booked
            ? <><span className="material-symbols-outlined">check_circle</span>Trip booked</>
            : <><span className="material-symbols-outlined">luggage</span>Book this trip{tripReady ? ` · £${total.toLocaleString()}` : ''}</>}
        </button>
      </div>
    </header>
  );
}

window.SummaryBar = SummaryBar;
