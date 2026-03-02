import React from 'react'
import type { PatternAnalysis } from '../../types/advocate'

interface WeiZhengParallelProps {
  pattern: PatternAnalysis
}

const WeiZhengParallel: React.FC<WeiZhengParallelProps> = ({ pattern }) => {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-amber-900">
        The Wei Zheng Parallel
      </h3>

      <div className="prose prose-sm max-w-none">
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed">
            Emperor Taizong (626-649 CE) is remembered as one of China's greatest
            rulers. His secret? Wei Zheng (\u9B4F\u5FB5), an official whose duty was to
            criticize the emperor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Early Taizong</h4>
            <p className="text-sm text-gray-700">
              Welcomed criticism openly. Told Wei Zheng: "You are my mirror -
              through you I see my faults" (\u4EE5\u4EBA\u70BA\u93E1). Rewarded harsh feedback.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Late Taizong</h4>
            <p className="text-sm text-gray-700">
              Grew defensive. Dismissed Wei Zheng's advice more often. After
              Wei Zheng died (643 CE), Taizong lamented: "I have lost my mirror.
              Now I cannot see my errors."
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-l-4 border-amber-500">
          <h4 className="font-semibold text-gray-900 mb-2">Your Pattern:</h4>
          <p className="text-gray-800 mb-2">{pattern.taizongParallel}</p>
          <p className="text-gray-700 text-sm italic">
            Overall trajectory: <strong className={
              pattern.trajectory === 'improving' ? 'text-green-600' :
              pattern.trajectory === 'worsening' ? 'text-red-600' :
              'text-gray-600'
            }>{pattern.trajectory}</strong>
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">The Lesson:</h4>
          <p className="text-gray-800 text-sm">
            Having devil's advocates isn't enough. You must actually listen to them.
            When you stop listening, you've lost your mirror. The test isn't whether
            critics find flaws - it's whether you're willing to see them.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WeiZhengParallel
