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

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
history = []

question_count = 0
file_count = 0
code_count = 0

API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# Ask questions to the AI assistant

def ask_question():
    global question_count
    question_count += 1

    question = input("Ask your coding question: ")

    context = "\n".join(history[-6:])

    try:
        response = model.generate_content(
            f"""
You are an expert coding assistant.

Previous conversation:
{context}

User question:
{question}
"""
        )

        if hasattr(response, "text"):
            print("\nAI:", response.text)
            history.append(f"Q: {question}")
            history.append(f"A: {response.text}")
        else:
            print("No response received from AI.")

    except Exception as e:
        print(f"Error: {e}")


# Explain source code line by line using AI

def explain_code():
    code = input("Paste your code:\n")
    response = model.generate_content(
        f"Explain this code line by line:\n{code}"
    )
    print("\nAI:", response.text)
    history.append(f"Explain Code: {code}")
    history.append(f"AI: {response.text}")


# Analyze programming errors and suggest fixes

def debug_error():
    error = input("Paste the error message:\n")
    response = model.generate_content(
        f"Explain this error and provide a fix:\n{error}"
    )
    print("\nAI:", response.text)
    history.append(f"Error: {error}")
    history.append(f"AI: {response.text}")


# Generate code bosed on the user's requirements

def generate_code():
    global code_count
    code_count += 1

    prompt = input("What code do you want?\n")
    response = model.generate_content(
        f"Generate code for:\n{prompt}"
    )
    print("\nAI:", response.text)
    history.append(f"Generate Code: {prompt}")
    history.append(f"AI: {response.text}")


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

        response = model.generate_content(
            f"""
            Analyze this code:
            1. Explain what it does.
            2. Find possible bugs.
            3. Suggest improvements.

            Code:
            
            {code}
            """
        )

        print("\n===== AI Analysis =====")
        print(response.text)
        history.append(f"Analyzed File: {filename}")
        history.append(f"AI: {response.text}")

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


        prompt = f"""
                 You are an AI Study Assistant.

                 Read these study notes and:

                   1. Give a short summary.
                   2. Mention important points.
                   3. Suggest what to revise.

     Notes:

     {notes}
     """

        response = model.generate_content(prompt)

        print("\n===== Study Summary =====\n")
        print(response.text)

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

        prompt = f"""
            You are a quiz generator.

            Read these notes and create:

            1. Five multiple choice questions.
            2. Four options for each question.
            3. Mention the correct answer after every question.

            Notes:
            {notes}
            """

        response = model.generate_content(prompt)

        print("\n===== Quiz =====\n")
        print(response.text)

        history.append("Generated Quiz")
        history.append(response.text)

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

        prompt = f"""
            You are an AI Study Assistant.
            Read these notes and create flashcards.
            Format:

            Q: Question
            A: Answer

            Create at least 10 flashcards.

            Notes:
            {notes}
            """

        response = model.generate_content(prompt)

        print("\n===== Flashcards =====\n")
        print(response.text)

        history.append("Generated Flashcards")
        history.append(response.text)

    except FileNotFoundError:
        print("File not found.")


# Generate a personalized study plan

def study_planner():

    subject = input("Enter subject: ")
    days = input("Days left for exam: ")
    hours = input("Study hours per day: ")

    prompt = f"""
        You are an expert study planner.

        Create a day-wise study plan.

        Subject: {subject}
        Exam in: {days} days
        Daily Study Time: {hours} hours

        For each day include:
        - Topics to study
        - Revision
        - Practice
        - Tips

        Keep the plan easy to follow.
        """

    response = model.generate_content(prompt)

    print("\n===== Study Plan =====\n")
    print(response.text)

    history.append("Generated Study Plan")
    history.append(response.text)     


# Identify weak topics and suggest improvements

def weak_topic_identifier():
    import os

    filename = input("Enter notes file name: ")

    try:
        base_dir = os.path.dirname(__file__)
        file_path = os.path.join(base_dir, filename)

        with open(file_path, "r", encoding="utf-8") as file:
            notes = file.read()

        prompt = f"""
            You are an AI Study Mentor.
            Read these study notes.
            Identify:

            1. Topics covered
            2. Topics that may need more practice
            3. Important concepts to revise
            4. Suggestions for improvement

            Notes:
            {notes}
            """

        response = model.generate_content(prompt)

        print("\n===== Weak Topic Analysis =====\n")
        print(response.text)

        history.append("Weak Topic Analysis")
        history.append(response.text)

    except FileNotFoundError:
        print("File not found.")


# Generate interview questions and answers

def interview_questions():

    subject = input("Enter subject: ")

    prompt = f"""
        You are an interview preparation expert.

        Generate:

        1. Top 10 interview questions.
        2. Short answers.
        3. Important interview tips.

        Subject:
        {subject}
        """

    response = model.generate_content(prompt)

    print("\n===== Interview Questions =====\n")
    print(response.text)

    history.append("Interview Questions")
    history.append(response.text)



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