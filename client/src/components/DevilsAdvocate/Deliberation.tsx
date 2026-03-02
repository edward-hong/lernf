import React from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import CritiqueCard from './CritiqueCard'

const Deliberation: React.FC = () => {
  const { currentSession, resetSession } = useAdvocateStore()

  if (!currentSession) {
    return <div>No active session</div>
  }

  const { proposal, selectedAdvocates, critiques } = currentSession

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Devil's Advocates - Round 1</h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Your Proposal</h3>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{proposal}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Critiques:</h3>
        {critiques.map((critique) => {
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Phase 1 Note:</strong> Multi-round deliberation will be added in Phase 2.
          For now, you can review the initial critiques.
        </p>
      </div>

      <button
        onClick={resetSession}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold
                   hover:bg-gray-700 transition-colors"
      >
        Start New Session
      </button>
    </div>
  )
}

export default Deliberation
