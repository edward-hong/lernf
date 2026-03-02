// ---------------------------------------------------------------------------
// Intent Color Legend (Enhanced)
// ---------------------------------------------------------------------------
// Tabbed legend with three views: Colors (dimension swatches), Patterns
// (behavioral examples), and GRIP (dimension grouping explanation).
// Fixed-position in the top-right corner, collapsible.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { INTENT_COLOR_ANCHORS } from '../../constants/intentColors'
import { intentToColor } from '../../utils/colorBlending'
import type { IntentVector } from '../../types/intent'

interface ColorExample {
  label: string
  intent: Partial<IntentVector>
  description: string
}

const COLOR_EXAMPLES: ColorExample[] = [
  {
    label: 'Sycophantic',
    intent: { cooperative: 0.9, persuasive: 0.1 },
    description: 'AI agrees too readily, validates without questioning',
  },
  {
    label: 'Exploring',
    intent: { epistemic: 0.8, cooperative: 0.5 },
    description: 'AI presents multiple options neutrally',
  },
  {
    label: 'Steering',
    intent: { cooperative: 0.6, persuasive: 0.7 },
    description: 'AI guides toward specific conclusion',
  },
  {
    label: 'Resistant',
    intent: { defensive: 0.8, cooperative: 0.3 },
    description: 'AI pushes back on user direction',
  },
  {
    label: 'Refusing',
    intent: { defensive: 0.9, constraint: 0.8 },
    description: 'AI enforces boundaries, declines request',
  },
]

type TabId = 'colors' | 'examples' | 'grip'

export function IntentLegend() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('colors')

  const entries = Object.entries(INTENT_COLOR_ANCHORS) as Array<
    [keyof IntentVector, (typeof INTENT_COLOR_ANCHORS)[keyof IntentVector]]
  >

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed state */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center text-sm font-semibold text-gray-600"
          aria-label="Show intent color legend"
          type="button"
        >
          IC
        </button>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-2xl w-80 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Intent Visualization
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Hide legend"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(
              [
                { id: 'colors', label: 'Colors' },
                { id: 'examples', label: 'Patterns' },
                { id: 'grip', label: 'GRIP' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 px-4 py-2 text-xs font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Colors tab */}
            {activeTab === 'colors' && (
              <div className="space-y-2">
                {entries.map(([dimension, anchor]) => {
                  const color = `oklch(0.75 0.12 ${anchor.hue})`
                  return (
                    <div key={dimension} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {anchor.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {dimension}
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-gray-400">
                        {anchor.gripDimension}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Examples tab */}
            {activeTab === 'examples' && (
              <div className="space-y-3">
                {COLOR_EXAMPLES.map((example) => {
                  const fullIntent: IntentVector = {
                    epistemic: example.intent.epistemic ?? 0,
                    cooperative: example.intent.cooperative ?? 0,
                    persuasive: example.intent.persuasive ?? 0,
                    defensive: example.intent.defensive ?? 0,
                    constraint: example.intent.constraint ?? 0,
                    uncertainty: example.intent.uncertainty ?? 0,
                  }

                  const color = intentToColor(fullIntent)

                  return (
                    <div
                      key={example.label}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-sm font-semibold text-gray-900">
                          {example.label}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {example.description}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* GRIP tab */}
            {activeTab === 'grip' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-gray-900 mb-2">
                    Governance (G)
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Who's in control? Is AI serving or steering?
                  </div>
                  <div className="flex gap-1">
                    {(['cooperative', 'persuasive', 'constraint'] as const).map(
                      (dim) => {
                        const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                        return (
                          <div
                            key={dim}
                            className="w-8 h-2 rounded"
                            style={{ backgroundColor: color }}
                          />
                        )
                      },
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-900 mb-2">
                    Information Integrity (I)
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Is AI exploring or advocating? Certain or uncertain?
                  </div>
                  <div className="flex gap-1">
                    {(['epistemic', 'uncertainty'] as const).map((dim) => {
                      const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                      return (
                        <div
                          key={dim}
                          className="w-8 h-2 rounded"
                          style={{ backgroundColor: color }}
                        />
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-900 mb-2">
                    Productive Friction (P)
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Is AI challenging you or agreeing too readily?
                  </div>
                  <div className="flex gap-1">
                    {(['defensive'] as const).map((dim) => {
                      const color = `oklch(0.75 0.12 ${INTENT_COLOR_ANCHORS[dim].hue})`
                      return (
                        <div
                          key={dim}
                          className="w-8 h-2 rounded"
                          style={{ backgroundColor: color }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
