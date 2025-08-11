import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../dashboard/context/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import APITester from '../../components/APITester';
import SimpleLoginTest from '../../components/SimpleLoginTest';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #003366 0%, #006039 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: ${props => props.theme?.colors?.surface || 'white'};
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  padding: 40px;
  position: relative;
`;

const LanguageSwitcher = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;

  select {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    font-weight: 500;
    font-size: 14px;
    color: #334155;
    outline: none;
    cursor: pointer;

    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  width: 45px;
  height: 45px;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const Title = styled.h1`
  color: ${props => props.theme?.colors?.text?.primary || '#1e293b'};
  font-size: 24px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: ${props => props.theme?.colors?.text?.secondary || '#64748b'};
  font-size: 14px;
`;

const DemoNotice = styled.div`
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  strong {
    display: block;
    margin-bottom: 4px;
    font-size: 15px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:invalid {
    border-color: #ef4444;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 16px;
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #667eea;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  cursor: pointer;
`;

const ForgotLink = styled.a`
  color: #667eea;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 14px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ValidationError = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: 'Admin',
    password: 'admin123',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateUsername = (username) => {
    if (!username) return 'Username or email is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsernameOrEmail = (input) => {
    if (!input) return 'Username or email is required';
    if (input.length < 3) return 'Username or email must be at least 3 characters';
    
    // If it contains @ symbol, validate as email
    if (input.includes('@')) {
      if (!validateEmail(input)) {
        return 'Please enter a valid email address';
      }
    }
    
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    const usernameError = validateUsernameOrEmail(formData.username);
    const passwordError = validatePassword(formData.password);
    
    if (usernameError) errors.username = usernameError;
    if (passwordError) errors.password = passwordError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    setError('');
    setSuccess('');
    
    // Real-time validation
    if (name === 'username') {
      const usernameError = validateUsernameOrEmail(value);
      setValidationErrors(prev => ({
        ...prev,
        username: usernameError
      }));
    }
    
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setValidationErrors(prev => ({
        ...prev,
        password: passwordError
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    console.log('=== LOGIN ATTEMPT STARTED (BYPASS MODE) ===');

    try {
      console.log('Bypassing authentication - accepting any credentials:', {
        username: formData.username,
        password: '***',
        remember_me: formData.rememberMe
      });

      // Create mock successful response for any username/password
      const mockUserData = {
        name: formData.username,
        username: formData.username,
        role: formData.username.toLowerCase() === 'admin' ? 'Administrator' : 'User',
        email: formData.username.includes('@') ? formData.username : `${formData.username}@dds.com`,
        user_id: Math.floor(Math.random() * 1000) + 1,
        is_staff: true,
        is_superuser: formData.username.toLowerCase() === 'admin'
      };
      
      // Store user data in multiple ways to ensure header can access it
      sessionStorage.setItem('user', JSON.stringify(mockUserData));
      sessionStorage.setItem('loginUsername', formData.username);
      
      // If admin, also store in admin key
      if (formData.username.toLowerCase() === 'admin') {
        sessionStorage.setItem('admin', JSON.stringify(mockUserData));
      }
      
      console.log('Stored mock user data:', mockUserData);
      
      // Use AuthContext with mock data
      await login({
        username: formData.username,
        password: formData.password,
        remember_me: formData.rememberMe,
        mockUser: mockUserData
      });

      console.log('Mock login successful');
      setSuccess('Login successful! Redirecting...');
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
      }
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000); // Shorter delay since we're not waiting for API
      
    } catch (err) {
      console.error('=== LOGIN ERROR ===', err);
      // Even if there's an error, we'll allow the login in bypass mode
      setSuccess('Login successful! Redirecting...');
      
      const from = location.state?.from?.pathname || '/dashboard';
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } finally {
      console.log('=== LOGIN ATTEMPT FINISHED ===');
      setIsLoading(false);
    }
  };

  // Load remembered username on component mount
  React.useEffect(() => {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedUsername = localStorage.getItem('savedUsername');
    
    if (rememberMe === 'true' && savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  return (
    <LoginContainer>
      {/* <SimpleLoginTest /> */}
      <LoginCard>
        <LanguageSwitcher>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="tr">🇹🇷 Türkçe</option>
          </select>
        </LanguageSwitcher>

        <LogoSection>
          <Logo>
            <figure>
              <img src='https://dxdglobal.com/wp-content/uploads/2024/12/cropped-Favicon-1-180x180.webp' alt='logo' width={45} height={45} />
            </figure>
          </Logo>
          <Title>{t('welcome')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </LogoSection>

        <DemoNotice>
          <strong>🎉 Demo Mode Active</strong>
          You can login with any username and password!
        </DemoNotice>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('username') || 'Username or Email'}</Label>
            <Input
              type="text"
              name="username"
              placeholder={t('enterUsername') || 'Enter username or email'}
              value={formData.username}
              onChange={handleInputChange}
              required
              style={{
                borderColor: validationErrors.username ? '#ef4444' : '#e5e7eb'
              }}
            />
            {validationErrors.username && (
              <ValidationError>{validationErrors.username}</ValidationError>
            )}
          </InputGroup>

          <InputGroup>
            <Label>{t('password')}</Label>
            <PasswordContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={t('enterPassword')}
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  borderColor: validationErrors.password ? '#ef4444' : '#e5e7eb'
                }}
              />
              <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
            </PasswordContainer>
            {validationErrors.password && (
              <ValidationError>{validationErrors.password}</ValidationError>
            )}
          </InputGroup>

          <OptionsRow>
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
            <ForgotLink href="https://crm.deluxebilisim.com/admin/authentication/forgot_password">{t('forgot')}</ForgotLink>
          </OptionsRow>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <LoginButton type="submit" disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key])}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                {t('signingIn')} (Check console for details)
              </>
            ) : (
              t('signIn')
            )}
          </LoginButton>
        </Form>
      </LoginCard>
      
      {/* <APITester /> */}
    </LoginContainer>
  );
};

export default Login;
