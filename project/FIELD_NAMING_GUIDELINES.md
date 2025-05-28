# Field Naming Guidelines for AROGITH Patient Management System

This document outlines the standard conventions for field naming between the frontend React Native application and the backend Spring Boot API.

## Key Principles

1. **Consistent Field Naming**: Always use snake_case (`field_name`) for API requests/responses and camelCase (`fieldName`) for internal frontend state.
2. **Automated Conversion**: Use the utility functions in `app/utils/api.ts` to automate field name conversion.
3. **Backend Flexibility**: The backend controller is designed to handle both camelCase and snake_case field names, but snake_case is preferred for API communication.

## Standard Field Names for API Communication

### Patient Fields (snake_case)
```
patient_id
name
surname
father_name
gender
age
address
blood_group
phone_number
aadhar_number
photo
total_visits
```

### Visit Fields (snake_case)
```
visit_id
visit_date
bp
complaint
symptoms
op_no
reg_no
status
temperature
weight
prescription
patient_id
```

## How to Use the API Utilities

The `app/utils/api.ts` file provides standardized utilities for API communication:

```typescript
// Import the API utilities
import { patientsApi, visitsApi, toSnakeCase, toCamelCase } from '../utils/api';

// Get all patients (returns with camelCase field names)
const patients = await patientsApi.getAll();

// Create a new patient (automatically converts to snake_case)
await patientsApi.create({
  name: 'John',
  surname: 'Doe',
  fatherName: 'Smith Doe', // Will be converted to father_name
  gender: 'Male',
  age: 35
});

// Add a visit for a patient (automatically converts to snake_case)
await visitsApi.create(patientId, {
  bp: '120/80',
  weight: '70kg',
  temperature: '98.6',
  symptoms: 'Fever', // Will be converted to symptoms
  complaint: 'Headache'
});
```

## Field Name Mapping Reference

| Frontend (camelCase) | Backend (snake_case) |
|----------------------|----------------------|
| patientId            | patient_id           |
| fatherName           | father_name          |
| bloodGroup           | blood_group          |
| phoneNumber          | phone_number         |
| aadharNumber         | aadhar_number        |
| totalVisits          | total_visits         |
| visitId              | visit_id             |
| visitDate            | visit_date           |
| symptoms             | symptoms             |
| opNo                 | op_no                |
| regNo                | reg_no               |

## Troubleshooting

If encountering issues with field name mismatches:

1. Always use the API utility functions from `app/utils/api.ts`
2. Check the browser console or react-native logs for field validation errors
3. Verify the request payload structure using the Network tab in browser developer tools
4. Refer to the PatientController.java file for accepted field names on the backend

## Recommendations for Future Development

1. **New Fields**: Add mappings to both the frontend interfaces and backend DTOs
2. **Validation**: Add validation for required fields in both frontend and backend
3. **Error Handling**: Use the standardized error format from the ApiError class
4. **Documentation**: Update this document when adding new fields or APIs

By following these guidelines, we maintain a consistent field naming convention that minimizes errors and enhances maintainability. 