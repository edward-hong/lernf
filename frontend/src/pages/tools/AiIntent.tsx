// src/pages/tools/AiIntent.tsx
import { useState } from 'react'
import { INTENT_COLOR_ANCHORS } from '../../constants/intentColors'
import { intentToColor, getIntentLabel } from '../../utils/colorBlending'
import { analyzeIntent } from '../../ai/intentAnalyzer'
import type { IntentVector, IntentAnalysisResult } from '../../types/intent'

interface PatternExample {
  label: string
  intent: IntentVector
  description: string
  example: string
}

const PATTERN_EXAMPLES: PatternExample[] = [
  {
    label: 'Sycophantic',
    intent: { epistemic: 0.2, cooperative: 0.9, persuasive: 0.1, defensive: 0, constraint: 0, uncertainty: 0 },
    description: 'AI agrees too readily, validates without questioning',
    example: "That's a great idea! You're absolutely right to do it that way.",
  },
  {
    label: 'Exploring',
    intent: { epistemic: 0.9, cooperative: 0.6, persuasive: 0.1, defensive: 0, constraint: 0, uncertainty: 0.3 },
    description: 'AI presents multiple options neutrally',
    example: 'There are several approaches: Option A offers consistency, Option B offers flexibility. Each has trade-offs.',
  },
  {
    label: 'Steering',
    intent: { epistemic: 0.1, cooperative: 0.6, persuasive: 0.8, defensive: 0, constraint: 0, uncertainty: 0.1 },
    description: 'AI guides toward a specific conclusion',
    example: 'You should definitely use React for this. It has the best ecosystem and will be easiest to hire for.',
  },
  {
    label: 'Resistant',
    intent: { epistemic: 0.1, cooperative: 0.3, persuasive: 0.4, defensive: 0.8, constraint: 0.3, uncertainty: 0.2 },
    description: 'AI pushes back on user direction',
    example: "I have concerns. This approach could introduce vulnerabilities, and the previous implementation was deprecated for good reason.",
  },
  {
    label: 'Refusing',
    intent: { epistemic: 0, cooperative: 0.1, persuasive: 0, defensive: 0.9, constraint: 0.9, uncertainty: 0 },
    description: 'AI enforces boundaries, declines request',
    example: "I can't help with that request. It violates our usage policy and could cause harm.",
  },
]

const DIMENSION_ENTRIES = Object.entries(INTENT_COLOR_ANCHORS) as Array<
  [keyof IntentVector, (typeof INTENT_COLOR_ANCHORS)[keyof IntentVector]]
>

function DimensionBar({ dimension, value }: { dimension: keyof IntentVector; value: number }) {
  const anchor = INTENT_COLOR_ANCHORS[dimension]
  const color = `oklch(0.75 0.12 ${anchor.hue})`

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs font-medium text-gray-700 capitalize">{dimension}</div>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-10 text-xs text-gray-500 text-right">{value.toFixed(2)}</div>
    </div>
  )
}

