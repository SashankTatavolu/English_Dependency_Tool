
# 🧠 English Dependency Tool

A web-based tool for uploading and editing [CoNLL-U](https://universaldependencies.org/format.html) files, visualizing dependency trees, and managing linguistic annotations.

---

## 🚀 FeaturesQ

- 📤 Upload and parse CoNLL-U formatted files  
- 🎯 Edit dependency relations via an intuitive interface  
- 🌳 Visualize syntactic dependency trees in real-time  
- 🔄 Update `HEAD` and `DEPREL` columns through dropdowns  
- 🧩 Full-stack architecture with React (frontend) + Flask + MongoDB (backend)  

---

## 🖥️ Tech Stack

| Layer        | Tech                        |
|--------------|-----------------------------|
| Frontend     | React, Tailwind CSS         |
| Backend      | Python, Flask REST API      |
| Database     | MongoDB (NoSQL)             |
| Visualization| D3.js or vis.js (for trees) |

---



## 🔧 Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/LC-Platform/English_Depedency_Tool.git
cd English_Depedency_Tool



2️⃣ Backend Setup (Flask + MongoDB)

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Ensure MongoDB is running on your machine.

Configure MONGO_URI in  app.py or .env.

To run the Flask server:

python3 app.py

3️⃣ Frontend Setup (React)

cd frontend
npm install
npm start
This starts the frontend on http://localhost:3000.

🔄 API Overview

Endpoint	Method	Description
/upload	POST	Upload CoNLL-U file
/sentences	GET	Fetch parsed sentence data
/update_token	POST	Update HEAD or DEPREL for a token
✨ Contribution
Feel free to open issues or pull requests to improve this tool. All contributions are welcome!

📝 License
MIT License © 2025 EDT


---






