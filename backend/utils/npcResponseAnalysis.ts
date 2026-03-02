/**
 * Categorizes NPC responses to detect problematic patterns
 */

export type ResponseType =
  | 'question'        // Good: Asking user for info
  | 'demand'          // Good: Demanding user action
  | 'challenge'       // Good: Pushing back on user's idea
  | 'acknowledgment'  // Neutral: "Got it", "Okay"
  | 'explanation'     // Bad: Explaining what to do
  | 'auto-solve'      // Bad: Solving the problem

export function categorizeNPCResponse(response: string): ResponseType {
  const normalized = response.toLowerCase()

  // Auto-solve patterns (highest priority - most problematic)
  if (
    /first.*then/i.test(response) ||
    /step 1.*step 2/i.test(response) ||
    /here's what (you need to|to) do/i.test(response) ||
    /i'll (check|fix|handle)/i.test(response)
  ) {
    return 'auto-solve'
  }

  // Explanation patterns (also problematic)
  if (
    /you should/i.test(response) ||
    /you need to/i.test(response) ||
    /the (solution|fix|answer) is/i.test(response)
  ) {
    return 'explanation'
  }

  // Question patterns (good!)
  if (
    normalized.includes('?') ||
    /^(what|when|where|why|how|have you|did you|can you)/i.test(response)
  ) {
    return 'question'
  }

  // Demand patterns (good!)
  if (
    /show me/i.test(response) ||
    /tell me/i.test(response) ||
    /check (the|your)/i.test(response) ||
    /^(verify|confirm|look at)/i.test(response)
  ) {
    return 'demand'
  }

  // Challenge patterns (good!)
  if (
    /that (won't|doesn't|wouldn't) work/i.test(response) ||
    /have you considered/i.test(response) ||
    /are you sure/i.test(response)
  ) {
    return 'challenge'
  }

  // Acknowledgment (neutral)
  if (
    /^(okay|ok|got it|understood|alright|good)/i.test(normalized) &&
    response.length < 50
  ) {
    return 'acknowledgment'
  }

  // Default to explanation if unclear
  return 'explanation'
}

export function isProblematicResponse(type: ResponseType): boolean {
  return type === 'auto-solve' || type === 'explanation'
}

/** Regex patterns that indicate auto-solving behavior */
export const AUTO_SOLVING_PATTERNS = [
  /first.*then.*finally/i,
  /step 1.*step 2/i,
  /here'?s what (you need to|to) do:/i,
  /here are the steps/i,
  /i'?ll (check|fix|handle|look into|review)/i,
  /let me (check|review|handle|look into|fix)/i,
  /you'?ll (see|find|notice|observe) (that|the)/i,
  /the (logs|dashboard|metrics) (will )?show/i,
  /then (check|look at|review|identify)/i,
]

/** Corrective system message injected when auto-solving is detected */
export const AUTO_SOLVE_CORRECTION = `STOP. You just gave a step-by-step solution. That is wrong.

The user must drive all actions. You are a COWORKER, not a tutor.

Instead of explaining what to do, ask the user a SHORT question (1 sentence) that makes THEM think and act.

Examples:
- "What do the logs show?"
- "When did this start?"
- "What's your hypothesis?"
- "Have you checked X yet?"

DO NOT give multi-step instructions. DO NOT solve for them. Ask ONE question.`

/** Generic fallback when regeneration still produces auto-solving */
export const FALLBACK_PROBE = 'What have you checked so far?'
