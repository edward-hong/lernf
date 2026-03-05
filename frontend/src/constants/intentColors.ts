// ---------------------------------------------------------------------------
// Intent Color Anchors
// ---------------------------------------------------------------------------
// Maps each intent dimension to an OKLCH hue for visual gradient rendering.
// OKLCH is chosen for perceptual uniformity — equal chroma/lightness steps
// produce equal perceived brightness differences.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'

/**
 * Color anchor for a single intent dimension in OKLCH color space.
 * OKLCH components: Lightness (0–1), Chroma (0–0.4), Hue (0–360).
 */
export interface ColorAnchor {
  dimension: keyof IntentVector
  hue: number // 0–360 degrees
  label: string // Human-readable label
  gripDimension: 'G' | 'R' | 'I' | 'P' // Which GRIP dimension this relates to
}

export const INTENT_COLOR_ANCHORS: Record<keyof IntentVector, ColorAnchor> = {
  epistemic: {
    dimension: 'epistemic',
    hue: 240, // Blue
    label: 'Exploring',
    gripDimension: 'I',
  },
  cooperative: {
    dimension: 'cooperative',
    hue: 120, // Green
    label: 'Assisting',
    gripDimension: 'G',
  },
  persuasive: {
    dimension: 'persuasive',
    hue: 60, // Yellow
    label: 'Steering',
    gripDimension: 'G',
  },
  defensive: {
    dimension: 'defensive',
    hue: 30, // Orange
    label: 'Resisting',
    gripDimension: 'P',
  },
  constraint: {
    dimension: 'constraint',
    hue: 0, // Red
    label: 'Enforcing',
    gripDimension: 'G',
  },
  uncertainty: {
    dimension: 'uncertainty',
    hue: 280, // Purple
    label: 'Uncertain',
    gripDimension: 'I',
  },
}

/** Fixed lightness for all intent-derived colours. */
export const INTENT_COLOR_LIGHTNESS = 0.75

/** Fixed chroma for all intent-derived colours. */
export const INTENT_COLOR_CHROMA = 0.12
