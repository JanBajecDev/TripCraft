import { useState, useRef, useEffect } from 'react'
import { Check, Bot, ArrowUp } from 'lucide-react'
import { TOOL_LABELS } from '../../lib/constants'
import type { ChatMessage, Block } from '../../types'

function ToolRow({ toolName, status }: { toolName: string; status: 'running' | 'done' }) {
  const label = TOOL_LABELS[toolName] ?? toolName
  return (
    <div className={`tool-row ${status}`}>
      <span className="tool-spin">
        {status === 'running'
          ? <span className="spinner" />
          : <Check size={18} className="text-success" />}
      </span>
      <span className="tool-text">
        <span className="tool-api">{label}</span>
        {status === 'running' ? 'Searching…' : 'Done'}
      </span>
    </div>
  )
}

function BlockRenderer({ block, onSend, busy }: { block: Block; onSend: (text: string) => void; busy: boolean }) {
  if (block.type === 'text') {
    return <p className="msg-text">{block.text}{block.streaming && <span className="caret" />}</p>
  }
  if (block.type === 'tool') {
    return <ToolRow toolName={block.toolName} status={block.status} />
  }
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

  const showThinking = busy && activeBlocks.length === 0

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
                  {m.blocks.map((b, i) => <BlockRenderer key={i} block={b} onSend={send} busy={busy} />)}
                </div>
              </div>
            )
          })}

          {/* In-flight assistant message */}
          {(activeBlocks.length > 0 || showThinking) && (
            <div className="msg assistant">
              <div className="msg-avatar"><Bot size={20} /></div>
              <div className="msg-body">
                {showThinking && (
                  <div className="thinking"><span className="dot" /><span className="dot" /><span className="dot" /></div>
                )}
                {activeBlocks.map((b, i) => <BlockRenderer key={i} block={b} onSend={send} busy={busy} />)}
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
