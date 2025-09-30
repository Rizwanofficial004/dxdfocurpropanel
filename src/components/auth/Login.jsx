import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../../services/auth.service';
import { useUser } from '../../context/UserContext';

const Container = styled.div`
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Button = styled.button`
  padding: 12px;
  background: #0066FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;

  &:hover {
    background: #0052CC;
  }

  &:disabled {
    background: #E5E7EB;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #DC2626;
  font-size: 14px;
  text-align: center;
  background: #FEF2F2;
  border: 1px solid #FEE2E2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ForgotPassword = styled.a`
  color: #0066FF;
  font-size: 14px;
  text-decoration: none;
  text-align: right;
  margin-top: -12px;

  &:hover {
    text-decoration: underline;
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6B7280;

  a {
    color: #0066FF;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      
      if (response.success) {
        // Update user context with user data
        updateUser(authService.getCurrentUser());
        // Redirect based on user role
        const userData = authService.getCurrentUser();
        if (userData.isStaff) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError(error.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Welcome Back</Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            autoComplete="username"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </FormGroup>

        <ForgotPassword href="/forgot-password">Forgot password?</ForgotPassword>

        <Button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Form>

      <RegisterLink>
        Don't have an account?
        <a href="/register">Create account</a>
      </RegisterLink>
    </Container>
  );
};

export default Login;
