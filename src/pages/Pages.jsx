import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Brain, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Code2, FileText, Flame, FolderOpen, Menu, Plus, Search, Settings2, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { PageWrap, ProgressBar, StatCard } from '../components/Shared.jsx'
import ChatInput from '../components/ChatInput.jsx'
import { analyzeFile, debugError, explainCode, generateCode, generateFlashcards as requestFlashcards, generateInterviewQuestions, generateQuiz, generateStudyPlan, identifyWeakTopics, sendChatMessage, summarizeNotes } from '../services/api.js'

const initialNotes = [
  { title: 'Python Functions', category: 'Computer Science', updated: 'Today', excerpt: 'Parameters, return values, scope, and writing reusable functions.' },
  { title: 'Data Structures', category: 'Computer Science', updated: 'Yesterday', excerpt: 'A comparison of arrays, linked lists, stacks, queues, and hash maps.' },
  { title: 'Machine Learning Basics', category: 'Machine Learning', updated: 'Sep 22', excerpt: 'Core ideas behind supervised learning, features, and model evaluation.' },
  { title: 'Computer Networks', category: 'Computer Science', updated: 'Sep 20', excerpt: 'The OSI model, TCP/IP, routing, and common network protocols.' },
]

const homeActions = [
  ['Explain a concept', BookOpen, 'Explain recursion in simple terms, with an example.'],
  ['Summarize notes', FileText, 'Summarize my notes into the key ideas I should remember.'],
  ['Generate a quiz', Brain, 'Create a 10-question quiz about the topic I am studying.'],
  ['Debug code', Code2, 'Help me debug this code and explain the fix.'],
]

export function Home({ draft, setDraft, onMenu }) {
  const navigate = useNavigate()
  const [fileError, setFileError] = useState('')
  async function handleUpload(file) {
    setFileError('')
    try {
      const result = await analyzeFile(file)
      setDraft(`Help me study ${result.filename}. Use this file analysis as context:\n\n${result.analysis}`)
    } catch (error) {
      setFileError(error.message)
    }
  }
  return <PageWrap>
    <div className="home-page-top"><button className="icon-button" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button></div>
    <div className="home-overview mx-auto max-w-[900px]">
      <header className="home-welcome"><div><p className="text-[13px] font-medium text-blue-700">Good morning 👋</p><h2 className="mt-1 font-[Manrope] text-[22px] font-semibold text-slate-900">Continue your learning journey</h2></div><span className="home-streak"><Flame size={15} />6 day streak</span></header>
      <section className="home-stats" aria-label="Study statistics"><span><strong>128</strong> questions asked</span><span><strong>24</strong> topics learned</span><span><strong>18</strong> quizzes completed</span></section>
      <section className="home-mini-prompt"><ChatInput value={draft} onChange={setDraft} onSend={() => navigate('/chat')} onFile={handleUpload} compact />{fileError && <p role="alert" className="mt-2 text-xs text-red-600">{fileError}</p>}</section>
      <div className="home-tools-strip">{homeActions.map(([label, Icon, prompt]) => <button className="home-action" key={label} onClick={() => { setDraft(prompt); navigate('/chat') }}><Icon size={15} /><span>{label}</span></button>)}</div>
    </div>
    <section className="home-learning mx-auto mt-7 max-w-[900px]"><div className="mb-1 flex items-center justify-between"><h3 className="section-title">Continue learning</h3><button className="text-xs font-medium text-blue-700" onClick={() => navigate('/notes')}>View notes <ArrowRight size={13} className="ml-1 inline" /></button></div>
      <div className="home-topic-list">{[
        ['Python Functions', 'Computer Science', '68%'], ['Cell Biology', 'Biology', '42%'], ['Linear Algebra', 'Mathematics', '31%'],
      ].map(([topic, subject, progress]) => <button key={topic} className="home-topic-row" onClick={() => { setDraft(`Help me continue studying ${topic.toLowerCase()}.`); navigate('/chat') }}><span className="min-w-0 flex-1 text-left"><span className="block text-[13px] font-medium text-slate-800">{topic}</span><span className="mt-1 block text-[11px] text-slate-500">{subject}</span></span><span className="text-[11px] text-slate-500">{progress}</span><ArrowUpRight size={15} className="text-slate-400" /></button>)}</div>
    </section>
    <section className="mx-auto mt-5 max-w-[900px]"><h3 className="section-title mb-1">Recent activity</h3><div className="home-activity-list">{[
      ['Reviewed Python functions', 'Today, 9:42 AM', BookOpen], ['Completed a data structures quiz', 'Yesterday, 4:18 PM', Brain], ['Added notes on machine learning', 'Sep 22, 2:05 PM', FileText],
    ].map(([label, when, Icon]) => <div key={label} className="home-activity-row"><Icon size={15} /><span className="flex-1 text-xs text-slate-700">{label}</span><span className="text-[10px] text-slate-400">{when}</span></div>)}</div></section>
  </PageWrap>
}

