# Patient Creation Fix

This document outlines the solution to the "500 Internal Server Error" when creating patients in the Arogith healthcare system.

## Problem

When attempting to create a patient through the API, the system would return a 500 Internal Server Error without providing detailed error information.

## Root Cause

The root cause was identified as a data type mismatch between:
1. The database schema: `photo` column was `OID` type (PostgreSQL Large Object Identifier)
2. The Java model: `photo` field was `byte[]` type (Java byte array)

When JPA tried to save the Patient object, the conversion between these incompatible types would fail.

## Solution Implemented

1. **Database Schema Fix**
   - Changed the `photo` column type from `OID` to `BYTEA` in the PostgreSQL database
   - This ensures compatibility with Java's byte array type

2. **Java Model Enhancement**
   - Added proper JPA annotations to the Patient model:
   ```java
   @Lob
   @Column(name = "photo", columnDefinition = "BYTEA")
   private byte[] photo;
   ```

3. **Created Utility Scripts**
   - `fix-schema.sql`: SQL script to fix the column type
   - `insert-patient-sql.ps1`: PowerShell script to directly insert patients
   - `add-test-patient.sql`: SQL script to add a test patient
   - `start-app.bat`: Batch file to start the Spring Boot application
   - `test-api.ps1`: PowerShell script to test the API

## How to Use

### Method 1: Direct Database Insertion (Bypassing the API)

```bash
# Run the schema fix script first
$env:PGPASSWORD = "Venu@2604"; psql -h localhost -U postgres -d arogith -f fix-schema.sql

# Insert a patient using the PowerShell script
./insert-patient-sql.ps1

# Or use the SQL script
$env:PGPASSWORD = "Venu@2604"; psql -h localhost -U postgres -d arogith -f add-test-patient.sql
```

### Method 2: Using the API (After Fixes)

1. Start the application:
   ```bash
   ./start-app.bat
   ```

2. Run the test script to create a patient through the API:
   ```bash
   ./test-api.ps1
   ```

3. Or use the REST API directly:
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

## Verification

You can verify that patients are being added correctly by:

1. Checking the database:
   ```bash
   $env:PGPASSWORD = "Venu@2604"; psql -h localhost -U postgres -d arogith -c "SELECT * FROM patients;"
   ```

2. Using the API:
   ```bash
   Invoke-RestMethod -Uri 'http://localhost:8083/api/patients' -Method Get
   ```

## Important Notes

1. Always ensure the `aadharNumber` is unique before adding a new patient
2. The `photo` field should be left as NULL when creating patients directly
3. The Spring Boot application must be restarted after schema changes

## For Developers

When making future changes to the Patient model:
1. Ensure appropriate JPA annotations are used for all fields
2. Be careful with binary data types (byte[]) to ensure proper database mapping
3. Consider adding validation to prevent common errors 