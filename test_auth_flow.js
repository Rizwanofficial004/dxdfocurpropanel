#!/usr/bin/env node

// Test Registration and Login Flow
import https from 'https';

const API_BASE_URL = 'https://dxdtime.ddsolutions.io/api';

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const result = {
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        body: body,
                        data: body ? JSON.parse(body) : null
                    };
                    resolve(result);
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        headers: res.headers,
                        body: body,
                        parseError: error.message
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testRegistration() {
    console.log('🔄 Testing Registration...');
    
    const userData = {
        username: 'testuser@example.com',  // Added username field
        email: 'testuser@example.com',
        password: 'testpass123',
        organization_name: 'Test Organization',
        country: 'Cyprus',
        first_name: 'Test',
        last_name: 'User'
    };
    
    const options = {
        hostname: 'dxdtime.ddsolutions.io',
        port: 443,
        path: '/api/auth/register/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Node.js Test Script'
        }
    };
    
    try {
        const result = await makeRequest(options, userData);
        console.log('📝 Registration Result:');
        console.log(`   Status: ${result.status} ${result.statusText}`);
        console.log(`   Headers:`, result.headers);
        console.log(`   Body:`, result.body);
        
        if (result.data) {
            console.log(`   Parsed Data:`, result.data);
        }
        
        return result.status === 200 || result.status === 201;
    } catch (error) {
        console.error('❌ Registration Error:', error.message);
        return false;
    }
}

async function testLogin(email = 'hb@example.com', password = 'password123') {
    console.log(`🔐 Testing Login with ${email}...`);
    
    const loginData = {
        username: email,
        password: password
    };
    
    const options = {
        hostname: 'dxdtime.ddsolutions.io',
        port: 443,
        path: '/api/auth/login/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Node.js Test Script'
        }
    };
    
    try {
        const result = await makeRequest(options, loginData);
        console.log('🔑 Login Result:');
        console.log(`   Status: ${result.status} ${result.statusText}`);
        console.log(`   Headers:`, result.headers);
        console.log(`   Body:`, result.body);
        
        if (result.data) {
            console.log(`   Parsed Data:`, result.data);
            if (result.data.access_token || result.data.token) {
                console.log('✅ Login successful - Token received');
                return { success: true, token: result.data.access_token || result.data.token };
            }
        }
        
        return { success: result.status === 200, data: result.data };
    } catch (error) {
        console.error('❌ Login Error:', error.message);
        return { success: false, error: error.message };
    }
}

async function testApiEndpoints() {
    console.log('🌐 Testing API Endpoints...');
    
    const endpoints = [
        '/auth/login/',
        '/auth/register/',
        '/api/auth/login/',
        '/api/auth/register/'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`📍 Testing ${endpoint}...`);
        
        const options = {
            hostname: 'dxdtime.ddsolutions.io',
            port: 443,
            path: endpoint,
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5175',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        };
        
        try {
            const result = await makeRequest(options);
            console.log(`   Status: ${result.status}`);
            console.log(`   CORS Headers:`, {
                'Access-Control-Allow-Origin': result.headers['access-control-allow-origin'],
                'Access-Control-Allow-Methods': result.headers['access-control-allow-methods'],
                'Access-Control-Allow-Headers': result.headers['access-control-allow-headers']
            });
        } catch (error) {
            console.log(`   Error: ${error.message}`);
        }
    }
}

async function runTests() {
    console.log('🧪 Starting Authentication Test Suite');
    console.log('🎯 Target API:', API_BASE_URL);
    console.log('=' .repeat(50));
    
    // Test API endpoints first
    await testApiEndpoints();
    console.log('');
    
    // Test known working credentials from Postman
    console.log('📮 Testing Postman credentials...');
    const postmanResult = await testLogin('hb@example.com', 'password123');
    console.log('');
    
    // Try registration
    console.log('📝 Testing registration...');
    const registrationSuccess = await testRegistration();
    console.log('');
    
    // If registration succeeded, try login with new user
    if (registrationSuccess) {
        console.log('👤 Testing login with new user...');
        await testLogin('testuser@example.com', 'testpass123');
    }
    
    console.log('=' .repeat(50));
    console.log('🎯 Test Summary:');
    console.log(`   Postman Login: ${postmanResult.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`   Registration: ${registrationSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. Check the HTML test page for browser-specific issues');
    console.log('   2. Compare request headers between Node.js and browser');
    console.log('   3. Verify CORS configuration on the server');
}

// Run the tests
runTests().catch(console.error);
