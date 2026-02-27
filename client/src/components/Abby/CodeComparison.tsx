import { useState } from 'react'
import axios from 'axios'
import CodeBlock from './CodeBlock'
import Evaluation from './Evaluation'
import LanguageSelector from './LanguageSelector'
import {
  generateComparisonPrompt,
  LANGUAGES,
} from '../../prompts/promptComparison'
import { evaluateOptions } from '../../prompts/evaluateOptions'
import './CodeComparison.css'

function CodeComparison() {
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [reasoning, setReasoning] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [language, setLanguage] = useState('javascript')

  // Generate a new scenario
  const generateScenario = async () => {
    setLoading(true)
    setScenario(null)
    setSelectedOption(null)
    setReasoning('')
    setEvaluation(null)

    try {
      const prompt = generateComparisonPrompt(language)

      const response = await axios.post('http://localhost:5000/api/deepseek', {
        prompt,
      })

      // response.data.output is a string like: "{\n  \"context\": ..."
      let outputString = response.data.output

      // Sometimes AI adds markdown code blocks, strip them
      outputString = outputString
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')

      // Parse the JSON string
      const scenarioData = JSON.parse(outputString)

      // Validate it has the expected structure
      if (
        !scenarioData.context ||
        !scenarioData.optionA ||
        !scenarioData.optionB
      ) {
        throw new Error('Invalid scenario structure')
      }

      console.log(scenarioData)

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
        prompt: evaluateOptions(scenario, reasoning, selectedOption),
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

      {!scenario && (
        <LanguageSelector
          value={language}
          languages={LANGUAGES}
          onChange={(language) => setLanguage(language)}
        />
      )}

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
              language={language}
              label="Option A"
              code={scenario.optionA.code}
              isSelected={selectedOption === 'A'}
              onSelect={() => setSelectedOption('A')}
            />

            <CodeBlock
              language={language}
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
