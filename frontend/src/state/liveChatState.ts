// ---------------------------------------------------------------------------
// Live Chat State Types
// ---------------------------------------------------------------------------
// State types for the live chat interface where users converse with AI
// and see intent gradients appear in real-time.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  /** Intent analysis (only for assistant messages). */
  intent?: IntentVector
  /** Whether intent is currently being analysed. */
  analyzingIntent?: boolean
  /** Provider that generated this message (only for assistant messages). */
  provider?: string
  /** Model used to generate this message (only for assistant messages). */
  model?: string
}

export interface LiveChatState {
  messages: ChatMessage[]
  /** Current user input. */
  userInput: string
  /** Whether AI is currently responding. */
  isResponding: boolean
  /** Whether intent visualization is enabled. */
  intentVisualizationEnabled: boolean
  /** Smoothing factor for intent transitions. */
  smoothingFactor: number
  /** Error state. */
  error?: string
}

export const initialLiveChatState: LiveChatState = {
  messages: [],
  userInput: '',
  isResponding: false,
  intentVisualizationEnabled: true,
  smoothingFactor: 0.3,
}
