import content from '../Case Studies/case-04-rasputin-romanovs.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function RasputinRomanovs() {
  return (
    <MarkdownPage
      title="Case Study 04: Rasputin & the Romanovs"
      content={content}
    />
  )
}
