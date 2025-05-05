#!/bin/bash

# Step 1: Pull latest code
echo "🔄 Pulling latest changes from Git..."
git pull

# Step 2: Frontend setup and start
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🚀 Starting frontend..."
npm start &
FRONTEND_PID=$!
cd ..

# Step 3: Backend setup and start
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "🚀 Starting backend..."
python3 app.py &
BACKEND_PID=$!
cd ..

# Info
echo "✅ Frontend and backend started."
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"

# Optional: Wait for both to finish (if needed)
wait $FRONTEND_PID $BACKEND_PID
