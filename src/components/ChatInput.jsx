import { useRef } from 'react'
import { ArrowUp, Mic, Paperclip, Upload } from 'lucide-react'

export default function ChatInput({ value, onChange, onSend, onFile, disabled, compact = false }) {
  const fileRef = useRef(null)
  function submit(event) { event.preventDefault(); onSend() }
  return <form onSubmit={submit} className="chat-input-box">
    <textarea value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); onSend() } }} placeholder="Ask anything about your studies..." rows={compact ? 1 : 2} aria-label="Message" />
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <button type="button" className="icon-button h-8 w-8" aria-label="Attach a file" onClick={() => fileRef.current?.click()}><Paperclip size={17} /></button>
        <button type="button" className="icon-button h-8 w-8" aria-label="Upload a file" onClick={() => fileRef.current?.click()}><Upload size={16} /></button>
        <input ref={fileRef} type="file" className="hidden" accept=".txt,.py,.md,.csv" onChange={(event) => { if (event.target.files?.[0]) onFile?.(event.target.files[0]); event.target.value = '' }} />
        <span className="ml-1 hidden text-[10px] text-slate-400 sm:inline">Shift + Enter for a new line</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="icon-button h-8 w-8" aria-label="Voice input" title="Voice input"><Mic size={17} /></button>
        <button type="submit" disabled={!value.trim() || disabled} aria-label="Send message" className="send-button"><ArrowUp size={17} /></button>
      </div>
    </div>
  </form>
}
