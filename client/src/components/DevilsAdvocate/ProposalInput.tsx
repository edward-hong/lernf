import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'
import LoadingState from './LoadingState'

const ProposalInput: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const { proposalText, setProposal, selectedAdvocates, startSession, loading } = useAdvocateStore()
  const [localText, setLocalText] = useState(proposalText)
  const [showExamples, setShowExamples] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
    setProposal(e.target.value)
  }

  const handleSubmit = async () => {
    if (localText.length < 100) return
    await startSession(localText, selectedAdvocates)
    onSubmit()
  }

  const useExample = (example: string) => {
    setLocalText(example)
    setProposal(example)
    setShowExamples(false)
  }

  const charCount = localText.length
  const minChars = 100
  const maxChars = 2000
  const canSubmit = charCount >= minChars && charCount <= maxChars

  const examples = [
    {
      title: "Career Change",
      text: "I'm planning to quit my $150k job at Google to build a SaaS startup targeting productivity tools for remote teams. I have 6 months of runway saved up. My co-founder and I both have technical backgrounds but no sales experience. We've validated the idea with 10 customer interviews and have 2 LOIs (letters of intent). Planning to launch an MVP in 3 months."
    },
    {
      title: "Product Pivot",
      text: "Our B2C app has 50k users but $0 revenue after 18 months. I want to pivot to B2B enterprise, targeting the same problem but selling to companies instead of individuals. This means rebuilding for SSO, RBAC, and compliance. It will take 6 months and cost $200k in engineering time. We have 9 months of runway left."
    },
    {
      title: "Investment Decision",
      text: "I'm considering investing $100k (20% of my liquid net worth) into a friend's AI startup. They're pre-revenue but have impressive tech and a former FAANG founding team. I'd get 2% equity. The risk is I lose everything. The upside is 100x if they exit. My spouse is skeptical. I have FOMO because other friends are getting rich from similar bets."
    }
  ]

  if (loading) {
    return (
      <LoadingState
        message="Generating critiques from your advocates..."
        submessage="This may take 10-15 seconds"
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Present Your Proposal</h2>
        <p className="text-gray-600">
          Your advocates: {selectedAdvocates.map(a => a.name).join(', ')}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Your Proposal
          </label>
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showExamples ? 'Hide' : 'Show'} examples
          </button>
        </div>

        {showExamples && (
          <div className="mb-4 space-y-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => useExample(ex.text)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100
                           rounded-lg border border-gray-200 transition-colors"
              >
                <p className="font-semibold text-sm text-gray-900 mb-1">{ex.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{ex.text}</p>
              </button>
            ))}
          </div>
        )}

        <textarea
          value={localText}
          onChange={handleChange}
          placeholder={`Be specific. The more detail you provide, the better the advocates can scrutinize your thinking.

Good: 'I'm planning to quit my $150k job at Google to build a SaaS startup targeting productivity tools for remote teams. I have 6 months of runway saved. My co-founder and I both have technical backgrounds but no sales experience.'

Bad: 'Should I start a startup?'`}
          className="w-full h-80 p-4 border-2 border-gray-300 rounded-xl resize-none
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                     text-lg leading-relaxed"
        />

        <div className="flex justify-between items-center mt-3">
          <div className="text-sm">
            {charCount < minChars && (
              <span className="text-red-600 font-medium">
                Need {minChars - charCount} more characters (minimum {minChars})
              </span>
            )}
            {charCount >= minChars && charCount <= maxChars && (
              <span className="text-green-600 font-medium">
                ✓ {charCount} / {maxChars} characters
              </span>
            )}
            {charCount > maxChars && (
              <span className="text-red-600 font-medium">
                {charCount - maxChars} characters over limit
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-900 mb-1">Remember:</p>
            <p className="text-sm text-yellow-800">
              The advocates will find flaws. That's their job. The question is: will you listen to them?
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full px-8 py-5 bg-gradient-to-r from-red-600 to-orange-600
                   text-white rounded-xl font-bold text-xl
                   disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                   hover:from-red-700 hover:to-orange-700 transition-all
                   transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
      >
        Submit for Scrutiny
      </button>
    </div>
  )
}

export default ProposalInput
