# Add-Patient.ps1 - Script to add a new patient to the system
# Wait a bit for the server to start up
Start-Sleep -Seconds 10

$patientData = @{
    name = "Rahul"
    surname = "Sharma"
    fatherName = "Rajesh"
    gender = "Male"
    age = 28
    address = "45 Park Avenue, Mumbai"
    bloodGroup = "O+"
    phoneNumber = "9876123450"
    aadharNumber = "987601234500"
}

# Convert the data to JSON
$jsonBody = $patientData | ConvertTo-Json

Write-Host "Attempting to add patient with the following data:"
Write-Host $jsonBody

try {
    # Make the API call with detailed error handling
    $response = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Post -Body $jsonBody -ContentType 'application/json' -ErrorAction Stop
    
    Write-Host "SUCCESS! Patient added successfully."
    Write-Host "New Patient ID: $($response.patientId)"
    Write-Host "Patient details:"
    $response | Format-List
} 
catch {
    Write-Host "ERROR: Failed to add patient"
    Write-Host "Status code: $($_.Exception.Response.StatusCode)"
    Write-Host "Error message: $($_.Exception.Message)"
    
    # Try to get more detailed error message from the response
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorDetails = $reader.ReadToEnd()
        Write-Host "Error details: $errorDetails"
    }
    catch {
        Write-Host "Could not retrieve detailed error information."
    }
}

# List all patients to verify
Write-Host "`nCurrent list of patients in the system:"
try {
    $allPatients = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get
    $allPatients | Format-Table patientId, name, surname, aadharNumber
}
catch {
    Write-Host "Could not retrieve patient list: $($_.Exception.Message)"
} 