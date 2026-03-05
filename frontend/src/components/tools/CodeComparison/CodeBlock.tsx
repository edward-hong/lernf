import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  label: string
  isSelected: boolean
  onSelect: () => void
  language: string
}

function CodeBlock({
  code,
  label,
  isSelected,
  onSelect,
  language,
}: CodeBlockProps) {
  return (
    <div
      className={`border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'border-blue-700 shadow-[0_0_0_3px_rgba(9,105,218,0.12)]'
          : 'border-[#d0d7de] hover:border-[#8c959f] hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div
        className={`flex justify-between items-center px-4 py-3 border-b transition-all duration-200 ${
          isSelected
            ? 'bg-[#ddf4ff] border-[rgba(9,105,218,0.2)]'
            : 'bg-[#f6f8fa] border-[#d0d7de]'
        }`}
      >
        <span className="font-semibold text-sm text-[#24292f]">{label}</span>
        {isSelected && (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-700/15 rounded-full">
            ✓ Selected
          </span>
        )}
      </div>
      <SyntaxHighlighter
        language={language}
        style={ghcolors}
        customStyle={{
          border: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
