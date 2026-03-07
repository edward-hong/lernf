import { memo } from 'react'
import type {
  ScenarioMessage,
  ScenarioColorConfig,
  ColorClasses,
} from '../../../types/scenario'
import { getPersonaColors } from '../../../utils/colors'
import { MarkdownRenderer } from '../../MarkdownRenderer'

interface MessageBubbleProps {
  message: ScenarioMessage
  colors: ScenarioColorConfig
}

function getColorsForMessage(
  message: ScenarioMessage,
  config: ScenarioColorConfig
): ColorClasses {
  switch (message.speakerType) {
    case 'user':
      return config.user
    case 'ai':
      return config.ai
    case 'system':
      return config.system
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

function MessageBubbleInner({ message, colors }: MessageBubbleProps) {
  const messageColors = getColorsForMessage(message, colors)
  const isUser = message.speakerType === 'user'
  const isSystem = message.speakerType === 'system'

  if (isSystem) {
    return (
      <div
        className="px-3 sm:px-4 py-2"
        role="status"
        aria-label={`System: ${message.content.slice(0, 50)}`}
      >
        <div
          className={`w-full rounded-lg px-3 sm:px-4 py-3 text-sm ${messageColors.bg} ${messageColors.label}`}
        >
          <span className="sr-only">System message: </span>
          <div className="whitespace-pre-wrap">
            <MarkdownRenderer content={message.content} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } px-3 sm:px-4 py-1.5`}
      role="listitem"
    >
      <div className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%]`}>
        <div
          className={`rounded-lg ${
            isUser ? 'rounded-tr-sm' : 'rounded-tl-sm border-l-4'
          } px-3 sm:px-4 py-3 ${messageColors.bg} ${
            isUser ? '' : messageColors.border
          }`}
        >
          {/* Speaker name */}
          {!isUser && (
            <span
              className={`block text-xs font-semibold mb-1 ${messageColors.label}`}
            >
              {message.speakerName}
            </span>
          )}

          {/* Content */}
          {isUser ? (
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : (
            <div className="text-sm text-gray-800 break-words">
              <MarkdownRenderer content={message.content} />
            </div>
          )}

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
        </div>

        {/* Timestamp */}
        <span
          className={`block mt-0.5 text-xs text-gray-400 ${
            isUser ? 'text-right' : 'text-left'
          }`}
          aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleInner)
