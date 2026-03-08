import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdvocateLanding: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Devil's Advocates</h1>
        <p className="text-2xl text-gray-600 mb-2">
          "You are my mirror" (以人為鏡)
        </p>
        <p className="text-lg text-gray-500">
          - Emperor Taizong to Wei Zheng
        </p>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Test Your Ideas Against Institutionalized Dissent
        </h2>
        <p className="text-lg text-gray-700 mb-4">
          Present your ideas to multiple AI models trained to find flaws. But here's the twist:
          <strong className="text-blue-700"> the real test isn't what they find</strong> -
          it's <strong className="text-purple-700">how you respond to criticism</strong>.
        </p>
        <p className="text-gray-600">
          At the end, you'll see how your own defensiveness evolved across rounds.
          Like Emperor Taizong, who started welcoming Wei Zheng's criticism but
          gradually stopped listening.
        </p>
      </div>

      {/* Historical Precedents */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Historical Precedents</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Wei Zheng */}
          <div className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-4xl">📜</span>
              <div>
                <h3 className="text-xl font-bold text-amber-900">
                  Emperor Taizong's Jianyi System
                </h3>
                <p className="text-sm text-amber-700">Tang Dynasty, 626-649 CE</p>
              </div>
            </div>

            <p className="text-gray-700 mb-3">
              Emperor Taizong established the Jianyi (諫議) system - officials whose
              <strong> duty was to criticize the emperor</strong>. Wei Zheng (魏徵) became
              famous for bold remonstrance.
            </p>

            <div className="bg-white rounded-lg p-4 mb-3 border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-1">Early Period:</p>
              <p className="text-sm text-gray-700">
                Taizong welcomed criticism: "You are my mirror - through you I see my faults."
                He rewarded Wei Zheng for harsh feedback.
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <p className="text-sm font-semibold text-red-900 mb-1">Late Period:</p>
              <p className="text-sm text-gray-700">
                Taizong grew defensive, dismissed advice more often. After Wei Zheng died
                (643 CE), he lamented: "I have lost my mirror."
              </p>
            </div>
          </div>

          {/* Elizabeth I */}
          <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-4xl">👑</span>
              <div>
                <h3 className="text-xl font-bold text-purple-900">
                  Elizabeth I's Privy Council
                </h3>
                <p className="text-sm text-purple-700">England, 1558-1603</p>
              </div>
            </div>

            <p className="text-gray-700 mb-3">
              Elizabeth I's Privy Council featured advisors with
              <strong> explicit license to disagree</strong>. Vigorous debate was
              expected, not discouraged.
            </p>

            <blockquote className="bg-white rounded-lg p-4 mb-3 border-l-4 border-purple-500 italic text-gray-700 text-sm">
              "To seek wisdom in counsel is no weakness of great princes,
              but rather their chiefest strength and surest safety."
              <span className="block text-right text-purple-700 not-italic mt-2">
                - Elizabeth I
              </span>
            </blockquote>

            <p className="text-sm text-gray-700">
              Her advisors competed to find flaws in proposals. This diversity of
              perspective helped England navigate religious conflicts, Spanish threats,
              and economic challenges.
            </p>
          </div>
        </div>
      </div>

      {/* The Lesson */}
      <div className="bg-gray-900 text-white rounded-xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-4">The Lesson</h2>
        <div className="space-y-4 text-lg">
          <p>
            Both leaders understood that <strong className="text-blue-300">having critics
            isn't enough</strong>. You must actually <strong className="text-purple-300">
            listen to them</strong>.
          </p>
          <p>
            Taizong's decline after Wei Zheng's death shows what happens when leaders
            stop accepting criticism. Elizabeth's success shows the power of institutionalized
            dissent.
          </p>
          <p className="text-xl font-semibold text-yellow-300 border-t border-gray-700 pt-4">
            This tool shows you whether you're Taizong (early or late) or Elizabeth.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">1️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Select Advocates</h3>
            <p className="text-gray-600 text-sm">
              Choose 3-5 AI models, each assigned a critical lens (logical flaws,
              practical execution, unintended consequences, etc.)
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">2️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Present Your Idea</h3>
            <p className="text-gray-600 text-sm">
              Describe your proposal, decision, or plan. The advocates will attack it
              from multiple angles. Defend yourself or revise your thinking.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">3️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">See Your Pattern</h3>
            <p className="text-gray-600 text-sm">
              After the session, see how YOU responded to criticism. Did you stay
              open or become defensive? The mirror shows your true self.
            </p>
          </div>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">What You'll Learn</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              <strong>Your defensiveness pattern:</strong> Do you stay open to criticism
              or become defensive when challenged?
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              <strong>Which criticisms you dodge:</strong> See which flaws you dismissed
              rather than addressed
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              <strong>Your epistemic openness:</strong> Are you genuinely reconsidering
              or just defending?
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">✓</span>
            <span>
              <strong>Whether you're improving or worsening:</strong> Like Taizong,
              do you start open but close down?
            </span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => navigate('/tools/devils-advocate/session')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white
                     rounded-xl font-bold text-xl shadow-lg hover:shadow-xl
                     transform hover:scale-105 transition-all"
        >
          Start a Session
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Free · 10-20 minutes · No account required
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center">Common Questions</h2>

        <div className="space-y-4">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              Why do the AI models only criticize? Won't they miss good ideas?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              The point isn't to validate your idea - it's to stress-test it. Good ideas
              survive rigorous criticism. Weak ideas get exposed. You can get cheerleading
              anywhere; critical thinking is rare.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              What if the AI criticisms are wrong or unfair?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Perfect! How you respond to unfair criticism reveals even more. Do you dismiss
              it immediately? Do you explain why it's wrong? Do you get frustrated? Your
              response pattern matters more than whether specific criticisms are valid.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              How is this different from just asking ChatGPT for feedback?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Three key differences: (1) Multiple models attack from different angles
              simultaneously, (2) They're instructed to be uncompromising critics (not
              helpful assistants), (3) You get analysis of YOUR responses, not just the AI's.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              Will my session data be saved or shared?
            </summary>
            <p className="mt-2 text-gray-600 text-sm">
              Sessions are stored locally in your browser only. Nothing is sent to external
              servers except the AI API calls. You can download your transcript and then
              clear it from your browser.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}

export default AdvocateLanding
