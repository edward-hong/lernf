import type { CodeScenario, SelectedOption } from '../types/comparison'

export function evaluateOptions(
  scenario: CodeScenario,
  reasoning: string,
  selectedOption: SelectedOption,
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
