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
