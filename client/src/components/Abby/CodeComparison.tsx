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
import type { ComparisonScenario } from '../../types/comparison'

function CodeComparison() {
  const [loading, setLoading] = useState(false)
  const [scenario, setScenario] = useState<ComparisonScenario | null>(null)
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [evaluation, setEvaluation] = useState<string | null>(null)
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
    if (!scenario || !selectedOption || !reasoning.trim()) {
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
    <div className="max-w-[1000px] mx-auto py-10 px-5 min-h-screen">
      <header className="text-center mb-10">
        <h1 className="text-4xl text-gray-800 mb-2">Code Quality Comparison</h1>
        <p className="text-gray-500 text-lg">
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
        <div className="text-center py-16 px-5">
          <button
            className="bg-blue-500 text-white border-0 px-8 py-4 text-lg font-semibold rounded-lg cursor-pointer transition-all duration-200 shadow-[0_4px_6px_rgba(59,130,246,0.2)] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(59,130,246,0.3)]"
            onClick={generateScenario}
          >
            Generate Scenario
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 px-5">
          <div className="border-4 border-gray-100 border-t-blue-500 rounded-full w-12 h-12 animate-spin mx-auto mb-5"></div>
          <p>Generating scenario...</p>
        </div>
      )}

      {scenario && !evaluation && (
        <div className="bg-white p-8 rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
          <div className="mb-8 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h3 className="mt-0 text-gray-800">Context</h3>
            <p>{scenario.context}</p>
          </div>

          <div className="mb-8 flex flex-col gap-4">
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

          <div className="mb-6">
            <label
              htmlFor="reasoning"
              className="block mb-3 text-gray-800 text-base"
            >
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
              className="w-full p-3 border-2 border-gray-200 rounded-md text-sm resize-y transition-colors duration-200 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <button
            className="w-full bg-emerald-500 text-white border-0 p-4 text-base font-semibold rounded-lg cursor-pointer transition-colors hover:enabled:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
