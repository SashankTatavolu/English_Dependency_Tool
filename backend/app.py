from flask import Flask, Response, json, make_response, request, jsonify
from flask_pymongo import PyMongo
import os
import re
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
# CORS(app, origins=["http://10.4.16.167:8083"], supports_credentials=True)
CORS(app)

# Configure secret key for JWT
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Replace with a strong secret key in production

# MongoDB URI
app.config["MONGO_URI"] = "mongodb://localhost:27017/conllu-editor"
# app.config["MONGO_URI"] = "mongodb://10.4.16.167:27018/conllu-editor"
mongo = PyMongo(app)


# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in the headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            # Check if it starts with 'Bearer '
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            # Decode the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token!'}), 401
        
        # Add the current user to the request context
        return f(current_user, *args, **kwargs)
    
    return decorated

# User registration endpoint
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    # Validate request data
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = mongo.db.users.find_one({'email': data['email']})
    if existing_user:
        return jsonify({'error': 'User already exists with this email'}), 409
    
    # Check if username is taken
    existing_username = mongo.db.users.find_one({'username': data['username']})
    if existing_username:
        return jsonify({'error': 'Username already taken'}), 409
    
    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    
    # Create new user
    new_user = {
        'username': data['username'],
        'email': data['email'],
        'password': hashed_password,
        'created_at': datetime.datetime.utcnow()
    }
    
    # Insert user into database
    result = mongo.db.users.insert_one(new_user)
    
    # Create response
    return jsonify({
        'message': 'User registered successfully',
        'user_id': str(result.inserted_id)
    }), 201

# User login endpoint
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    
    # Validate request data
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    # Find user by email
    user = mongo.db.users.find_one({'email': data['email']})
    
    # Check if user exists and password matches
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    # Return token
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user['email']
        }
    }), 200

# Protected user profile endpoint
@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Return user information (excluding password)
    user_info = {
        'id': str(current_user['_id']),
        'username': current_user['username'],
        'email': current_user['email'],
        'created_at': current_user['created_at']
    }
    return jsonify(user_info), 200

@app.route('/api/tokens/upload', methods=['POST'])
@token_required
def upload_tokens(current_user):
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    file_content = file.read().decode('utf-8')

    # Split content into sentences based on sent_id tags
    sentences = []
    current_sentence = {"tokens": [], "sent_id": None, "user_id": str(current_user['_id'])}

    lines = file_content.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Match sentence start tag
        sent_id_match = re.match(r'<sent_id=(.+)>', line)
        if sent_id_match:
            if current_sentence["tokens"]:
                sentences.append(current_sentence)
                current_sentence = {"tokens": [], "sent_id": None, "user_id": str(current_user['_id'])}
            current_sentence["sent_id"] = sent_id_match.group(1)
            continue

        if line == "</sent_id>":
            continue

        if not line.startswith("#"):
            columns = line.split("\t")
            if len(columns) >= 8:
                while len(columns) < 10:
                    columns.append("_")

                token = {
                    "ID": columns[0],
                    "FORM": columns[1],
                    "LEMMA": columns[2],
                    "UPOS": columns[3],
                    "XPOS": columns[4],
                    "FEATS": columns[5],
                    "HEAD_PANINIAN": columns[6],
                    "DEPREL_PANINIAN": columns[7],
                    "HEAD_UD": columns[8],
                    "DEPREL_UD": columns[9]
                }
                current_sentence["tokens"].append(token)

    # Append last sentence if needed
    if current_sentence["tokens"]:
        sentences.append(current_sentence)

    # Handle case with no <sent_id> tags
    if not sentences and file_content.strip():
        tokens = []
        for line in file_content.strip().split('\n'):
            if line.strip() and not line.startswith("#"):
                columns = line.split("\t")
                if len(columns) >= 8:
                    while len(columns) < 10:
                        columns.append("_")
                    tokens.append({
                        "ID": columns[0],
                        "FORM": columns[1],
                        "LEMMA": columns[2],
                        "UPOS": columns[3],
                        "XPOS": columns[4],
                        "FEATS": columns[5],
                        "HEAD_PANINIAN": columns[6],
                        "DEPREL_PANINIAN": columns[7],
                        "HEAD_UD": columns[8],
                        "DEPREL_UD": columns[9]
                    })

        if tokens:
            sentences.append({"tokens": tokens, "sent_id": "Sentence 1", "user_id": str(current_user['_id'])})

    # Save all sentences to MongoDB
    token_collection = mongo.db.sentences
    inserted_ids = [str(token_collection.insert_one(sentence).inserted_id) for sentence in sentences]

    return jsonify({
        "message": f"{len(sentences)} sentences uploaded and stored successfully",
        "sentence_ids": inserted_ids,
        "sentences": sentences
    }), 200

