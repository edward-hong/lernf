import React from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import IntentReveal from './IntentReveal'
import TrendChart from './TrendChart'
import WeiZhengParallel from './WeiZhengParallel'

const SessionSummary: React.FC = () => {
  const { sessionAnalysis, transcript, resetSession, currentSession } = useAdvocateStore()

  if (!sessionAnalysis || !currentSession) {
    return <div>No analysis available</div>
  }

  const { roundByRound, trends, pattern, keyDismissals } = sessionAnalysis

  const downloadTranscript = () => {
    if (!transcript) return

    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devils-advocates-${currentSession.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2">
        Session Complete: How Well Did You Listen?
      </h2>
      <p className="text-gray-600 mb-6">
        {roundByRound.length} round{roundByRound.length !== 1 ? 's' : ''} of deliberation with {currentSession.selectedAdvocates.length} advocates
      </p>

      {/* Overall pattern */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
        <h3 className="font-semibold text-lg mb-2 text-blue-900">Your Response Pattern:</h3>
        <p className="text-gray-800">{pattern.overallPattern}</p>
        {pattern.turningPoint && (
          <p className="text-sm text-gray-600 mt-2">
            Turning point: Round {pattern.turningPoint}
          </p>
        )}
      </div>

      {/* Round by round analysis */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Round-by-Round Analysis:</h3>
        {roundByRound.map((round) => (
          <IntentReveal
            key={round.roundNumber}
            roundNumber={round.roundNumber}
            userMessage={round.userMessage}
            intent={round.intent}
          />
        ))}
      </div>

      {/* Trends */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Behavioral Trends:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <TrendChart
            label="Defensiveness"
            values={trends.defensiveness}
            goodDirection="down"
            color="#EF4444"
          />
          <TrendChart
            label="Epistemic Openness"
            values={trends.epistemicOpenness}
            goodDirection="up"
            color="#8B5CF6"
          />
          <TrendChart
            label="Cooperation"
            values={trends.cooperation}
            goodDirection="up"
            color="#3B82F6"
          />
          <TrendChart
            label="Persuasiveness"
            values={trends.persuasive}
            goodDirection="down"
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Key dismissals */}
      {keyDismissals.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Criticisms You Dismissed:</h3>
          <div className="space-y-3">
            {keyDismissals.map((dismissal, i) => (
              <div key={i} className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                <p className="font-semibold text-red-900 mb-1">
                  {dismissal.criticism}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  Raised by: {currentSession.selectedAdvocates.find(a => a.id === dismissal.advocateId)?.name || dismissal.advocateId}
                </p>
                <p className="text-sm text-gray-600 italic">
                  {dismissal.howDismissed}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wei Zheng parallel */}
      <div className="mb-8">
        <WeiZhengParallel pattern={pattern} />
      </div>

      {/* Self-reflection */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-3">Self-Reflection Questions:</h3>
        <ul className="space-y-2 text-gray-700">
          <li>At what point did you stop genuinely considering their criticism?</li>
          <li>Which criticisms made you most defensive? Why?</li>
          <li>If your best friend gave you this feedback, would you have listened better?</li>
          <li>What would it take for you to change your mind?</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={downloadTranscript}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                     hover:bg-blue-700 transition-colors"
        >
          Download Full Transcript
        </button>
        <button
          onClick={resetSession}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold
                     hover:bg-gray-700 transition-colors"
        >
          Start New Session
        </button>
      </div>
    </div>
  )
}

export default SessionSummary
