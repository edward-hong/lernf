// ---------------------------------------------------------------------------
// Progress Dashboard — GRIP improvement tracking and analytics
// ---------------------------------------------------------------------------
// Shows overall GRIP scores, improvement over time (D3 line chart), pattern
// frequency, scenarios completed, and total practice time. Includes data
// export functionality.
// ---------------------------------------------------------------------------

import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as d3 from 'd3'
import type { GripDimension } from '../types/scenario'
import { GRIP_LABELS } from '../types/scenario'
import {
  getProgressSummary,
  downloadProgressData,
  clearProgressData,
  formatDuration,
} from '../utils/progress'
import type { ProgressSummary } from '../utils/progress'

// ---- Score Color Helpers --------------------------------------------------

function getScoreColor(score: number): string {
  if (score <= 2) return 'text-red-600'
  if (score <= 3) return 'text-amber-600'
  return 'text-green-600'
}

function getBarFill(score: number): string {
  if (score <= 2) return 'bg-red-400'
  if (score <= 3) return 'bg-amber-400'
  return 'bg-green-400'
}

// ---- GRIP Dimension Colors for Chart --------------------------------------

const GRIP_CHART_COLORS: Record<GripDimension, string> = {
  G: '#3b82f6', // blue-500
  R: '#10b981', // emerald-500
  I: '#8b5cf6', // violet-500
  P: '#f59e0b', // amber-500
}

// ---- D3 Line Chart Component ----------------------------------------------

function GripChart({ summary }: { summary: ProgressSummary }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Observe container size
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: Math.min(entry.contentRect.width * 0.5, 300),
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return
    if (summary.scoreHistory.length < 2) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 24, bottom: 40, left: 40 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Scales
    const xScale = d3
      .scalePoint<number>()
      .domain(summary.scoreHistory.map((_, i) => i))
      .range([0, width])

    const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0])

    // Grid lines
    g.selectAll('.grid-line')
      .data([1, 2, 3, 4, 5])
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e5e7eb')
      .attr('stroke-dasharray', '3,3')

    // Y axis labels
    g.selectAll('.y-label')
      .data([1, 2, 3, 4, 5])
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', (d) => yScale(d))
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('font-size', '11px')
      .attr('fill', '#9ca3af')
      .text((d) => d)

    // X axis labels (attempt numbers)
    g.selectAll('.x-label')
      .data(summary.scoreHistory)
      .enter()
      .append('text')
      .attr('x', (_, i) => xScale(i)!)
      .attr('y', height + 24)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#9ca3af')
      .text((_, i) => `#${i + 1}`)

    // Draw lines for each GRIP dimension
    const dims: GripDimension[] = ['G', 'R', 'I', 'P']
    for (const dim of dims) {
      const line = d3
        .line<(typeof summary.scoreHistory)[0]>()
        .x((_, i) => xScale(i)!)
        .y((d) => yScale(d.gripScores[dim]))
        .curve(d3.curveMonotoneX)

      g.append('path')
        .datum(summary.scoreHistory)
        .attr('fill', 'none')
        .attr('stroke', GRIP_CHART_COLORS[dim])
        .attr('stroke-width', 2)
        .attr('d', line)

      // Dots
      g.selectAll(`.dot-${dim}`)
        .data(summary.scoreHistory)
        .enter()
        .append('circle')
        .attr('cx', (_, i) => xScale(i)!)
        .attr('cy', (d) => yScale(d.gripScores[dim]))
        .attr('r', 3.5)
        .attr('fill', GRIP_CHART_COLORS[dim])
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
    }

    // Composite score line (dashed)
    const compositeLine = d3
      .line<(typeof summary.scoreHistory)[0]>()
      .x((_, i) => xScale(i)!)
      .y((d) => yScale(d.compositeScore))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(summary.scoreHistory)
      .attr('fill', 'none')
      .attr('stroke', '#374151')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '6,3')
      .attr('d', compositeLine)
  }, [summary, dimensions])

  if (summary.scoreHistory.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Complete at least 2 scenarios to see your improvement chart
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
        {(['G', 'R', 'I', 'P'] as GripDimension[]).map((dim) => (
          <div key={dim} className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5 rounded-full inline-block"
              style={{ backgroundColor: GRIP_CHART_COLORS[dim] }}
            />
            <span className="text-xs text-gray-500">
              {dim} — {GRIP_LABELS[dim]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded-full inline-block bg-gray-700 border-dashed" />
          <span className="text-xs text-gray-500">Composite</span>
        </div>
      </div>
    </div>
  )
}

// ---- Stat Card Sub-Component ----------------------------------------------

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string | number
  sublabel?: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sublabel && (
        <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}

// ---- Main Component -------------------------------------------------------

export function ProgressDashboard() {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const summary: ProgressSummary = useMemo(() => getProgressSummary(), [])

  const handleExport = () => {
    downloadProgressData()
  }

  const handleClear = () => {
    clearProgressData()
    setShowClearConfirm(false)
    // Force a page reload to refresh the dashboard
    window.location.reload()
  }

  const isEmpty = summary.totalAttempts === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your GRIP development across scenario attempts
          </p>
        </div>
        <Link
          to="/practice/workplace-scenarios"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Scenario Library
        </Link>
      </div>

      {isEmpty ? (
        /* Empty state */
        <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No progress yet</h2>
          <p className="text-gray-500 mb-6">
            Complete your first scenario to start tracking your GRIP development.
          </p>
          <Link
            to="/practice/workplace-scenarios"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <>
          {/* Stat cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Scenarios Completed"
              value={summary.totalAttempts}
              sublabel={`${summary.uniqueScenariosCompleted} unique`}
            />
            <StatCard
              label="Average Score"
              value={summary.averageCompositeScore.toFixed(1)}
              sublabel="out of 5.0"
            />
            <StatCard
              label="Time Practicing"
              value={formatDuration(summary.totalTimeMs)}
            />
            <StatCard
              label="Patterns Detected"
              value={summary.topPatterns.length}
              sublabel="unique patterns"
            />
          </div>

          {/* GRIP Scores Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Average GRIP Scores
            </h2>
            <div className="space-y-4">
              {(['G', 'R', 'I', 'P'] as GripDimension[]).map((dim) => {
                const score = summary.averageGripScores[dim]
                return (
                  <div key={dim}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold bg-gray-100 text-gray-600">
                          {dim}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {GRIP_LABELS[dim]}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarFill(score)} transition-all duration-700`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* GRIP Improvement Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              GRIP Improvement Over Time
            </h2>
            <GripChart summary={summary} />
          </div>

          {/* Pattern Detection */}
          {summary.topPatterns.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Most Common Patterns
              </h2>
              <div className="space-y-3">
                {summary.topPatterns.slice(0, 8).map((pattern) => (
                  <div
                    key={pattern.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {pattern.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pattern.historicalCase}
                      </p>
                    </div>
                    <span className="shrink-0 ml-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-700">
                      {pattern.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Data Management
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Progress (JSON)
              </button>

              {showClearConfirm ? (
                <div className="inline-flex items-center gap-2">
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <button
                    onClick={handleClear}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Clear All
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Data
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
