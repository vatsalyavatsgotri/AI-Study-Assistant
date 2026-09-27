import { NavLink, useNavigate } from 'react-router-dom'
import { AlignLeft, ArrowLeftToLine, ArrowRightToLine, BookOpen, Brain, CalendarDays, ChartNoAxesColumnIncreasing, Code2, FileSearch, FileText, House, Layers2, MessageCircle, Plus, Settings, Sparkles, X } from 'lucide-react'

const navigationGroups = [
  ['Workspace', [['Home', '/', House], ['AI Chat', '/chat', MessageCircle]]],
  ['Study tools', [['Notes', '/notes', FileText], ['Quiz', '/quiz', Brain], ['Flashcards', '/flashcards', Layers2], ['Study Planner', '/planner', CalendarDays], ['Interview Prep', '/interview', Brain]]],
  ['Developer tools', [['Code Assistant', '/code', Code2], ['File Analyzer', '/files', FileSearch]]],
  ['Progress', [['Weak Topics', '/weak-topics', ChartNoAxesColumnIncreasing], ['Analytics', '/analytics', ChartNoAxesColumnIncreasing]]],
]

export default function Sidebar({ mobileOpen, onClose, collapsed, onToggle }) {
  const navigate = useNavigate()
  return <>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-900/30 md:hidden" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar fixed left-0 top-0 z-50 flex h-screen flex-col transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="flex h-[66px] items-center gap-3 border-b border-slate-100 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700"><Sparkles size={17} strokeWidth={2.1} /></div>
        {!collapsed && <span className="whitespace-nowrap font-[Manrope] text-[13px] font-bold text-slate-800">AI Study Assistant</span>}
        <button className="icon-button ml-auto md:hidden" onClick={onClose} aria-label="Close sidebar"><X size={18} /></button>
      </div>
      <div className="px-3 pt-3">
        <button className="btn-primary w-full" onClick={() => { navigate('/chat'); onClose() }} title="Start a new chat"><Plus size={16} />{!collapsed && 'New chat'}</button>
      </div>
      <nav className="sidebar-nav mt-4 flex-1 space-y-3 overflow-y-auto px-2" aria-label="Main navigation">
        {navigationGroups.map(([group, links]) => <div className="nav-group" key={group}>
          {!collapsed && <div className="nav-group-label">{group}</div>}
          <div className="space-y-0.5">{links.map(([label, to, Icon]) => <NavLink key={to} to={to} onClick={onClose} title={collapsed ? label : undefined} className={({ isActive }) => `nav-link flex items-center gap-3 rounded px-3 py-[7px] text-[12.5px] font-medium ${isActive ? 'active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</div>
        </div>)}
      </nav>
      <div className="mt-auto border-t border-slate-100 p-2">
        <NavLink to="/settings" onClick={onClose} className="nav-link flex items-center gap-3 rounded px-3 py-2 text-[12.5px] font-medium"><Settings size={17} /><span>Settings</span></NavLink>
        <div className="mt-1 flex items-center gap-2.5 rounded px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4ebf3] text-[11px] font-bold text-slate-700">AS</div>
          {!collapsed && <><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold text-slate-700">Alex Student</div><div className="text-[10px] text-slate-400">Free plan</div></div><button className="icon-button h-7 w-7" aria-label="Profile options"><AlignLeft size={15} /></button></>}
        </div>
      </div>
      <button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="sidebar-toggle hidden md:flex"><span>{collapsed ? <ArrowRightToLine size={15} /> : <ArrowLeftToLine size={15} />}</span></button>
    </aside>
  </>
}
