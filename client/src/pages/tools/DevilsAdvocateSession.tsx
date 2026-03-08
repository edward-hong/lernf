import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import AdvocateSetup from '../../components/DevilsAdvocate/AdvocateSetup'
import ProposalInput from '../../components/DevilsAdvocate/ProposalInput'
import Deliberation from '../../components/DevilsAdvocate/Deliberation'
import SessionSummary from '../../components/DevilsAdvocate/SessionSummary'
import ErrorState from '../../components/DevilsAdvocate/ErrorState'

type Step = 'setup' | 'proposal' | 'deliberation' | 'summary'

const DevilsAdvocateSession: React.FC = () => {
  const [step, setStep] = useState<Step>('setup')
  const { currentSession, error, resetSession } = useAdvocateStore()

  // Auto-navigate based on session status
  React.useEffect(() => {
    if (currentSession?.status === 'deliberating') {
      setStep('deliberation')
    } else if (currentSession?.status === 'complete') {
      setStep('summary')
    }
  }, [currentSession])

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold">Devil's Advocates</h1>
          </div>
        </div>
        <ErrorState
          error={error}
          onReset={() => {
            resetSession()
            setStep('setup')
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">Devil's Advocates</h1>
          <p className="text-xl text-gray-600">
            "You are my mirror" (以人為鏡) - Emperor Taizong to Wei Zheng
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center gap-2">
          {(['setup', 'proposal', 'deliberation', 'summary'] as const).map((s, i) => {
            const stepIndex = ['setup', 'proposal', 'deliberation', 'summary'].indexOf(step)
            const isActive = s === step
            const isComplete = stepIndex > i

            return (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  isComplete ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {isComplete ? '✓' : i + 1}
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-1 ${
                    isComplete ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Setup</span>
          <span>Proposal</span>
          <span>Deliberation</span>
          <span>Analysis</span>
        </div>
      </div>

      {/* Main content */}
      {step === 'setup' && (
        <AdvocateSetup onNext={() => setStep('proposal')} />
      )}

      {step === 'proposal' && (
        <ProposalInput onSubmit={() => setStep('deliberation')} />
      )}

      {step === 'deliberation' && (
        <Deliberation />
      )}

      {step === 'summary' && (
        <SessionSummary />
      )}
    </div>
  )
}

export default DevilsAdvocateSession
