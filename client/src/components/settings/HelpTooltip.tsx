import { useState } from 'react';

interface HelpTooltipProps {
  content: string;
  learnMoreUrl?: string;
}

export function HelpTooltip({ content, learnMoreUrl }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full border border-gray-300 text-xs font-semibold transition-colors"
      >
        ?
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs">
            <p className="mb-2">{content}</p>
            {learnMoreUrl && (
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 text-xs underline"
              >
                Learn more ↗
              </a>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
