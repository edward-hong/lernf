// ---------------------------------------------------------------------------
// Live Chat Hook
// ---------------------------------------------------------------------------
// Manages conversation state, AI response generation, and async intent
// analysis for the live chat interface.
// ---------------------------------------------------------------------------

import { useState, useCallback } from 'react'
import type { ChatMessage, LiveChatState } from '../state/liveChatState'
import { analyzeIntent } from '../ai/intentAnalyzer'
import { generateAIResponse } from '../ai/chatGenerator'

export function useLiveChat() {
  const [state, setState] = useState<LiveChatState>({
    messages: [],
    userInput: '',
    isResponding: false,
    intentVisualizationEnabled: true,
    smoothingFactor: 0.3,
  })

  /**
   * Send user message and get AI response.
   */
  const sendMessage = useCallback(async () => {
    if (!state.userInput.trim() || state.isResponding) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: state.userInput,
      timestamp: new Date(),
    }

    // Capture current messages before clearing input
    const currentMessages = state.messages

    // Add user message immediately
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      userInput: '',
      isResponding: true,
      error: undefined,
    }))

    try {
      // Generate AI response (returns full AIResponse with provider info)
      const conversationHistory = [...currentMessages, userMessage]
      const aiResult = await generateAIResponse(conversationHistory)

      const aiMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: aiResult.content,
        timestamp: new Date(),
        analyzingIntent: true,
        provider: aiResult.provider,
        model: aiResult.model,
      }

      // Add AI message
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isResponding: false,
      }))

      // Analyse intent asynchronously (don't block chat)
      if (state.intentVisualizationEnabled) {
        analyzeIntent(aiResult.content)
          .then((result) => {
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === aiMessage.id
                  ? { ...msg, intent: result.intent, analyzingIntent: false }
                  : msg,
              ),
            }))
          })
          .catch((err) => {
            console.error('Intent analysis failed:', err)
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === aiMessage.id
                  ? {
                      ...msg,
                      intent: {
                        epistemic: 0.5,
                        cooperative: 0.5,
                        persuasive: 0.5,
                        defensive: 0.5,
                        constraint: 0.5,
                        uncertainty: 0.5,
                      },
                      analyzingIntent: false,
                    }
                  : msg,
              ),
            }))
          })
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isResponding: false,
        error:
          error instanceof Error ? error.message : 'Failed to get response',
      }))
    }
  }, [state.userInput, state.isResponding, state.messages, state.intentVisualizationEnabled])

  const setUserInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, userInput: input }))
  }, [])

  const clearConversation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: undefined,
    }))
  }, [])

  const toggleIntentVisualization = useCallback(() => {
    setState((prev) => ({
      ...prev,
      intentVisualizationEnabled: !prev.intentVisualizationEnabled,
    }))
  }, [])

  const setSmoothingFactor = useCallback((factor: number) => {
    setState((prev) => ({
      ...prev,
      smoothingFactor: Math.max(0, Math.min(1, factor)),
    }))
  }, [])

  return {
    messages: state.messages,
    userInput: state.userInput,
    isResponding: state.isResponding,
    intentVisualizationEnabled: state.intentVisualizationEnabled,
    smoothingFactor: state.smoothingFactor,
    error: state.error,
    sendMessage,
    setUserInput,
    clearConversation,
    toggleIntentVisualization,
    setSmoothingFactor,
  }
}
