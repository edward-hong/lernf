import React, { useState } from 'react'
import { useAdvocateStore } from '../../state/advocateState'

const UserResponseInput: React.FC = () => {
  const { userResponseText, setUserResponse, continueSession, loading } = useAdvocateStore()
  const [localText, setLocalText] = useState(userResponseText)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value)
    setUserResponse(e.target.value)
  }

  const handleSubmit = async () => {
    if (localText.length < 20) return
    await continueSession(localText)
    setLocalText('')
  }

  const charCount = localText.length
  const minChars = 20
  const maxChars = 1000
  const canSubmit = charCount >= minChars && charCount <= maxChars

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <h3 className="text-xl font-semibold mb-3">Your Response to the Advocates:</h3>

      <textarea
        value={localText}
        onChange={handleChange}
        placeholder={`Address their criticisms, defend your reasoning, or ask follow-up questions.

Example: 'These are valid points. Let me address them:
1. On the timeline - I plan to validate while employed (nights/weekends)
2. Regarding the co-founder - they've already committed and written code
3. My partner and I have discussed the risks explicitly'

Be honest. The advocates will push back if you dodge their core points.`}
        className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />

      <div className="flex justify-between items-center mt-3">
        <div className="text-sm">
          {charCount < minChars && (
            <span className="text-gray-500">
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
              Too long: {charCount} / {maxChars} characters
            </span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Generating Responses...' : 'Respond to Advocates'}
        </button>
      </div>
    </div>
  )
}

export default UserResponseInput
