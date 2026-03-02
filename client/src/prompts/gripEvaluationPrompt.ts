import type { ScenarioDefinition } from '../types/scenario'

/**
 * Builds the comprehensive GRIP evaluation prompt. This is the core of the
 * evaluation engine -- it encodes the full scoring rubric, the historical
 * spectrum, and all the context the AI needs to produce a structured evaluation.
 */
export function buildEvaluationPrompt(
  scenario: ScenarioDefinition,
  conversationHistory: string,
  signalsSummary: string,
  hiddenFactorStatus: string,
  evaluationGuidance: string,
  userTurnCount: number,
  minTurnsForFullEvaluation: number,
): string {
  const isShortConversation = userTurnCount < minTurnsForFullEvaluation

  return `You are an expert evaluator for the GRIP framework \u2014 a model for assessing human-AI collaboration quality in workplace scenarios.

## GRIP FRAMEWORK

GRIP evaluates four dimensions of how humans work with AI:

**G \u2014 Governance & Guardrails:** Does the user maintain decision authority? Do they establish and enforce boundaries on AI recommendations? Do they question governance shortcuts?

**R \u2014 Resilience & Readiness:** Does the user verify recovery mechanisms? Do they question detection gaps? Do they build resilience beyond "make it work"?

**I \u2014 Information Integrity:** Does the user seek multiple information sources? Do they question narrow AI analysis? Do they avoid anchoring on the first explanation?

**P \u2014 Productive Friction:** Does the user leverage disagreement constructively? Do they create psychological safety? Do they resist premature closure?

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

1. **Total Displacement** (Wei Zhongxian / Tianqi) \u2014 Principal disengages; subordinate fills vacuum
2. **Information Filter** (Sejanus / Tiberius) \u2014 Single channel constructs reality
3. **Insecurity Weaponised** (Qin Hui / Gaozong) \u2014 Advisor exploits pre-existing fears
4. **Emotional Dependency** (Rasputin / Romanovs) \u2014 Emotional need overrides institutional info
5. **Competent Replacement** (Al-Mansur / Hisham II) \u2014 Brilliant subordinate replaces capacity
6. **Structural Dependency** (Fouch\u00e9 / Napoleon) \u2014 Proprietary knowledge creates lock-in
7. **Sycophancy Equilibrium** (Mao / Zhou) \u2014 Partnership degrades into agreement-seeking
8. **Gold Standard** (Elizabeth / Cecil) \u2014 40-year sustained productive friction
9. **Institutionalised Remonstrance** (Taizong / Wei Zheng) \u2014 Disagreement as state function
10. **Rivals to Partners** (Lincoln / Seward) \u2014 Boundary-setting moment defines partnership

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
This conversation had only ${userTurnCount} user turns \u2014 fewer than the ${minTurnsForFullEvaluation} typically needed for meaningful evaluation. Score conservatively and note the limited evidence in your summaries. Do not penalise the user for things they didn't have time to explore, but do note what was left unexplored.
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
- Note what the user did well (positive reinforcement \u2014 be specific and genuine)
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
