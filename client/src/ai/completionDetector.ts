// ---------------------------------------------------------------------------
// Scenario Completion Detection — AI Evaluator
// ---------------------------------------------------------------------------
// After each user turn, calls the backend /api/evaluate-completion endpoint
// to determine whether the scenario has reached a natural completion point.
// The backend builds the evaluation prompt internally. Manages evaluation
// state, turn counting, and request deduplication.
// ---------------------------------------------------------------------------

import { authFetch } from '../api/config'
import type { ScenarioDefinition, ScenarioMessage } from '../types/scenario'

// ---- Types ----------------------------------------------------------------

/** Result returned by the AI completion evaluator. */
export interface CompletionEvaluation {
  /** Whether the AI believes the scenario has reached a natural conclusion. */
  scenarioComplete: boolean
  /** Explanation of why the scenario is or isn't complete. */
  reasoning: string
  /** If not complete, a suggested next direction for the user. */
  suggestedPrompt: string
}

/** The different prompts the completion system can surface to the user. */
export type CompletionPromptType =
  | 'ai-detected'       // AI evaluator detected completion
  | 'long-running'      // 15+ user turns without resolution
  | 'user-initiated'    // User clicked "End Scenario"

/** Full result passed to the UI layer. */
export interface CompletionDetectionResult {
  /** The type of completion prompt to show. */
  promptType: CompletionPromptType
  /** AI evaluation details (null for user-initiated). */
  evaluation: CompletionEvaluation | null
  /** Number of user turns at the time of detection. */
  userTurnCount: number
}

// ---- Configuration --------------------------------------------------------

const LONG_RUNNING_THRESHOLD = 15
/** Minimum user turns before AI evaluation kicks in (avoid premature checks). */
const MIN_TURNS_FOR_EVALUATION = 4
/** Don't re-evaluate within this many user turns of the last check. */
const EVALUATION_COOLDOWN_TURNS = 2

// ---- State ----------------------------------------------------------------

/** Tracks the last user turn index at which an evaluation was performed. */
let lastEvaluatedAtTurn = -1
/** Prevents concurrent evaluation requests. */
let evaluationInFlight = false
/** Whether the long-running nudge has already been shown this session. */
let longRunningNudgeShown = false

/** Reset detector state for a new scenario session. */
export function resetCompletionDetector(): void {
  lastEvaluatedAtTurn = -1
  evaluationInFlight = false
  longRunningNudgeShown = false
}

// ---- Prompt Formatting ----------------------------------------------------

/**
 * Builds a condensed string of the conversation history for the AI evaluator.
 * Keeps it compact to stay within token budgets.
 */
function formatConversationForEvaluation(messages: ScenarioMessage[]): string {
  return messages
    .map((msg) => {
      const speaker =
        msg.speakerType === 'user'
          ? 'USER'
          : msg.speakerType === 'system'
            ? 'SYSTEM'
            : msg.speakerName.toUpperCase()
      return `[${speaker}]: ${msg.content}`
    })
    .join('\n\n')
}

/**
 * Builds the completion signal definitions from the scenario definition.
 * These tell the AI what "done" looks like for this particular scenario.
 */
function buildCompletionSignals(definition: ScenarioDefinition): string {
  const signals: string[] = []

  signals.push(
    `Scenario category: ${definition.category}`,
    `Estimated turns for completion: ${definition.estimatedTurns}`,
    `Number of hidden factors to discover: ${definition.hiddenFactors.length}`,
  )

  signals.push('\nCompletion indicators:')
  signals.push('- User has identified and addressed the core issue(s)')
  signals.push('- User has formed a clear plan of action or reached a decision')
  signals.push('- The conversation has reached a natural stopping point')
  signals.push('- User has engaged with multiple participants and gathered key information')

  signals.push('\nThe scenario is NOT complete if:')
  signals.push('- User has only spoken to one participant and hasn\'t explored other perspectives')
  signals.push('- The core issue remains unidentified or unaddressed')
  signals.push('- User is still gathering basic information')
  signals.push('- There are obvious follow-up actions the user hasn\'t considered')

  return signals.join('\n')
}

// ---- API Call -------------------------------------------------------------

/**
 * Calls the backend /api/evaluate-completion endpoint which builds the
 * completion prompt internally. Client sends structured scenario data.
 * Returns null on failure (the caller should treat this as "not complete").
 */
async function callCompletionAPI(
  scenarioDescription: string,
  conversationHistory: string,
  completionSignals: string,
): Promise<CompletionEvaluation | null> {
  try {
    const response = await authFetch('/api/evaluate-completion', {
      method: 'POST',
      body: JSON.stringify({
        scenarioDescription,
        conversationHistory,
        completionSignals,
      }),
    })

    if (!response.ok) {
      throw new Error(`Completion evaluation API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success || !data.result) {
      throw new Error('Completion evaluation response failed')
    }

    return data.result as CompletionEvaluation
  } catch (error) {
    console.error('[completionDetector] Completion evaluation failed:', error)
    return null
  }
}

// ---- Public API -----------------------------------------------------------

/**
 * Evaluates whether the scenario should prompt for completion after a user turn.
 *
 * Call this after each user message is added to the conversation. It will:
 * 1. Check if the long-running threshold has been hit (15+ user turns)
 * 2. If enough turns have passed, call the AI evaluator
 * 3. Return a detection result if completion should be prompted, or null to continue
 *
 * Returns null if:
 * - Too few turns for evaluation
 * - Within the cooldown window
 * - An evaluation is already in flight
 * - The AI says the scenario isn't complete yet
 */
export async function evaluateCompletion(
  definition: ScenarioDefinition,
  messages: ScenarioMessage[],
): Promise<CompletionDetectionResult | null> {
  const userTurnCount = messages.filter((m) => m.speakerType === 'user').length

  // Check for long-running scenario (15+ user turns without resolution)
  if (userTurnCount >= LONG_RUNNING_THRESHOLD && !longRunningNudgeShown) {
    longRunningNudgeShown = true
    return {
      promptType: 'long-running',
      evaluation: null,
      userTurnCount,
    }
  }

  // Don't evaluate if too few turns
  if (userTurnCount < MIN_TURNS_FOR_EVALUATION) {
    return null
  }

  // Don't evaluate if within cooldown
  if (userTurnCount - lastEvaluatedAtTurn < EVALUATION_COOLDOWN_TURNS) {
    return null
  }

  // Don't evaluate if already in flight
  if (evaluationInFlight) {
    return null
  }

  evaluationInFlight = true
  lastEvaluatedAtTurn = userTurnCount

  try {
    const scenarioDescription = [
      `Title: ${definition.title}`,
      `Context: ${definition.setupContext}`,
      `Engine briefing: ${definition.engineBriefing}`,
    ].join('\n\n')

    const conversationHistory = formatConversationForEvaluation(messages)
    const completionSignals = buildCompletionSignals(definition)

    const evaluation = await callCompletionAPI(
      scenarioDescription,
      conversationHistory,
      completionSignals,
    )

    if (evaluation?.scenarioComplete) {
      return {
        promptType: 'ai-detected',
        evaluation,
        userTurnCount,
      }
    }

    return null
  } finally {
    evaluationInFlight = false
  }
}

/**
 * Creates a detection result for when the user manually ends the scenario.
 * Used by the UI to drive the confirmation dialog flow.
 */
export function createUserInitiatedResult(
  messages: ScenarioMessage[],
): CompletionDetectionResult {
  const userTurnCount = messages.filter((m) => m.speakerType === 'user').length
  return {
    promptType: 'user-initiated',
    evaluation: null,
    userTurnCount,
  }
}
