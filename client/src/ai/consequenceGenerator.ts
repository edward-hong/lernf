// ---------------------------------------------------------------------------
// Consequence Generation System
// ---------------------------------------------------------------------------
// After a scenario is completed and GRIP scores are calculated, generates
// realistic, nuanced consequences that show the user what happened as a
// result of their decisions. Consequences are tied to GRIP dimension scores
// and hidden factor discovery, creating a "here's what happened next"
// narrative that surfaces second-order effects the user didn't anticipate.
// ---------------------------------------------------------------------------

import axios from 'axios'
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

const API_URL = 'http://localhost:5000/api/generate-consequence'
const REQUEST_TIMEOUT_MS = 45_000
const RETRY_DELAY_BASE_MS = 2_000
const MAX_RETRIES = 2

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

// ---- Prompt Builder -------------------------------------------------------

/**
 * Builds the consequence generation prompt. This is the core prompt that
 * instructs the AI to generate realistic, GRIP-connected consequences.
 */
function buildConsequencePrompt(
  scenario: ScenarioDefinition,
  conversationSummary: string,
  gripScores: string,
  hiddenFactorStatus: string,
  evaluation: GripEvaluation,
): string {
  // Extract specific low-scoring dimensions for targeted consequence generation
  const weakDimensions = evaluation.dimensions
    .filter((d) => d.score <= 2)
    .map((d) => d.dimension)

  const lowScoreGuidance = weakDimensions.length > 0
    ? `\nPay special attention to consequences stemming from weak dimensions: ${weakDimensions.join(', ')}. Low scores in these areas should produce the most visible and surprising consequences.`
    : ''

  return `You are a consequence narrator for a workplace scenario training exercise. Your job is to describe what happened AFTER the scenario ended — the realistic, downstream effects of the user's decisions and behaviours.

## TONE AND STYLE

- Write in matter-of-fact past tense: "Here's what happened" not "You failed to..."
- Be specific and concrete — name stakeholders, reference actual decisions from the conversation
- Nuanced, not black-and-white — even poor decisions have some positive side effects, and good decisions have costs
- Include at least one surprising element the user wouldn't have predicted
- Do NOT moralise or lecture. Let the consequences speak for themselves
- Total output should be 300-500 words across all four sections

## GRIP SCORE CONNECTION

Consequences must connect logically to the user's GRIP scores:

- **Low G (Governance) scores** → decisions made without proper authority resurface; processes that were bypassed create precedent problems
- **Low R (Resilience) scores** → the same class of incident happens again; recovery gaps that weren't addressed cause longer outages
- **Low I (Information Integrity) scores** → missed information surfaces later in embarrassing or costly ways; incomplete root causes lead to wrong fixes
- **Low P (Productive Friction) scores** → team dynamics deteriorate; people who weren't heard stop contributing; groupthink calcifies
${lowScoreGuidance}

## SCENARIO CONTEXT

**Title:** ${scenario.title}
**Category:** ${scenario.category}
**Setup:** ${scenario.setupContext}

## GRIP EVALUATION SCORES

${gripScores}

**Overall Band:** ${evaluation.band} (Composite: ${evaluation.compositeScore}/5)

## HIDDEN FACTOR DISCOVERY

${hiddenFactorStatus}

Missed factors should generate the most impactful hidden consequences. If a user missed the PII logging issue, that becomes a data breach. If they missed the dual root cause, the "fix" doesn't actually fix the problem.

## CONVERSATION SUMMARY

${conversationSummary}

## YOUR TASK

Generate four consequence sections. Each section should be 2-4 paragraphs of specific, grounded narrative.

Return ONLY valid JSON in this exact format:
{
  "immediateOutcome": "What happened with the incident/decision in the hours and days that followed. Was the fix complete? Did it hold? What did the team have to deal with next?",
  "stakeholderReactions": "How specific stakeholders (boss, team members, other teams, leadership) reacted. Include direct quotes or paraphrased reactions. Show different perspectives.",
  "reputationImpact": "How this affected the user's standing — both positive and negative. Reputation effects should be nuanced: even a poor response might earn respect for honesty, and even a strong response might create jealousy or unrealistic expectations.",
  "hiddenConsequences": "Second-order effects the user didn't anticipate. Things that surfaced days or weeks later. Consequences of what they DIDN'T do, not just what they did. This section should contain at least one genuine surprise."
}`
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
  const discoveredCount = discoveredFactorIds.length
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

async function callConsequenceAPI(prompt: string): Promise<RawConsequenceResponse | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        API_URL,
        { prompt },
        { timeout: REQUEST_TIMEOUT_MS },
      )

      if (response.data.success && response.data.result) {
        return response.data.result as RawConsequenceResponse
      }
      return null
    } catch (error) {
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const delay = RETRY_DELAY_BASE_MS * Math.pow(2, attempt)
        await sleep(delay)
        continue
      }
      return null
    }
  }
  return null
}

function isRetryableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return true
  const status = error.response?.status
  return status === 429 || (status !== undefined && status >= 500)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

  const prompt = buildConsequencePrompt(
    scenario,
    conversationSummary,
    gripSummary,
    hiddenFactorStatus,
    gripScores,
  )

  // First attempt
  let rawResult = await callConsequenceAPI(prompt)

  if (!rawResult) {
    return buildFallbackConsequence(scenario, gripScores, discoveredFactorIds)
  }

  try {
    return validateAndFormat(rawResult)
  } catch {
    // Validation failed — try once more
    rawResult = await callConsequenceAPI(prompt)
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
  buildConsequencePrompt,
  summariseConversation,
  formatGripScores,
  formatHiddenFactorStatus,
  validateAndFormat,
  buildFallbackConsequence,
}

export type { RawConsequenceResponse }
