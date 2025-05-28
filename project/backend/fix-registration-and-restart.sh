#!/bin/bash

echo "===== Fixing Patient Registration Issues ====="

# Set database connection details - adjust these based on your actual configuration
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=arogith
export PGUSER=postgres
export PGPASSWORD=password

echo "Applying database fixes..."
psql -f src/main/resources/db/fix-patient-registration.sql

echo "Checking database connection..."
psql -c "SELECT 'Database connection successful!' as status;"

echo "Stopping existing application if running..."
pkill -f "java.*api-0.0.1-SNAPSHOT.jar" || true
sleep 2

echo "Building application..."
./mvnw clean package -DskipTests

echo "Starting application..."
nohup java -jar target/api-0.0.1-SNAPSHOT.jar > app.log 2>&1 &

echo "===== Fix Complete ====="
echo "Application should be starting. Check app.log for details."
echo "Frontend can now attempt to register patients."

# Print out the process ID
echo "API Server running with PID: $!" 