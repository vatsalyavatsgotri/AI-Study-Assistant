"""Local AI service using Ollama."""

import json
import re
import urllib.error
import urllib.request
from typing import Any


# Ollama configuration
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL_NAME = "qwen2.5:1.5b"


class AIServiceError(RuntimeError):
    """Safe-to-display AI service error."""


class AIConfigurationError(AIServiceError):
    """Ollama configuration error."""


class AIQuotaError(AIServiceError):
    """Kept for compatibility with the existing API."""


def ollama_available() -> bool:
    """Check whether Ollama is running."""
    try:
        request = urllib.request.Request(
            "http://127.0.0.1:11434/api/tags",
            method="GET",
        )

        with urllib.request.urlopen(request, timeout=3) as response:
            return response.status == 200

    except Exception:
        return False


def generate_text(prompt: str) -> str:
    """Generate text using the local Ollama model."""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
        },
    }

    data = json.dumps(payload).encode("utf-8")

    request = urllib.request.Request(
        OLLAMA_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            raw_response = response.read().decode("utf-8")

        result = json.loads(raw_response)

        text = result.get("response", "")

        if not text or not text.strip():
            raise AIServiceError("Ollama returned an empty response.")

        return text.strip()

    except urllib.error.URLError as error:
        raise AIConfigurationError(
            "Ollama is not running. Start Ollama and try again."
        ) from error

    except json.JSONDecodeError as error:
        raise AIServiceError(
            "Ollama returned an invalid response."
        ) from error

    except Exception as error:
        if isinstance(error, AIServiceError):
            raise

        raise AIServiceError(
            f"Local AI request failed ({type(error).__name__})."
        ) from error


def answer_question(
    message: str,
    history: list[dict[str, str] | str] | None = None,
) -> str:

    recent_history = (history or [])[-12:]

    formatted_history = []

    for item in recent_history:

        if isinstance(item, str):
            formatted_history.append(item)

        elif (
            item.get("role") in {"user", "assistant"}
            and item.get("content")
        ):
            formatted_history.append(
                f"{item['role'].capitalize()}: {item['content']}"
            )

    context = "\n".join(formatted_history)

    return generate_text(
        f"""
You are an expert AI Study Assistant.

Your job is to:
- Explain concepts clearly.
- Help students learn.
- Give accurate and practical answers.
- Use simple English unless the user asks for another language.
- For coding questions, provide working code and explain it.
- Do not unnecessarily make answers complicated.

Previous conversation:
{context or "(No previous messages)"}

User question:
{message}
"""
    )


def explain_code_text(
    code: str,
    language: str = "python",
) -> str:

    return generate_text(
        f"""
Explain the following {language} code.

Requirements:
1. Explain what the code does.
2. Explain important lines.
3. Mention mistakes if any.
4. Keep the explanation beginner-friendly.

Code:
{code}
"""
    )


def debug_error_text(error: str) -> str:

    return generate_text(
        f"""
You are a programming debugging assistant.

Analyze this error:

{error}

Provide:
1. What the error means.
2. Why it happened.
3. The exact fix.
4. Corrected code when possible.

Keep the explanation simple.
"""
    )


def generate_code_text(
    prompt: str,
    language: str = "python",
) -> str:

    return generate_text(
        f"""
Generate working {language} code for the following requirement:

{prompt}

Requirements:
- Give complete code.
- Keep it beginner-friendly.
- Add comments where useful.
- Do not omit important parts.
"""
    )


def summarize_notes_text(notes: str) -> str:

    return generate_text(
        f"""
You are an AI Study Assistant.

Read these study notes and provide:

1. Short summary
2. Important points
3. Important definitions
4. Topics to revise
5. Possible exam questions

Study notes:
{notes}
"""
    )


def _json_array(
    response_text: str,
    field_name: str,
) -> list[dict[str, Any]]:

    candidate = response_text.strip()

    # Remove markdown code fences
    candidate = re.sub(
        r"^```(?:json)?\s*",
        "",
        candidate,
        flags=re.IGNORECASE,
    )

    candidate = re.sub(
        r"\s*```$",
        "",
        candidate,
        flags=re.IGNORECASE,
    )

    start = candidate.find("[")
    end = candidate.rfind("]")

    if start < 0 or end <= start:
        raise AIServiceError(
            f"Local AI returned an invalid {field_name} format."
        )

    try:
        values = json.loads(candidate[start:end + 1])

    except json.JSONDecodeError as error:
        raise AIServiceError(
            f"Local AI returned an invalid {field_name} format."
        ) from error

    if not isinstance(values, list):
        raise AIServiceError(
            f"Local AI returned an invalid {field_name} format."
        )

    if not all(isinstance(value, dict) for value in values):
        raise AIServiceError(
            f"Local AI returned an invalid {field_name} format."
        )

    return values


def generate_quiz_text(
    notes: str = "",
    count: int = 5,
    subject: str = "",
    topic: str = "",
    difficulty: str = "Medium",
    question_type: str = "MCQ",
) -> str:

    if question_type == "True/False":

        format_instructions = """
Each question must have exactly two options:
["True", "False"]
"""

    elif question_type == "Mixed":

        format_instructions = """
Mix MCQ and True/False questions.

For each question include:
"type": "MCQ"
or
"type": "True/False"

MCQ questions must have exactly four options.
True/False questions must have exactly two options.
"""

    else:

        format_instructions = """
Each question must be an MCQ with exactly four options.
"""

    return generate_text(
        f"""
You are an AI quiz generator.

Create exactly {count} quiz questions.

Subject:
{subject or "Not specified"}

Topic:
{topic or "Not specified"}

Difficulty:
{difficulty}

Question type:
{question_type}

{format_instructions}

IMPORTANT:
Return ONLY valid JSON.
Do not write explanations.
Do not use markdown.
Do not add text before or after the JSON.

JSON format:

[
  {{
    "type": "MCQ",
    "question": "Question here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }}
]

The answer field must contain the zero-based index
of the correct option.

Study notes:
{notes or "(No notes provided. Use the subject and topic.)"}
"""
    )


def generate_quiz(
    notes: str = "",
    count: int = 5,
    subject: str = "",
    topic: str = "",
    difficulty: str = "Medium",
    question_type: str = "MCQ",
) -> list[dict[str, Any]]:

    items = _json_array(
        generate_quiz_text(
            notes,
            count,
            subject,
            topic,
            difficulty,
            question_type,
        ),
        "quiz",
    )

    normalized = []

    for item in items[:count]:

        question = item.get("question")
        options = item.get("options")
        answer = item.get("answer")

        generated_type = item.get(
            "type",
            question_type,
        )

        if question_type == "Mixed":

            valid_type = generated_type in {
                "MCQ",
                "True/False",
            }

        else:

            valid_type = generated_type == question_type

        expected_options = (
            2
            if generated_type == "True/False"
            else 4
        )

        if (
            isinstance(question, str)
            and question.strip()
            and isinstance(options, list)
            and len(options) == expected_options
            and all(
                isinstance(option, str)
                and option.strip()
                for option in options
            )
            and valid_type
        ):

            normalized_item = {
                "question": question,
                "options": options,
                "type": generated_type,
            }

            if (
                isinstance(answer, int)
                and not isinstance(answer, bool)
                and 0 <= answer < len(options)
            ):

                normalized_item["answer"] = answer

            normalized.append(normalized_item)

    if len(normalized) < count:

        raise AIServiceError(
            f"Local AI returned "
            f"{len(normalized)} usable questions; "
            f"{count} were requested."
        )

    return normalized[:count]


def generate_flashcards_text(
    notes: str,
    count: int = 10,
) -> str:

    return generate_text(
        f"""
You are an AI Study Assistant.

Create exactly {count} useful flashcards from these notes.

Return ONLY valid JSON.

Format:

[
  {{
    "front": "Question or concept",
    "back": "Answer or explanation"
  }}
]

Do not add markdown or explanations.

Notes:
{notes}
"""
    )


def generate_flashcards(
    notes: str,
    count: int = 10,
) -> list[dict[str, str]]:

    items = _json_array(
        generate_flashcards_text(notes, count),
        "flashcards",
    )

    normalized = [
        {
            "front": item["front"],
            "back": item["back"],
        }
        for item in items[:count]
        if isinstance(item.get("front"), str)
        and isinstance(item.get("back"), str)
    ]

    if not normalized:

        raise AIServiceError(
            "Local AI did not return usable flashcards."
        )

    return normalized


def study_plan_text(
    subject: str,
    days: int = 7,
    hours_per_day: float = 2,
) -> str:

    return generate_text(
        f"""
You are an expert study planner.

Create a day-wise study plan.

Subject:
{subject}

Exam in:
{days} days

Daily study time:
{hours_per_day} hours

For each day include:

- Topics to study
- Revision
- Practice
- Tips

Keep the plan realistic and easy to follow.
"""
    )


def weak_topics_text(notes: str) -> str:

    return generate_text(
        f"""
You are an AI Study Mentor.

Analyze these study notes and identify:

1. Topics covered
2. Topics that may need more practice
3. Important concepts to revise
4. Suggestions for improvement

Study notes:
{notes}
"""
    )


def interview_questions_text(subject: str) -> str:

    return generate_text(
        f"""
You are an interview preparation expert.

Generate:

1. Top 10 interview questions
2. Short answers
3. Important interview tips

Subject:
{subject}
"""
    )


def analyze_file_text(
    filename: str,
    content: str,
) -> str:

    return generate_text(
        f"""
Analyze this study file.

Filename:
{filename}

Provide:

1. Main ideas
2. Important concepts
3. Important facts
4. Possible errors or unclear sections
5. What the student should revise

File content:
{content}
"""
    )