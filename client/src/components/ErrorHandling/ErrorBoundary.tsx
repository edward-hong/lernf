// ---------------------------------------------------------------------------
// Error Boundary — Catch React rendering errors with recovery options
// ---------------------------------------------------------------------------

import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  /** When true, renders a full-page error screen (used at the app root). */
  fullPage?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

function isChunkLoadError(error: Error): boolean {
  const message = error.message || ''
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('error loading dynamically imported module') ||
    (error.name === 'TypeError' && message.includes('dynamically imported module'))
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidMount() {
    // Successful page load — clear the reload flag so future chunk errors
    // can attempt a reload again.
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)

    if (isChunkLoadError(error)) {
      const alreadyReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY)

      if (!alreadyReloaded) {
        // First failure — set the flag and reload to fetch fresh chunks.
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
        window.location.reload()
        return
      }

      // Second failure after reload — clear the flag and let the error
      // boundary render so we don't loop forever.
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      if (this.props.fullPage) {
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
                An unexpected error occurred. You can try reloading the page or
                heading back to the home page.
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

      return (
        <div
          className="max-w-lg mx-auto my-12 p-6 bg-white border border-red-200 rounded-lg text-center"
          role="alert"
        >
          <svg
            className="w-10 h-10 text-red-400 mx-auto mb-3"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
