# AI Study Assistant

## Project Overview

AI Study Assistant is a student study workspace with a React web frontend and a Python FastAPI backend. The backend sends study and coding requests to Google Gemini and returns responses to the frontend. The Gemini API key stays on the server.

## Key Features

- **AI Chat:** Ask questions and continue a conversation with recent message history.
- **Explain Code:** Get line-by-line explanations for submitted code.
- **Debug Errors:** Submit an error message and request an explanation and fix.
- **Generate Code:** Describe a coding task and choose a language.
- **Notes Summary:** Summarize notes, identify key points, and get revision suggestions.
- **Quiz Generator:** Generate multiple-choice questions from notes.
- **Flashcards:** Generate question-and-answer cards from notes.
- **Study Planner:** Request a day-by-day plan for a subject and study schedule.
- **Weak Topic Analysis:** Analyze notes for topics to review and practice suggestions.
- **Interview Questions:** Generate interview questions, answers, and tips for a subject.
- **File Analyzer:** Upload UTF-8 text files (`.txt`, `.py`, `.md`, `.csv`) for AI analysis. The current upload limit is 2 MB.
- **Study Analytics:** View the study activity and subject-progress dashboard provided by the frontend.

AI-powered features require a running backend configured with a valid Gemini API key. Notes, planner tasks, and analytics are not connected to persistent storage in the current project.

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- React Markdown
- Lucide React
- FastAPI
- Python
- Google Gemini API (`google-generativeai`)
- `python-dotenv`

## System Architecture

```text
React Frontend → FastAPI Backend → Google Gemini API
```

The React app calls the FastAPI endpoints using `VITE_API_URL`. The backend loads `GEMINI_API_KEY` from its local environment and uses the shared Gemini service in `backend/services/ai_service.py`.

## Project Structure

```text
.
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       └── ai_service.py
├── src/
│   ├── components/
│   │   ├── ChatInput.jsx
│   │   ├── ChatMessage.jsx
│   │   ├── Shared.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Chat.jsx
│   │   └── Pages.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── requirements.txt
└── main.py
```

The root `main.py` is a retained command-line interface; the web application uses the FastAPI backend.

## Setup Instructions

Use two terminals from the project root.

**Backend** (first terminal):

```bash
cd backend
python -m pip install -r requirements.txt
```

Create `backend/.env` locally using `backend/.env.example` as a template, set `GEMINI_API_KEY` to your own key, then start FastAPI:

```bash
python -m uvicorn app:app --reload --port 8000
```

**Frontend** (second terminal, from the project root):

```bash
npm install
npm run dev
```

The frontend development server uses Vite's default port `5173`. The backend defaults to port `8000`.

## Environment Variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Root `.env` | FastAPI base URL. The development default is `http://127.0.0.1:8000`. |
| `GEMINI_API_KEY` | `backend/.env` | Server-side credential used by the Gemini service. Never put this in a frontend environment variable. |
| `CORS_ORIGINS` | `backend/.env` (optional) | Comma-separated frontend origins allowed by FastAPI. Defaults to the local Vite origins. |

Use the root `.env.example` for the frontend URL and `backend/.env.example` for backend settings. Keep actual `.env` files local and out of version control. Never use `VITE_GEMINI_API_KEY`.

## API Features

All endpoints below use `POST` and accept JSON unless noted. Successful text responses use the endpoint-specific fields shown below.

| Endpoint | Purpose | Response field |
| --- | --- | --- |
| `/api/chat` | Answer a study question with conversation history | `reply` |
| `/api/explain-code` | Explain submitted code | `reply` |
| `/api/debug` | Explain an error and suggest a fix | `reply` |
| `/api/generate-code` | Generate code from a prompt | `reply` |
| `/api/summarize` | Summarize study notes | `reply` |
| `/api/quiz` | Generate quiz questions from notes | `quiz` |
| `/api/flashcards` | Generate flashcards from notes | `flashcards` |
| `/api/study-plan` | Generate a study plan | `plan` |
| `/api/weak-topics` | Identify topics to review | `analysis` |
| `/api/interview` | Generate interview questions for a subject | `questions` |
| `/api/analyze-file` | Upload and analyze a supported text file (`multipart/form-data`) | `filename`, `content`, `analysis` |

`GET /api/health` reports backend status and whether the server has a Gemini key configured. It never returns the key.

## Security Notes

- Keep `GEMINI_API_KEY` in `backend/.env`; the browser must never receive it.
- Do not define `VITE_GEMINI_API_KEY`.
- Do not commit `.env` files. Commit only the placeholder `.env.example` files.
- The file analyzer accepts only `.txt`, `.py`, `.md`, and `.csv` UTF-8 files, with a 2 MB size limit. Uploaded file paths are not exposed to the frontend.

## Future Improvements

- Add persistent storage for notes, chat history, study plans, and analytics.
- Add PDF and other document extraction support.
- Add automated backend and frontend integration tests.
- Add production deployment configuration and monitoring.

## Author

Developed by Vatsalya.

[GitHub](https://github.com/vatsalyavatsgotri)
