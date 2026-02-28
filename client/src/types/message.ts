// ---------------------------------------------------------------------------
// Intent-Aware Message Types
// ---------------------------------------------------------------------------
// Extends the base ScenarioMessage with optional intent analysis data and
// defines settings for the intent visualisation overlay.
// ---------------------------------------------------------------------------

import type { IntentAnalysisResult } from './intent'
import type { ScenarioMessage } from './scenario'

/**
 * A scenario message optionally annotated with intent analysis.
 * Only AI messages will have `intentAnalysis` populated.
 */
export interface TurnWithIntent extends ScenarioMessage {
  intentAnalysis?: IntentAnalysisResult
}

/**
 * User-configurable settings for the intent visualisation overlay.
 */
export interface IntentVisualizationSettings {
  /** Whether the intent spine and related UI are visible. */
  enabled: boolean
  /** Weight given to the previous turn when blending (0–1). */
  smoothingFactor: number
  /** Show the intent label and hover tooltip on AI messages. */
  showTooltip: boolean
  /** Rendering mode for the visualisation. */
  mode: 'spine' | 'background' | 'both'
}
