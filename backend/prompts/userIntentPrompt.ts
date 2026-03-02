/**
 * Analyzes how users respond to criticism.
 * Used to detect defensiveness, openness, etc.
 * Results are stored but NOT shown to user during session.
 * Pattern analysis runs at session end to summarize trajectory.
 */

export interface UserIntentScores {
  cooperative: number      // 0-1: Engaging vs. dismissing
  defensive: number        // 0-1: Defensive vs. open
  epistemic: number        // 0-1: Reconsidering vs. closed mind
  persuasive: number       // 0-1: Trying to convince vs. listening
}

export interface SessionPatternAnalysis {
  overallTrajectory: 'growth' | 'entrenchment' | 'mixed' | 'consistent'
  trajectoryDescription: string
  defensivenessTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating'
  opennessTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating'
  keyDismissals: string[]
  strongestMoment: string
  blindSpots: string[]
  weiZhengReflection: string
  selfReflectionPrompts: string[]
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

export function buildSessionPatternAnalysisPrompt(
  proposal: string,
  rounds: Array<{
    roundNumber: number
    userMessage?: string
    userIntent?: UserIntentScores & { interpretation: string }
    critiques: Array<{ advocateId: string; content: string }>
  }>
): string {
  const roundSummaries = rounds
    .filter(r => r.userMessage)
    .map(r => {
      const intentStr = r.userIntent
        ? `Intent scores: cooperative=${r.userIntent.cooperative.toFixed(2)}, defensive=${r.userIntent.defensive.toFixed(2)}, epistemic=${r.userIntent.epistemic.toFixed(2)}, persuasive=${r.userIntent.persuasive.toFixed(2)}. ${r.userIntent.interpretation}`
        : 'No intent data.'
      return `ROUND ${r.roundNumber}:
Critiques received: ${r.critiques.map(c => c.content).join(' | ')}
User response: "${r.userMessage}"
${intentStr}`
    })
    .join('\n\n')

  return `Analyze the OVERALL PATTERN of how this person responded to sustained criticism across multiple rounds.

ORIGINAL PROPOSAL:
"${proposal}"

SESSION HISTORY:
${roundSummaries}

Analyze the trajectory of their responses. Look for:
- Did defensiveness increase or decrease over rounds?
- Did epistemic openness grow or shrink?
- Were there specific critiques they consistently dismissed?
- What was their strongest moment of genuine engagement?
- What blind spots persisted despite repeated criticism?

Also provide a Wei Zheng reflection - Emperor Taizong valued Wei Zheng as his "mirror" because Wei Zheng showed him what he couldn't see about himself. What would Wei Zheng say to this person about their pattern of responding to criticism?

Return ONLY valid JSON:
{
  "overallTrajectory": "growth" | "entrenchment" | "mixed" | "consistent",
  "trajectoryDescription": "2-3 sentence summary of how they evolved across rounds",
  "defensivenessTrend": "increasing" | "decreasing" | "stable" | "fluctuating",
  "opennessTrend": "increasing" | "decreasing" | "stable" | "fluctuating",
  "keyDismissals": ["critique they brushed off #1", "critique they brushed off #2"],
  "strongestMoment": "Description of their best moment of genuine engagement",
  "blindSpots": ["persistent blind spot #1", "persistent blind spot #2"],
  "weiZhengReflection": "What Wei Zheng would say to this person (2-3 sentences, written as direct address)",
  "selfReflectionPrompts": [
    "Thought-provoking question #1 for the user to consider",
    "Thought-provoking question #2",
    "Thought-provoking question #3"
  ]
}`
}
