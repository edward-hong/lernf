import content from '../Case Studies/case-10-seward-lincoln.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function SewardLincoln() {
  return (
    <MarkdownPage
      title="Case Study 10: Abraham Lincoln & William Seward"
      content={content}
    />
  )
}
