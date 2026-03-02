import React from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import { AVAILABLE_ADVOCATES } from '../../data/advocates'

const AdvocateSetup: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { selectedAdvocates, selectAdvocate, deselectAdvocate } = useAdvocateStore()

  const isSelected = (advocateId: string) => {
    return selectedAdvocates.some(a => a.id === advocateId)
  }

  const canProceed = selectedAdvocates.length >= 3

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2">Assemble Your Devil's Advocates</h2>
      <p className="text-gray-600 mb-6">
        Select 3-5 AI models to criticize your idea. Each will attack from a different angle.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          At the end of the session, you'll see how YOU responded to their criticism -
          not how they criticized you. The test is whether you listen.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {AVAILABLE_ADVOCATES.map(advocate => (
          <div
            key={advocate.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              isSelected(advocate.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              if (isSelected(advocate.id)) {
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
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: advocate.color }}
                  />
                  <h3 className="font-semibold text-lg">{advocate.name}</h3>
                  <span className="text-sm text-gray-500">
                    {advocate.lens.charAt(0).toUpperCase() + advocate.lens.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{advocate.description}</p>
                <p className="text-sm text-gray-500 italic">{advocate.example}</p>
              </div>
              <div className="ml-4">
                {isSelected(advocate.id) ? (
                  <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Selected: {selectedAdvocates.length} advocate{selectedAdvocates.length !== 1 ? 's' : ''}
          {' '}(minimum 3, maximum 5)
        </p>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-blue-700 transition-colors"
        >
          Next: Present Proposal
        </button>
      </div>
    </div>
  )
}

export default AdvocateSetup
