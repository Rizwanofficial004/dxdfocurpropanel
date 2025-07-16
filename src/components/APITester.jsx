import React, { useState } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 2px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
`;

const TestButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;

  &:hover {
    background: #5a67d8;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ResultArea = styled.pre`
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const APITester = () => {
  const [result, setResult] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const testDirectFetch = async () => {
    setResult('Testing direct fetch...');
    try {
      const response = await fetch('https://dxdtime.ddsolutions.io/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Admin',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      setResult(`Status: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error.message}\n\nMake sure:\n1. Backend is running on http://localhost:8000\n2. CORS is enabled\n3. The endpoint exists`);
    }
  };

  const testAxios = async () => {
    setResult('Testing with axios...');
    try {
      const axios = await import('axios');
      const response = await axios.default.post('https://dxdtime.ddsolutions.io/api/auth/login/', {
        username: 'Admin',
        password: 'admin123'
      });
      
      setResult(`Status: ${response.status}\nResponse: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      setResult(`Axios Error: ${error.message}\nResponse: ${error.response ? JSON.stringify(error.response.data, null, 2) : 'No response'}`);
    }
  };

  const clearResult = () => {
    setResult('');
  };

  if (!isVisible) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        <TestButton onClick={() => setIsVisible(true)}>
          Show API Tester
        </TestButton>
      </div>
    );
  }

  return (
    <TestContainer>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        API Connection Tester
        <button 
          onClick={() => setIsVisible(false)}
          style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      
      <div>
        <TestButton onClick={testDirectFetch}>Test Direct Fetch</TestButton>
        <TestButton onClick={testAxios}>Test Axios</TestButton>
        <TestButton onClick={clearResult}>Clear</TestButton>
      </div>
      
      {result && (
        <div>
          <strong>Result:</strong>
          <ResultArea>{result}</ResultArea>
        </div>
      )}
    </TestContainer>
  );
};

export default APITester;
