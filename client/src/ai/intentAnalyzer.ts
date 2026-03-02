// ---------------------------------------------------------------------------
// Intent Analysis Engine
// ---------------------------------------------------------------------------
// Analyses an AI assistant's message across 6 behavioural dimensions and
// returns an IntentVector. Uses the unified AI client with provider fallback,
// plus localStorage caching to avoid redundant API calls.
// ---------------------------------------------------------------------------

import { callAI } from '../api/aiClient'
import type {
  IntentVector,
  IntentDimension,
  IntentAnalysisResult,
} from '../types/intent'
import {
  hashMessage,
  getCachedIntent,
  setCachedIntent,
  clearExpiredCache,
} from '../utils/intentCache'
import { buildIntentPrompt } from '../prompts/intentPrompt'

// ---- Configuration --------------------------------------------------------

const INTENT_DIMENSIONS: IntentDimension[] = [
  'epistemic',
  'cooperative',
  'persuasive',
  'defensive',
  'constraint',
  'uncertainty',
]

// ---- Neutral fallback -----------------------------------------------------

/** Returns a neutral IntentVector (all dimensions at 0.5). */
function neutralIntent(): IntentVector {
  return {
    epistemic: 0.5,
    cooperative: 0.5,
    persuasive: 0.5,
    defensive: 0.5,
    constraint: 0.5,
    uncertainty: 0.5,
  }
}

// ---- Parsing & Validation -------------------------------------------------

/**
 * Parses a raw JSON response into an IntentVector, clamping all values
 * to the 0–1 range. Throws if the response is not valid JSON or is
 * missing required dimensions.
 */
function parseIntentResponse(raw: string): IntentVector {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(cleaned)

  const vector: Record<string, number> = {}
  for (const dim of INTENT_DIMENSIONS) {
    const value = parsed[dim]
    if (typeof value !== 'number') {
      throw new Error(`Missing or non-numeric dimension: ${dim}`)
    }
    vector[dim] = Math.max(0, Math.min(1, value))
  }

  return vector as unknown as IntentVector
}

// ---- Primary / Secondary detection ----------------------------------------

/**
 * Returns the dimensions sorted by score descending. The first element is the
 * primary dimension; the second (if score > 0) is the secondary.
 */
function rankDimensions(
  intent: IntentVector,
): { primary: IntentDimension; secondary?: IntentDimension } {
  const ranked = INTENT_DIMENSIONS.slice().sort(
    (a, b) => intent[b] - intent[a],
  )

  const primary = ranked[0]
  const secondary =
    ranked.length > 1 && intent[ranked[1]] > 0 ? ranked[1] : undefined

  return { primary, secondary }
}

// ---- Public API -----------------------------------------------------------

/**
 * Analyses an AI message and returns an IntentAnalysisResult.
 *
 * 1. Hashes the message and checks the cache.
 * 2. On cache miss, calls the unified AI client (with provider fallback).
 * 3. Parses the response into an IntentVector.
 * 4. Identifies primary and secondary dimensions.
 * 5. Caches the result for future lookups.
 *
 * On any error (network, parsing, etc.) returns a neutral intent vector
 * (all dimensions at 0.5) so callers never need to handle failures.
 */
export async function analyzeIntent(
  message: string,
): Promise<IntentAnalysisResult> {
  // Housekeeping: clear stale cache entries
  clearExpiredCache()

  const hash = hashMessage(message)

  // 1. Check cache
  const cached = getCachedIntent(hash)
  if (cached) {
    const { primary, secondary } = rankDimensions(cached)
    return {
      intent: cached,
      primary,
      secondary,
      analyzedAt: new Date(),
      cached: true,
    }
  }

  // 2. Call unified AI client
  let intent: IntentVector
  try {
    const prompt = buildIntentPrompt(message)

    const response = await callAI({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0, // Deterministic for consistency
      maxTokens: 200, // Intent response is small
    })

    intent = parseIntentResponse(response.content)
  } catch (error) {
    console.warn('[intentAnalyzer] Analysis failed, returning neutral intent:', error)
    intent = neutralIntent()
  }

  // 3. Cache result
  setCachedIntent(hash, intent)

  // 4. Rank dimensions
  const { primary, secondary } = rankDimensions(intent)

  return {
    intent,
    primary,
    secondary,
    analyzedAt: new Date(),
    cached: false,
  }
}

// ---- Exports for testing --------------------------------------------------

export {
  buildIntentPrompt,
  parseIntentResponse,
  rankDimensions,
  neutralIntent,
  INTENT_DIMENSIONS,
}
