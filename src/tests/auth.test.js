import axios from 'axios';

// Test configuration
const API_BASE_URL = 'https://dxdtime.ddsolutions.io/api';
const TEST_USER = {
  email: `test${Date.now()}@test.com`, // Unique email to avoid conflicts
  username: `testuser${Date.now()}`,
  password: "testpassword123",
  organization_name: "Test Org",
  country: "Pakistan"
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m"
};

const logSuccess = (message) => console.log(colors.green + '✓ ' + message + colors.reset);
const logError = (message) => console.log(colors.red + '✗ ' + message + colors.reset);
const logInfo = (message) => console.log(colors.yellow + 'ℹ ' + message + colors.reset);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

async function testRegistration() {
  console.log(colors.bright + '\nTesting Registration API...' + colors.reset);
  try {
    logInfo('Attempting to register new user...');
    logInfo(`Username: ${TEST_USER.username}`);
    logInfo(`Email: ${TEST_USER.email}`);

    const response = await api.post('/auth/register/', {
      email: TEST_USER.email,
      username: TEST_USER.username,
      password: TEST_USER.password,
      organization_name: TEST_USER.organization_name,
      country: TEST_USER.country
    });

    if (response.data.success) {
      logSuccess('Registration successful');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      logError('Registration failed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Registration request failed');
    if (error.response) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function testLogin() {
  console.log(colors.bright + '\nTesting Login API...' + colors.reset);
  try {
    logInfo('Attempting to login...');
    logInfo(`Username: ${TEST_USER.username}`);

    const response = await api.post('/auth/login/', {
      username: TEST_USER.email, // Using email instead of username
      password: TEST_USER.password
    });

    if (response.data.success) {
      logSuccess('Login successful');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      logError('Login failed');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    logError('Login request failed');
    if (error.response) {
      console.log('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log(colors.bright + '\n=== Starting API Tests ===' + colors.reset);
  
  // Test Registration
  const registrationSuccess = await testRegistration();
  
  // If registration was successful, test login
  if (registrationSuccess) {
    // Wait a moment before trying to login
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testLogin();
  }
  
  console.log(colors.bright + '\n=== Tests Complete ===' + colors.reset);
}

// Execute the tests
runTests();
