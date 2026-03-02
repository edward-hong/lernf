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

export interface SessionPatternAnalysis {
  overallTrajectory: 'growth' | 'entrenchment' | 'mixed' | 'consistent'
  trajectoryDescription: string
  defensivenessTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating'
  opennessTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating'
  keyDismissals: string[]
  strongestMoment: string
  blindSpots: string[]
  weiZhengReflection: string
  selfReflectionPrompts: string[]
}

export interface IntentHistoryEntry {
  roundNumber: number
  intent: UserIntent
}

export interface SessionAnalysisResult {
  analysis: SessionPatternAnalysis
  intentHistory: IntentHistoryEntry[]
}

export interface AdvocateSession {
  id: string
  proposal: string
  selectedAdvocates: Advocate[]
  rounds: Round[]
  status: 'setup' | 'proposing' | 'deliberating' | 'complete' | 'analysis'
  currentRound: number
  analysisResult?: SessionAnalysisResult
}
