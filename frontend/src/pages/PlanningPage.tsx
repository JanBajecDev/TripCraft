import { useState, useCallback, useRef, useEffect } from 'react'
import { SummaryBar } from '../components/summary/SummaryBar'
import { Chat } from '../components/chat/Chat'
import { ItineraryPanel } from '../components/itinerary/ItineraryPanel'
import {
  useAgentStream,
  createAssistantMessage,
  appendTextDeltaToMessage,
  addToolBlockToMessage,
  markToolDoneForMessage,
  markStreamingDoneForMessage,
} from '../hooks/useAgentStream'
import { diffIntake } from '../lib/diffIntake'
import { fetchDestinations } from '../lib/api'
import type { CityItem } from '../components/intake/CitySearch'
import { DESTINATIONS as FALLBACK_DESTINATIONS, ORIGINS as FALLBACK_ORIGINS } from '../lib/constants'
import type { AssistantMessage, TripIntake, ItineraryState, ChatMessage } from '../types'

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
  const [liveMessage, setLiveMessage] = useState<AssistantMessage | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryState>({})
  const [streamItinerary, setStreamItinerary] = useState<ItineraryState>({})
  const [busy, setBusy] = useState(false)
  const [booked, setBooked] = useState(false)
  const [displayTotal, setDisplayTotal] = useState<number | null>(null)
  const busyRef = useRef(false)
  const sentInitial = useRef(false)
  const prevIntakeRef = useRef<TripIntake>(intake)
  const userChangedRef = useRef(false)
  const pendingChangeRef = useRef<string | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamItineraryRef = useRef<ItineraryState>({})
  const liveMessageRef = useRef<AssistantMessage | null>(null)
  const liveMessageIdRef = useRef<string | null>(null)

  const [origins, setOrigins] = useState<CityItem[]>(
    FALLBACK_ORIGINS.map(o => ({ id: `origin-${o.toLowerCase()}`, city: o, country: null, code: '', note: null }))
  )
  const [destinations, setDestinations] = useState<CityItem[]>(
    FALLBACK_DESTINATIONS.map(d => ({ id: d.id, city: d.city, country: d.country, code: d.code, note: d.note }))
  )

  useEffect(() => {
    fetchDestinations('origin')
      .then(data => setOrigins(data.map(d => ({ id: d.id, city: d.city, country: d.country, code: d.code, note: d.note }))))
      .catch(() => {})
    fetchDestinations('destination')
      .then(data => setDestinations(data.map(d => ({ id: d.id, city: d.city, country: d.country ?? '', code: d.code, note: d.note ?? '' }))))
      .catch(() => {})
  }, [])

  const userSetIntake = useCallback((partial: Partial<TripIntake>) => {
    userChangedRef.current = true
    setIntake(partial)
  }, [setIntake])

  const visibleItinerary = Object.keys(itinerary).length > 0 ? itinerary : streamItinerary
  const total = displayTotal ?? visibleItinerary.budget?.total ?? 0

  function syncLiveMessage(updater: (current: AssistantMessage | null) => AssistantMessage | null) {
    setLiveMessage(prev => {
      const next = updater(prev)
      liveMessageRef.current = next
      return next
    })
  }

  const callbacks = {
    onTextDelta: (delta: string) => {
      syncLiveMessage(prev => appendTextDeltaToMessage(
        prev ?? createAssistantMessage(liveMessageIdRef.current ?? crypto.randomUUID()),
        delta,
      ))
    },
    onToolStart: (toolName: string, detail?: string) => {
      syncLiveMessage(prev => addToolBlockToMessage(
        prev ?? createAssistantMessage(liveMessageIdRef.current ?? crypto.randomUUID()),
        toolName,
        detail,
      ))
    },
    onToolDone: (toolName: string) => {
      syncLiveMessage(prev => markToolDoneForMessage(
        prev ?? createAssistantMessage(liveMessageIdRef.current ?? crypto.randomUUID()),
        toolName,
      ))
    },
    onItineraryUpdate: (section: string, data: unknown) => {
      setStreamItinerary(prev => {
        const next = { ...prev, [section]: data }
        streamItineraryRef.current = next
        return next
      })
    },
    onSuggestions: (items: string[]) => {
      syncLiveMessage(prev => {
        const base = prev ?? createAssistantMessage(liveMessageIdRef.current ?? crypto.randomUUID())
        return { ...base, blocks: [...base.blocks, { type: 'suggestions' as const, items }] }
      })
    },
    onDone: () => {
      const completed = liveMessageRef.current ? markStreamingDoneForMessage(liveMessageRef.current) : null
      if (completed && completed.blocks.length > 0) {
        setMessages(msgs => [...msgs, completed])
      }
      liveMessageRef.current = null
      liveMessageIdRef.current = null
      setLiveMessage(null)
      const completedItinerary = streamItineraryRef.current
      if (Object.keys(completedItinerary).length > 0) {
        setItinerary(completedItinerary)
      }
      streamItineraryRef.current = {}
      setStreamItinerary({})
      setBusy(false)
      busyRef.current = false
      if (pendingChangeRef.current) {
        const msg = pendingChangeRef.current
        pendingChangeRef.current = null
        setTimeout(() => {
          handleSend(msg)
        }, 100)
      }
    },
    onError: (message: string) => {
      console.error('Agent error:', message)
      liveMessageRef.current = null
      liveMessageIdRef.current = null
      setLiveMessage(null)
      setBusy(false)
      busyRef.current = false
    },
  }

  const { send: streamSend } = useAgentStream(tripId, callbacks)

  function handleSend(text: string) {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    streamItineraryRef.current = {}
    setStreamItinerary({})
    const id = crypto.randomUUID()
    setMessages(prev => [...prev, { id, role: 'user', text }])
    const assistantId = crypto.randomUUID()
    liveMessageIdRef.current = assistantId
    const assistantMessage = createAssistantMessage(assistantId)
    liveMessageRef.current = assistantMessage
    setLiveMessage(assistantMessage)
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

    if (busyRef.current) {
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
        origins={origins}
        destinations={destinations}
      />
      <div className="workspace">
        <Chat messages={messages} liveMessage={liveMessage} busy={busy} onSend={handleSend} />
        <ItineraryPanel itinerary={visibleItinerary} state={intake} onTotalChange={setDisplayTotal} />
      </div>
    </div>
  )
}
