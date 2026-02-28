// ---------------------------------------------------------------------------
// Intent Color Legend
// ---------------------------------------------------------------------------
// A collapsible, fixed-position legend explaining which colour maps to which
// intent dimension.  Sits in the top-right corner of the viewport.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import type { IntentVector } from '../types/intent'
import { INTENT_COLOR_ANCHORS } from '../constants/intentColors'

export function IntentLegend() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed state — icon button */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-sm"
          aria-label="Show intent color legend"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </button>
      )}

      {/* Expanded state — full legend */}
      {isExpanded && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Intent Colors
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Hide legend"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {(
              Object.keys(INTENT_COLOR_ANCHORS) as Array<keyof IntentVector>
            ).map((dimension) => {
              const anchor = INTENT_COLOR_ANCHORS[dimension]
              const color = `oklch(0.75 0.12 ${anchor.hue})`

              return (
                <div key={dimension} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1">
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
