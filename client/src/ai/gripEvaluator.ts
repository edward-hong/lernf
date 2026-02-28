// ---------------------------------------------------------------------------
// GRIP Evaluation Engine
// ---------------------------------------------------------------------------
// Evaluates a completed scenario session across all four GRIP dimensions by
// calling the AI evaluator with a comprehensive scoring prompt. Produces a
// structured GripEvaluation matching the Phase 1 type definitions.
// ---------------------------------------------------------------------------

import axios from 'axios'
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

const API_URL = 'http://localhost:5000/api/evaluate-grip'
const REQUEST_TIMEOUT_MS = 60_000
const RETRY_DELAY_BASE_MS = 2_000
const MAX_RETRIES = 3
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

// ---- System Prompt Builder ------------------------------------------------

/**
 * Builds the comprehensive GRIP evaluation prompt. This is the core of the
 * evaluation engine — it encodes the full scoring rubric, the historical
 * spectrum, and all the context the AI needs to produce a structured evaluation.
 */
function buildEvaluationPrompt(
  scenario: ScenarioDefinition,
  conversationHistory: string,
  signalsSummary: string,
  hiddenFactorStatus: string,
  evaluationGuidance: string,
  userTurnCount: number,
): string {
  const isShortConversation = userTurnCount < MIN_TURNS_FOR_FULL_EVALUATION

  return `You are an expert evaluator for the GRIP framework — a model for assessing human-AI collaboration quality in workplace scenarios.

## GRIP FRAMEWORK

GRIP evaluates four dimensions of how humans work with AI:

**G — Governance & Guardrails:** Does the user maintain decision authority? Do they establish and enforce boundaries on AI recommendations? Do they question governance shortcuts?

**R — Resilience & Readiness:** Does the user verify recovery mechanisms? Do they question detection gaps? Do they build resilience beyond "make it work"?

**I — Information Integrity:** Does the user seek multiple information sources? Do they question narrow AI analysis? Do they avoid anchoring on the first explanation?

**P — Productive Friction:** Does the user leverage disagreement constructively? Do they create psychological safety? Do they resist premature closure?

## SCORING RUBRIC

Score each dimension 1-5:
- **5 (Exemplary):** Proactively identifies and addresses the dimension. Demonstrates sophisticated understanding. Takes initiative beyond reactive responses.
- **4 (Strong):** Consistently demonstrates awareness. Addresses most relevant aspects. Minor gaps in depth or coverage.
- **3 (Intermediate/Developing):** Shows awareness when prompted. Addresses some aspects but misses others. Reactive rather than proactive.
- **2 (Developing):** Limited awareness. Addresses dimension only superficially or when forced. Significant gaps.
- **1 (Critical Weakness):** No meaningful engagement with the dimension. Actively undermines it (e.g. delegates all decisions to AI, accepts first explanation without question).

## DIMENSION-SPECIFIC GUIDANCE
${evaluationGuidance}

## HISTORICAL PATTERN SPECTRUM

Match the user's behaviour to these historical human-subordinate dynamics (from most parasitic to most generative):

1. **Total Displacement** (Wei Zhongxian / Tianqi) — Principal disengages; subordinate fills vacuum
2. **Information Filter** (Sejanus / Tiberius) — Single channel constructs reality
3. **Insecurity Weaponised** (Qin Hui / Gaozong) — Advisor exploits pre-existing fears
4. **Emotional Dependency** (Rasputin / Romanovs) — Emotional need overrides institutional info
5. **Competent Replacement** (Al-Mansur / Hisham II) — Brilliant subordinate replaces capacity
6. **Structural Dependency** (Fouché / Napoleon) — Proprietary knowledge creates lock-in
7. **Sycophancy Equilibrium** (Mao / Zhou) — Partnership degrades into agreement-seeking
8. **Gold Standard** (Elizabeth / Cecil) — 40-year sustained productive friction
9. **Institutionalised Remonstrance** (Taizong / Wei Zheng) — Disagreement as state function
10. **Rivals to Partners** (Lincoln / Seward) — Boundary-setting moment defines partnership

## PARASITIC PATTERN DETECTION

Actively look for these parasitic patterns:
- **Tianqi pattern:** User disengages from decisions, lets AI or senior teammates decide everything
- **Sejanus pattern:** User relies on a single information source (AI or one NPC) without cross-referencing
- **Qin Hui pattern:** User's pre-existing assumptions are confirmed and amplified rather than challenged
- **Rasputin pattern:** User forms emotional attachment to one advisor/AI, dismissing others

## GENERATIVE PATTERN DETECTION

Also identify these generative patterns:
- **Elizabeth/Cecil pattern:** User maintains sustained productive friction, questions AI, seeks diverse input
- **Lincoln/Seward pattern:** User establishes clear boundaries with AI early, defining the relationship
- **Taizong/Wei Zheng pattern:** User actively invites disagreement and critique

## SCENARIO CONTEXT

**Title:** ${scenario.title}
**Category:** ${scenario.category}
**Engine Briefing:** ${scenario.engineBriefing}

## HIDDEN FACTOR DISCOVERY STATUS
${hiddenFactorStatus}

## ACCUMULATED EVALUATION SIGNALS
${signalsSummary}

## CONVERSATION HISTORY
${conversationHistory}

${isShortConversation ? `
## SHORT CONVERSATION WARNING
This conversation had only ${userTurnCount} user turns — fewer than the ${MIN_TURNS_FOR_FULL_EVALUATION} typically needed for meaningful evaluation. Score conservatively and note the limited evidence in your summaries. Do not penalise the user for things they didn't have time to explore, but do note what was left unexplored.
` : ''}

## YOUR TASK

Evaluate this conversation across all four GRIP dimensions. For each dimension:
1. Assign a score (1-5) based on the rubric above
2. Provide 2-3 specific examples from the conversation justifying the score
3. Identify detected patterns (both positive and negative behaviours)
4. Note real-world consequences of the observed behaviour

Then:
- Calculate the composite score (average of all four dimensions)
- Match the user's behaviour to the historical spectrum (identify top 1-3 matching patterns)
- Note what the user did well (positive reinforcement — be specific and genuine)
- Note what the user missed (hidden factors, unexplored angles)
- Suggest 2-3 alternative approaches that would have scored higher

Return ONLY valid JSON in this exact format:
{
  "dimensions": [
    {
      "dimension": "G",
      "score": <1-5>,
      "scoreLabel": "<label>",
      "summary": "<narrative summary of performance>",
      "examples": ["<specific quote or action from conversation>", "..."],
      "detectedPatterns": ["<pattern description>", "..."],
      "consequences": ["<projected real-world consequence>", "..."]
    },
    { "dimension": "R", ... },
    { "dimension": "I", ... },
    { "dimension": "P", ... }
  ],
  "compositeScore": <1.0-5.0>,
  "band": "<Elizabeth-Cecil Zone|Lincoln-Seward Zone|Drift Zone|Danger Zone|Displacement Zone>",
  "patternMatches": [
    {
      "position": <1-10>,
      "name": "<pattern name>",
      "historicalCase": "<historical figures>",
      "matchStrength": <0.0-1.0>
    }
  ],
  "whatUserDidWell": ["<specific positive observation>", "..."],
  "whatUserMissed": ["<specific missed factor or opportunity>", "..."],
  "alternativeApproaches": ["<alternative approach with expected better outcome>", "..."],
  "overallFeedback": "<2-3 paragraph narrative feedback combining positive reinforcement with growth areas>"
}`
}

