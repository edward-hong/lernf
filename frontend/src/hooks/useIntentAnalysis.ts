// ---------------------------------------------------------------------------
// useIntentAnalysis — Async Intent Analysis Hook
// ---------------------------------------------------------------------------
// Triggers intent analysis for an AI/NPC message and returns the result with
// loading and error states. Supports caching via the Zustand store and
// debounces rapid message arrivals to avoid unnecessary API calls.
// ---------------------------------------------------------------------------

import { useEffect, useState, useRef } from 'react'
import { analyzeIntent } from '../ai/intentAnalyzer'
import type { IntentVector, IntentAnalysisResult } from '../types/intent'

interface UseIntentAnalysisProps {
  /** The AI/NPC message content to analyze. */
  message: string
  /** Whether intent analysis is enabled. */
  enabled: boolean
  /** Cache key (e.g., turn index) to prevent duplicate analyses. */
  cacheKey: string
  /** Cached intent result if already available (skips analysis). */
  cachedResult?: IntentAnalysisResult
}

interface UseIntentAnalysisReturn {
  /** The analyzed intent vector (undefined while loading or if disabled). */
  intent?: IntentVector
  /** The full analysis result (undefined while loading or if disabled). */
  result?: IntentAnalysisResult
  /** Whether analysis is currently in progress. */
  isAnalyzing: boolean
  /** Analysis error, if any. */
  error?: Error
}

/** Debounce delay (ms) to prevent rapid successive API calls. */
const DEBOUNCE_MS = 300

/**
 * Hook that triggers asynchronous intent analysis for a message.
 *
 * - Returns cached result immediately when available.
 * - Debounces new analysis requests by 300ms.
 * - Provides a neutral fallback (all 0.5) on error.
 * - Cleans up in-flight requests on unmount.
 */
export function useIntentAnalysis({
  message,
  enabled,
  cacheKey,
  cachedResult,
}: UseIntentAnalysisProps): UseIntentAnalysisReturn {
  const [result, setResult] = useState<IntentAnalysisResult | undefined>(cachedResult)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<Error>()

  // Track the most recent cacheKey to avoid stale updates
  const activeCacheKeyRef = useRef(cacheKey)
  activeCacheKeyRef.current = cacheKey

  useEffect(() => {
    // If cached result is available, use it directly
    if (cachedResult) {
      setResult(cachedResult)
      setIsAnalyzing(false)
      setError(undefined)
      return
    }

    // Skip if disabled or no message
    if (!enabled || !message) {
      return
    }

    let cancelled = false

    const timer = setTimeout(() => {
      setIsAnalyzing(true)
      setError(undefined)

      analyzeIntent(message)
        .then((analysisResult) => {
          if (!cancelled && activeCacheKeyRef.current === cacheKey) {
            setResult(analysisResult)
            setIsAnalyzing(false)
          }
        })
        .catch((err) => {
          if (!cancelled && activeCacheKeyRef.current === cacheKey) {
            const analysisError =
              err instanceof Error ? err : new Error('Intent analysis failed')
            setError(analysisError)
            setIsAnalyzing(false)

            // Provide neutral fallback so the UI can still render
            setResult({
              intent: {
                epistemic: 0.5,
                cooperative: 0.5,
                persuasive: 0.5,
                defensive: 0.5,
                constraint: 0.5,
                uncertainty: 0.5,
              },
              primary: 'epistemic',
              analyzedAt: new Date(),
              cached: false,
            })
          }
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [message, enabled, cacheKey, cachedResult])

  return {
    intent: result?.intent,
    result,
    isAnalyzing,
    error,
  }
}
