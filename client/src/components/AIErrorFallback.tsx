interface AIErrorFallbackProps {
  error: Error
  onRetry?: () => void
  onConfigureProviders?: () => void
}

/**
 * Displays a helpful error message when AI calls fail,
 * with contextual suggestions based on the error type.
 */
export function AIErrorFallback({
  error,
  onRetry,
  onConfigureProviders,
}: AIErrorFallbackProps) {
  const isAuthError =
    error.message.includes('API key') || error.message.includes('Invalid')
  const isRateLimitError = error.message.includes('Rate limit')
  const isProviderError = error.message.includes('provider')

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg shrink-0" aria-hidden="true">
          !
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            AI Request Failed
          </h3>
          <p className="text-sm text-red-800 mb-3">{error.message}</p>

          {isAuthError && (
            <p className="text-sm text-red-700 mb-3">
              Your API key may be invalid or expired. Please check your
              settings.
            </p>
          )}

          {isRateLimitError && (
            <p className="text-sm text-red-700 mb-3">
              You've exceeded the rate limit. Try again in a few minutes or
              configure backup providers.
            </p>
          )}

          {isProviderError && (
            <p className="text-sm text-red-700 mb-3">
              All configured providers failed. Check your API keys or use the
              backend default.
            </p>
          )}

          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Retry
              </button>
            )}
            {onConfigureProviders && (
              <button
                onClick={onConfigureProviders}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Configure Providers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
