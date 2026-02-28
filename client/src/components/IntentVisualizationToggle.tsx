// ---------------------------------------------------------------------------
// Intent Visualisation Toggle
// ---------------------------------------------------------------------------
// Control panel for enabling / disabling the intent overlay and tuning its
// parameters (smoothing factor, tooltip visibility).
// ---------------------------------------------------------------------------

import type { IntentVisualizationSettings } from '../types/message'

interface IntentVisualizationToggleProps {
  settings: IntentVisualizationSettings
  onChange: (settings: IntentVisualizationSettings) => void
}

export function IntentVisualizationToggle({
  settings,
  onChange,
}: IntentVisualizationToggleProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Intent Visualization
      </h3>

      {/* Enable / disable */}
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) =>
            onChange({ ...settings, enabled: e.target.checked })
          }
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Show intent gradients</span>
      </label>

      {/* Controls visible only when enabled */}
      {settings.enabled && (
        <>
          {/* Smoothing factor slider */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">
              Smoothing: {Math.round(settings.smoothingFactor * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.smoothingFactor * 100}
              onChange={(e) =>
                onChange({
                  ...settings,
                  smoothingFactor: Number(e.target.value) / 100,
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Tooltip toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showTooltip}
              onChange={(e) =>
                onChange({ ...settings, showTooltip: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Show dimension tooltips
            </span>
          </label>
        </>
      )}
    </div>
  )
}
