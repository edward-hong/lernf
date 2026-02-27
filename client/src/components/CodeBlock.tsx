import './CodeBlock.css'

function CodeBlock({ code, label, isSelected, onSelect }) {
  return (
    <div
      className={`code-block ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="code-header">
        <span className="label">{label}</span>
        {isSelected && <span className="badge">Selected</span>}
      </div>
      <pre className="code-content">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default CodeBlock
