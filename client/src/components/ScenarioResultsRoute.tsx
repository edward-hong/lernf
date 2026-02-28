// ---------------------------------------------------------------------------
// Scenario Results Route — /scenarios/:id/results
// ---------------------------------------------------------------------------
// Standalone route for viewing results of a completed scenario. Reads from
// the Zustand store. If no completed scenario matches, redirects to library.
// ---------------------------------------------------------------------------

import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useScenarioStore } from '../state/scenarioState'
import { ScenarioResults } from './ScenarioResults'
import { resetCompletionDetector } from '../ai/completionDetector'

interface ScenarioResultsRouteProps {
  scenarioId: string
}

export function ScenarioResultsRoute({ scenarioId }: ScenarioResultsRouteProps) {
  const navigate = useNavigate()
  const scenario = useScenarioStore((s) => s.scenario)
  const clearScenario = useScenarioStore((s) => s.clearScenario)
  const initializeScenario = useScenarioStore((s) => s.initializeScenario)

  const handleTryAgain = useCallback(() => {
    clearScenario()
    resetCompletionDetector()
    initializeScenario(scenarioId)
    navigate(`/practice/workplace-scenarios/${scenarioId}`)
  }, [clearScenario, initializeScenario, scenarioId, navigate])

  const handleNextScenario = useCallback(() => {
    clearScenario()
    navigate('/practice/workplace-scenarios')
  }, [clearScenario, navigate])

  const handleViewProgress = useCallback(() => {
    navigate('/practice/progress')
  }, [navigate])

  // If no matching completed scenario, redirect to library
  if (
    !scenario ||
    scenario.definition.id !== scenarioId ||
    scenario.phase !== 'completed' ||
    !scenario.evaluation
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">No results available for this scenario.</p>
        <button
          onClick={() => navigate('/practice/workplace-scenarios')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Scenario Library
        </button>
      </div>
    )
  }

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
