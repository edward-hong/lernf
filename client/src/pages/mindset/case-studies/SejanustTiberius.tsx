import content from '../Case Studies/case-02-sejanus-tiberius.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function SejanustTiberius() {
  return (
    <MarkdownPage
      title="Case Study 02: Sejanus & Tiberius"
      content={content}
    />
  )
}
