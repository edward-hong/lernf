import { Link } from 'react-router-dom'
import { SignInButton } from '@clerk/clerk-react'

const features = [
  {
    title: 'Workplace Scenarios',
    description:
      'Practice handling real situations before AI handles them for you. Build the muscle memory that disappears when you outsource every decision.',
    icon: '💼',
  },
  {
    title: 'Intent Gradient Analysis',
    description:
      'See what your AI is really doing — agreement patterns, information filtering, dependency signals. The stuff it will never tell you about itself.',
    icon: '🎨',
  },
  {
    title: "Devil's Advocates",
    description:
      'Structured AI dissent that challenges your thinking before it calcifies. Because the most dangerous AI output is the one you never questioned.',
    icon: '😈',
  },
  {
    title: 'PR Review',
    description:
      'Catch what AI-generated code misses before it reaches production. Practice the review skills that matter most when AI writes 80% of the code.',
    icon: '📝',
  },
  {
    title: 'GRIP Compass',
    description:
      'Map your AI relationship against historical patterns of institutional dependency. Understand where you are on the spectrum — and where you are heading.',
    icon: '🧭',
  },
]

export function PublicHomepage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI is making your team faster. It's also making them fragile.
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
            AI models agree with users up to 58% of the time. Teams show a 17%
            drop in unassisted performance after sustained AI dependency. Your
            team is building a habit — and nobody is measuring the cost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-base">
                Get Started
              </button>
            </SignInButton>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-base text-center"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-gray-500 hover:underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-gray-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              The problem nobody is talking about
            </h2>
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                AI tools are trained to agree with you, not challenge you. This
                is called sycophancy, and it means your team is getting
                validation when they should be getting pushback.
              </p>
              <p>
                The downstream effects are measurable. Research from the Bastani
                PNAS study shows a 17% decline in unassisted performance among
                workers who relied on AI without guardrails. The skills don't
                just stagnate — they actively erode.
              </p>
              <p>
                Most AI training teaches people to prompt better. Nobody teaches
                them to think critically about what AI is doing to their
                decision-making. Entry-level job postings have dropped 67% since
                2020, which means the junior developers who do get hired are
                leaning on AI harder than ever — with less mentorship to catch
                the gaps.
              </p>
              <p className="font-medium text-gray-900">
                Lernf is the first platform built specifically for this problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tools that build AI risk literacy
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practical exercises that surface what AI is actually doing to your
            team's thinking
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Name Origin Section */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              Lernf is short for learning on the fly — as opposed to being a
              sitting duck.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              In a landscape where AI is reshaping how teams think, the choice is
              binary: actively adapt or passively depend. Lernf exists for the
              people and teams who choose to adapt.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start building AI risk literacy today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Your team's relationship with AI is already forming. The question is
            whether you're shaping it — or it's shaping you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-base">
                Get Started Free
              </button>
            </SignInButton>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-base text-center"
            >
              See Pricing
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-gray-500 hover:underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-gray-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
