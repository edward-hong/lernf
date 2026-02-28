// ---------------------------------------------------------------------------
// Intent Analysis Types
// ---------------------------------------------------------------------------
// Type definitions for the intent gradient overlay feature. The IntentVector
// captures AI behavioural patterns across 6 dimensions, enabling visual
// representation of AI response intent through colour gradients.
// ---------------------------------------------------------------------------

/**
 * Intent vector representing AI behavioural patterns across 6 dimensions.
 * Each dimension scores 0–1 where higher values indicate stronger presence.
 */
export interface IntentVector {
  /** Epistemic Neutrality: exploring possibilities vs. advocating for specific answers. */
  epistemic: number
  /** Cooperation / Helpfulness: assisting user's goals vs. pursuing its own agenda. */
  cooperative: number
  /** Persuasion / Steering: guiding user toward specific conclusions or actions. */
  persuasive: number
  /** Defensiveness / Refusal: resisting, hedging, or refusing user's direction. */
  defensive: number
  /** Constraint / Safety Enforcement: enforcing rules, policies, or boundaries. */
  constraint: number
  /** Uncertainty / Hedging: expressing doubt, qualifying statements. */
  uncertainty: number
}

/** The six dimension keys that make up an IntentVector. */
export type IntentDimension = keyof IntentVector

/**
 * Result from intent analysis including the vector and metadata.
 */
export interface IntentAnalysisResult {
  intent: IntentVector
  /** Primary dimension (highest scoring). */
  primary: IntentDimension
  /** Secondary dimension (second highest). */
  secondary?: IntentDimension
  /** Timestamp of analysis. */
  analyzedAt: Date
  /** Whether this result was served from cache. */
  cached?: boolean
}

/**
 * Cached intent analysis entry stored in localStorage.
 */
export interface CachedIntent {
  messageHash: string
  intent: IntentVector
  timestamp: number
}
