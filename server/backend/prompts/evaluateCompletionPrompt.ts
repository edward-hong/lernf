/**
 * Builds the prompt for evaluating whether a workplace scenario role-play
 * training exercise has reached a natural completion point.
 */
export function buildEvaluateCompletionPrompt(
  scenarioDescription: string,
  conversationHistory: string,
  completionSignals: string | undefined,
): string {
  return `You are an evaluator for a workplace scenario role-play training exercise.

SCENARIO DESCRIPTION:
${scenarioDescription}

COMPLETION SIGNALS (indicators that the scenario has reached a natural conclusion):
${completionSignals}

CONVERSATION HISTORY:
${conversationHistory}

Analyze the conversation and determine if the scenario has reached a natural completion point. A scenario is complete when the user has meaningfully engaged with the core challenge and either:
- Reached a decision or resolution on the main issue
- Discovered and addressed the key hidden dynamics
- Exhausted the productive avenues of exploration
- Arrived at a clear action plan or conclusion

If the scenario is NOT complete, suggest what the user should explore next (without revealing hidden information).

Return ONLY valid JSON in this exact format:
{
  "scenarioComplete": true or false,
  "reasoning": "Brief explanation of why the scenario is or isn't complete",
  "suggestedPrompt": "If not complete, a natural next question or action for the user. Empty string if complete."
}`
}
