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
      className={`code-block ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          transition: 'all 0.2s ease',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#24292f',
          }}
        >
          {label}
        </span>
        {isSelected && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#0969da',
              background: 'rgba(9, 105, 218, 0.15)',
              borderRadius: '12px',
            }}
          >
            ✓ Selected
          </span>
        )}
      </div>
      <SyntaxHighlighter
        language={language}
        style={ghcolors}
        customStyle={{
          margin: '0 8px',
          backgroundColor: isSelected ? '#ddf4ff' : '#ffffff',
          borderRadius: '8px',
          padding: '1rem',
          cursor: 'pointer',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
