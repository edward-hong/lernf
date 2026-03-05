// ---------------------------------------------------------------------------
// Intent Temporal Smoothing
// ---------------------------------------------------------------------------
// Provides exponential-moving-average smoothing to prevent jarring colour
// transitions between conversation turns, and utilities for extracting
// dominant intent dimensions from a vector.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'

/**
 * Smooths the current intent vector with the previous one using an
 * exponential moving average.  This prevents jarring colour transitions
 * between successive conversation turns.
 *
 * @param current - Current turn's intent vector.
 * @param previous - Previous turn's intent vector (omit for the first turn).
 * @param smoothingFactor - Weight given to the previous vector (0–1, default 0.3).
 * @returns Smoothed intent vector.
 */
export function smoothIntent(
  current: IntentVector,
  previous?: IntentVector,
  smoothingFactor: number = 0.3,
): IntentVector {
  if (!previous) return current

  const alpha = Math.max(0, Math.min(1, smoothingFactor))

  return {
    epistemic: current.epistemic * (1 - alpha) + previous.epistemic * alpha,
    cooperative:
      current.cooperative * (1 - alpha) + previous.cooperative * alpha,
    persuasive: current.persuasive * (1 - alpha) + previous.persuasive * alpha,
    defensive: current.defensive * (1 - alpha) + previous.defensive * alpha,
    constraint: current.constraint * (1 - alpha) + previous.constraint * alpha,
    uncertainty:
      current.uncertainty * (1 - alpha) + previous.uncertainty * alpha,
  }
}

/**
 * Returns intent dimensions sorted by score (highest first), filtered to
 * those above the given threshold.
 *
 * @param intent - Intent vector.
 * @param threshold - Minimum score to be considered dominant (default 0.3).
 * @returns Array of `[dimension, score]` tuples sorted descending by score.
 */
export function getDominantDimensions(
  intent: IntentVector,
  threshold: number = 0.3,
): Array<[keyof IntentVector, number]> {
  return (Object.entries(intent) as Array<[keyof IntentVector, number]>)
    .filter(([, score]) => score >= threshold)
    .sort((a, b) => b[1] - a[1])
}
