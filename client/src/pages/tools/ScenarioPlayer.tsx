import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScenarioStore } from '../../state/scenarioState'
import { ScenarioHeader } from '../../components/tools/Scenario/ScenarioHeader'
import { MessageBubble } from '../../components/tools/Scenario/MessageBubble'
import { MessageInput } from '../../components/tools/Scenario/MessageInput'
import { CompletionDialog } from '../../components/tools/Scenario/CompletionDialog'
import { ScenarioResults } from '../../components/tools/Scenario/ScenarioResults'
import { ScenarioSkeleton, ThinkingIndicator, EvaluationSpinner, InlineError } from '../../components/tools/Scenario/LoadingStates'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import {
  evaluateCompletion,
  createUserInitiatedResult,
  resetCompletionDetector,
} from '../../ai/completionDetector'
import { generateNPCResponse } from '../../ai/npcGenerator'
import { evaluateScenario } from '../../ai/gripEvaluator'
import { EVALUATION_GUIDANCE } from '../../data/scenarios/prod-incident-001'
import { recordAttempt } from '../../utils/progress'

interface ScenarioPlayerProps {
  scenarioId: string
}

function ScenarioPlayerInner({ scenarioId }: ScenarioPlayerProps) {
  const navigate = useNavigate()
  const {
    scenario,
    pendingCompletion,
    initializeScenario,
    addTurn,
    setPhase,
    checkCompletion,
    setPendingCompletion,
    clearScenario,
  } = useScenarioStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isNpcThinking, setIsNpcThinking] = useState(false)
  const [thinkingNpc, setThinkingNpc] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Memoize persona list
  const assignedPersonas = useMemo(() => {
    if (!scenario) return []
    return Object.values(scenario.assignedPersonas)
  }, [scenario?.assignedPersonas])

  // Initialize scenario if not already active
  useEffect(() => {
    if (!scenario || scenario.definition.id !== scenarioId) {
      setIsInitializing(true)
      try {
        resetCompletionDetector()
        initializeScenario(scenarioId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize scenario')
      } finally {
        setIsInitializing(false)
      }
    }
  }, [scenarioId, scenario, initializeScenario])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scenario?.messages.length, pendingCompletion, isNpcThinking])

  // Start the scenario
  const handleStartScenario = useCallback(async () => {
    if (!scenario) return
    setPhase('active')
    setError(null)

    // Add the initial system message
    addTurn({
      speakerType: 'system',
      speakerId: 'system',
      speakerName: 'Scenario',
      content: scenario.definition.setupContext,
      actions: [],
    })

    // Generate initial NPC responses
    for (const assigned of assignedPersonas) {
      setIsNpcThinking(true)
      setThinkingNpc(assigned.definition.name)
      try {
        const currentMessages = useScenarioStore.getState().scenario?.messages ?? []
        const response = await generateNPCResponse(
          assigned.definition.id,
          assigned.definition,
          currentMessages,
          scenario.definition.engineBriefing,
        )
        addTurn({
          speakerType: 'npc',
          speakerId: assigned.definition.id,
          speakerName: assigned.definition.name,
          content: response.content,
          actions: [],
        })
      } catch {
        // NPC generator has its own fallback responses
      }
    }
    setIsNpcThinking(false)
    setThinkingNpc(null)
  }, [scenario, assignedPersonas, setPhase, addTurn])

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!scenario || scenario.phase !== 'active') return
      setError(null)

      addTurn({
        speakerType: 'user',
        speakerId: 'user',
        speakerName: 'You',
        content,
        actions: [],
      })

      // Check simple heuristic
      const trigger = checkCompletion()
      if (trigger) {
        setPhase('wrapping-up')
      }

      // Pick responding NPC (round-robin)
      const currentMessages = useScenarioStore.getState().scenario?.messages ?? []
      const npcMessages = currentMessages.filter((m) => m.speakerType === 'npc')
      const respondingIndex = npcMessages.length % assignedPersonas.length
      const respondingPersona = assignedPersonas[respondingIndex]

      if (respondingPersona) {
        setIsNpcThinking(true)
        setThinkingNpc(respondingPersona.definition.name)

        try {
          const latestMessages = useScenarioStore.getState().scenario?.messages ?? []
          const response = await generateNPCResponse(
            respondingPersona.definition.id,
            respondingPersona.definition,
            latestMessages,
            scenario.definition.engineBriefing,
          )
          addTurn({
            speakerType: 'npc',
            speakerId: respondingPersona.definition.id,
            speakerName: respondingPersona.definition.name,
            content: response.content,
            actions: [],
          })
        } catch {
          setError('Failed to get a response. You can try sending another message.')
        } finally {
          setIsNpcThinking(false)
          setThinkingNpc(null)
        }
      }

      // Background completion evaluation
      const currentState = useScenarioStore.getState()
      if (
        currentState.scenario &&
        currentState.scenario.phase === 'active' &&
        !currentState.pendingCompletion
      ) {
        evaluateCompletion(
          currentState.scenario.definition,
          currentState.scenario.messages,
        ).then((result) => {
          if (result) {
            const latestState = useScenarioStore.getState()
            if (
              latestState.scenario &&
              latestState.scenario.phase !== 'completed' &&
              !latestState.pendingCompletion
            ) {
              setPendingCompletion(result)
            }
          }
        }).catch(() => {
          // Completion detection failure is non-critical
        })
      }
    },
    [scenario, assignedPersonas, addTurn, checkCompletion, setPhase, setPendingCompletion],
  )

  // User clicked "End Scenario"
  const handleEndScenario = useCallback(() => {
    if (!scenario || scenario.phase === 'completed') return
    const result = createUserInitiatedResult(scenario.messages)
    setPendingCompletion(result)
  }, [scenario, setPendingCompletion])

  // User confirmed completion — run GRIP evaluation
  const handleConfirmCompletion = useCallback(async () => {
    if (!scenario) return
    setPendingCompletion(null)
    setPhase('completed')
    setIsEvaluating(true)

    try {
      const evaluation = await evaluateScenario(
        scenario.definition,
        scenario.messages,
        scenario.signals,
        scenario.discoveredFactorIds,
        EVALUATION_GUIDANCE,
      )
      const store = useScenarioStore.getState()
      if (store.scenario) {
        useScenarioStore.setState({
          scenario: { ...store.scenario, evaluation },
        })
      }
    } catch {
      setError('Evaluation failed. Your scenario data is preserved — try refreshing the page.')
    } finally {
      setIsEvaluating(false)
    }
  }, [scenario, setPendingCompletion, setPhase])

  // User chose to keep going
  const handleKeepGoing = useCallback(() => {
    setPendingCompletion(null)
  }, [setPendingCompletion])

  // Results page actions
  const handleTryAgain = useCallback(() => {
    clearScenario()
    resetCompletionDetector()
    initializeScenario(scenarioId)
  }, [clearScenario, initializeScenario, scenarioId])

  const handleNextScenario = useCallback(() => {
    clearScenario()
    navigate('/practice/workplace-scenarios')
  }, [clearScenario, navigate])

  const handleViewProgress = useCallback(() => {
    navigate('/practice/progress')
  }, [navigate])

  // Record progress when scenario completes with evaluation
  const hasRecordedRef = useRef<string | null>(null)
  useEffect(() => {
    if (
      scenario?.phase === 'completed' &&
      scenario.evaluation &&
      scenario.completedAt &&
      hasRecordedRef.current !== scenario.startedAt
    ) {
      hasRecordedRef.current = scenario.startedAt
      recordAttempt({
        scenarioId: scenario.definition.id,
        scenarioTitle: scenario.definition.title,
        category: scenario.definition.category,
        gripFocus: scenario.definition.gripFocus,
        startedAt: scenario.startedAt,
        completedAt: scenario.completedAt,
        evaluation: scenario.evaluation,
        discoveredFactors: scenario.discoveredFactorIds.length,
        totalFactors: scenario.definition.hiddenFactors.length,
      })
    }
  }, [scenario?.phase, scenario?.evaluation])

  // Loading / initializing state
  if (isInitializing || !scenario) {
    return <ScenarioSkeleton />
  }

  // Briefing phase
  if (scenario.phase === 'briefing') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {scenario.definition.title}
        </h1>
        <p className="text-gray-500 mb-6">{scenario.definition.subtitle}</p>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Scenario Briefing
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700
            [&_p]:mb-3 [&_p]:leading-relaxed
            [&_strong]:font-semibold [&_strong]:text-gray-900
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
            [&_li]:mb-1 [&_li]:leading-relaxed
            [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-3
            [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-4 [&_h3]:mb-2
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {scenario.definition.setupContext}
            </ReactMarkdown>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Participants
          </h2>
          <div className="space-y-3" role="list" aria-label="Scenario participants">
            {assignedPersonas.map((assigned) => {
              const colors = scenario.colors.npcColors[assigned.colorSlot]
              return (
                <div key={assigned.definition.id} className="flex items-start gap-3" role="listitem">
                  <span
                    className={`mt-1 inline-block w-3 h-3 rounded-full ${colors.bg} border-2 ${colors.border}`}
                    aria-hidden="true"
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
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Start Scenario
        </button>
      </div>
    )
  }

  // Evaluating phase
  if (isEvaluating) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-gray-50">
        <EvaluationSpinner />
      </div>
    )
  }

  // Completed with evaluation: results dashboard
  if (scenario.phase === 'completed' && scenario.evaluation) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50">
        <ScenarioResults
          evaluation={scenario.evaluation}
          scenario={scenario.definition}
          discoveredFactorIds={scenario.discoveredFactorIds}
          onTryAgain={handleTryAgain}
          onNextScenario={handleNextScenario}
          onViewProgress={handleViewProgress}
        />
      </div>
    )
  }

  // Active / wrapping-up / completed without evaluation: conversation UI
  const isInputDisabled =
    scenario.phase === 'completed' ||
    pendingCompletion !== null ||
    isNpcThinking

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <ScenarioHeader scenario={scenario} onEndScenario={handleEndScenario} />

      <div
        className="flex-1 overflow-y-auto bg-gray-50"
        role="log"
        aria-label="Scenario conversation"
        aria-live="polite"
      >
        <div className="max-w-3xl mx-auto py-4">
          {scenario.messages.length === 0 && !isNpcThinking && (
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

          {isNpcThinking && (
            <ThinkingIndicator speakerName={thinkingNpc ?? undefined} />
          )}

          {error && (
            <InlineError message={error} onRetry={() => setError(null)} />
          )}

          {pendingCompletion && (
            <CompletionDialog
              result={pendingCompletion}
              onSeeResults={handleConfirmCompletion}
              onKeepGoing={handleKeepGoing}
            />
          )}

          {scenario.phase === 'wrapping-up' && !pendingCompletion && (
            <div className="text-center py-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scenario is wrapping up — you can continue or end the scenario
              </span>
            </div>
          )}

          {scenario.phase === 'completed' && !scenario.evaluation && !isEvaluating && (
            <div className="text-center py-6 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 border border-green-200 rounded-full px-4 py-1.5">
                Scenario completed
              </span>
              <p className="text-sm text-gray-500">Generating evaluation...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput
        onSend={handleSendMessage}
        disabled={isInputDisabled}
        placeholder={
          isNpcThinking
            ? `${thinkingNpc ?? 'NPC'} is responding...`
            : scenario.phase === 'completed'
              ? 'Scenario has ended'
              : pendingCompletion
                ? 'Respond to the prompt above to continue...'
                : 'Type your response...'
        }
      />
    </div>
  )
}

function ScenarioPlayer(props: ScenarioPlayerProps) {
  const clearScenario = useScenarioStore((s) => s.clearScenario)

  return (
    <ErrorBoundary
      onReset={() => {
        clearScenario()
        resetCompletionDetector()
      }}
    >
      <ScenarioPlayerInner {...props} />
    </ErrorBoundary>
  )
}

export default ScenarioPlayer
