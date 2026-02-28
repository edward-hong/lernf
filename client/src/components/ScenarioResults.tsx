// ---------------------------------------------------------------------------
// Scenario Results — GRIP Evaluation Dashboard
// ---------------------------------------------------------------------------
// Displays the full GRIP evaluation results after a scenario completes.
// Includes score bars, pattern detection, consequences, feedback sections,
// hidden factor reveals, alternative approaches, and action buttons.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import type {
  GripEvaluation,
  DimensionResult,
  GripDimension,
  PatternMatch,
  ScenarioDefinition,
  HiddenFactor,
} from '../types/scenario'
import { GRIP_LABELS } from '../types/scenario'

// ---- Props ----------------------------------------------------------------

interface ScenarioResultsProps {
  evaluation: GripEvaluation
  scenario: ScenarioDefinition
  discoveredFactorIds: string[]
  onTryAgain: () => void
  onNextScenario: () => void
  onViewProgress: () => void
}

// ---- Score Color Helpers --------------------------------------------------

type ScoreColorBand = 'red' | 'amber' | 'green'

function getScoreColorBand(score: number): ScoreColorBand {
  if (score <= 2) return 'red'
  if (score === 3) return 'amber'
  return 'green'
}

const SCORE_BAR_COLORS: Record<ScoreColorBand, { bg: string; fill: string; text: string; border: string }> = {
  red: { bg: 'bg-red-100', fill: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' },
  amber: { bg: 'bg-amber-100', fill: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  green: { bg: 'bg-green-100', fill: 'bg-green-500', text: 'text-green-700', border: 'border-green-200' },
}

const BAND_COLORS: Record<GripEvaluation['band'], { bg: string; text: string; border: string }> = {
  'Elizabeth-Cecil Zone': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Lincoln-Seward Zone': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Drift Zone': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Danger Zone': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Displacement Zone': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

// ---- Pattern Type Helpers -------------------------------------------------

type PatternType = 'parasitic' | 'dangerous' | 'transition' | 'generative'

function getPatternType(position: number): PatternType {
  if (position <= 4) return 'parasitic'
  if (position <= 6) return 'dangerous'
  if (position === 7) return 'transition'
  return 'generative'
}

const PATTERN_STYLES: Record<PatternType, { bg: string; border: string; text: string; icon: string }> = {
  parasitic: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: '!' },
  dangerous: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', icon: '!' },
  transition: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', icon: '~' },
  generative: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: '+' },
}

const PATTERN_DESCRIPTIONS: Record<PatternType, string> = {
  parasitic: 'Parasitic Pattern Detected',
  dangerous: 'Dangerous Pattern Detected',
  transition: 'Transition Pattern Detected',
  generative: 'Generative Pattern Detected',
}

// ---- Dimension Labels for Display -----------------------------------------

const DIMENSION_LETTERS: Record<GripDimension, string> = {
  G: 'G',
  R: 'R',
  I: 'I',
  P: 'P',
}

// ---- Sub-Components -------------------------------------------------------

/** Single GRIP dimension score bar with expandable details. */
function DimensionScoreBar({ result }: { result: DimensionResult }) {
  const [expanded, setExpanded] = useState(false)
  const colorBand = getScoreColorBand(result.score)
  const colors = SCORE_BAR_COLORS[colorBand]
  const fillPercent = (result.score / 5) * 100

  return (
    <div className="mb-4">
      {/* Score bar header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left group"
      >
        <div className="flex items-center gap-3 mb-1.5">
          {/* Dimension letter badge */}
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${colors.text} ${colors.bg}`}>
            {DIMENSION_LETTERS[result.dimension]}
          </span>

          {/* Label and score */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-900">
                {GRIP_LABELS[result.dimension]}
              </span>
              <span className={`text-sm font-semibold ${colors.text} ml-2`}>
                {result.score}/5
                <span className="font-normal text-gray-400 ml-1.5 text-xs">
                  {result.scoreLabel}
                </span>
              </span>
            </div>

            {/* Score bar */}
            <div className={`mt-1 h-2.5 rounded-full ${colors.bg} overflow-hidden`}>
              <div
                className={`h-full rounded-full ${colors.fill} transition-all duration-700 ease-out`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* Expand chevron */}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className={`ml-11 mt-2 p-3 rounded-lg border ${colors.border} ${colors.bg} bg-opacity-50`}>
          {/* Summary */}
          <p className="text-sm text-gray-700 mb-3">{result.summary}</p>

          {/* Examples */}
          {result.examples.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Evidence
              </h4>
              <ul className="space-y-1">
                {result.examples.map((ex, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5 shrink-0">&bull;</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected Patterns */}
          {result.detectedPatterns.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Detected Patterns
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.detectedPatterns.map((pattern, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Consequences */}
          {result.consequences.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Projected Consequences
              </h4>
              <ul className="space-y-1">
                {result.consequences.map((c, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">&rarr;</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Pattern match callout card. */
function PatternCallout({ pattern }: { pattern: PatternMatch }) {
  const type = getPatternType(pattern.position)
  const styles = PATTERN_STYLES[type]
  const strengthPercent = Math.round(pattern.matchStrength * 100)

  return (
    <div className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg} mb-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}>
              {PATTERN_DESCRIPTIONS[type]}
            </span>
            <span className="text-xs text-gray-400">
              {strengthPercent}% match
            </span>
          </div>
          <h4 className={`text-sm font-bold ${styles.text}`}>
            {pattern.name}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Historical parallel: <span className="font-medium">{pattern.historicalCase}</span>
          </p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          Position {pattern.position}/10
        </span>
      </div>
      {type === 'parasitic' || type === 'dangerous' ? (
        <p className="text-xs text-gray-500 mt-2 italic">
          This pattern historically led to degraded decision-making and increased dependency. Review the case study to understand the dynamics.
        </p>
      ) : type === 'generative' ? (
        <p className="text-xs text-gray-500 mt-2 italic">
          This pattern reflects productive human-AI collaboration. The historical case demonstrates sustained value from maintaining this dynamic.
        </p>
      ) : null}
    </div>
  )
}

/** Hidden factor reveal card. */
function HiddenFactorCard({
  factor,
  discovered,
}: {
  factor: HiddenFactor
  discovered: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const dimensionLabel = GRIP_LABELS[factor.gripDimension]

  return (
    <div className={`p-4 rounded-lg border ${discovered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} mb-3`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className={`mt-0.5 shrink-0 text-sm ${discovered ? 'text-green-500' : 'text-gray-400'}`}>
              {discovered ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <div className="min-w-0">
              <span className={`text-sm font-medium ${discovered ? 'text-green-800' : 'text-gray-700'}`}>
                {factor.what}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-mono">
              {factor.gripDimension}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 ml-6 space-y-2">
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why It Matters</h5>
            <p className="text-sm text-gray-600 mt-0.5">{factor.whyItMatters}</p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">How to Discover</h5>
            <p className="text-sm text-gray-600 mt-0.5">{factor.howToDiscover}</p>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">GRIP Connection</h5>
            <p className="text-sm text-gray-600 mt-0.5">{dimensionLabel}</p>
          </div>
        </div>
      )}
    </div>
  )
}

/** Collapsible section wrapper. */
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

// ---- Main Component -------------------------------------------------------

export function ScenarioResults({
  evaluation,
  scenario,
  discoveredFactorIds,
  onTryAgain,
  onNextScenario,
  onViewProgress,
}: ScenarioResultsProps) {
  const bandColors = BAND_COLORS[evaluation.band]
  const discoveredCount = discoveredFactorIds.length
  const totalFactors = scenario.hiddenFactors.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ---- Header with composite score ---- */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Scenario Evaluation
        </h1>
        <p className="text-gray-500 text-sm mb-4">{scenario.title}</p>

        {/* Composite score badge */}
        <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border ${bandColors.border} ${bandColors.bg}`}>
          <span className={`text-3xl font-bold ${bandColors.text}`}>
            {evaluation.compositeScore.toFixed(1)}
          </span>
          <div className="text-left">
            <span className={`text-sm font-semibold ${bandColors.text}`}>
              {evaluation.band}
            </span>
            <span className="block text-xs text-gray-500">
              {discoveredCount}/{totalFactors} hidden factors discovered
            </span>
          </div>
        </div>
      </div>

      {/* ---- Section 1: GRIP Score Dashboard ---- */}
      <CollapsibleSection title="GRIP Score Dashboard" defaultOpen>
        <div className="pt-3">
          {evaluation.dimensions.map((dim) => (
            <DimensionScoreBar key={dim.dimension} result={dim} />
          ))}
        </div>
      </CollapsibleSection>

      {/* ---- Section 2: Pattern Detection ---- */}
      {evaluation.patternMatches.length > 0 && (
        <CollapsibleSection title="Pattern Detection" defaultOpen>
          <div className="pt-3">
            {evaluation.patternMatches.map((pattern, i) => (
              <PatternCallout key={i} pattern={pattern} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ---- Section 3: What Happened (Consequences) ---- */}
      <CollapsibleSection title="What Happened" defaultOpen>
        <div className="pt-3">
          <div className="prose prose-sm max-w-none text-gray-700">
            {evaluation.overallFeedback.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
            ))}
          </div>

          {/* Per-dimension consequences */}
          {evaluation.dimensions.some((d) => d.consequences.length > 0) && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Key Outcomes
              </h4>
              <ul className="space-y-1.5">
                {evaluation.dimensions.flatMap((dim) =>
                  dim.consequences.map((c, i) => (
                    <li key={`${dim.dimension}-${i}`} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono shrink-0 mt-0.5">
                        {dim.dimension}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ---- Section 4: What You Did Well ---- */}
      {evaluation.whatUserDidWell.length > 0 && (
        <CollapsibleSection title="What You Did Well" defaultOpen>
          <div className="pt-3">
            <ul className="space-y-2">
              {evaluation.whatUserDidWell.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-green-500 mt-0.5 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleSection>
      )}

      {/* ---- Section 5: What You Missed (Hidden Factors) ---- */}
      <CollapsibleSection title="What You Missed">
        <div className="pt-3">
          <p className="text-sm text-gray-500 mb-3">
            {discoveredCount === totalFactors
              ? 'You discovered all hidden factors. Excellent investigative work!'
              : `You discovered ${discoveredCount} of ${totalFactors} hidden factors. Here's what was happening beneath the surface:`}
          </p>
          {scenario.hiddenFactors.map((factor) => (
            <HiddenFactorCard
              key={factor.id}
              factor={factor}
              discovered={discoveredFactorIds.includes(factor.id)}
            />
          ))}

          {/* AI-identified missed items */}
          {evaluation.whatUserMissed.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Additional Observations
              </h4>
              <ul className="space-y-2">
                {evaluation.whatUserMissed.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-amber-500 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ---- Section 6: Alternative Approaches ---- */}
      {evaluation.alternativeApproaches.length > 0 && (
        <CollapsibleSection title="Alternative Approaches">
          <div className="pt-3 space-y-3">
            {evaluation.alternativeApproaches.map((approach, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-blue-500 font-bold text-sm mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-gray-700">{approach}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ---- Section 7: Action Buttons ---- */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onTryAgain}
          className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Try Different Approach
        </button>
        <button
          onClick={onNextScenario}
          className="flex-1 py-3 px-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
        >
          Next Scenario
        </button>
        <button
          onClick={onViewProgress}
          className="flex-1 py-3 px-4 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
        >
          View Progress
        </button>
      </div>
    </div>
  )
}
