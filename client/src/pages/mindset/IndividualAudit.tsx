import { useState } from 'react'

interface AuditItem {
  id: string
  text: string
}

interface Section {
  key: string
  title: string
  color: string
  items: AuditItem[]
}

const sections: Section[] = [
  {
    key: 'G',
    title: 'Section G: Governance and guardrails',
    color: 'blue',
    items: [
      { id: 'G1', text: 'I have clear personal rules about which tasks I delegate to AI and which I always do myself.' },
      { id: 'G2', text: 'For high-stakes work (client deliverables, major decisions, published content), I always apply human review beyond my initial AI-assisted draft.' },
      { id: 'G3', text: 'I can articulate specifically what the AI contributes to my work versus what I contribute — and these roles have not shifted significantly in the past six months.' },
      { id: 'G4', text: 'I have a defined process for when to override or reject AI output, and I use it regularly (at least weekly).' },
      { id: 'G5', text: 'I maintain documentation of my reasoning and decisions independent of AI-generated records.' },
      { id: 'G6', text: 'I could explain my work process and key decisions to a colleague without referencing AI output.' },
      { id: 'G7', text: 'I have reviewed and updated my personal AI usage rules within the past three months.' },
      { id: 'G8', text: 'When I delegate a task to AI, I specify the approach and evaluate the output against my own criteria — rather than accepting the first response.' },
    ],
  },
  {
    key: 'R',
    title: 'Section R: Resilience and readiness',
    color: 'green',
    items: [
      { id: 'R1', text: 'I could complete my core job tasks to an acceptable standard if AI were unavailable for one full week.' },
      { id: 'R2', text: 'I regularly (at least monthly) complete significant work tasks entirely without AI assistance, by deliberate choice.' },
      { id: 'R3', text: 'My domain knowledge and core professional skills are as strong as or stronger than they were before I started using AI.' },
      { id: 'R4', text: 'I feel energised, not threatened, when I encounter something AI does better than I expected.' },
      { id: 'R5', text: 'I do not feel anxiety or distress when AI tools are temporarily unavailable.' },
      { id: 'R6', text: 'I actively practise skills (writing, analysis, calculation, research) that AI could handle for me.' },
      { id: 'R7', text: 'I can identify three professional skills that have improved specifically because of how I use AI (not despite AI).' },
      { id: 'R8', text: 'I seek challenging tasks that stretch my own capabilities, not just tasks where AI can help me produce more output.' },
    ],
  },
  {
    key: 'I',
    title: 'Section I: Information integrity',
    color: 'purple',
    items: [
      { id: 'I1', text: 'For any important decision or analysis, I consult at least two sources independent of AI before finalising.' },
      { id: 'I2', text: 'I regularly check AI-generated claims against primary sources, and have caught errors in the past month.' },
      { id: 'I3', text: 'I form my own preliminary view on a question before consulting AI, rather than asking AI first.' },
      { id: 'I4', text: 'I can identify at least one instance in the past month where I rejected an AI recommendation after checking.' },
      { id: 'I5', text: 'I am aware of specific limitations and biases in the AI tools I use and can name them.' },
      { id: 'I6', text: 'I notice when AI output seems to confirm what I wanted to hear, and I treat such confirmation with extra scepticism.' },
      { id: 'I7', text: 'My vocabulary, writing style, and analytical approaches have not narrowed since I began using AI regularly.' },
      { id: 'I8', text: 'I actively seek out perspectives and information that AI might not surface — including dissenting views, minority positions, and uncomfortable data.' },
    ],
  },
  {
    key: 'P',
    title: 'Section P: Productive friction',
    color: 'orange',
    items: [
      { id: 'P1', text: 'I regularly prompt AI to argue against my position or identify weaknesses in my reasoning.' },
      { id: 'P2', text: 'When AI agrees with me, I feel mildly suspicious rather than validated.' },
      { id: 'P3', text: 'I modify, substantially edit, or reject AI output more often than I accept it as-is.' },
      { id: 'P4', text: "I have structured my AI interactions to challenge my thinking rather than confirm it (e.g., using devil's advocate prompts, requesting counterarguments)." },
      { id: 'P5', text: "I value AI output more when it surprises me or tells me something I didn't want to hear." },
      { id: 'P6', text: "I engage in genuine intellectual debate with AI — pushing back on its reasoning, not just its factual claims." },
      { id: 'P7', text: 'I treat AI as a collaborator to challenge, not an oracle to trust.' },
      { id: 'P8', text: 'I would describe my relationship with AI as "productive tension" rather than "comfortable assistance."' },
    ],
  },
]

