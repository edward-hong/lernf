import React from 'react'
import type { UserIntent } from '../../types/advocate'

interface IntentRevealProps {
  roundNumber: number
  userMessage: string
  intent: UserIntent
}

const IntentReveal: React.FC<IntentRevealProps> = ({
  roundNumber,
  userMessage,
  intent
}) => {
  const getStatusIcon = (defensive: number) => {
    if (defensive < 0.4) return '\u2705'
    if (defensive < 0.7) return '\u26A0\uFE0F'
    return '\u274C'
  }

  const getStatusText = (defensive: number) => {
    if (defensive < 0.4) return 'Open to criticism'
    if (defensive < 0.7) return 'Becoming defensive'
    return 'Stopped listening'
  }

  const IntentBar = ({
    label,
    value,
    color
  }: {
    label: string
    value: number
    color: string
  }) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{value.toFixed(2)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${value * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  )

  return (
    <div className="border border-gray-300 rounded-lg p-5 mb-4 bg-white">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-lg font-semibold">
          Round {roundNumber}: {intent.interpretation}
        </h4>
        <span className="text-2xl">
          {getStatusIcon(intent.defensive)}
        </span>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">Your Response:</p>
        <p className="text-sm text-gray-700 italic">"{userMessage}"</p>
      </div>

      <div className="space-y-2">
        <IntentBar
          label="Cooperative"
          value={intent.cooperative}
          color="#3B82F6"
        />
        <IntentBar
          label="Defensive"
          value={intent.defensive}
          color="#EF4444"
        />
        <IntentBar
          label="Epistemic Openness"
          value={intent.epistemic}
          color="#8B5CF6"
        />
        <IntentBar
          label="Persuasive"
          value={intent.persuasive}
          color="#F59E0B"
        />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          <strong className={
            intent.defensive < 0.4 ? 'text-green-600' :
            intent.defensive < 0.7 ? 'text-yellow-600' :
            'text-red-600'
          }>
            {getStatusText(intent.defensive)}
          </strong>
        </p>
      </div>
    </div>
  )
}

export default IntentReveal
