import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import CritiqueCard from './CritiqueCard'
import UserResponseInput from './UserResponseInput'
import RoundIndicator from './RoundIndicator'

const Deliberation: React.FC = () => {
  const { currentSession, endSession, loading } = useAdvocateStore()
  const [expandedProposal, setExpandedProposal] = useState(false)

  if (!currentSession) {
    return <div>No active session</div>
  }

  const { proposal, selectedAdvocates, rounds, currentRound } = currentSession
  const currentRoundData = rounds[rounds.length - 1]

  const handleEndSession = async () => {
    if (confirm('End this session and see your analysis? You won\'t be able to add more rounds.')) {
      await endSession()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <RoundIndicator currentRound={currentRound} totalRounds={rounds.length} />
      </div>

      <h2 className="text-3xl font-bold mb-6">
        Devil's Advocates - Round {currentRound}
      </h2>

      {/* Proposal (collapsible) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Your Proposal</h3>
          <button
            onClick={() => setExpandedProposal(!expandedProposal)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {expandedProposal ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {expandedProposal ? (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{proposal}</p>
        ) : (
          <p className="text-sm text-gray-600 line-clamp-2">{proposal}</p>
        )}
      </div>

      {/* Show previous rounds if any */}
      {rounds.slice(0, -1).map((round) => (
        <div key={round.roundNumber} className="mb-8 opacity-70">
          <h3 className="text-lg font-semibold text-gray-600 mb-3">
            Round {round.roundNumber} (Previous)
          </h3>

          {round.userMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Your Response:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{round.userMessage}</p>
            </div>
          )}

          <div className="space-y-3">
            {round.critiques.map((critique) => {
              const advocate = selectedAdvocates.find(a => a.id === critique.advocateId)
              if (!advocate) return null
              return (
                <div key={critique.advocateId} className="text-sm">
                  <CritiqueCard critique={critique} advocate={advocate} />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Current round critiques */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Current Critiques:</h3>
        {currentRoundData.critiques.map((critique) => {
          const advocate = selectedAdvocates.find(a => a.id === critique.advocateId)
          if (!advocate) return null

          return (
            <CritiqueCard
              key={critique.advocateId}
              critique={critique}
              advocate={advocate}
            />
          )
        })}
      </div>

      {/* User response input */}
      <UserResponseInput />

      {/* End session */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={handleEndSession}
          disabled={loading}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold
                     hover:bg-red-700 transition-colors disabled:bg-gray-300"
        >
          {loading ? 'Analyzing...' : 'End Deliberation & See Analysis'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          You'll see how you responded to criticism across all rounds
        </p>
      </div>
    </div>
  )
}

export default Deliberation
