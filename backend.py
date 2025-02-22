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
  

if __name__ == "__main__":
  app.run(debug=True, port=5000)
