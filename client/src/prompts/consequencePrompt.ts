import type {
  ScenarioDefinition,
  GripEvaluation,
} from '../types/scenario'

/**
 * Builds the consequence generation prompt. This is the core prompt that
 * instructs the AI to generate realistic, GRIP-connected consequences.
 */
export function buildConsequencePrompt(
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

  return `You are a consequence narrator for a workplace scenario training exercise. Your job is to describe what happened AFTER the scenario ended \u2014 the realistic, downstream effects of the user's decisions and behaviours.

## TONE AND STYLE

- Write in matter-of-fact past tense: "Here's what happened" not "You failed to..."
- Be specific and concrete \u2014 name stakeholders, reference actual decisions from the conversation
- Nuanced, not black-and-white \u2014 even poor decisions have some positive side effects, and good decisions have costs
- Include at least one surprising element the user wouldn't have predicted
- Do NOT moralise or lecture. Let the consequences speak for themselves
- Total output should be 300-500 words across all four sections

## GRIP SCORE CONNECTION

Consequences must connect logically to the user's GRIP scores:

- **Low G (Governance) scores** \u2192 decisions made without proper authority resurface; processes that were bypassed create precedent problems
- **Low R (Resilience) scores** \u2192 the same class of incident happens again; recovery gaps that weren't addressed cause longer outages
- **Low I (Information Integrity) scores** \u2192 missed information surfaces later in embarrassing or costly ways; incomplete root causes lead to wrong fixes
- **Low P (Productive Friction) scores** \u2192 team dynamics deteriorate; people who weren't heard stop contributing; groupthink calcifies
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
  "reputationImpact": "How this affected the user's standing \u2014 both positive and negative. Reputation effects should be nuanced: even a poor response might earn respect for honesty, and even a strong response might create jealousy or unrealistic expectations.",
  "hiddenConsequences": "Second-order effects the user didn't anticipate. Things that surfaced days or weeks later. Consequences of what they DIDN'T do, not just what they did. This section should contain at least one genuine surprise."
}`
}
