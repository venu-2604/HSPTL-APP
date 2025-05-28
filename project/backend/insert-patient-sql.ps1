# Script to insert a patient directly into the PostgreSQL database
# Set PostgreSQL connection parameters
$pgUser = "postgres"
$pgPassword = "Venu@2604"
$pgDatabase = "arogith"
$pgHost = "localhost"
$pgPort = "5432"

# Set environment variables for psql
$env:PGPASSWORD = $pgPassword

# Generate a unique patient ID
$patientId = "P" + [guid]::NewGuid().ToString().Substring(0, 9)

# Patient data
$name = "Mary"
$surname = "Johnson"
$fatherName = "William"
$gender = "Female"
$age = 35
$address = "456 Pine Street, Chicago"
$bloodGroup = "A-"
$phoneNumber = "7651234098" 
$aadharNumber = "987123456034"
$totalVisits = 0

# Escape single quotes in string values
$name = $name.Replace("'", "''")
$surname = $surname.Replace("'", "''")
$fatherName = $fatherName.Replace("'", "''")
$address = $address.Replace("'", "''")

# First check if the aadhar number already exists
Write-Host "Checking if Aadhar number already exists..."
$checkSql = "SELECT COUNT(*) FROM patients WHERE aadhar_number = '$aadharNumber';"
$result = psql -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -t -c $checkSql

$count = 0
if ($result -match "(\d+)") {
    $count = [int]$Matches[1]
    if ($count -gt 0) {
        Write-Host "ERROR: A patient with Aadhar number $aadharNumber already exists!"
        exit 1
    }
}

# Construct SQL INSERT statement
$insertSql = @"
INSERT INTO patients (
    patient_id, 
    name, 
    surname, 
    father_name, 
    gender, 
    age, 
    address, 
    blood_group, 
    phone_number, 
    aadhar_number, 
    photo, 
    total_visits
) VALUES (
    '$patientId', 
    '$name', 
    '$surname', 
    '$fatherName', 
    '$gender', 
    $age, 
    '$address', 
    '$bloodGroup', 
    '$phoneNumber', 
    '$aadharNumber', 
    NULL, 
    $totalVisits
);
"@

# Execute the SQL command
Write-Host "Inserting new patient with ID: $patientId..."
Write-Host "SQL: $insertSql"

try {
    $result = psql -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -c $insertSql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Patient inserted successfully!"
    } else {
        Write-Host "ERROR: Failed to insert patient. Exit code: $LASTEXITCODE"
        Write-Host $result
    }
} catch {
    Write-Host "ERROR: $_"
}

# List all patients to verify
Write-Host "`nListing all patients to verify insertion:"
$listSql = "SELECT patient_id, name, surname, aadhar_number, gender, age FROM patients;"
psql -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -c $listSql 