import React from 'react'
import type { EvaluationResult, Issue, PRScenario } from '../../../types/pr'

interface Props {
  evaluation: EvaluationResult
  scenario: PRScenario
  onReset: () => void
}

const Evaluation: React.FC<Props> = ({ evaluation, onReset }) => {
  const getScoreTextColor = () => {
    if (evaluation.score >= 80) return 'text-emerald-500'
    if (evaluation.score >= 60) return 'text-blue-500'
    if (evaluation.score >= 40) return 'text-amber-400'
    return 'text-red-500'
  }

  const getSeverityClasses = (severity: string) => {
    const base = 'px-2 py-0.5 rounded text-xs font-semibold uppercase'
    if (severity === 'high') return `${base} bg-red-100 text-red-600`
    if (severity === 'medium') return `${base} bg-orange-100 text-orange-600`
    return `${base} bg-amber-100 text-amber-600`
  }

  return (
    <div className="max-w-[900px] mx-auto p-6">
      <div className="text-center mb-10">
        <h2 className="mb-6 text-gray-800">Review Results</h2>
        <div className="inline-block px-16 py-8 rounded-xl bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
          <div className={`text-[64px] font-bold mb-2 ${getScoreTextColor()}`}>
            {evaluation.score}%
          </div>
          <div className="text-base text-gray-500">
            Found {evaluation.found} of {evaluation.total} issues
          </div>
        </div>
      </div>

      {evaluation.foundIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-gray-800 text-xl">
            ✅ Issues You Found ({evaluation.found})
          </h3>
          {evaluation.foundIssues.map((issue: Issue) => (
            <div
              key={issue.id}
              className="bg-white p-5 rounded-lg mb-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-4 border-emerald-500"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-sm text-gray-500 font-semibold">
                  Line {issue.lineNumber}
                </span>
                <span className={getSeverityClasses(issue.severity)}>
                  {issue.severity}
                </span>
              </div>
              <h4 className="m-0 mb-2 text-gray-800 text-base">
                {issue.title}
              </h4>
              <p className="m-0 mb-3 text-gray-600 leading-[1.6]">
                {issue.explanation}
              </p>
              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                <strong className="text-gray-800">Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {evaluation.missedIssues.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 text-gray-800 text-xl">
            ❌ Issues You Missed ({evaluation.missed})
          </h3>
          {evaluation.missedIssues.map((issue: Issue) => (
            <div
              key={issue.id}
              className="bg-white p-5 rounded-lg mb-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)] border-l-4 border-red-500"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-sm text-gray-500 font-semibold">
                  Line {issue.lineNumber}
                </span>
                <span className={getSeverityClasses(issue.severity)}>
                  {issue.severity}
                </span>
              </div>
              <h4 className="m-0 mb-2 text-gray-800 text-base">
                {issue.title}
              </h4>
              <p className="m-0 mb-3 text-gray-600 leading-[1.6]">
                {issue.explanation}
              </p>
              <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
                <strong className="text-gray-800">Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {evaluation.falsePositives > 0 && (
        <div className="bg-amber-100 border-l-4 border-amber-400 p-4 rounded-md mb-6">
          <p className="m-0 text-amber-800">
            ⚠️ You marked {evaluation.falsePositives} line(s) that didn't have
            issues
          </p>
        </div>
      )}

      <button
        className="w-full bg-blue-500 text-white border-0 p-4 text-base font-semibold rounded-lg cursor-pointer transition-colors hover:bg-blue-600"
        onClick={onReset}
      >
        Try Another PR
      </button>
    </div>
  )
}

export default Evaluation