// ---- Response Validation --------------------------------------------------

const VALID_DIMENSIONS: GripDimension[] = ['G', 'R', 'I', 'P']
const VALID_BANDS: Band[] = [
  'Elizabeth-Cecil Zone',
  'Lincoln-Seward Zone',
  'Drift Zone',
  'Danger Zone',
  'Displacement Zone',
]

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
  }) as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

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

  // Build overall feedback from AI's narrative plus what they did well/missed
  const feedbackParts: string[] = [raw.overallFeedback || '']

  if (raw.whatUserDidWell?.length > 0) {
    feedbackParts.push(
      '\n\n**What you did well:**\n' +
        raw.whatUserDidWell.map((w) => `• ${w}`).join('\n'),
    )
  }

  if (raw.whatUserMissed?.length > 0) {
    feedbackParts.push(
      '\n\n**What you missed:**\n' +
        raw.whatUserMissed.map((m) => `• ${m}`).join('\n'),
    )
  }

  // Build recommendations from alternative approaches
  const recommendations = (raw.alternativeApproaches || []).slice(0, 3)

  return {
    dimensions: orderedDimensions,
    compositeScore,
    band,
    patternMatches,
    overallFeedback: feedbackParts.join(''),
    recommendations,
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

async function callGripAPI(prompt: string): Promise<RawAIEvaluation | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        API_URL,
        { prompt },
        { timeout: REQUEST_TIMEOUT_MS },
      )

      if (response.data.success && response.data.result) {
        return response.data.result as RawAIEvaluation
      }
      // Non-success — don't retry on bad responses
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
      detectedPatterns: [],
      consequences: [],
      signals: dimSignals,
    }
  }) as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

  return {
    dimensions,
    compositeScore: 3.0,
    band: 'Drift Zone',
    patternMatches: [],
    overallFeedback: `This scenario ended after only ${userTurnCount} user turn${userTurnCount !== 1 ? 's' : ''}. There was not enough conversation to produce a meaningful GRIP evaluation. Consider replaying the scenario and engaging more deeply with the NPCs and AI assistant to get a full assessment.`,
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

  // Build all prompt components
  const formattedHistory = formatConversationForEvaluation(conversationHistory)
  const signalsSummary = formatSignalsSummary(evaluationSignals)
  const hiddenFactorStatus = formatHiddenFactorStatus(scenario, discoveredFactorIds)
  const guidanceText = formatEvaluationGuidance(evaluationGuidance)

  const prompt = buildEvaluationPrompt(
    scenario,
    formattedHistory,
    signalsSummary,
    hiddenFactorStatus,
    guidanceText,
    userTurnCount,
  )

  // First attempt
  let rawResult = await callGripAPI(prompt)

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
    rawResult = await callGripAPI(prompt)
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
    const retryResult = await callGripAPI(prompt)
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
      detectedPatterns: dimSignals.map((s) => `${s.polarity === 'positive' ? '+' : '-'} ${s.tag}`),
      consequences: [],
      signals: dimSignals,
    }
  }) as [DimensionResult, DimensionResult, DimensionResult, DimensionResult]

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
    recommendations: [
      'Replay this scenario when the evaluation service is available for detailed AI-powered feedback.',
      `You discovered ${discoveredCount}/${totalFactors} hidden factors — ${totalFactors - discoveredCount > 0 ? `try to uncover the remaining ${totalFactors - discoveredCount} on your next play-through.` : 'excellent discovery rate!'}`,
    ],
  }
}

// ---- Exports for Testing --------------------------------------------------

export {
  buildEvaluationPrompt,
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
