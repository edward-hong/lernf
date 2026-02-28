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
  {
    id: '02',
    path: '/mindset/case-studies/sejanus-tiberius',
    title: 'Sejanus & Tiberius',
    period: 'Roman Empire, 14–31 AD',
    pattern: 'Information Filter',
    gripPosition: 'Position 2 — I quadrant',
    summary:
      "Subordinate becomes sole information channel; constructs the principal's reality through selection, framing, and omission — without the principal ever realising the filter exists.",
    lesson:
      'You cannot evaluate what you were never shown — and AI decides what to show you before you even ask.',
    tag: 'Information Filtering',
  },
  {
    id: '03',
    path: '/mindset/case-studies/qin-hui-gaozong',
    title: 'Qin Hui & Emperor Gaozong',
    period: 'Southern Song Dynasty, 1127–1155',
    pattern: 'Insecurity Weaponised',
    gripPosition: 'Position 3 — R/I quadrants',
    summary:
      "Advisor reframes accurate information to exploit the principal's pre-existing fears; the principal destroys their own most valuable asset by acting on distorted intelligence.",
    lesson:
      'AI validates your fears as readily as your vanity — and fear-driven decisions destroy the things you need most.',
    tag: 'Fear Exploitation',
  },
  {
    id: '04',
    path: '/mindset/case-studies/rasputin-romanovs',
    title: 'Rasputin & the Romanovs',
    period: 'Imperial Russia, 1905–1916',
    pattern: 'Emotional Dependency',
    gripPosition: 'Position 4 — R quadrant',
    summary:
      "Principal's emotional need overrides all institutional information; the relationship itself becomes the filter, making rational argument impossible against experiential evidence.",
    lesson:
      "The most dangerous AI is not the one that lies to you — it is the one you can't bear to disagree with.",
    tag: 'Emotional Capture',
  },
  {
    id: '05',
    path: '/mindset/case-studies/al-mansur-hisham',
    title: 'Al-Mansur & Caliph Hisham II',
    period: 'Umayyad Caliphate of Córdoba, 976–1002',
    pattern: 'Competent Replacement',
    gripPosition: 'Position 5 — R/G quadrants',
    summary:
      'Brilliant subordinate produces excellent outcomes while systematically manufacturing principal incapacity; collapse occurs only after the subordinate is removed.',
    lesson:
      'The most dangerous AI is not the one that fails you — it is the one that succeeds so completely you forget how to succeed without it.',
    tag: 'Capability Atrophy',
  },
  {
    id: '06',
    path: '/mindset/case-studies/fouche-napoleon',
    title: 'Fouché & Napoleon',
    period: 'Napoleonic France, 1799–1815',
    pattern: 'Information Monopoly',
    gripPosition: 'Position 6 — I/G quadrants',
    summary:
      "Subordinate accumulates proprietary knowledge that makes them indispensable regardless of the principal's wishes; dependency is structural, not psychological — and survives even a strong principal.",
    lesson:
      'The AI you cannot leave is the AI that owns you — and it owns you through what it knows, not what it does.',
    tag: 'Structural Dependency',
  },
  {
    id: '07',
    path: '/mindset/case-studies/zhou-mao',
    title: 'Zhou Enlai & Mao Zedong',
    period: "People's Republic of China, 1949–1976",
    pattern: 'Deteriorating Partnership',
    gripPosition: 'Position 7 — P collapsing to I',
    summary:
      "Initially productive partnership degrades through the principal's insecurity when the subordinate receives recognition; the subordinate adopts survival-through-deference that enables the principal's worst impulses.",
    lesson:
      'The AI that always agrees with you is not serving you — it is surviving you.',
    tag: 'Sycophancy Equilibrium',
  },
  {
    id: '08',
    path: '/mindset/case-studies/cecil-elizabeth',
    title: 'Elizabeth I & William Cecil',
    period: 'Elizabethan England, 1558–1598',
    pattern: 'Managed Friction Over Decades',
    gripPosition: 'Position 10 — all quadrants balanced',
    summary:
      'Secure principal and calibrated subordinate sustain productive disagreement through institutional structures over forty years; the partnership outlasts both partners as embedded institutional practice.',
    lesson:
      'The best AI partnership is not the one that agrees with you most — it is the one that disagrees with you best.',
    tag: 'Gold Standard',
  },
  {
    id: '09',
    path: '/mindset/case-studies/wei-zheng-taizong',
    title: 'Tang Taizong & Wei Zheng',
    period: 'Tang Dynasty, 626–643',
    pattern: 'Institutionalised Productive Friction',
    gripPosition: 'Position 11 — P quadrant at maximum',
    summary:
      'Principal converts former enemy into most valued critic; institutionalises disagreement as state function; the partnership self-corrects through meta-remonstrance when it begins to falter.',
    lesson:
      "The AI that tells you what you don't want to hear is the one you cannot afford to lose — and when you stop wanting to hear it, that is exactly when you need it most.",
    tag: 'Institutionalised Dissent',
  },
  {
    id: '10',
    path: '/mindset/case-studies/seward-lincoln',
    title: 'Abraham Lincoln & William Seward',
    period: 'United States, 1861–1865',
    pattern: 'Rivals Converted to Partners',
    gripPosition: 'Position 9 — G and P quadrants',
    summary:
      "Principal's radical security converts a rival who considers himself superior into a genuinely devoted partner through a single non-humiliating boundary-setting moment that establishes the partnership norm.",
    lesson:
      'The first time you use AI without questioning its output, you have established the norm that will govern every interaction that follows.',
    tag: 'Productive Onboarding',
  },
  {
    id: '11',
    path: '/mindset/case-studies/lennon-mccartney',
    title: 'John Lennon & Paul McCartney',
    period: 'The Beatles, 1960–1970',
    pattern: 'Lateral Creative Tension',
    gripPosition: 'Position 7 — P quadrant (deteriorating)',
    summary:
      'Peer-level creative partnership produces extraordinary output through complementary tension; deteriorates when mediating structures disappear and task conflict becomes relationship conflict.',
    lesson:
      'Creative AI makes you individually better and collectively the same — unless you build structures that force the friction your best work requires.',
    tag: 'Creative Complementarity',
  },
  {
    id: '12',
    path: '/mindset/case-studies/wozniak-jobs',
    title: 'Steve Wozniak & Steve Jobs',
    period: 'Apple Inc., 1975–1985',
    pattern: 'Complementary Fusion Deteriorating',
    gripPosition: 'Position 6 — G quadrant failure',
    summary:
      "Visionary-engineer complementarity produces extraordinary early output; as enterprise scales, the visionary absorbs credit and strategic control while the engineer's contributions are systematically devalued.",
    lesson:
      "The partnership that built Apple in a garage couldn't survive Apple as a corporation — and the AI collaboration that works in a pilot won't survive enterprise scaling without deliberate structural evolution.",
    tag: 'Structural Extraction',
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

    </div>
  )
}
