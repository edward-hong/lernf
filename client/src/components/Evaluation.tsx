import './Evaluation.css'

function Evaluation({ evaluation, onReset }) {
  return (
    <div className="evaluation">
      <h2>Evaluation Results</h2>

      <div className="evaluation-content">
        <div className="evaluation-text">{evaluation}</div>
      </div>

      <button className="reset-button" onClick={onReset}>
        Try Another Scenario
      </button>
    </div>
  )
}

export default Evaluation
