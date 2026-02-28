import { Link } from 'react-router-dom'

const caseStudies = [
  {
    id: '01',
    path: '/mindset/case-studies/wei-zhongxian-tianqi',
    title: 'Wei Zhongxian & the Tianqi Emperor',
    period: 'Ming Dynasty, 1620–1627',
    pattern: 'Total Displacement',
    gripPosition: 'Position 1 — innermost ring',
    summary:
      'The most severe parasitic pattern: a principal disengages entirely while a subordinate fills the vacuum, monopolising information and eliminating institutional checks.',
    lesson:
      'The most dangerous AI is not the one that manipulates you — it is the one that works so well you stop thinking.',
    tag: 'Cognitive Atrophy',
  },
]

export function CaseStudiesIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Case Studies</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Historical analyses that map documented power-displacement patterns to
          modern AI collaboration risks. Each case is positioned on the GRIP
          framework to illustrate where healthy human–AI boundaries break down.
        </p>
      </div>

      <div className="space-y-6">
        {caseStudies.map((cs) => (
          <Link
            key={cs.id}
            to={cs.path}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-gray-400">
                    Case {cs.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">
                    {cs.tag}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                  {cs.title}
                </h2>

                <p className="text-sm text-gray-500 mb-3">
                  {cs.period} &middot; {cs.pattern} &middot; {cs.gripPosition}
                </p>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {cs.summary}
                </p>

                <blockquote className="border-l-4 border-gray-200 pl-4 text-sm italic text-gray-500">
                  "{cs.lesson}"
                </blockquote>
              </div>

              <svg
                className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-400 text-center">
        More case studies coming soon
      </p>
    </div>
  )
}
