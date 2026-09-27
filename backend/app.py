"""FastAPI endpoints for the AI Study Assistant frontend."""

import os
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

try:
    from .services import ai_service
except ImportError:
    from services import ai_service


app = FastAPI(title="AI Study Assistant API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=20000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=20000)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=20)


class CodeRequest(BaseModel):
    code: str = Field(min_length=1, max_length=30000)
    language: str = Field(default="python", min_length=1, max_length=40)


class DebugRequest(BaseModel):
    error: str = Field(min_length=1, max_length=20000)


class GenerateCodeRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=20000)
    language: str = Field(default="python", min_length=1, max_length=40)


class NotesRequest(BaseModel):
    notes: str = Field(min_length=1, max_length=50000)


class CountedNotesRequest(NotesRequest):
    count: int = Field(default=5, ge=1, le=50)


class QuizRequest(BaseModel):
    notes: str = Field(default="", max_length=50000)
    subject: str = Field(min_length=1, max_length=300)
    topic: str = Field(min_length=1, max_length=500)
    difficulty: str = Field(default="Medium", pattern="^(Easy|Medium|Hard)$")
    count: int = Field(default=5, ge=1, le=30)
    question_type: str = Field(default="MCQ", pattern="^(MCQ|True/False|Mixed)$")


class FlashcardRequest(NotesRequest):
    count: int = Field(default=10, ge=1, le=50)


class StudyPlanRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=300)
    days: int = Field(default=7, ge=1, le=365)
    hours_per_day: float = Field(default=2, gt=0, le=24)


class InterviewRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=300)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request, _error):
    return JSONResponse(status_code=400, content={"detail": "Please provide valid request data."})


def run_ai(operation, *args):
    try:
        return operation(*args)
    except ai_service.AIConfigurationError as error:
        raise HTTPException(status_code=503, detail="AI service is not configured on the server.") from error
    except ai_service.AIQuotaError as error:
        raise HTTPException(status_code=429, detail=str(error)) from error
    except ai_service.AIServiceError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail="The AI request could not be completed.") from error


@app.get("/api/health")
async def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "local_ai": ai_service.ollama_available(),
    }


@app.post("/api/chat")
async def chat(payload: ChatRequest) -> dict[str, str]:
    history = [item.model_dump() for item in payload.history]
    return {"reply": run_ai(ai_service.answer_question, payload.message.strip(), history)}


@app.post("/api/explain-code")
async def explain_code(payload: CodeRequest) -> dict[str, str]:
    return {"reply": run_ai(ai_service.explain_code_text, payload.code, payload.language)}


@app.post("/api/debug")
async def debug(payload: DebugRequest) -> dict[str, str]:
    return {"reply": run_ai(ai_service.debug_error_text, payload.error)}


@app.post("/api/generate-code")
async def generate_code(payload: GenerateCodeRequest) -> dict[str, str]:
    return {"reply": run_ai(ai_service.generate_code_text, payload.prompt, payload.language)}


@app.post("/api/summarize")
async def summarize(payload: NotesRequest) -> dict[str, str]:
    return {"reply": run_ai(ai_service.summarize_notes_text, payload.notes)}


@app.post("/api/quiz")
async def quiz(payload: QuizRequest) -> dict[str, list[dict[str, Any]]]:
    return {
        "quiz": run_ai(
            ai_service.generate_quiz,
            payload.notes,
            payload.count,
            payload.subject,
            payload.topic,
            payload.difficulty,
            payload.question_type,
        )
    }


@app.post("/api/flashcards")
async def flashcards(payload: FlashcardRequest) -> dict[str, list[dict[str, str]]]:
    return {"flashcards": run_ai(ai_service.generate_flashcards, payload.notes, payload.count)}


@app.post("/api/study-plan")
async def study_plan(payload: StudyPlanRequest) -> dict[str, str]:
    return {
        "plan": run_ai(
            ai_service.study_plan_text,
            payload.subject,
            payload.days,
            payload.hours_per_day,
        )
    }


@app.post("/api/weak-topics")
async def weak_topics(payload: NotesRequest) -> dict[str, str]:
    return {"analysis": run_ai(ai_service.weak_topics_text, payload.notes)}


@app.post("/api/interview")
async def interview(payload: InterviewRequest) -> dict[str, str]:
    return {"questions": run_ai(ai_service.interview_questions_text, payload.subject)}


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)) -> dict[str, str]:
    filename = (file.filename or "").rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    supported_extensions = {".txt", ".py", ".md", ".csv"}
    extension = os.path.splitext(filename)[1].lower()
    if not filename or extension not in supported_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a TXT, PY, MD, or CSV file.",
        )
    content_bytes = await file.read(2_000_001)
    if len(content_bytes) > 2_000_000:
        raise HTTPException(status_code=400, detail="File is too large. Maximum size is 2 MB.")
    try:
        content = content_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise HTTPException(status_code=400, detail="File must contain UTF-8 text.") from error
    if not content.strip():
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    analysis = run_ai(ai_service.analyze_file_text, filename, content)
    return {"filename": filename, "content": content, "analysis": analysis}
