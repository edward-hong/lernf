import content from '../Case Studies/case-12-wozniak-jobs.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function WozniakJobs() {
  return (
    <MarkdownPage
      title="Case Study 12: Steve Wozniak & Steve Jobs"
      content={content}
    />
  )
}
