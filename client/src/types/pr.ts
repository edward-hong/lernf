export interface DiffLine {
  lineNumber: number
  type: 'added' | 'removed' | 'context'
  content: string
  hasIssue: boolean
  issueId?: string
}

export interface Issue {
  id: string
  lineNumber: number
  severity: 'low' | 'medium' | 'high'
  title: string
  explanation: string
  fix: string
}

export interface PRScenario {
  title: string
  description: string
  language: string
  diff: DiffLine[]
  issues: Issue[]
}

export interface EvaluationResult {
  total: number
  found: number
  missed: number
  falsePositives: number
  foundIssues: Issue[]
  missedIssues: Issue[]
  score: number
}
