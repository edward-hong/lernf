import React, { useState } from 'react'
import axios from 'axios'
import type { PRScenario, EvaluationResult } from '../../types/pr'
import DiffLine from './DiffLine'
import Evaluation from './Evaluation'

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
    <div className="max-w-[1200px] mx-auto py-10 px-5 min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-4xl text-gray-800 mb-2">PR Review Practice</h1>
        <p className="text-gray-500 text-lg">
          Click on lines that have issues. Can you catch all the bugs?
        </p>
      </header>

      {!scenario && !loading && (
        <div className="text-center py-16 px-5">
          <button
            className="bg-blue-500 text-white border-0 px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_6px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(59,130,246,0.3)]"
            onClick={generatePR}
          >
            Generate PR to Review
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 px-5">
          <div className="border-4 border-gray-100 border-t-blue-500 rounded-full w-12 h-12 animate-spin mx-auto mb-5"></div>
          <p>Generating PR scenario...</p>
        </div>
      )}

      {scenario && !evaluation && (
        <div className="bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="m-0 mb-2 text-gray-800 text-2xl">{scenario.title}</h2>
            <p className="text-gray-500 m-0 mb-4 leading-[1.6]">{scenario.description}</p>
            <div className="flex gap-4 items-center">
              <span className="bg-blue-500 text-white px-3 py-1 rounded text-[13px] font-medium">
                {scenario.language}
              </span>
              <span className="text-gray-500 text-sm">
                {markedLines.size} line{markedLines.size !== 1 ? 's' : ''}{' '}
                marked
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <span>Code Diff</span>
              <span className="text-gray-500 text-[13px] font-normal">
                💡 Click lines to mark issues
              </span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
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

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              className="flex-1 bg-emerald-500 text-white border-0 py-[14px] px-6 text-base font-semibold rounded-md cursor-pointer transition-colors hover:enabled:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              onClick={submitReview}
              disabled={markedLines.size === 0 || evaluating}
            >
              {evaluating ? 'Evaluating...' : 'Submit Review'}
            </button>
            <button
              className="bg-gray-500 text-white border-0 py-[14px] px-6 text-base font-semibold rounded-md cursor-pointer transition-colors hover:bg-gray-600"
              onClick={resetReview}
            >
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
