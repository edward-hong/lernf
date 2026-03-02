import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'

const ProposalInput: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const { proposalText, setProposal, selectedAdvocates, startSession, loading } = useAdvocateStore()
  const [localText, setLocalText] = useState(proposalText)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
    setProposal(e.target.value)
  }

  const handleSubmit = async () => {
    if (localText.length < 100) return
    await startSession(localText, selectedAdvocates)
    onSubmit()
  }

  const charCount = localText.length
  const minChars = 100
  const maxChars = 2000
  const canSubmit = charCount >= minChars && charCount <= maxChars

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-2">Present Your Proposal</h2>

      <div className="mb-4">
        <p className="text-gray-600">
          Selected advocates: {selectedAdvocates.map(a => a.name).join(', ')}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Proposal
        </label>
        <textarea
          value={localText}
          onChange={handleChange}
          placeholder={`Be specific. The more detail you provide, the better the advocates can scrutinize your thinking.

Good: 'I'm planning to quit my $150k job at Google to build a SaaS startup targeting productivity tools for remote teams. I have 6 months of runway saved. My co-founder and I both have technical backgrounds but no sales experience.'

Bad: 'Should I start a startup?'`}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm">
            {charCount < minChars && (
              <span className="text-red-600">
                Minimum {minChars} characters (currently {charCount})
              </span>
            )}
            {charCount >= minChars && charCount <= maxChars && (
              <span className="text-green-600">
                {charCount} / {maxChars} characters
              </span>
            )}
            {charCount > maxChars && (
              <span className="text-red-600">
                {charCount} / {maxChars} characters (too long)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-900">
          <strong>Remember:</strong> The advocates will find flaws. That's their job.
          The question is: will you listen to them?
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full px-6 py-4 bg-red-600 text-white rounded-lg font-semibold text-lg
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   hover:bg-red-700 transition-colors"
      >
        {loading ? 'Generating Critiques...' : 'Submit for Scrutiny'}
      </button>
    </div>
  )
}

export default ProposalInput
