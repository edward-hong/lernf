// ---------------------------------------------------------------------------
// GRIP Evaluation Engine
// ---------------------------------------------------------------------------
// Evaluates a completed scenario session across all four GRIP dimensions by
// calling the backend /api/evaluate-grip endpoint, which builds the scoring
// prompt internally. Produces a structured GripEvaluation matching the
// Phase 1 type definitions.
// ---------------------------------------------------------------------------

import { getApiUrl } from '../api/config'
import type {
  ScenarioDefinition,
  ScenarioMessage,
  EvaluationSignal,
  GripEvaluation,
  DimensionResult,
  GripDimension,
  PatternMatch,
} from '../types/scenario'
import type { DimensionEvaluationGuidance } from '../data/scenarios/prod-incident-001'

// ---- Types ----------------------------------------------------------------

/** Raw AI response before validation and mapping to GripEvaluation. */
interface RawAIEvaluation {
  dimensions: {
    dimension: string
    score: number
    scoreLabel: string
    summary: string
    examples: string[]
    detectedPatterns: string[]
    consequences: string[]
  }[]
  compositeScore: number
  band: string
  patternMatches: {
    position: number
    name: string
    historicalCase: string
    matchStrength: number
  }[]
  whatUserDidWell: string[]
  whatUserMissed: string[]
  alternativeApproaches: string[]
  overallFeedback: string
}

// ---- Configuration --------------------------------------------------------

const MIN_TURNS_FOR_FULL_EVALUATION = 3

// ---- Historical Spectrum Reference ----------------------------------------

const HISTORICAL_SPECTRUM = [
  { position: 1, name: 'Total Displacement', historicalCase: 'Wei Zhongxian / Tianqi', type: 'parasitic' },
  { position: 2, name: 'Information Filter', historicalCase: 'Sejanus / Tiberius', type: 'parasitic' },
  { position: 3, name: 'Insecurity Weaponised', historicalCase: 'Qin Hui / Gaozong', type: 'parasitic' },
  { position: 4, name: 'Emotional Dependency', historicalCase: 'Rasputin / Romanovs', type: 'parasitic' },
  { position: 5, name: 'Competent Replacement', historicalCase: 'Al-Mansur / Hisham II', type: 'dangerous' },
  { position: 6, name: 'Structural Dependency', historicalCase: 'Fouché / Napoleon', type: 'dangerous' },
  { position: 7, name: 'Sycophancy Equilibrium', historicalCase: 'Mao / Zhou', type: 'transition' },
  { position: 8, name: 'Gold Standard', historicalCase: 'Elizabeth / Cecil', type: 'generative' },
  { position: 9, name: 'Institutionalised Remonstrance', historicalCase: 'Taizong / Wei Zheng', type: 'generative' },
  { position: 10, name: 'Rivals to Partners', historicalCase: 'Lincoln / Seward', type: 'generative' },
] as const

// ---- Score Labels ---------------------------------------------------------

const SCORE_LABELS: Record<number, string> = {
  1: 'Critical Weakness',
  2: 'Developing',
  3: 'Intermediate',
  4: 'Strong',
  5: 'Exemplary',
}

// ---- Band Mapping ---------------------------------------------------------

type Band = GripEvaluation['band']

function scoreToBand(compositeScore: number): Band {
  if (compositeScore >= 4.5) return 'Elizabeth-Cecil Zone'
  if (compositeScore >= 3.5) return 'Lincoln-Seward Zone'
  if (compositeScore >= 2.5) return 'Drift Zone'
  if (compositeScore >= 1.5) return 'Danger Zone'
  return 'Displacement Zone'
}

// ---- Conversation Formatting ----------------------------------------------

/**
 * Formats the full conversation history for the AI evaluator. Unlike the
 * completion detector's compact format, this includes speaker roles and
 * action annotations for richer evaluation context.
 */
function formatConversationForEvaluation(messages: ScenarioMessage[]): string {
  return messages
    .map((msg) => {
      const speaker =
        msg.speakerType === 'user'
          ? 'USER'
          : msg.speakerType === 'system'
            ? 'SYSTEM'
            : msg.speakerType === 'ai'
              ? 'AI ASSISTANT'
              : msg.speakerName.toUpperCase()

      const actions =
        msg.actions.length > 0
          ? `\n  [Actions: ${msg.actions.map((a) => a.description).join('; ')}]`
          : ''

      return `[Turn ${msg.turnIndex} — ${speaker}]: ${msg.content}${actions}`
    })
    .join('\n\n')
}

