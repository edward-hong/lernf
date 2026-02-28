// ---------------------------------------------------------------------------
// AI Message with Intent Spine
// ---------------------------------------------------------------------------
// Renders an AI/NPC message bubble with a coloured left-border "spine" that
// reflects the intent analysis of the message. Falls back to the standard
// MessageBubble rendering when intent visualization is disabled or no
// analysis is available.
// ---------------------------------------------------------------------------

import { memo } from 'react'
import type { ScenarioMessage, ScenarioColorConfig, ColorClasses } from '../types/scenario'
import type { IntentVector, IntentAnalysisResult } from '../types/intent'
import type { IntentVisualizationSettings } from '../types/message'
import { intentToColor, getIntentLabel } from '../utils/colorBlending'
import { smoothIntent } from '../utils/intentSmoothing'
import { getPersonaColors } from '../utils/colors'
import { IntentTooltip } from './IntentTooltip'

interface AIMessageWithIntentProps {
  message: ScenarioMessage
  /** Intent analysis for this message (if available). */
  intentAnalysis?: IntentAnalysisResult
  /** Previous AI/NPC message's intent (for smoothing). */
  previousIntent?: IntentVector
  /** Colour configuration for the scenario session. */
  colors: ScenarioColorConfig
  /** Visualization settings. */
  settings: IntentVisualizationSettings
}

function getColorsForMessage(
  message: ScenarioMessage,
  config: ScenarioColorConfig,
): ColorClasses {
  switch (message.speakerType) {
    case 'ai':
      return config.ai
    case 'npc': {
      const npcColors = getPersonaColors(message.speakerId, config)
      return npcColors ?? config.system
    }
    default:
      return config.system
  }
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
  intentAnalysis,
  previousIntent,
  colors,
  settings,
}: AIMessageWithIntentProps) {
  const messageColors = getColorsForMessage(message, colors)

  // If intent visualization is disabled or no analysis, render standard bubble
  if (!settings.enabled || !intentAnalysis) {
    return (
      <div className="flex justify-start px-3 sm:px-4 py-1.5" role="listitem">
        <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
          <div
            className={`rounded-lg rounded-tl-sm border-l-4 px-3 sm:px-4 py-3 ${messageColors.bg} ${messageColors.border}`}
          >
            <span
              className={`block text-xs font-semibold mb-1 ${messageColors.label}`}
            >
              {message.speakerName}
            </span>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {message.content}
            </p>
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
          </div>
          <span
            className="block mt-0.5 text-xs text-gray-400 text-left"
            aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
          >
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    )
  }

  // Smooth intent with previous turn
  const smoothedIntent = smoothIntent(
    intentAnalysis.intent,
    previousIntent,
    settings.smoothingFactor,
  )

  // Convert to colour
  const spineColor = intentToColor(smoothedIntent)
  const intentLabel = getIntentLabel(smoothedIntent)

  return (
    <div className="flex justify-start px-3 sm:px-4 py-1.5" role="listitem">
      <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[75%]">
        <div
          className={`relative rounded-lg rounded-tl-sm overflow-hidden px-3 sm:px-4 py-3 ${messageColors.bg}`}
          style={{
            borderLeft: `6px solid ${spineColor}`,
          }}
        >
          {/* Speaker name with optional intent label */}
          <div className="flex items-center gap-2">
            <span
              className={`block text-xs font-semibold ${messageColors.label}`}
            >
              {message.speakerName}
            </span>
            {settings.showTooltip && (
              <span className="text-xs font-normal text-gray-400">
                ({intentLabel})
              </span>
            )}
          </div>

          {/* Message content */}
          <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap break-words">
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

          {/* Intent tooltip (hover "i" icon) */}
          {settings.showTooltip && <IntentTooltip intent={smoothedIntent} />}
        </div>

        {/* Timestamp */}
        <span
          className="block mt-0.5 text-xs text-gray-400 text-left"
          aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export const AIMessageWithIntent = memo(AIMessageWithIntentInner)
