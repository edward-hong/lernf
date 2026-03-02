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

// ---- Auto-Solving Detection ------------------------------------------------

/** Regex patterns that indicate an NPC is solving the problem for the user */
const AUTO_SOLVING_PATTERNS = [
  /first.*then.*finally/i,
  /step 1.*step 2/i,
  /here'?s what (you need to|to) do:/i,
  /here are the steps/i,
  /i'?ll (check|fix|handle|look into|review)/i,
  /let me (check|review|handle|look into|fix)/i,
  /you'?ll (see|find|notice|observe) (that|the)/i,
  /the (logs|dashboard|metrics) (will )?show/i,
  /then (check|look at|review|identify)/i,
]

const AUTO_SOLVE_CORRECTION = `STOP. You just gave a step-by-step solution. That is wrong.

The user must drive all actions. You are a COWORKER, not a tutor.

Instead of explaining what to do, ask the user a SHORT question (1 sentence) that makes THEM think and act.

Examples:
- "What do the logs show?"
- "When did this start?"
- "What's your hypothesis?"
- "Have you checked X yet?"

DO NOT give multi-step instructions. DO NOT solve for them. Ask ONE question.`

const FALLBACK_PROBE = 'What have you checked so far?'

function isAutoSolving(text: string): boolean {
  return AUTO_SOLVING_PATTERNS.some(pattern => pattern.test(text))
}

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

      let content = response.content

      // Detect auto-solving: NPC giving step-by-step solutions instead of
      // making the user drive the conversation
      if (isAutoSolving(content)) {
        console.warn(`[npcGenerator] Auto-solving detected for ${npc}, regenerating...`)
        console.warn(`[npcGenerator] Bad response: ${content.substring(0, 150)}`)

        // Retry with corrective system message and higher temperature
        const retryMessages: ChatMessage[] = [
          ...messages,
          { role: 'assistant', content },
          { role: 'user', content: AUTO_SOLVE_CORRECTION },
        ]

        try {
          const retry = await callAI({
            systemPrompt,
            messages: retryMessages,
            temperature: 0.95,
            maxTokens: 200,
          })
          content = retry.content

          // If still auto-solving after retry, force a generic probe
          if (isAutoSolving(content)) {
            console.error(`[npcGenerator] Still auto-solving after retry for ${npc}`)
            content = FALLBACK_PROBE
          }
        } catch {
          console.error(`[npcGenerator] Retry failed for ${npc}, using fallback probe`)
          content = FALLBACK_PROBE
        }
      }

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

export { buildNpcSystemPrompt as buildSystemPrompt, formatConversationHistory, encodeBehaviorTraits }
export type { ChatMessage, NPCResponse }
