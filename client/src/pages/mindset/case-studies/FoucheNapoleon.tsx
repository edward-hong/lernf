import content from '../Case Studies/case-06-fouche-napoleon.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function FoucheNapoleon() {
  return (
    <MarkdownPage
      title="Case Study 06: Fouché & Napoleon"
      content={content}
    />
  )
}
