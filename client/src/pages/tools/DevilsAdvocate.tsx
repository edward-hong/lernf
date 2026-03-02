import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import AdvocateSetup from '../../components/DevilsAdvocate/AdvocateSetup'
import ProposalInput from '../../components/DevilsAdvocate/ProposalInput'
import Deliberation from '../../components/DevilsAdvocate/Deliberation'

type Step = 'setup' | 'proposal' | 'deliberation'

const DevilsAdvocate: React.FC = () => {
  const [step, setStep] = useState<Step>('setup')
  const { currentSession } = useAdvocateStore()

  // If we have an active session, go straight to deliberation
  React.useEffect(() => {
    if (currentSession?.status === 'deliberating') {
      setStep('deliberation')
    }
  }, [currentSession])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-2">Devil's Advocates</h1>
          <p className="text-xl text-gray-600">
            "You are my mirror" - Emperor Taizong to Wei Zheng
          </p>
        </div>
      </div>

      {step === 'setup' && (
        <AdvocateSetup onNext={() => setStep('proposal')} />
      )}

      {step === 'proposal' && (
        <ProposalInput onSubmit={() => setStep('deliberation')} />
      )}

      {step === 'deliberation' && (
        <Deliberation />
      )}
    </div>
  )
}

export default DevilsAdvocate
