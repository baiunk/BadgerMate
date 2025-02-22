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
  
@app.route("/api/init_survey", methods=["GET"])
def init_survey():
    main_question = questions_collection.find_one({"question_number": 1})
    if not main_question:
        return jsonify({"error": "No question found"}), 404

    def format_question(q):
        return {
            "question_number": q.get("question_number"),
            "question_text": q.get("question_text"),
            "variable_name": q.get("variable_name"),
            "data_type": q.get("data_type"),
            "possible_answers": q.get("possible_answers"),
            "html_input_type": q.get("html_input_type"),
            "html_attributes": q.get("html_attributes")
        }

    result = format_question(main_question)

    prefq_number = main_question.get("prefq_number")
    if prefq_number:
        pref_question = questions_collection.find_one({"question_number": prefq_number})
        if pref_question:
            pref_result = format_question(pref_question)
            return jsonify({"question": result, "preference_question": pref_result}), 200

    return jsonify({"question": result}), 200




if __name__ == "__main__":
  app.run(debug=True, port=5000)