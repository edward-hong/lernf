import content from './01-historical-context.md?raw'
import { MarkdownPage } from '../../components/mindset/MarkdownPage'

export function HistoricalContext() {
  return <MarkdownPage title="Historical Context" content={content} />
}
