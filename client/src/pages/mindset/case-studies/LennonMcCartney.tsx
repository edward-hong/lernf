import content from '../case-studies-md/case-11-lennon-mccartney.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function LennonMcCartney() {
  return (
    <MarkdownPage
      title="Case Study 11: John Lennon & Paul McCartney"
      content={content}
    />
  )
}
