export interface CodeOption {
  code: string
  approach: string
}

export interface CodeScenario {
  context: string
  optionA: CodeOption
  optionB: CodeOption
  correctAnswer: 'A' | 'B'
  reason: string
}

export type SelectedOption = 'A' | 'B'
