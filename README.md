# AI Study Assistant

AI Study Assistant is a web-based learning companion designed to help students study, revise, practice, and get AI-powered assistance from one place.

The application uses a React frontend and a FastAPI backend, with the AI functionality connected through the project's AI service.

## Features

### AI Chat
- Ask study-related questions
- Get AI-powered explanations
- Start a new conversation
- Use quick actions for common study tasks
- AI Chat is the main/default page of the application

### Study Tools
- **Notes** – create, view, edit, and delete personal notes
- **Quiz** – generate and practice quizzes
- **Flashcards** – revise topics using question-and-answer cards
- **Study Planner** – organize study sessions
- **Interview Prep** – prepare interview questions
- **Code Assistant** – get coding help, explanations, and debugging assistance
- **File Analyzer** – analyze supported files
- **Weak Topics** – review topics that need more practice
- **Analytics** – view study-related activity and progress
- **Settings** – manage profile and study preferences

### Profile & Settings
- Edit profile name and email
- Automatically update profile initials
- Theme preference
- AI response preferences
- Notification preferences

## Main Application Flow

```text
User
  ↓
React Web Interface
  ↓
AI Chat / Study Tools
  ↓
FastAPI Backend
  ↓
AI Service
  ↓
AI Response
  ↓
React Interface
```

AI Chat is the primary page. The application does not use a separate Home dashboard.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Python
- FastAPI
- Uvicorn

### AI
- Ollama
- Local AI model through Ollama
- AI requests are handled through the backend AI service

## Project Structure

```text
AI-Study-Assistant/
│
├── backend/
│   ├── services/
│   │   └── ai_service.py
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   └── api.js
│   └── App.jsx
│
├── main.py
├── package.json
├── package-lock.json
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── requirements.txt
├── sample_notes.txt
├── .gitignore
└── README.md
```

## Requirements

Install the following before running the project:

- Node.js
- npm
- Python 3.13+
- Ollama

## Ollama Setup

Install Ollama on the computer where the backend will run.

After installing Ollama, make sure the Ollama service is running.

Check that Ollama is available:

```bash
ollama --version
```

Pull the AI model required by the project. Use the model configured in the current backend `ai_service.py`.

Example:

```bash
ollama pull <your-model-name>
```

Then make sure Ollama is running before using AI Chat.

> The exact model name should match the model configured in the project's backend. Do not use a different model unless the backend configuration is updated accordingly.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/vatsalyavatsgotri/AI-Study-Assistant.git
cd AI-Study-Assistant
```

### 2. Install frontend dependencies

From the project root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

## Environment Configuration

### Frontend

Create a root `.env` file if one does not already exist:

```env
VITE_API_URL=http://127.0.0.1:8000
```

This tells the React frontend where the FastAPI backend is running.

### Backend

Use the configuration provided by the project's current backend files.

Do not add API keys or secret values to the frontend.

If the backend uses environment variables, create the required `.env` file locally and keep it out of GitHub.

## Run the Application

Two terminals are normally required during local development.

### Terminal 1 – Ollama

Make sure Ollama is running.

If required by your Ollama installation, start the service using the normal Ollama command for your system.

### Terminal 2 – Backend

From the project root:

```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

### Terminal 3 – Frontend

From the project root:

```bash
npm run dev
```

Vite will display the frontend URL in the terminal, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

## Frontend API Configuration

The frontend API client is located at:

```text
src/services/api.js
```

The backend URL is configured using:

```env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend sends AI-related requests to the FastAPI backend rather than communicating directly with the AI service from the browser.

## Local Data

Features that are currently implemented with browser/local storage can be device- and browser-specific.

For example, locally stored application information may not automatically appear on another computer or browser.

Cloud synchronization and a complete database-backed user system can be added in future versions.

## Security

- Do not commit `.env` files containing secrets.
- Do not expose backend-only configuration in frontend code.
- Keep AI service configuration on the backend.
- Do not put private credentials into `VITE_*` variables.
- Review `.gitignore` before pushing changes to GitHub.

## Deployment

The current architecture is designed around a locally running Ollama service:

```text
User Browser
     ↓
React Frontend
     ↓
FastAPI Backend
     ↓
Ollama
     ↓
Local AI Model
```

Because Ollama is part of the AI runtime, simply deploying the React frontend does not make the AI functionality available to another person's computer.

For a public deployment, the backend and Ollama runtime must be hosted on a machine/server that is accessible to the deployed backend. The frontend's `VITE_API_URL` must then point to the deployed FastAPI backend.

## Current Status

The project currently provides a React-based AI Study Assistant with a FastAPI backend and Ollama-based AI integration.

The application includes an AI-first interface and multiple study tools for learning, revision, coding, and planning.

Some advanced features, such as complete cloud persistence, authentication, production analytics, and full public deployment infrastructure, can be expanded as development continues.

## Future Improvements

- Real user authentication
- Cloud/database-backed user data
- Real study analytics based on actual activity
- PDF and document understanding improvements
- Voice-based learning assistant
- Text-to-speech
- Multilingual learning support
- Mobile application
- Production deployment
- Advanced personalization

## Author

**Vatsalya Vatsgotri**

GitHub:

https://github.com/vatsalyavatsgotri

Repository:

https://github.com/vatsalyavatsgotri/AI-Study-Assistant

---

⭐ If you find this project useful, consider giving it a star on GitHub.

