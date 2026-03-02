// ---------------------------------------------------------------------------
// Mobile Intent Tooltip
// ---------------------------------------------------------------------------
// Simplified tooltip for mobile devices. Uses a full-screen modal overlay
// for better touch UX, showing only the top 3 dominant dimensions.
// ---------------------------------------------------------------------------

import { useState } from 'react'
import type { IntentVector } from '../../types/intent'
import { getDominantDimensions } from '../../utils/intentSmoothing'
import { INTENT_COLOR_ANCHORS } from '../../constants/intentColors'

interface IntentTooltipMobileProps {
  intent: IntentVector
}

export function IntentTooltipMobile({ intent }: IntentTooltipMobileProps) {
  const [isVisible, setIsVisible] = useState(false)
  const dominant = getDominantDimensions(intent, 0.3).slice(0, 3)

  return (
    <>
      {/* Tap trigger */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-200 active:bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600"
        aria-label="Show intent"
        type="button"
      >
        i
      </button>

      {/* Full-screen overlay on mobile */}
      {isVisible && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-900">
                Intent Analysis
              </h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
                type="button"
                aria-label="Close intent analysis"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {dominant.map(([dimension, score]) => {
                const anchor = INTENT_COLOR_ANCHORS[dimension]
                const percentage = Math.round(score * 100)
                const barColor = `oklch(0.75 0.12 ${anchor.hue})`

                return (
                  <div key={dimension} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {anchor.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {percentage}%
                      </span>
                    </div>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              {dominant.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No dominant intent dimensions detected.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
