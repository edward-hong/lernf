// ---------------------------------------------------------------------------
// Completion Dialog — Scenario completion confirmation UI
// ---------------------------------------------------------------------------
// Shows contextual confirmation dialogs based on how the completion was
// triggered: AI-detected, long-running nudge, or user-initiated end.
// ---------------------------------------------------------------------------

import type { CompletionDetectionResult } from '../ai/completionDetector'

interface CompletionDialogProps {
  /** The detection result that triggered this dialog. */
  result: CompletionDetectionResult
  /** Called when the user chooses to see results (end the scenario). */
  onSeeResults: () => void
  /** Called when the user chooses to keep going. */
  onKeepGoing: () => void
}

export function CompletionDialog({
  result,
  onSeeResults,
  onKeepGoing,
}: CompletionDialogProps) {
  return (
    <div className="mx-4 my-3">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header stripe */}
          <div
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wide ${
              result.promptType === 'user-initiated'
                ? 'bg-red-50 text-red-700 border-b border-red-100'
                : result.promptType === 'long-running'
                  ? 'bg-amber-50 text-amber-700 border-b border-amber-100'
                  : 'bg-green-50 text-green-700 border-b border-green-100'
            }`}
          >
            {result.promptType === 'ai-detected' && 'Scenario Checkpoint'}
            {result.promptType === 'long-running' && 'Taking a While'}
            {result.promptType === 'user-initiated' && 'End Scenario'}
          </div>

          {/* Body */}
          <div className="px-4 py-4">
            {/* Main message */}
            <p className="text-sm text-gray-800 font-medium">
              {result.promptType === 'ai-detected' &&
                "Looks like you've completed this scenario."}
              {result.promptType === 'long-running' &&
                "You've been navigating this for a while."}
              {result.promptType === 'user-initiated' &&
                'Scenario still in progress.'}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {result.promptType === 'ai-detected' &&
                'See results or continue exploring?'}
              {result.promptType === 'long-running' &&
                `${result.userTurnCount} turns in — ready to wrap up?`}
              {result.promptType === 'user-initiated' &&
                `You're ${result.userTurnCount} turns in. End now?`}
            </p>

            {/* AI reasoning (only for ai-detected) */}
            {result.promptType === 'ai-detected' && result.evaluation?.reasoning && (
              <p className="text-xs text-gray-400 mt-2 italic">
                {result.evaluation.reasoning}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={onSeeResults}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  result.promptType === 'user-initiated'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {result.promptType === 'user-initiated'
                  ? 'End Now'
                  : 'See Results'}
              </button>
              <button
                onClick={onKeepGoing}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
