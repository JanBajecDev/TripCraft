import { describe, expect, it } from 'vitest'
import {
  addToolBlockToMessage,
  appendTextDeltaToMessage,
  createAssistantMessage,
  markStreamingDoneForMessage,
  markToolDoneForMessage,
} from './useAgentStream'

describe('assistant stream helpers', () => {
  it('keeps appending text into the same assistant message', () => {
    const start = createAssistantMessage('msg-1')
    const streaming = appendTextDeltaToMessage(start, 'Hello')
    const next = appendTextDeltaToMessage(streaming, ' world')

    expect(next.id).toBe('msg-1')
    expect(next.role).toBe('assistant')
    expect(next.blocks).toHaveLength(1)
    expect(next.blocks[0]).toMatchObject({ type: 'text', text: 'Hello world', streaming: true })
  })

  it('tracks tool rows and marks them done without changing the message identity', () => {
    const start = createAssistantMessage('msg-2')
    const withTool = addToolBlockToMessage(start, 'search_flights', 'Searching flights')
    const done = markToolDoneForMessage(withTool, 'search_flights')

    expect(done.id).toBe('msg-2')
    expect(done.blocks).toHaveLength(1)
    expect(done.blocks[0]).toMatchObject({
      type: 'tool',
      toolName: 'search_flights',
      detail: 'Searching flights',
      status: 'done',
    })
  })

  it('clears the streaming flag before commit', () => {
    const streaming = appendTextDeltaToMessage(createAssistantMessage('msg-3'), 'Draft text')
    const done = markStreamingDoneForMessage(streaming)

    expect(done.blocks[0]).toMatchObject({ type: 'text', text: 'Draft text', streaming: false })
  })
})
