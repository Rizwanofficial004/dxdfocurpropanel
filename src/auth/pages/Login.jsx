import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../dashboard/context/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import authService, { DUMMY_CREDENTIALS, LIVE_TEST_CREDENTIALS } from '../../services/authService';
import toastService from '../../services/toastService';
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
  // Auto-fill dummy credentials for testing
  const fillDummyCredentials = () => {
    setFormData({
      ...formData,
      username: DUMMY_CREDENTIALS.username,
      password: DUMMY_CREDENTIALS.password
    });
  };

  // Quick demo login - fills form and submits automatically
  const quickDemoLogin = async () => {
    console.log('🚀 Quick Demo Login - Auto-filling and submitting...');
    
    // Fill form with working live credentials
    const workingCred = LIVE_TEST_CREDENTIALS[0]; // Use first working credential
    setFormData({
      username: workingCred.username,
      password: workingCred.password,
      rememberMe: false
    });
    
    // Small delay to show the form fill, then submit
    setTimeout(async () => {
      setIsLoading(true);
      setErrors({});

      try {
        console.log('🔐 Starting demo authentication...');
        
        const result = await login({
          username: workingCred.username,
          password: workingCred.password,
          rememberMe: false
        });
        
        console.log('✅ Demo authentication successful:', result);
        
        const userName = result?.user?.first_name || result?.user?.name || result?.username || workingCred.username;
        toastService.success(`🎉 Demo Login successful! Welcome ${userName}!`);
        
        navigate('/admin-panel', { replace: true });
        
      } catch (error) {
        console.error('❌ Demo authentication failed:', error);
        setErrors({
          general: error.message || 'Demo login failed. Please try manual login.'
        });
        toastService.error('❌ Demo login failed. Try manual login with the filled credentials.');
      } finally {
        setIsLoading(false);
      }
    }, 500);
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
      
      const result = await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      console.log('✅ Authentication successful:', result);
      
      const userName = result?.user?.first_name || result?.user?.name || result?.username || formData.username;
      console.log('🎉 User logged in successfully!');
      toastService.success(`🎉 Login successful! Welcome back ${userName}!`);
      
      navigate('/admin-panel', { replace: true });
      
    } catch (error) {
      console.error('❌ Authentication failed:', error);
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
          <Title>{t('welcome')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </LogoSection>

        {/* Demo Login Credentials */}
        <DemoSection>
          <DemoTitle>🔧 Demo Login</DemoTitle>
          <DemoText>Working Test Credentials</DemoText>
          <DemoCredentials style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '10px 0' }}>
            <DemoText><strong>Email:</strong> hb@example.com</DemoText>
            <DemoText><strong>Password:</strong> password123</DemoText>
            <DemoText style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              (Dummy Login - Works Offline)
            </DemoText>
            <DemoFillButton 
              type="button" 
              onClick={() => {
                setFormData({
                  username: 'hb@example.com',
                  password: 'password123',
                  rememberMe: false
                });
              }}
              style={{ 
                marginTop: '8px', 
                backgroundColor: '#007bff', 
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔧 Fill Dummy Login
            </DemoFillButton>
          </DemoCredentials>
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
