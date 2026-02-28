// ---------------------------------------------------------------------------
// Scenario Card — Individual scenario display for the library grid
// ---------------------------------------------------------------------------
// Shows title, category, GRIP focus, difficulty proxy, completion status,
// attempt count, and last GRIP scores. Provides Start / Resume / Replay
// buttons depending on the scenario's state.
// ---------------------------------------------------------------------------

import { Link } from 'react-router-dom'
import type { GripDimension, ScenarioCategory } from '../types/scenario'
import { GRIP_LABELS } from '../types/scenario'
import type { ScenarioProgressInfo } from '../utils/progress'

// ---- Props ----------------------------------------------------------------

export interface ScenarioCardProps {
  scenarioId: string
  title: string
  subtitle: string
  category: ScenarioCategory
  gripFocus: GripDimension[]
  estimatedTurns: number
  progress: ScenarioProgressInfo
  /** Whether there is a live in-progress session for this scenario. */
  hasActiveSession: boolean
}

// ---- Category Labels & Colors ---------------------------------------------

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  'ai-delegation': 'AI Delegation',
  'information-filtering': 'Info Filtering',
  'capability-atrophy': 'Capability Atrophy',
  'emotional-dependency': 'Emotional Dependency',
  'role-clarity': 'Role Clarity',
  'institutional-memory': 'Institutional Memory',
}

const CATEGORY_COLORS: Record<ScenarioCategory, { bg: string; text: string }> = {
  'ai-delegation': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'information-filtering': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'capability-atrophy': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'emotional-dependency': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'role-clarity': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'institutional-memory': { bg: 'bg-amber-100', text: 'text-amber-700' },
}

// ---- Status Badge ---------------------------------------------------------

const STATUS_CONFIG = {
  'not-started': {
    label: 'Not Started',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  'in-progress': {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
} as const

// ---- Score Color ----------------------------------------------------------

function getScoreColor(score: number): string {
  if (score <= 2) return 'text-red-600'
  if (score <= 3) return 'text-amber-600'
  return 'text-green-600'
}

function getBarColor(score: number): string {
  if (score <= 2) return 'bg-red-400'
  if (score <= 3) return 'bg-amber-400'
  return 'bg-green-400'
}

// ---- Component ------------------------------------------------------------

export function ScenarioCard({
  scenarioId,
  title,
  subtitle,
  category,
  gripFocus,
  estimatedTurns,
  progress,
  hasActiveSession,
}: ScenarioCardProps) {
  const displayStatus = hasActiveSession ? 'in-progress' : progress.status
  const statusConfig = STATUS_CONFIG[displayStatus]
  const categoryColor = CATEGORY_COLORS[category]

  // Determine action button
  let buttonLabel: string
  let buttonStyle: string
  if (hasActiveSession) {
    buttonLabel = 'Resume'
    buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white'
  } else if (progress.status === 'completed') {
    buttonLabel = 'Replay'
    buttonStyle = 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
  } else {
    buttonLabel = 'Start'
    buttonStyle = 'bg-blue-600 hover:bg-blue-700 text-white'
  }

  return (
    <article
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-blue-500"
      role="listitem"
      aria-label={`${title} — ${statusConfig.label}`}
    >
      {/* Header strip */}
      <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
        {/* Top row: category + status */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor.bg} ${categoryColor.text}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} aria-hidden="true" />
            {statusConfig.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{subtitle}</p>

        {/* GRIP Focus chips */}
        <div className="flex items-center gap-1.5 mb-3" role="list" aria-label="GRIP focus areas">
          <span className="text-xs text-gray-400 mr-1" aria-hidden="true">GRIP:</span>
          {gripFocus.map((dim) => (
            <span
              key={dim}
              className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold bg-gray-100 text-gray-600"
              title={GRIP_LABELS[dim]}
              role="listitem"
            >
              {dim}
            </span>
          ))}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>~{estimatedTurns} turns</span>
          {progress.attemptCount > 0 && (
            <span>
              {progress.attemptCount} attempt{progress.attemptCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Score bar (only if completed) */}
      {progress.lastAttempt && (
        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Last GRIP Scores</span>
            <span className={`text-sm font-bold ${getScoreColor(progress.lastAttempt.compositeScore)}`}>
              {progress.lastAttempt.compositeScore.toFixed(1)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['G', 'R', 'I', 'P'] as GripDimension[]).map((dim) => {
              const score = progress.lastAttempt!.gripScores[dim]
              return (
                <div key={dim}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-500">{dim}</span>
                    <span className={`text-xs font-semibold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full bg-gray-200 overflow-hidden"
                    role="meter"
                    aria-label={`${GRIP_LABELS[dim]} score`}
                    aria-valuenow={score}
                    aria-valuemin={1}
                    aria-valuemax={5}
                  >
                    <div
                      className={`h-full rounded-full ${getBarColor(score)} transition-all duration-500`}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-100">
        <Link
          to={`/practice/workplace-scenarios/${scenarioId}`}
          className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${buttonStyle}`}
          aria-label={`${buttonLabel} scenario: ${title}`}
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  )
}
