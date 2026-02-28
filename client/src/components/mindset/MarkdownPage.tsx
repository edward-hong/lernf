import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownPageProps {
  content: string
}

export function MarkdownPage({ content }: MarkdownPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div
        className="prose prose-gray max-w-none
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-8 [&_h1]:mb-4
        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-800 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-6 [&_h3]:mb-3
        [&_h4]:text-lg [&_h4]:font-medium [&_h4]:text-gray-700 [&_h4]:mt-4 [&_h4]:mb-2
        [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-gray-700
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-gray-700
        [&_li]:mb-1 [&_li]:leading-relaxed
        [&_strong]:font-semibold [&_strong]:text-gray-900
        [&_em]:italic
        [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
        [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-gray-800
        [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100
        [&_hr]:border-gray-200 [&_hr]:my-8
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
        [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
        [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-700
        [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800
      "
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
