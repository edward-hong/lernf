import React from 'react'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  onReset?: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onReset }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-900 mb-3">
          Something Went Wrong
        </h2>
        <p className="text-red-700 mb-6">
          {error}
        </p>

        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold
                         hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold
                         hover:bg-gray-700 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>

        <details className="mt-6 text-left">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
            Technical details
          </summary>
          <pre className="mt-2 text-xs bg-white p-3 rounded border border-red-200 overflow-auto">
            {error}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default ErrorState
