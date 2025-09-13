// Direct API Test for Registration
async function testRegistrationAPI() {
    console.log('🧪 Testing registration API directly...');
    
    const testData = {
        email: "test" + Date.now() + "@example.com",
        username: "testuser" + Date.now(),
        password: "TestPass123!",
        password_confirm: "TestPass123!",
        first_name: "Test",
        last_name: "User",
        organization_name: "Test Organization",
        country: "USA"
    };
    
    console.log('📋 Test data:', testData);
    
    try {
        // Test via proxy first
        console.log('\n🔄 Testing via Vite proxy (/api/auth/register/)...');
        const proxyResponse = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Proxy response status:', proxyResponse.status);
        console.log('📋 Proxy response headers:', Object.fromEntries(proxyResponse.headers.entries()));
        
        const proxyText = await proxyResponse.text();
        console.log('📄 Proxy response body (first 500 chars):', proxyText.substring(0, 500));
        
        if (proxyResponse.status === 200) {
            try {
                const proxyData = JSON.parse(proxyText);
                console.log('✅ Proxy registration successful:', proxyData);
                return;
            } catch (e) {
                console.log('❌ Proxy response not valid JSON');
            }
        }
        
    } catch (error) {
        console.error('❌ Proxy test failed:', error);
    }
    
    // Test different endpoints
    const endpoints = [
        '/auth/register/',
        '/api/register/',
        '/register/',
        '/auth/signup/',
        '/api/auth/signup/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n🔍 Testing endpoint: ${endpoint}`);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            console.log(`📡 ${endpoint} status:`, response.status);
            
            if (response.status !== 404) {
                const text = await response.text();
                console.log(`📄 ${endpoint} response (first 200 chars):`, text.substring(0, 200));
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint} failed:`, error.message);
        }
    }
}

// Run test
testRegistrationAPI();
