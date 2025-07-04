import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../dashboard/context/LanguageContext';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const Login = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (formData.email === 'admin@example.com' && formData.password === 'password') {
        navigate('/dashboard');
      } else {
        setError(t('error'));
      }
    } catch {
      setError(t('loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LanguageSwitcher>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="tr">🇹🇷 Türkçe</option>
          </select>
        </LanguageSwitcher>

        <LogoSection>
          <Logo>A</Logo>
          <Title>{t('welcome')}</Title>
          <Subtitle>{t('subtitle')}</Subtitle>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>{t('email')}</Label>
            <Input
              type="email"
              name="email"
              placeholder={t('enterEmail')}
              value={formData.email}
              onChange={handleInputChange}
              required
            />
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
              />
              <PasswordToggle type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
            </PasswordContainer>
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
            <ForgotLink href="#">{t('forgot')}</ForgotLink>
          </OptionsRow>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? t('signingIn') : t('signIn')}
          </LoginButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
