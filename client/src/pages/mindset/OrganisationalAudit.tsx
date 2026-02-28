import { useState } from 'react'

interface AuditDomain {
  id: string
  domain: string
  level1: string
  level3: string
  level5: string
}

interface AuditSection {
  key: string
  title: string
  color: string
  domains: AuditDomain[]
}

const sections: AuditSection[] = [
  {
    key: 'G',
    title: 'G: Governance and guardrails',
    color: 'blue',
    domains: [
      {
        id: 'GO1',
        domain: 'AI usage policy',
        level1: 'No policy exists',
        level3: 'Written policy covers key AI use cases, reviewed annually',
        level5:
          'Living policy updated quarterly based on capability data and incident analysis',
      },
      {
        id: 'GO2',
        domain: 'Decision authority',
        level1: 'No clarity on which decisions require human judgement',
        level3:
          'High-stakes decision categories defined with mandatory human review',
        level5:
          'Decision authority matrix dynamically adjusted based on measured human capability and AI reliability',
      },
      {
        id: 'GO3',
        domain: 'Override procedures',
        level1: 'No defined override process',
        level3:
          'Documented procedures for overriding AI recommendations, with no-blame protections',
        level5:
          'Override data analysed for patterns; override rates tracked as a health metric',
      },
      {
        id: 'GO4',
        domain: 'Role clarity',
        level1: "AI's role in workflows is undefined",
        level3: 'Each team has documented human-AI role boundaries',
        level5:
          'Role boundaries reviewed quarterly; boundary drift actively monitored',
      },
      {
        id: 'GO5',
        domain: 'Accountability',
        level1: 'Unclear who is accountable for AI-assisted decisions',
        level3: 'Accountability assigned for all AI-assisted work products',
        level5:
          'Accountability framework tested via tabletop exercises; near-miss reporting active',
      },
    ],
  },
  {
    key: 'R',
    title: 'R: Resilience and readiness',
    color: 'green',
    domains: [
      {
        id: 'RO1',
        domain: 'Capability baseline',
        level1: 'No assessment of pre-AI capability levels',
        level3:
          'Annual skills assessment covers core professional competencies',
        level5:
          'Continuous capability tracking with trend analysis; atrophy alerts automated',
      },
      {
        id: 'RO2',
        domain: 'AI fire drills',
        level1: 'Never tested operations without AI',
        level3: 'Annual "AI-down" exercise of at least one business day',
        level5:
          'Quarterly unannounced capability tests with realistic scenarios; results drive training',
      },
      {
        id: 'RO3',
        domain: 'Skill maintenance',
        level1: 'No deliberate practice programme',
        level3: 'Monthly AI-free work sessions for core tasks',
        level5:
          'Individualised capability maintenance plans; practice frequency calibrated to measured atrophy rates',
      },
      {
        id: 'RO4',
        domain: 'Onboarding',
        level1: 'New employees learn AI tools without human-first foundation',
        level3:
          'Onboarding includes AI-free competency demonstration before AI tool access',
        level5:
          '"Norms before tools" programme: cultural expectations, independent capability, and critical thinking established before any AI training',
      },
      {
        id: 'RO5',
        domain: 'Succession resilience',
        level1:
          'Critical knowledge exists only in AI systems or single individuals',
        level3:
          'Knowledge documentation independent of AI platforms; cross-training covers key roles',
        level5:
          'No single point of failure — human or AI. Knowledge resilience tested via "key person unavailable" exercises',
      },
    ],
  },
  {
    key: 'I',
    title: 'I: Information integrity',
    color: 'purple',
    domains: [
      {
        id: 'IO1',
        domain: 'Source pluralism',
        level1: 'AI is the default or sole analytical input',
        level3:
          'Policy requires at least two independent sources for significant analyses',
        level5:
          'Advisory pluralism audited; teams track AI-agreement vs. independent-source-disagreement rates',
      },
      {
        id: 'IO2',
        domain: 'Verification practices',
        level1: 'AI output accepted without systematic checking',
        level3: 'Spot-checking protocol in place; errors logged and analysed',
        level5:
          'Automated verification pipelines for factual claims; human audit for reasoning and framing',
      },
      {
        id: 'IO3',
        domain: 'Vendor independence',
        level1: 'Institutional knowledge embedded in single AI platform',
        level3:
          'Documentation in platform-independent formats; data export tested annually',
        level5:
          'Multi-platform strategy; switching cost below defined threshold; annual portability drill',
      },
      {
        id: 'IO4',
        domain: 'Transparency requirements',
        level1: 'No visibility into AI reasoning or limitations',
        level3:
          'AI tools configured to surface confidence levels and limitations',
        level5:
          'Full audit trail of AI inputs, reasoning, and human modifications for all significant decisions',
      },
      {
        id: 'IO5',
        domain: 'Anchoring resistance',
        level1: 'No awareness of AI anchoring effects',
        level3:
          'Training covers anchoring bias; "think first" protocols for key decisions',
        level5:
          'Measured anchoring rates via blind comparison studies; interventions targeted at high-anchoring teams',
      },
    ],
  },
  {
    key: 'P',
    title: 'P: Productive friction',
    color: 'orange',
    domains: [
      {
        id: 'PO1',
        domain: 'Challenge culture',
        level1: 'AI output is treated as authoritative',
        level3:
          'Teams routinely question and modify AI output; rejection rates tracked',
        level5:
          '"Red team" reviews of AI-assisted work; devil\'s advocate roles assigned for major decisions',
      },
      {
        id: 'PO2',
        domain: 'Dissent protection',
        level1: 'Employees penalised for slowing down AI-assisted workflows',
        level3:
          'No-blame policy for AI output rejection; dissent from AI recommendations encouraged',
        level5:
          'Dissent metrics tracked and rewarded; employees recognised for catching AI errors',
      },
      {
        id: 'PO3',
        domain: 'Multi-agent approaches',
        level1: 'Single AI tool per workflow',
        level3:
          'Critical analyses use multiple AI models or human-AI debate protocols',
        level5:
          'Heterogeneous AI ensembles with adversarial review for high-stakes work',
      },
      {
        id: 'PO4',
        domain: 'Feedback to AI providers',
        level1: 'No feedback loop',
        level3: 'Systematic error and sycophancy reporting to AI vendors',
        level5:
          'Active participation in AI evaluation benchmarks; organisational sycophancy rates measured and reported',
      },
      {
        id: 'PO5',
        domain: 'Innovation through friction',
        level1: 'AI used to reduce effort, not improve thinking',
        level3:
          'AI configured to challenge assumptions and generate alternatives',
        level5:
          'Human-AI creative tension systematically cultivated; "productive discomfort" embedded in workflows',
      },
    ],
  },
]