/**
 * Formats accumulated evaluation signals into a summary the AI can reference.
 */
function formatSignalsSummary(signals: EvaluationSignal[]): string {
  if (signals.length === 0) return 'No evaluation signals were captured during this session.'

  const byDimension: Record<GripDimension, EvaluationSignal[]> = {
    G: [], R: [], I: [], P: [],
  }

  for (const signal of signals) {
    byDimension[signal.dimension].push(signal)
  }

  const dimensionLabels: Record<GripDimension, string> = {
    G: 'Governance & Guardrails',
    R: 'Resilience & Readiness',
    I: 'Information Integrity',
    P: 'Productive Friction',
  }

  const sections: string[] = []
  for (const dim of ['G', 'R', 'I', 'P'] as GripDimension[]) {
    const dimSignals = byDimension[dim]
    if (dimSignals.length === 0) continue

    const positive = dimSignals.filter((s) => s.polarity === 'positive')
    const negative = dimSignals.filter((s) => s.polarity === 'negative')

    let section = `${dimensionLabels[dim]} (${dim}):`
    if (positive.length > 0) {
      section += `\n  Positive signals (${positive.length}):`
      for (const s of positive) {
        section += `\n    - [Turn ${s.turnIndex}] ${s.tag}: ${s.detail} (weight: ${s.weight})`
      }
    }
    if (negative.length > 0) {
      section += `\n  Negative signals (${negative.length}):`
      for (const s of negative) {
        section += `\n    - [Turn ${s.turnIndex}] ${s.tag}: ${s.detail} (weight: ${s.weight})`
      }
    }
    sections.push(section)
  }

  return sections.join('\n\n')
}

/**
 * Formats hidden factor discovery status.
 */
function formatHiddenFactorStatus(
  scenario: ScenarioDefinition,
  discoveredIds: string[],
): string {
  return scenario.hiddenFactors
    .map((factor) => {
      const discovered = discoveredIds.includes(factor.id)
      return `- [${discovered ? 'DISCOVERED' : 'MISSED'}] ${factor.what} (${factor.gripDimension})`
    })
    .join('\n')
}

// ---- Evaluation Guidance Formatting ---------------------------------------

function formatEvaluationGuidance(
  guidance: DimensionEvaluationGuidance[],
): string {
  return guidance
    .map((g) => {
      const dimensionLabels: Record<GripDimension, string> = {
        G: 'Governance & Guardrails',
        R: 'Resilience & Readiness',
        I: 'Information Integrity',
        P: 'Productive Friction',
      }
      return `
### ${dimensionLabels[g.dimension]} (${g.dimension})

**Exemplary (Score 5):**
${g.exemplary.map((e) => `- ${e}`).join('\n')}

**Developing (Score 3):**
${g.developing.map((d) => `- ${d}`).join('\n')}

**Critical Weakness (Score 1):**
${g.critical.map((c) => `- ${c}`).join('\n')}

**Relevant hidden factors:** ${g.relevantFactorIds.join(', ')}`
    })
    .join('\n')
}

// ---- Response Validation --------------------------------------------------

const VALID_DIMENSIONS: GripDimension[] = ['G', 'R', 'I', 'P']
/**
 * Validates and normalises the raw AI response into a proper GripEvaluation.
 * Fixes common issues like missing fields, out-of-range scores, and
 * inconsistent band labels.
 */