export function Notes() {
  const [notes, setNotes] = useState(initialNotes)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All subjects')
  const [editing, setEditing] = useState(null)
  const [summaries, setSummaries] = useState({})
  const [summaryBusy, setSummaryBusy] = useState('')
  const [summaryErrors, setSummaryErrors] = useState({})
  const categories = ['All subjects', ...new Set(notes.map((note) => note.category))]
  const filtered = useMemo(() => notes.filter((note) => (category === 'All subjects' || note.category === category) && `${note.title} ${note.excerpt}`.toLowerCase().includes(query.toLowerCase())), [notes, query, category])
  async function summarizeNote(note) {
    setSummaryBusy(note.title)
    setSummaryErrors((current) => ({ ...current, [note.title]: '' }))
    try {
      const result = await summarizeNotes(note.excerpt)
      setSummaries((current) => ({ ...current, [note.title]: result.reply }))
    } catch (error) {
      setSummaryErrors((current) => ({ ...current, [note.title]: error.message }))
    } finally { setSummaryBusy('') }
  }
  function saveNote(event) { event.preventDefault(); const data = new FormData(event.currentTarget); const note = { title: data.get('title'), category: data.get('category'), excerpt: data.get('excerpt') || 'Add your key ideas and study notes here.', updated: 'Just now' }; setNotes((current) => editing ? current.map((item) => item === editing ? note : item) : [note, ...current]); setEditing(null) }
  return <PageWrap><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-9" placeholder="Search notes..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><button className="btn-primary" onClick={() => setEditing({ title: '', category: categories[1] || 'General', excerpt: '' })}><Plus size={15} />Create note</button></div>
    <div className="mb-5 flex flex-wrap gap-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`filter-chip ${category === item ? 'selected' : ''}`}>{item}</button>)}</div>
    <div className="grid gap-3 md:grid-cols-2">{filtered.map((note) => <article key={note.title} className="surface group p-4"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-700"><FileText size={17} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-[13px] font-semibold text-slate-700">{note.title}</h3><div className="flex gap-1 opacity-70"><button className="icon-button h-7 w-7" aria-label={`Summarize ${note.title}`} onClick={() => summarizeNote(note)} disabled={summaryBusy === note.title}><Sparkles size={14} /></button><button className="icon-button h-7 w-7" aria-label={`Edit ${note.title}`} onClick={() => setEditing(note)}><Settings2 size={14} /></button><button className="icon-button h-7 w-7 hover:text-red-600" aria-label={`Delete ${note.title}`} onClick={() => setNotes((list) => list.filter((item) => item !== note))}><Trash2 size={14} /></button></div></div><div className="mt-1 text-[10px] text-blue-700">{note.category}<span className="px-1.5 text-slate-300">·</span><span className="text-slate-400">{note.updated}</span></div><p className="mt-3 text-xs leading-5 text-slate-500">{note.excerpt}</p>{summaryBusy === note.title && <p className="mt-3 text-xs text-slate-500">Summarizing with AI...</p>}{summaries[note.title] && <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{summaries[note.title]}</p>}{summaryErrors[note.title] && <p role="alert" className="mt-3 text-xs text-red-600">{summaryErrors[note.title]}</p>}</div></div></article>)}</div>
    {filtered.length === 0 && <div className="py-16 text-center text-sm text-slate-500">No notes match your search.</div>}
    {editing && <Modal title={editing.title ? 'Edit note' : 'Create a note'} onClose={() => setEditing(null)}><form onSubmit={saveNote} className="space-y-3"><label className="form-label">Title<input name="title" className="field mt-1" required defaultValue={editing.title} /></label><label className="form-label">Subject<input name="category" className="field mt-1" defaultValue={editing.category} /></label><label className="form-label">Notes<textarea name="excerpt" className="field mt-1 min-h-24" defaultValue={editing.excerpt} /></label><div className="flex justify-end gap-2 pt-2"><button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary">Save note</button></div></form></Modal>}
  </PageWrap>
}

const starterQuestions = [
  { question: 'Which statement best describes the purpose of a function in programming?', options: ['To store data permanently', 'To group reusable instructions', 'To format a computer screen', 'To connect to the internet'], answer: 1 },
  { question: 'What does a function return when no return statement is specified in Python?', options: ['0', 'False', 'None', 'An empty string'], answer: 2 },
  { question: 'Which keyword defines a function in Python?', options: ['function', 'func', 'def', 'lambda'], answer: 2 },
]

export function Quiz() {
  const [settings, setSettings] = useState({ subject: 'Computer Science', topic: 'Python functions', difficulty: 'Medium', count: '10', type: 'MCQ' })
  const [questions, setQuestions] = useState(starterQuestions)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function generate(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const notes = `Subject: ${settings.subject}\nTopic: ${settings.topic}\nDifficulty: ${settings.difficulty}\nQuestion type: ${settings.type}`
      const response = await generateQuiz(notes, Number(settings.count))
      if (response.quiz?.length) setQuestions(response.quiz)
      setIndex(0); setSelected(null); setGenerated(true)
    } catch (requestError) { setError(requestError.message); setGenerated(false) } finally { setBusy(false) }
  }
  const question = questions[index]
  return <PageWrap><div className="grid items-start gap-4 lg:grid-cols-[.92fr_1.08fr]">
    <form className="surface quiz-panel" onSubmit={generate}><h2 className="section-title">Quiz settings</h2><p className="mt-1 text-xs text-slate-500">Choose what you’d like to practice.</p><div className="mt-4 space-y-3"><label className="form-label">Subject<input className="field mt-1" value={settings.subject} onChange={(e) => setSettings({ ...settings, subject: e.target.value })} /></label><label className="form-label">Topic<input className="field mt-1" value={settings.topic} onChange={(e) => setSettings({ ...settings, topic: e.target.value })} /></label><label className="form-label">Difficulty<select className="field mt-1" value={settings.difficulty} onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}>{['Easy', 'Medium', 'Hard'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-label">Number of questions<input type="number" min="1" max="30" className="field mt-1" value={settings.count} onChange={(e) => setSettings({ ...settings, count: e.target.value })} /></label><label className="form-label">Question type<select className="field mt-1" value={settings.type} onChange={(e) => setSettings({ ...settings, type: e.target.value })}>{['MCQ', 'True/False', 'Mixed'].map((item) => <option key={item}>{item}</option>)}</select></label><button className="btn-primary w-full" disabled={busy}><Sparkles size={15} />{busy ? 'Preparing...' : 'Generate quiz'}</button>{error && <p role="alert" className="text-xs text-red-600">{error}</p>}</div></form>
    <div className="surface quiz-panel"><div className="flex items-center justify-between gap-3"><div><h2 className="section-title">{generated ? 'Your quiz' : 'Quiz preview'}</h2><p className="mt-1 text-xs text-slate-500">{settings.topic} · {settings.difficulty}</p></div><span className="shrink-0 text-xs text-slate-500">Question {index + 1} of {questions.length}</span></div><div className="mt-3"><ProgressBar value={((index + 1) / questions.length) * 100} /></div><h3 className="mt-5 text-[14px] font-semibold leading-6 text-slate-800">{question.question}</h3><div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => <button key={option} onClick={() => setSelected(optionIndex)} className={`option-row ${selected === optionIndex ? 'selected' : ''}`}><span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected === optionIndex && <Check size={15} className="ml-auto text-blue-700" />}</button>)}</div><div className="mt-5 flex justify-between"><button className="btn-secondary" disabled={index === 0} onClick={() => { setIndex(index - 1); setSelected(null) }}><ChevronLeft size={15} />Previous</button><button className="btn-primary" onClick={() => { setIndex((index + 1) % questions.length); setSelected(null) }}>Next question<ChevronRight size={15} /></button></div></div>
  </div></PageWrap>
}

