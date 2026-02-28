// ---------------------------------------------------------------------------
// Completion Dialog — Scenario completion confirmation UI
// ---------------------------------------------------------------------------
// Shows contextual confirmation dialogs based on how the completion was
// triggered: AI-detected, long-running nudge, or user-initiated end.
// Focus is trapped within the dialog for accessibility.
// ---------------------------------------------------------------------------

import { useRef, useEffect } from 'react'
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
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  // Focus the primary action button on mount
  useEffect(() => {
    firstButtonRef.current?.focus()
  }, [])

  // Trap focus and handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onKeepGoing()
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onKeepGoing])

  return (
    <div className="mx-3 sm:mx-4 my-3">
      <div className="max-w-3xl mx-auto">
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-labelledby="completion-title"
          aria-describedby="completion-desc"
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Header stripe */}
          <div
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wide ${
              result.promptType === 'user-initiated'
                ? 'bg-red-50 text-red-700 border-b border-red-100'
                : result.promptType === 'long-running'
                  ? 'bg-amber-50 text-amber-700 border-b border-amber-100'
                  : 'bg-green-50 text-green-700 border-b border-green-100'
            }`}
            id="completion-title"
          >
            {result.promptType === 'ai-detected' && 'Scenario Checkpoint'}
            {result.promptType === 'long-running' && 'Taking a While'}
            {result.promptType === 'user-initiated' && 'End Scenario'}
          </div>

          {/* Body */}
          <div className="px-4 py-4" id="completion-desc">
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

            {result.promptType === 'ai-detected' && result.evaluation?.reasoning && (
              <p className="text-xs text-gray-400 mt-2 italic">
                {result.evaluation.reasoning}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4">
              <button
                ref={firstButtonRef}
                onClick={onSeeResults}
                className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  result.promptType === 'user-initiated'
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {result.promptType === 'user-initiated'
                  ? 'End Now'
                  : 'See Results'}
              </button>
              <button
                onClick={onKeepGoing}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
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
