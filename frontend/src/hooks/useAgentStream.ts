import { useCallback } from 'react'
import type { AssistantMessage, Block } from '../types'

interface StreamCallbacks {
  onTextDelta: (delta: string) => void
  onToolStart: (toolName: string, detail?: string) => void
  onToolDone:  (toolName: string) => void
  onItineraryUpdate: (section: string, data: unknown) => void
  onSuggestions: (items: string[]) => void
  onDone: () => void
  onError: (message: string) => void
}

export function useAgentStream(tripId: string, callbacks: StreamCallbacks) {
  const send = useCallback(async (message: string) => {
    const res = await fetch(`/api/trips/${tripId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    if (!res.ok || !res.body) {
      callbacks.onError(`Request failed: ${res.status}`)
      callbacks.onDone()
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        const lines = part.split('\n')
        const eventLine = lines.find(l => l.startsWith('event:'))
        const dataLine  = lines.find(l => l.startsWith('data:'))
        if (!eventLine || !dataLine) continue

        const event = eventLine.slice(7).trim()
        let data: unknown
        try {
          data = JSON.parse(dataLine.slice(5).trim())
        } catch {
          continue
        }

        const d = data as Record<string, unknown>
        switch (event) {
          case 'text':
            if (typeof d.delta === 'string') callbacks.onTextDelta(d.delta)
            break
          case 'tool_start':
            if (typeof d.toolName === 'string') callbacks.onToolStart(d.toolName, d.label as string | undefined)
            break
          case 'tool_done':
            if (typeof d.toolName === 'string') callbacks.onToolDone(d.toolName)
            break
          case 'itinerary_update':
            if (typeof d.section === 'string') callbacks.onItineraryUpdate(d.section, d.data)
            break
          case 'suggestions':
            if (Array.isArray(d.items)) callbacks.onSuggestions(d.items as string[])
            break
          case 'error':
            callbacks.onError(typeof d.message === 'string' ? d.message : 'Unknown error')
            break
          case 'done':
            callbacks.onDone()
            break
        }
      }
    }
  }, [tripId, callbacks])

  return { send }
}

// Helpers for managing the in-flight assistant message blocks
export function appendTextDelta(blocks: Block[], delta: string): Block[] {
  const last = blocks[blocks.length - 1]
  if (last?.type === 'text') {
    return [...blocks.slice(0, -1), { ...last, text: last.text + delta }]
  }
  return [...blocks, { type: 'text', text: delta, streaming: true }]
}

export function markStreamingDone(blocks: Block[]): Block[] {
  return blocks.map(b => b.type === 'text' ? { ...b, streaming: false } : b)
}

export function addToolBlock(blocks: Block[], toolName: string, detail?: string): Block[] {
  return [...blocks, { type: 'tool', toolName, label: toolName, detail, status: 'running' as const }]
}

export function markToolDone(blocks: Block[], toolName: string): Block[] {
  return blocks.map(b =>
    b.type === 'tool' && b.toolName === toolName && b.status === 'running'
      ? { ...b, status: 'done' as const }
      : b
  )
}

export function createAssistantMessage(id: string): AssistantMessage {
  return { id, role: 'assistant', blocks: [] }
}

export function appendTextDeltaToMessage(message: AssistantMessage, delta: string): AssistantMessage {
  return { ...message, blocks: appendTextDelta(message.blocks, delta) }
}

export function markStreamingDoneForMessage(message: AssistantMessage): AssistantMessage {
  return { ...message, blocks: markStreamingDone(message.blocks) }
}

export function addToolBlockToMessage(message: AssistantMessage, toolName: string, detail?: string): AssistantMessage {
  return { ...message, blocks: addToolBlock(message.blocks, toolName, detail) }
}

export function markToolDoneForMessage(message: AssistantMessage, toolName: string): AssistantMessage {
  return { ...message, blocks: markToolDone(message.blocks, toolName) }
}
