import { Menu, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Header({ title, subtitle, onMenu, showNewChat = false }) {
  const navigate = useNavigate()
  return <header className="page-header flex min-h-[78px] items-center justify-between gap-4 border-b border-slate-200/80 bg-[#f7f8fa] px-8 md:px-10">
    <div className="flex min-w-0 items-center gap-3">
      <button className="icon-button -ml-2 md:hidden" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
      <div className="min-w-0"><h1 className="page-title truncate">{title}</h1><p className="mt-1 truncate text-[12px] text-slate-500">{subtitle}</p></div>
    </div>
    {showNewChat && <button className="btn-secondary shrink-0" onClick={() => navigate('/chat')}><Plus size={15} /><span className="hidden sm:inline">New chat</span></button>}
  </header>
}

export function PageWrap({ children, className = '' }) { return <div className={`page-wrap ${className}`}>{children}</div> }

export function StatCard({ label, value, note, icon: Icon }) {
  return <div className="surface p-4">
    <div className="flex items-center justify-between text-[12px] font-medium text-slate-500"><span>{label}</span>{Icon && <Icon size={16} className="text-slate-400" />}</div>
    <div className="stat-value mt-3">{value}</div>
    {note && <div className="mt-1.5 text-[11px] text-slate-400">{note}</div>}
  </div>
}

export function ProgressBar({ value, color = 'bg-blue-600', label }) {
  const percentage = Math.round(Math.max(0, Math.min(100, value)))
  return <div className="flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div><span className="w-9 text-right text-[11px] text-slate-500" aria-label={label || `${percentage}%`}>{percentage}%</span></div>
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return <div className="surface flex min-h-52 flex-col items-center justify-center p-8 text-center"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-50 text-slate-500"><Icon size={19} /></div><h3 className="text-sm font-semibold text-slate-700">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}
