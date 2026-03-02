/**
 * Builds the prompt for evaluating whether a workplace training scenario
 * has reached a natural completion point.
 */
export function buildCompletionPrompt(
  scenarioDescription: string,
  conversationHistory: string,
  completionSignals: string,
): string {
  return `You are evaluating whether a workplace training scenario has reached a natural completion point.

## SCENARIO
${scenarioDescription}

## COMPLETION SIGNALS
${completionSignals}

## CONVERSATION HISTORY
${conversationHistory}

## YOUR TASK
Determine if this scenario has reached a natural conclusion. Return ONLY valid JSON:
{
  "scenarioComplete": true/false,
  "reasoning": "Brief explanation of why the scenario is or isn't complete",
  "suggestedPrompt": "If not complete, suggest what the user should explore next"
}`
}
