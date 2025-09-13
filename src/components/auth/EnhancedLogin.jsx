import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { AuthContext } from '../../contexts/AuthContext';
import enhancedAuthService, { LoginError } from '../../services/authService_enhanced';

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 30px;
  font-size: 16px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${props => props.hasError ? '#ff4757' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: ${props => props.hasError ? '#fff5f5' : 'white'};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff4757' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(255, 71, 87, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #a0a9b8;
  }
`;

const ErrorMessage = styled.span`
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: #555;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const DemoCredentials = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 12px;
  color: #6c757d;
`;

const DemoButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }
`;

const InputHint = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  font-style: italic;
`;

const EnhancedLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email_or_username: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'username'

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-detect if user is entering email or username
    if (name === 'email_or_username') {
      if (value.includes('@')) {
        setLoginMethod('email');
      } else {
        setLoginMethod('username');
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email or username validation
    if (!formData.email_or_username.trim()) {
      newErrors.email_or_username = 'Email or username is required';
    } else if (loginMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_or_username)) {
      newErrors.email_or_username = 'Please enter a valid email address';
    } else if (loginMethod === 'username' && formData.email_or_username.length < 3) {
      newErrors.email_or_username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password is too short';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoCredentials = () => {
    setFormData({
      email_or_username: 'admin@test.com',
      password: 'admin123',
      rememberMe: false
    });
    setLoginMethod('email');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting.', {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 Starting enhanced login process...');
      console.log('📧 Login method detected:', loginMethod);
      
      // Use the enhanced authentication service with your API format
      const result = await enhancedAuthService.login({
        email_or_username: formData.email_or_username,
        email: formData.email_or_username, // Include both formats
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      console.log('✅ Login successful:', result);

      // Show success message
      toast.success(`🎉 Welcome back, ${result.user.first_name || result.user.email || 'User'}!`, {
        position: "top-right",
        autoClose: 2000,
      });

      // Update auth context with user data
      login(result);

      // Clear form
      setFormData({
        email_or_username: '',
        password: '',
        rememberMe: false
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);

    } catch (error) {
      console.error('❌ Login failed:', error);

      if (error instanceof LoginError) {
        // Handle specific login errors
        if (error.statusCode === 401) {
          setErrors({ 
            email_or_username: 'Invalid email/username or password',
            password: 'Invalid email/username or password'
          });
          toast.error('Invalid email/username or password', {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (error.details && error.details.errors) {
          // Handle field-specific errors
          if (Array.isArray(error.details.errors)) {
            error.details.errors.forEach(err => {
              toast.error(err, { position: "top-right", autoClose: 5000 });
            });
          } else if (typeof error.details.errors === 'object') {
            const fieldErrors = {};
            for (const [field, messages] of Object.entries(error.details.errors)) {
              if (Array.isArray(messages)) {
                fieldErrors[field] = messages[0];
              } else {
                fieldErrors[field] = messages;
              }
            }
            setErrors(fieldErrors);
          }
        } else {
          toast.error(error.message, { position: "top-right", autoClose: 5000 });
        }
      } else {
        toast.error(error.message || 'Login failed. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ToastContainer />
      <LoginCard>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your account</Subtitle>

        <DemoCredentials>
          <strong>Demo Credentials:</strong><br />
          Email: admin@test.com<br />
          Password: admin123
          <DemoButton onClick={fillDemoCredentials} type="button">
            Fill Demo Credentials
          </DemoButton>
        </DemoCredentials>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email_or_username">
              {loginMethod === 'email' ? 'Email Address' : 'Username'} *
            </Label>
            <Input
              type={loginMethod === 'email' ? 'email' : 'text'}
              id="email_or_username"
              name="email_or_username"
              value={formData.email_or_username}
              onChange={handleInputChange}
              placeholder="Enter your email or username"
              hasError={!!errors.email_or_username}
              disabled={isLoading}
              autoComplete="username"
            />
            {!errors.email_or_username && (
              <InputHint>
                {loginMethod === 'email' 
                  ? 'Email detected - e.g., user@example.com'
                  : 'Username detected - e.g., john_doe'
                }
              </InputHint>
            )}
            {errors.email_or_username && <ErrorMessage>{errors.email_or_username}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password *</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              hasError={!!errors.password}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Remember me for 30 days
            </CheckboxLabel>
          </CheckboxContainer>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </Form>

        <LinksContainer>
          <StyledLink to="/forgot-password">Forgot Password?</StyledLink>
          <StyledLink to="/register-enhanced">Create Account</StyledLink>
        </LinksContainer>
      </LoginCard>
    </Container>
  );
};

export default EnhancedLogin;
