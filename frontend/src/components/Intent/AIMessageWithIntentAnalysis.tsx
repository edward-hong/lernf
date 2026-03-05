// ---------------------------------------------------------------------------
// AI Message with Intent Analysis Wrapper
// ---------------------------------------------------------------------------
// Wraps AIMessageWithIntent, triggering async intent analysis via the
// useIntentAnalysis hook and caching results in the Zustand store. Passes
// loading state and analyzed intent data down to the presentational component.
// ---------------------------------------------------------------------------

import { useEffect, useCallback, useRef } from 'react'
import { useIntentAnalysis } from '../../hooks/useIntentAnalysis'
import { AIMessageWithIntent } from './AIMessageWithIntent'
import type { ScenarioMessage, ScenarioColorConfig } from '../../types/scenario'
import type { IntentVector, IntentAnalysisResult } from '../../types/intent'
import type { IntentVisualizationSettings } from '../../types/message'

interface AIMessageWithIntentAnalysisProps {
  /** The scenario message to render. */
  message: ScenarioMessage
  /** Colour configuration for the scenario session. */
  colors: ScenarioColorConfig
  /** Intent visualization settings. */
  settings: IntentVisualizationSettings
  /** Previous AI/NPC message's intent (for temporal smoothing). */
  previousIntent?: IntentVector
  /** Pre-cached intent analysis result (if available). */
  cachedResult?: IntentAnalysisResult
  /** Called when intent analysis completes, so parent can track previous intent. */
  onIntentAnalyzed?: (turnIndex: number, result: IntentAnalysisResult) => void
}

export function AIMessageWithIntentAnalysis({
  message,
  colors,
  settings,
  previousIntent,
  cachedResult,
  onIntentAnalyzed,
}: AIMessageWithIntentAnalysisProps) {
  // Run async analysis (skips automatically if cached or disabled)
  const { result, isAnalyzing } = useIntentAnalysis({
    message: message.content,
    enabled: settings.enabled,
    cacheKey: `turn-${message.turnIndex}`,
    cachedResult,
  })

  // Notify parent when analysis completes
  const stableOnIntentAnalyzed = useCallback(
    (turnIndex: number, r: IntentAnalysisResult) => {
      onIntentAnalyzed?.(turnIndex, r)
    },
    [onIntentAnalyzed],
  )

  const notifiedRef = useRef(false)
  useEffect(() => {
    if (result && !isAnalyzing && !notifiedRef.current) {
      notifiedRef.current = true
      stableOnIntentAnalyzed(message.turnIndex, result)
    }
  }, [result, isAnalyzing, message.turnIndex, stableOnIntentAnalyzed])

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
