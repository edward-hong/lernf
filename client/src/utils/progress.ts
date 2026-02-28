// ---------------------------------------------------------------------------
// Progress Tracking — localStorage Persistence for Scenario Attempts
// ---------------------------------------------------------------------------
// Tracks scenario attempts, GRIP scores over time, detected patterns, and
// time spent practicing. All data is stored in localStorage and can be
// exported as JSON for external analysis.
// ---------------------------------------------------------------------------

import type {
  GripDimension,
  GripEvaluation,
  PatternMatch,
  ScenarioCategory,
} from '../types/scenario'

// ---- Types ----------------------------------------------------------------

/** A single completed scenario attempt. */
export interface ScenarioAttempt {
  /** Unique ID for this attempt. */
  id: string
  /** Which scenario was played. */
  scenarioId: string
  /** Scenario title at time of completion. */
  scenarioTitle: string
  /** Scenario category. */
  category: ScenarioCategory
  /** GRIP dimensions the scenario targets. */
  gripFocus: GripDimension[]
  /** ISO-8601 timestamp of when the attempt started. */
  startedAt: string
  /** ISO-8601 timestamp of when the attempt completed. */
  completedAt: string
  /** Duration in milliseconds. */
  durationMs: number
  /** Per-dimension scores (1–5). */
  gripScores: Record<GripDimension, number>
  /** Composite score (1–5). */
  compositeScore: number
  /** Evaluation band label. */
  band: GripEvaluation['band']
  /** Historical patterns detected. */
  patternMatches: PatternMatch[]
  /** Number of hidden factors discovered. */
  discoveredFactors: number
  /** Total hidden factors in the scenario. */
  totalFactors: number
}

/** Aggregated progress across all attempts. */
export interface ProgressSummary {
  /** Total number of completed attempts. */
  totalAttempts: number
  /** Number of unique scenarios completed. */
  uniqueScenariosCompleted: number
  /** Average GRIP scores across all attempts. */
  averageGripScores: Record<GripDimension, number>
  /** Average composite score. */
  averageCompositeScore: number
  /** Total time spent practicing (ms). */
  totalTimeMs: number
  /** Most common patterns detected (sorted by frequency). */
  topPatterns: { name: string; count: number; historicalCase: string }[]
  /** Score history for charting improvement over time. */
  scoreHistory: {
    date: string
    compositeScore: number
    gripScores: Record<GripDimension, number>
  }[]
}

/** Completion status for a given scenario. */
export type ScenarioCompletionStatus = 'not-started' | 'in-progress' | 'completed'

/** Info about a scenario's completion state for display. */
export interface ScenarioProgressInfo {
  status: ScenarioCompletionStatus
  attemptCount: number
  lastAttempt: ScenarioAttempt | null
  bestCompositeScore: number | null
}

// ---- Storage Key ----------------------------------------------------------

const STORAGE_KEY = 'lernf-progress'

// ---- Core Functions -------------------------------------------------------

/** Load all scenario attempts from localStorage. */
export function loadAttempts(): ScenarioAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ScenarioAttempt[]
  } catch {
    return []
  }
}

/** Save all scenario attempts to localStorage. */
function saveAttempts(attempts: ScenarioAttempt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts))
}

