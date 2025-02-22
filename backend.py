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
  
@app.route("/api/init_survey", methods=["GET"])
def init_survey(): 
  main_question = questions_collection.find_one({"question_number": 1})

  prefq_number = main_question.get("prefq_number")
  if prefq_number:
    pref_question = questions_collection.find_one({"question_number": prefq_number})
    return jsonify({"question": main_question, "preference_question": pref_question}), 200

  return jsonify({"question": main_question}), 200




if __name__ == "__main__":
  app.run(debug=True, port=5000)