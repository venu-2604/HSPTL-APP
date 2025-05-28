# Patient Management Guide

This guide explains how to properly add patients to the Arogith healthcare system.

## Understanding the Backend Architecture

The Arogith system uses a Spring Boot backend with PostgreSQL for data storage. The main components are:

1. **Controller Layer**: `PatientController.java` handles API requests
2. **Service Layer**: `PatientService.java` contains business logic
3. **Repository Layer**: `PatientRepository.java` interfaces with the database
4. **Model Layer**: `Patient.java` defines the patient data structure

## Common Issues and Solutions

### Photo Field Type Mismatch

The most common issue when adding patients is a mismatch between the database column type for `photo` (OID) and the Java model (byte[]). We've addressed this by:

1. Changing the database column type from OID to BYTEA
2. Adding proper JPA annotations to the Patient model

### API Requirements

When adding a patient via the API, the following fields are required:

- `name`: Patient's first name
- `surname`: Patient's last name
- `aadharNumber`: Unique Aadhar ID (12 digits)

Other fields are optional but recommended:
- `fatherName`: Patient's father's name
- `gender`: "Male", "Female", or "Other"
- `age`: Patient's age as an integer
- `address`: Patient's residential address
- `bloodGroup`: Patient's blood type (e.g., "O+", "A-")
- `phoneNumber`: Contact number (10 digits)

## Adding Patients

### Method 1: Using the API Directly

```powershell
$patientData = @{
    name = "Patient Name"
    surname = "Last Name"
    fatherName = "Father Name"
    gender = "Male"
    age = 30
    address = "Patient Address"
    bloodGroup = "O+"
    phoneNumber = "9876543210"
    aadharNumber = "123456789012"
}

$jsonBody = $patientData | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Post -Body $jsonBody -ContentType 'application/json'
```

### Method 2: Using JDBC/SQL Directly

For troubleshooting or bulk imports, you can use SQL:

```sql
INSERT INTO patients (
    patient_id, name, surname, father_name, gender, age, 
    address, blood_group, phone_number, aadhar_number, photo, total_visits
) VALUES (
    'P' || substring(md5(random()::text), 1, 9),
    'Patient Name',
    'Last Name',
    'Father Name',
    'Male',
    30,
    'Patient Address',
    'O+',
    '9876543210',
    '123456789012',
    NULL,
    0
);
```

### Method 3: Using the Frontend

The frontend application provides a user-friendly interface for adding patients. Navigate to the dashboard and click the "Add Patient" button.

## Validating Patients

To verify a patient was added successfully:

```powershell
# List all patients
Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get | Format-Table

# Find patient by Aadhar
Invoke-RestMethod -Uri 'http://localhost:8083/api/patients/aadhar/123456789012' -Method Get
```

## Troubleshooting

If you encounter issues:

1. Ensure the Aadhar number is unique
2. Check that required fields are provided
3. Verify the database is running and accessible
4. Look for detailed error messages in the logs

## For Developers

If modifying the codebase:

1. Ensure proper annotations for all entity fields
2. Handle data type conversions carefully
3. Use proper error handling and validation
4. Test thoroughly with different data scenarios 