/** Generate a unique ID for a new attempt. */
function generateId(): string {
  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Record a completed scenario attempt.
 * Call this when a scenario finishes and evaluation is available.
 */
export function recordAttempt(params: {
  scenarioId: string
  scenarioTitle: string
  category: ScenarioCategory
  gripFocus: GripDimension[]
  startedAt: string
  completedAt: string
  evaluation: GripEvaluation
  discoveredFactors: number
  totalFactors: number
}): ScenarioAttempt {
  const {
    scenarioId,
    scenarioTitle,
    category,
    gripFocus,
    startedAt,
    completedAt,
    evaluation,
    discoveredFactors,
    totalFactors,
  } = params

  const durationMs =
    new Date(completedAt).getTime() - new Date(startedAt).getTime()

  const gripScores: Record<GripDimension, number> = {
    G: 0,
    R: 0,
    I: 0,
    P: 0,
  }
  for (const dim of evaluation.dimensions) {
    gripScores[dim.dimension] = dim.score
  }

  const attempt: ScenarioAttempt = {
    id: generateId(),
    scenarioId,
    scenarioTitle,
    category,
    gripFocus,
    startedAt,
    completedAt,
    durationMs,
    gripScores,
    compositeScore: evaluation.compositeScore,
    band: evaluation.band,
    patternMatches: evaluation.patternMatches,
    discoveredFactors,
    totalFactors,
  }

  const attempts = loadAttempts()
  attempts.push(attempt)
  saveAttempts(attempts)

  return attempt
}

// ---- Query Functions ------------------------------------------------------

/** Get attempts for a specific scenario. */
export function getAttemptsForScenario(
  scenarioId: string,
): ScenarioAttempt[] {
  return loadAttempts().filter((a) => a.scenarioId === scenarioId)
}

/** Get progress info for a specific scenario (for card display). */
export function getScenarioProgress(
  scenarioId: string,
): ScenarioProgressInfo {
  const attempts = getAttemptsForScenario(scenarioId)

  if (attempts.length === 0) {
    return {
      status: 'not-started',
      attemptCount: 0,
      lastAttempt: null,
      bestCompositeScore: null,
    }
  }

  const sorted = [...attempts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )

  const bestScore = Math.max(...attempts.map((a) => a.compositeScore))

  return {
    status: 'completed',
    attemptCount: attempts.length,
    lastAttempt: sorted[0],
    bestCompositeScore: bestScore,
  }
}

/** Build a full progress summary across all attempts. */
export function getProgressSummary(): ProgressSummary {
  const attempts = loadAttempts()

  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      uniqueScenariosCompleted: 0,
      averageGripScores: { G: 0, R: 0, I: 0, P: 0 },
      averageCompositeScore: 0,
      totalTimeMs: 0,
      topPatterns: [],
      scoreHistory: [],
    }
  }

  // Unique scenarios
  const uniqueScenarios = new Set(attempts.map((a) => a.scenarioId))

  // Average GRIP scores
  const avgGrip: Record<GripDimension, number> = { G: 0, R: 0, I: 0, P: 0 }
  const dimensions: GripDimension[] = ['G', 'R', 'I', 'P']
  for (const dim of dimensions) {
    const total = attempts.reduce((sum, a) => sum + a.gripScores[dim], 0)
    avgGrip[dim] = total / attempts.length
  }

  // Average composite
  const avgComposite =
    attempts.reduce((sum, a) => sum + a.compositeScore, 0) / attempts.length

  // Total time
  const totalTime = attempts.reduce((sum, a) => sum + a.durationMs, 0)

  // Pattern frequency
  const patternCounts = new Map<
    string,
    { count: number; historicalCase: string }
  >()
  for (const attempt of attempts) {
    for (const pattern of attempt.patternMatches) {
      const existing = patternCounts.get(pattern.name)
      if (existing) {
        existing.count++
      } else {
        patternCounts.set(pattern.name, {
          count: 1,
          historicalCase: pattern.historicalCase,
        })
      }
    }
  }
  const topPatterns = [...patternCounts.entries()]
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)

  // Score history (sorted chronologically)
  const scoreHistory = [...attempts]
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
    )
    .map((a) => ({
      date: a.completedAt,
      compositeScore: a.compositeScore,
      gripScores: { ...a.gripScores },
    }))

  return {
    totalAttempts: attempts.length,
    uniqueScenariosCompleted: uniqueScenarios.size,
    averageGripScores: avgGrip,
    averageCompositeScore: avgComposite,
    totalTimeMs: totalTime,
    topPatterns,
    scoreHistory,
  }
}

// ---- Export / Import ------------------------------------------------------

/** Export all progress data as a downloadable JSON string. */
export function exportProgressData(): string {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    attempts: loadAttempts(),
    summary: getProgressSummary(),
  }
  return JSON.stringify(data, null, 2)
}

/** Trigger a browser download of progress data. */
export function downloadProgressData(): void {
  const json = exportProgressData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lernf-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Clear all progress data. */
export function clearProgressData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ---- Time Formatting ------------------------------------------------------

/** Format milliseconds into a human-readable duration. */
export function formatDuration(ms: number): string {
  if (ms < 60_000) return '<1 min'
  const totalMinutes = Math.floor(ms / 60_000)
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
