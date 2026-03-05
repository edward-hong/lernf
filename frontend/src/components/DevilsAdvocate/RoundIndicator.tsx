import React from 'react'

interface RoundIndicatorProps {
  currentRound: number
  totalRounds: number
}

const RoundIndicator: React.FC<RoundIndicatorProps> = ({
  currentRound,
  totalRounds
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
        <div
          key={round}
          className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
            round === currentRound
              ? 'bg-blue-600 text-white'
              : round < currentRound
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {round}
        </div>
      ))}
      <span className="text-sm text-gray-600 ml-2">
        Round {currentRound} of {totalRounds}
      </span>
    </div>
  )
}

export default RoundIndicator
