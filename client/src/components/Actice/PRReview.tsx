import React, { useState } from 'react'
import axios from 'axios'
import type { PRScenario, EvaluationResult } from '../../types/pr'
import DiffLine from './DiffLine'
import Evaluation from './Evaluation'
import './PRReview.css'

const PRReview: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<PRScenario | null>(null)
  const [markedLines, setMarkedLines] = useState<Set<number>>(new Set())
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  const generatePR = async () => {
    setLoading(true)
    setScenario(null)
    setMarkedLines(new Set())
    setEvaluation(null)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/generate-pr',
        {
          language: 'react',
        }
      )

      setScenario(response.data.scenario)
    } catch (error) {
      console.error('Error generating PR:', error)
      alert('Failed to generate PR. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleLine = (lineNumber: number) => {
    const newMarked = new Set(markedLines)
    if (newMarked.has(lineNumber)) {
      newMarked.delete(lineNumber)
    } else {
      newMarked.add(lineNumber)
    }
    setMarkedLines(newMarked)
  }

  const submitReview = async () => {
    if (!scenario || markedLines.size === 0) {
      alert('Please mark at least one line with an issue.')
      return
    }

    setEvaluating(true)

    try {
      const response = await axios.post(
        'http://localhost:5000/api/evaluate-pr',
        {
          userFindings: Array.from(markedLines),
          correctIssues: scenario.issues,
        }
      )

      setEvaluation(response.data.results)
    } catch (error) {
      console.error('Error evaluating PR:', error)
      alert('Failed to evaluate review. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  const resetReview = () => {
    setScenario(null)
    setMarkedLines(new Set())
    setEvaluation(null)
  }

  return (
    <div className="pr-review">
      <header className="header">
        <h1>PR Review Practice</h1>
        <p className="subtitle">
          Click on lines that have issues. Can you catch all the bugs?
        </p>
      </header>

      {!scenario && !loading && (
        <div className="start-section">
          <button className="generate-button" onClick={generatePR}>
            Generate PR to Review
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating PR scenario...</p>
        </div>
      )}

      {scenario && !evaluation && (
        <div className="scenario">
          <div className="pr-header">
            <h2>{scenario.title}</h2>
            <p className="description">{scenario.description}</p>
            <div className="meta">
              <span className="language-badge">{scenario.language}</span>
              <span className="stats">
                {markedLines.size} line{markedLines.size !== 1 ? 's' : ''}{' '}
                marked
              </span>
            </div>
          </div>

          <div className="diff-container">
            <div className="diff-header">
              <span>Code Diff</span>
              <span className="hint">💡 Click lines to mark issues</span>
            </div>
            <div className="diff-content">
              {scenario.diff.map((line) => (
                <DiffLine
                  key={line.lineNumber}
                  line={line}
                  isMarked={markedLines.has(line.lineNumber)}
                  onToggle={() => toggleLine(line.lineNumber)}
                />
              ))}
            </div>
          </div>

          <div className="actions">
            <button
              className="submit-button"
              onClick={submitReview}
              disabled={markedLines.size === 0 || evaluating}
            >
              {evaluating ? 'Evaluating...' : 'Submit Review'}
            </button>
            <button className="reset-button-small" onClick={resetReview}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {evaluation && scenario && (
        <Evaluation
          evaluation={evaluation}
          scenario={scenario}
          onReset={resetReview}
        />
      )}
    </div>
  )
}

export default PRReview
