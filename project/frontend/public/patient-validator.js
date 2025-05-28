/**
 * Patient form validation and submission helper - DISABLED
 */

// Base API URL
const API_BASE_URL = 'http://localhost:8084/api';

// Validate Aadhar number format (12 digits)
function validateAadhar(aadhar) {
    // Remove any spaces
    const cleanAadhar = aadhar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanAadhar);
}

// Validate phone number format (10 digits)
function validatePhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^\d{10}$/.test(cleanPhone);
}

// Validate form data
function validatePatientForm(formData) {
    const errors = {};
    
    // Required fields
    if (!formData.name || formData.name.trim() === '') {
        errors.name = 'Name is required';
    }
    
    if (!formData.surname || formData.surname.trim() === '') {
        errors.surname = 'Surname is required';
    }
    
    if (!formData.aadharNumber || !validateAadhar(formData.aadharNumber)) {
        errors.aadharNumber = 'Valid Aadhar number (12 digits) is required';
    }
    
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
        errors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    return { 
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Format patient data for API submission
function formatPatientData(formData) {
    // Clean Aadhar number (remove spaces)
    if (formData.aadharNumber) {
        formData.aadharNumber = formData.aadharNumber.replace(/\s/g, '');
    }
    
    // Convert age to number if possible
    if (formData.age && !isNaN(parseInt(formData.age))) {
        formData.age = parseInt(formData.age);
    }
    
    return formData;
}

// Submit patient data to the API - DISABLED
async function submitPatient(patientData) {
    console.log('Patient registration functionality has been disabled');
    
    return {
        success: false,
        message: 'Patient registration functionality has been disabled'
    };
} 