const scoreBands = [
  {
    min: 128,
    max: 160,
    band: 'Elizabeth-Cecil Zone',
    positions: 'Positions 9–10',
    color: 'green',
    interpretation:
      'Healthy partnership with active maintenance. You are leveraging AI while preserving and growing your own capabilities. Continue current practices and monitor for drift.',
    action: 'Maintain current practices and conduct quarterly self-assessments to catch early drift.',
  },
  {
    min: 96,
    max: 127,
    band: 'Lincoln-Seward Zone',
    positions: 'Positions 7–8',
    color: 'blue',
    interpretation:
      'Functional collaboration with areas for improvement. Identify your lowest-scoring GRIP pillar and apply targeted interventions from the Lincoln Protocol.',
    action: 'Focus on your weakest pillar. Implement one specific practice from the Lincoln Protocol this week.',
  },
  {
    min: 64,
    max: 95,
    band: 'Drift Zone',
    positions: 'Positions 5–6',
    color: 'yellow',
    interpretation:
      'Significant dependency patterns developing. Multiple warning signs likely present. Implement the full Lincoln Protocol immediately.',
    action: 'Implement the full Lincoln Protocol immediately. Consider a one-week "AI sabbatical" to reset your baseline capabilities.',
  },
  {
    min: 32,
    max: 63,
    band: 'Danger Zone',
    positions: 'Positions 2–4',
    color: 'orange',
    interpretation:
      'Serious dependency. Core capabilities likely atrophying. AI is shaping your reality more than you are shaping AI\'s output.',
    action: 'Urgent intervention needed: take an extended AI-free period, start a capability rebuilding programme, and create a professional development plan.',
  },
  {
    min: 0,
    max: 31,
    band: 'Displacement Zone',
    positions: 'Position 1',
    color: 'red',
    interpretation:
      'Critical. You have functionally outsourced your professional capability. Full capability rebuilding required.',
    action: 'Seek mentorship from a colleague who maintains strong independent skills. Begin full capability rebuilding immediately.',
  },
]

interface SectionPattern {
  condition: (scores: Record<string, number>) => boolean
  pattern: string
  description: string
}

const sectionPatterns: SectionPattern[] = [
  {
    condition: (s) => s.G < 16 && s.R < 16,
    pattern: 'Wei Zhongxian pattern',
    description: 'Disengagement plus atrophy — the most severe individual combination. Both governance and resilience are critically low.',
  },
  {
    condition: (s) => s.I < 16 && s.P < 16,
    pattern: 'Sycophancy trap',
    description: 'AI confirms your biases while you lack the sources or habits to catch it. Dual vulnerability in information and friction.',
  },
  {
    condition: (s) => s.G < 16 && s.R >= 16,
    pattern: 'Fouché pattern',
    description: 'You lack structural boundaries and your institutional knowledge is migrating to AI platforms.',
  },
  {
    condition: (s) => s.R < 16 && s.G >= 16,
    pattern: 'Al-Mansur pattern',
    description: 'Your output looks excellent but your independent capability is eroding. This is the most dangerous pattern because metrics mask the problem.',
  },
  {
    condition: (s) => s.I < 16 && s.G >= 16 && s.P >= 16,
    pattern: 'Sejanus pattern',
    description: 'AI is constructing your information reality. You are seeing the world through a single filtered lens.',
  },
  {
    condition: (s) => s.P < 16 && s.G >= 16 && s.I >= 16,
    pattern: 'Rasputin pattern',
    description: 'You are using AI for validation rather than challenge. The relationship is comforting rather than productive.',
  },
]

