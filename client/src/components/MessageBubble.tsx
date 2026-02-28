import type { ScenarioMessage, ScenarioColorConfig, ColorClasses } from '../types/scenario'
import { getPersonaColors } from '../utils/colors'

interface MessageBubbleProps {
  message: ScenarioMessage
  colors: ScenarioColorConfig
}

function getColorsForMessage(
  message: ScenarioMessage,
  config: ScenarioColorConfig,
): ColorClasses {
  switch (message.speakerType) {
    case 'user':
      return config.user
    case 'system':
      return config.system
    case 'ai':
      return config.ai
    case 'npc':
      return getPersonaColors(message.speakerId, config) ?? config.system
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message, colors }: MessageBubbleProps) {
  const colorClasses = getColorsForMessage(message, colors)
  const isUser = message.speakerType === 'user'
  const isSystem = message.speakerType === 'system'

  // System messages: full-width, neutral
  if (isSystem) {
    return (
      <div className="w-full px-4 py-2">
        <div
          className={`${colorClasses.bg} border ${colorClasses.border} rounded-md px-4 py-2.5 text-sm ${colorClasses.label}`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span className={`block mt-1 text-xs ${colorClasses.accent}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    )
  }

  // User messages: right-aligned, gray background
  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-1.5">
        <div className="max-w-[75%]">
          <div
            className={`${colorClasses.bg} border ${colorClasses.border} rounded-2xl rounded-br-sm px-4 py-2.5`}
          >
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <span className="block mt-0.5 text-right text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    )
  }

  // NPC / AI messages: left-aligned, color-coded with left border
  return (
    <div className="flex justify-start px-4 py-1.5">
      <div className="max-w-[75%]">
        <div
          className={`${colorClasses.bg} border-l-4 ${colorClasses.border} rounded-lg rounded-tl-sm px-4 py-2.5`}
        >
          {/* Colored name label */}
          <span className={`block text-xs font-semibold ${colorClasses.label} mb-1`}>
            {message.speakerName}
          </span>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <span className={`block mt-0.5 text-xs ${colorClasses.accent}`}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
