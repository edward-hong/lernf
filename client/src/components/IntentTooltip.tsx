// ---------------------------------------------------------------------------
// Intent Tooltip Component (Enhanced)
// ---------------------------------------------------------------------------
// Shows all 6 intent dimensions with visual progress bars, grouped by GRIP
// category. Supports comparison with previous turn and mobile positioning.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import type { IntentVector } from '../types/intent'
import { INTENT_COLOR_ANCHORS } from '../constants/intentColors'

interface IntentTooltipProps {
  intent: IntentVector
  /** Previous turn's intent for comparison */
  previousIntent?: IntentVector
  /** Position tooltip (auto, top, bottom) */
  position?: 'auto' | 'top' | 'bottom'
}

export function IntentTooltip({
  intent,
  previousIntent,
  position = 'auto',
}: IntentTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Group dimensions by GRIP category
  const gripGroups: Record<string, Array<[keyof IntentVector, number]>> = {
    G: [],
    R: [],
    I: [],
    P: [],
  }

  ;(Object.entries(intent) as Array<[keyof IntentVector, number]>).forEach(
    ([dimension, score]) => {
      const grip = INTENT_COLOR_ANCHORS[dimension].gripDimension
      gripGroups[grip].push([dimension, score])
    },
  )

  // Filter out empty GRIP groups
  const activeGripGroups = Object.entries(gripGroups).filter(
    ([, dimensions]) => dimensions.length > 0,
  )

  return (
    <div className="relative">
      {/* Hover trigger */}
      <button
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600 transition-all hover:scale-110"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="Show intent analysis"
        type="button"
      >
        i
      </button>

      {/* Tooltip popup */}
      {isVisible && (
        <div
          className={`
            absolute right-0 z-50 w-80 bg-white border border-gray-200
            rounded-lg shadow-2xl p-4
            ${position === 'top' ? 'bottom-10' : 'top-10'}
          `}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Intent Analysis
            </h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              type="button"
              aria-label="Close tooltip"
            >
              ✕
            </button>
          </div>

          {/* Dimensions grouped by GRIP */}
          <div className="space-y-4">
            {activeGripGroups.map(([grip, dimensions]) => (
              <div key={grip} className="space-y-2">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  GRIP-{grip}
                </div>
                {dimensions.map(([dimension, score]) => {
                  const anchor = INTENT_COLOR_ANCHORS[dimension]
                  const percentage = Math.round(score * 100)
                  const barColor = `oklch(0.75 0.12 ${anchor.hue})`

                  // Calculate change from previous
                  const previousScore = previousIntent?.[dimension]
                  const change =
                    previousScore !== undefined ? score - previousScore : 0

                  return (
                    <div key={dimension} className="flex items-center gap-2">
                      <div className="w-24 text-xs font-medium text-gray-700">
                        {anchor.label}
                      </div>
                      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: barColor,
                          }}
                        />
                        {/* Previous value indicator */}
                        {previousScore !== undefined && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                            style={{
                              left: `${Math.round(previousScore * 100)}%`,
                            }}
                          />
                        )}
                      </div>
                      <div className="w-16 text-xs text-right">
                        <span className="text-gray-900 font-medium">
                          {percentage}%
                        </span>
                        {change !== 0 && (
                          <span
                            className={`ml-1 ${
                              change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {change > 0 ? '↑' : '↓'}
                            {Math.abs(Math.round(change * 100))}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
