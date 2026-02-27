import React from 'react'
import type { DiffLine as DiffLineType } from '../../types/pr'
import './DiffLine.css'

interface Props {
  line: DiffLineType
  isMarked: boolean
  onToggle: () => void
}

const DiffLine: React.FC<Props> = ({ line, isMarked, onToggle }) => {
  const getLineClass = () => {
    const classes = ['diff-line', `diff-${line.type}`]
    if (isMarked) classes.push('marked')
    return classes.join(' ')
  }

  const getPrefix = () => {
    if (line.type === 'added') return '+'
    if (line.type === 'removed') return '-'
    return ' '
  }

  return (
    <div className={getLineClass()} onClick={onToggle}>
      <span className="line-number">{line.lineNumber}</span>
      <span className="line-prefix">{getPrefix()}</span>
      <code className="line-content">{line.content}</code>
      {isMarked && <span className="marked-indicator">🚩</span>}
    </div>
  )
}

export default DiffLine
