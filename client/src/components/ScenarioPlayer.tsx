import { useEffect, useRef, useCallback } from 'react'
import { useScenarioStore } from '../state/scenarioState'
import { ScenarioHeader } from './ScenarioHeader'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ScenarioPlayerProps {
  scenarioId: string
}

export function ScenarioPlayer({ scenarioId }: ScenarioPlayerProps) {
  const {
    scenario,
    initializeScenario,
    addTurn,
    setPhase,
    checkCompletion,
    clearScenario,
  } = useScenarioStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize scenario if not already active
  useEffect(() => {
    if (!scenario || scenario.definition.id !== scenarioId) {
      initializeScenario(scenarioId)
    }
  }, [scenarioId, scenario, initializeScenario])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scenario?.messages.length])

  // Start the scenario when it's in briefing phase (user has seen the context)
  const handleStartScenario = useCallback(() => {
    if (!scenario) return
    setPhase('active')
    // Add the initial system message with the setup context
    addTurn({
      speakerType: 'system',
      speakerId: 'system',
      speakerName: 'Scenario',
      content: scenario.definition.setupContext,
      actions: [],
    })
  }, [scenario, setPhase, addTurn])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (!scenario || scenario.phase !== 'active') return

      addTurn({
        speakerType: 'user',
        speakerId: 'user',
        speakerName: 'You',
        content,
        actions: [],
      })

      // Check if the scenario should wrap up
      const trigger = checkCompletion()
      if (trigger) {
        setPhase('wrapping-up')
      }
    },
    [scenario, addTurn, checkCompletion, setPhase],
  )

  const handleEndScenario = useCallback(() => {
    if (!scenario) return
    setPhase('completed')
  }, [scenario, setPhase])

  // Loading state
  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-sm">Loading scenario...</div>
      </div>
    )
  }

  // Briefing phase: show setup context before starting
  if (scenario.phase === 'briefing') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {scenario.definition.title}
        </h1>
        <p className="text-gray-500 mb-6">{scenario.definition.subtitle}</p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Scenario Briefing
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {scenario.definition.setupContext}
          </div>
        </div>

        {/* Participants preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Participants
          </h2>
          <div className="space-y-3">
            {Object.values(scenario.assignedPersonas).map((assigned) => {
              const colors = scenario.colors.npcColors[assigned.colorSlot]
              return (
                <div key={assigned.definition.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-block w-3 h-3 rounded-full ${colors.bg} border-2 ${colors.border}`}
                  />
                  <div>
                    <span className={`text-sm font-medium ${colors.label}`}>
                      {assigned.definition.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 capitalize">
                      {assigned.definition.role}
                    </span>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {assigned.definition.background}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleStartScenario}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Scenario
        </button>
      </div>
    )
  }

  // Active / wrapping-up / completed: show conversation UI
  const isInputDisabled = scenario.phase === 'completed'

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <ScenarioHeader scenario={scenario} onEndScenario={handleEndScenario} />

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto py-4">
          {scenario.messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-12">
              The scenario is starting...
            </div>
          )}

          {scenario.messages.map((message) => (
            <MessageBubble
              key={message.turnIndex}
              message={message}
              colors={scenario.colors}
            />
          ))}

          {/* Wrapping-up indicator */}
          {scenario.phase === 'wrapping-up' && (
            <div className="text-center py-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scenario is wrapping up — you can continue or end the scenario
              </span>
            </div>
          )}

          {/* Completed indicator */}
          {scenario.phase === 'completed' && (
            <div className="text-center py-6 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-1.5">
                Scenario completed
              </span>
              <div>
                <button
                  onClick={clearScenario}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Return to scenarios
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isInputDisabled}
        placeholder={
          isInputDisabled
            ? 'Scenario has ended'
            : 'Type your response...'
        }
      />
    </div>
  )
}
