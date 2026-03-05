import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import { AVAILABLE_ADVOCATES } from '../../data/advocates'

const AdvocateSetup: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { selectedAdvocates, selectAdvocate, deselectAdvocate } = useAdvocateStore()
  const [showHelp, setShowHelp] = useState(false)

  const isSelected = (advocateId: string) => {
    return selectedAdvocates.some(a => a.id === advocateId)
  }

  const canProceed = selectedAdvocates.length >= 3

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Assemble Your Devil's Advocates</h2>
        <p className="text-gray-600">
          Select 3-5 AI models to criticize your idea. Each will attack from a different angle.
        </p>
      </div>

      {/* Help callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Remember:</strong> At the end, you'll see how YOU responded to their
              criticism - not how they criticized you. The test is whether you listen.
            </p>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              {showHelp ? 'Hide' : 'Show'} critical lens explanations →
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-2 text-sm text-gray-700">
            <p><strong>Logical Flaws:</strong> Finds reasoning errors, false assumptions, contradictions</p>
            <p><strong>Practical Execution:</strong> Surfaces implementation challenges, unrealistic timelines</p>
            <p><strong>Unintended Consequences:</strong> Identifies second-order effects you haven't considered</p>
            <p><strong>Stakeholder Impact:</strong> Questions who gets harmed, whose interests are overlooked</p>
            <p><strong>Resource Constraints:</strong> Analyzes opportunity costs, alternative uses of resources</p>
          </div>
        )}
      </div>

      {/* Advocates grid */}
      <div className="space-y-4 mb-6">
        {AVAILABLE_ADVOCATES.map(advocate => {
          const selected = isSelected(advocate.id)

          return (
            <div
              key={advocate.id}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all
                         transform hover:scale-[1.02] ${
                selected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
              onClick={() => {
                if (selected) {
                  deselectAdvocate(advocate.id)
                } else {
                  selectAdvocate(advocate)
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full transition-all"
                      style={{ backgroundColor: advocate.color }}
                    />
                    <h3 className="font-semibold text-xl">{advocate.name}</h3>
                    <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                      {advocate.lens.charAt(0).toUpperCase() + advocate.lens.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{advocate.description}</p>
                  <p className="text-sm text-gray-500 italic bg-white rounded p-2 border-l-4"
                     style={{ borderColor: advocate.color }}>
                    {advocate.example}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                                  transition-all ${
                    selected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {selected && (
                      <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round"
                           strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selection counter and CTA */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div>
          <p className="font-semibold text-gray-900">
            {selectedAdvocates.length} advocate{selectedAdvocates.length !== 1 ? 's' : ''} selected
          </p>
          <p className="text-sm text-gray-600">
            {selectedAdvocates.length < 3 && `Need ${3 - selectedAdvocates.length} more`}
            {selectedAdvocates.length >= 3 && selectedAdvocates.length < 5 && 'Can add up to 2 more'}
            {selectedAdvocates.length === 5 && 'Maximum reached'}
          </p>
        </div>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-blue-700 transition-all transform hover:scale-105
                     shadow-lg hover:shadow-xl"
        >
          Next: Present Proposal →
        </button>
      </div>
    </div>
  )
}

export default AdvocateSetup
