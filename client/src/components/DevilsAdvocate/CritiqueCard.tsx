import React, { useState } from 'react'
import type { Critique, Advocate } from '../../types/advocate'

interface CritiqueCardProps {
  critique: Critique
  advocate: Advocate
}

const CritiqueCard: React.FC<CritiqueCardProps> = ({ critique, advocate }) => {
  const [expanded, setExpanded] = useState(false)

  const preview = critique.content.split('\n')[0].substring(0, 150)
  const needsExpand = critique.content.length > 150

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-4 h-4 rounded-full mt-1"
          style={{ backgroundColor: advocate.color }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-lg">{advocate.name}</h4>
            <span className="text-sm text-gray-500 capitalize">
              {advocate.lens} Lens
            </span>
          </div>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        {expanded || !needsExpand ? (
          <p className="whitespace-pre-wrap">{critique.content}</p>
        ) : (
          <>
            <p>{preview}...</p>
            <button
              onClick={() => setExpanded(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              Expand full critique
            </button>
          </>
        )}
      </div>

      {expanded && needsExpand && (
        <button
          onClick={() => setExpanded(false)}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium mt-2"
        >
          Collapse
        </button>
      )}
    </div>
  )
}

export default CritiqueCard