const starterFlashcards = [
  { front: 'What is a Python function?', back: 'A named, reusable block of code that performs a task. Define one with the def keyword.' },
  { front: 'What is a function parameter?', back: 'A variable listed in a function definition that receives a value when the function is called.' },
  { front: 'What does return do?', back: 'It ends a function call and optionally sends a value back to the code that called it.' },
  { front: 'What is variable scope?', back: 'The region of a program where a variable can be accessed.' },
]
export function Flashcards() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [marked, setMarked] = useState({})
  const [cards, setCards] = useState(starterFlashcards)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const card = cards[index]
  function move(next) { setIndex((index + next + cards.length) % cards.length); setFlipped(false) }
  function rate(value) { setMarked({ ...marked, [index]: value }); move(1) }
  async function createCards() {
    setBusy(true); setError('')
    try {
      const response = await requestFlashcards('Create study flashcards about Python functions, parameters, return values, and variable scope.', 10)
      if (response.flashcards?.length) { setCards(response.flashcards); setIndex(0); setMarked({}); setFlipped(false) }
    } catch (requestError) { setError(requestError.message) } finally { setBusy(false) }
  }
  return <PageWrap><div className="mx-auto max-w-[720px]"><div className="mb-3 flex items-center justify-between"><div><h2 className="section-title">Python functions</h2><p className="mt-1 text-xs text-slate-500">Core concepts · {cards.length} cards</p></div><button className="btn-primary" onClick={createCards} disabled={busy}><Sparkles size={15} />{busy ? 'Generating...' : 'Generate with AI'}</button></div>{error && <p role="alert" className="mb-3 text-xs text-red-600">{error}</p>}<div className="mb-2"><ProgressBar value={((index + 1) / cards.length) * 100} label={`Card ${index + 1} of ${cards.length}`} /></div>
    <button className={`flashcard surface flex w-full flex-col items-center justify-center px-8 text-center ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label="Flip flashcard"><span className="text-[10px] font-bold uppercase tracking-[.08em] text-blue-700">{flipped ? 'Answer' : 'Question'}</span><span className="mt-3 max-w-lg text-[20px] font-semibold leading-7 text-slate-800">{flipped ? card.back : card.front}</span><span className="mt-4 text-[11px] text-slate-400">Click to flip</span></button>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2"><button className="btn-secondary" onClick={() => move(-1)}><ChevronLeft size={15} />Previous</button><button className="btn-primary" onClick={() => setFlipped(!flipped)}>Flip card</button><button className="btn-secondary" onClick={() => move(1)}>Next<ChevronRight size={15} /></button></div><div className="mt-4 border-t border-slate-200 pt-3"><p className="mb-2 text-center text-xs text-slate-500">How well did you know this?</p><div className="flex justify-center gap-2"><button className="rating-button" onClick={() => rate('Easy')}>Easy</button><button className="rating-button" onClick={() => rate('Medium')}>Medium</button><button className="rating-button" onClick={() => rate('Hard')}>Hard</button></div>{marked[index] && <p className="mt-2 text-center text-[11px] text-slate-400">Marked {marked[index].toLowerCase()}</p>}</div>
  </div></PageWrap>
}

const initialTasks = [
  { title: 'Review recursion notes', subject: 'Computer Science', duration: '25 min', done: false },
  { title: 'Practice cell structure flashcards', subject: 'Biology', duration: '15 min', done: true },
  { title: 'Work through linear equations', subject: 'Mathematics', duration: '30 min', done: false },
]
export function Planner() {
  const [tasks, setTasks] = useState(initialTasks)
  const [showForm, setShowForm] = useState(false)
  const [plan, setPlan] = useState('')
  const [planError, setPlanError] = useState('')
  const [planBusy, setPlanBusy] = useState(false)
  function addTask(event) { event.preventDefault(); const data = new FormData(event.currentTarget); setTasks([...tasks, { title: data.get('title'), subject: data.get('subject'), duration: `${data.get('duration')} min`, done: false }]); setShowForm(false) }
  const toggle = (index) => setTasks(tasks.map((task, i) => i === index ? { ...task, done: !task.done } : task))
  const todayTasks = tasks.map((task, index) => ({ ...task, index })).filter((task) => !task.done)
  const completedTasks = tasks.map((task, index) => ({ ...task, index })).filter((task) => task.done)
  async function generatePlan() {
    setPlanBusy(true); setPlanError('')
    try {
      const subjects = [...new Set(tasks.map((task) => task.subject))].join(', ')
      const result = await generateStudyPlan({ subject: subjects || 'General studies', days: 7, hours_per_day: 2 })
      setPlan(result.plan)
    } catch (error) { setPlanError(error.message) } finally { setPlanBusy(false) }
  }
  return <PageWrap><div className="mb-5 flex items-center justify-between"><div><h2 className="section-title">Your week</h2><p className="mt-1 text-xs text-slate-500">Monday, September 28 – Sunday, October 4</p></div><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={generatePlan} disabled={planBusy}><Sparkles size={15} />{planBusy ? 'Planning...' : 'Generate plan'}</button><button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} />Add study task</button></div></div>
    {planError && <p role="alert" className="mb-3 text-xs text-red-600">{planError}</p>}{plan && <section className="planner-ai-plan mb-5"><div className="flex items-center gap-2"><Sparkles size={15} className="text-blue-700" /><h3 className="text-xs font-semibold text-slate-700">AI study plan</h3></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{plan}</p></section>}
    {showForm && <form onSubmit={addTask} className="surface mb-5 grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_120px_auto] md:items-end"><label className="form-label">Task<input name="title" className="field mt-1" placeholder="What will you study?" required /></label><label className="form-label">Subject<input name="subject" className="field mt-1" placeholder="Subject" required /></label><label className="form-label">Duration (min)<input name="duration" type="number" defaultValue="25" className="field mt-1" min="5" /></label><button className="btn-primary">Add task</button></form>}
    <div className="planner-columns">
      <div>
        <PlannerSection title="Today" meta={`${todayTasks.length} remaining`}><div className="planner-task-list">{todayTasks.map((task) => <PlannerTask key={`${task.title}-${task.index}`} task={task} onToggle={() => toggle(task.index)} />)}{todayTasks.length === 0 && <p className="py-4 text-xs text-slate-500">All planned tasks are complete.</p>}</div></PlannerSection>
        <PlannerSection title="Completed" meta={`${completedTasks.length} tasks`}><div className="planner-task-list">{completedTasks.map((task) => <PlannerTask key={`${task.title}-${task.index}`} task={task} onToggle={() => toggle(task.index)} />)}{completedTasks.length === 0 && <p className="py-3 text-xs text-slate-500">Completed tasks will appear here.</p>}</div></PlannerSection>
      </div>
      <PlannerSection title="Upcoming" meta="This week"><div className="planner-task-list">{[['Tue', 'Statistics problem set', 'Mathematics', '35 min'], ['Wed', 'Review lecture notes', 'Biology', '20 min'], ['Fri', 'Practice linked lists', 'Computer Science', '25 min']].map(([day, title, subject, duration]) => <div key={title} className="planner-task-row upcoming-task"><span className="planner-day">{day}</span><div className="min-w-0 flex-1"><div className="text-xs font-medium text-slate-700">{title}</div><div className="mt-1 text-[10px] text-slate-500">{subject}</div></div><span className="text-[10px] text-slate-500">{duration}</span></div>)}</div></PlannerSection>
    </div></PageWrap>
}

function PlannerSection({ title, meta, children }) { return <section className="planner-section"><header><h3>{title}</h3><span>{meta}</span></header>{children}</section> }
function PlannerTask({ task, onToggle }) { return <div className="planner-task-row"><button onClick={onToggle} aria-label={task.done ? 'Mark incomplete' : 'Mark complete'} className={`task-check ${task.done ? 'checked' : ''}`}>{task.done && <Check size={12} />}</button><div className="min-w-0 flex-1"><div className={`text-xs font-medium ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</div><div className="mt-1 text-[10px] text-slate-500">{task.subject}</div></div><span className="flex items-center gap-1.5 text-[10px] text-slate-500"><Clock3 size={13} />{task.duration}</span></div> }

