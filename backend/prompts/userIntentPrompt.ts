/**
 * Analyzes how users respond to criticism.
 * Used to detect defensiveness, openness, etc.
 * Results are stored but NOT shown to user during session.
 */

export interface UserIntentScores {
  cooperative: number      // 0-1: Engaging vs. dismissing
  defensive: number        // 0-1: Defensive vs. open
  epistemic: number        // 0-1: Reconsidering vs. closed mind
  persuasive: number       // 0-1: Trying to convince vs. listening
}

export function buildUserIntentAnalysisPrompt(
  userResponse: string,
  previousCritiques: string[]
): string {
  return `Analyze how this person is responding to criticism.

PREVIOUS CRITICISMS THEY RECEIVED:
${previousCritiques.map((c, i) => `${i + 1}. ${c}`).join('\n\n')}

THEIR RESPONSE:
"${userResponse}"

Score their response across these dimensions (0.0 to 1.0):

1. COOPERATIVE (0-1):
   - 1.0 = Genuinely engaging with criticism, asking clarifying questions, showing curiosity
   - 0.5 = Acknowledging but not deeply engaging, surface-level response
   - 0.0 = Dismissing, ignoring, or deflecting criticism entirely

2. DEFENSIVE (0-1):
   - 1.0 = Highly defensive, making excuses, justifying without considering criticism
   - 0.5 = Some defensiveness but still engaging, protective but not closed
   - 0.0 = No defensiveness, fully open, willing to be wrong

3. EPISTEMIC OPENNESS (0-1):
   - 1.0 = Genuinely reconsidering their position, showing uncertainty, exploring alternatives
   - 0.5 = Considering criticism but not changing position, staying where they are
   - 0.0 = Completely closed mind, not considering alternatives at all

4. PERSUASIVE (0-1):
   - 1.0 = Actively trying to convince critics they're wrong, arguing back hard
   - 0.5 = Explaining their position but not aggressively pushing back
   - 0.0 = Not trying to persuade at all, purely listening and absorbing

Also provide a brief interpretation (1 sentence) of their overall response pattern.

Return ONLY valid JSON:
{
  "cooperative": 0.0-1.0,
  "defensive": 0.0-1.0,
  "epistemic": 0.0-1.0,
  "persuasive": 0.0-1.0,
  "interpretation": "One sentence interpretation"
}`
}

export interface PatternAnalysis {
  overallPattern: string
  turningPoint: number | null
  taizongParallel: string
  trajectory: 'improving' | 'stable' | 'worsening'
}

export function buildPatternAnalysisPrompt(
  rounds: Array<{
    roundNumber: number
    userMessage: string
    intent: UserIntentScores & { interpretation: string }
  }>
): string {
  const roundSummaries = rounds.map((r) => `
ROUND ${r.roundNumber}:
User said: "${r.userMessage}"
Intent scores:
- Cooperative: ${r.intent.cooperative.toFixed(2)}
- Defensive: ${r.intent.defensive.toFixed(2)}
- Epistemic Openness: ${r.intent.epistemic.toFixed(2)}
- Persuasive: ${r.intent.persuasive.toFixed(2)}
Interpretation: ${r.intent.interpretation}
`).join('\n')

  return `Analyze this person's pattern of responding to criticism over ${rounds.length} rounds.

${roundSummaries}

Provide:
1. Overall pattern description (2-3 sentences) - did they improve at listening, stay the same, or get worse?
2. Turning point round (if any) - which round did they become most defensive or closed?
3. Trajectory: "improving" (getting better at listening), "stable" (consistent), or "worsening" (getting more defensive)
4. Taizong parallel - brief (1-2 sentences) comparison to Emperor Taizong's pattern with Wei Zheng

Return ONLY valid JSON:
{
  "overallPattern": "Started receptive but became increasingly defensive as criticism mounted...",
  "turningPoint": 2,
  "taizongParallel": "Like Taizong, who welcomed Wei Zheng's criticism early in his reign but grew defensive over time...",
  "trajectory": "worsening"
}`
}

export function buildDismissalDetectionPrompt(
  critiques: Array<{ content: string; advocateId: string }>,
  userResponses: string[]
): string {
  return `Identify which key criticisms the user dismissed or failed to address.

CRITICISMS RAISED:
${critiques.map((c, i) => `${i + 1}. [${c.advocateId}]: ${c.content}`).join('\n\n')}

USER'S RESPONSES ACROSS ROUNDS:
${userResponses.map((r, i) => `Round ${i + 1}: "${r}"`).join('\n\n')}

Identify up to 3 key criticisms that:
- Were raised by advocates
- Were NOT adequately addressed by the user
- The user seemed to dodge, deflect, or stop responding to

For each, explain HOW they dismissed it (e.g., "Changed subject", "Stopped responding", "Made excuse without addressing core point")

Return ONLY valid JSON:
{
  "dismissals": [
    {
      "criticism": "Timeline is unrealistic",
      "advocateId": "claude-opus-logical",
      "howDismissed": "Defended with 'nights/weekends' in Round 2, then stopped addressing it in Round 3"
    }
  ]
}`
}
