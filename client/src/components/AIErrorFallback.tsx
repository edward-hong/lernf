import type { AIProviderError } from '../types/aiRequest';
import { getErrorMessage } from '../utils/providerErrorMessages';

interface AIErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
  onConfigureProviders?: () => void;
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
  // Check if the error is an AIProviderError (has provider field)
  const providerError = (error as unknown as AIProviderError).provider
    ? (error as unknown as AIProviderError)
    : null;

  const errorInfo = providerError
    ? getErrorMessage(providerError)
    : {
        title: 'AI Request Failed',
        message: error.message,
        action: 'Please try again.',
        canRetry: true,
      };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg shrink-0" aria-hidden="true">
          !
        </span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">
            {errorInfo.title}
          </h3>
          <p className="text-sm text-red-800 mb-2">{errorInfo.message}</p>
          <p className="text-sm text-red-700 mb-3">{errorInfo.action}</p>

          <div className="flex items-center gap-3">
            {onRetry && errorInfo.canRetry && (
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
  );
}
