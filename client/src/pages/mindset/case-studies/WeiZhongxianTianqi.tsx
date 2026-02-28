import content from '../case-studies-md/case-01-wei-zhongxian-tianqi.md?raw'
import { MarkdownPage } from '../../../components/mindset/MarkdownPage'

export function WeiZhongxianTianqi() {
  return (
    <MarkdownPage
      title="Case Study 01: Wei Zhongxian & the Tianqi Emperor"
      content={content}
    />
  )
}
