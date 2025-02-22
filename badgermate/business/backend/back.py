from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route('/save_location', methods=['POST'])
def save_location():
    data = request.json
    print("Received location:", data)
    return jsonify({"message": "Location received", "data": data}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
