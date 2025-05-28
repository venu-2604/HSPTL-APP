#!/bin/bash

echo "Starting Arogith Healthcare Management System..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Apply database fixes first
echo "Applying database fixes..."
PGPASSWORD=postgres psql -U postgres -d arogith_healthcare -f backend/fix-register-endpoint.sql
if [ $? -ne 0 ]; then
  echo "Failed to apply database fixes. Please ensure PostgreSQL is running and credentials are correct."
  read -p "Press any key to continue..." key
  exit 1
fi

# Start the backend server
echo "Starting Backend Server..."
cd backend
java -jar target/arogith-healthcare-0.0.1-SNAPSHOT.jar &
BACKEND_PID=$!

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 10

# Start the frontend server
echo "Starting Frontend Server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo
echo "Arogith Healthcare Management System is starting up..."
echo "Backend will be available at http://localhost:8083"
echo "Frontend will be available at http://localhost:3000"
echo
echo "NOTE: Press Ctrl+C to shut down both servers."
echo

# Handle shutdown
function cleanup {
  echo "Shutting down services..."
  kill $FRONTEND_PID
  kill $BACKEND_PID
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait