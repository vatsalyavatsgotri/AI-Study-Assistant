import { useState } from 'react'
import { Bot, Check, Copy, ThumbsDown, ThumbsUp, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ChatMessage({ message, onRegenerate }) {
  const [rating, setRating] = useState('')
  const isUser = message.role === 'user'
  const components = {
    pre({ children }) {
      const code = String(children?.props?.children ?? '').replace(/\n$/, '')
      return <CodeBlock code={code}>{children}</CodeBlock>
    },
    code({ className, children, ...props }) { return <code className={className} {...props}>{children}</code> },
  }
  return <article className={`message-row flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
    {!isUser && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Bot size={16} /></div>}
    <div className={`max-w-[min(82%,700px)] ${isUser ? 'order-first' : ''}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{message.content}</ReactMarkdown>
      </div>
      <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
        <time>{message.time || 'Just now'}</time>
        {!isUser && <>
          <button className={`message-action ${rating === 'up' ? 'selected' : ''}`} onClick={() => setRating(rating === 'up' ? '' : 'up')} aria-label="Helpful response"><ThumbsUp size={13} /></button>
          <button className={`message-action ${rating === 'down' ? 'selected' : ''}`} onClick={() => setRating(rating === 'down' ? '' : 'down')} aria-label="Not helpful"><ThumbsDown size={13} /></button>
          {onRegenerate && <button className="message-action" onClick={onRegenerate} aria-label="Regenerate response"><RotateCcw size={13} /></button>}
        </>}
      </div>
    </div>
    {isUser && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">AS</div>}
  </article>
}

function CodeBlock({ code, children }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1400) } catch { setCopied(false) }
  }
  return <div className="code-block"><div className="code-toolbar"><span>Code</span><button onClick={copy} aria-label="Copy code"><Copy size={12} />{copied ? 'Copied' : 'Copy'}</button></div><pre>{children}</pre></div>
}
