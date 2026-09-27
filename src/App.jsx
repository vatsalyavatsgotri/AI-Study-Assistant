import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import { Header } from './components/Shared.jsx'
import Chat from './pages/Chat.jsx'
import { Home, Notes, Quiz, Flashcards, Planner, CodeAssistant, FileAnalyzer, WeakTopics, InterviewPrep, Analytics, Settings } from './pages/Pages.jsx'

const routeInfo = {
  '/': ['Home', 'A clear view of your learning, all in one place.'],
  '/chat': ['AI Study Assistant', 'Your personal AI-powered learning companion'],
  '/notes': ['Notes', 'Keep your study material organized and easy to revisit.'],
  '/quiz': ['Quiz Generator', 'Build a focused practice session around what you’re learning.'],
  '/flashcards': ['Flashcards', 'Review key ideas with a quick, focused study session.'],
  '/planner': ['Study Planner', 'Make steady progress with a plan that fits your week.'],
  '/interview': ['Interview Prep', 'Practice questions and answers for your next interview.'],
  '/code': ['Code Assistant', 'Understand, debug, and improve your code.'],
  '/files': ['File Analyzer', 'Turn course files into useful study material.'],
  '/weak-topics': ['Weak Topics', 'See where a little more practice can make a difference.'],
  '/analytics': ['Study Analytics', 'A useful overview of your learning activity.'],
  '/settings': ['Settings', 'Manage your account and study preferences.'],
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [chatDraft, setChatDraft] = useState('')
  return <div className={`app-shell ${dark ? 'dark-mode' : ''}`}>
    <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
    <main className={`main-panel ${collapsed ? 'desktop-collapsed' : ''}`}>
      <Routes>
        <Route path="/" element={<Home draft={chatDraft} setDraft={setChatDraft} onMenu={() => setMobileOpen(true)} />} />
        <Route path="/chat" element={<><Header title={routeInfo['/chat'][0]} subtitle={routeInfo['/chat'][1]} onMenu={() => setMobileOpen(true)} showNewChat /><Chat draft={chatDraft} setDraft={setChatDraft} /></>} />
        <Route path="/notes" element={<><Header title={routeInfo['/notes'][0]} subtitle={routeInfo['/notes'][1]} onMenu={() => setMobileOpen(true)} /><Notes /></>} />
        <Route path="/quiz" element={<><Header title={routeInfo['/quiz'][0]} subtitle={routeInfo['/quiz'][1]} onMenu={() => setMobileOpen(true)} /><Quiz /></>} />
        <Route path="/flashcards" element={<><Header title={routeInfo['/flashcards'][0]} subtitle={routeInfo['/flashcards'][1]} onMenu={() => setMobileOpen(true)} /><Flashcards /></>} />
        <Route path="/planner" element={<><Header title={routeInfo['/planner'][0]} subtitle={routeInfo['/planner'][1]} onMenu={() => setMobileOpen(true)} /><Planner /></>} />
        <Route path="/interview" element={<><Header title={routeInfo['/interview'][0]} subtitle={routeInfo['/interview'][1]} onMenu={() => setMobileOpen(true)} /><InterviewPrep /></>} />
        <Route path="/code" element={<><Header title={routeInfo['/code'][0]} subtitle={routeInfo['/code'][1]} onMenu={() => setMobileOpen(true)} /><CodeAssistant /></>} />
        <Route path="/files" element={<><Header title={routeInfo['/files'][0]} subtitle={routeInfo['/files'][1]} onMenu={() => setMobileOpen(true)} /><FileAnalyzer /></>} />
        <Route path="/weak-topics" element={<><Header title={routeInfo['/weak-topics'][0]} subtitle={routeInfo['/weak-topics'][1]} onMenu={() => setMobileOpen(true)} /><WeakTopics /></>} />
        <Route path="/analytics" element={<><Header title={routeInfo['/analytics'][0]} subtitle={routeInfo['/analytics'][1]} onMenu={() => setMobileOpen(true)} /><Analytics /></>} />
        <Route path="/settings" element={<><Header title={routeInfo['/settings'][0]} subtitle={routeInfo['/settings'][1]} onMenu={() => setMobileOpen(true)} /><Settings dark={dark} setDark={setDark} /></>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </div>
}
