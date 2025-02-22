from bson import ObjectId
from dotenv import load_dotenv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import numpy as np

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

# helper function for weight vector
def get_weight_vector():
  all_questions = questions_collection.find(
      {"prefq_number": {"$ne": None}, "cleaning": {"$exists": False}},
      {"possible_answers": 1, "question_number": 1}
  )
  all_questions = list(all_questions)
  weight_vector = np.zeros(len(all_questions))
  for i, question in enumerate(all_questions):
    possible_answers = question.get("possible_answers", [])
    if possible_answers:
        weight_vector[i] = 5 / len(possible_answers)

  total_score = len(weight_vector) * 5

  return weight_vector, total_score

def calculate_directional_scores(user1, user2):
  # Calculate scores for user1 based on user2's answers and vice versa
  weight_vector, total_score = get_weight_vector()

  user1_answers = list(qa_collection.aggregate([
     {"$match": {"user_id": ObjectId(user1)}},
     {"$sort": {"question_number": -1}}
  ]))

  user1_prefs = list(qa_pref_collection.aggregate([
     {"$match": {"user_id": ObjectId(user1)}},
     {"$sort": {"question_number": -1}}
  ]))

  user2_answers = list(qa_collection.aggregate([
     {"$match": {"user_id": ObjectId(user2)}},
     {"$sort": {"question_number": -1}}
  ]))

  user2_prefs = list(qa_pref_collection.aggregate([
     {"$match": {"user_id": ObjectId(user2)}},
     {"$sort": {"question_number": -1}}
  ]))

  # Calculate scores for user1 based on user2's answers and vice versa
  u1 = np.array([Q["encoding"] for Q in user1_answers])
  u2 = np.array([Q["encoding"] for Q in user1_prefs])
  v1 = np.array([Q["encoding"] for Q in user2_answers])
  v2 = np.array([Q["encoding"] for Q in user2_prefs])

  result1 = np.sum(np.abs(u2-v1) * weight_vector / total_score * 100)
  result2 = np.sum(np.abs(u1-v2) * weight_vector / total_score * 100)

  return result1, result2
  
def find_matches(user_id):

  user_profile = profiles.find_one({"user_id": ObjectId(user_id)})
  questions_answeres = list(qa_collection.find({"user_id": ObjectId(user_id)}))
  questions_prefs = list(qa_pref_collection.find({"user_id": ObjectId(user_id)}))

  gender_pref = questions_prefs


  
  
    



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
    questions = list(questions_collection.find({}, {"_id": 0}).sort("question_number", 1))

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