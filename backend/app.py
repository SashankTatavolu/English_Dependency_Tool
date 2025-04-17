from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
import os

# Initialize Flask app
app = Flask(__name__)

# MongoDB URI
app.config["MONGO_URI"] = "mongodb://localhost:27017/conllu-editor"
mongo = PyMongo(app)

# Handle CORS
from flask_cors import CORS
CORS(app)

@app.route('/api/tokens/upload', methods=['POST'])
def upload_tokens():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    # Log the file data
    file_content = file.read().decode('utf-8')
    lines = file_content.strip().split('\n')

    tokens = []
    for line in lines:
        if line.strip() and not line.startswith("#"):
            columns = line.split("\t")
            if len(columns) == 10:
                tokens.append({
                    "ID": columns[0],
                    "FORM": columns[1],
                    "LEMMA": columns[2],
                    "UPOS": columns[3],
                    "XPOS": columns[4],
                    "FEATS": columns[5],
                    "HEAD": columns[6],
                    "DEPREL": columns[7],
                    "DEPS": columns[8],
                    "MISC": columns[9]
                })

    # Insert tokens into MongoDB
    token_collection = mongo.db.tokens
    result = token_collection.insert_many(tokens)

    # Return the response with the inserted tokens
    return jsonify({"message": "File uploaded and tokens stored successfully", "tokens": tokens}), 200

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5000)
