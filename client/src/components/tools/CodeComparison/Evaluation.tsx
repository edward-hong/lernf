import { MarkdownRenderer } from '../../MarkdownRenderer'

interface EvaluationProps {
  evaluation: string
  onReset: () => void
}

function Evaluation({ evaluation, onReset }: EvaluationProps) {
  return (
    <div className="max-w-[800px] mx-auto mt-6 p-6 bg-white rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
      <h2 className="mt-0 text-gray-800 text-2xl">Evaluation Results</h2>

      <div className="my-5">
        <div className="bg-gray-50 py-5 px-[60px] rounded-lg border-l-4 border-blue-500 leading-[1.8] whitespace-pre-wrap text-gray-700">
          <MarkdownRenderer content={evaluation} />
        </div>
      </div>

      <button
        className="bg-blue-500 text-white border-0 px-6 py-3 rounded-md text-base font-medium cursor-pointer transition-colors hover:bg-blue-600"
        onClick={onReset}
      >
        Try Another Scenario
      </button>
    </div>
  )
}

export default Evaluation
