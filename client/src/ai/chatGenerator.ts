// ---------------------------------------------------------------------------
// AI Chat Response Generator
// ---------------------------------------------------------------------------
// Sends conversation history to the backend /api/chat endpoint (which
// proxies to DeepSeek) and returns the AI's response text.
// ---------------------------------------------------------------------------

import axios from 'axios'
import type { ChatMessage } from '../state/liveChatState'

const API_URL = 'http://localhost:4000/api/chat'
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Generates an AI response given the conversation history.
 *
 * @param conversationHistory - Full conversation so far.
 * @returns AI's response text.
 */
export async function generateAIResponse(
  conversationHistory: ChatMessage[],
): Promise<string> {
  const messages = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const response = await axios.post(
    API_URL,
    { messages },
    { timeout: REQUEST_TIMEOUT_MS },
  )

  if (!response.data.success || !response.data.output) {
    throw new Error('No response from AI')
  }

  return response.data.output
}
