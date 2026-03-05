// ---------------------------------------------------------------------------
// Loading State Components — Skeleton, Thinking, Spinner
// ---------------------------------------------------------------------------

/** Skeleton placeholder while a scenario is initializing. */
export function ScenarioSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8 animate-pulse"
      role="status"
      aria-label="Loading scenario"
    >
      {/* Title skeleton */}
      <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />

      {/* Briefing card skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>

      {/* Participants skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="h-3 bg-gray-200 rounded w-20 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-3 h-3 bg-gray-200 rounded-full mt-1 shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-28 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg" />
      <span className="sr-only">Loading scenario...</span>
    </div>
  )
}

/** Thinking indicator shown while waiting for NPC response. */
export function ThinkingIndicator({ speakerName }: { speakerName?: string }) {
  return (
    <div className="flex justify-start px-4 py-1.5" role="status" aria-label={`${speakerName ?? 'AI'} is thinking`}>
      <div className="max-w-[75%]">
        <div className="bg-gray-50 border-l-4 border-gray-300 rounded-lg rounded-tl-sm px-4 py-3">
          {speakerName && (
            <span className="block text-xs font-semibold text-gray-500 mb-1">
              {speakerName}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
        <span className="block mt-0.5 text-xs text-gray-400">
          {speakerName ? `${speakerName} is thinking...` : 'AI is thinking...'}
        </span>
      </div>
    </div>
  )
}

/** Spinner with label for evaluation phase. */
export function EvaluationSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4" role="status">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500 font-medium">
        {label ?? 'Evaluating your performance...'}
      </p>
      <p className="text-xs text-gray-400">This may take a moment</p>
    </div>
  )
}

/** Inline error message with retry button. */
export function InlineError({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      className="mx-4 my-3 p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
