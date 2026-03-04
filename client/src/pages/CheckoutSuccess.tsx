import { Link } from 'react-router-dom'

export function CheckoutSuccess() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're all set!
        </h1>
        <p className="text-gray-600 mb-8">
          Your subscription is active. Welcome to Lernf!
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default CheckoutSuccess
