// ---------------------------------------------------------------------------
// NPC Dialogue Generation System
// ---------------------------------------------------------------------------
// Generates in-character NPC responses by building persona-encoded system
// prompts and calling the unified AI client. Handles fallback responses
// and rate-limit queuing.
// ---------------------------------------------------------------------------

import { callAI } from '../api/aiClient'
import type {
  PersonaDefinition,
  ScenarioMessage,
} from '../types/scenario'
import { buildNpcSystemPrompt, encodeBehaviorTraits } from '../prompts/npcPrompt'

// ---- Types ----------------------------------------------------------------

/** Chat message format for the AI API. */
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

// ---- Public API -----------------------------------------------------------

/**
 * Generates an in-character NPC response for the given persona and
 * conversation context.
 *
 * Uses the unified `callAI()` client which respects user provider settings
 * (primary -> backup -> backend-default fallback chain).
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
  const systemPrompt = buildNpcSystemPrompt(persona, scenarioContext)
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
      const response = await callAI({
        systemPrompt,
        messages,
        temperature: 0.8, // More creative for NPC personality
        maxTokens: 300,
      })
      return response.content
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

export { buildNpcSystemPrompt as buildSystemPrompt, formatConversationHistory, encodeBehaviorTraits }
export type { ChatMessage, NPCResponse }