const sectionColorClasses = {
  blue: {
    border: 'border-blue-200',
    header: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    button: 'border-blue-300 bg-blue-500 text-white',
    buttonSelected: 'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-400',
    buttonUnselected: 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50',
  },
  green: {
    border: 'border-green-200',
    header: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    button: 'border-green-300 bg-green-500 text-white',
    buttonSelected: 'bg-green-600 border-green-600 text-white ring-2 ring-green-400',
    buttonUnselected: 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50',
  },
  purple: {
    border: 'border-purple-200',
    header: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    button: 'border-purple-300 bg-purple-500 text-white',
    buttonSelected: 'bg-purple-600 border-purple-600 text-white ring-2 ring-purple-400',
    buttonUnselected: 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50',
  },
  orange: {
    border: 'border-orange-200',
    header: 'bg-orange-50 border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    button: 'border-orange-300 bg-orange-500 text-white',
    buttonSelected: 'bg-orange-600 border-orange-600 text-white ring-2 ring-orange-400',
    buttonUnselected: 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50',
  },
}

const resultColorClasses: Record<string, string> = {
  green: 'border-green-400 bg-green-50',
  blue: 'border-blue-400 bg-blue-50',
  yellow: 'border-yellow-400 bg-yellow-50',
  orange: 'border-orange-400 bg-orange-50',
  red: 'border-red-400 bg-red-50',
}

const resultBadgeClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  red: 'bg-red-100 text-red-800',
}

const barColorClasses: Record<string, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
}

