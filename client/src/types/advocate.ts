export type CriticalLens =
  | 'logical'
  | 'practical'
  | 'consequences'
  | 'stakeholder'
  | 'resources'

export interface Advocate {
  id: string
  provider: 'claude' | 'openai' | 'gemini' | 'deepseek'
  model: string
  lens: CriticalLens
  name: string
  description: string
  example: string
  color: string
}

export interface Critique {
  advocateId: string
  content: string
}

export interface UserIntent {
  cooperative: number
  defensive: number
  epistemic: number
  persuasive: number
  interpretation: string
}

export interface Round {
  roundNumber: number
  userMessage?: string
  userIntent?: UserIntent  // Stored but not shown during session
  critiques: Critique[]
}

export interface AdvocateSession {
  id: string
  proposal: string
  selectedAdvocates: Advocate[]
  rounds: Round[]
  status: 'setup' | 'proposing' | 'deliberating' | 'complete'
  currentRound: number
}

export interface PatternAnalysis {
  overallPattern: string
  turningPoint: number | null
  taizongParallel: string
  trajectory: 'improving' | 'stable' | 'worsening'
}

export interface KeyDismissal {
  criticism: string
  advocateId: string
  howDismissed: string
}

export interface SessionAnalysis {
  roundByRound: Array<{
    roundNumber: number
    userMessage: string
    intent: UserIntent
  }>
  trends: {
    defensiveness: number[]
    epistemicOpenness: number[]
    cooperation: number[]
    persuasive: number[]
  }
  pattern: PatternAnalysis
  keyDismissals: KeyDismissal[]
}
