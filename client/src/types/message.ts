// ---------------------------------------------------------------------------
// Extended Message Types for Intent Visualization
// ---------------------------------------------------------------------------
// Extends the base ScenarioMessage with optional intent analysis data and
// provides settings for controlling the intent gradient overlay UI.
// ---------------------------------------------------------------------------

import type { IntentAnalysisResult } from './intent'
import type { ScenarioMessage } from './scenario'

/**
 * Extended ScenarioMessage with optional intent analysis.
 * Intent analysis is only present for AI/NPC messages that have been
 * processed by the intent analyzer.
 */
export interface ScenarioMessageWithIntent extends ScenarioMessage {
  /** Intent analysis result (only present for AI/NPC messages). */
  intentAnalysis?: IntentAnalysisResult
}

/**
 * Settings for controlling intent visualization rendering.
 */
export interface IntentVisualizationSettings {
  /** Enable/disable intent visualization. */
  enabled: boolean
  /** Smoothing factor for temporal blending (0–1). */
  smoothingFactor: number
  /** Show tooltip on hover with dimension breakdown. */
  showTooltip: boolean
  /** Rendering mode for intent visualization. */
  mode: 'spine' | 'background' | 'both'
}

/** Default visualization settings. */
export const DEFAULT_INTENT_SETTINGS: IntentVisualizationSettings = {
  enabled: true,
  smoothingFactor: 0.3,
  showTooltip: true,
  mode: 'spine',
}
