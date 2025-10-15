import React, { useState } from 'react';
import styled from 'styled-components';
import enhancedAuthService from '../services/authService_enhanced.js';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

// Styled Components (reuse from registration tester)
const Container = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  color: #444;
  margin-bottom: 15px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: #5a67d8;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestButton = styled(Button)`
  background: #48bb78;
  margin-left: 10px;
  
  &:hover:not(:disabled) {
    background: #38a169;
  }
`;

const ResponseBox = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  
  overflow-y: auto;
`;

const ErrorBox = styled(ResponseBox)`
  background: #fed7d7;
  border-color: #fc8181;
  color: #c53030;
`;

const SuccessBox = styled(ResponseBox)`
  background: #c6f6d5;
  border-color: #68d391;
  color: #2f855a;
`;

const EndpointInfo = styled.div`
  background: #edf2f7;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-family: monospace;
  font-size: 14px;
`;

const QuickFillButton = styled.button`
  background: #ed8936;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 10px;
  margin-right: 10px;
  
  &:hover {
    background: #dd6b20;
  }
`;

const LoginAPITester = () => {
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
    login_format: 'email_or_username' // 'email_or_username', 'email', 'username'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fillDemoCredentials = () => {
    setFormData({
      email_or_username: 'admin@test.com',
      password: 'admin123',
      login_format: 'email'
    });
  };

  const fillUsernameCredentials = () => {
    setFormData({
      email_or_username: 'admin',
      password: 'admin123',
      login_format: 'username'
    });
  };

  const testLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      console.log('🧪 Testing login with enhanced auth service...');
      
      const result = await enhancedAuthService.login({
        email_or_username: formData.email_or_username,
        email: formData.email_or_username,
        password: formData.password,
        rememberMe: false
      });
      
      setResponse(JSON.stringify(result, null, 2));
      console.log('✅ Login test successful:', result);
      
    } catch (err) {
      console.error('❌ Login test failed:', err);
      setError(`Error: ${err.message}\n\nDetails: ${JSON.stringify(err.details || {}, null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      console.log('🧪 Testing direct API call...');
      
      const endpoint = buildApiUrl(API_ENDPOINTS.AUTH.LOGIN);
      console.log('📡 API Endpoint:', endpoint);
      
      // Create payload based on selected format
      let payload;
      if (formData.login_format === 'email_or_username') {
        payload = {
          email_or_username: formData.email_or_username,
          password: formData.password
        };
      } else if (formData.login_format === 'email') {
        payload = {
          email: formData.email_or_username,
          password: formData.password
        };
      } else {
        payload = {
          username: formData.email_or_username,
          password: formData.password
        };
      }

      console.log('📤 Payload:', { ...payload, password: '***' });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw_response: responseText };
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };

      if (response.ok) {
        setResponse(JSON.stringify(result, null, 2));
      } else {
        setError(JSON.stringify(result, null, 2));
      }

    } catch (err) {
      console.error('❌ Direct API test failed:', err);
      setError(`Network Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllEndpoints = async () => {
    setIsLoading(true);
    setResponse('');
    setError('');

    const endpoints = [
      '/auth/login/',
      '/api/auth/login/',
      '/login/',
      '/auth/token/',
      '/api-token-auth/',
      '/token/'
    ];

    const payloadFormats = [
      {
        name: 'email_or_username format',
        payload: {
          email_or_username: formData.email_or_username,
          password: formData.password
        }
      },
      {
        name: 'email format',
        payload: {
          email: formData.email_or_username,
          password: formData.password
        }
      },
      {
        name: 'username format',
        payload: {
          username: formData.email_or_username,
          password: formData.password
        }
      }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      results[endpoint] = {};
      
      for (const format of payloadFormats) {
        try {
          console.log(`🔍 Testing endpoint: ${endpoint} with ${format.name}`);
          
          const fullUrl = buildApiUrl(endpoint);
          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(format.payload),
          });

          results[endpoint][format.name] = {
            status: response.status,
            statusText: response.statusText,
            available: response.status !== 404
          };

          if (response.status !== 404) {
            const responseText = await response.text();
            try {
              results[endpoint][format.name].data = JSON.parse(responseText);
            } catch {
              results[endpoint][format.name].data = { raw: responseText };
            }
          }

        } catch (err) {
          results[endpoint][format.name] = {
            error: err.message,
            available: false
          };
        }
      }
    }

    setResponse(JSON.stringify(results, null, 2));
    setIsLoading(false);
  };

  return (
    <Container>
      <Title>Login API Tester</Title>
      
      <Section>
        <SectionTitle>API Configuration</SectionTitle>
        <EndpointInfo>
          <strong>Primary Endpoint:</strong> {buildApiUrl(API_ENDPOINTS.AUTH.LOGIN)}<br/>
          <strong>Method:</strong> POST<br/>
          <strong>Content-Type:</strong> application/json<br/>
          <strong>Supported Formats:</strong> email, email_or_username, username
        </EndpointInfo>
      </Section>

      <Section>
        <SectionTitle>Login Credentials</SectionTitle>
        <QuickFillButton onClick={fillDemoCredentials} type="button">
          Fill Email Demo
        </QuickFillButton>
        <QuickFillButton onClick={fillUsernameCredentials} type="button">
          Fill Username Demo
        </QuickFillButton>
        
        <Form onSubmit={testLogin}>
          <FormGroup>
            <Label>Email or Username *</Label>
            <Input
              type="text"
              name="email_or_username"
              value={formData.email_or_username}
              onChange={handleInputChange}
              placeholder="admin@test.com or admin"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Password *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="admin123"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>API Format</Label>
            <Select
              name="login_format"
              value={formData.login_format}
              onChange={handleInputChange}
            >
              <option value="email_or_username">email_or_username (Your API)</option>
              <option value="email">email only</option>
              <option value="username">username only</option>
            </Select>
          </FormGroup>
        </Form>

        <div>
          <Button onClick={testLogin} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Enhanced Auth Service'}
          </Button>
          
          <TestButton onClick={testDirectAPI} disabled={isLoading}>
            Test Direct API Call
          </TestButton>
          
          <TestButton onClick={testAllEndpoints} disabled={isLoading}>
            Test All Endpoints & Formats
          </TestButton>
        </div>
      </Section>

      {response && (
        <Section>
          <SectionTitle>✅ Success Response</SectionTitle>
          <SuccessBox>{response}</SuccessBox>
        </Section>
      )}

      {error && (
        <Section>
          <SectionTitle>❌ Error Response</SectionTitle>
          <ErrorBox>{error}</ErrorBox>
        </Section>
      )}

      <Section>
        <SectionTitle>Expected API Response Formats</SectionTitle>
        <ResponseBox>
{`// Your API Format 1:
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Your API Format 2:
{
  "email_or_username": "user@example.com",
  "password": "SecurePass123"
}

// Successful Login Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 123,
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "last_login": "2025-01-01T00:00:00Z"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}

// Error Response:
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Authentication failed"
}`}
        </ResponseBox>
      </Section>
    </Container>
  );
};

export default LoginAPITester;
