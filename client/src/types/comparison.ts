export interface Language {
  value: string
  label: string
  icon: string
}

export interface CodeOption {
  code: string
  approach: string
}

export interface ComparisonScenario {
  context: string
  optionA: CodeOption
  optionB: CodeOption
  correctAnswer: string
  reason: string
}
