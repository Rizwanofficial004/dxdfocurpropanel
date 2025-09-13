// Test Registration API
const testRegistration = async () => {
  const testData = {
    email: "abcddef@example.com",
    username: "abcddef",
    password: "12345678Aaaef",
    password_confirm: "12345678Aaaef",
    first_name: "abcddef",
    last_name: "defddef",
    organization_name: "Test abcddef",
    country: "USA"
  };

  console.log('🧪 Testing registration API...');
  console.log('📋 Test data:', testData);

  try {
    // Test via proxy (local development)
    console.log('\n🔄 Testing via Vite proxy...');
    const proxyResponse = await fetch('/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Proxy response status:', proxyResponse.status);
    console.log('📋 Proxy response headers:', Object.fromEntries(proxyResponse.headers.entries()));

    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      console.log('✅ Proxy registration successful:', proxyData);
      return proxyData;
    } else {
      const proxyError = await proxyResponse.text();
      console.log('❌ Proxy registration failed:', proxyError);
    }

  } catch (proxyErr) {
    console.log('❌ Proxy request failed:', proxyErr.message);
  }

  try {
    // Test direct API (production)
    console.log('\n🔄 Testing direct API call...');
    const directResponse = await fetch('https://dxdtime.ddsolutions.io/api/auth/register/', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Direct response status:', directResponse.status);
    console.log('📋 Direct response headers:', Object.fromEntries(directResponse.headers.entries()));

    if (directResponse.ok) {
      const directData = await directResponse.json();
      console.log('✅ Direct registration successful:', directData);
      return directData;
    } else {
      const directError = await directResponse.text();
      console.log('❌ Direct registration failed:', directError);
    }

  } catch (directErr) {
    console.log('❌ Direct request failed:', directErr.message);
  }

  console.log('❌ All registration attempts failed');
  return null;
};

// Export for use in browser console
window.testRegistration = testRegistration;

// Auto-run test
testRegistration();
