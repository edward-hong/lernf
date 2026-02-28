// ---------------------------------------------------------------------------
// Intent Color Legend
// ---------------------------------------------------------------------------
// Collapsible legend showing the mapping between intent dimensions and
// their OKLCH colours. Fixed-position in the top-right corner.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import { INTENT_COLOR_ANCHORS } from '../constants/intentColors'
import type { IntentVector } from '../types/intent'

export function IntentLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  const entries = Object.entries(INTENT_COLOR_ANCHORS) as Array<
    [keyof IntentVector, (typeof INTENT_COLOR_ANCHORS)[keyof IntentVector]]
  >

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed state: icon button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-sm font-semibold text-gray-600"
          aria-label="Show intent color legend"
          type="button"
        >
          IC
        </button>
      )}

      {/* Expanded state: full legend */}
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Intent Colors
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
              aria-label="Hide legend"
              type="button"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2">
            {entries.map(([dimension, anchor]) => {
              const color = `oklch(0.75 0.12 ${anchor.hue})`

              return (
                <div key={dimension} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-gray-300 shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900">
                      {anchor.label}
                    </div>
                    <div className="text-xs text-gray-500">{dimension}</div>
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    {anchor.gripDimension}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            Colors blend based on AI behavioral intent
          </div>
        </div>
      )}
    </div>
  )
}
