import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import toastService from '../../services/toastService';
import {
  LoginContainer,
  RegistrationWrapper,
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
  Title,
  Subtitle,
  Form,
  InputGroup,
  Label,
  InputContainer,
  Input,
  InputIcon,
  PasswordToggle,
  LoginButton,
  RegisterSection,
  RegisterLink,
  ErrorMessage,
  LoadingSpinner,
  FeatureSection,
  FeatureList,
  FeatureItem,
  FeatureIcon,
  FeatureText,
  FeatureTitle,
  FeatureSubtitle,
  CountrySelect,
  CouponSection,
  CouponLink,
  TermsSection,
  TermsLink
} from './Register.styles';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    country: 'Cyprus'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 
    'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
    'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
    'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Cayman Islands', 'Central African Republic',
    'Chad', 'Chile', 'China', 'Christmas Island', 'Cocos (Keeling) Islands',
    'Colombia', 'Comoros', 'Congo', 'Congo, The Democratic Republic of the',
    'Cook Islands', 'Costa Rica', 'Cote D\'Ivoire', 'Croatia', 'Cuba',
    'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
    'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia',
    'Ethiopia', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia',
    'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait',
    'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg', 'Malaysia',
    'Maldives', 'Malta', 'Mexico', 'Monaco', 'Mongolia', 'Montenegro',
    'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Oman', 'Pakistan',
    'Palestine', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore',
    'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain',
    'Sri Lanka', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Thailand',
    'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Uruguay', 'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      // Enhanced password validation to match API requirements
      const hasLetter = /[a-zA-Z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      
      if (!hasLetter) {
        newErrors.password = 'Password must contain at least one letter';
      } else if (!hasNumber) {
        newErrors.password = 'Password must contain at least one number';
      }
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Password confirmation is required';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'username':
        if (!value) {
          error = 'Username is required';
        } else if (value.length < 3) {
          error = 'Username must be at least 3 characters';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters';
        } else {
          const hasLetter = /[a-zA-Z]/.test(value);
          const hasNumber = /\d/.test(value);
          
          if (!hasLetter) {
            error = 'Password must contain at least one letter';
          } else if (!hasNumber) {
            error = 'Password must contain at least one number';
          }
        }
        break;
        
      case 'passwordConfirm':
        if (!value) {
          error = 'Password confirmation is required';
        } else if (formData.password !== value) {
          error = 'Passwords do not match';
        }
        break;
        
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        }
        break;
        
      case 'organizationName':
        if (!value.trim()) {
          error = 'Organization name is required';
        }
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    
    // Also validate password confirmation when password changes
    if (name === 'password' && formData.passwordConfirm) {
      const confirmError = validateField('passwordConfirm', formData.passwordConfirm);
      setErrors(prev => ({
        ...prev,
        passwordConfirm: confirmError
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
      console.log('📝 Starting registration process...');
      console.log('📋 Registration data:', {
        email: formData.email,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
        country: formData.country
      });
      
      // Use the authentication service for registration
      const userData = await authService.register({
        email: formData.email,
        username: formData.username || formData.email, // Use email as username if not provided
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
        country: formData.country
      });
      
      console.log('✅ Registration successful:', userData);
      
      // Update auth context with user data
      login(userData);
      
      // Show success message
      console.log('🎉 User registered and logged in successfully!');
      console.log('👤 User data:', userData.user);
      console.log('🔑 Token received:', userData.token ? 'Yes' : 'No');
      
      // Show user feedback
      toastService.success(`🎉 Registration successful! Welcome ${userData.user?.first_name || userData.user?.email}!`);
      
      // Redirect to admin panel
      navigate('/admin-panel', { replace: true });
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        fieldErrors: error.fieldErrors,
        name: error.name,
        stack: error.stack
      });
      
      // Handle structured field errors from API
      if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        const formErrors = {};
        
        // Map API field names to form field names
        const fieldMap = {
          'password': 'password',
          'email': 'email',
          'username': 'username',
          'first_name': 'firstName',
          'last_name': 'lastName',
          'organization_name': 'organizationName',
          'country': 'country'
        };
        
        Object.keys(error.fieldErrors).forEach(apiField => {
          const formField = fieldMap[apiField] || apiField;
          formErrors[formField] = error.fieldErrors[apiField];
        });
        
        setErrors(formErrors);
        toastService.error('🚫 Please fix the validation errors and try again.');
        
      } else {
        // Parse and display API validation errors from message
        const errorMessage = error.message || 'Registration failed. Please try again.';
        
        // Check if it's a field validation error from API (format: "field: error message")
        if (errorMessage.includes(':')) {
          const fieldErrors = {};
          
          const errorParts = errorMessage.split(',');
          errorParts.forEach(part => {
            const [field, message] = part.split(':').map(s => s.trim());
            if (field && message) {
              // Map API field names to form field names
              const fieldMap = {
                'password': 'password',
                'email': 'email',
                'username': 'username',
                'first_name': 'firstName',
                'last_name': 'lastName',
                'organization_name': 'organizationName',
                'country': 'country'
              };
              const formField = fieldMap[field] || field;
              fieldErrors[formField] = message;
            }
          });
          
          // If we parsed field errors, use them; otherwise use general error
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            toastService.error('🚫 Please fix the validation errors and try again.');
          } else {
            setErrors({ general: errorMessage });
            toastService.error('🚫 Registration failed: ' + errorMessage);
          }
        } else {
          // General error
          setErrors({ general: errorMessage });
          toastService.error('🚫 Registration failed: ' + errorMessage);
        }
      }
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

      <RegistrationWrapper>
        {/* Left side - Features */}
        <FeatureSection>
        <FeatureTitle>Free & Accurate</FeatureTitle>
        <FeatureSubtitle>Employee Monitoring Software</FeatureSubtitle>
        
        <FeatureList>
          <FeatureItem>
            <FeatureIcon>🚛</FeatureIcon>
            <FeatureText>Track Worktime, Breaks, Meetings & Idle times</FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>💻</FeatureIcon>
            <FeatureText>Track Software usage times & visited websites</FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>📸</FeatureIcon>
            <FeatureText>Minute by Minute screenshots.</FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>📧</FeatureIcon>
            <FeatureText>Idle email alerts & accurate reports</FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureText>Dashboard access for Company admin, managers & employees</FeatureText>
          </FeatureItem>
          
          <FeatureItem>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureText>Unlimited Teams, Shifts & full access</FeatureText>
          </FeatureItem>
        </FeatureList>
      </FeatureSection>

      {/* Right side - Registration Form */}
      <LoginCard>
        <LogoSection>
          <Title>Register an organization account</Title>
          <Subtitle>3 USERS FREE FOREVER</Subtitle>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputContainer>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                hasError={!!errors.email}
                required
                autoComplete="email"
              />
              <InputIcon hasError={!!errors.email}>📧</InputIcon>
            </InputContainer>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                hasError={!!errors.username}
                required
                autoComplete="username"
              />
              <InputIcon hasError={!!errors.username}>👤</InputIcon>
            </InputContainer>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                hasError={!!errors.firstName}
                required
                autoComplete="given-name"
              />
              <InputIcon hasError={!!errors.firstName}>👨</InputIcon>
            </InputContainer>
            {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                hasError={!!errors.lastName}
                required
                autoComplete="family-name"
              />
              <InputIcon hasError={!!errors.lastName}>👤</InputIcon>
            </InputContainer>
            {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                hasError={!!errors.password}
                required
                autoComplete="new-password"
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </PasswordToggle>
            </InputContainer>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type="password"
                name="passwordConfirm"
                placeholder="Confirm Password"
                value={formData.passwordConfirm}
                onChange={handleInputChange}
                hasError={!!errors.passwordConfirm}
                required
                autoComplete="new-password"
              />
              <InputIcon hasError={!!errors.passwordConfirm}>🔒</InputIcon>
            </InputContainer>
            {errors.passwordConfirm && <ErrorMessage>{errors.passwordConfirm}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <CountrySelect
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                hasError={!!errors.country}
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </CountrySelect>
              <InputIcon hasError={!!errors.country}>🌍</InputIcon>
            </InputContainer>
            {errors.country && <ErrorMessage>{errors.country}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputContainer>
              <Input
                type="text"
                name="organizationName"
                placeholder="Organization Name"
                value={formData.organizationName}
                onChange={handleInputChange}
                hasError={!!errors.organizationName}
                required
                autoComplete="organization"
              />
              <InputIcon hasError={!!errors.organizationName}>🏢</InputIcon>
            </InputContainer>
            {errors.organizationName && <ErrorMessage>{errors.organizationName}</ErrorMessage>}
          </InputGroup>

          <CouponSection>
            Do you have a coupon code? <CouponLink href="#" onClick={e => e.preventDefault()}>click here</CouponLink>
          </CouponSection>

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                Creating account...
              </>
            ) : (
              'REGISTER'
            )}
          </LoginButton>

          <div style={{ textAlign: 'center', margin: '10px 0', color: '#4A90E2', fontSize: '14px' }}>
            3 Users FREE forever
          </div>
          <div style={{ textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '14px' }}>
            No credit card required
          </div>

          <TermsSection>
            By clicking REGISTER button you read & acknowledged to FocusRO{' '}
            <TermsLink href="#" onClick={e => e.preventDefault()}>terms & conditions</TermsLink>,{' '}
            <TermsLink href="#" onClick={e => e.preventDefault()}>privacy policy</TermsLink> &{' '}
            <TermsLink href="#" onClick={e => e.preventDefault()}>cookie policy</TermsLink>
          </TermsSection>
        </Form>

        <RegisterSection>
          Already have an account?
          <RegisterLink href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
            Sign in here
          </RegisterLink>
        </RegisterSection>
      </LoginCard>
      </RegistrationWrapper>
    </LoginContainer>
  );
};

export default Register;
