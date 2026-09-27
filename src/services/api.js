const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new Error('Unable to connect to AI server. Please check that the backend is running.')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The AI server returned an invalid response.')
  }

  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : `Request failed (${response.status}).`
    throw new Error(detail)
  }
  return payload
}

function postJson(path, data) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function sendChatMessage(message, history = []) {
  return postJson('/api/chat', { message, history })
}

export function explainCode(code, language = 'python') {
  return postJson('/api/explain-code', { code, language })
}

export function debugError(error) {
  return postJson('/api/debug', { error })
}

export function generateCode(prompt, language = 'python') {
  return postJson('/api/generate-code', { prompt, language })
}

export function summarizeNotes(notes) {
  return postJson('/api/summarize', { notes })
}

export function generateQuiz(notes, count = 5) {
  return postJson('/api/quiz', { notes, count })
}

export function generateFlashcards(notes, count = 10) {
  return postJson('/api/flashcards', { notes, count })
}

export function generateStudyPlan(data) {
  return postJson('/api/study-plan', data)
}

export function identifyWeakTopics(notes) {
  return postJson('/api/weak-topics', { notes })
}

export function generateInterviewQuestions(subject) {
  return postJson('/api/interview', { subject })
}

export function analyzeFile(file) {
  const body = new FormData()
  body.append('file', file)
  return request('/api/analyze-file', { method: 'POST', body })
}

export const uploadFile = analyzeFile
export const generateSummary = summarizeNotes

export function analyzeCode(code, action = 'explain', language = 'python') {
  if (action === 'debug') return debugError(code)
  if (action === 'generate' || action === 'optimize') return generateCode(code, language)
  return explainCode(code, language)
}
