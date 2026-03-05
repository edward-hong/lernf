// ---------------------------------------------------------------------------
// Consequence Generation System
// ---------------------------------------------------------------------------
// After a scenario is completed and GRIP scores are calculated, generates
// realistic, nuanced consequences that show the user what happened as a
// result of their decisions. Consequences are tied to GRIP dimension scores
// and hidden factor discovery, creating a "here's what happened next"
// narrative that surfaces second-order effects the user didn't anticipate.
// ---------------------------------------------------------------------------

import { getApiUrl } from '../api/config'
import type {
  ScenarioDefinition,
  ScenarioMessage,
  GripEvaluation,
  GripDimension,
  HiddenFactor,
} from '../types/scenario'

// ---- Types ----------------------------------------------------------------

/** A single consequence section in the generated output. */
export interface ConsequenceSection {
  /** Section heading (e.g. "Immediate Outcome"). */
  heading: string
  /** The narrative content for this section. */
  content: string
}

/** Complete consequence output returned to the UI. */
export interface ConsequenceResult {
  /** The four consequence sections in order. */
  sections: [ConsequenceSection, ConsequenceSection, ConsequenceSection, ConsequenceSection]
  /** Whether this result came from AI generation or a fallback. */
  fromFallback: boolean
}

/** Raw AI response before validation. */
interface RawConsequenceResponse {
  immediateOutcome: string
  stakeholderReactions: string
  reputationImpact: string
  hiddenConsequences: string
}

// ---- Configuration --------------------------------------------------------

// Configuration is handled by the unified AI client

// ---- Conversation Summary Builder -----------------------------------------

/**
 * Builds a compact summary of the conversation for the consequence prompt.
 * Includes key decisions, actions taken, and NPC interactions without
 * reproducing the full transcript.
 */
function summariseConversation(messages: ScenarioMessage[]): string {
  const userMessages = messages.filter((m) => m.speakerType === 'user')
  const npcMessages = messages.filter((m) => m.speakerType === 'npc')

  const keyActions = messages
    .flatMap((m) => m.actions)
    .map((a) => `- ${a.description}`)

  const parts: string[] = []

  parts.push(`Total turns: ${messages.length} (${userMessages.length} user, ${npcMessages.length} NPC)`)

  if (keyActions.length > 0) {
    parts.push(`\nKey actions taken:\n${keyActions.join('\n')}`)
  }

  // Include the last 8 messages as compressed conversation context
  const recentMessages = messages.slice(-8)
  const condensed = recentMessages
    .map((msg) => {
      const speaker =
        msg.speakerType === 'user'
          ? 'USER'
          : msg.speakerType === 'system'
            ? 'SYSTEM'
            : msg.speakerName.toUpperCase()
      // Truncate long messages to keep prompt size manageable
      const content =
        msg.content.length > 200
          ? msg.content.slice(0, 200) + '...'
          : msg.content
      return `[${speaker}]: ${content}`
    })
    .join('\n')

  parts.push(`\nRecent conversation:\n${condensed}`)

  return parts.join('\n')
}

// ---- Hidden Factor Status -------------------------------------------------

function formatHiddenFactorStatus(
  factors: HiddenFactor[],
  discoveredIds: string[],
): string {
  return factors
    .map((factor) => {
      const discovered = discoveredIds.includes(factor.id)
      return `- [${discovered ? 'DISCOVERED' : 'MISSED'}] ${factor.what} (${factor.gripDimension})`
    })
    .join('\n')
}

// ---- GRIP Score Summary ---------------------------------------------------

function formatGripScores(evaluation: GripEvaluation): string {
  const dimensionLabels: Record<GripDimension, string> = {
    G: 'Governance & Guardrails',
    R: 'Resilience & Readiness',
    I: 'Information Integrity',
    P: 'Productive Friction',
  }

  return evaluation.dimensions
    .map((dim) => {
      const label = dimensionLabels[dim.dimension]
      return `${label} (${dim.dimension}): ${dim.score}/5 — ${dim.scoreLabel}\n  ${dim.summary}`
    })
    .join('\n\n')
}

// ---- Response Validation --------------------------------------------------

/**
 * Validates the raw AI response and maps it to the structured ConsequenceResult.
 */
