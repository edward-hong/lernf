import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, SignInButton } from '@clerk/clerk-react'
import { useAuthFetch } from '../hooks/useAuthFetch'

export function PricingPage() {
  const { isSignedIn } = useAuth()
  const { authFetch } = useAuthFetch()
  const [seats, setSeats] = useState(5)
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = useCallback(
    async (plan: 'individual' | 'team') => {
      setLoading(plan)
      try {
        const url =
          plan === 'individual'
            ? '/stripe/checkout/individual'
            : '/stripe/checkout/team'
        const body = plan === 'team' ? JSON.stringify({ seats }) : undefined
        const response = await authFetch(url, {
          method: 'POST',
          body,
        })
        if (!response.ok) {
          throw new Error('Failed to create checkout session')
        }
        const data = await response.json()
        window.location.href = data.url
      } catch (err) {
        console.error('Checkout error:', err)
        setLoading(null)
      }
    },
    [authFetch, seats]
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Build AI literacy at your own pace. Start free, upgrade when you're
          ready.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Free Tier */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Free</h2>
            <p className="text-sm text-gray-500 mb-4">
              Bring your own API keys
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <Feature>Access to all tools</Feature>
            <Feature>Use your own AI provider keys</Feature>
            <Feature>Community scenarios</Feature>
          </ul>

          {isSignedIn ? (
            <Link
              to="/"
              className="block w-full text-center px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Get Started
              </button>
            </SignInButton>
          )}
        </div>

        {/* Individual Plan — Highlighted */}
        <div className="bg-white border-2 border-blue-600 rounded-xl p-6 lg:p-8 flex flex-col relative shadow-lg">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Recommended
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Individual
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Everything you need for AI literacy
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">$20</span>
              <span className="text-gray-500">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            <Feature>All free features</Feature>
            <Feature>Included API credits</Feature>
            <Feature>14-day free trial</Feature>
            <Feature>Priority support</Feature>
          </ul>

          {isSignedIn ? (
            <button
              onClick={() => handleCheckout('individual')}
              disabled={loading === 'individual'}
              className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading === 'individual' ? 'Redirecting...' : 'Start Free Trial'}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
            </SignInButton>
          )}
        </div>

        {/* Team Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Team</h2>
            <p className="text-sm text-gray-500 mb-4">
              Build AI literacy across your team
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900">$15</span>
              <span className="text-gray-500">/seat/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            <Feature>All individual features</Feature>
            <Feature>Team dashboard</Feature>
            <Feature>Shared scenario library</Feature>
            <Feature>GRIP assessments for teams</Feature>
          </ul>

          {/* Seat selector */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <label
              htmlFor="seats"
              className="block text-xs font-medium text-gray-600 mb-2"
            >
              Team size
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSeats((s) => Math.max(5, s - 1))}
                disabled={seats <= 5}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm"
                aria-label="Decrease seats"
              >
                -
              </button>
              <input
                id="seats"
                type="number"
                min={5}
                value={seats}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  if (!isNaN(v) && v >= 5) setSeats(v)
                }}
                className="w-14 text-center text-sm font-medium border border-gray-300 rounded-md py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => setSeats((s) => s + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors text-sm"
                aria-label="Increase seats"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {seats} seats &times; $15 ={' '}
              <span className="font-semibold text-gray-900">
                ${seats * 15}/month
              </span>
            </p>
          </div>

          {isSignedIn ? (
            <button
              onClick={() => handleCheckout('team')}
              disabled={loading === 'team'}
              className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {loading === 'team' ? 'Redirecting...' : 'Subscribe'}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Subscribe
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      {/* Legal disclaimer */}
      <p className="text-center text-xs text-gray-500 mt-8">
        By subscribing, you agree to our{' '}
        <Link to="/terms" className="text-blue-600 hover:underline">
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <svg
        className="w-4 h-4 text-blue-600 mt-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      {children}
    </li>
  )
}

export default PricingPage
