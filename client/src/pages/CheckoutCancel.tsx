import { Link } from 'react-router-dom'

export function CheckoutCancel() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-10">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment cancelled
        </h1>
        <p className="text-gray-600 mb-8">
          No charges were made. You can try again whenever you're ready.
        </p>
        <Link
          to="/pricing"
          className="inline-block px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}

export default CheckoutCancel
