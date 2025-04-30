🌐 English Dependency Tool (EDT) – With Syntax Tree Visualization
This tool lets you upload, view, and edit English sentences in CoNLL-U format and see their syntax trees. It has:

A interface (React)

A smart backend that stores your data (Flask + MongoDB)

Graphical syntax trees powered by Graphviz

✅ What Can This Tool Do?

Upload and view CoNLL-U files (used in linguistic research)

Edit sentence structures and word details

View sentences as tree diagrams

Sign up and log in (your data is safe!)

View and edit each token (words and features) of a sentence

🔧 What Do You Need to Install?
✅ Tools Used in This Project

Part	Tool
Frontend	React + Material UI
Backend	Python Flask
Database	MongoDB
Visualization	Graphviz + D3.js


🖥️ Step-by-Step Installation Guide
Works best on Ubuntu/Debian (Linux). For Windows, WSL or a Linux VM is recommended.

📌 1. Install MongoDB (the database)
Open your terminal and type:


sudo apt update
sudo apt install -y mongodb


# Start MongoDB and make it auto-start when you boot:

sudo systemctl start mongodb
sudo systemctl enable mongodb


# To check if MongoDB is running:

sudo systemctl status mongodb


# You should see "active (running)". That’s it! MongoDB is now ready.

📌 2. Install Graphviz (for tree diagrams)


sudo apt install -y graphviz


# This tool will draw the beautiful sentence trees.

📌 3. Clone the Project
In your terminal:

git clone https://github.com/SashankTatavolu/English_Dependency_Tool.git

cd English_Dependency_Tool


📌 4. Set Up the Backend (Flask)


cd backend


# Create a Python virtual environment (this keeps things clean):

python3 -m venv venv

source venv/bin/activate

# Install the Python packages:

pip install -r requirements.txt

Set the environment variables (temporary for now):

export FLASK_APP=app.py
export FLASK_ENV=development
export SECRET_KEY=your-secret-key
export JWT_SECRET_KEY=your-jwt-secret-key
export MONGO_URI=mongodb://localhost:27017/conllu


# Start the backend server:

python3 app.py


You should see: Running on http://127.0.0.1:5003/

📌 5. Set Up the Frontend (React)

In a new terminal window:

cd English_Dependency_Tool/frontend


# Install Node.js packages:

npm install

# Start the development server:

npm start


# You’ll see the app open in your browser at http://localhost:3000/

📁 Project Folder Structure (Simplified)

English_Dependency_Tool/
├── backend/           → Python Flask app
│   ├── app.py         → Main server file
│   └── ...            → Auth, DB, routes, utils
├── frontend/          → React web app
│   └── src/pages/     → Login, Register, Editor
└── requirements.txt   → Python dependencies


🌐 How It Works
Register or Login (JWT token is saved)

Upload a CoNLL-U file

Sentences show up one-by-one

You can edit words, tags, dependencies

Syntax trees are auto-generated using Graphviz

📡 API Summary (for tech-savvy users)

Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Log in and get a JWT
POST	/upload	Upload CoNLL-U file
GET	/sentences	Fetch stored sentences
PUT	/sentence/<id>	Update sentence by ID


⚠️ Important Notes
Graphviz must be installed and accessible (use which dot to check).

MongoDB must be running before starting the backend.

This app is designed to handle <sent_id=...> tags used in linguistics.

🎨 UI/UX
The app uses Material UI to give a clean, modern look and feel.

📜 License
MIT License © 2025 Sashank Tatavolu / IIITH