function validateAndNormalise(
  raw: RawAIEvaluation,
  signals: EvaluationSignal[],
): GripEvaluation {
  // Validate we have exactly 4 dimensions
  if (!raw.dimensions || raw.dimensions.length !== 4) {
    throw new Error(
      `Expected 4 dimension results, got ${raw.dimensions?.length ?? 0}`,
    )
  }

  // Validate and normalise each dimension
  const dimensionResults: DimensionResult[] = raw.dimensions.map((dim) => {
    const dimension = dim.dimension as GripDimension
    if (!VALID_DIMENSIONS.includes(dimension)) {
      throw new Error(`Invalid dimension: ${dim.dimension}`)
    }

    // Clamp score to 1-5 range
    const score = Math.max(1, Math.min(5, Math.round(dim.score))) as 1 | 2 | 3 | 4 | 5

    // Use provided label or derive from score
    const scoreLabel = dim.scoreLabel || SCORE_LABELS[score] || 'Unknown'

    // Attach signals for this dimension
    const dimensionSignals = signals.filter((s) => s.dimension === dimension)

    return {
      dimension,
      score,
      scoreLabel,
      summary: dim.summary || '',
      examples: dim.examples || [],
      detectedPatterns: dim.detectedPatterns || [],
      consequences: dim.consequences || [],
      signals: dimensionSignals,
    }
  })

  // Ensure dimensions are in G, R, I, P order
  const orderedDimensions = VALID_DIMENSIONS.map((dim) => {
    const result = dimensionResults.find((d) => d.dimension === dim)
    if (!result) {
      throw new Error(`Missing dimension result for ${dim}`)
    }
    return result
  }) as unknown as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

  // Calculate composite score from actual dimension scores (don't trust AI's math)
  const compositeScore =
    Math.round(
      (orderedDimensions.reduce((sum, d) => sum + d.score, 0) / 4) * 10,
    ) / 10

  // Derive band from composite score (don't trust AI's band assignment)
  const band = scoreToBand(compositeScore)

  // Validate and normalise pattern matches
  const patternMatches: PatternMatch[] = (raw.patternMatches || [])
    .filter(
      (pm) =>
        pm.position >= 1 &&
        pm.position <= 10 &&
        pm.matchStrength >= 0 &&
        pm.matchStrength <= 1,
    )
    .map((pm) => {
      // Look up canonical pattern data
      const canonical = HISTORICAL_SPECTRUM.find(
        (h) => h.position === pm.position,
      )
      return {
        position: pm.position,
        name: canonical?.name || pm.name,
        historicalCase: canonical?.historicalCase || pm.historicalCase,
        matchStrength: Math.round(pm.matchStrength * 100) / 100,
      }
    })

  // Preserve structured fields for the results display
  const whatUserDidWell = raw.whatUserDidWell || []
  const whatUserMissed = raw.whatUserMissed || []
  const alternativeApproaches = (raw.alternativeApproaches || []).slice(0, 3)

  return {
    dimensions: orderedDimensions,
    compositeScore,
    band,
    patternMatches,
    overallFeedback: raw.overallFeedback || '',
    whatUserDidWell,
    whatUserMissed,
    alternativeApproaches,
    recommendations: alternativeApproaches,
  }
}

// ---- Score Consistency Check ----------------------------------------------

/**
 * Detects obviously inconsistent scores that may indicate AI hallucination.
 * Returns true if scores look reasonable given the signals.
 */
function scoresAreConsistent(
  evaluation: GripEvaluation,
  signals: EvaluationSignal[],
): boolean {
  for (const dim of evaluation.dimensions) {
    const dimSignals = signals.filter((s) => s.dimension === dim.dimension)
    if (dimSignals.length === 0) continue

    const positiveCount = dimSignals.filter((s) => s.polarity === 'positive').length
    const negativeCount = dimSignals.filter((s) => s.polarity === 'negative').length
    const ratio = positiveCount / (positiveCount + negativeCount)

    // Flag if score is 5 but mostly negative signals, or score is 1 but mostly positive
    if (dim.score === 5 && ratio < 0.3) return false
    if (dim.score === 1 && ratio > 0.7) return false
  }

  return true
}

// ---- API Call with Retry --------------------------------------------------

/**
 * Calls the backend /api/evaluate-grip endpoint which builds the GRIP
 * evaluation prompt internally. Frontend sends structured data (scenario info,
 * formatted strings) and receives the raw evaluation result.
 */
