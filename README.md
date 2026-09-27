AI Study Assistant

Overview

AI Study Assistant is a Python-based command-line application powered by the Google Gemini API. It helps students learn faster by generating summaries, quizzes, flashcards, interview questions, study plans, and coding assistance.

---

Features

- Ask Coding Questions
- Explain Code
- Debug Errors
- Generate Code
- Analyze Python Files
- Summarize Study Notes
- Generate Quiz
- Create Flashcards
- Generate Study Plan
- Identify Weak Topics
- Generate Interview Questions
- Save Conversation History
- Export Markdown Report
- Show Session Statistics

---

Technologies Used

- Python 3.13
- Google Gemini API
- python-dotenv
- Pillow

---

Installation

pip install -r requirements.txt

Create a ".env" file:

GEMINI_API_KEY=YOUR_API_KEY

Run the project:

python main.py

Web interface

Install the frontend dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Start the FastAPI backend in a second terminal:

```sh
cd backend
python -m pip install -r requirements.txt
```

Create `backend/.env` from `backend/.env.example` and set your Gemini key there, then run:

```sh
python -m uvicorn app:app --reload --port 8000
```

Set `VITE_API_URL=http://127.0.0.1:8000` in the frontend `.env` file (the root `.env.example` has this development value). The frontend API client is in `src/services/api.js`. Keep both `.env` files local; the Gemini key is read only by Python.

---

Project Structure

main.py
README.md
requirements.txt
sample_notes.txt
.gitignore
backend/
	app.py
	requirements.txt
	services/ai_service.py
	.env.example
src/
	App.jsx
	components/
	pages/
	services/api.js

---

Future Improvements

- PDF Reader
- Voice Assistant
- Text-to-Speech
- Progress Dashboard

---

Author

Developed by Vatsalya

GitHub:
https://github.com/vatsalyavatsgotri

---

⭐ If you found this project useful, please consider giving it a star on GitHub.
