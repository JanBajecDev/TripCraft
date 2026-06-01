import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Bot, ArrowUp } from 'lucide-react'
import { TOOL_LABELS, TOOL_PHRASES, BETWEEN_TOOL_PHRASES } from '../../lib/constants'
import type { ChatMessage, Block } from '../../types'

const springTransition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
} as const

function useStatusText(activeBlocks: Block[], busy: boolean): string | null {
  const [idx, setIdx] = useState(0)

  const running = activeBlocks.findLast(b => b.type === 'tool' && b.status === 'running')
  const toolName = running?.type === 'tool' ? running.toolName : null
  const hasText = activeBlocks.some(b => b.type === 'text')

  const phrases: string[] | null = !busy
    ? null
    : hasText
      ? null
      : toolName
        ? (TOOL_PHRASES[toolName] ?? ['Searching…'])
        : BETWEEN_TOOL_PHRASES

  const prevPhrases = useRef(phrases)
  useEffect(() => {
    if (prevPhrases.current !== phrases) {
      setIdx(0)
      prevPhrases.current = phrases
    }
  }, [phrases])

  useEffect(() => {
    if (!phrases) return
    const timer = setInterval(() => setIdx(i => i + 1), 2200)
    return () => clearInterval(timer)
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

function ToolRow({ toolName, detail, status }: { toolName: string; detail?: string; status: 'running' | 'done' }) {
  const label = TOOL_LABELS[toolName] ?? toolName

  return (
    <motion.div
      className={`tool-row ${status}`}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springTransition}
      layout
    >
      <span className="tool-spin">
        {status === 'running'
          ? <motion.span
              className="spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
            />
          : <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={springTransition}
            >
              <Check size={16} />
            </motion.span>}
      </span>
      <span className="tool-text">
        <span className="tool-api">{label}</span>
        {detail ?? (status === 'running' ? 'Searching…' : 'Done')}
      </span>
    </motion.div>
  )
}

function BlockRenderer({ block, onSend, busy }: { block: Block; onSend: (text: string) => void; busy: boolean }) {
  if (block.type === 'text') {
    return <p className="msg-text">{block.text}{block.streaming && <span className="caret" />}</p>
  }

  if (block.type === 'tool') {
    return <ToolRow toolName={block.toolName} detail={block.detail} status={block.status} />
  }

  if (block.type === 'suggestions') {
    return (
      <motion.div
        className="suggestions"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {block.items.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            className="suggest-chip"
            disabled={busy}
            onClick={() => onSend(s)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
          >
            {s}
          </motion.button>
        ))}
      </motion.div>
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

const messageVariants = {
  user: {
    hidden: { opacity: 0, x: 24, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
  },
  assistant: {
    hidden: { opacity: 0, x: -20, scale: 0.97 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  },
}

export function Chat({ messages, activeBlocks, busy, onSend }: ChatProps) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const statusText = useStatusText(activeBlocks, busy)
  const showThinking = busy && activeBlocks.length === 0

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, activeBlocks, busy])

  function send(text?: string) {
    const value = (text != null ? text : draft).trim()
    if (!value || busy) return
    onSend(value)
    setDraft('')
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  function grow(e: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          <AnimatePresence initial={false}>
            {messages.map(m => {
              if (m.role === 'user') {
                return (
                  <motion.div
                    key={m.id}
                    className="msg user"
                    variants={messageVariants.user}
                    initial="hidden"
                    animate="visible"
                    layout
                  >
                    <div className="user-bubble">{m.text}</div>
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={m.id}
                  className="msg assistant"
                  variants={messageVariants.assistant}
                  initial="hidden"
                  animate="visible"
                  layout
                >
                  <div className="msg-avatar"><Bot size={20} /></div>
                  <div className="msg-body">
                    {m.blocks.map((block, i) => (
                      <BlockRenderer key={i} block={block} onSend={send} busy={busy} />
                    ))}
                  </div>
                </motion.div>
              )
            })}

            {(showThinking || activeBlocks.length > 0) && (
              <motion.div
                key="in-flight"
                className="msg assistant"
                variants={messageVariants.assistant}
                initial="hidden"
                animate="visible"
                layout
              >
                <div className="msg-avatar"><Bot size={20} /></div>
                <div className="msg-body">
                  {statusText && <StatusLine text={statusText} />}
                  {showThinking && (
                    <div className="thinking">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="dot"
                          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.4, 1, 0.4] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {activeBlocks.map((block, i) => (
                    <BlockRenderer key={i} block={block} onSend={send} busy={busy} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          <motion.button
            type="button"
            className="send-btn"
            disabled={busy || !draft.trim()}
            onClick={() => send()}
            aria-label="Send"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <ArrowUp size={20} />
          </motion.button>
        </div>
        <p className="composer-note">TripCraft can plan, swap and re-cost in real time. Always confirm prices before booking.</p>
      </div>
    </div>
  )
}