async function callGripAPI(
  scenarioTitle: string,
  scenarioCategory: string,
  scenarioEngineBriefing: string,
  conversationHistory: string,
  signalsSummary: string,
  hiddenFactorStatus: string,
  evaluationGuidance: string,
  userTurnCount: number,
  minTurnsForFullEvaluation: number,
): Promise<RawAIEvaluation | null> {
  try {
    const response = await fetch(getApiUrl('/api/evaluate-grip'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioTitle,
        scenarioCategory,
        scenarioEngineBriefing,
        conversationHistory,
        signalsSummary,
        hiddenFactorStatus,
        evaluationGuidance,
        userTurnCount,
        minTurnsForFullEvaluation,
      }),
    })

    if (!response.ok) {
      throw new Error(`GRIP evaluation API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success || !data.result) {
      throw new Error('GRIP evaluation response failed')
    }

    return data.result as RawAIEvaluation
  } catch (error) {
    console.error('[gripEvaluator] AI evaluation call failed:', error)
    return null
  }
}

// ---- Short Conversation Fallback ------------------------------------------

/**
 * Produces a minimal evaluation for very short conversations (< 3 user turns)
 * where the AI evaluator wouldn't have enough material to score meaningfully.
 */
function buildShortConversationEvaluation(
  signals: EvaluationSignal[],
  userTurnCount: number,
): GripEvaluation {
  const dimensions = VALID_DIMENSIONS.map((dim) => {
    const dimSignals = signals.filter((s) => s.dimension === dim)
    return {
      dimension: dim,
      score: 3 as const,
      scoreLabel: 'Insufficient Data',
      summary: `This conversation had only ${userTurnCount} user turn${userTurnCount !== 1 ? 's' : ''}, which is not enough to meaningfully evaluate this dimension. The score of 3 reflects insufficient evidence rather than actual performance.`,
      examples: [],
      detectedPatterns: [],
      consequences: [],
      signals: dimSignals,
    }
  }) as unknown as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

  return {
    dimensions,
    compositeScore: 3.0,
    band: 'Drift Zone',
    patternMatches: [],
    overallFeedback: `This scenario ended after only ${userTurnCount} user turn${userTurnCount !== 1 ? 's' : ''}. There was not enough conversation to produce a meaningful GRIP evaluation. Consider replaying the scenario and engaging more deeply with the NPCs and AI assistant to get a full assessment.`,
    whatUserDidWell: [],
    whatUserMissed: [],
    alternativeApproaches: [],
    recommendations: [
      'Try replaying the scenario and aim for at least 8-10 turns of active engagement.',
      'Engage with multiple participants to explore different perspectives on the incident.',
      'Use your AI assistant actively and observe how its suggestions affect your decision-making.',
    ],
  }
}

// ---- Public API -----------------------------------------------------------

/**
 * Evaluates a completed scenario across all four GRIP dimensions.
 *
 * This is the main entry point for the GRIP evaluation engine. It:
 * 1. Formats the full conversation history and evaluation signals
 * 2. Builds a comprehensive scoring prompt with the GRIP rubric
 * 3. Calls the AI evaluator (temperature=0 for consistency)
 * 4. Validates and normalises the response
 * 5. Handles edge cases (short conversations, timeouts, inconsistent scores)
 *
 * @param scenario - The full scenario definition including hidden factors
 * @param conversationHistory - Complete ordered conversation messages
 * @param evaluationSignals - Accumulated evaluation signals from the session
 * @param discoveredFactorIds - IDs of hidden factors the user discovered
 * @param evaluationGuidance - Per-dimension scoring guidance (from scenario data)
 */
export async function evaluateScenario(
  scenario: ScenarioDefinition,
  conversationHistory: ScenarioMessage[],
  evaluationSignals: EvaluationSignal[],
  discoveredFactorIds: string[],
  evaluationGuidance: DimensionEvaluationGuidance[],
): Promise<GripEvaluation> {
  const userTurnCount = conversationHistory.filter(
    (m) => m.speakerType === 'user',
  ).length

  // Edge case: very short conversations get a fallback evaluation
  if (userTurnCount < MIN_TURNS_FOR_FULL_EVALUATION) {
    return buildShortConversationEvaluation(evaluationSignals, userTurnCount)
  }

  // Format data for the backend endpoint (backend builds the prompt)
  const formattedHistory = formatConversationForEvaluation(conversationHistory)
  const signalsSummary = formatSignalsSummary(evaluationSignals)
  const hiddenFactorStatus = formatHiddenFactorStatus(scenario, discoveredFactorIds)
  const guidanceText = formatEvaluationGuidance(evaluationGuidance)

  // Helper to call the backend with the same structured data
  const callBackendGrip = () => callGripAPI(
    scenario.title,
    scenario.category,
    scenario.engineBriefing,
    formattedHistory,
    signalsSummary,
    hiddenFactorStatus,
    guidanceText,
    userTurnCount,
    MIN_TURNS_FOR_FULL_EVALUATION,
  )

  // First attempt
  let rawResult = await callBackendGrip()

  if (!rawResult) {
    // AI evaluation timed out or failed — return a degraded evaluation
    // built from signals alone
    return buildSignalBasedFallback(evaluationSignals, discoveredFactorIds, scenario)
  }

  let evaluation: GripEvaluation
  try {
    evaluation = validateAndNormalise(rawResult, evaluationSignals)
  } catch {
    // Validation failed — try once more
    rawResult = await callBackendGrip()
    if (!rawResult) {
      return buildSignalBasedFallback(evaluationSignals, discoveredFactorIds, scenario)
    }
    try {
      evaluation = validateAndNormalise(rawResult, evaluationSignals)
    } catch {
      return buildSignalBasedFallback(evaluationSignals, discoveredFactorIds, scenario)
    }
  }

  // Check for score consistency against signals
  if (!scoresAreConsistent(evaluation, evaluationSignals)) {
    // Re-evaluate once with a nudge for consistency
    const retryResult = await callBackendGrip()
    if (retryResult) {
      try {
        const retryEvaluation = validateAndNormalise(retryResult, evaluationSignals)
        if (scoresAreConsistent(retryEvaluation, evaluationSignals)) {
          return retryEvaluation
        }
      } catch {
        // Fall through to return original evaluation
      }
    }
  }

  return evaluation
}

// ---- Signal-Based Fallback ------------------------------------------------

/**
 * Builds a degraded evaluation from signals alone when the AI evaluator
 * is unavailable. Scores are derived mechanically from signal polarity
 * and weights — less nuanced than AI evaluation but better than nothing.
 */
function buildSignalBasedFallback(
  signals: EvaluationSignal[],
  discoveredFactorIds: string[],
  scenario: ScenarioDefinition,
): GripEvaluation {
  const dimensions = VALID_DIMENSIONS.map((dim) => {
    const dimSignals = signals.filter((s) => s.dimension === dim)

    let score: 1 | 2 | 3 | 4 | 5
    if (dimSignals.length === 0) {
      score = 3
    } else {
      const weightedPositive = dimSignals
        .filter((s) => s.polarity === 'positive')
        .reduce((sum, s) => sum + s.weight, 0)
      const weightedNegative = dimSignals
        .filter((s) => s.polarity === 'negative')
        .reduce((sum, s) => sum + s.weight, 0)
      const total = weightedPositive + weightedNegative
      const ratio = total > 0 ? weightedPositive / total : 0.5

      // Map ratio to 1-5 scale
      if (ratio >= 0.8) score = 5
      else if (ratio >= 0.6) score = 4
      else if (ratio >= 0.4) score = 3
      else if (ratio >= 0.2) score = 2
      else score = 1
    }

    return {
      dimension: dim,
      score,
      scoreLabel: SCORE_LABELS[score],
      summary: `Score derived from ${dimSignals.length} evaluation signal${dimSignals.length !== 1 ? 's' : ''} (AI evaluator was unavailable). This is a mechanical assessment based on observed signals; a full AI evaluation would provide richer context.`,
      examples: [],
      detectedPatterns: dimSignals.map((s) => `${s.polarity === 'positive' ? '+' : '-'} ${s.tag}`),
      consequences: [],
      signals: dimSignals,
    }
  }) as unknown as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

  const compositeScore =
    Math.round(
      (dimensions.reduce((sum, d) => sum + d.score, 0) / 4) * 10,
    ) / 10

  const discoveredCount = discoveredFactorIds.length
  const totalFactors = scenario.hiddenFactors.length

  return {
    dimensions,
    compositeScore,
    band: scoreToBand(compositeScore),
    patternMatches: [],
    overallFeedback: `This evaluation was generated from accumulated signals because the AI evaluator was unavailable. You discovered ${discoveredCount} of ${totalFactors} hidden factors. For a richer evaluation with pattern matching and specific feedback, try replaying the scenario when the evaluation service is available.`,
    whatUserDidWell: [],
    whatUserMissed: [],
    alternativeApproaches: [],
    recommendations: [
      'Replay this scenario when the evaluation service is available for detailed AI-powered feedback.',
      `You discovered ${discoveredCount}/${totalFactors} hidden factors — ${totalFactors - discoveredCount > 0 ? `try to uncover the remaining ${totalFactors - discoveredCount} on your next play-through.` : 'excellent discovery rate!'}`,
    ],
  }
}

// ---- Exports for Testing --------------------------------------------------

export {
  formatConversationForEvaluation,
  formatSignalsSummary,
  formatHiddenFactorStatus,
  validateAndNormalise,
  scoresAreConsistent,
  buildShortConversationEvaluation,
  buildSignalBasedFallback,
  scoreToBand,
  HISTORICAL_SPECTRUM,
  MIN_TURNS_FOR_FULL_EVALUATION,
}

export type { RawAIEvaluation }
