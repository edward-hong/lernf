import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { DiffLine as DiffLineType } from '../../types/pr'

interface Props {
  line: DiffLineType
  isMarked: boolean
  onToggle: () => void
  language: string
}

const normalizeLanguage = (lang: string): string => {
  const map: Record<string, string> = {
    react: 'jsx',
    vue: 'markup',
    html: 'markup',
  }
  return map[lang.toLowerCase()] ?? lang.toLowerCase()
}

const DiffLine: React.FC<Props> = ({ line, isMarked, onToggle, language }) => {
  const getLineClasses = () => {
    const base =
      'flex items-center px-3 py-1 font-mono text-sm leading-[1.6] cursor-pointer transition-colors relative hover:bg-blue-500/10'

    const bgClass = isMarked
      ? 'bg-amber-100 border-l-[3px] border-amber-400'
      : line.type === 'added'
      ? 'bg-emerald-100'
      : line.type === 'removed'
      ? 'bg-red-100'
      : 'bg-gray-50'

    return `${base} ${bgClass}`
  }

  const getPrefixColor = () => {
    if (line.type === 'added') return 'text-emerald-600'
    if (line.type === 'removed') return 'text-red-600'
    return ''
  }

  const getPrefix = () => {
    if (line.type === 'added') return '+'
    if (line.type === 'removed') return '-'
    return ' '
  }

  return (
    <div className={getLineClasses()} onClick={onToggle}>
      <span className="min-w-[50px] text-gray-500 text-right mr-4 select-none">
        {line.lineNumber}
      </span>
      <span
        className={`min-w-[20px] font-bold select-none ${getPrefixColor()}`}
      >
        {getPrefix()}
      </span>
      <SyntaxHighlighter
        language={normalizeLanguage(language)}
        style={ghcolors}
        customStyle={{
          background: 'transparent',
          padding: 0,
          margin: 0,
          flex: '1 1 0%',
          whiteSpace: 'pre',
          overflowX: 'auto',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          lineHeight: 'inherit',
        }}
        codeTagProps={{
          style: {
            background: 'transparent',
          },
        }}
      >
        {line.content}
      </SyntaxHighlighter>
      {isMarked && <span className="absolute right-3 text-base">🚩</span>}
    </div>
  )
}

export default DiffLine
