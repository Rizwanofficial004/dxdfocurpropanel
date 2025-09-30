import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { authService } from '../../services/auth.service';

const Container = styled.div`
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: black;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 1px 2px rgba(0, 102, 255, 0.1);
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: #0066FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

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
  margin-top: 4px;
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 14px;
  margin-top: 4px;
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    // Clear field-specific error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Password confirmation is required';
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }
    
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.organizationName) {
      errors.organizationName = 'Organization name is required';
    }
    
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register(formData);
      
      if (response.status === 'success') {
        // Show success message
        setSuccess('Registration successful! You are now logged in.');
        
        // Show success toast
        toast.success('Registration successful! Welcome to the platform!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });

        // Clear form
        setFormData({
          email: '',
          username: '',
          password: '',
          passwordConfirm: '',
          firstName: '',
          lastName: '',
          organizationName: '',
          country: ''
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Show error toast
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <ToastContainer />
      <Title>Create Account</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email *</Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
          {fieldErrors.email && <ErrorMessage>{fieldErrors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="username">Username *</Label>
          <Input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Choose a username"
            minLength="3"
          />
          {fieldErrors.username && <ErrorMessage>{fieldErrors.username}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="Enter your first name"
          />
          {fieldErrors.firstName && <ErrorMessage>{fieldErrors.firstName}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="Enter your last name"
          />
          {fieldErrors.lastName && <ErrorMessage>{fieldErrors.lastName}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password *</Label>
          <Input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password (min. 8 characters)"
            minLength="8"
          />
          {fieldErrors.password && <ErrorMessage>{fieldErrors.password}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="passwordConfirm">Confirm Password *</Label>
          <Input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
          {fieldErrors.passwordConfirm && <ErrorMessage>{fieldErrors.passwordConfirm}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            required
            placeholder="Enter organization name"
          />
          {fieldErrors.organizationName && <ErrorMessage>{fieldErrors.organizationName}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="country">Country *</Label>
          <Select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          >
            <option value="">Select a country</option>
            <option value="USA">United States</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Turkey">Turkey</option>
            <option value="Germany">Germany</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
            <option value="France">France</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Other">Other</option>
          </Select>
          {fieldErrors.country && <ErrorMessage>{fieldErrors.country}</ErrorMessage>}
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
