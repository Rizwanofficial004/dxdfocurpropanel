import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../dashboard/context/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import authService, { DUMMY_CREDENTIALS } from '../../services/authService';
import {
  LoginContainer,
  LoginCard,
  AnimationContainer,
  SpinnerBox,
  BlueOrbit,
  GreenOrbit,
  RedOrbit,
  WhiteOrbit1,
  WhiteOrbit2,
  WhiteOrbit3,
  CentralCore,
  LogoSection,
  FocusLogo,
  Title,
  Subtitle,
  Form,
  InputGroup,
  Label,
  InputContainer,
  Input,
  InputIcon,
  PasswordToggle,
  CheckboxContainer,
  CheckboxGroup,
  Checkbox,
  CheckboxLabel,
  ForgotLink,
  LoginButton,
  RegisterSection,
  RegisterLink,
  ErrorMessage,
  LoadingSpinner,
  DemoSection,
  DemoTitle,
  DemoText,
  DemoButton,
  DemoCredentials,
  DemoFillButton
} from './Login.styles';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDummyCredentials, setShowDummyCredentials] = useState(false);

  // Auto-fill dummy credentials for testing
  const fillDummyCredentials = () => {
    setFormData({
      ...formData,
      username: DUMMY_CREDENTIALS.username,
      password: DUMMY_CREDENTIALS.password
    });
    setShowDummyCredentials(false);
  };

  // Test API directly with working credentials
  const testApiDirectly = async () => {
    console.log('🧪 Testing API directly with known working credentials...');
    setIsLoading(true);
    
    try {
      const response = await fetch('https://dxdtime.ddsolutions.io/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: 'hb@example.com',
          password: 'password123'
        }),
      });
      
      console.log('🔍 Direct API Test Response Status:', response.status);
      console.log('🔍 Direct API Test Response Headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('🔍 Direct API Test Response Body:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('✅ Direct API test successful:', data);
        alert('✅ Direct API test successful! Check console for details.');
      } else {
        console.error('❌ Direct API test failed:', response.status, responseText);
        alert(`❌ Direct API test failed: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error('🚫 Direct API test error:', error);
      alert(`🚫 Direct API test error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Email address is required';
    } else if (!formData.username.includes('@')) {
      newErrors.username = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 Starting authentication process...');
      console.log('📋 Login data:', {
        username: formData.username,
        rememberMe: formData.rememberMe
      });
      
      // Use the authentication service for login
      const userData = await authService.login(
        formData.username, 
        formData.password, 
        formData.rememberMe
      );
      
      console.log('✅ Authentication successful:', userData);
      console.log('👤 User data:', userData.user);
      console.log('🔑 Token received:', userData.token ? 'Yes' : 'No');
      
      // Update auth context with user data
      login(userData);
      
      // Show success message
      console.log('🎉 User logged in successfully!');
      alert(`🎉 Login successful! Welcome back ${userData.user?.first_name || userData.user?.email}!`);
      
      // Redirect to admin panel
      navigate('/admin-panel', { replace: true });
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Set appropriate error message
      setErrors({
        general: error.message || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <AnimationContainer>
        <SpinnerBox>
          <BlueOrbit />
          <GreenOrbit />
          <RedOrbit />
          <WhiteOrbit1 />
          <WhiteOrbit2 />
          <WhiteOrbit3 />
          <CentralCore />
        </SpinnerBox>
      </AnimationContainer>

      <LoginCard>
        <LogoSection>
          {/* <FocusLogo>FOCUS</FocusLogo> */}
          <Title>{t('welcome')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </LogoSection>

        {/* Demo Credentials Helper */}
        <DemoSection>
          <DemoTitle>Demo Access</DemoTitle>
          <DemoText>API Backend: Django REST API</DemoText>
          <DemoText>Fallback Credentials Available</DemoText>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <DemoButton type="button" onClick={() => setShowDummyCredentials(!showDummyCredentials)}>
              {showDummyCredentials ? 'Hide' : 'Show'} Demo Credentials
            </DemoButton>
            <DemoButton type="button" onClick={testApiDirectly} disabled={isLoading}>
              🧪 Test API Direct
            </DemoButton>
          </div>
          {showDummyCredentials && (
            <DemoCredentials>
              <DemoText><strong>Username:</strong> {DUMMY_CREDENTIALS.username}</DemoText>
              <DemoText><strong>Password:</strong> {DUMMY_CREDENTIALS.password}</DemoText>
              <DemoFillButton type="button" onClick={fillDummyCredentials}>
                Fill Form
              </DemoFillButton>
            </DemoCredentials>
          )}
        </DemoSection>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('email')}</Label>
            <InputContainer>
              <Input
                type="email"
                name="username"
                placeholder={t('email')}
                value={formData.username}
                onChange={handleInputChange}
                hasError={!!errors.username}
                required
                autoComplete="email"
              />
              {errors.username && <InputIcon hasError>⚠️</InputIcon>}
            </InputContainer>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Label>{t('password')}</Label>
              <ForgotLink href="#" onClick={e => e.preventDefault()}>
                {t('forgot')}
              </ForgotLink>
            </div>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('password')}
                value={formData.password}
                onChange={handleInputChange}
                hasError={!!errors.password}
                required
                autoComplete="current-password"
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
              {errors.password && <InputIcon hasError>⚠️</InputIcon>}
            </InputContainer>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <CheckboxContainer>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="rememberMe">{t('remember')}</CheckboxLabel>
            </CheckboxGroup>
          </CheckboxContainer>

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                {t('signingIn')}
              </>
            ) : (
              t('signIn')
            )}
          </LoginButton>
        </Form>

        <RegisterSection>
          Don't have a company admin account?
          <RegisterLink href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
            Register
          </RegisterLink>
        </RegisterSection>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