@app.route('/api/sentences', methods=['GET'])
@token_required
def get_all_sentences(current_user):
    token_collection = mongo.db.sentences
    # Get only sentences for the current user
    sentences = list(token_collection.find({"user_id": str(current_user['_id'])}, {"_id": 1, "sent_id": 1}))
    
    # Convert ObjectId to string for JSON serialization
    for sentence in sentences:
        sentence["_id"] = str(sentence["_id"])
    
    return jsonify(sentences), 200

@app.route('/api/sentences/<sentence_id>', methods=['GET'])
@token_required
def get_sentence(current_user, sentence_id):
    token_collection = mongo.db.sentences
    sentence = token_collection.find_one({
        "_id": ObjectId(sentence_id),
        "user_id": str(current_user['_id'])
    })
    if not sentence:
        return jsonify({"error": "Sentence not found"}), 404

    sentence["_id"] = str(sentence["_id"])
    return jsonify(sentence), 200


@app.route('/api/tokens/<sentence_id>/token/<token_id>', methods=['PUT'])
@token_required
def update_token(current_user, sentence_id, token_id):
    data = request.json  # e.g., { "HEAD": "3" } or { "DEPREL": "nsubj" }

    token_collection = mongo.db.sentences
    sentence = token_collection.find_one({
        "_id": ObjectId(sentence_id),
        "user_id": str(current_user['_id'])
    })

    if not sentence:
        return jsonify({"error": "Sentence not found or unauthorized"}), 404

    updated_tokens = []
    for token in sentence['tokens']:
        if token['ID'] == token_id:
            token.update(data)
        updated_tokens.append(token)

    token_collection.update_one(
        { "_id": ObjectId(sentence_id) },
        { "$set": { "tokens": updated_tokens } }
    )
    
    # Convert ObjectId to string for response
    sentence["_id"] = str(sentence["_id"])
    sentence["tokens"] = updated_tokens

    return jsonify(sentence), 200

@app.route('/api/sentences/download', methods=['GET'])
@token_required
def download_sentences_combined(current_user):
    download_format = request.args.get('format', 'txt')
    token_collection = mongo.db.sentences
    sentences = list(token_collection.find({"user_id": str(current_user['_id'])}))

    if download_format == 'json':
        # Convert ObjectId to string
        for sentence in sentences:
            sentence["sentence_id"] = str(sentence["_id"])
            del sentence["_id"]  # Optional: remove _id if you don't want it duplicated

        response = make_response(json.dumps(sentences, indent=2))
        response.headers.set('Content-Type', 'application/json')
        response.headers.set('Content-Disposition', 'attachment', filename='sentences.json')
        return response

    elif download_format == 'txt':
        lines = []
        for sentence in sentences:
            sent_id = sentence.get('sent_id', 'unknown')
            if sentence.get("feedback"):
                lines.append(f"# feedback={sentence['feedback']}")
            lines.append(f"<sent_id={sent_id}>")
            
            for token in sentence['tokens']:
                columns = [
                    token.get("ID", "_"),
                    token.get("FORM", "_"),
                    token.get("LEMMA", "_"),
                    token.get("UPOS", "_"),
                    token.get("XPOS", "_"),
                    token.get("FEATS", "_"),
                    token.get("HEAD_PANINIAN", "_"),
                    token.get("DEPREL_PANINIAN", "_"),
                    token.get("HEAD_UD", "_"),
                    token.get("DEPREL_UD", "_")
                ]
                lines.append("\t".join(columns))
            lines.append(f"</sent_id>")
            lines.append("")

        content = "\n".join(lines)
        return Response(
            content,
            mimetype='text/plain',
            headers={"Content-Disposition": "attachment; filename=sentences.txt"}
        )

    else:
        return jsonify({"error": "Invalid format. Use 'txt' or 'json'."}), 400
    
    
@app.route('/api/sentences', methods=['DELETE'])
@token_required
def delete_all_sentences(current_user):
    token_collection = mongo.db.sentences
    result = token_collection.delete_many({"user_id": str(current_user['_id'])})
    return jsonify({
        "message": f"Deleted {result.deleted_count} sentences."
    }), 200


@app.route('/api/sentences/<sentence_id>/feedback', methods=['PUT'])
@token_required
def update_feedback(current_user, sentence_id):
    data = request.json
    feedback = data.get("feedback", "")

    token_collection = mongo.db.sentences
    result = token_collection.update_one(
        {"_id": ObjectId(sentence_id), "user_id": str(current_user['_id'])},
        {"$set": {"feedback": feedback}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Sentence not found or unauthorized"}), 404

    return jsonify({"message": "Feedback updated successfully"}), 200


# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)