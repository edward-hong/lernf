// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'

interface Feature {
  title: string
  description: string
  path: string
  status: 'ready' | 'coming-soon'
  icon: string
}

export function HomePage() {
  const features: Feature[] = [
    {
      title: 'Code Comparison',
      description: 'Practice identifying better code patterns',
      path: '/practice/code-comparison',
      status: 'ready',
      icon: '🔍',
    },
    {
      title: 'PR Review',
      description: 'Practice reviewing pull requests with AI',
      path: '/practice/pr-review',
      status: 'ready',
      icon: '📝',
    },
    {
      title: 'AI-Assisted Coding',
      description: 'Practice agentic coding workflows',
      path: '/practice/ai-coding',
      status: 'coming-soon',
      icon: '🤖',
    },
    {
      title: 'Workplace Scenarios',
      description: 'Practice real-world AI situations',
      path: '/practice/workplace-scenarios',
      status: 'coming-soon',
      icon: '💼',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Practice AI-Era Development Skills
        </h1>
        <p className="text-xl text-gray-600">
          Systematic practice for working with AI as your coding partner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className={`
              p-6 bg-white border-2 rounded-lg transition-all
              ${
                feature.status === 'ready'
                  ? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
              }
            `}
            onClick={(e) => feature.status !== 'ready' && e.preventDefault()}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{feature.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  {feature.status === 'coming-soon' && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
