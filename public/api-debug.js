// Quick API Test Debug Tool
// Test if the users search API is working

console.log('🔧 Starting API Debug Test...');

// Test 1: Check if proxy is working
async function testAPI() {
  console.log('📡 Testing API endpoints...');
  
  // Test the proxy endpoint
  try {
    console.log('🔍 Testing proxy endpoint: /api/users/search/');
    const response = await fetch('/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=nawaz', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Proxy Response Status:', response.status);
    console.log('✅ Proxy Response Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proxy Response Data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Proxy Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Proxy Test Error:', error);
  }
  
  // Test direct localhost endpoint
  try {
    console.log('🔍 Testing direct localhost endpoint: http://127.0.0.1:8000/api/users/search/');
    const response = await fetch('http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=nawaz', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Direct Response Status:', response.status);
    console.log('✅ Direct Response Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct Response Data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Direct Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Direct Test Error:', error);
  }
  
  // Test production endpoint via proxy
  try {
    console.log('🔍 Testing production endpoint via proxy...');
    const response = await fetch('/api/users/s3-suggestions/?q=nawaz&limit=10', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Production Response Status:', response.status);
    console.log('✅ Production Response Headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Production Response Data:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Production Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Production Test Error:', error);
  }
}

// Run the test
testAPI().then(() => {
  console.log('🏁 API Debug Test Complete!');
}).catch(error => {
  console.error('🚨 API Debug Test Failed:', error);
});

// Make it available globally for manual testing
window.testAPI = testAPI;