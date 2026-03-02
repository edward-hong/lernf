// ---------------------------------------------------------------------------
// Scenario Library — Filterable grid of available scenarios
// ---------------------------------------------------------------------------
// Displays all registered scenarios in a grid/list with filtering by
// category, GRIP dimension, and completion status. Reads scenario metadata
// from the scenario registry and progress data from localStorage.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { GripDimension, ScenarioCategory, ScenarioDefinition } from '../../types/scenario'
import { GRIP_LABELS } from '../../types/scenario'
import { ScenarioCard } from '../../components/Scenario/ScenarioCard'
import { getScenarioProgress } from '../../utils/progress'
import type { ScenarioProgressInfo, ScenarioCompletionStatus } from '../../utils/progress'
import { useScenarioStore } from '../../state/scenarioState'
import { PROD_INCIDENT_001 } from '../../data/scenarios/prod-incident-001'
import { PROJECT_LEAD_DELAYS_002 } from '../../data/scenarios/project-lead-delays-002'
import { PERF_REVIEW_PROMOTION_003 } from '../../data/scenarios/perf-review-promotion-003'

// ---- Scenario Registry Metadata -------------------------------------------

interface ScenarioMeta {
  id: string
  title: string
  subtitle: string
  category: ScenarioCategory
  gripFocus: GripDimension[]
  estimatedTurns: number
}

function buildScenarioMeta(): ScenarioMeta[] {
  const bundles = [PROD_INCIDENT_001, PROJECT_LEAD_DELAYS_002, PERF_REVIEW_PROMOTION_003]
  return bundles.map((bundle) => {
    const def: ScenarioDefinition = bundle.buildScenario()
    return {
      id: def.id,
      title: def.title,
      subtitle: def.subtitle,
      category: def.category,
      gripFocus: def.gripFocus,
      estimatedTurns: def.estimatedTurns,
    }
  })
}

// ---- Category Labels ------------------------------------------------------

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  'ai-delegation': 'AI Delegation',
  'information-filtering': 'Info Filtering',
  'capability-atrophy': 'Capability Atrophy',
  'emotional-dependency': 'Emotional Dependency',
  'role-clarity': 'Role Clarity',
  'institutional-memory': 'Institutional Memory',
  'leadership-communication': 'Leadership & Communication',
  'career-advancement': 'Career Advancement',
}

const ALL_CATEGORIES: ScenarioCategory[] = [
  'ai-delegation',
  'information-filtering',
  'capability-atrophy',
  'emotional-dependency',
  'role-clarity',
  'institutional-memory',
  'leadership-communication',
  'career-advancement',
]

const ALL_GRIP: GripDimension[] = ['G', 'R', 'I', 'P']

const ALL_STATUS: { value: ScenarioCompletionStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

// ---- Component ------------------------------------------------------------

function ScenarioLibrary() {
  const [categoryFilter, setCategoryFilter] = useState<ScenarioCategory | 'all'>('all')
  const [gripFilter, setGripFilter] = useState<GripDimension | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ScenarioCompletionStatus | 'all'>('all')

  const activeScenario = useScenarioStore((s) => s.scenario)

  const scenarios = useMemo(() => buildScenarioMeta(), [])

  const progressMap = useMemo(() => {
    const map: Record<string, ScenarioProgressInfo> = {}
    for (const s of scenarios) {
      map[s.id] = getScenarioProgress(s.id)
    }
    return map
  }, [scenarios])

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
      if (gripFilter !== 'all' && !s.gripFocus.includes(gripFilter)) return false
      if (statusFilter !== 'all') {
        const progress = progressMap[s.id]
        const hasActiveSession =
          activeScenario?.definition.id === s.id &&
          activeScenario.phase !== 'completed'
        const displayStatus = hasActiveSession ? 'in-progress' : progress.status
        if (displayStatus !== statusFilter) return false
      }
      return true
    })
  }, [scenarios, categoryFilter, gripFilter, statusFilter, progressMap, activeScenario])

  const activeFilterCount = [categoryFilter, gripFilter, statusFilter].filter(
    (f) => f !== 'all',
  ).length

  const clearFilters = () => {
    setCategoryFilter('all')
    setGripFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Scenario Library</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Practice navigating real-world AI collaboration challenges
          </p>
        </div>
        <Link
          to="/practice/progress"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Progress
        </Link>
      </div>

      {/* Filters */}
      <fieldset className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3 mb-6 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg">
        <legend className="sr-only">Filter scenarios</legend>
        <span className="text-sm font-medium text-gray-500" aria-hidden="true">
          Filters:
        </span>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ScenarioCategory | 'all')}
          aria-label="Filter by category"
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        <select
          value={gripFilter}
          onChange={(e) => setGripFilter(e.target.value as GripDimension | 'all')}
          aria-label="Filter by GRIP dimension"
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All GRIP Dimensions</option>
          {ALL_GRIP.map((dim) => (
            <option key={dim} value={dim}>
              {dim} — {GRIP_LABELS[dim]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ScenarioCompletionStatus | 'all')}
          aria-label="Filter by completion status"
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
        >
          <option value="all">All Status</option>
          {ALL_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </fieldset>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4" role="status" aria-live="polite">
        {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 ? ' matching filters' : ' available'}
      </p>

      {/* Scenario Grid */}
      {filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" role="list" aria-label="Scenarios">
          {filteredScenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenarioId={s.id}
              title={s.title}
              subtitle={s.subtitle}
              category={s.category}
              gripFocus={s.gripFocus}
              estimatedTurns={s.estimatedTurns}
              progress={progressMap[s.id]}
              hasActiveSession={
                activeScenario?.definition.id === s.id &&
                activeScenario.phase !== 'completed'
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-2">No scenarios match your filters.</p>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

export default ScenarioLibrary
