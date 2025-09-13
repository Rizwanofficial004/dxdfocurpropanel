import React, { useState } from 'react';
import authService from '../services/authService';

const RegistrationTester = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test data that matches your exact specification
  const testData = {
    email: 'abcddef@example.com',
    username: 'abcddef',
    password: '12345678Aaaef',
    passwordConfirm: '12345678Aaaef',
    firstName: 'abcddef',
    lastName: 'defddef',
    organizationName: 'Test abcddef',
    country: 'USA'
  };

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing registration with data:', testData);
      
      // This will be transformed by authService to the correct API format
      const response = await authService.register(testData);
      
      console.log('✅ Registration response:', response);
      setResult({
        success: true,
        data: response,
        message: 'Registration successful!'
      });
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setResult({
        success: false,
        error: error.message,
        message: 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const showDataFormat = () => {
    // Show exactly what gets sent to the API
    const apiData = {
      email: testData.email,
      username: testData.username,
      password: testData.password,
      password_confirm: testData.passwordConfirm,
      first_name: testData.firstName,
      last_name: testData.lastName,
      organization_name: testData.organizationName,
      country: testData.country
    };

    console.log('📋 Frontend form data:', testData);
    console.log('🚀 API request data:', apiData);
    
    alert(`Data format check:\n\nFrontend form data:\n${JSON.stringify(testData, null, 2)}\n\nAPI request data:\n${JSON.stringify(apiData, null, 2)}`);
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '20px auto', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>Registration API Tester</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <h3>Test Data (matches your specification):</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
{JSON.stringify({
  email: "abcddef@example.com",
  username: "abcddef", 
  password: "12345678Aaaef",
  password_confirm: "12345678Aaaef",
  first_name: "abcddef",
  last_name: "defddef",
  organization_name: "Test abcddef",
  country: "USA"
}, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={showDataFormat}
          style={{ 
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Show Data Format
        </button>
        
        <button 
          onClick={handleTest}
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: loading ? '#9CA3AF' : '#0066FF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Registration API'}
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '15px',
          borderRadius: '6px',
          backgroundColor: result.success ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${result.success ? '#BBF7D0' : '#FECACA'}`,
          color: result.success ? '#059669' : '#DC2626'
        }}>
          <h3>{result.message}</h3>
          <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', overflow: 'auto' }}>
            {JSON.stringify(result.success ? result.data : { error: result.error }, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
        <h4>🔍 How it works:</h4>
        <ol style={{ fontSize: '14px' }}>
          <li>Frontend form collects data in camelCase format</li>
          <li>authService.register() transforms it to API format (snake_case)</li>
          <li>Data is sent to /api/auth/register/ endpoint</li>
          <li>API responds with user data and token</li>
          <li>Token is stored in localStorage for authentication</li>
        </ol>
      </div>
    </div>
  );
};

export default RegistrationTester;
