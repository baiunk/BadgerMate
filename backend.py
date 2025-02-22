from dotenv import load_dotenv
import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)

