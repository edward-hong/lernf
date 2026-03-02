// ---------------------------------------------------------------------------
// Conversation Timeline
// ---------------------------------------------------------------------------
// Shows a visual timeline of intent changes over the conversation, with
// one colour bar per AI turn representing the blended intent colour.
// ---------------------------------------------------------------------------

import type { ChatMessage } from '../../state/liveChatState'
import { intentToColor } from '../../utils/colorBlending'

interface ConversationTimelineProps {
  messages: ChatMessage[]
}

export function ConversationTimeline({ messages }: ConversationTimelineProps) {
  const aiMessages = messages.filter(
    (msg) => msg.role === 'assistant' && msg.intent,
  )

  if (aiMessages.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 py-8">
        <p className="text-2xl mb-2">&#x1f4ca;</p>
        <p>Intent timeline will appear as you chat</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Intent Timeline</h3>

      <div className="space-y-2">
        {aiMessages.map((message) => {
          if (!message.intent) return null

          const color = intentToColor(message.intent)
          const turnNumber =
            messages
              .filter((m) => m.role === 'assistant')
              .indexOf(message) + 1

          return (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">Turn {turnNumber}</span>
                <span className="text-gray-400">&middot;</span>
                <span className="truncate">
                  {message.content.slice(0, 30)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-6 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: '100%',
                      background: `linear-gradient(to right, ${color}, ${color})`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
