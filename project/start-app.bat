@echo off
echo Starting Arogith Healthcare Management System...

REM Apply database fixes first
cd backend
echo Applying database fixes...
psql -U postgres -d arogith_healthcare -f fix-register-endpoint.sql
if %ERRORLEVEL% NEQ 0 (
  echo Failed to apply database fixes. Please ensure PostgreSQL is running and credentials are correct.
  pause
  exit /b 1
)

REM Start the backend server
echo Starting Backend Server...
start cmd /k "cd backend && java -jar target/arogith-healthcare-0.0.1-SNAPSHOT.jar"

REM Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 10 /nobreak

REM Start the frontend server
echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo.
echo Arogith Healthcare Management System is starting up...
echo Backend will be available at http://localhost:8083
echo Frontend will be available at http://localhost:3000
echo.
echo NOTE: Keep this window open. Closing it will shut down both servers.
echo.
pause

echo Shutting down servers...
taskkill /F /IM node.exe
taskkill /F /IM java.exe

echo All servers shut down. Have a nice day! 