const maturityLevels = [
  {
    level: 1,
    label: 'Ad hoc',
    description:
      'No formal approach. AI usage is unmanaged. Success depends on individual judgement.',
  },
  {
    level: 2,
    label: 'Aware',
    description:
      'Risks are recognised. Some informal guidelines exist. No systematic monitoring.',
  },
  {
    level: 3,
    label: 'Structured',
    description:
      'Formal policies exist. Regular assessments conducted. Roles and responsibilities defined.',
  },
  {
    level: 4,
    label: 'Measured',
    description:
      'Quantitative metrics track AI dependency and human capability. Data drives decisions. Audits are regular and evidence-based.',
  },
  {
    level: 5,
    label: 'Adaptive',
    description:
      'Continuous improvement embedded. Organisation proactively adjusts AI usage based on capability data. Innovation in human-AI collaboration is systematically pursued.',
  },
]

const scoreBands = [
  {
    min: 80,
    max: 100,
    band: 'Adaptive',
    riskLevel: 'Low',
    color: 'green',
    action: 'Maintain and innovate. Share practices with industry.',
    interpretation:
      'Your organisation has embedded continuous improvement in human-AI collaboration. You are in the leading tier — focus on innovation and knowledge-sharing with peers.',
  },
  {
    min: 60,
    max: 79,
    band: 'Structured',
    riskLevel: 'Moderate',
    color: 'blue',
    action: 'Address lowest-scoring pillar. Implement quarterly reviews.',
    interpretation:
      'Solid foundations are in place with formal policies and defined roles. Targeted work on your weakest pillar will move you to adaptive maturity.',
  },
  {
    min: 40,
    max: 59,
    band: 'Developing',
    riskLevel: 'Elevated',
    color: 'yellow',
    action:
      'Significant gaps exist. Implement the Privy Council Model within one quarter. Commission external audit.',
    interpretation:
      'Meaningful progress has been made but systemic gaps remain. Elevated risk of AI-driven capability atrophy. Structured intervention is needed within one quarter.',
  },
  {
    min: 20,
    max: 39,
    band: 'Vulnerable',
    riskLevel: 'High',
    color: 'red',
    action:
      'AI fire drill within 30 days. Capability baseline assessment. Policy development sprint.',
    interpretation:
      'Systemic AI dependency risk is present across your organisation. Immediate intervention is required. Begin with an AI fire drill and establish baseline capability data before making policy changes.',
  },
]

