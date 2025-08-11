import React, { useState } from 'react';
import { authAPI } from '../services/api';

const APIConnectionTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPIConnection = async () => {
    setLoading(true);
    setTestResult('Testing API connection...');
    
    try {
      // Test the login endpoint
      const response = await authAPI.login({
        username: 'admin',
        password: 'admin123'
      });
      
      console.log('API Test Response:', response.data);
      setTestResult(`✅ API Connection Successful! Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      console.error('API Test Error:', error);
      
      if (error.response) {
        setTestResult(`❌ Server Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setTestResult(`❌ Network Error: No response received. Check if the API server is running.`);
      } else {
        setTestResult(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>API Connection Test</h3>
      <button 
        onClick={testAPIConnection} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      <pre style={{ 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {testResult}
      </pre>
    </div>
  );
};

export default APIConnectionTest;
