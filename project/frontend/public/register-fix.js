/**
 * Patient Registration Fix - REGISTRATION DISABLED
 * 
 * This script has been modified to disable patient registration functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Find the registration form
    const registerForm = document.querySelector('form');
    
    if (registerForm) {
        console.log('Registration form found, adding submission handler');
        
        // Add event listener to the form
        registerForm.addEventListener('submit', function(event) {
            // Prevent default form submission
            event.preventDefault();
            
            // Show message that registration is disabled
            console.log('Patient registration is currently disabled');
            alert('Patient registration functionality has been disabled.');
            
            // Optional: Redirect to homepage or dashboard
            // window.location.href = '/dashboard';
        });
    } else {
        console.warn('Registration form not found');
    }
});

// Run on page load for the register page
if (window.location.pathname.includes('register')) {
    console.log('Register page detected, initializing fix script');
} 