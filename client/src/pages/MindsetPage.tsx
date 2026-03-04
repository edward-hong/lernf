import { Link } from 'react-router-dom'

interface MindsetItem {
  title: string
  description: string
  path: string
  icon: string
}

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
    title: 'GRIP Limitations',
    description:
      'Known limits, cross-domain analysis, and future research directions for the GRIP framework',
    path: '/mindset/grip-limitations',
    icon: '🔬',
  },
  {
    title: 'Case Studies',
    description: '13 historical case studies analysed through the GRIP framework',
    path: '/mindset/case-studies',
    icon: '📚',
  },
]

export function MindsetPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About</h1>
        <p className="text-lg text-gray-600">
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
    </div>
  )
}
