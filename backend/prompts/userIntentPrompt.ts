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
