import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders AI/assistant replies with proper Markdown formatting.
 *
 * The language model answers with Markdown (bold, numbered/bullet lists,
 * links, sometimes tables) — without this component the raw `**` markers and
 * "1." prefixes would appear literally inside the chat bubble. react-markdown
 * is XSS-safe by default (it never injects raw HTML).
 */
export function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="rounded-2xl rounded-bl-md border border-border-subtle bg-canvas/60 px-4 py-3 text-[15px] leading-relaxed text-ink-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-ink-900">{children}</strong>
          ),
          em: ({ children }) => <em className="text-ink-700">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => (
            <p className="mb-1 text-[16px] font-semibold text-ink-900">{children}</p>
          ),
          h2: ({ children }) => (
            <p className="mb-1 text-[16px] font-semibold text-ink-900">{children}</p>
          ),
          h3: ({ children }) => (
            <p className="mb-1 text-[15px] font-semibold text-ink-900">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-2 border-l-2 border-brand-orange/50 pl-3 text-ink-700 last:mb-0">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-orange underline decoration-brand-orange/40 underline-offset-2 hover:text-ink-900"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded-md bg-ink-900/5 px-1.5 py-0.5 text-[13px] text-ink-800">
              {children}
            </code>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
