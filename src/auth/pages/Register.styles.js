import styled, { keyframes } from 'styled-components';
import { lightTheme } from '../../styles/theme';

// Import animations from Login.styles
const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
`;

const orbit2 = keyframes`
  0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
  100% { transform: rotate(-360deg) translateX(120px) rotate(360deg); }
`;

const orbit3 = keyframes`
  0% { transform: rotate(0deg) translateX(140px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
`;

const orbit4 = keyframes`
  0% { transform: rotate(0deg) translateX(160px) rotate(0deg); }
  100% { transform: rotate(-360deg) translateX(160px) rotate(360deg); }
`;

const orbit5 = keyframes`
  0% { transform: rotate(0deg) translateX(180px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
`;

const orbit6 = keyframes`
  0% { transform: rotate(0deg) translateX(200px) rotate(0deg); }
  100% { transform: rotate(-360deg) translateX(200px) rotate(360deg); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${lightTheme.colors.background};
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    background-image: url('https://dash.focusro.com/assets/images/a.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 831px;
    left: 0;
    top: 0;
    width: 350px;
    z-index: 0;
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    background-image: url('https://dash.focusro.com/assets/images/b.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 850px;
    right: 0;
    bottom: -80px;
    width: 370px;
    z-index: 0;
    opacity: 0.7;
  }
`;

export const RegistrationWrapper = styled.div`
  display: flex;
  max-width: 1320px;
  width: 100%;
  height: auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    flex-direction: column;
    max-width: 400px;
  }
`;

export const AnimationContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

export const SpinnerBox = styled.div`
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export const BlueOrbit = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4A90E2;
  animation: ${orbit} 8s linear infinite;
  box-shadow: 0 0 10px #4A90E2;
`;

export const GreenOrbit = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7ED321;
  animation: ${orbit2} 6s linear infinite;
  box-shadow: 0 0 8px #7ED321;
`;

export const RedOrbit = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D0021B;
  animation: ${orbit3} 10s linear infinite;
  box-shadow: 0 0 6px #D0021B;
`;

export const WhiteOrbit1 = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: ${orbit4} 12s linear infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
`;

export const WhiteOrbit2 = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: ${orbit5} 14s linear infinite;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
`;

export const WhiteOrbit3 = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: ${orbit6} 16s linear infinite;
  box-shadow: 0 0 3px rgba(255, 255, 255, 0.9);
`;

export const CentralCore = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff, #4A90E2);
  animation: ${spin} 4s linear infinite;
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5);
`;

export const FeatureSection = styled.div`
  flex: 1;
  background: #4A90E2;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const FeatureTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  text-decoration: underline;
  line-height: 1.2;
`;

export const FeatureSubtitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 60px;
  text-align: center;
  text-decoration: underline;
  line-height: 1.2;
`;

export const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 500px;
  margin: 0 auto;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
`;

export const FeatureIcon = styled.div`
  font-size: 40px;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
`;

export const FeatureText = styled.p`
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
`;

export const LoginCard = styled.div`
  background: white;
  padding: 40px;
  width: 500px;
  max-width: 660px;
  height: auto;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
    min-height: auto;
    padding: 30px 20px;
    max-width: 400px;
  }
`;

export const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.3;
`;

export const Subtitle = styled.p`
  color: #4A90E2;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #555;
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 15px 50px 15px 20px;
  border: 2px solid ${props => props.hasError ? '#D0021B' : '#E1E8ED'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#D0021B' : '#4A90E2'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(208, 2, 27, 0.1)' : 'rgba(74, 144, 226, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }
`;

export const CountrySelect = styled.select`
  width: 100%;
  padding: 15px 50px 15px 20px;
  border: 2px solid ${props => props.hasError ? '#D0021B' : '#E1E8ED'};
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  color: #333;
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 35px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#D0021B' : '#4A90E2'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(208, 2, 27, 0.1)' : 'rgba(74, 144, 226, 0.1)'};
  }

  &:hover {
    border-color: #4A90E2;
  }

  option {
    background: white;
    color: #333;
    padding: 12px 15px;
    font-size: 16px;
    font-weight: 500;
    border: none;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &:checked,
    &:focus {
      background: #4A90E2;
      color: white;
    }
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  right: 15px;
  font-size: 18px;
  color: ${props => props.hasError ? '#D0021B' : '#999'};
  pointer-events: none;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: #4A90E2;
  }
`;

export const CouponSection = styled.div`
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 10px 0;
`;

export const CouponLink = styled.a`
  color: #4A90E2;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const LoginButton = styled.button`
  background: #4A90E2;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0 10px 0;

  &:hover:not(:disabled) {
    background: #357ABD;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(74, 144, 226, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

export const TermsSection = styled.div`
  text-align: center;
  font-size: 12px;
  color: #666;
  margin: 15px 0;
  line-height: 1.4;
`;

export const TermsLink = styled.a`
  color: #4A90E2;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const RegisterSection = styled.div`
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  color: #666;
`;

export const RegisterLink = styled.a`
  color: #4A90E2;
  text-decoration: none;
  font-weight: 500;
  margin-left: 5px;

  &:hover {
    text-decoration: underline;
  }
`;

export const ErrorMessage = styled.div`
  color: #D0021B;
  font-size: 14px;
  margin-top: 5px;
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