function validateAndFormat(raw: RawConsequenceResponse): ConsequenceResult {
  const requiredFields: (keyof RawConsequenceResponse)[] = [
    'immediateOutcome',
    'stakeholderReactions',
    'reputationImpact',
    'hiddenConsequences',
  ]

  for (const field of requiredFields) {
    if (!raw[field] || typeof raw[field] !== 'string' || raw[field].trim().length === 0) {
      throw new Error(`Missing or empty consequence field: ${field}`)
    }
  }

  return {
    sections: [
      { heading: 'Immediate Outcome', content: raw.immediateOutcome.trim() },
      { heading: 'Stakeholder Reactions', content: raw.stakeholderReactions.trim() },
      { heading: 'Reputation Impact', content: raw.reputationImpact.trim() },
      { heading: 'Hidden Consequences', content: raw.hiddenConsequences.trim() },
    ],
    fromFallback: false,
  }
}

// ---- Fallback Builder -----------------------------------------------------

/**
 * Produces a mechanically-generated consequence when the AI evaluator is
 * unavailable. Less nuanced than AI generation but provides meaningful
 * feedback based on GRIP scores and hidden factor discovery.
 */
function buildFallbackConsequence(
  scenario: ScenarioDefinition,
  evaluation: GripEvaluation,
  discoveredFactorIds: string[],
): ConsequenceResult {
  const missedFactors = scenario.hiddenFactors.filter(
    (f) => !discoveredFactorIds.includes(f.id),
  )
  const totalFactors = scenario.hiddenFactors.length

  // Immediate outcome based on composite score
  let immediateOutcome: string
  if (evaluation.compositeScore >= 4) {
    immediateOutcome =
      'The incident was resolved thoroughly. The team identified the core issues and implemented a fix that addressed the root causes rather than just the symptoms. Service was restored with confidence that the same failure mode would not recur immediately.'
  } else if (evaluation.compositeScore >= 3) {
    immediateOutcome =
      'The incident was resolved, but some loose ends remained. The immediate fix restored service, though the team had lingering questions about whether all contributing factors had been identified. A follow-up investigation was scheduled for the following week.'
  } else {
    immediateOutcome =
      'The incident was marked as resolved, but the fix was incomplete. Service was restored through a rollback, but the underlying interaction between multiple contributing factors was not fully understood. The team would discover this gap sooner than expected.'
  }

  // Stakeholder reactions based on P score
  const pScore = evaluation.dimensions.find((d) => d.dimension === 'P')?.score ?? 3
  let stakeholderReactions: string
  if (pScore >= 4) {
    stakeholderReactions =
      'Team members felt heard during the incident. Sarah appreciated that her concerns were taken seriously, and Mike felt safe enough to share relevant information without fear of blame. Rachel noted the collaborative approach in her incident summary to leadership.'
  } else if (pScore >= 3) {
    stakeholderReactions =
      'The team had mixed feelings about how the incident was handled. While the immediate crisis was managed, some team members felt their input was not fully explored. The post-incident retrospective surfaced some unspoken frustrations about communication during the call.'
  } else {
    stakeholderReactions =
      'The incident left some interpersonal friction in its wake. Team members who felt dismissed or overridden during the call became more guarded in subsequent discussions. The post-incident retrospective was tense, with several people raising concerns about how decisions were made under pressure.'
  }

  // Reputation impact based on composite + G score
  const gScore = evaluation.dimensions.find((d) => d.dimension === 'G')?.score ?? 3
  let reputationImpact: string
  if (evaluation.compositeScore >= 4 && gScore >= 4) {
    reputationImpact =
      'The incident, while stressful, ultimately strengthened the user\'s reputation. Leadership noted the thorough investigation and willingness to examine systemic issues rather than settling for a quick fix. The user was asked to help draft improved incident response guidelines.'
  } else if (evaluation.compositeScore >= 2.5) {
    reputationImpact =
      'The incident had a neutral impact on the user\'s reputation. The crisis was handled competently but without distinction. No one blamed the user specifically, but no one highlighted exceptional judgement either. The incident joined the long list of "things that happen" in the team\'s collective memory.'
  } else {
    reputationImpact =
      'The incident raised some quiet concerns about the user\'s decision-making under pressure. While no one said anything directly, leadership noted the gaps in the post-incident report. The user was not asked to lead the next incident response, and their next deployment received extra scrutiny.'
  }

  // Hidden consequences from missed factors
  let hiddenConsequences: string
  if (missedFactors.length === 0) {
    hiddenConsequences =
      `All ${totalFactors} hidden factors were discovered during the incident. This comprehensive investigation meant that follow-up actions addressed the full scope of the problem. No unpleasant surprises emerged in the following weeks.`
  } else {
    const missedDescriptions = missedFactors
      .map((f) => f.whyItMatters)
      .join(' Additionally, ')

    hiddenConsequences =
      `${missedFactors.length} of ${totalFactors} contributing factors were not discovered during the incident. In the following days and weeks, these gaps surfaced: ${missedDescriptions}`
  }

  return {
    sections: [
      { heading: 'Immediate Outcome', content: immediateOutcome },
      { heading: 'Stakeholder Reactions', content: stakeholderReactions },
      { heading: 'Reputation Impact', content: reputationImpact },
      { heading: 'Hidden Consequences', content: hiddenConsequences },
    ],
    fromFallback: true,
  }
}

