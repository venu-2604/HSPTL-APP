@echo off
echo ===========================================
echo Patient Creation Fix - Complete Solution
echo ===========================================

echo.
echo Step 1: Fixing database schema...
set PGPASSWORD=Venu@2604
psql -h localhost -U postgres -d arogith -f fix-schema.sql

echo.
echo Step 2: Adding a test patient directly to the database...
psql -h localhost -U postgres -d arogith -f add-test-patient.sql

echo.
echo Step 3: Starting the Spring Boot application...
echo The application will start in a new window.
echo Please wait for it to start completely before continuing.

start "Arogith API" cmd /c start-app.bat

echo.
echo Step 4: Waiting 60 seconds for the application to start...
timeout /t 60 /nobreak

echo.
echo Step 5: Testing the API...
powershell -File test-api.ps1

echo.
echo ===========================================
echo All steps completed!
echo ===========================================
echo.
echo If the API test failed, the Spring Boot application might need more time to start.
echo You can manually run 'test-api.ps1' to try again after the application has fully started.
echo.
pause 