import React, { useState } from 'react';
import styled from 'styled-components';
import enhancedAuthService from '../services/authService_enhanced.js';
import { buildApiUrl, API_ENDPOINTS } from '../config/api.js';

// Styled Components
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
  
  &:hover {
    background: #dd6b20;
  }
`;

const RegistrationAPITester = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    organization_name: '',
    country: ''
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

  const fillSampleData = () => {
    const timestamp = Date.now();
    setFormData({
      username: `user${timestamp}@example.com`,
      email: `user${timestamp}@example.com`,
      password: 'SecurePass123',
      password_confirm: 'SecurePass123',
      first_name: 'John',
      last_name: 'Doe',
      organization_name: 'Test Organization',
      country: 'United States'
    });
  };

  const testRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      console.log('🧪 Testing registration with enhanced auth service...');
      
      const result = await enhancedAuthService.register(formData);
      
      setResponse(JSON.stringify(result, null, 2));
      console.log('✅ Registration test successful:', result);
      
    } catch (err) {
      console.error('❌ Registration test failed:', err);
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
      
      const endpoint = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER);
      console.log('📡 API Endpoint:', endpoint);
      
      const payload = {
        username: formData.email,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm || formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        organization_name: formData.organization_name,
        country: formData.country
      };

      console.log('📤 Payload:', payload);

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
      '/auth/register/',
      '/api/auth/register/',
      '/register/',
      '/auth/signup/',
      '/api/auth/signup/'
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 Testing endpoint: ${endpoint}`);
        
        const fullUrl = buildApiUrl(endpoint);
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        results[endpoint] = {
          status: response.status,
          statusText: response.statusText,
          available: response.status !== 404
        };

        if (response.status !== 404) {
          const responseText = await response.text();
          try {
            results[endpoint].data = JSON.parse(responseText);
          } catch {
            results[endpoint].data = { raw: responseText };
          }
        }

      } catch (err) {
        results[endpoint] = {
          error: err.message,
          available: false
        };
      }
    }

    setResponse(JSON.stringify(results, null, 2));
    setIsLoading(false);
  };

  return (
    <Container>
      <Title>Registration API Tester</Title>
      
      <Section>
        <SectionTitle>API Configuration</SectionTitle>
        <EndpointInfo>
          <strong>Primary Endpoint:</strong> {buildApiUrl(API_ENDPOINTS.AUTH.REGISTER)}<br/>
          <strong>Method:</strong> POST<br/>
          <strong>Content-Type:</strong> application/json
        </EndpointInfo>
      </Section>

      <Section>
        <SectionTitle>Registration Form Data</SectionTitle>
        <QuickFillButton onClick={fillSampleData} type="button">
          Fill Sample Data
        </QuickFillButton>
        
        <Form onSubmit={testRegistration}>
          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="username (defaults to email)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Password *</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="SecurePass123"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleInputChange}
              placeholder="Confirm password"
            />
          </FormGroup>

          <FormGroup>
            <Label>First Name *</Label>
            <Input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="First"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Last Name *</Label>
            <Input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="Last"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Organization Name *</Label>
            <Input
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleInputChange}
              placeholder="Organization"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Country *</Label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Country"
              required
            />
          </FormGroup>
        </Form>

        <div>
          <Button onClick={testRegistration} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Enhanced Auth Service'}
          </Button>
          
          <TestButton onClick={testDirectAPI} disabled={isLoading}>
            Test Direct API Call
          </TestButton>
          
          <TestButton onClick={testAllEndpoints} disabled={isLoading}>
            Test All Endpoints
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
        <SectionTitle>Expected API Response Format</SectionTitle>
        <ResponseBox>
{`// Successful Registration Response:
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 123,
    "username": "user@example.com",
    "email": "user@example.com",
    "first_name": "First",
    "last_name": "Last",
    "organization_name": "Organization",
    "country": "Country",
    "is_active": true,
    "date_joined": "2025-01-01T00:00:00Z"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}

// Error Response:
{
  "success": false,
  "message": "Registration failed",
  "errors": {
    "email": ["This email is already registered."],
    "password": ["Password is too weak."]
  }
}`}
        </ResponseBox>
      </Section>
    </Container>
  );
};

export default RegistrationAPITester;
