# AI Study Assistant

An AI-powered web-based study companion that brings learning, revision,
coding help, and study utilities into one workspace.

The project has evolved from a Python-based AI study assistant into a
React + FastAPI web application. The web interface uses AI Chat as the
main page and provides dedicated study tools through the sidebar.

## Features

### AI Chat

-   Ask academic questions and doubts
-   Get AI-powered explanations
-   Start new conversations
-   Use quick study actions from the chat interface

### Study Tools

-   **Notes** -- create, view, edit, and delete personal notes
-   **Quiz** -- generate and practice quizzes
-   **Flashcards** -- quick revision using question-and-answer cards
-   **Study Planner** -- organize study sessions
-   **Interview Prep** -- prepare interview questions
-   **Code Assistant** -- coding assistance, explanations, and debugging
-   **File Analyzer** -- work with study/code files
-   **Weak Topics** -- identify areas that need more practice
-   **Study Analytics** -- view learning activity and progress
    information

### Settings

-   Edit profile information
-   Profile name and initials synchronization
-   Theme preferences
-   AI response preferences
-   Notification preferences

## Application Flow

``` text
Student
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

AI Chat is the main/default page of the application. There is no
separate Home dashboard.

## Technology Stack

### Frontend

-   React
-   Vite
-   JavaScript
-   Tailwind CSS
-   React Router
-   Lucide React

### Backend

-   Python
-   FastAPI
-   Uvicorn
-   python-dotenv

### AI

-   Google Gemini API
-   AI service handled on the backend

## Project Structure

``` text
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
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── requirements.txt
├── sample_notes.txt
├── .env.example
├── .gitignore
└── README.md
```

## Requirements

Before running the project, install:

-   Python 3.13+ (or the Python version required by the current backend
    environment)
-   Node.js and npm
-   A Google Gemini API key for AI functionality

## Installation

### 1. Clone the repository

``` bash
git clone https://github.com/vatsalyavatsgotri/AI-Study-Assistant.git
cd AI-Study-Assistant
```

### 2. Install frontend dependencies

From the project root:

``` bash
npm install
```

### 3. Install backend dependencies

``` bash
cd backend
python -m pip install -r requirements.txt
```

## Environment Configuration

### Backend

Create:

``` text
backend/.env
```

Add your Gemini API key:

``` env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Never commit the real API key to GitHub.

### Frontend

Create a root `.env` file if it does not already exist:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend uses this value to communicate with the FastAPI backend.

## Run the Application

You need two terminals for local development.

### Terminal 1 -- Backend

From the project root:

``` bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

Backend:

``` text
http://127.0.0.1:8000
```

### Terminal 2 -- Frontend

From the project root:

``` bash
npm run dev
```

The Vite development server will display the local frontend URL in the
terminal, normally:

``` text
http://localhost:5173
```

Open the frontend URL in your browser.

## API Configuration

The frontend API client is located at:

``` text
src/services/api.js
```

The API base URL is controlled through:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

The Gemini API key stays on the backend and should never be placed in
React/Vite client-side code.

## Notes and Local Data

Some user-specific interface data can be stored locally when a backend
database is not yet connected.

This may include items such as: - Personal notes - Profile preferences -
Local application settings

Local browser storage is device/browser-specific. It should not be
treated as cloud synchronization between devices.

## Security

-   Never commit `.env` files containing secrets.
-   Never expose `GEMINI_API_KEY` in frontend code.
-   Keep AI credentials on the backend.
-   Use `.env.example` files for configuration templates.
-   Review `.gitignore` before pushing changes to GitHub.

## Production Deployment

For a public deployment, the frontend and backend must both be hosted.

A typical architecture is:

``` text
Public Website
      ↓
React/Vite Frontend
      ↓
Hosted FastAPI Backend
      ↓
Gemini API
```

For production:

1.  Deploy the frontend to a web hosting platform.
2.  Deploy the FastAPI backend to a server/cloud platform.
3.  Add `GEMINI_API_KEY` to the backend's environment variables.
4.  Change `VITE_API_URL` to the deployed backend URL.
5.  Configure FastAPI CORS to allow the deployed frontend domain.
6.  Never put the Gemini API key in the frontend.

## Current Development Status

The project currently provides a web-based AI Study Assistant interface
with AI Chat and multiple study tools.

Some advanced functionality, such as fully database-backed user accounts
and production-grade analytics, can be expanded as the project develops.

The application should not be considered production-ready until
authentication, persistent cloud storage, deployment configuration,
security hardening, and complete real-user analytics are implemented and
tested.

## Future Improvements

Possible future improvements include:

-   Real user authentication
-   Cloud/database-backed notes and user data
-   Real study analytics based on actual user activity
-   PDF and document understanding
-   Voice-based learning assistant
-   Text-to-speech
-   Multilingual learning support
-   Mobile application
-   Production deployment
-   Advanced personalization

## Author

**Vatsalya Vatsgotri**

GitHub:

https://github.com/vatsalyavatsgotri

Repository:

https://github.com/vatsalyavatsgotri/AI-Study-Assistant

------------------------------------------------------------------------

⭐ If you find this project useful, consider giving it a star on GitHub.
