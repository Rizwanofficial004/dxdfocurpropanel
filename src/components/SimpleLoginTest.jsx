import React, { useState } from 'react';
import axios from 'axios';

const SimpleLoginTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Starting test login...');
      
      const response = await axios.post('https://dxdtime.ddsolutions.io/api/auth/login/', {
        username: 'Admin',
        password: 'admin123'
      }, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response received:', response);
      setResult(`SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
      
    } catch (error) {
      console.error('Error occurred:', error);
      if (error.code === 'ECONNABORTED') {
        setResult('ERROR: Request timeout - Backend might not be running');
      } else if (error.response) {
        setResult(`ERROR: Server responded with status ${error.response.status}\nData: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        setResult('ERROR: No response from server - Check if backend is running on http://localhost:8000');
      } else {
        setResult(`ERROR: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      left: '20px', 
      background: 'white', 
      padding: '20px', 
      border: '2px solid red',
      borderRadius: '8px',
      zIndex: 9999,
      maxWidth: '500px'
    }}>
      <h3>Simple Login Test</h3>
      <button onClick={testLogin} disabled={loading} style={{
        padding: '10px 20px',
        background: loading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}>
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      
      {result && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default SimpleLoginTest;
