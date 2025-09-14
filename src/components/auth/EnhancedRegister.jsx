import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import enhancedAuthService, { RegistrationError } from '../../services/authService_enhanced.js';

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegistrationCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
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

const FormRow = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
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

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff4757' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(255, 71, 87, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #a0a9b8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${props => props.hasError ? '#ff4757' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: ${props => props.hasError ? '#fff5f5' : 'white'};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ff4757' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(255, 71, 87, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const ErrorMessage = styled.span`
  color: #ff4757;
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;

const PasswordStrength = styled.div`
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  background: ${props => {
    switch(props.strength) {
      case 'weak': return '#fff5f5';
      case 'medium': return '#fff8e1';
      case 'strong': return '#f3fff3';
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch(props.strength) {
      case 'weak': return '#ff4757';
      case 'medium': return '#ffa726';
      case 'strong': return '#4caf50';
      default: return 'transparent';
    }
  }};
  border: 1px solid ${props => {
    switch(props.strength) {
      case 'weak': return '#ff4757';
      case 'medium': return '#ffa726';
      case 'strong': return '#4caf50';
      default: return 'transparent';
    }
  }};
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const FeatureList = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #667eea;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '✓';
    background: #4caf50;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-size: 12px;
    font-weight: bold;
  }
`;

// Country list (you can expand this)
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Other'
];

const EnhancedRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    organization_name: '',
    country: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length >= 6 && password.length < 10) return 'medium';
    if (password.length >= 10 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'strong';
    return 'medium';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate username from email if not manually set
    if (name === 'email' && !formData.username) {
      setFormData(prev => ({
        ...prev,
        username: value
      }));
    }

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }

    // Required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = 'Organization name is required';
    }

    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      console.log('📝 Starting enhanced registration process...');
      
      // Use the enhanced authentication service
      const result = await enhancedAuthService.register(formData);
      
      console.log('✅ Registration successful:', result);

      // Show success message
      toast.success(`🎉 Registration successful! Welcome ${result.user.first_name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Update auth context with user data
      login(result);

      // Clear form
      setFormData({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        organization_name: '',
        country: ''
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('❌ Registration failed:', error);

      if (error instanceof RegistrationError) {
        // Handle specific registration errors
        if (error.details && error.details.errors) {
          if (Array.isArray(error.details.errors)) {
            // Array of error messages
            error.details.errors.forEach(err => {
              toast.error(err, { position: "top-right", autoClose: 5000 });
            });
          } else if (typeof error.details.errors === 'object') {
            // Object with field-specific errors
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
        toast.error(error.message || 'Registration failed. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      }

    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch(strength) {
      case 'weak': return 'Weak - Add more characters';
      case 'medium': return 'Medium - Add numbers and special characters';
      case 'strong': return 'Strong - Great password!';
      default: return '';
    }
  };

  return (
    <Container>
      <ToastContainer />
      <RegistrationCard>
        <Title>Create Your Account</Title>
        <Subtitle>Join thousands of organizations worldwide</Subtitle>

        <FeatureList>
          <FeatureItem>Free forever for up to 3 users</FeatureItem>
          <FeatureItem>Complete dashboard access</FeatureItem>
          <FeatureItem>Unlimited teams and shifts</FeatureItem>
          <FeatureItem>Advanced analytics and reporting</FeatureItem>
        </FeatureList>

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                hasError={!!errors.first_name}
                disabled={isLoading}
              />
              {errors.first_name && <ErrorMessage>{errors.first_name}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                hasError={!!errors.last_name}
                disabled={isLoading}
              />
              {errors.last_name && <ErrorMessage>{errors.last_name}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              hasError={!!errors.email}
              disabled={isLoading}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="username">Username *</Label>
            <Input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              hasError={!!errors.username}
              disabled={isLoading}
            />
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="password">Password *</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                hasError={!!errors.password}
                disabled={isLoading}
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              {passwordStrength && formData.password && (
                <PasswordStrength strength={passwordStrength}>
                  {getPasswordStrengthText(passwordStrength)}
                </PasswordStrength>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password_confirm">Confirm Password *</Label>
              <Input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                hasError={!!errors.password_confirm}
                disabled={isLoading}
              />
              {errors.password_confirm && <ErrorMessage>{errors.password_confirm}</ErrorMessage>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="organization_name">Organization Name *</Label>
            <Input
              type="text"
              id="organization_name"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleInputChange}
              placeholder="Enter your organization name"
              hasError={!!errors.organization_name}
              disabled={isLoading}
            />
            {errors.organization_name && <ErrorMessage>{errors.organization_name}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="country">Country *</Label>
            <Select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              hasError={!!errors.country}
              disabled={isLoading}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </Select>
            {errors.country && <ErrorMessage>{errors.country}</ErrorMessage>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </SubmitButton>
        </Form>

        <LoginLink>
          Already have an account? <a href="/login">Sign in here</a>
        </LoginLink>
      </RegistrationCard>
    </Container>
  );
};

export default EnhancedRegister;
