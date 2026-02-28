// ---------------------------------------------------------------------------
// AI Message With Intent Spine
// ---------------------------------------------------------------------------
// Renders an AI message with a coloured left-border "spine" whose hue
// reflects the smoothed intent vector.  Falls back to the standard
// MessageBubble when intent visualisation is disabled.
// ---------------------------------------------------------------------------

import { memo } from 'react'
import type { ScenarioColorConfig } from '../types/scenario'
import type { TurnWithIntent, IntentVisualizationSettings } from '../types/message'
import type { IntentVector } from '../types/intent'
import { MessageBubble } from './tools/Scenario/MessageBubble'
import { intentToColor, getIntentLabel } from '../utils/colorBlending'
import { smoothIntent } from '../utils/intentSmoothing'
import { IntentTooltip } from './IntentTooltip'

interface AIMessageWithIntentProps {
  /** The AI message, optionally carrying intent analysis data. */
  message: TurnWithIntent
  /** Previous AI message's intent vector (for temporal smoothing). */
  previousIntent?: IntentVector
  /** Scenario colour configuration. */
  colors: ScenarioColorConfig
  /** Visualisation settings. */
  settings: IntentVisualizationSettings
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts)
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function AIMessageWithIntentInner({
  message,
  previousIntent,
  colors,
  settings,
}: AIMessageWithIntentProps) {
  // Fall back to standard bubble when intent visualisation is off.
  if (!settings.enabled || !message.intentAnalysis) {
    return <MessageBubble message={message} colors={colors} />
  }

  const smoothedIntent = smoothIntent(
    message.intentAnalysis.intent,
    previousIntent,
    settings.smoothingFactor,
  )

  const spineColor = intentToColor(smoothedIntent)
  const intentLabel = getIntentLabel(smoothedIntent)
  const messageColors = colors.ai

  return (
    <div className="flex justify-start px-3 sm:px-4 py-1.5" role="listitem">
      <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
        {/* Message bubble with intent spine */}
        <div
          className={`relative rounded-lg rounded-tl-sm border-l-4 sm:border-l-[6px] px-3 sm:px-4 py-3 ${messageColors.bg}`}
          style={{ borderLeftColor: spineColor }}
        >
          {/* Speaker name with optional intent label */}
          <span
            className={`block text-xs font-semibold mb-1 ${messageColors.label}`}
          >
            {message.speakerName}
            {settings.showTooltip && (
              <span className="ml-2 font-normal opacity-60">
                ({intentLabel})
              </span>
            )}
          </span>

          {/* Content */}
          <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Actions */}
          {message.actions.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.actions.map((action, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 text-xs ${messageColors.accent}`}
                >
                  <svg
                    className="w-3.5 h-3.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>{action.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Intent tooltip (hover / focus on the "i" button) */}
          {settings.showTooltip && <IntentTooltip intent={smoothedIntent} />}
        </div>

        {/* Timestamp */}
        <span className="block mt-0.5 text-xs text-gray-400 text-left">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export const AIMessageWithIntent = memo(AIMessageWithIntentInner)
