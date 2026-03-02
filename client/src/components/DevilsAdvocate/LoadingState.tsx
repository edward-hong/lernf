import React from 'react'

interface LoadingStateProps {
  message?: string
  submessage?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing...',
  submessage
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinning circles */}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600
                        rounded-full animate-spin" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200
                        border-b-purple-600 rounded-full animate-spin
                        animation-delay-150"
             style={{ animationDirection: 'reverse' }} />
      </div>

      <p className="mt-6 text-lg font-semibold text-gray-700">
        {message}
      </p>

      {submessage && (
        <p className="mt-2 text-sm text-gray-500">
          {submessage}
        </p>
      )}

      <div className="mt-4 flex gap-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-100" />
        <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce animation-delay-200" />
      </div>
    </div>
  )
}

export default LoadingState
