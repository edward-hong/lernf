// ---------------------------------------------------------------------------
// AI Chat Response Generator
// ---------------------------------------------------------------------------
// Sends conversation history through the unified AI client (which respects
// user provider settings and fallback chain) and returns the response.
// ---------------------------------------------------------------------------

import { callAI } from '../api/aiClient'
import type { AIResponse } from '../types/aiRequest'
import type { ChatMessage } from '../state/liveChatState'

/**
 * Generates an AI response given the conversation history.
 *
 * Uses the unified `callAI()` client which respects user provider settings
 * (primary → backup → backend-default fallback chain).
 *
 * @param conversationHistory - Full conversation so far.
 * @returns Full AIResponse including content, provider, and model info.
 */
export async function generateAIResponse(
  conversationHistory: ChatMessage[],
): Promise<AIResponse> {
  try {
    const response = await callAI({
      messages: conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 500,
    })

    return response
  } catch (error) {
    console.error('Failed to generate AI response:', error)
    throw new Error(
      'Failed to generate response. Please check your AI provider settings.',
    )
  }
}
