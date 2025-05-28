@echo off
echo ===== REBUILDING DATABASE SCHEMA =====

REM Set database connection details
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=arogith
set PGUSER=postgres
set PGPASSWORD=password

echo Running SQL script to fix schema issues...
psql -f fix-photo-column.sql

echo Verifying tables were created...
psql -c "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name IN ('patients', 'visits') AND column_name = 'photo';"

echo Stopping existing application...
taskkill /F /IM java.exe /FI "WINDOWTITLE eq Arogith*" 2>NUL
timeout /t 2 /nobreak >NUL

echo Rebuilding application...
call mvnw clean package -DskipTests

echo Starting application with clean database...
start "Arogith API Server" java -jar target/api-0.0.1-SNAPSHOT.jar

echo ===== REBUILD COMPLETE =====
echo Application restarted with clean database schema.
echo You can now register patients without the photo column error.
timeout /t 5 