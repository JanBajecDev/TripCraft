// Chat.jsx — presentational chat panel. App drives streaming + itinerary updates.

function ToolRow({ api, label, status }) {
  return (
    <div className={`tool-row ${status}`}>
      <span className="tool-spin">
        {status === 'running'
          ? <span className="spinner" />
          : <span className="material-symbols-outlined">check</span>}
      </span>
      <span className="tool-text"><span className="tool-api">{api}</span>{label}</span>
    </div>
  );
}

function Block({ block, onSend, busy }) {
  if (block.type === 'text') {
    return <p className="msg-text">{block.text}{block.streaming && <span className="caret" />}</p>;
  }
  if (block.type === 'tool') {
    return <ToolRow api={block.api} label={block.label} status={block.status} />;
  }
  if (block.type === 'suggestions') {
    return (
      <div className="suggestions">
        {block.items.map(s => (
          <button key={s} type="button" className="suggest-chip" disabled={busy} onClick={() => onSend(s)}>{s}</button>
        ))}
      </div>
    );
  }
  return null;
}

function Message({ msg, onSend, busy }) {
  if (msg.role === 'user') {
    return (
      <div className="msg user">
        <div className="user-bubble">{msg.text}</div>
      </div>
    );
  }
  return (
    <div className="msg assistant">
      <div className="msg-avatar"><span className="material-symbols-outlined">explore</span></div>
      <div className="msg-body">
        {msg.blocks.map((b, i) => <Block key={i} block={b} onSend={onSend} busy={busy} />)}
      </div>
    </div>
  );
}

function Chat({ messages, busy, onSend, bubble }) {
  const [draft, setDraft] = React.useState('');
  const scrollRef = React.useRef(null);
  const taRef = React.useRef(null);
  const last = messages[messages.length - 1];
  const showThinking = busy && (!last || last.role === 'user' || (last.role === 'assistant' && last.blocks.length === 0));

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  function send(text) {
    const t = (text != null ? text : draft).trim();
    if (!t || busy) return;
    onSend(t);
    setDraft('');
    if (taRef.current) taRef.current.style.height = 'auto';
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function grow(e) {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  }

  return (
    <div className={`chat${bubble ? ' bubble' : ''}`}>
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {messages.map(m => <Message key={m.id} msg={m} onSend={send} busy={busy} />)}
          {showThinking && <div className="thinking"><span className="dot" /><span className="dot" /><span className="dot" /></div>}
        </div>
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            ref={taRef}
            rows={1}
            value={draft}
            placeholder={busy ? 'Wayfare is working…' : 'Ask for a change — “make day 3 slower”, “a dinner near the hotel”…'}
            onChange={grow}
            onKeyDown={onKey}
            disabled={busy}
          />
          <button type="button" className="send-btn" disabled={busy || !draft.trim()} onClick={() => send()} aria-label="Send">
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
        <p className="composer-note">Wayfare can plan, swap and re-cost in real time. Always confirm prices before booking.</p>
      </div>
    </div>
  );
}

window.Chat = Chat;