const starterCode = `def calculate_average(numbers):\n    total = sum(numbers)\n    return total / len(numbers)\n\nscores = [82, 91, 76, 88]\nprint(calculate_average(scores))`
export function CodeAssistant() {
  const [code, setCode] = useState(starterCode)
  const [language, setLanguage] = useState('Python')
  const [output, setOutput] = useState('Choose an action to explore this code. Your code is only sent to your configured study service when you run an action.')
  const [busy, setBusy] = useState(false)
  async function run(action) {
    setBusy(true)
    try {
      const response = action === 'explain'
        ? await explainCode(code, language)
        : action === 'debug'
          ? await debugError(code)
          : await generateCode(action === 'optimize' ? `Optimize this code while preserving its behavior:\n${code}` : code, language)
      setOutput(response.reply)
    } catch (error) { setOutput(error.message) } finally { setBusy(false) }
  }
  return <PageWrap className="code-page"><div className="code-workspace-heading"><div><h2 className="section-title">Coding workspace</h2><p className="mt-1 text-xs text-slate-500">Try an action on your code.</p></div><label className="sr-only" htmlFor="language">Programming language</label><select id="language" className="field w-auto min-w-32" value={language} onChange={(e) => setLanguage(e.target.value)}>{['Python', 'JavaScript', 'Java', 'C++', 'TypeScript'].map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="code-actions-toolbar" role="toolbar" aria-label="Code actions">{[['Explain code', 'explain'], ['Debug', 'debug'], ['Optimize', 'optimize'], ['Generate code', 'generate']].map(([label, action]) => <button key={action} className="btn-secondary" onClick={() => run(action)} disabled={busy}><Code2 size={14} />{label}</button>)}</div>
    <div className="code-workspace-grid"><section className="ide-panel"><div className="ide-panel-header"><span>{language}</span><span className="ide-status">Ready</span></div><label className="sr-only" htmlFor="code-input">Code editor</label><textarea id="code-input" spellCheck="false" className="code-editor code-font" value={code} onChange={(e) => setCode(e.target.value)} /></section>
      <section className="code-response-panel"><div className="code-response-header"><Sparkles size={15} className="text-blue-700" /><h3>Study assistant</h3></div><div className="code-response-content">{busy ? 'Working on your code...' : output}</div></section>
    </div></PageWrap>
}

export function FileAnalyzer() {
  const [file, setFile] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [actionResult, setActionResult] = useState('')
  const [actionBusy, setActionBusy] = useState('')
  const inputRef = useRef(null)
  function chooseFile(selected) {
    if (!selected) return
    setSelectedFile(selected)
    setFile({ name: selected.name, type: selected.type || 'Unknown file', size: selected.size })
    setStatus(''); setAnalysis(''); setFileContent(''); setActionResult(''); setAnalyzed(false)
  }
  async function analyzeSelectedFile() {
    if (!selectedFile) return
    setBusy(true); setStatus('')
    try {
      const result = await analyzeFile(selectedFile)
      setFile((current) => ({ ...current, name: result.filename }))
      setFileContent(result.content)
      setAnalysis(result.analysis)
      setAnalyzed(true)
    } catch (error) { setStatus(error.message) } finally { setBusy(false) }
  }
  async function runFileAction(action) {
    setActionBusy(action); setActionResult('')
    try {
      if (action === 'Summarize') {
        const result = await summarizeNotes(fileContent)
        setActionResult(result.reply)
      } else if (action === 'Ask Questions') {
        const result = await sendChatMessage(`Create useful study questions and answers from this file:\n${fileContent}`)
        setActionResult(result.reply)
      } else if (action === 'Generate Quiz') {
        const result = await generateQuiz(fileContent, 10)
        setActionResult(JSON.stringify(result.quiz, null, 2))
      } else {
        const result = await summarizeNotes(`Extract the most important facts and key points from these notes:\n${fileContent}`)
        setActionResult(result.reply)
      }
    } catch (error) { setActionResult(error.message) } finally { setActionBusy('') }
  }
  const size = file ? file.size < 1024 * 1024 ? `${Math.ceil(file.size / 1024)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB` : ''
  return <PageWrap><div className="mx-auto max-w-[760px]">{!file && <section onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files?.[0]) }} className="upload-zone" onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}><input ref={inputRef} type="file" className="hidden" accept=".txt,.py,.md,.csv" onChange={(e) => chooseFile(e.target.files?.[0])} /><div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-700"><Upload size={21} /></div><h2 className="mt-4 text-sm font-semibold text-slate-700">Drop your TXT, PY, MD or CSV file here</h2><p className="mt-1 text-xs text-slate-400">or choose a text file from your device</p><button className="btn-secondary mt-4" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>Upload file</button><p className="mt-3 text-[10px] text-slate-400">Maximum file size: 2 MB</p></section>}
    {busy && <p className="mt-3 text-center text-xs text-slate-500">Analyzing file with AI...</p>}{status && <p role="alert" className="mt-3 text-xs text-red-600">{status}</p>}
    {file && <section className="file-result mt-5"><div className="flex flex-wrap items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded bg-slate-50 text-slate-500"><FileText size={17} /></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold text-slate-700">{file.name}</div><div className="mt-1 text-[10px] text-slate-400">{file.type} · {size}</div></div><button className="btn-secondary" onClick={() => { setFile(null); setSelectedFile(null); setStatus(''); setAnalyzed(false); setAnalysis(''); setFileContent(''); setActionResult('') }}><X size={14} />Remove</button></div>
      {!analyzed ? <div className="mt-4"><button className="btn-primary" disabled={busy} onClick={analyzeSelectedFile}><Sparkles size={15} />{busy ? 'Analyzing...' : 'Analyze File'}</button></div> : <div className="mt-4 border-t border-slate-100 pt-3"><h3 className="text-xs font-semibold text-slate-700">File analysis</h3><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{analysis}</p><p className="mb-2 mt-4 text-[11px] font-medium text-slate-600">Continue studying this file</p><div className="flex flex-wrap gap-2">{['Summarize', 'Ask Questions', 'Generate Quiz', 'Extract Important Points'].map((action) => <button key={action} className="btn-secondary file-action" disabled={Boolean(actionBusy)} onClick={() => runFileAction(action)}>{actionBusy === action ? 'Working...' : action}</button>)}</div>{actionResult && <p role="status" className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{actionResult}</p>}</div>}
    </section>}
    {!file && <div className="mt-6 flex items-start gap-3 rounded-md border border-blue-100 bg-blue-50/50 p-4"><FolderOpen size={17} className="mt-0.5 text-blue-700" /><p className="text-xs leading-5 text-slate-600">Your files stay in your workspace. Connect an API endpoint to analyze their contents with your study assistant.</p></div>}
  </div></PageWrap>
}

