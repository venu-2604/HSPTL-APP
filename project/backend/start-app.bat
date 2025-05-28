@echo off
echo Starting Arogith API backend server...
cd %~dp0
echo Current directory: %CD%
call mvnw.cmd spring-boot:run
echo Server started! 