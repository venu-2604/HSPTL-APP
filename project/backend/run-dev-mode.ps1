Write-Host "Starting Arogith API backend server..." -ForegroundColor Cyan

# Get the directory of the current script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Current directory: $pwd" -ForegroundColor Yellow

# Run the Maven wrapper with Spring Boot
Write-Host "Executing Maven command..." -ForegroundColor Green
& .\mvnw.cmd spring-boot:run

Write-Host "Server process completed" -ForegroundColor Magenta 