const topicData = [['Python', 80, 'Practice writing functions and tracing code'], ['Data structures', 50, 'Review linked lists and hash maps'], ['Mathematics', 70, 'Work through algebra practice problems'], ['Cell biology', 38, 'Review organelles and cell processes']]
export function WeakTopics() {
  const [notes, setNotes] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function analyze() {
    setBusy(true); setError('')
    try { const result = await identifyWeakTopics(notes); setAnalysis(result.analysis) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return <PageWrap><div className="mx-auto max-w-[850px]"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="section-title">Topics to revisit</h2><p className="mt-1 text-xs text-slate-500">Confidence and a useful next step for each topic.</p></div><p className="flex items-center gap-1 text-[11px] text-emerald-700"><ArrowUpRight size={13} />Practice consistency is improving</p></div>
    <section className="weak-topic-analyzer"><label className="form-label" htmlFor="weak-topic-notes">Analyze your notes<textarea id="weak-topic-notes" className="field mt-1 min-h-20" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Paste study notes to identify topics for more practice..." /></label><button className="btn-secondary mt-2" onClick={analyze} disabled={busy || !notes.trim()}><Sparkles size={14} />{busy ? 'Analyzing...' : 'Analyze notes'}</button>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}{analysis && <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600">{analysis}</p>}</section>
    <div className="weak-topic-list">{topicData.map(([name, score, tip]) => <article key={name} className="weak-topic-row"><div className="weak-topic-heading"><h3>{name}</h3><span>{score}% confidence</span></div><ProgressBar value={score} color={score < 55 ? 'bg-amber-500' : 'bg-[#3479c5]'} /><p><strong>Recommended practice</strong>{tip}</p></article>)}</div>
    <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-500"><ArrowDownRight size={14} className="mt-px text-blue-600" />Start with data structures, then revisit mathematics when you have a short study block.</div>
  </div></PageWrap>
}

export function InterviewPrep() {
  const [subject, setSubject] = useState('Python')
  const [questions, setQuestions] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function generate(event) {
    event.preventDefault(); setBusy(true); setError('')
    try { const result = await generateInterviewQuestions(subject); setQuestions(result.questions) }
    catch (requestError) { setError(requestError.message) }
    finally { setBusy(false) }
  }
  return <PageWrap><div className="mx-auto max-w-[760px]"><form className="interview-form" onSubmit={generate}><label className="form-label" htmlFor="interview-subject">Subject<input id="interview-subject" className="field mt-1" value={subject} onChange={(event) => setSubject(event.target.value)} /></label><button className="btn-primary" disabled={busy || !subject.trim()}><Sparkles size={15} />{busy ? 'Generating...' : 'Generate questions'}</button></form>{error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}{questions && <section className="interview-result mt-5"><h2 className="section-title">Interview questions and answers</h2><p className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-600">{questions}</p></section>}</div></PageWrap>
}

const activity = [28, 49, 37, 70, 56, 88, 44]
export function Analytics() {
  return <PageWrap><div className="mb-5 flex justify-end"><select className="field w-auto"><option>This week</option><option>This month</option><option>This year</option></select></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Study time" value="8h 25m" note="+12% from last week" icon={Clock3} /><StatCard label="Questions solved" value="146" note="Across 5 subjects" icon={CheckCircle2} /><StatCard label="Quiz performance" value="82%" note="+4 points this week" icon={Activity} /><StatCard label="Active days" value="6 / 7" note="One more to your record" icon={CalendarDays} /></div>
    <div className="analytics-panels mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><section className="surface analytics-panel"><div className="flex items-start justify-between"><div><h2 className="section-title">Weekly activity</h2><p className="mt-1 text-[11px] text-slate-400">Study minutes per day</p></div><span className="text-[11px] text-slate-500">5.8 hrs total</span></div><div className="mt-4 flex h-44 items-end gap-2 sm:gap-4">{activity.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-9 rounded-t bg-[#8eb8e4]" style={{ height: `${value}%` }} title={`${value} minutes`} /><span className="text-[9px] text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span></div>)}</div></section>
    <section className="surface analytics-panel"><h2 className="section-title">Subject progress</h2><p className="mt-1 text-[11px] text-slate-400">Recent learning activity</p><div className="mt-4 space-y-4">{[['Computer Science', 76], ['Biology', 63], ['Mathematics', 52], ['Machine Learning', 38]].map(([name, value]) => <div key={name}><div className="mb-2 flex justify-between gap-3 text-[11px]"><span className="font-medium text-slate-600">{name}</span><span className="w-9 shrink-0 text-right text-slate-400">{value}%</span></div><ProgressBar value={value} /></div>)}</div></section></div>
    <div className="mt-5 flex items-center gap-3 rounded-md border border-emerald-100 bg-emerald-50/50 p-4"><Activity size={17} className="text-emerald-700" /><div><div className="text-xs font-semibold text-slate-700">Nice progress this week</div><p className="mt-1 text-[11px] text-slate-500">You studied on 6 days and spent more time on your focus topics.</p></div></div>
  </PageWrap>
}

export function Settings({ dark, setDark }) {
  const [toggles, setToggles] = useState({ email: true, reminders: true, personalization: false })
  const toggle = (key) => setToggles({ ...toggles, [key]: !toggles[key] })
  return <PageWrap className="settings-wrap"><div className="settings-page mx-auto max-w-[760px]">
    <SettingsGroup title="Profile" description="Your account details"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4ebf3] text-xs font-bold text-slate-700">AS</div><div><div className="text-xs font-semibold text-slate-700">Alex Student</div><div className="mt-1 text-[11px] text-slate-400">alex.student@example.com</div></div><button className="btn-secondary ml-auto">Edit profile</button></div></SettingsGroup>
    <SettingsGroup title="Appearance" description="Choose how your workspace looks"><SettingRow label="Theme" detail="Switch between light and dark appearance"><button className={`toggle ${dark ? 'on' : ''}`} role="switch" aria-checked={dark} aria-label="Dark theme" onClick={() => setDark(!dark)}><span /></button></SettingRow></SettingsGroup>
    <SettingsGroup title="AI Preferences" description="Set how your assistant supports your learning"><SettingRow label="Personalized explanations" detail="Adapt explanations to your study history"><button className={`toggle ${toggles.personalization ? 'on' : ''}`} role="switch" aria-checked={toggles.personalization} onClick={() => toggle('personalization')}><span /></button></SettingRow><SettingRow label="Answer style" detail="Preferred response detail"><select className="field w-auto"><option>Balanced</option><option>Concise</option><option>Detailed</option></select></SettingRow></SettingsGroup>
    <SettingsGroup title="Notifications" description="Decide which reminders you receive"><SettingRow label="Study reminders" detail="A gentle nudge for your planned study sessions"><button className={`toggle ${toggles.reminders ? 'on' : ''}`} role="switch" aria-checked={toggles.reminders} onClick={() => toggle('reminders')}><span /></button></SettingRow><SettingRow label="Email updates" detail="Weekly activity and learning summaries"><button className={`toggle ${toggles.email ? 'on' : ''}`} role="switch" aria-checked={toggles.email} onClick={() => toggle('email')}><span /></button></SettingRow></SettingsGroup>
    <SettingsGroup title="Data & Privacy" description="Manage your learning data"><SettingRow label="Study data" detail="Your notes and activity are stored in this workspace"><button className="text-xs font-semibold text-blue-700">Manage data</button></SettingRow></SettingsGroup>
  </div></PageWrap>
}

function SettingsGroup({ title, description, children }) { return <section className="settings-group"><h2>{title}</h2><p>{description}</p><div>{children}</div></section> }
function SettingRow({ label, detail, children }) { return <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"><div className="flex-1"><div className="text-xs font-medium text-slate-700">{label}</div><div className="mt-1 text-[10px] text-slate-400">{detail}</div></div>{children}</div> }
function Modal({ title, onClose, children }) { return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal-box" role="dialog" aria-modal="true" aria-label={title}><header className="mb-4 flex items-center justify-between"><h2 className="section-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={17} /></button></header>{children}</section></div> }
