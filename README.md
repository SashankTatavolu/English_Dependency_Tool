# English Dependency Tool with Syntax Tree Visualization

This project is a web-based EDT editor designed for easy annotation and visualization of syntactic structures. It features a React frontend and a Flask backend, with JWT authentication, MongoDB integration, and Graphviz-powered syntax tree rendering.

## 🚀 Features

- Upload, view, and edit CoNLL-U formatted files
- Syntax tree visualization using Graphviz and D3
- JWT-based authentication (Register/Login)
- Editable token tables (columns 1–10, including 7 & 8)
- Sentence-level viewing and editing
- RESTful API powered by Flask
- MongoDB for storing sentence and user data

---

## 🧱 Tech Stack

| Frontend   | Backend   | Database  | Visualization         |
|------------|-----------|-----------|------------------------|
| React + Material UI | Flask (Python) | MongoDB   | Graphviz + react-d3-tree |

---

## 🛠️ MongoDB Installation & Setup

### 1. Install MongoDB (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y mongodb


To start and enable MongoDB:

sudo systemctl start mongodb
sudo systemctl enable mongodb

To verify it’s running:

sudo systemctl status mongodb
MongoDB should be accessible on mongodb://localhost:27017/ by default.

```

1. Backend Setup (Flask)

# Clone the repo
git clone https://github.com/SashankTatavolu/English_Dependency_Tool.git

cd English_Dependency_Tool/backend

# Create virtual environment and activate
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (example)
export FLASK_APP=app.py
export FLASK_ENV=development
export SECRET_KEY=your-secret-key
export JWT_SECRET_KEY=your-jwt-secret-key
export MONGO_URI=mongodb://localhost:27017/conllu

# Run the Flask server
python3 app.py


2. Frontend Setup (React)

cd ../frontend

# Install dependencies
npm install

# Start the dev server
npm start

📂 Project Structure

conllu-editor/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── utils/
│   └── templates/  # For Graphviz SVG rendering
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/         # Home, Login, Register, Editor
│   │   ├── App.js
│   │   └── index.js
│   └── public/
│
├── README.md
└── requirements.txt



📦 API Overview
POST /register – Register a user

POST /login – Authenticate user & return JWT

POST /upload – Upload CoNLL-U file

GET /sentences – Get all sentences

PUT /sentence/<id> – Edit a sentence

📌 Notes
Ensure Graphviz is installed (with dot binary) on the server.

MongoDB must be running for user and sentence data storage.

React app uses Material UI for a clean and modern design.

Editor supports sentence tags like <sent_id=...> and </sent_id>.




📬 License
MIT License © 2025 Sashank Tatavolu/ IIITH

