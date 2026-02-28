// ---------------------------------------------------------------------------
// Color Computation Test Data
// ---------------------------------------------------------------------------
// Reference test cases for verifying intent-to-colour conversion and temporal
// smoothing.  Each case includes the expected hue and full OKLCH string so
// that downstream tests can assert correctness.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'

export interface ColorTestCase {
  label: string
  intent: IntentVector
  expectedHue: number
  expectedColor: string
}

export interface SmoothingTestCase {
  label: string
  current: IntentVector
  previous: IntentVector
  smoothingFactor: number
  expected: IntentVector
}

export const COLOR_TEST_CASES: ColorTestCase[] = [
  {
    label: 'Pure Epistemic (Blue)',
    intent: {
      epistemic: 1.0,
      cooperative: 0.0,
      persuasive: 0.0,
      defensive: 0.0,
      constraint: 0.0,
      uncertainty: 0.0,
    },
    expectedHue: 240,
    expectedColor: 'oklch(0.75 0.12 240)',
  },
  {
    label: 'Pure Cooperative (Green)',
    intent: {
      epistemic: 0.0,
      cooperative: 1.0,
      persuasive: 0.0,
      defensive: 0.0,
      constraint: 0.0,
      uncertainty: 0.0,
    },
    expectedHue: 120,
    expectedColor: 'oklch(0.75 0.12 120)',
  },
  {
    label: 'Cooperative + Persuasive (Yellow-Green)',
    intent: {
      epistemic: 0.0,
      cooperative: 0.6,
      persuasive: 0.4,
      defensive: 0.0,
      constraint: 0.0,
      uncertainty: 0.0,
    },
    expectedHue: 96, // (120 * 0.6 + 60 * 0.4) / (0.6 + 0.4)
    expectedColor: 'oklch(0.75 0.12 96)',
  },
  {
    label: 'Defensive + Constraint (Orange-Red)',
    intent: {
      epistemic: 0.0,
      cooperative: 0.0,
      persuasive: 0.0,
      defensive: 0.7,
      constraint: 0.3,
      uncertainty: 0.0,
    },
    expectedHue: 21, // (30 * 0.7 + 0 * 0.3) / (0.7 + 0.3)
    expectedColor: 'oklch(0.75 0.12 21)',
  },
  {
    label: 'Balanced (All Equal)',
    intent: {
      epistemic: 0.5,
      cooperative: 0.5,
      persuasive: 0.5,
      defensive: 0.5,
      constraint: 0.5,
      uncertainty: 0.5,
    },
    // Weighted average: (240 + 120 + 60 + 30 + 0 + 280) * 0.5 / (6 * 0.5) = 730 / 6 ≈ 121.67
    expectedHue: 121.67,
    expectedColor: 'oklch(0.75 0.12 121.66666666666667)',
  },
]

export const SMOOTHING_TEST_CASES: SmoothingTestCase[] = [
  {
    label: 'Smooth from Green to Yellow',
    current: {
      epistemic: 0,
      cooperative: 0,
      persuasive: 1.0,
      defensive: 0,
      constraint: 0,
      uncertainty: 0,
    },
    previous: {
      epistemic: 0,
      cooperative: 1.0,
      persuasive: 0,
      defensive: 0,
      constraint: 0,
      uncertainty: 0,
    },
    smoothingFactor: 0.3,
    expected: {
      epistemic: 0,
      cooperative: 0.3,
      persuasive: 0.7,
      defensive: 0,
      constraint: 0,
      uncertainty: 0,
    },
  },
]
