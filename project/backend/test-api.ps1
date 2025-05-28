# Test the API with proper error handling
Write-Host "Testing the API endpoints..."

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "`nTesting $Name endpoint: $Method $Url"
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            Write-Host "Request body: $jsonBody"
            $params.Body = $jsonBody
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "SUCCESS! Response received."
        return $response
    }
    catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        try {
            if ($_.Exception.Response) {
                $statusCode = $_.Exception.Response.StatusCode.value__
                Write-Host "Status code: $statusCode" -ForegroundColor Red
                
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorDetails = $reader.ReadToEnd()
                if ($errorDetails) {
                    Write-Host "Error details: $errorDetails" -ForegroundColor Red
                }
            }
        }
        catch {
            Write-Host "Could not retrieve detailed error information." -ForegroundColor Red
        }
        return $null
    }
}

# Test creating a new patient
$newPatient = @{
    name = "Emily"
    surname = "Davis"
    fatherName = "Michael"
    gender = "Female"
    age = 29
    address = "123 Maple Avenue, Boston"
    bloodGroup = "AB+"
    phoneNumber = "5554443333"
    aadharNumber = "987612345678"
}

# First test if the API is running
$baseUrl = "http://localhost:8083/api"

Write-Host "`nChecking if the API is running..."
$apiRunning = $false
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/patients" -Method GET -TimeoutSec 2 -ErrorAction Stop
    $apiRunning = $true
    Write-Host "API is running!" -ForegroundColor Green
}
catch {
    Write-Host "API is not running or not responding." -ForegroundColor Yellow
    Write-Host "Please start the application using start-app.bat before running this script." -ForegroundColor Yellow
    exit
}

# If API is running, test endpoints
if ($apiRunning) {
    # List all patients
    $patients = Test-Endpoint -Name "List patients" -Url "$baseUrl/patients"
    if ($patients) {
        Write-Host "Found $($patients.Count) patients in the system:" -ForegroundColor Green
        $patients | Format-Table patientId, name, surname, aadharNumber
    }
    
    # Create a new patient
    $createdPatient = Test-Endpoint -Name "Create patient" -Url "$baseUrl/patients" -Method "POST" -Body $newPatient
    if ($createdPatient) {
        Write-Host "New patient created with ID: $($createdPatient.patientId)" -ForegroundColor Green
        $createdPatient | Format-List
        
        # Get the new patient by ID
        $patientId = $createdPatient.patientId
        Test-Endpoint -Name "Get patient by ID" -Url "$baseUrl/patients/$patientId"
    }
    
    # List all patients again to verify the new one was added
    $patientsAfter = Test-Endpoint -Name "List patients after creation" -Url "$baseUrl/patients"
    if ($patientsAfter) {
        Write-Host "After creation: Found $($patientsAfter.Count) patients in the system:" -ForegroundColor Green
        $patientsAfter | Format-Table patientId, name, surname, aadharNumber
    }
} 