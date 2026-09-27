import { useEffect, useRef, useState } from 'react'
import { BookOpen, Brain, Code2, FileText, Sparkles } from 'lucide-react'
import ChatInput from '../components/ChatInput.jsx'
import ChatMessage from '../components/ChatMessage.jsx'
import { analyzeFile, sendChatMessage } from '../services/api.js'

const actions = [
  { title: 'Explain a concept', example: 'Explain recursion in simple terms, with an example.', icon: BookOpen },
  { title: 'Summarize notes', example: 'Summarize my notes into the key ideas I should remember.', icon: FileText },
  { title: 'Generate a quiz', example: 'Create a 10-question quiz about the topic I am studying.', icon: Brain },
  { title: 'Debug code', example: 'Help me debug this code and explain the fix.', icon: Code2 },
]

export default function Chat({ draft, setDraft }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(text = draft) {
    const content = text.trim()
    if (!content || loading) return
    const userMessage = { role: 'user', content, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }
    const history = messages.map(({ role, content: body }) => ({ role, content: body })).slice(-12)
    setMessages((current) => [...current, userMessage]); setDraft(''); setLoading(true)
    try {
      const result = await sendChatMessage(content, history)
      setMessages((current) => [...current, { role: 'assistant', content: result.reply, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: `I couldn't reach the study service: ${error.message}`, time: 'Just now' }])
    } finally { setLoading(false) }
  }

  async function handleFile(file) {
    setLoading(true)
    setMessages((current) => [...current, { role: 'user', content: `Analyze file: ${file.name}`, time: 'Just now' }])
    try {
      const result = await analyzeFile(file)
      setMessages((current) => [...current, { role: 'assistant', content: result.analysis, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message, time: 'Just now' }])
    } finally { setLoading(false) }
  }
  async function regenerate() {
    const userIndex = messages.map((message) => message.role).lastIndexOf('user')
    const previous = messages[userIndex]
    if (!previous || loading) return
    const history = messages.slice(0, userIndex).map(({ role, content }) => ({ role, content })).slice(-12)
    setLoading(true)
    try {
      const result = await sendChatMessage(previous.content, history)
      setMessages((current) => [...current, { role: 'assistant', content: result.reply, time: 'Just now' }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error.message, time: 'Just now' }])
    } finally { setLoading(false) }
  }

  return <section className="chat-page">
    <div className="chat-scroll flex-1" ref={scrollRef}>
      {messages.length === 0 ? <div className="chat-empty mx-auto flex max-w-[790px] flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700"><Sparkles size={19} /></div>
        <h2 className="font-[Manrope] text-[25px] font-semibold leading-tight text-slate-900">What do you want to learn today?</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-500">Ask questions, explain concepts, summarize notes, generate quizzes, or debug code.</p>
        <div className="mt-5 grid w-full grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
          {actions.map(({ title, example, icon: Icon }) => <button key={title} className="quick-action" onClick={() => setDraft(example)}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700"><Icon size={16} /></span><span className="min-w-0"><span className="block text-[12px] font-semibold text-slate-700">{title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-400">{example}</span></span></button>)}
        </div>
      </div> : <div className="mx-auto flex max-w-[790px] flex-col gap-6 px-5 py-8">{messages.map((message, index) => <ChatMessage key={`${index}-${message.time}`} message={message} onRegenerate={message.role === 'assistant' && index === messages.length - 1 ? regenerate : undefined} />)}{loading && <div className="flex items-center gap-2 pl-10 text-xs text-slate-400"><span className="typing-dot" /><span className="typing-dot delay-1" /><span className="typing-dot delay-2" />Thinking through that...</div>}</div>}
    </div>
    <div className="chat-composer-wrap"><div className="mx-auto max-w-[790px]"><ChatInput value={draft} onChange={setDraft} onSend={() => send()} onFile={handleFile} disabled={loading} /><p className="mt-2 text-center text-[10px] text-slate-400">AI can make mistakes. Check important information with your course materials.</p></div></div>
  </section>
}
