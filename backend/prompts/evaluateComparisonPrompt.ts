interface CodeOption {
  code: string
  approach: string
}

interface ComparisonScenario {
  context: string
  optionA: CodeOption
  optionB: CodeOption
  correctAnswer: string
  reason: string
}

/**
 * Builds the prompt for evaluating a user's code comparison answer.
 */
export function buildEvaluateComparisonPrompt(
  scenario: ComparisonScenario,
  reasoning: string,
  selectedOption: string
): string {
  return `Context: ${scenario.context}

Option A: ${scenario.optionA.code}
Option B: ${scenario.optionB.code}

I selected: Option ${selectedOption}
I's reasoning: ${reasoning}

The correct answer is Option ${scenario.correctAnswer} because: ${scenario.reason}

Evaluate my answer:
1. Did I select the correct option?
2. How good was my reasoning?
3. What did I miss?
4. Provide constructive feedback.

Keep the evaluation concise but helpful (3-5 sentences).`
}
