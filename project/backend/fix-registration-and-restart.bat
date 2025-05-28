@echo off
echo ===== Fixing Patient Registration Issues =====

REM Set database connection details - adjust these based on your actual configuration
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=arogith
set PGUSER=postgres
set PGPASSWORD=password

echo Applying database fixes...
psql -f src/main/resources/db/fix-patient-registration.sql

echo Checking database connection...
psql -c "SELECT 'Database connection successful!' as status;"

echo Stopping existing application if running...
taskkill /F /IM java.exe /FI "WINDOWTITLE eq Arogith*" 2>NUL
timeout /t 2 /nobreak >NUL

echo Building application...
call mvnw clean package -DskipTests

echo Starting application...
start "Arogith API Server" java -jar target/api-0.0.1-SNAPSHOT.jar

echo ===== Fix Complete =====
echo Application should be starting. Check logs for details.
echo Frontend can now attempt to register patients.
timeout /t 5 