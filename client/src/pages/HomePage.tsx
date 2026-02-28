// src/pages/HomePage.tsx
import { Link } from 'react-router-dom'

interface MindsetItem {
  title: string
  description: string
  path: string
  icon: string
}

interface Tool {
  title: string
  description: string
  path: string
  status: 'ready' | 'coming-soon'
  icon: string
}

export function HomePage() {
  const mindsetItems: MindsetItem[] = [
    {
      title: 'Historical Context',
      description: 'Twelve historical cases of power asymmetry — generative or parasitic',
      path: '/mindset/historical-mapping',
      icon: '🏛️',
    },
    {
      title: 'AI Mapping',
      description: 'Historical patterns mapped onto modern AI collaboration risks',
      path: '/mindset/ai-mapping',
      icon: '🗺️',
    },
    {
      title: 'GRIP Framework',
      description: 'Governance, Resilience, Information integrity, Productive friction',
      path: '/mindset/grip-framework',
      icon: '🧩',
    },
    {
      title: 'Individual Audit',
      description: 'Personal assessment tool for your AI collaboration habits',
      path: '/mindset/individual-audit',
      icon: '👤',
    },
    {
      title: 'Organisational Audit',
      description: 'Team and organisational assessment for AI integration',
      path: '/mindset/organisational-audit',
      icon: '🏢',
    },
    {
      title: 'AI Misconceptions',
      description: 'Common misconceptions about AI in the modern workplace',
      path: '/mindset/ai-misconceptions',
      icon: '💡',
    },
    {
      title: 'Case Studies',
      description: '13 historical case studies analysed through the GRIP framework',
      path: '/mindset/case-studies',
      icon: '📚',
    },
  ]

  const tools: Tool[] = [
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

      {/* Mindset Section */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mindset</h2>
          <p className="text-gray-600 mt-1">
            Frameworks and historical context for working effectively with AI
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindsetItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="p-6 bg-white border-2 border-gray-200 rounded-lg transition-all hover:border-purple-500 hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tools</h2>
          <p className="text-gray-600 mt-1">
            Hands-on practice exercises for AI-era development
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className={`
                p-6 bg-white border-2 rounded-lg transition-all
                ${
                  tool.status === 'ready'
                    ? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                    : 'border-gray-100 opacity-60 cursor-not-allowed'
                }
              `}
              onClick={(e) => tool.status !== 'ready' && e.preventDefault()}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{tool.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {tool.title}
                    </h3>
                    {tool.status === 'coming-soon' && (
                      <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{tool.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
