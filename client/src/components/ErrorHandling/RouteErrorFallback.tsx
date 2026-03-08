// ---------------------------------------------------------------------------
// Route Error Fallback — Displayed by React Router's errorElement
// ---------------------------------------------------------------------------

import { useEffect } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted'

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message || ''
    return (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module') ||
      (error.name === 'TypeError' && message.includes('dynamically imported module'))
    )
  }
  return false
}

export function RouteErrorFallback() {
  const error = useRouteError()

  useEffect(() => {
    console.error('[RouteErrorFallback]', error)

    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY)
      if (!alreadyReloaded) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return
      }
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    }
  }, [error])

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      role="alert"
    >
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload page
          </button>
          <a
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