export function AiIntent() {
  const [inputText, setInputText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<IntentAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeIntent(inputText.trim())
      setAnalysisResult(result)
    } catch {
      setError('Analysis failed. Make sure the backend is running.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">AI Intent Analysis</h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Understand what an AI is <em>doing</em> when it responds. The intent analyzer scores AI
          messages across 6 behavioural dimensions, making hidden patterns visible through colour.
        </p>
      </div>

      {/* Dimensions Reference */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">The 6 Dimensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DIMENSION_ENTRIES.map(([dimension, anchor]) => {
            const color = `oklch(0.75 0.12 ${anchor.hue})`
            return (
              <div
                key={dimension}
                className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md"
                style={{ borderLeftWidth: 4, borderLeftColor: color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-semibold text-gray-900">{anchor.label}</span>
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {anchor.gripDimension}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {dimension === 'epistemic' && 'Exploring possibilities vs. advocating for specific answers'}
                  {dimension === 'cooperative' && "Assisting user's goals vs. pursuing its own agenda"}
                  {dimension === 'persuasive' && 'Guiding toward conclusions vs. staying responsive'}
                  {dimension === 'defensive' && 'Resisting, hedging, or refusing user direction'}
                  {dimension === 'constraint' && 'Enforcing rules, policies, or safety boundaries'}
                  {dimension === 'uncertainty' && 'Expressing doubt and qualifying statements'}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Behavioral Patterns */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recognising Patterns</h2>
        <p className="text-gray-600 mb-6">
          Different combinations of intent dimensions produce recognisable behavioural patterns.
          The colour spine on each message reflects the blended intent.
        </p>
        <div className="space-y-4">
          {PATTERN_EXAMPLES.map((pattern) => {
            const color = intentToColor(pattern.intent)
            const label = getIntentLabel(pattern.intent)
            return (
              <div
                key={pattern.label}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-shadow hover:shadow-md"
              >
                <div className="flex">
                  {/* Intent spine */}
                  <div className="w-2 flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{pattern.label}</span>
                      <span className="text-xs text-gray-400">({label})</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{pattern.description}</p>
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
                      <p className="text-sm text-gray-700 italic">"{pattern.example}"</p>
                    </div>
                    {/* Mini dimension bars */}
                    <div className="mt-3 space-y-1.5">
                      {(Object.keys(pattern.intent) as Array<keyof IntentVector>)
                        .filter((dim) => pattern.intent[dim] > 0.2)
                        .sort((a, b) => pattern.intent[b] - pattern.intent[a])
                        .map((dim) => (
                          <DimensionBar key={dim} dimension={dim} value={pattern.intent[dim]} />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Live Analysis */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Try It</h2>
        <p className="text-gray-600 mb-6">
          Paste an AI response below to see its intent breakdown. The analysis uses the DeepSeek API
          to score the message across all 6 dimensions.
        </p>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste an AI response here to analyze its intent..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Intent'}
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* Results */}
          {analysisResult && !isAnalyzing && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-6 h-6 rounded-md border border-gray-300"
                  style={{ backgroundColor: intentToColor(analysisResult.intent) }}
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {getIntentLabel(analysisResult.intent)}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    Primary: {analysisResult.primary}
                    {analysisResult.secondary && ` / Secondary: ${analysisResult.secondary}`}
                  </span>
                </div>
                {analysisResult.cached && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">cached</span>
                )}
              </div>
              <div className="space-y-2">
                {(Object.keys(analysisResult.intent) as Array<keyof IntentVector>)
                  .sort((a, b) => analysisResult.intent[b] - analysisResult.intent[a])
                  .map((dim) => (
                    <DimensionBar key={dim} dimension={dim} value={analysisResult.intent[dim]} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GRIP Mapping */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">GRIP Framework Mapping</h2>
        <p className="text-gray-600 mb-6">
          Each intent dimension maps to a GRIP framework dimension, connecting AI behavioural
          analysis to the broader governance model.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Governance (G)</h3>
            <p className="text-xs text-gray-500 mb-3">Who's in control? Is AI serving or steering?</p>
            <div className="flex gap-2">
              {(['cooperative', 'persuasive', 'constraint'] as const).map((dim) => {
                const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                return (
                  <div key={dim} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{INTENT_COLOR_ANCHORS[dim].label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Information Integrity (I)</h3>
            <p className="text-xs text-gray-500 mb-3">Is AI exploring or advocating? Certain or uncertain?</p>
            <div className="flex gap-2">
              {(['epistemic', 'uncertainty'] as const).map((dim) => {
                const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                return (
                  <div key={dim} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{INTENT_COLOR_ANCHORS[dim].label}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Productive Friction (P)</h3>
            <p className="text-xs text-gray-500 mb-3">Is AI challenging you or agreeing too readily?</p>
            <div className="flex gap-2">
              {(['defensive'] as const).map((dim) => {
                const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                return (
                  <div key={dim} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-600">{INTENT_COLOR_ANCHORS[dim].label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AiIntent
