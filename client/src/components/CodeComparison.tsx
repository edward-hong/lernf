import { useState } from 'react'
import axios from 'axios'
import CodeBlock from './CodeBlock'
import Evaluation from './Evaluation'
import './CodeComparison.css'

function CodeComparison() {
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [reasoning, setReasoning] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)

  // Generate a new scenario
  const generateScenario = async () => {
    setLoading(true)
    setScenario(null)
    setSelectedOption(null)
    setReasoning('')
    setEvaluation(null)

    try {
      const response = await axios.post('http://localhost:5000/api/deepseek', {
        prompt: `Generate two JavaScript functions that accomplish the same task, but one is better than the other.

Format your response as JSON:
{
  "context": "Brief description of what the functions do (e.g., 'Find maximum number in array')",
  "optionA": {
    "code": "function code here",
    "approach": "Brief description of approach (e.g., 'Uses reduce method')"
  },
  "optionB": {
    "code": "function code here", 
    "approach": "Brief description of approach (e.g., 'Uses for loop')"
  },
  "correctAnswer": "A or B",
  "reason": "Why one is better (performance, readability, best practices, etc.)"
}

Make the difference subtle but meaningful. Focus on real-world scenarios like:
- Performance differences
- Readability/maintainability
- Edge case handling
- Memory efficiency
- Best practices

Only return valid JSON, no markdown or other text.`,
      })

      const scenarioData = JSON.parse(response.data.output)
      setScenario(scenarioData)
    } catch (error) {
      console.error('Error generating scenario:', error)
      alert('Failed to generate scenario. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Submit answer for evaluation
  const submitAnswer = async () => {
    if (!selectedOption || !reasoning.trim()) {
      alert('Please select an option and provide your reasoning.')
      return
    }

    setEvaluating(true)

    try {
      const response = await axios.post('http://localhost:5000/api/deepseek', {
        prompt: `Context: ${scenario.context}

Option A: ${scenario.optionA.code}
Option B: ${scenario.optionB.code}

User selected: Option ${selectedOption}
User's reasoning: ${reasoning}

The correct answer is Option ${scenario.correctAnswer} because: ${scenario.reason}

Evaluate the user's answer:
1. Did they select the correct option?
2. How good was their reasoning?
3. What did they miss?
4. Provide constructive feedback.

Keep the evaluation concise but helpful (3-5 sentences).`,
      })

      setEvaluation(response.data.output)
    } catch (error) {
      console.error('Error evaluating answer:', error)
      alert('Failed to evaluate answer. Please try again.')
    } finally {
      setEvaluating(false)
    }
  }

  // Reset to generate new scenario
  const resetScenario = () => {
    setScenario(null)
    setSelectedOption(null)
    setReasoning('')
    setEvaluation(null)
  }

  return (
    <div className="code-comparison">
      <header className="header">
        <h1>Code Quality Comparison</h1>
        <p className="subtitle">
          Which implementation is better? Practice your architectural judgment.
        </p>
      </header>

      {!scenario && !loading && (
        <div className="start-section">
          <button className="generate-button" onClick={generateScenario}>
            Generate Scenario
          </button>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Generating scenario...</p>
        </div>
      )}

      {scenario && !evaluation && (
        <div className="scenario">
          <div className="context">
            <h3>Context</h3>
            <p>{scenario.context}</p>
          </div>

          <div className="options">
            <CodeBlock
              label="Option A"
              code={scenario.optionA.code}
              isSelected={selectedOption === 'A'}
              onSelect={() => setSelectedOption('A')}
            />

            <CodeBlock
              label="Option B"
              code={scenario.optionB.code}
              isSelected={selectedOption === 'B'}
              onSelect={() => setSelectedOption('B')}
            />
          </div>

          <div className="reasoning-section">
            <label htmlFor="reasoning">
              <strong>Explain your choice:</strong> Why is your selected option
              better?
            </label>
            <textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Consider: performance, readability, edge cases, best practices..."
              rows={5}
              disabled={!selectedOption}
            />
          </div>

          <button
            className="submit-button"
            onClick={submitAnswer}
            disabled={!selectedOption || !reasoning.trim() || evaluating}
          >
            {evaluating ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      )}

      {evaluation && (
        <Evaluation evaluation={evaluation} onReset={resetScenario} />
      )}
    </div>
  )
}

export default CodeComparison
