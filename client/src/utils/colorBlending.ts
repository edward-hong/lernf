// ---------------------------------------------------------------------------
// Color Blending – Intent Vector → OKLCH
// ---------------------------------------------------------------------------
// Converts a 6-dimension intent vector into a single OKLCH colour string by
// computing a weighted-average hue.  Also provides hex conversion, border
// gradient CSS, and human-readable intent labels.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'
import {
  INTENT_COLOR_ANCHORS,
  INTENT_COLOR_LIGHTNESS,
  INTENT_COLOR_CHROMA,
} from '../constants/intentColors'
import { getDominantDimensions } from './intentSmoothing'

/**
 * Converts an intent vector to a single OKLCH colour string.
 * Blends multiple dimensions using a weighted average of hues.
 *
 * @param intent - Intent vector with 6 dimensions (0–1 each).
 * @returns OKLCH colour string, e.g. `"oklch(0.75 0.12 180)"`.
 */
export function intentToColor(intent: IntentVector): string {
  let totalWeight = 0
  let weightedHue = 0

  ;(Object.keys(intent) as Array<keyof IntentVector>).forEach((dimension) => {
    const score = intent[dimension]
    const anchor = INTENT_COLOR_ANCHORS[dimension]

    totalWeight += score
    weightedHue += anchor.hue * score
  })

  // Default to neutral epistemic blue when all scores are zero.
  const avgHue = totalWeight > 0 ? weightedHue / totalWeight : 240

  return `oklch(${INTENT_COLOR_LIGHTNESS} ${INTENT_COLOR_CHROMA} ${avgHue})`
}

/**
 * Approximate conversion from an OKLCH colour string to a hex colour string.
 *
 * Full OKLCH → sRGB conversion is complex; this function treats OKLCH values
 * as rough HSL equivalents which is sufficient for the intent overlay MVP.
 *
 * @param oklch - OKLCH colour string, e.g. `"oklch(0.75 0.12 180)"`.
 * @returns Hex colour string, e.g. `"#3b82f6"`.
 */
export function oklchToHex(oklch: string): string {
  const match = oklch.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/)
  if (!match) return '#808080'

  const l = Number(match[1])
  const c = Number(match[2])
  const h = Number(match[3])

  // Approximate mapping: OKLCH lightness → HSL lightness, chroma → saturation.
  return hslToHex(h, c * 100, l * 100)
}

/**
 * Generates a CSS `border-image` value for a solid left-border gradient based
 * on the intent vector.
 *
 * @param intent - Intent vector.
 * @returns CSS `border-image` value string.
 */
export function intentToBorderGradient(intent: IntentVector): string {
  const color = intentToColor(intent)
  return `linear-gradient(to bottom, ${color}, ${color}) 1`
}

/**
 * Returns a human-readable label describing the dominant intent(s).
 *
 * @param intent - Intent vector.
 * @returns Label such as `"Assisting & Steering"` or `"Neutral"`.
 */
export function getIntentLabel(intent: IntentVector): string {
  const dominant = getDominantDimensions(intent, 0.3)

  if (dominant.length === 0) return 'Neutral'
  if (dominant.length === 1) return INTENT_COLOR_ANCHORS[dominant[0][0]].label

  const top2 = dominant.slice(0, 2)
  return top2.map(([dim]) => INTENT_COLOR_ANCHORS[dim].label).join(' & ')
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Converts HSL values to a hex colour string. */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
