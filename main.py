"""
=========================================
AI Study Assistant Agent

Developed Using:
- Python
- Google Gemini API

Features:
- Ask Questions
- Explain Concepts
- Generate Code
- Debug Errors
- Analyze Files
- Notes Summary
- Quiz Generator
- Flashcards
- Study Planner
- Weak Topic Analysis
- Interview Questions
- History
- Export Report
- Session Statistics

=========================================
"""

from backend.services.ai_service import (
    answer_question as ai_answer_question,
    analyze_file_text as ai_analyze_file_text,
    debug_error_text as ai_debug_error_text,
    explain_code_text as ai_explain_code_text,
    generate_code_text as ai_generate_code_text,
    generate_flashcards_text as ai_generate_flashcards_text,
    generate_quiz_text as ai_generate_quiz_text,
    interview_questions_text as ai_interview_questions_text,
    study_plan_text as ai_study_plan_text,
    summarize_notes_text as ai_summarize_notes_text,
    weak_topics_text as ai_weak_topics_text,
)

history = []

question_count = 0
file_count = 0
code_count = 0

# Ask questions to the AI assistant

def ask_question():
    global question_count
    question_count += 1

    question = input("Ask your coding question: ")

    try:
        response = ai_answer_question(question, history[-6:])
        print("\nAI:", response)
        history.append(f"Q: {question}")
        history.append(f"A: {response}")

    except Exception as e:
        print(f"Error: {e}")


# Explain source code line by line using AI

def explain_code():
    code = input("Paste your code:\n")
    response = ai_explain_code_text(code)
    print("\nAI:", response)
    history.append(f"Explain Code: {code}")
    history.append(f"AI: {response}")


# Analyze programming errors and suggest fixes

def debug_error():
    error = input("Paste the error message:\n")
    response = ai_debug_error_text(error)
    print("\nAI:", response)
    history.append(f"Error: {error}")
    history.append(f"AI: {response}")


# Generate code bosed on the user's requirements

def generate_code():
    global code_count
    code_count += 1

    prompt = input("What code do you want?\n")
    response = ai_generate_code_text(prompt)
    print("\nAI:", response)
    history.append(f"Generate Code: {prompt}")
    history.append(f"AI: {response}")


# Analyze a file and provide AI insights

def analyze_file():
    global file_count
    file_count += 1

    filename = input("Enter file name (example: test.py): ")

    try:
        with open(filename, "r", encoding="utf-8") as file:
            code = file.read()

        print("\n===== File Content =====")
        print(code)

        response = ai_analyze_file_text(filename, code)

        print("\n===== AI Analysis =====")
        print(response)
        history.append(f"Analyzed File: {filename}")
        history.append(f"AI: {response}")

    except FileNotFoundError:
        print("File not found. Check the file name.")


# Read study notes and generate anAI summary

def summarize_notes():
    import os

    filename = input("Enter notes file name: ")

    try:

        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir,filename)
        with open(file_path, "r", encoding="utf-8") as file:
           notes = file.read()


        response = ai_summarize_notes_text(notes)

        print("\n===== Study Summary =====\n")
        print(response)

    except FileNotFoundError:
        print("File not found.") 


# Generate multi-choice quiz from study notes

def generate_quiz():
    filename = input("Enter notes file name: ")

    try:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, filename)

        with open(file_path, "r", encoding="utf-8") as file:
             notes = file.read()

        response = ai_generate_quiz_text(notes, 5)

        print("\n===== Quiz =====\n")
        print(response)

        history.append("Generated Quiz")
        history.append(response)

    except FileNotFoundError:
       print("File not found.") 


# Create AI flashcards for quick revision

def generate_flashcards():
    import os

    filename = input("Enter notes file name: ")

    try:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, filename)

        with open(file_path, "r", encoding="utf-8") as file:
            notes = file.read()

        response = ai_generate_flashcards_text(notes, 10)

        print("\n===== Flashcards =====\n")
        print(response)

        history.append("Generated Flashcards")
        history.append(response)

    except FileNotFoundError:
        print("File not found.")


# Generate a personalized study plan

def study_planner():

    subject = input("Enter subject: ")
    days = input("Days left for exam: ")
    hours = input("Study hours per day: ")

    try:
        response = ai_study_plan_text(subject, int(days), float(hours))
    except ValueError:
        print("Days and study hours must be numbers.")
        return

    print("\n===== Study Plan =====\n")
    print(response)

    history.append("Generated Study Plan")
    history.append(response)


# Identify weak topics and suggest improvements

def weak_topic_identifier():
    import os

    filename = input("Enter notes file name: ")

    try:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, filename)

        with open(file_path, "r", encoding="utf-8") as file:
            notes = file.read()

        response = ai_weak_topics_text(notes)

        print("\n===== Weak Topic Analysis =====\n")
        print(response)

        history.append("Weak Topic Analysis")
        history.append(response)

    except FileNotFoundError:
        print("File not found.")


# Generate interview questions and answers

def interview_questions():

    subject = input("Enter subject: ")

    response = ai_interview_questions_text(subject)

    print("\n===== Interview Questions =====\n")
    print(response)

    history.append("Interview Questions")
    history.append(response)



# Save conversation history to a text file

def save_history():
    with open("history.txt", "w", encoding="utf-8") as file:
        for item in history:
            file.write(item + "\n")

    print("History saved to history.txt")


# Export the complete report in markdown format

def export_report():
    with open("report.md", "w", encoding="utf-8") as file:
        file.write("# AI Study Assistant Report\n\n")
        file.write("## Session Report\n\n")
        file.write("Generated by AI Study Assistant Agent\n\n")
        file.write("---\n\n")
        file.write("## Activity History\n\n")

        for item in history:
            file.write(item + "\n\n")

    print("Report saved as report.md")


# Display session statistics

def show_stats():
    print("\n===== Session Statistics =====")
    print("Questions Asked :", question_count)
    print("Files Analyzed  :", file_count)
    print("Code Generated  :", code_count)



while True:
    print("\n===== AI Coding Assistant =====")
    print("1. Ask Coding Question")
    print("2. Explain Code")
    print("3. Debug Error")
    print("4. Generate Code")
    print("5. Analyze File")
    print("6.Summarize Notes")
    print("7.Generate Quiz")
    print("8.Generate Flashcards")
    print("9.Study Planner")
    print("10.Weak Topic Analysis")
    print("11.Interview Questions")
    print("12. Show History")
    print("13. Save History")
    print("14. Export Report")
    print("15. Show Statistics")
    print("16. Exit")

    choice = input("Enter your choice: ")

    if choice == "1":
        ask_question()

    elif choice == "2":
        explain_code()

    elif choice == "3":
        debug_error()

    elif choice == "4":
        generate_code()

    elif choice == "5":
        analyze_file()

    elif choice =="6":
        summarize_notes() 

    elif choice =="7":
        generate_quiz()

    elif choice =="8":
        generate_flashcards()

    elif choice =="9":
        study_planner()

    elif choice =="10":
        weak_topic_identifier()

    elif choice =="11":
        interview_questions()          

    elif choice == "12":
        for item in history:
            print(item)

    elif choice =="13":
        save_history()

    elif choice =="14":
        export_report()

    elif choice == "15":
        show_stats()

    elif choice == "16":
        print("Goodbye!")
        break    

    else:
        print("Invalid choice.")