# Wait for the application to start
Write-Host "Waiting for the application to start..."
Start-Sleep -Seconds 40

# Try to get all patients from the API
Write-Host "Listing all patients from the API..."
try {
    $patients = Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get
    Write-Host "Found $($patients.Count) patients:"
    $patients | Format-Table patientId, name, surname, aadharNumber, gender, age
} 
catch {
    Write-Host "Error retrieving patients: $($_.Exception.Message)"
    
    # Try to get more detailed error information
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

# Try to connect to the database directly (requires psql to be in path)
Write-Host "`nTrying to connect to the database directly..."
try {
    $env:PGPASSWORD = "Venu@2604"
    psql -U postgres -d arogith -c "SELECT patient_id, name, surname, aadhar_number, gender, age FROM patients;"
}
catch {
    Write-Host "Error connecting to database: $($_.Exception.Message)"
} 