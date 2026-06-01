import { useState, useCallback, useRef, useEffect } from 'react'
import { SummaryBar } from '../components/summary/SummaryBar'
import { Chat } from '../components/chat/Chat'
import { ItineraryPanel } from '../components/itinerary/ItineraryPanel'
import { useAgentStream, appendTextDelta, addToolBlock, markToolDone, markStreamingDone } from '../hooks/useAgentStream'
import { diffIntake } from '../lib/diffIntake'
import type { TripIntake, ItineraryState, ChatMessage, Block } from '../types'

interface PlanningPageProps {
  tripId: string
  intake: TripIntake
  setIntake: (partial: Partial<TripIntake>) => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  initialMessage: string
}

export function PlanningPage({ tripId, intake, setIntake, theme, onToggleTheme, initialMessage }: PlanningPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeBlocks, setActiveBlocks] = useState<Block[]>([])
  const [itinerary, setItinerary] = useState<ItineraryState>({})
  const [busy, setBusy] = useState(false)
  const [booked, setBooked] = useState(false)
  const [displayTotal, setDisplayTotal] = useState<number | null>(null)
  const sentInitial = useRef(false)
  const prevIntakeRef = useRef<TripIntake>(intake)
  const userChangedRef = useRef(false)
  const pendingChangeRef = useRef<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const userSetIntake = useCallback((partial: Partial<TripIntake>) => {
    userChangedRef.current = true
    setIntake(partial)
  }, [setIntake])

  const total = displayTotal ?? itinerary.budget?.total ?? 0

  const callbacks = useCallback(() => ({
    onTextDelta: (delta: string) => {
      setActiveBlocks(prev => appendTextDelta(prev, delta))
    },
    onToolStart: (toolName: string, detail?: string) => {
      setActiveBlocks(prev => addToolBlock(prev, toolName, detail))
    },
    onToolDone: (toolName: string) => {
      setActiveBlocks(prev => markToolDone(prev, toolName))
    },
    onItineraryUpdate: (section: string, data: unknown) => {
      setItinerary(prev => ({ ...prev, [section]: data }))
    },
    onSuggestions: (items: string[]) => {
      setActiveBlocks(prev => [...prev, { type: 'suggestions' as const, items }])
    },
    onDone: () => {
      setActiveBlocks(prev => {
        const committed = markStreamingDone(prev)
        const id = crypto.randomUUID()
        setMessages(msgs => [...msgs, { id, role: 'assistant', blocks: committed }])
        return []
      })
      setBusy(false)
      if (pendingChangeRef.current) {
        const msg = pendingChangeRef.current
        pendingChangeRef.current = null
        setTimeout(() => {
          setItinerary({})
          handleSend(msg)
        }, 100)
      }
    },
    onError: (message: string) => {
      console.error('Agent error:', message)
    },
  }), [])

  // Stable callbacks ref to avoid recreating useAgentStream on every render
  const callbacksRef = useRef(callbacks())
  callbacksRef.current = callbacks()

  const stableCallbacks = useCallback(() => ({
    onTextDelta: (d: string) => callbacksRef.current.onTextDelta(d),
    onToolStart: (t: string) => callbacksRef.current.onToolStart(t),
    onToolDone: (t: string) => callbacksRef.current.onToolDone(t),
    onItineraryUpdate: (s: string, d: unknown) => callbacksRef.current.onItineraryUpdate(s, d),
    onSuggestions: (items: string[]) => callbacksRef.current.onSuggestions(items),
    onDone: () => callbacksRef.current.onDone(),
    onError: (m: string) => callbacksRef.current.onError(m),
  }), [])

  const { send: streamSend } = useAgentStream(tripId, stableCallbacks())

  function handleSend(text: string) {
    if (busy) return
    setBusy(true)
    setActiveBlocks([])
    const id = crypto.randomUUID()
    setMessages(prev => [...prev, { id, role: 'user', text }])
    streamSend(text)
  }

  // Auto-send the initial message after mount
  useEffect(() => {
    if (sentInitial.current) return
    sentInitial.current = true
    handleSend(initialMessage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!userChangedRef.current) {
      prevIntakeRef.current = intake
      return
    }

    if (Object.keys(itinerary).length === 0) {
      prevIntakeRef.current = intake
      return
    }

    if (busy) {
      const diff = diffIntake(prevIntakeRef.current, intake)
      if (diff) pendingChangeRef.current = diff
      prevIntakeRef.current = intake
      userChangedRef.current = false
      return
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    debounceTimerRef.current = setTimeout(() => {
      const diff = diffIntake(prevIntakeRef.current, intake)
      prevIntakeRef.current = intake
      userChangedRef.current = false

      if (diff) {
        setItinerary({})
        handleSend(diff)
      }
    }, 500)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [intake]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <SummaryBar
        state={intake}
        set={userSetIntake}
        theme={theme}
        onToggleTheme={onToggleTheme}
        tripReady={Object.keys(itinerary).length > 0}
        total={total}
        onBook={() => setBooked(true)}
        booked={booked}
      />
      <div className="workspace">
        <Chat messages={messages} activeBlocks={activeBlocks} busy={busy} onSend={handleSend} />
        <ItineraryPanel itinerary={itinerary} state={intake} onTotalChange={setDisplayTotal} />
      </div>
    </div>
  )
}
