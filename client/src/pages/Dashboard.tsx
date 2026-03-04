import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthFetch } from '../hooks/useAuthFetch'

interface Tool {
  title: string
  description: string
  path: string
  status: 'ready' | 'coming-soon'
  icon: string
}

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
    title: 'AI Intent Analysis',
    description: 'Visualize hidden behavioural patterns in AI responses',
    path: '/practice/ai-intent',
    status: 'ready',
    icon: '🎨',
  },
  {
    title: 'Live Intent Chat',
    description: 'Chat with AI and watch intent patterns emerge in real-time',
    path: '/practice/intent-chat',
    status: 'ready',
    icon: '💬',
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
    status: 'ready',
    icon: '💼',
  },
  {
    title: "Devil's Advocate",
    description: 'Challenge your ideas with multi-AI critique and intent analysis',
    path: '/tools/devils-advocate',
    status: 'ready',
    icon: '😈',
  },
  {
    title: 'GRIP Compass',
    description: 'Map your AI relationship against historical case studies using the GRIP framework',
    path: '/tools/grip-compass',
    status: 'ready',
    icon: '🧭',
  },
]

export function Dashboard() {
  const { authFetch } = useAuthFetch()
  const [portalLoading, setPortalLoading] = useState(false)

  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true)
    try {
      const response = await authFetch('/stripe/portal', { method: 'POST' })
      if (!response.ok) throw new Error('Failed to create portal session')
      const data = await response.json()
      window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
      setPortalLoading(false)
    }
  }, [authFetch])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Hands-on practice exercises for AI-era development
          </p>
        </div>
        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          className="self-start px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          {portalLoading ? 'Loading...' : 'Manage Subscription'}
        </button>
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
    </div>
  )
}
