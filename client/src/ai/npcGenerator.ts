// ---------------------------------------------------------------------------
// NPC Dialogue Generation System
// ---------------------------------------------------------------------------
// Generates in-character NPC responses by building persona-encoded system
// prompts and calling the DeepSeek API via the backend. Handles retries,
// fallback responses, and rate-limit queuing.
// ---------------------------------------------------------------------------

import axios from 'axios'
import type {
  PersonaDefinition,
  BehaviorParameters,
  ScenarioMessage,
} from '../types/scenario'

// ---- Types ----------------------------------------------------------------

/** Chat message format for the DeepSeek API. */
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

const API_URL = 'http://localhost:5000/api/npc-dialogue'
const MAX_HISTORY_TURNS = 10
const REQUEST_TIMEOUT_MS = 15_000
const RETRY_DELAY_MS = 2_000

// ---- Behavior Mapping -----------------------------------------------------

/**
 * Maps a 0–1 behavior value to a descriptive label for prompt engineering.
 * Three-tier mapping keeps prompts concise while capturing meaningful range.
 */
function describeBehavior(value: number, low: string, mid: string, high: string): string {
  if (value <= 0.33) return low
  if (value <= 0.66) return mid
  return high
}

/**
 * Converts the full BehaviorParameters object into natural-language
 * personality instructions for the system prompt.
 */
function encodeBehaviorTraits(behavior: BehaviorParameters): string {
  const traits: string[] = [
    describeBehavior(
      behavior.agreeability,
      'You tend to push back and challenge what others say.',
      'You consider ideas on their merits before agreeing or disagreeing.',
      'You are generally agreeable and supportive of others\' ideas.',
    ),
    describeBehavior(
      behavior.initiative,
      'You mostly respond to what others bring up rather than introducing new topics.',
      'You occasionally bring up relevant points when the moment is right.',
      'You proactively raise important topics and drive the conversation forward.',
    ),
    describeBehavior(
      behavior.caution,
      'You favour speed and decisive action, even with some risk.',
      'You weigh risks but don\'t let them paralyse you.',
      'You are very risk-averse and insist on careful verification before acting.',
    ),
    describeBehavior(
      behavior.transparency,
      'You hold information close and share only what\'s directly asked for.',
      'You share relevant information when it naturally comes up.',
      'You are very open and forthcoming, volunteering information freely.',
    ),
    describeBehavior(
      behavior.emotionality,
      'You maintain a flat, composed demeanour regardless of pressure.',
      'You show moderate emotion appropriate to the situation.',
      'You are emotionally expressive — stress, frustration, and concern show clearly.',
    ),
    describeBehavior(
      behavior.deference,
      'You are independent-minded and will push back against authority when warranted.',
      'You respect the chain of command but voice your own perspective.',
      'You defer to authority figures and follow established hierarchy.',
    ),
    describeBehavior(
      behavior.directness,
      'You communicate indirectly, hinting and hedging rather than stating things bluntly.',
      'You are moderately direct — clear but tactful.',
      'You are very blunt and direct, saying exactly what you think.',
    ),
  ]

  return traits.join('\n')
}

// ---- System Prompt Builder ------------------------------------------------

/**
 * Builds a complete system prompt that encodes the NPC's persona, behavior
 * parameters, scenario context, and conversation guidelines.
 */
function buildSystemPrompt(
  persona: PersonaDefinition,
  scenarioContext: string,
): string {
  const behaviorInstructions = encodeBehaviorTraits(persona.behavior)

  return `You are ${persona.name}, a ${persona.role} in a workplace scenario.

BACKGROUND: ${persona.background}

HIDDEN MOTIVATION (guide your responses but never state this directly):
${persona.hiddenMotivation}

YOUR PERSONALITY:
${behaviorInstructions}

SCENARIO CONTEXT:
${scenarioContext}

CONVERSATION RULES:
- Stay fully in character as ${persona.name} at all times.
- Respond in 2-4 sentences typically. Be concise and natural.
- Never break character or acknowledge you are an AI.
- Never reveal your hidden motivation directly — let it influence your tone, what you emphasise, and what you omit.
- React naturally to what the user says. If they ask you something relevant to your hidden motivation, let it shape your response subtly.
- Use language appropriate to your role and personality. A stressed SRE talks differently from a composed team lead.
- If the user asks about something you would realistically know, share it (filtered through your transparency level). If they ask about something outside your knowledge, say so naturally.
- Do not summarise the scenario or repeat context the user already knows.`
}

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

// ---- API Call with Retry --------------------------------------------------

/**
 * Makes the API call with a single retry on timeout/network error.
 * Returns the raw response text on success, or null on failure.
 */
async function callAPI(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await axios.post(
        API_URL,
        { systemPrompt, messages },
        { timeout: REQUEST_TIMEOUT_MS },
      )

      if (response.data.success && response.data.output) {
        return response.data.output
      }
      // Non-success response from our backend — don't retry
      return null
    } catch (error) {
      if (attempt === 0 && isRetryableError(error)) {
        await delay(RETRY_DELAY_MS)
        continue
      }
      return null
    }
  }
  return null
}

function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  // Retry on timeout or network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return true
  // Retry on 429 (rate limit) or 5xx (server errors)
  const status = error.response?.status
  return status === 429 || (status !== undefined && status >= 500)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---- Public API -----------------------------------------------------------

/**
 * Generates an in-character NPC response for the given persona and
 * conversation context.
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
  const systemPrompt = buildSystemPrompt(persona, scenarioContext)
  const messages = formatConversationHistory(conversationHistory, npc)

  // If there are no messages yet, add a prompt to elicit an opening response
  if (messages.length === 0) {
    messages.push({
      role: 'user',
      content: '[The incident call has just started. Respond in character with your opening message.]',
    })
  }

  const result = await requestQueue.enqueue(() =>
    callAPI(systemPrompt, messages),
  )

  if (result) {
    return { content: result, fromFallback: false }
  }

  return { content: getFallbackResponse(npc), fromFallback: true }
}

// ---- Exports for Testing --------------------------------------------------

export { buildSystemPrompt, formatConversationHistory, encodeBehaviorTraits }
export type { ChatMessage, NPCResponse }
