import { useState } from 'react'
import type { ScenarioState } from '../../../types/scenario'
import { GRIP_LABELS } from '../../../types/scenario'

interface ScenarioHeaderProps {
  scenario: ScenarioState
  onEndScenario: () => void
}

export function ScenarioHeader({
  scenario,
  onEndScenario,
}: ScenarioHeaderProps) {
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const { definition, phase, assignedPersonas } = scenario

  const personaNames = Object.values(assignedPersonas).map(
    (p) => p.definition.name
  )

  return (
    <header className="bg-gray-50 border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
      {/* Top row: title + end button */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {definition.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1">
            {definition.subtitle}
          </p>
        </div>

        <button
          onClick={onEndScenario}
          disabled={phase === 'completed'}
          aria-label="End the scenario"
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          End Scenario
        </button>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="hidden sm:inline">{personaNames.join(', ')}</span>
          <span className="sm:hidden">{personaNames.length} participants</span>
        </span>

        <span className="inline-flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ~{definition.estimatedTurns} turns
        </span>

        <div
          className="flex items-center gap-1"
          role="list"
          aria-label="GRIP focus areas"
        >
          {definition.gripFocus.map((dim) => (
            <span
              key={dim}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
              title={GRIP_LABELS[dim]}
              role="listitem"
            >
              {dim}
            </span>
          ))}
        </div>
      </div>

      {/* Collapsible tools section */}
      <div className="mt-2">
        <button
          onClick={() => setToolsExpanded(!toolsExpanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          aria-expanded={toolsExpanded}
          aria-controls="scenario-participants"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${
              toolsExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          Available tools ({personaNames.length} participants)
        </button>

        {toolsExpanded && (
          <div
            id="scenario-participants"
            className="mt-2 pl-5 space-y-1"
            role="list"
            aria-label="Available participants"
          >
            {Object.values(assignedPersonas).map((assigned) => {
              const colors = scenario.colors.npcColors[assigned.colorSlot]
              return (
                <div
                  key={assigned.definition.id}
                  className="flex items-center gap-2 text-xs"
                  role="listitem"
                >
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${colors.bg} border ${colors.border}`}
                    aria-hidden="true"
                  />
                  <span className={`font-medium ${colors.label}`}>
                    {assigned.definition.name}
                  </span>
                  <span className="text-gray-400">
                    {assigned.definition.role}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center gap-2 text-xs" role="listitem">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-50 border border-indigo-300"
                aria-hidden="true"
              />
              <span className="font-medium text-indigo-700">AI Assistant</span>
              <span className="text-gray-400">advisor</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
