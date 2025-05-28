# Wait for the application to start
Write-Host "Waiting for the application to start..."
Start-Sleep -Seconds 60

# Test endpoint to list patients
Write-Host "`nListing existing patients..."
try {
    $patients = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get
    Write-Host "Found $($patients.Count) patients:"
    $patients | Format-Table patientId, name, surname, aadharNumber
}
catch {
    Write-Host "Error listing patients: $($_.Exception.Message)"
}

# Test adding a new patient
Write-Host "`nAttempting to add a new patient..."
$patientData = @{
    name = "John"
    surname = "Doe"
    fatherName = "Richard"
    gender = "Male"
    age = 35
    address = "123 Test Street, TestCity"
    bloodGroup = "A-"
    phoneNumber = "7890123456"
    aadharNumber = "987654321012"
}

$jsonBody = $patientData | ConvertTo-Json
Write-Host "Request payload: $jsonBody"

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Post -Body $jsonBody -ContentType 'application/json'
    Write-Host "SUCCESS! Patient added with ID: $($response.patientId)"
    $response | Format-List
}
catch {
    Write-Host "Error adding patient: $($_.Exception.Message)"
    
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

# Verify the new patient was added
Write-Host "`nVerifying patient was added..."
try {
    $patients = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get
    Write-Host "Found $($patients.Count) patients (should be one more than before):"
    $patients | Format-Table patientId, name, surname, aadharNumber
}
catch {
    Write-Host "Error listing patients: $($_.Exception.Message)"
} 