// ---------------------------------------------------------------------------
// Intent Tooltip Component
// ---------------------------------------------------------------------------
// Shows a dimension breakdown of the intent vector on hover. Renders an "i"
// button that reveals a popup with bar charts for each dominant dimension.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import type { IntentVector } from '../types/intent'
import { INTENT_COLOR_ANCHORS } from '../constants/intentColors'
import { getDominantDimensions } from '../utils/intentSmoothing'

interface IntentTooltipProps {
  intent: IntentVector
}

export function IntentTooltip({ intent }: IntentTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const dominant = getDominantDimensions(intent, 0.1)

  return (
    <div className="relative">
      {/* Hover trigger */}
      <button
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="Show intent analysis"
        type="button"
      >
        i
      </button>

      {/* Tooltip popup */}
      {isVisible && (
        <div className="absolute right-0 top-10 z-50 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Intent Analysis
          </h4>

          {/* Dimension bars */}
          <div className="space-y-2">
            {dominant.map(([dimension, score]) => {
              const anchor = INTENT_COLOR_ANCHORS[dimension]
              const percentage = Math.round(score * 100)
              const barColor = `oklch(0.75 0.12 ${anchor.hue})`

              return (
                <div key={dimension} className="flex items-center gap-2">
                  <div className="w-20 text-xs font-medium text-gray-700 truncate">
                    {anchor.label}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                  <div className="w-12 text-xs text-right text-gray-600">
                    {percentage}%
                  </div>
                </div>
              )
            })}
          </div>

          {/* GRIP dimension indicator */}
          {dominant.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                GRIP Dimensions:{' '}
                {Array.from(
                  new Set(
                    dominant.map(
                      ([dim]) => INTENT_COLOR_ANCHORS[dim].gripDimension,
                    ),
                  ),
                ).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