export function IndividualAudit() {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const answeredItems = Object.keys(scores).length
  const allAnswered = answeredItems === totalItems

  const sectionScores = sections.reduce(
    (acc, section) => {
      acc[section.key] = section.items.reduce(
        (sum, item) => sum + (scores[item.id] ?? 0),
        0
      )
      return acc
    },
    {} as Record<string, number>
  )

  const totalScore = Object.values(sectionScores).reduce((a, b) => a + b, 0)

  const currentBand = scoreBands.find(
    (b) => totalScore >= b.min && totalScore <= b.max
  ) ?? scoreBands[scoreBands.length - 1]

  const criticalSections = sections.filter(
    (s) => submitted && sectionScores[s.key] < 16
  )

  const matchedPattern = submitted
    ? sectionPatterns.find((p) => p.condition(sectionScores))
    : null

  function handleScore(itemId: string, value: number) {
    setScores((prev) => ({ ...prev, [itemId]: value }))
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
          GRIP Individual Self-Assessment
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          This diagnostic is designed for knowledge workers who use AI regularly.
          Complete it honestly — the value is in accuracy, not a high score.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Instructions:</strong> Score each statement from 1 to 5 based on your actual
          behaviour in the past month, not your aspirations.{' '}
          <strong>1 = strongly disagree</strong>, <strong>5 = strongly agree</strong>.
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{answeredItems} of {totalItems} answered</span>
          <span>{Math.round((answeredItems / totalItems) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredItems / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => {
        const colors = sectionColorClasses[section.color as keyof typeof sectionColorClasses]
        const sectionScore = sectionScores[section.key]
        const sectionAnswered = section.items.filter((item) => scores[item.id] !== undefined).length

        return (
          <div
            key={section.key}
            className={`mb-8 border rounded-xl overflow-hidden ${colors.border}`}
          >
            <div className={`px-6 py-4 border-b ${colors.header} flex items-center justify-between`}>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {sectionAnswered} of {section.items.length} answered
                  {submitted && (
                    <span className={`ml-3 px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}>
                      Score: {sectionScore} / 40
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {section.items.map((item, idx) => (
                <div key={item.id} className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-mono text-gray-400 mr-2">{item.id}</span>
                      <span className="text-gray-800 text-sm leading-relaxed">{item.text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleScore(item.id, val)}
                          className={`w-10 h-10 rounded-lg border-2 text-sm font-semibold transition-all ${
                            scores[item.id] === val
                              ? colors.buttonSelected
                              : colors.buttonUnselected
                          }`}
                          aria-label={`Score ${val} for item ${item.id}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
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
            Please answer all {totalItems} statements before submitting.
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
          Calculate My Score
        </button>
      </div>

      {/* Results */}
      {submitted && (
        <div className="mt-8 space-y-6">
          <hr className="border-gray-200" />
          <h2 className="text-2xl font-bold text-gray-900">Your Results</h2>

          {/* Total score card */}
          <div className={`border-2 rounded-xl p-6 ${resultColorClasses[currentBand.color]}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-5xl font-bold text-gray-900 mb-1">{totalScore}</div>
                <div className="text-sm text-gray-500">out of 160</div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${resultBadgeClasses[currentBand.color]}`}>
                  {currentBand.band}
                </span>
                <div className="text-sm text-gray-500 mt-1">{currentBand.positions}</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="mb-4">
              <div className="w-full bg-white rounded-full h-3 border border-gray-200">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${barColorClasses[currentBand.color]}`}
                  style={{ width: `${(totalScore / 160) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>32</span>
                <span>64</span>
                <span>96</span>
                <span>128</span>
                <span>160</span>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{currentBand.interpretation}</p>
            <div className="bg-white/60 rounded-lg px-4 py-3 text-sm text-gray-700">
              <strong>Recommended action:</strong> {currentBand.action}
            </div>
          </div>

          {/* Section breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pillar breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sections.map((section) => {
                const score = sectionScores[section.key]
                const isCritical = score < 16
                const colors = sectionColorClasses[section.color as keyof typeof sectionColorClasses]
                const pct = (score / 40) * 100

                return (
                  <div
                    key={section.key}
                    className={`border rounded-xl p-4 ${isCritical ? 'border-red-300 bg-red-50' : `${colors.border} bg-white`}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        {section.key}: {section.title.replace(`Section ${section.key}: `, '')}
                      </span>
                      <span className={`text-sm font-bold ${isCritical ? 'text-red-600' : 'text-gray-700'}`}>
                        {score}/40
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${isCritical ? 'bg-red-500' : barColorClasses[section.color === 'orange' ? 'orange' : section.color]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {isCritical && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        Critical vulnerability — score below 16
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pattern match */}
          {(matchedPattern || criticalSections.length > 0) && (
            <div className="border border-amber-300 bg-amber-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pattern analysis</h3>
              {matchedPattern ? (
                <div>
                  <div className="text-base font-bold text-amber-800 mb-2">
                    Your profile most resembles: <span className="italic">{matchedPattern.pattern}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{matchedPattern.description}</p>
                </div>
              ) : criticalSections.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-700">
                    Critical vulnerabilities detected in:{' '}
                    <strong>{criticalSections.map((s) => s.key).join(', ')}</strong>.
                    Any section scoring below 16 represents a critical weakness regardless of your total score.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Early warning signs */}
          <div className="border border-gray-200 bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Early warning signs to monitor</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <div className="font-semibold text-gray-800 mb-2">Gradual indicators</div>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                  <li>Declining frequency of independent research before consulting AI</li>
                  <li>Shrinking vocabulary toward AI-typical phrasing</li>
                  <li>Decreasing confidence in your own first-draft analysis</li>
                  <li>Growing tendency to ask AI open-ended questions</li>
                  <li>Reduced engagement with professional literature or peers</li>
                  <li>Increasing time with AI relative to human collaboration</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-2">Threshold indicators (act immediately)</div>
                <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                  <li>Inability to complete a routine task without AI that you could before</li>
                  <li>Emotional distress when AI tools are temporarily unavailable</li>
                  <li>Cannot explain or defend AI-assisted work when questioned</li>
                  <li>No significant independent work product in over a month</li>
                  <li>Agreeing with AI that contradicts your professional training without investigating</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Retake button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Retake assessment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
