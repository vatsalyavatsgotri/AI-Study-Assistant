"""Shared Gemini prompts for the CLI and HTTP API."""

import json
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
BACKEND_ENV_PATH = BACKEND_DIR / ".env"


def _load_backend_env() -> str:
    process_key = os.getenv("GEMINI_API_KEY", "").strip()
    load_dotenv(dotenv_path=BACKEND_ENV_PATH, override=not bool(process_key))
    return os.getenv("GEMINI_API_KEY", "").strip()


_load_backend_env()

MODEL_NAME = "gemini-2.5-flash"


def gemini_key_configured() -> bool:
    return bool(_load_backend_env())


class AIServiceError(RuntimeError):
    """A safe-to-display Gemini service error."""


class AIConfigurationError(AIServiceError):
    """The Gemini server configuration is missing."""


@lru_cache(maxsize=1)
def _get_model():
    api_key = _load_backend_env()
    if not api_key:
        raise AIConfigurationError("GEMINI_API_KEY is not configured on the backend.")
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel(MODEL_NAME)
    except Exception as error:
        raise AIServiceError("Gemini could not be initialized.") from error


def generate_text(prompt: str) -> str:
    try:
        response = _get_model().generate_content(prompt)
        text = getattr(response, "text", None)
    except Exception as error:
        raise AIServiceError("Gemini could not complete the request.") from error
    if not text or not text.strip():
        raise AIServiceError("Gemini returned an empty response.")
    return text.strip()


def answer_question(message: str, history: list[dict[str, str] | str] | None = None) -> str:
    recent_history = (history or [])[-12:]
    formatted_history = []
    for item in recent_history:
        if isinstance(item, str):
            formatted_history.append(item)
        elif item.get("role") in {"user", "assistant"} and item.get("content"):
            formatted_history.append(f"{item['role'].capitalize()}: {item['content']}")
    context = "\n".join(formatted_history)
    return generate_text(
        f"""You are an expert coding and study assistant. Explain concepts clearly and help the student learn.

Previous conversation:
{context or '(No previous messages)'}

User question:
{message}
"""
    )


def explain_code_text(code: str, language: str = "python") -> str:
    return generate_text(f"Explain this {language} code line by line:\n{code}")


def debug_error_text(error: str) -> str:
    return generate_text(f"Explain this error and provide a fix:\n{error}")


def generate_code_text(prompt: str, language: str = "python") -> str:
    return generate_text(f"Generate {language} code for:\n{prompt}")


def summarize_notes_text(notes: str) -> str:
    return generate_text(
        f"""You are an AI Study Assistant.
Read these study notes and:
1. Give a short summary.
2. Mention important points.
3. Suggest what to revise.

Notes:
{notes}
"""
    )


def _json_array(response_text: str, field_name: str) -> list[dict[str, Any]]:
    candidate = response_text.strip()
    candidate = re.sub(r"^```(?:json)?\s*|\s*```$", "", candidate, flags=re.IGNORECASE)
    start = candidate.find("[")
    end = candidate.rfind("]")
    if start < 0 or end <= start:
        raise AIServiceError(f"Gemini returned an invalid {field_name} format.")
    try:
        values = json.loads(candidate[start : end + 1])
    except json.JSONDecodeError as error:
        raise AIServiceError(f"Gemini returned an invalid {field_name} format.") from error
    if not isinstance(values, list) or not all(isinstance(value, dict) for value in values):
        raise AIServiceError(f"Gemini returned an invalid {field_name} format.")
    return values


def generate_quiz_text(notes: str, count: int = 5) -> str:
    return generate_text(
        f"""You are a quiz generator. Read the notes and create exactly {count} multiple-choice questions.
Each question must have four options and a zero-based integer answer index.
Return only a valid JSON array shaped like:
[{{"question":"...","options":["...","...","...","..."],"answer":0}}]

Notes:
{notes}
"""
    )


def generate_quiz(notes: str, count: int = 5) -> list[dict[str, Any]]:
    items = _json_array(generate_quiz_text(notes, count), "quiz")
    normalized = []
    for item in items[:count]:
        question = item.get("question")
        options = item.get("options")
        answer = item.get("answer")
        if isinstance(question, str) and isinstance(options, list) and len(options) >= 2:
            normalized.append({"question": question, "options": options, "answer": answer})
    if not normalized:
        raise AIServiceError("Gemini did not return usable quiz questions.")
    return normalized


def generate_flashcards_text(notes: str, count: int = 10) -> str:
    return generate_text(
        f"""You are an AI Study Assistant. Read the notes and create exactly {count} useful flashcards.
Return only a valid JSON array shaped like:
[{{"front":"Question or concept","back":"Answer or explanation"}}]

Notes:
{notes}
"""
    )


def generate_flashcards(notes: str, count: int = 10) -> list[dict[str, str]]:
    items = _json_array(generate_flashcards_text(notes, count), "flashcards")
    normalized = [
        {"front": item["front"], "back": item["back"]}
        for item in items[:count]
        if isinstance(item.get("front"), str) and isinstance(item.get("back"), str)
    ]
    if not normalized:
        raise AIServiceError("Gemini did not return usable flashcards.")
    return normalized


def study_plan_text(subject: str, days: int = 7, hours_per_day: float = 2) -> str:
    return generate_text(
        f"""You are an expert study planner. Create a day-wise study plan.

Subject: {subject}
Exam in: {days} days
Daily Study Time: {hours_per_day} hours

For each day include:
- Topics to study
- Revision
- Practice
- Tips

Keep the plan easy to follow.
"""
    )


def weak_topics_text(notes: str) -> str:
    return generate_text(
        f"""You are an AI Study Mentor. Read these study notes and identify:
1. Topics covered
2. Topics that may need more practice
3. Important concepts to revise
4. Suggestions for improvement

Notes:
{notes}
"""
    )


def interview_questions_text(subject: str) -> str:
    return generate_text(
        f"""You are an interview preparation expert. Generate:
1. Top 10 interview questions.
2. Short answers.
3. Important interview tips.

Subject:
{subject}
"""
    )


def analyze_file_text(filename: str, content: str) -> str:
    return generate_text(
        f"""Analyze this study file named {filename}:
1. Explain its main ideas.
2. Identify important concepts and facts.
3. Find possible errors or unclear sections when relevant.
4. Suggest what the student should revise.

File content:
{content}
"""
    )
