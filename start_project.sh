#!/bin/bash

# Step 1: Pull latest code
echo "🔄 Pulling latest changes from Git..."
git pull

# Step 2: Start frontend
echo "🚀 Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Step 3: Start backend
echo "🚀 Starting backend..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Optional: Wait for processes or exit
echo "✅ Frontend and backend started."
echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"

# Uncomment the following line if you want the script to wait and keep running
# wait $FRONTEND_PID $BACKEND_PID
