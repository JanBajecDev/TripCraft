import { useState, useRef, useEffect } from 'react'
import { Bot, ArrowUp } from 'lucide-react'
import { TOOL_PHRASES, BETWEEN_TOOL_PHRASES } from '../../lib/constants'
import type { ChatMessage, Block } from '../../types'

function useStatusText(activeBlocks: Block[], busy: boolean): string | null {
  const [idx, setIdx] = useState(0)

  // Which phrase pool are we in right now?
  const running = activeBlocks.findLast(b => b.type === 'tool' && b.status === 'running')
  const toolName = running?.type === 'tool' ? running.toolName : null
  const hasText = activeBlocks.some(b => b.type === 'text')
  const doneCounts = activeBlocks.filter(b => b.type === 'tool' && b.status === 'done').length

  const phrases: string[] | null = !busy ? null
    : hasText ? null
    : toolName ? (TOOL_PHRASES[toolName] ?? [`Searching…`])
    : BETWEEN_TOOL_PHRASES

  // Reset index when the pool changes (new tool started etc)
  const prevPhrases = useRef(phrases)
  useEffect(() => {
    if (prevPhrases.current !== phrases) {
      setIdx(0)
      prevPhrases.current = phrases
    }
  })

  // Cycle every 2.2 seconds
  useEffect(() => {
    if (!phrases) return
    const t = setInterval(() => setIdx(i => i + 1), 2200)
    return () => clearInterval(t)
  }, [phrases])

  if (!phrases) return null
  return phrases[idx % phrases.length]
}

function StatusLine({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span className="spinner" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 14, color: 'var(--fg-3)' }}>{text}</span>
    </div>
  )
}

function BlockRenderer({ block, onSend, busy }: { block: Block; onSend: (text: string) => void; busy: boolean }) {
  if (block.type === 'text') {
    return <p className="msg-text">{block.text}{block.streaming && <span className="caret" />}</p>
  }
  // tool blocks are never rendered individually — see StatusLine above
  if (block.type === 'suggestions') {
    return (
      <div className="suggestions">
        {block.items.map(s => (
          <button key={s} type="button" className="suggest-chip" disabled={busy} onClick={() => onSend(s)}>{s}</button>
        ))}
      </div>
    )
  }
  return null
}

interface ChatProps {
  messages: ChatMessage[]
  activeBlocks: Block[]
  busy: boolean
  onSend: (text: string) => void
}

export function Chat({ messages, activeBlocks, busy, onSend }: ChatProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const statusText = useStatusText(activeBlocks, busy)
  const visibleBlocks = activeBlocks.filter(b => b.type !== 'tool')

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, activeBlocks, busy])

  function send(text?: string) {
    const t = (text != null ? text : draft).trim()
    if (!t || busy) return
    onSend(t)
    setDraft('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function grow(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {messages.map(m => {
            if (m.role === 'user') {
              return (
                <div key={m.id} className="msg user">
                  <div className="user-bubble">{m.text}</div>
                </div>
              )
            }
            return (
              <div key={m.id} className="msg assistant">
                <div className="msg-avatar"><Bot size={20} /></div>
                <div className="msg-body">
                  {m.blocks.filter(b => b.type !== 'tool').map((b, i) => (
                    <BlockRenderer key={i} block={b} onSend={send} busy={busy} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* In-flight assistant message */}
          {(visibleBlocks.length > 0 || statusText) && (
            <div className="msg assistant">
              <div className="msg-avatar"><Bot size={20} /></div>
              <div className="msg-body">
                {statusText && <StatusLine text={statusText} />}
                {visibleBlocks.map((b, i) => (
                  <BlockRenderer key={i} block={b} onSend={send} busy={busy} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            ref={taRef}
            rows={1}
            value={draft}
            placeholder={busy ? 'TripCraft is working…' : 'Ask for a change — "make day 3 slower", "add a beach afternoon"…'}
            onChange={grow}
            onKeyDown={onKey}
            disabled={busy}
          />
          <button type="button" className="send-btn" disabled={busy || !draft.trim()} onClick={() => send()} aria-label="Send">
            <ArrowUp size={20} />
          </button>
        </div>
        <p className="composer-note">TripCraft can plan, swap and re-cost in real time. Always confirm prices before booking.</p>
      </div>
    </div>
  )
}