const sectionColorClasses = {
  blue: {
    border: 'border-blue-200',
    header: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    buttonSelected:
      'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-400',
    buttonUnselected:
      'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50',
  },
  green: {
    border: 'border-green-200',
    header: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    buttonSelected:
      'bg-green-600 border-green-600 text-white ring-2 ring-green-400',
    buttonUnselected:
      'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50',
  },
  purple: {
    border: 'border-purple-200',
    header: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    buttonSelected:
      'bg-purple-600 border-purple-600 text-white ring-2 ring-purple-400',
    buttonUnselected:
      'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50',
  },
  orange: {
    border: 'border-orange-200',
    header: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    buttonSelected:
      'bg-orange-600 border-orange-600 text-white ring-2 ring-orange-400',
    buttonUnselected:
      'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50',
  },
}

const resultColorClasses: Record<string, string> = {
  green: 'border-green-400 bg-green-50',
  blue: 'border-blue-400 bg-blue-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  red: 'border-red-400 bg-red-50',
}

const resultBadgeClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
}

const riskBadgeClasses: Record<string, string> = {
  Low: 'bg-green-100 text-green-700',
  Moderate: 'bg-blue-100 text-blue-700',
  Elevated: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
}

const barColorClasses: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
}

export function OrganisationalAudit() {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const totalDomains = sections.reduce((sum, s) => sum + s.domains.length, 0)
  const answeredDomains = Object.keys(scores).length
  const allAnswered = answeredDomains === totalDomains

  const sectionScores = sections.reduce((acc, section) => {
    acc[section.key] = section.domains.reduce(
      (sum, domain) => sum + (scores[domain.id] ?? 0),
      0
    )
    return acc
  }, {} as Record<string, number>)

  const totalScore = Object.values(sectionScores).reduce((a, b) => a + b, 0)

  const currentBand =
    scoreBands.find((b) => totalScore >= b.min && totalScore <= b.max) ??
    scoreBands[scoreBands.length - 1]

  const criticalPillars = submitted
    ? sections.filter((s) => sectionScores[s.key] < 10)
    : []

  function handleScore(domainId: string, value: number) {
    setScores((prev) => ({ ...prev, [domainId]: value }))
    setSubmitted(false)
  }

  function handleSubmit() {
    if (allAnswered) setSubmitted(true)
  }

  function handleReset() {
    setScores({})
    setSubmitted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          GRIP Organisational Audit
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          This audit is designed for teams and organisations. It should be
          completed by a cross-functional group including leadership,
          operational staff, and IT — not by a single person.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Instructions:</strong> Use evidence where possible (documented
          policies, test results, actual incident data) rather than aspirational
          self-assessment. Each domain uses a{' '}
          <strong>5-level maturity scale</strong> from Ad hoc (1) to Adaptive
          (5).
        </div>
      </div>

      {/* Maturity scale reference */}
      <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Maturity scale reference
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {maturityLevels.map((level) => (
            <div
              key={level.level}
              className="px-5 py-3 flex gap-4 items-start text-sm"
            >
              <span className="font-bold text-gray-900 w-4 flex-shrink-0">
                {level.level}
              </span>
              <span className="font-semibold text-gray-700 w-24 flex-shrink-0">
                {level.label}
              </span>
              <span className="text-gray-600">{level.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>
            {answeredDomains} of {totalDomains} domains scored
          </span>
          <span>{Math.round((answeredDomains / totalDomains) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredDomains / totalDomains) * 100}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const colors =
          sectionColorClasses[section.color as keyof typeof sectionColorClasses]
        const sectionScore = sectionScores[section.key]
        const sectionAnswered = section.domains.filter(
          (d) => scores[d.id] !== undefined
        ).length

        return (
          <div
            key={section.key}
            className={`mb-8 border rounded-xl overflow-hidden ${colors.border}`}
          >
            <div
              className={`px-6 py-4 border-b ${colors.header} flex items-center justify-between`}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sectionAnswered} of {section.domains.length} domains scored
                  {submitted && (
                    <span
                      className={`ml-3 px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}
                    >
                      Score: {sectionScore} / 25
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {section.domains.map((domain) => (
                <div key={domain.id} className="px-6 py-5">
                  <div className="mb-3">
                    <span className="text-xs font-mono text-gray-400 mr-2">
                      {domain.id}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {domain.domain}
                    </span>
                  </div>

                  {/* Level anchors */}
                  <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
                      <div className="font-semibold text-red-700 mb-1">
                        Level 1 — Ad hoc
                      </div>
                      <p className="text-red-600 leading-relaxed">
                        {domain.level1}
                      </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2.5">
                      <div className="font-semibold text-yellow-700 mb-1">
                        Level 3 — Structured
                      </div>
                      <p className="text-yellow-700 leading-relaxed">
                        {domain.level3}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-2.5">
                      <div className="font-semibold text-green-700 mb-1">
                        Level 5 — Adaptive
                      </div>
                      <p className="text-green-600 leading-relaxed">
                        {domain.level5}
                      </p>
                    </div>
                  </div>

                  {/* Score buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 mr-1">Score:</span>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => handleScore(domain.id, val)}
                        className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                          scores[domain.id] === val
                            ? colors.buttonSelected
                            : colors.buttonUnselected
                        }`}
                        aria-label={`Score ${val} for ${domain.domain}`}
                      >
                        {val}
                      </button>
                    ))}
                    <span className="text-xs text-gray-400 ml-2">
                      {scores[domain.id]
                        ? maturityLevels[scores[domain.id] - 1].label
                        : 'Not scored'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Submit */}
      <div className="flex flex-col items-center gap-4 my-8">
        {!allAnswered && (
          <p className="text-sm text-gray-500">
            Please score all {totalDomains} domains before submitting.
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
            allAnswered
              ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Generate Audit Report
        </button>
      </div>

      {/* Results */}
      {submitted && (
        <div className="mt-8 space-y-6">
          <hr className="border-gray-200" />
          <h2 className="text-2xl font-bold text-gray-900">Audit Report</h2>

          {/* Total score card */}
          <div
            className={`border-2 rounded-xl p-6 ${
              resultColorClasses[currentBand.color]
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-5xl font-bold text-gray-900 mb-1">
                  {totalScore}
                </div>
                <div className="text-sm text-gray-500">out of 100</div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    resultBadgeClasses[currentBand.color]
                  }`}
                >
                  {currentBand.band}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    riskBadgeClasses[currentBand.riskLevel]
                  }`}
                >
                  Risk: {currentBand.riskLevel}
                </span>
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-4">
              <div className="w-full bg-white rounded-full h-3 border border-gray-200">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    barColorClasses[currentBand.color]
                  }`}
                  style={{ width: `${totalScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{currentBand.interpretation}</p>
            <div className="bg-white/60 rounded-lg px-4 py-3 text-sm text-gray-700">
              <strong>Priority action:</strong> {currentBand.action}
            </div>
          </div>

          {/* Pillar breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pillar breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map((section) => {
                const score = sectionScores[section.key]
                const isCritical = score < 10
                const colors =
                  sectionColorClasses[
                    section.color as keyof typeof sectionColorClasses
                  ]
                const pct = ((score - 5) / 20) * 100

                return (
                  <div
                    key={section.key}
                    className={`border rounded-xl p-4 ${
                      isCritical
                        ? 'border-red-300 bg-red-50'
                        : `${colors.border} bg-white`
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        Pillar {section.key}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isCritical ? 'text-red-600' : 'text-gray-700'
                        }`}
                      >
                        {score}/25
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {section.title}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          isCritical
                            ? 'bg-red-500'
                            : barColorClasses[section.color]
                        }`}
                        style={{ width: `${Math.max(0, pct)}%` }}
                      />
                    </div>
                    {isCritical && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Critical vulnerability — pillar below 10
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Critical vulnerability alert */}
          {criticalPillars.length > 0 && (
            <div className="border-2 border-red-400 bg-red-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Critical vulnerability detected
              </h3>
              <p className="text-red-700 text-sm mb-3">
                Any single pillar scoring below 10 represents a systemic risk
                regardless of your total score. The following pillars require
                immediate attention:
              </p>
              <ul className="space-y-2">
                {criticalPillars.map((s) => (
                  <li
                    key={s.key}
                    className="flex items-start gap-2 text-sm text-red-700"
                  >
                    <span className="font-bold mt-0.5">Pillar {s.key}:</span>
                    <span>
                      {s.title} — scored {sectionScores[s.key]}/25.
                      {s.key === 'R' &&
                        ' This is the al-Mansur pattern — everything looks excellent until AI fails or the vendor relationship changes.'}
                      {s.key === 'G' &&
                        ' Without governance guardrails, AI usage is effectively unmanaged at the organisational level.'}
                      {s.key === 'I' &&
                        " A critical information integrity gap means AI may be constructing your organisation's reality without verification."}
                      {s.key === 'P' &&
                        ' Without productive friction, AI output is being treated as authoritative across the organisation.'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Domain scores detail */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Domain scores
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">ID</div>
                <div className="col-span-7">Domain</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-right">Level</div>
              </div>
              {sections.map((section) =>
                section.domains.map((domain, idx) => {
                  const score = scores[domain.id] ?? 0
                  const maturity = maturityLevels[score - 1]
                  const isLast = idx === section.domains.length - 1
                  return (
                    <div
                      key={domain.id}
                      className={`grid grid-cols-12 px-4 py-3 text-sm items-center ${
                        isLast
                          ? 'border-b-2 border-gray-300'
                          : 'border-b border-gray-100'
                      }`}
                    >
                      <div className="col-span-1 font-mono text-xs text-gray-400">
                        {domain.id}
                      </div>
                      <div className="col-span-7 text-gray-700">
                        {domain.domain}
                      </div>
                      <div className="col-span-2 text-center font-bold text-gray-900">
                        {score}
                      </div>
                      <div className="col-span-2 text-right text-xs text-gray-500">
                        {maturity?.label ?? '—'}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Next steps */}
          <div className="border border-gray-200 bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recommended next steps
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-gray-800 mb-1">
                  Weeks 1–2
                </div>
                <p>
                  Leadership reviews this audit report. Identify the
                  lowest-scoring pillar and the three most critical domain gaps.
                  Commission an external assessment if internal scoring seems
                  optimistic.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">
                  Weeks 3–4
                </div>
                <p>
                  Establish foundational policies — AI usage policy, decision
                  authority matrix, and override procedures. Share research data
                  (17% performance drops, 58% sycophancy rates, 20% accuracy
                  declines) to build urgency.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">
                  Months 2–3
                </div>
                <p>
                  Conduct the first AI fire drill. Establish capability
                  baseline. Begin the knowledge resilience documentation
                  programme. Implement quarterly GRIP tracking at both
                  individual and organisational levels.
                </p>
              </div>
            </div>
          </div>

          {/* Retake button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Reset audit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
