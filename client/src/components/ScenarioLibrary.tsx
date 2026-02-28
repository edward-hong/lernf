// ---------------------------------------------------------------------------
// Scenario Library — Filterable grid of available scenarios
// ---------------------------------------------------------------------------
// Displays all registered scenarios in a grid/list with filtering by
// category, GRIP dimension, and completion status. Reads scenario metadata
// from the scenario registry and progress data from localStorage.
// ---------------------------------------------------------------------------

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { GripDimension, ScenarioCategory, ScenarioDefinition } from '../types/scenario'
import { GRIP_LABELS } from '../types/scenario'
import { ScenarioCard } from './ScenarioCard'
import { getScenarioProgress } from '../utils/progress'
import type { ScenarioProgressInfo, ScenarioCompletionStatus } from '../utils/progress'
import { useScenarioStore } from '../state/scenarioState'
import { PROD_INCIDENT_001 } from '../data/scenarios/prod-incident-001'

// ---- Scenario Registry Metadata -------------------------------------------

/**
 * Static metadata for all scenarios. We build a lightweight descriptor from
 * each scenario bundle so the library doesn't need to instantiate full
 * definitions just to show cards.
 */
interface ScenarioMeta {
  id: string
  title: string
  subtitle: string
  category: ScenarioCategory
  gripFocus: GripDimension[]
  estimatedTurns: number
}

function buildScenarioMeta(): ScenarioMeta[] {
  // Build a temporary definition to extract metadata
  const def: ScenarioDefinition = PROD_INCIDENT_001.buildScenario()
  return [
    {
      id: def.id,
      title: def.title,
      subtitle: def.subtitle,
      category: def.category,
      gripFocus: def.gripFocus,
      estimatedTurns: def.estimatedTurns,
    },
  ]
}

// ---- Category Labels ------------------------------------------------------

const CATEGORY_LABELS: Record<ScenarioCategory, string> = {
  'ai-delegation': 'AI Delegation',
  'information-filtering': 'Info Filtering',
  'capability-atrophy': 'Capability Atrophy',
  'emotional-dependency': 'Emotional Dependency',
  'role-clarity': 'Role Clarity',
  'institutional-memory': 'Institutional Memory',
}

const ALL_CATEGORIES: ScenarioCategory[] = [
  'ai-delegation',
  'information-filtering',
  'capability-atrophy',
  'emotional-dependency',
  'role-clarity',
  'institutional-memory',
]

const ALL_GRIP: GripDimension[] = ['G', 'R', 'I', 'P']

const ALL_STATUS: { value: ScenarioCompletionStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

// ---- Component ------------------------------------------------------------

export function ScenarioLibrary() {
  const [categoryFilter, setCategoryFilter] = useState<ScenarioCategory | 'all'>('all')
  const [gripFilter, setGripFilter] = useState<GripDimension | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ScenarioCompletionStatus | 'all'>('all')

  const activeScenario = useScenarioStore((s) => s.scenario)

  // Build scenario metadata (stable across renders since registry is static)
  const scenarios = useMemo(() => buildScenarioMeta(), [])

  // Build progress map
  const progressMap = useMemo(() => {
    const map: Record<string, ScenarioProgressInfo> = {}
    for (const s of scenarios) {
      map[s.id] = getScenarioProgress(s.id)
    }
    return map
  }, [scenarios])

  // Apply filters
  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      // Category filter
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false

      // GRIP filter
      if (gripFilter !== 'all' && !s.gripFocus.includes(gripFilter)) return false

      // Status filter
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

  // Count active filters
  const activeFilterCount = [categoryFilter, gripFilter, statusFilter].filter(
    (f) => f !== 'all',
  ).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scenario Library</h1>
          <p className="text-gray-500 mt-1">
            Practice navigating real-world AI collaboration challenges
          </p>
        </div>
        <Link
          to="/practice/progress"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          View Progress
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <span className="text-sm font-medium text-gray-500">Filters:</span>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ScenarioCategory | 'all')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>

        {/* GRIP Dimension */}
        <select
          value={gripFilter}
          onChange={(e) => setGripFilter(e.target.value as GripDimension | 'all')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All GRIP Dimensions</option>
          {ALL_GRIP.map((dim) => (
            <option key={dim} value={dim}>
              {dim} — {GRIP_LABELS[dim]}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ScenarioCompletionStatus | 'all')}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          {ALL_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setCategoryFilter('all')
              setGripFilter('all')
              setStatusFilter('all')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4">
        {filteredScenarios.length} scenario{filteredScenarios.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 ? ' matching filters' : ' available'}
      </p>

      {/* Scenario Grid */}
      {filteredScenarios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            onClick={() => {
              setCategoryFilter('all')
              setGripFilter('all')
              setStatusFilter('all')
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
