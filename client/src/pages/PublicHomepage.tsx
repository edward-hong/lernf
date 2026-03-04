import { SignInButton } from '@clerk/clerk-react'

const features = [
  {
    title: 'Workplace Scenarios',
    description:
      'Practice handling real situations with AI-powered NPCs. Navigate tricky conversations about AI use in your team.',
    icon: '💼',
  },
  {
    title: 'Intent Gradient Analysis',
    description:
      'See what your AI is really trying to do. Visualize hidden behavioural patterns in AI responses.',
    icon: '🎨',
  },
  {
    title: "Devil's Advocates",
    description:
      'Structured AI dissent to challenge your thinking. Get multi-perspective critique before committing to decisions.',
    icon: '😈',
  },
  {
    title: 'PR Review',
    description:
      'Identify bugs in AI-generated code. Practice the critical review skills that matter when AI writes your code.',
    icon: '📝',
  },
  {
    title: 'GRIP Compass',
    description:
      'Map your AI relationship against historical case studies. Understand power dynamics through the GRIP framework.',
    icon: '🧭',
  },
]

const steps = [
  {
    number: '1',
    title: 'Bring your own API keys',
    description:
      'Connect your existing AI provider or start with a free trial. No vendor lock-in.',
  },
  {
    number: '2',
    title: 'Practice with AI-powered scenarios',
    description:
      'Work through realistic workplace situations, code reviews, and decision-making exercises.',
  },
  {
    number: '3',
    title: 'Build critical thinking',
    description:
      'Develop the judgment and awareness needed to work effectively alongside AI tools.',
  },
]

export function PublicHomepage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            AI literacy and upskilling for development teams
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
            Your team is using AI every day — do you know what it's doing to
            their judgment?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-base">
                Get Started
              </button>
            </SignInButton>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-base"
            >
              Learn More
            </a>
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
            Tools for the AI era
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Practical exercises that build real skills — not just awareness
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

      {/* How It Works Section */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Start building AI-era skills today
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join developers who are learning to work with AI critically and
            effectively.
          </p>
          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-base">
              Get Started
            </button>
          </SignInButton>
        </div>
      </section>
    </div>
  )
}
