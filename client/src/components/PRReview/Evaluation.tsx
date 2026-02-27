import React from 'react'
import type { EvaluationResult, PRScenario } from '../../types/pr'
import './Evaluation.css'

interface Props {
  evaluation: EvaluationResult
  scenario: PRScenario
  onReset: () => void
}

const Evaluation: React.FC<Props> = ({ evaluation, scenario, onReset }) => {
  const getScoreClass = () => {
    if (evaluation.score >= 80) return 'excellent'
    if (evaluation.score >= 60) return 'good'
    if (evaluation.score >= 40) return 'okay'
    return 'needs-work'
  }

  return (
    <div className="pr-evaluation">
      <div className="score-section">
        <h2>Review Results</h2>
        <div className={`score-display ${getScoreClass()}`}>
          <div className="score-number">{evaluation.score}%</div>
          <div className="score-detail">
            Found {evaluation.found} of {evaluation.total} issues
          </div>
        </div>
      </div>

      {evaluation.foundIssues.length > 0 && (
        <div className="issues-section">
          <h3>✅ Issues You Found ({evaluation.found})</h3>
          {evaluation.foundIssues.map((issue) => (
            <div key={issue.id} className="issue-card found">
              <div className="issue-header">
                <span className="issue-line">Line {issue.lineNumber}</span>
                <span className={`severity ${issue.severity}`}>
                  {issue.severity}
                </span>
              </div>
              <h4>{issue.title}</h4>
              <p>{issue.explanation}</p>
              <div className="fix">
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {evaluation.missedIssues.length > 0 && (
        <div className="issues-section">
          <h3>❌ Issues You Missed ({evaluation.missed})</h3>
          {evaluation.missedIssues.map((issue) => (
            <div key={issue.id} className="issue-card missed">
              <div className="issue-header">
                <span className="issue-line">Line {issue.lineNumber}</span>
                <span className={`severity ${issue.severity}`}>
                  {issue.severity}
                </span>
              </div>
              <h4>{issue.title}</h4>
              <p>{issue.explanation}</p>
              <div className="fix">
                <strong>Fix:</strong> {issue.fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {evaluation.falsePositives > 0 && (
        <div className="false-positives">
          <p>
            ⚠️ You marked {evaluation.falsePositives} line(s) that didn't have
            issues
          </p>
        </div>
      )}

      <button className="reset-button" onClick={onReset}>
        Try Another PR
      </button>
    </div>
  )
}

export default Evaluation
