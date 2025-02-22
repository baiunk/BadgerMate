from dotenv import load_dotenv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)
db = client["Maddata"]
profiles = db["Profile"]
qa_collection = db["QA"]
qa_pref_collection = db["QA_Pref"]
questions_collection = db["Questions"]



# Matchability functions





# First api end point
@app.route("/api/new_user", methods=["POST"])
def new_user():
  data = request.get_json()
  required_fields = ["FName", "LName", "Email", "Major", "Age"]
  for field in required_fields:
    if field not in data:
      return jsonify({"error": f"Missing required field: {field}"}), 400
  data["top_10_matches"] = {}
  user_id = profiles.insert_one(data).inserted_id
  return jsonify({"user_id": str(user_id)}), 201
  
# Give all questions
@app.route("/api/get_all_questions", methods=["GET"])
def get_all_questions():
    """
    Retrieves all questions from the Questions collection.
    Groups each question with its preference counterpart if applicable.
    """

    # Fetch all questions and sort them by question_number
    questions = list(questions_collection.find({}).sort("question_number", 1))

    # Organize questions into pairs if they have prefq_number
    grouped_questions = []
    used_questions = set()  # Track questions that have been added

    for question in questions:
        if question["question_number"] in used_questions:
            continue  # Skip questions that are already paired

        prefq_number = question.get("prefq_number")

        if prefq_number:
            # Find the corresponding preference question
            pref_question = next((q for q in questions if q["question_number"] == prefq_number), None)

            if pref_question:
                grouped_questions.append({"question": question, "preference_question": pref_question})
                used_questions.add(prefq_number)  # Mark preference question as used
            else:
                grouped_questions.append({"question": question})  # No pref question found
        else:
            grouped_questions.append({"question": question})

        used_questions.add(question["question_number"])  # Mark main question as used

    return jsonify({"questions": grouped_questions}), 200


if __name__ == "__main__":
  app.run(debug=True, port=5000)