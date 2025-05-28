// Simple script to test API connectivity
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8084/api';

async function testApiConnection() {
  try {
    console.log('Testing API health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/auth/health`);
    const healthStatus = await healthResponse.text();
    console.log(`Health check status: ${healthResponse.status}`);
    console.log(`Health check response: ${healthStatus}`);

    console.log('\nTesting test nurse creation endpoint...');
    const nurseResponse = await fetch(`${API_BASE_URL}/auth/register-test-nurse`);
    const nurseData = await nurseResponse.json();
    console.log(`Nurse creation status: ${nurseResponse.status}`);
    console.log('Nurse data:', nurseData);

    console.log('\nTesting login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nurse_id: 'N1001',
        password: 'password',
      }),
    });
    const loginData = await loginResponse.json();
    console.log(`Login status: ${loginResponse.status}`);
    console.log('Login response:', loginData);
  } catch (error) {
    console.error('Error connecting to API:', error);
  }
}

testApiConnection(); 