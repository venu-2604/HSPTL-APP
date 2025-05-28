# Run the Spring Boot application with the patient creator enabled
# First, stop any running Java processes
Write-Host "Stopping any running Java processes..."
Stop-Process -Name "java" -ErrorAction SilentlyContinue

# Set the working directory
cd $PSScriptRoot

Write-Host "Starting the application with sample patient creation enabled..."
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8083 -Dspring.profiles.active=dev -Dcreate.sample.patient=true"

Write-Host "Done." 