import React from 'react'

interface WeiZhengParallelProps {
  reflection: string
}

const WeiZhengParallel: React.FC<WeiZhengParallelProps> = ({ reflection }) => {
  return (
    <div className="bg-stone-50 border border-stone-300 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="text-4xl leading-none mt-1" aria-hidden="true">
          鏡
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-stone-800 mb-1">
            The Mirror of Wei Zheng
          </h3>
          <p className="text-sm text-stone-500 mb-4">
            Emperor Taizong called Wei Zheng his mirror - the only advisor brave enough
            to show him what he couldn't see about himself. When Wei Zheng died, the
            Emperor said: "I have lost my mirror."
          </p>

          <blockquote className="border-l-4 border-stone-400 pl-4 py-2">
            <p className="text-gray-700 italic leading-relaxed">
              {reflection}
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  )
}

export default WeiZhengParallel