// ---- API Call with Retry --------------------------------------------------

/**
 * Calls the backend /api/generate-consequence endpoint which builds the
 * consequence prompt internally. Client sends structured data.
 * Returns the parsed raw response or null on failure.
 */
async function callConsequenceAPI(
  scenarioTitle: string,
  scenarioCategory: string,
  scenarioSetupContext: string,
  conversationSummary: string,
  gripScores: string,
  compositeScore: number,
  band: string,
  hiddenFactorStatus: string,
  weakDimensions: string[],
): Promise<RawConsequenceResponse | null> {
  try {
    const response = await fetch(getApiUrl('/api/generate-consequence'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioTitle,
        scenarioCategory,
        scenarioSetupContext,
        conversationSummary,
        gripScores,
        compositeScore,
        band,
        hiddenFactorStatus,
        weakDimensions,
      }),
    })

    if (!response.ok) {
      throw new Error(`Consequence generation API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success || !data.result) {
      throw new Error('Consequence generation response failed')
    }

    return data.result as RawConsequenceResponse
  } catch (error) {
    console.error('[consequenceGenerator] AI consequence generation failed:', error)
    return null
  }
}

// ---- Public API -----------------------------------------------------------

/**
 * Generates realistic consequences based on the user's scenario performance.
 *
 * This is the main entry point for consequence generation. It:
 * 1. Summarises the conversation history
 * 2. Formats GRIP scores and hidden factor discovery status
 * 3. Builds a consequence generation prompt connecting scores to outcomes
 * 4. Calls the AI to generate nuanced, specific consequences
 * 5. Falls back to mechanical generation if the AI is unavailable
 *
 * @param scenario - The scenario definition including hidden factors
 * @param conversationHistory - Complete ordered conversation messages
 * @param gripScores - The completed GRIP evaluation with dimension scores
 * @param discoveredFactorIds - IDs of hidden factors the user discovered
 */
export async function generateConsequence(
  scenario: ScenarioDefinition,
  conversationHistory: ScenarioMessage[],
  gripScores: GripEvaluation,
  discoveredFactorIds: string[],
): Promise<ConsequenceResult> {
  const conversationSummary = summariseConversation(conversationHistory)
  const gripSummary = formatGripScores(gripScores)
  const hiddenFactorStatus = formatHiddenFactorStatus(
    scenario.hiddenFactors,
    discoveredFactorIds,
  )

  // Extract weak dimensions for targeted consequence generation
  const weakDimensions = gripScores.dimensions
    .filter((d) => d.score <= 2)
    .map((d) => d.dimension)

  // Helper to call the backend with structured data (backend builds the prompt)
  const callBackendConsequence = () => callConsequenceAPI(
    scenario.title,
    scenario.category,
    scenario.setupContext,
    conversationSummary,
    gripSummary,
    gripScores.compositeScore,
    gripScores.band,
    hiddenFactorStatus,
    weakDimensions,
  )

  // First attempt
  let rawResult = await callBackendConsequence()

  if (!rawResult) {
    return buildFallbackConsequence(scenario, gripScores, discoveredFactorIds)
  }

  try {
    return validateAndFormat(rawResult)
  } catch {
    // Validation failed — try once more
    rawResult = await callBackendConsequence()
    if (!rawResult) {
      return buildFallbackConsequence(scenario, gripScores, discoveredFactorIds)
    }
    try {
      return validateAndFormat(rawResult)
    } catch {
      return buildFallbackConsequence(scenario, gripScores, discoveredFactorIds)
    }
  }
}

// ---- Exports for Testing --------------------------------------------------

export {
  summariseConversation,
  formatGripScores,
  formatHiddenFactorStatus,
  validateAndFormat,
  buildFallbackConsequence,
}

export type { RawConsequenceResponse }
