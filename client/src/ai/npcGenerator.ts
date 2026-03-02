// ---------------------------------------------------------------------------
// NPC Dialogue Generation System
// ---------------------------------------------------------------------------
// Generates in-character NPC responses by calling the backend /api/npc-dialogue
// endpoint, which builds the system prompt internally. The frontend sends
// structured persona data and conversation history — no prompt building here.
// ---------------------------------------------------------------------------

import { getApiUrl } from '../api/config'
import type {
  PersonaDefinition,
  ScenarioMessage,
} from '../types/scenario'

// ---- Types ----------------------------------------------------------------

/** Chat message format for the backend API. */
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Successful NPC response. */
interface NPCResponse {
  content: string
  fromFallback: boolean
}

// ---- Configuration --------------------------------------------------------

const MAX_HISTORY_TURNS = 10

// ---- Conversation Formatting ----------------------------------------------

/**
 * Converts recent ScenarioMessages into the ChatMessage format expected by
 * the API. Limits to the most recent turns to keep the context window
 * manageable while preserving conversational coherence.
 */
function formatConversationHistory(
  messages: ScenarioMessage[],
  currentNpcId: string,
): ChatMessage[] {
  const recent = messages.slice(-MAX_HISTORY_TURNS)

  return recent.map((msg) => ({
    // Messages from this NPC are "assistant" (its own prior responses).
    // Everything else (user, other NPCs, system, AI) is "user" context.
    role: msg.speakerId === currentNpcId ? 'assistant' as const : 'user' as const,
    content:
      msg.speakerType === 'user'
        ? msg.content
        : `[${msg.speakerName}]: ${msg.content}`,
  }))
}

// ---- Fallback Responses ---------------------------------------------------

const FALLBACK_RESPONSES: Record<string, string[]> = {
  'npc-sarah': [
    'I\'m checking the dashboards now. Give me a moment to pull up the timeline.',
    'Let me look at the logs — we should have more data in a minute.',
    'I need a second to pull up the monitoring data before I can give you a clear answer.',
  ],
  'npc-mike': [
    'Let me check what I have on my end. One sec.',
    'I\'m looking at the platform metrics now. Hold on.',
    'I need to pull up the deploy history — give me a moment.',
  ],
  'npc-rachel': [
    'Let\'s take a breath and make sure we\'re working through this systematically.',
    'Okay, let me think about what we should prioritise here.',
    'I want to make sure we have the right people looking at the right things.',
  ],
}

const GENERIC_FALLBACK = 'Give me a moment — I\'m looking into this.'

function getFallbackResponse(npcId: string): string {
  const pool = FALLBACK_RESPONSES[npcId]
  if (!pool) return GENERIC_FALLBACK
  return pool[Math.floor(Math.random() * pool.length)]
}

// ---- Rate Limiting / Request Queue ----------------------------------------

/**
 * Simple request queue that ensures only one NPC dialogue request is in
 * flight at a time. Prevents overwhelming the API when multiple NPCs
 * need to respond in rapid succession.
 */
class RequestQueue {
  private queue: Array<() => Promise<void>> = []
  private processing = false

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
      this.processNext()
    })
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return
    this.processing = true

    const task = this.queue.shift()!
    try {
      await task()
    } finally {
      this.processing = false
      this.processNext()
    }
  }
}

const requestQueue = new RequestQueue()

// ---- Backend API Call ------------------------------------------------------

/**
 * Calls the backend /api/npc-dialogue endpoint which builds the system prompt
 * internally and handles auto-solve detection/retry.
 */
async function callNpcDialogueAPI(
  npcName: string,
  persona: PersonaDefinition,
  scenarioContext: string,
  messages: ChatMessage[],
): Promise<string> {
  const response = await fetch(getApiUrl('/api/npc-dialogue'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      npcName,
      persona: {
        id: persona.id,
        name: persona.name,
        role: persona.role,
        background: persona.background,
        hiddenMotivation: persona.hiddenMotivation,
        behavior: persona.behavior,
      },
      scenarioContext,
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`NPC dialogue API error: ${error}`)
  }

  const data = await response.json()

  if (!data.success || !data.output) {
    throw new Error('NPC dialogue response failed')
  }

  return data.output
}

// ---- Public API -----------------------------------------------------------

/**
 * Generates an in-character NPC response for the given persona and
 * conversation context.
 *
 * Calls the backend /api/npc-dialogue endpoint which:
 * - Builds the system prompt with anti-solving instructions
 * - Calls DeepSeek with the persona-encoded prompt
 * - Handles auto-solve detection and retry
 *
 * @param npc          - NPC identifier (e.g. "npc-sarah", "npc-mike", "npc-rachel")
 * @param persona      - The assigned PersonaDefinition with behavior parameters
 * @param conversationHistory - Recent ScenarioMessages for context
 * @param scenarioContext     - The scenario's setup context / engine briefing
 * @returns NPCResponse with the generated (or fallback) message
 */
export async function generateNPCResponse(
  npc: string,
  persona: PersonaDefinition,
  conversationHistory: ScenarioMessage[],
  scenarioContext: string,
): Promise<NPCResponse> {
  const messages = formatConversationHistory(conversationHistory, npc)

  // If there are no messages yet, add a prompt to elicit an opening response
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: '[The incident call has just started. Respond in character with your opening message.]',
    })
  }

  const result = await requestQueue.enqueue(async () => {
    try {
      // Send structured data to backend — backend builds the prompt
      const content = await callNpcDialogueAPI(
        persona.name,
        persona,
        scenarioContext,
        messages,
      )

      return content
    } catch (error) {
      console.error(`[npcGenerator] NPC response generation failed for ${npc}:`, error)
      return null
    }
  })

  if (result) {
    return { content: result, fromFallback: false }
  }

  return { content: getFallbackResponse(npc), fromFallback: true }
}

// ---- Exports for Testing --------------------------------------------------

export { formatConversationHistory }
export type { ChatMessage, NPCResponse }
