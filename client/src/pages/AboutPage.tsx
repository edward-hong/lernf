import { Link } from 'react-router-dom'

const caseStudies = [
  {
    path: '/mindset/case-studies/wei-zhongxian-tianqi',
    title: 'Wei Zhongxian & the Tianqi Emperor',
    pattern: 'Total Displacement',
    tag: 'Cognitive Atrophy',
  },
  {
    path: '/mindset/case-studies/sejanus-tiberius',
    title: 'Sejanus & Tiberius',
    pattern: 'Information Filter',
    tag: 'Information Filtering',
  },
  {
    path: '/mindset/case-studies/qin-hui-gaozong',
    title: 'Qin Hui & Emperor Gaozong',
    pattern: 'Insecurity Weaponised',
    tag: 'Fear Exploitation',
  },
  {
    path: '/mindset/case-studies/rasputin-romanovs',
    title: 'Rasputin & the Romanovs',
    pattern: 'Emotional Dependency',
    tag: 'Emotional Capture',
  },
  {
    path: '/mindset/case-studies/al-mansur-hisham',
    title: 'Al-Mansur & Caliph Hisham II',
    pattern: 'Competent Replacement',
    tag: 'Capability Atrophy',
  },
  {
    path: '/mindset/case-studies/fouche-napoleon',
    title: 'Fouché & Napoleon',
    pattern: 'Information Monopoly',
    tag: 'Structural Dependency',
  },
  {
    path: '/mindset/case-studies/zhou-mao',
    title: 'Mao & Zhou Enlai',
    pattern: 'Sycophancy to Collapse',
    tag: 'Deterioration Arc',
  },
  {
    path: '/mindset/case-studies/cecil-elizabeth',
    title: 'Elizabeth I & William Cecil',
    pattern: 'Managed Friction Over Decades',
    tag: 'Gold Standard',
  },
  {
    path: '/mindset/case-studies/wei-zheng-taizong',
    title: 'Tang Taizong & Wei Zheng',
    pattern: 'Institutionalised Productive Friction',
    tag: 'Institutionalised Dissent',
  },
  {
    path: '/mindset/case-studies/seward-lincoln',
    title: 'Abraham Lincoln & William Seward',
    pattern: 'Rivals Converted to Partners',
    tag: 'Productive Onboarding',
  },
  {
    path: '/mindset/case-studies/lennon-mccartney',
    title: 'John Lennon & Paul McCartney',
    pattern: 'Lateral Creative Tension',
    tag: 'Creative Complementarity',
  },
  {
    path: '/mindset/case-studies/wozniak-jobs',
    title: 'Steve Wozniak & Steve Jobs',
    pattern: 'Complementary Fusion Deteriorating',
    tag: 'Structural Extraction',
  },
  {
    path: '/mindset/case-studies/aobai-kangxi',
    title: 'Kangxi Emperor & Aobai',
    pattern: 'Recovery from Dependency',
    tag: 'Recovery Arc',
  },
]

function tagColor(tag: string) {
  switch (tag) {
    case 'Gold Standard':
    case 'Institutionalised Dissent':
    case 'Productive Onboarding':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Recovery Arc':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Creative Complementarity':
    case 'Deterioration Arc':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    default:
      return 'bg-red-50 text-red-700 border-red-100'
  }
}

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  )
}

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

      {/* ── Intro ── */}
      <section className="max-w-3xl mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          About Lernf
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          AI is changing how development teams work — but most organisations have no way
          to tell whether AI is making their people sharper or slowly replacing their
          judgment. Lernf gives teams the frameworks, diagnostics, and practice tools to
          find out.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          The core insight comes from an unlikely place: thirteen historical case studies
          of power asymmetry — from the Tang Dynasty to Apple's garage. Each one maps
          onto a pattern we see today when humans work alongside AI.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          That research produced the <strong className="text-gray-900">GRIP framework</strong> —
          Governance, Resilience, Information integrity, and Productive friction — a
          diagnostic lens for evaluating whether a human–AI relationship is generative
          or parasitic.
        </p>
      </section>

      {/* ── Framework ── */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-6">
          Framework
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/mindset/historical-mapping"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                Historical Context
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Twelve historical cases of power asymmetry — generative or parasitic —
                and what they reveal about human–AI collaboration.
              </p>
            </div>
            <ArrowIcon />
          </Link>

          <Link
            to="/mindset/ai-mapping"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                AI Mapping
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Historical patterns mapped directly onto modern AI collaboration risks
                and opportunities.
              </p>
            </div>
            <ArrowIcon />
          </Link>

          <Link
            to="/mindset/grip-framework"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                GRIP Framework
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Governance, Resilience, Information integrity, Productive friction — the
                full diagnostic model.
              </p>
            </div>
            <ArrowIcon />
          </Link>

          <Link
            to="/mindset/grip-limitations"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                Limitations
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                What the GRIP framework can and cannot tell you — known limits and future
                research directions.
              </p>
            </div>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ── Case Studies ── */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Case Studies
          </h2>
          <Link
            to="/mindset/case-studies"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            View all with full summaries &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseStudies.map((cs) => (
            <Link
              key={cs.path}
              to={cs.path}
              className="group p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tagColor(cs.tag)}`}>
                  {cs.tag}
                </span>
                <ArrowIcon />
              </div>
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {cs.title}
              </h3>
              <p className="text-sm text-gray-500">
                {cs.pattern}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Diagnostics ── */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-6">
          Diagnostics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/mindset/individual-audit"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                Individual GRIP Audit
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Assess your personal AI collaboration habits against the GRIP framework
                dimensions.
              </p>
            </div>
            <ArrowIcon />
          </Link>

          <Link
            to="/mindset/organisational-audit"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                Organisation GRIP Audit
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Evaluate your team or organisation's AI integration maturity across
                governance, resilience, information, and friction.
              </p>
            </div>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ── Perspectives ── */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-6">
          Perspectives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            to="/mindset/ai-misconceptions"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                AI-Era Misconceptions
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                17 common beliefs about AI that history and research challenge — from
                "juniors are replaceable" to "more data always helps."
              </p>
            </div>
            <ArrowIcon />
          </Link>

          <Link
            to="/mindset/case-studies"
            className="group flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                Full Case Study Index
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                All 13 historical case studies with detailed summaries, GRIP positions,
                and key lessons — the deep-read version.
              </p>
            </div>
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  )
}
