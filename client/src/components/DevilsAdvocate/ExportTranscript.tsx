import React from 'react'
import type { AdvocateSession, SessionAnalysisResult } from '../../types/advocate'

interface ExportTranscriptProps {
  session: AdvocateSession
  analysisResult: SessionAnalysisResult
}

function buildTranscript(session: AdvocateSession, result: SessionAnalysisResult): string {
  const lines: string[] = []
  const divider = '─'.repeat(60)

  lines.push('DEVIL\'S ADVOCATES - SESSION TRANSCRIPT')
  lines.push(divider)
  lines.push('')
  lines.push('PROPOSAL:')
  lines.push(session.proposal)
  lines.push('')
  lines.push(`ADVOCATES: ${session.selectedAdvocates.map(a => `${a.name} (${a.lens})`).join(', ')}`)
  lines.push('')
  lines.push(divider)

  session.rounds.forEach(round => {
    lines.push('')
    lines.push(`ROUND ${round.roundNumber}`)
    lines.push(divider)

    if (round.userMessage) {
      lines.push('')
      lines.push('YOUR RESPONSE:')
      lines.push(round.userMessage)
    }

    lines.push('')
    lines.push('CRITIQUES:')
    round.critiques.forEach(critique => {
      const advocate = session.selectedAdvocates.find(a => a.id === critique.advocateId)
      lines.push('')
      lines.push(`[${advocate?.name || 'Advocate'} - ${advocate?.lens || 'unknown'} lens]`)
      lines.push(critique.content)
    })
  })

  lines.push('')
  lines.push(divider)
  lines.push('SESSION ANALYSIS')
  lines.push(divider)
  lines.push('')
  lines.push(`Overall Trajectory: ${result.analysis.overallTrajectory}`)
  lines.push(result.analysis.trajectoryDescription)
  lines.push('')
  lines.push(`Defensiveness Trend: ${result.analysis.defensivenessTrend}`)
  lines.push(`Openness Trend: ${result.analysis.opennessTrend}`)

  if (result.intentHistory.length > 0) {
    lines.push('')
    lines.push('INTENT SCORES BY ROUND:')
    result.intentHistory.forEach(({ roundNumber, intent }) => {
      lines.push(`  Round ${roundNumber}: cooperative=${intent.cooperative.toFixed(2)} defensive=${intent.defensive.toFixed(2)} epistemic=${intent.epistemic.toFixed(2)} persuasive=${intent.persuasive.toFixed(2)}`)
      lines.push(`    ${intent.interpretation}`)
    })
  }

  if (result.analysis.keyDismissals.length > 0) {
    lines.push('')
    lines.push('KEY DISMISSALS:')
    result.analysis.keyDismissals.forEach(d => lines.push(`  - ${d}`))
  }

  lines.push('')
  lines.push('STRONGEST MOMENT:')
  lines.push(result.analysis.strongestMoment)

  if (result.analysis.blindSpots.length > 0) {
    lines.push('')
    lines.push('BLIND SPOTS:')
    result.analysis.blindSpots.forEach(s => lines.push(`  - ${s}`))
  }

  lines.push('')
  lines.push('WEI ZHENG REFLECTION:')
  lines.push(result.analysis.weiZhengReflection)

  if (result.analysis.selfReflectionPrompts.length > 0) {
    lines.push('')
    lines.push('QUESTIONS TO SIT WITH:')
    result.analysis.selfReflectionPrompts.forEach((q, i) => lines.push(`  ${i + 1}. ${q}`))
  }

  lines.push('')
  lines.push(divider)
  lines.push(`Exported from LernF Devil's Advocates`)

  return lines.join('\n')
}

const ExportTranscript: React.FC<ExportTranscriptProps> = ({ session, analysisResult }) => {
  const handleExport = () => {
    const transcript = buildTranscript(session, analysisResult)
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `devils-advocate-${session.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    const transcript = buildTranscript(session, analysisResult)
    await navigator.clipboard.writeText(transcript)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium
                   hover:bg-gray-200 transition-colors border border-gray-300"
      >
        Download Transcript
      </button>
      <button
        onClick={handleCopy}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium
                   hover:bg-gray-200 transition-colors border border-gray-300"
      >
        Copy to Clipboard
      </button>
    </div>
  )
}

export default ExportTranscript
