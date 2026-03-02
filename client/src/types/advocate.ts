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

export interface AdvocateSession {
  id: string
  proposal: string
  selectedAdvocates: Advocate[]
  critiques: Critique[]
  status: 'setup' | 'proposing' | 'deliberating' | 'complete'
}
