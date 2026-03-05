// ---------------------------------------------------------------------------
// Pattern Alerts
// ---------------------------------------------------------------------------
// Detects and alerts users to interesting intent patterns in the
// conversation, such as sycophancy, steering, resistance, or
// uncertainty spikes.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import type { ChatMessage } from '../../state/liveChatState'

interface Pattern {
  type: 'sycophancy' | 'steering' | 'resistance' | 'uncertainty_spike'
  severity: 'low' | 'medium' | 'high'
  message: string
  turnIndex: number
}

interface PatternAlertsProps {
  messages: ChatMessage[]
}

export function PatternAlerts({ messages }: PatternAlertsProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])

  useEffect(() => {
    const aiMessages = messages.filter(
      (msg) => msg.role === 'assistant' && msg.intent,
    )
    if (aiMessages.length < 2) {
      setPatterns([])
      return
    }

    const detected: Pattern[] = []
    const turnIndex = aiMessages.length - 1
    const current = aiMessages[turnIndex]
    const previous = aiMessages[turnIndex - 1]

    if (!current.intent || !previous.intent) return

    // Detect sycophancy (cooperative spike + low friction)
    if (
      current.intent.cooperative > 0.8 &&
      current.intent.persuasive < 0.3 &&
      current.intent.defensive < 0.2
    ) {
      detected.push({
        type: 'sycophancy',
        severity: 'medium',
        message:
          'AI is being very agreeable. Is it challenging your assumptions?',
        turnIndex,
      })
    }

    // Detect steering (persuasive increase)
    const persuasiveDelta =
      current.intent.persuasive - previous.intent.persuasive
    if (persuasiveDelta > 0.3) {
      detected.push({
        type: 'steering',
        severity: 'high',
        message:
          'AI is steering more strongly toward a specific direction.',
        turnIndex,
      })
    }

    // Detect resistance (defensive spike)
    if (current.intent.defensive > 0.7) {
      detected.push({
        type: 'resistance',
        severity: 'medium',
        message:
          "AI is pushing back. Notice how it's resisting your direction.",
        turnIndex,
      })
    }

    // Detect uncertainty spike
    const uncertaintyDelta =
      current.intent.uncertainty - previous.intent.uncertainty
    if (uncertaintyDelta > 0.4) {
      detected.push({
        type: 'uncertainty_spike',
        severity: 'low',
        message: 'AI suddenly became more uncertain. What changed?',
        turnIndex,
      })
    }

    setPatterns(detected)
  }, [messages])

  if (patterns.length === 0) return null

  return (
    <div className="space-y-2">
      {patterns.map((pattern, index) => (
        <div
          key={index}
          className={`px-4 py-3 rounded-lg border ${
            pattern.severity === 'high'
              ? 'bg-orange-50 border-orange-200'
              : pattern.severity === 'medium'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">
              {pattern.severity === 'high'
                ? '\u26A0\uFE0F'
                : pattern.severity === 'medium'
                  ? '\uD83D\uDCA1'
                  : '\u2139\uFE0F'}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                Pattern Detected
              </div>
              <div className="text-sm text-gray-700 mt-1">
                {pattern.message}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
