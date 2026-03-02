import React from 'react'
import type { SessionAnalysisResult } from '../../types/advocate'
import WeiZhengParallel from './WeiZhengParallel'
import ExportTranscript from './ExportTranscript'
import { useAdvocateStore } from '../../state/advocateState'

interface SessionAnalysisProps {
  result: SessionAnalysisResult
  onReset: () => void
}

const TRAJECTORY_LABELS: Record<string, { label: string; color: string }> = {
  growth: { label: 'Growth', color: 'text-green-700' },
  entrenchment: { label: 'Entrenchment', color: 'text-red-700' },
  mixed: { label: 'Mixed', color: 'text-yellow-700' },
  consistent: { label: 'Consistent', color: 'text-blue-700' },
}

const TREND_ICONS: Record<string, string> = {
  increasing: '\u2191',
  decreasing: '\u2193',
  stable: '\u2192',
  fluctuating: '\u223C',
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-sm font-medium w-28 text-right">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-10">{pct}%</span>
    </div>
  )
}

const SessionAnalysis: React.FC<SessionAnalysisProps> = ({ result, onReset }) => {
  const { currentSession } = useAdvocateStore()
  const { analysis, intentHistory } = result

  const trajectoryInfo = TRAJECTORY_LABELS[analysis.overallTrajectory] || TRAJECTORY_LABELS.mixed

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Session Analysis</h2>
        <p className="text-gray-600">
          How you responded to criticism across {intentHistory.length} round{intentHistory.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Overall trajectory */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-semibold">Overall Trajectory:</h3>
          <span className={`text-xl font-bold ${trajectoryInfo.color}`}>
            {trajectoryInfo.label}
          </span>
        </div>
        <p className="text-gray-700">{analysis.trajectoryDescription}</p>

        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Defensiveness:</span>
            <span className="font-semibold">
              {TREND_ICONS[analysis.defensivenessTrend]} {analysis.defensivenessTrend}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Openness:</span>
            <span className="font-semibold">
              {TREND_ICONS[analysis.opennessTrend]} {analysis.opennessTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Intent history per round */}
      {intentHistory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Intent Across Rounds</h3>

          {/* Trend chart (simple bar-based) */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-6">
              {intentHistory.map(({ roundNumber, intent }) => (
                <div key={roundNumber}>
                  <h4 className="font-semibold text-gray-800 mb-2">Round {roundNumber}</h4>
                  <ScoreBar label="Cooperative" value={intent.cooperative} color="bg-green-500" />
                  <ScoreBar label="Defensive" value={intent.defensive} color="bg-red-400" />
                  <ScoreBar label="Epistemic" value={intent.epistemic} color="bg-blue-500" />
                  <ScoreBar label="Persuasive" value={intent.persuasive} color="bg-yellow-500" />
                  <p className="text-sm text-gray-500 italic mt-1">{intent.interpretation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trend lines (dimension comparison across rounds) */}
          {intentHistory.length >= 2 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Dimension Trends</h4>
              {(['cooperative', 'defensive', 'epistemic', 'persuasive'] as const).map(dim => {
                const colors: Record<string, string> = {
                  cooperative: 'bg-green-500',
                  defensive: 'bg-red-400',
                  epistemic: 'bg-blue-500',
                  persuasive: 'bg-yellow-500',
                }
                return (
                  <div key={dim} className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize w-24">{dim}</span>
                      <div className="flex-1 flex items-end gap-1 h-8">
                        {intentHistory.map(({ roundNumber, intent }) => {
                          const val = intent[dim]
                          return (
                            <div
                              key={roundNumber}
                              className="flex-1 flex flex-col items-center"
                            >
                              <div
                                className={`w-full rounded-t ${colors[dim]}`}
                                style={{ height: `${Math.max(val * 32, 2)}px` }}
                                title={`Round ${roundNumber}: ${(val * 100).toFixed(0)}%`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-28">
                      {intentHistory.map(({ roundNumber }) => (
                        <div key={roundNumber} className="flex-1 text-center text-xs text-gray-400">
                          R{roundNumber}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Key dismissals */}
      {analysis.keyDismissals.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-red-900 mb-3">
            Critiques You Brushed Off
          </h3>
          <ul className="space-y-2">
            {analysis.keyDismissals.map((dismissal, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">-</span>
                <span className="text-gray-700">{dismissal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strongest moment */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-900 mb-3">
          Your Strongest Moment
        </h3>
        <p className="text-gray-700">{analysis.strongestMoment}</p>
      </div>

      {/* Blind spots */}
      {analysis.blindSpots.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-yellow-900 mb-3">
            Persistent Blind Spots
          </h3>
          <ul className="space-y-2">
            {analysis.blindSpots.map((spot, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">-</span>
                <span className="text-gray-700">{spot}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Wei Zheng parallel */}
      <WeiZhengParallel reflection={analysis.weiZhengReflection} />

      {/* Self-reflection prompts */}
      {analysis.selfReflectionPrompts.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Questions to Sit With</h3>
          <ul className="space-y-3">
            {analysis.selfReflectionPrompts.map((prompt, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gray-400 font-semibold">{i + 1}.</span>
                <span className="text-gray-700 italic">{prompt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export + actions */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        {currentSession && (
          <ExportTranscript session={currentSession} analysisResult={result} />
        )}

        <div className="flex gap-4 mt-6">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                       hover:bg-blue-700 transition-colors"
          >
            Start New Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionAnalysis
