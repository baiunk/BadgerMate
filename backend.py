import random
from bson import ObjectId
from dotenv import load_dotenv
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import numpy as np
from itertools import chain

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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


# Encodings function
def generate_encodings():
    """
    Generates a dictionary mapping possible answers to their encodings
    based on the order they appear in the Questions collection.
    """
    questions_collection = db["Questions"]
    encoding_dict = {}

    # Fetch all questions that have possible answers
    questions = questions_collection.find({}, {"_id": 0, "possible_answers": 1})

    for question in questions:
        possible_answers = question.get("possible_answers", [])

        # Create encoding for each possible answer using index + 1
        for index, answer in enumerate(possible_answers):
            encoding_dict[answer] = index + 1  # Store as a flat key-value pair

    return encoding_dict

def encode_answer(answer, encoding_dict):
    """
    Encodes a single answer using the encoding dictionary.
    - If the answer is a list, replace each value with its encoding.
    - If the answer is a single value, replace it with its encoding.
    - If a value is not found in encoding_dict, it remains unchanged.
    """
    if isinstance(answer, list):
        return [encoding_dict.get(item, item) for item in answer]  # Encode each item in the list
    else:
        return encoding_dict.get(answer, answer)  # Encode single answer
    
def update_user_profile(user_id, responses):
    """
    Updates the user's profile with gender, location (as an array), and budget.
    """
    profile_collection = db["Profile"]

    # Extract relevant attributes from the responses
    gender = responses.get("Gender")
    location = responses.get("Location")  # This should be an array
    budget = responses.get("Budget")

    # Ensure location is stored as an array (MongoDB format)
    if isinstance(location, str):
        location = [location]  # Convert single location to array

    # Update the user profile in MongoDB
    profile_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "Gender": gender,
            "Location": location,
            "Budget": budget
        }}
    )

encodings =  generate_encodings()

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
  ignoring_cleaning_questions = list(questions_collection.find(
    {"cleaning": {"$exists": True}},
    {"question_number": 1, "prefq_number": 1}
  ))
  ignoring_cleaning_questions_numbers = [q["question_number"] for q in ignoring_cleaning_questions]
  for q in ignoring_cleaning_questions:
      if q["prefq_number"] is not None and q["prefq_number"] not in ignoring_cleaning_questions_numbers:
          ignoring_cleaning_questions_numbers.append(q["prefq_number"])
  user1_answers = list(qa_collection.aggregate([
     {"$match": {"user": ObjectId(user1), "question_number": {"$nin": ignoring_cleaning_questions_numbers}}},
     {"$sort": {"question_number": -1}}
  ]))

  user1_prefs = list(qa_pref_collection.aggregate([
     {"$match": {"user": ObjectId(user1), "question_number": {"$nin": ignoring_cleaning_questions_numbers}}},
     {"$sort": {"question_number": -1}}
  ]))

  user2_answers = list(qa_collection.aggregate([
     {"$match": {"user": ObjectId(user2), "question_number": {"$nin": ignoring_cleaning_questions_numbers}}},
     {"$sort": {"question_number": -1}}
  ]))

  user2_prefs = list(qa_pref_collection.aggregate([
     {"$match": {"user": ObjectId(user2), "question_number": {"$nin": ignoring_cleaning_questions_numbers}}},
     {"$sort": {"question_number": -1}}
  ]))
  # Calculate scores for user1 based on user2's answers and vice versa
  u1 = np.array([Q["encoding"] for Q in user1_answers])
  u2 = np.array([Q["encoding"] for Q in user1_prefs])
  v1 = np.array([Q["encoding"] for Q in user2_answers])
  v2 = np.array([Q["encoding"] for Q in user2_prefs])

  if len(u1) == 0 or len(u2) == 0 or len(v1) == 0 or len(v2) == 0:
     return 0, 0
  result1 = (1-np.sum(np.abs(u2-v1) * weight_vector / total_score))*100
  result2 = (1-np.sum(np.abs(u1-v2) * weight_vector / total_score))*100

  return result1, result2

def find_matches(user_id: str):
  user_answers = list(qa_collection.find({
        "user": ObjectId(user_id), 
        "question_number": {"$in": [16,3]}
    }, {"answer": 1, "_id": 0}))
  
  user_prefs = list(qa_pref_collection.find({
        "user": ObjectId(user_id),
        "question_number": 2
    }, {"answer": 1, "_id": 0}))

  gender_answer = user_prefs[0]["answer"]
  location_answer = user_answers[1]["answer"]
  budget_answer = user_answers[0]["answer"]
  
  filtering_constraints = {}
  filtering_constraints["Gender"] = {"$in":gender_answer }
  filtering_constraints["Budget"] = {"$gte": 500, "$lte": budget_answer}
  #cleaning
  filtered_users = profiles.aggregate([
     {"$match": filtering_constraints},
     {"$project": {"_id": 1,"Location": 1}}
  ])

  #location cleaning
  filtered_users = list(filtered_users)
  filtered_users = [
      user for user in filtered_users
      if set(user.get("Location", [])) & set(location_answer)  # Check if the intersection is not empty
  ]


  # Now filtered_users contains only those users whose location answers intersect with the user's answers

  filtered_users = [str(user["_id"]) for user in filtered_users]
  compatibility_scores = {}
  for user in filtered_users:
    if user == user_id:
      continue
    score1, score2 = calculate_directional_scores(user_id, user)
    avg_score = (score1 + score2) / 2
    compatibility_scores[user] = avg_score

  # Fetch full profile documents and add the score
  matched_profiles = []
  for user, score in compatibility_scores.items():
    profile = profiles.find_one({"_id": ObjectId(user)})  # Fetch the full profile document
    if profile:
      profile["score"] = score  # Add the score to the profile
      profile["_id"] = str(profile["_id"])
      matched_profiles.append(profile)

  # Sort profiles by score in descending order

  sorted_profiles = sorted(matched_profiles, key=lambda x: x["score"], reverse=True)

  return sorted_profiles

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
    
    user_id = data.get("userId")
    responses = data.get("responses")
    # Fetch all questions and create a lookup dictionary
    all_questions = list(questions_collection.find({}, {"_id": 0, "variable_name": 1, "question_number": 1, "prefq_number": 1}))
    question_lookup = {q["variable_name"]: {k: v for k, v in q.items() if k != "variable_name"} for q in all_questions}
    qa_entries = []
    qa_pref_entries = []
    # Iterate over the provided answers
    for variable_name, answer in responses.items():
        if variable_name not in question_lookup.keys():
            continue  # Ignore invalid variables

        question_number = question_lookup[variable_name]["question_number"]
        prefq_number = question_lookup[variable_name]["prefq_number"]   # Can be null
        # If the question has a prefq_number (meaning it is a main question), add it to QA
        if prefq_number is not None:
            qa_entries.append({
                "user": ObjectId(user_id),
                "question_number": question_number,
                "variable_name": variable_name,
                "encoding": encode_answer(answer, encodings),
                "answer": answer
            })
        else:
            # If prefq_number is null, it is either a preference question or a standalone question
            corresponding_main_question = next((q for q in all_questions if q.get("prefq_number") == question_number), None)

            if corresponding_main_question:
                # This means it is a preference question, so add it to QA_Pref
                qa_pref_entries.append({
                    "user": ObjectId(user_id),
                    "question_number": question_number,
                    "variable_name": variable_name,
                    "encoding": encode_answer(answer, encodings),
                    "answer": answer
                })
            else:
                # Otherwise, it's a standalone question (like Location or Budget), so add it to QA
                qa_entries.append({
                    "user": ObjectId(user_id),
                    "question_number": question_number,
                    "variable_name": variable_name,
                    "encoding": encode_answer(answer, encodings),
                    "answer": answer
                })

    # Insert answers into respective collections
    if qa_entries:
        qa_collection.insert_many(qa_entries)

    if qa_pref_entries:
        qa_pref_collection.insert_many(qa_pref_entries)

    update_user_profile(user_id, responses)

    matches = find_matches(user_id)

    if matches:
      return jsonify({"matches": matches}), 200
    else:
      return jsonify({"message": "No matches found"}), 200
    

@app.route("/api/populate_db/<int:num_users>", methods=["POST"])
def populate_db(num_users):
  for _ in range(num_users):
    generate_random_user()
  return jsonify({"message": f"Populated the test collection with {num_users} users"}), 200

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 locally
    app.run(host="0.0.0.0", port=port, debug=True)