// ---------------------------------------------------------------------------
// AI Message with Intent Analysis Wrapper
// ---------------------------------------------------------------------------
// Wraps AIMessageWithIntent, triggering async intent analysis via the
// useIntentAnalysis hook and caching results in the Zustand store. Passes
// loading state and analyzed intent data down to the presentational component.
// ---------------------------------------------------------------------------

import { useEffect, useCallback } from 'react'
import { useIntentAnalysis } from '../hooks/useIntentAnalysis'
import { AIMessageWithIntent } from './AIMessageWithIntent'
import { useScenarioStore } from '../state/scenarioState'
import type { ScenarioMessage, ScenarioColorConfig } from '../types/scenario'
import type { IntentVector, IntentAnalysisResult } from '../types/intent'
import type { IntentVisualizationSettings } from '../types/message'

interface AIMessageWithIntentAnalysisProps {
  /** The scenario message to render. */
  message: ScenarioMessage
  /** Colour configuration for the scenario session. */
  colors: ScenarioColorConfig
  /** Intent visualization settings. */
  settings: IntentVisualizationSettings
  /** Previous AI/NPC message's intent (for temporal smoothing). */
  previousIntent?: IntentVector
  /** Called when intent analysis completes, so parent can track previous intent. */
  onIntentAnalyzed?: (turnIndex: number, result: IntentAnalysisResult) => void
}

export function AIMessageWithIntentAnalysis({
  message,
  colors,
  settings,
  previousIntent,
  onIntentAnalyzed,
}: AIMessageWithIntentAnalysisProps) {
  // Check the Zustand store for a cached result
  const cachedResult = useScenarioStore(
    (s) => s.intentCache[message.turnIndex],
  )
  const setIntentResult = useScenarioStore((s) => s.setIntentResult)

  // Run async analysis (skips automatically if cached or disabled)
  const { result, isAnalyzing } = useIntentAnalysis({
    message: message.content,
    enabled: settings.enabled,
    cacheKey: `turn-${message.turnIndex}`,
    cachedResult,
  })

  // Cache result in the store and notify parent
  const stableOnIntentAnalyzed = useCallback(
    (turnIndex: number, r: IntentAnalysisResult) => {
      onIntentAnalyzed?.(turnIndex, r)
    },
    [onIntentAnalyzed],
  )

  useEffect(() => {
    if (result && !isAnalyzing && !cachedResult) {
      setIntentResult(message.turnIndex, result)
      stableOnIntentAnalyzed(message.turnIndex, result)
    }
  }, [result, isAnalyzing, cachedResult, message.turnIndex, setIntentResult, stableOnIntentAnalyzed])

  return (
    <AIMessageWithIntent
      message={message}
      intentAnalysis={result}
      previousIntent={previousIntent}
      colors={colors}
      settings={settings}
      isAnalyzing={isAnalyzing}
    />
  )
}
