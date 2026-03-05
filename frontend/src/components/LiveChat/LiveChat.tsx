// ---------------------------------------------------------------------------
// Live Chat Interface with Real-Time Intent Visualization
// ---------------------------------------------------------------------------
// Full-screen chat where users converse with AI and see intent gradients
// appear in real-time on AI responses. Includes sidebar with conversation
// timeline, pattern alerts, legend, and smoothing controls.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLiveChat } from '../../hooks/useLiveChat'
import { ConversationTimeline } from './ConversationTimeline'
import { PatternAlerts } from './PatternAlerts'
import { IntentTooltip } from '../Intent/IntentTooltip'
import { ProviderIndicator } from '../Provider/ProviderIndicator'
import { intentToColor, getIntentLabel } from '../../utils/colorBlending'
import { smoothIntent } from '../../utils/intentSmoothing'
import { INTENT_COLOR_ANCHORS } from '../../constants/intentColors'
import type { IntentVector } from '../../types/intent'

export function LiveChat() {
  const {
    messages,
    userInput,
    isResponding,
    intentVisualizationEnabled,
    smoothingFactor,
    error,
    sendMessage,
    setUserInput,
    clearConversation,
    toggleIntentVisualization,
    setSmoothingFactor,
  } = useLiveChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Get the previous AI intent for smoothing (second-to-last AI message)
  const aiMessagesWithIntent = messages.filter(
    (msg) => msg.role === 'assistant' && msg.intent,
  )
  const previousAIIntent =
    aiMessagesWithIntent.length >= 2
      ? aiMessagesWithIntent[aiMessagesWithIntent.length - 2].intent
      : undefined

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/practice/ai-intent" className="hover:text-blue-600 transition-colors">
            AI Intent Analysis
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-900 font-medium">Live Chat</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Live AI Chat with Intent Visualization
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Practice recognising AI behavioural patterns in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearConversation}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={messages.length === 0}
              type="button"
            >
              Clear Chat
            </button>
            <button
              onClick={toggleIntentVisualization}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                intentVisualizationEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              type="button"
            >
              {intentVisualizationEnabled ? 'Intent: ON' : 'Intent: OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">&#x1F4AC;</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Start a Conversation
                  </h2>
                  <p className="text-gray-600">
                    Chat with AI and watch intent patterns emerge in real-time.
                    Try asking it to help you with something and notice how the
                    gradient changes.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => {
                  if (message.role === 'user') {
                    return (
                      <div key={message.id} className="flex justify-end">
                        <div className="max-w-[80%] bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            You
                          </div>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // AI message with intent spine
                  const isAnalyzing = message.analyzingIntent ?? false

                  // Compute smoothed intent for colour
                  const smoothedIntent =
                    message.intent && intentVisualizationEnabled
                      ? smoothIntent(
                          message.intent,
                          previousAIIntent,
                          smoothingFactor,
                        )
                      : undefined

                  const spineColor =
                    isAnalyzing || !smoothedIntent
                      ? '#d1d5db'
                      : intentToColor(smoothedIntent)

                  const intentLabel = smoothedIntent
                    ? getIntentLabel(smoothedIntent)
                    : undefined

                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="max-w-[80%]">
                        <div
                          className={`relative rounded-lg rounded-tl-sm overflow-hidden px-4 py-3 transition-all duration-300 bg-indigo-50 ${
                            intentVisualizationEnabled
                              ? ''
                              : 'border-l-4 border-indigo-300'
                          }`}
                          style={
                            intentVisualizationEnabled
                              ? { borderLeft: `6px solid ${spineColor}` }
                              : undefined
                          }
                        >
                          {/* Speaker name + intent label + provider */}
                          <div className="flex items-center gap-2">
                            <span className="block text-xs font-semibold text-indigo-700">
                              AI
                            </span>
                            {isAnalyzing && intentVisualizationEnabled && (
                              <span className="text-xs font-normal text-gray-400 animate-pulse">
                                Analysing...
                              </span>
                            )}
                            {!isAnalyzing &&
                              intentVisualizationEnabled &&
                              intentLabel && (
                                <span className="text-xs font-normal text-gray-400">
                                  ({intentLabel})
                                </span>
                              )}
                            {message.provider && message.model && (
                              <ProviderIndicator
                                provider={message.provider}
                                model={message.model}
                              />
                            )}
                          </div>

                          {/* Message content */}
                          <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap break-words">
                            {message.content}
                          </p>

                          {/* Intent tooltip */}
                          {!isAnalyzing &&
                            intentVisualizationEnabled &&
                            smoothedIntent && (
                              <IntentTooltip
                                intent={smoothedIntent}
                                previousIntent={previousAIIntent}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Typing indicator */}
                {isResponding && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="rounded-lg rounded-tl-sm bg-indigo-50 border-l-4 border-gray-300 px-4 py-3">
                        <span className="block text-xs font-semibold text-indigo-700 mb-1">
                          AI
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-800">Error: {error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isResponding}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim() || isResponding}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isResponding ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar: Timeline, Alerts & Controls */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-white overflow-y-auto p-4 space-y-4">
          <ConversationTimeline messages={messages} />

          <PatternAlerts messages={messages} />

          {/* Inline Legend */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Intent Colours
            </h3>
            <div className="space-y-2">
              {(
                Object.entries(INTENT_COLOR_ANCHORS) as Array<
                  [
                    keyof IntentVector,
                    (typeof INTENT_COLOR_ANCHORS)[keyof IntentVector],
                  ]
                >
              ).map(([dimension, anchor]) => {
                const color = `oklch(0.75 0.12 ${anchor.hue})`
                return (
                  <div key={dimension} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-700">{anchor.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {anchor.gripDimension}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Smoothing Control */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temporal Smoothing
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={smoothingFactor * 100}
              onChange={(e) => setSmoothingFactor(Number(e.target.value) / 100)}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(smoothingFactor * 100)}% — How much colours blend
              with previous turn
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
