import random
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
profiles_test = db["Profile_Test"]
qa_collection_test = db["QA_Test"]
qa_pref_collection_test = db["QA_Pref_Test"]



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

def calculate_directional_scores(user1: str, user2: str):
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
  
def find_matches(user_id: str):
  cleaning_questions = questions_collection.find(
      {"cleaning": {"$exists": True}},
      {"question_number": 1, "variable_name": 1, "data_type": 1, "cleaning": 1, "_id": 0}
  )

  cleaning_questions = list(cleaning_questions)
  cleaning_questions = [q["question_number"] for q in cleaning_questions]
  cleaning_answers = list(qa_collection.find({"user_id": ObjectId(user_id), "question_number": {"$in": cleaning_questions}}))
  cleaning_answers_pref = list(qa_pref_collection.find({"user_id": ObjectId(user_id), "question_number": {"$in": cleaning_questions}}))
  cleaning_answers = [answer["answer"] for answer in cleaning_answers]
  cleaning_answers_pref = [answer["answer"] for answer in cleaning_answers_pref]

  #going to be a list of answers checkboxes
  filtering_constraints = {}
  # ChatGPT improved the efficiency of this code
  for question, answer, answer_pref in zip(cleaning_questions, cleaning_answers, cleaning_answers_pref):
    var_name = question["variable_name"]
    constraints = question["cleaning"].split("_")
    if constraints[0] == "String":
        filtering_constraints[var_name] = answer if len(constraints) == 1 else answer_pref
    elif constraints[0] == "Integer":
        filtering_constraints[var_name] = {
            "$lte": (500 if len(constraints) == 1 else int(constraints[1])),
            "$gte": (int(answer) if len(constraints) == 1 else int(answer_pref))
        }
    elif constraints[0] == "List":
        filtering_constraints[var_name] = {"$in": answer if len(constraints) == 1 else answer_pref}

  #cleaning
  filtered_users = profiles.aggregate([
     {"$match": {filtering_constraints}},
     {"$project": {"_id": 1,}}
  ])

  filtered_users = [str(user["_id"]) for user in filtered_users]

  compatibility_scores = {}
  for user in filtered_users:
    score1, score2 = calculate_directional_scores(user_id, user["_id"])
    avg_score = (score1 + score2) / 2
    compatibility_scores[user] = avg_score

  sorted_matches = sorted(compatibility_scores.items(), key=lambda x: x[1], reverse=True)
  return sorted_matches


## Populate DB with dummy data
first_names = ["John", "Emma", "Sophia", "Liam", "Noah", "Aiden", "Olivia", "Ethan", "Mia", "James"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Miller", "Davis", "Garcia", "Rodriguez", "Anderson"]
genders = ["Male", "Female"]
majors = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Biology", "Physics", "Mathematics"]
locations = ["East", "West", "Campus", "South"]

def generate_random_user():
  first_name = random.choice(first_names)
  last_name = random.choice(last_names)
  major = random.choice(majors)
  age = random.randint(18, 25)
  email = f"{first_name.lower()}.{last_name.lower()}{random.randint(100, 999)}@wisc.edu"

  profiles_test.insert_one({
    "FName": first_name,
    "LName": last_name,
    "Email": email,
    "Major": major,
    "Age": age,
    "top_10_matches": {}
  })


# First api end point
@app.route('/')
def home():
    return jsonify({"message": "Backend is working!"})

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

# Add all answers to QA or QA_Pref
@app.route("/api/submit_all_answers", methods=["POST"])
def submit_all_answers():
    """
    Receives all answers at once from the website.
    Sorts answers into QA (main questions or standalone) or QA_Pref (preference questions).
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    user_id = data.get("user_id")

    # Fetch all questions and create a lookup dictionary
    all_questions = list(questions_collection.find({}, {"_id": 0, "variable_name": 1, "question_number": 1, "prefq_number": 1}))
    question_lookup = {q["variable_name"]: q for q in all_questions}

    qa_entries = []
    qa_pref_entries = []

    # Iterate over the provided answers
    for variable_name, answer in data.items():
        if variable_name not in question_lookup:
            continue  # Ignore invalid variables

        question_info = question_lookup[variable_name]
        question_number = question_info["question_number"]
        prefq_number = question_info.get("prefq_number")  # Can be null

        # If the question has a prefq_number (meaning it is a main question), add it to QA
        if prefq_number is not None:
            qa_entries.append({
                "user": user_id,
                "question_number": question_number,
                "variable_name": variable_name,
                "answer": answer
            })
        else:
            # If prefq_number is null, it is either a preference question or a standalone question
            corresponding_main_question = next((q for q in all_questions if q.get("prefq_number") == question_number), None)

            if corresponding_main_question:
                # This means it is a preference question, so add it to QA_Pref
                qa_pref_entries.append({
                    "user": user_id,
                    "question_number": question_number,
                    "variable_name": variable_name,
                    "answer": answer
                })
            else:
                # Otherwise, it's a standalone question (like Location or Budget), so add it to QA
                qa_entries.append({
                    "user": user_id,
                    "question_number": question_number,
                    "variable_name": variable_name,
                    "answer": answer
                })

    # Insert answers into respective collections
    if qa_entries:
        qa_collection.insert_many(qa_entries)

    if qa_pref_entries:
        qa_pref_collection.insert_many(qa_pref_entries)

    matches = find_matches(user_id)

    if matches:
      top_10_matches = dict(sorted(matches.items(), key=lambda item: item[1], reverse=True)[:10])
      profiles.update_one({"user_id": ObjectId(user_id)}, {"$set": {"top_10_matches": top_10_matches}})
      return jsonify({"matches": matches}), 200
    else:
      return jsonify({"error": "No matches found"}), 404
    
@app.route("/api/populate_db/<int:num_users>", methods=["POST"])
def populate_db(num_users):
  for _ in range(num_users):
    generate_random_user()
  return jsonify({"message": f"Populated the test collection with {num_users} users"}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 locally
    app.run(host="0.0.0.0", port=port, debug=True)