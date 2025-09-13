import styled, { keyframes } from 'styled-components';
import { lightTheme } from '../../styles/theme';

// Enhanced 3D Animation Keyframes
export const spin3D = keyframes`
  from {
    transform: rotate3d(.5,.5,.5, 0deg);
  }
  to {
    transform: rotate3d(.5,.5,.5, 360deg);
  }
`;

export const spin3DX = keyframes`
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }
  to {
    transform: rotateX(360deg) rotateY(180deg);
  }
`;

export const spin3DY = keyframes`
  from {
    transform: rotateY(0deg) rotateZ(0deg);
  }
  to {
    transform: rotateY(360deg) rotateZ(180deg);
  }
`;

export const spin3DZ = keyframes`
  from {
    transform: rotateZ(0deg) rotateX(0deg);
  }
  to {
    transform: rotateZ(360deg) rotateX(180deg);
  }
`;

export const float3D = keyframes`
  0% {
    transform: translateZ(0px) scale(1);
  }
  50% {
    transform: translateZ(30px) scale(1.1);
  }
  100% {
    transform: translateZ(0px) scale(1);
  }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
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

export const LoginCard = styled.div`
  background: #e8f1ff;
  border-radius: 20px;
  box-shadow: 0 10px 20px #b7b7b7;
  width: 480px;
  height: auto;
  min-height: 575px;
  max-width: 480px;
  padding: 30px;
  position: relative;
  z-index: 10;
  animation: ${fadeIn} 0.6s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 520px) {
    width: 95%;
    max-width: 95%;
    height: auto;
    min-height: 575px;
    padding: 30px 24px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, rgba(74, 144, 226, 0.1), transparent);
    border-radius: 20px;
    z-index: -1;
  }
`;

export const AnimationContainer = styled.div`
  position: absolute;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: -100px;
  perspective: 1000px;
  perspective-origin: center center;
  pointer-events: none;
  z-index: 1;
`;

export const SpinnerBox = styled.div`
  width: 400px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  transform-style: preserve-3d;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const Orbit = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transform-style: preserve-3d;

  &::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    animation: inherit;
  }
`;

export const BlueOrbit = styled(Orbit)`
  width: 220px;
  height: 220px;
  border: 2px solid rgba(145, 218, 255, 0.3);
  box-shadow: 0 0 20px rgba(145, 218, 255, 0.2);
  animation: ${spin3DX} 4s linear infinite;

  &::before {
    background: radial-gradient(circle, rgba(145, 218, 255, 1) 0%, rgba(145, 218, 255, 0) 70%);
  }
`;

export const GreenOrbit = styled(Orbit)`
  width: 170px;
  height: 170px;
  border: 2px solid rgba(145, 255, 191, 0.3);
  box-shadow: 0 0 15px rgba(145, 255, 191, 0.2);
  animation: ${spin3DY} 2.5s linear infinite reverse;

  &::before {
    background: radial-gradient(circle, rgba(145, 255, 191, 1) 0%, rgba(145, 255, 191, 0) 70%);
  }
`;

export const RedOrbit = styled(Orbit)`
  width: 120px;
  height: 120px;
  border: 2px solid rgba(255, 202, 145, 0.3);
  box-shadow: 0 0 12px rgba(255, 202, 145, 0.2);
  animation: ${spin3DZ} 1.8s linear infinite;

  &::before {
    background: radial-gradient(circle, rgba(255, 202, 145, 1) 0%, rgba(255, 202, 145, 0) 70%);
  }
`;

export const WhiteOrbit = styled(Orbit)`
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.1);
  animation: ${float3D} 3s ease-in-out infinite;
`;

export const WhiteOrbit1 = styled(WhiteOrbit)`
  width: 80px;
  height: 80px;
  transform: rotate3D(1, 1, 1, 45deg);
  animation: ${spin3D} 8s linear infinite, ${float3D} 4s ease-in-out infinite;
`;

export const WhiteOrbit2 = styled(WhiteOrbit)`
  width: 100px;
  height: 100px;
  transform: rotate3D(1, 2, 0.5, 90deg);
  animation: ${spin3DX} 6s linear infinite reverse, ${float3D} 3.5s ease-in-out infinite 1s;
`;

export const WhiteOrbit3 = styled(WhiteOrbit)`
  width: 60px;
  height: 60px;
  transform: rotate3D(0.5, 1, 2, 135deg);
  animation: ${spin3DY} 10s linear infinite, ${float3D} 5s ease-in-out infinite 2s;
`;

export const CentralCore = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #ffffff 0%, #91daff 50%, #1d2630 100%);
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(145, 218, 255, 0.2);
  animation: ${float3D} 2s ease-in-out infinite alternate;
`;

export const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
`;

export const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const FocusLogo = styled.div`
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 1px;
  margin: 0 auto 24px;
  display: inline-block;
  box-shadow: 0 8px 20px rgba(74, 144, 226, 0.3);
  position: relative;

  &::after {
    content: '👁';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
  }
`;

export const Title = styled.h1`
  color: ${lightTheme.colors.text.primary};
  font-size: ${lightTheme.typography.fontSize['2xl']};
  font-weight: ${lightTheme.typography.fontWeight.bold};
  margin-bottom: 8px;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const Subtitle = styled.p`
  color: ${lightTheme.colors.text.secondary};
  font-size: ${lightTheme.typography.fontSize.sm};
  margin-bottom: 0;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: ${lightTheme.typography.fontSize.sm};
  font-weight: ${lightTheme.typography.fontWeight.medium};
  color: ${lightTheme.colors.text.primary};
  margin-bottom: 4px;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${props => props.hasError ? lightTheme.colors.input.borderError : lightTheme.colors.input.border};
  border-radius: ${lightTheme.borderRadius.lg};
  background: ${lightTheme.colors.input.background};
  font-size: ${lightTheme.typography.fontSize.base};
  font-family: ${lightTheme.typography.fontFamily.primary};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white !important; /* White text in normal state */
  position: relative;
  transform: translateZ(0);

  &::placeholder {
    color: ${lightTheme.colors.text.muted};
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: ${lightTheme.colors.borderHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
    background: rgba(255, 255, 255, 0.9);
    color: ${lightTheme.colors.text.primary} !important; /* Dark text on hover */
    
    &::placeholder {
      opacity: 0.8;
      color: ${lightTheme.colors.text.muted};
    }
  }

  &:focus {
    outline: none;
    border-color: ${lightTheme.colors.input.borderFocus};
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.15), 0 8px 20px rgba(74, 144, 226, 0.2);
    background: white;
    color: ${lightTheme.colors.text.primary} !important; /* Dark text on focus */
    transform: translateY(-2px);
    
    &::placeholder {
      opacity: 0.6;
      color: ${lightTheme.colors.text.muted};
      transform: translateX(4px);
    }
  }

  &:active {
    transform: translateY(-1px);
    color: ${lightTheme.colors.text.primary} !important; /* Dark text on active */
  }

  &.error {
    border-color: ${lightTheme.colors.input.borderError};
    box-shadow: 0 0 0 3px rgba(255, 68, 68, 0.1);
    animation: shake 0.5s ease-in-out;
    color: white !important; /* Keep white text for error state unless focused/hovered */
  }

  /* Ensure autofill states follow the same pattern */
  &:-webkit-autofill {
    -webkit-text-fill-color: white !important; /* White text for autofill normal state */
    -webkit-box-shadow: 0 0 0px 1000px ${lightTheme.colors.input.background} inset;
    transition: background-color 5000s ease-in-out 0s;
  }

  &:-webkit-autofill:hover {
    -webkit-text-fill-color: ${lightTheme.colors.text.primary} !important; /* Dark text on autofill hover */
    -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.9) inset;
  }

  &:-webkit-autofill:focus {
    -webkit-text-fill-color: ${lightTheme.colors.text.primary} !important; /* Dark text on autofill focus */
    -webkit-box-shadow: 0 0 0px 1000px white inset;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
`;

export const InputIcon = styled.div`
  position: absolute;
  right: 16px;
  color: ${props => props.hasError ? lightTheme.colors.error : lightTheme.colors.text.muted};
  font-size: 16px;
  pointer-events: none;
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: ${lightTheme.colors.text.muted};
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  &:hover {
    color: ${lightTheme.colors.primary};
    background: rgba(74, 144, 226, 0.1);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
    background: rgba(74, 144, 226, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: ${lightTheme.colors.primary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  }

  &:active {
    transform: scale(0.9);
  }
`;

export const CheckboxLabel = styled.label`
  font-size: ${lightTheme.typography.fontSize.sm};
  color: ${lightTheme.colors.text.primary};
  cursor: pointer;
  font-family: ${lightTheme.typography.fontFamily.primary};
  transition: all 0.3s ease;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: ${lightTheme.colors.primary};
    background: rgba(74, 144, 226, 0.05);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ForgotLink = styled.a`
  color: ${lightTheme.colors.primary};
  font-size: ${lightTheme.typography.fontSize.sm};
  text-decoration: none;
  font-weight: ${lightTheme.typography.fontWeight.medium};
  font-family: ${lightTheme.typography.fontFamily.primary};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px 8px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: ${lightTheme.colors.primary};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${lightTheme.colors.primaryDark};
    background: rgba(74, 144, 226, 0.05);
    transform: translateY(-1px);

    &::before {
      width: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
`;

export const LoginButton = styled.button`
  background: linear-gradient(135deg, ${lightTheme.colors.primary} 0%, ${lightTheme.colors.primaryDark} 100%);
  color: white;
  border: none;
  border-radius: ${lightTheme.borderRadius.lg};
  padding: 18px 24px;
  font-size: ${lightTheme.typography.fontSize.base};
  font-weight: ${lightTheme.typography.fontWeight.semibold};
  font-family: ${lightTheme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  transform: translateZ(0);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 12px 24px rgba(74, 144, 226, 0.4);
    background: linear-gradient(135deg, ${lightTheme.colors.primaryLight} 0%, ${lightTheme.colors.primary} 100%);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow: 0 6px 16px rgba(74, 144, 226, 0.35);
    transition: all 0.1s ease;
  }

  &:focus {
    outline: none;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3), 0 0 0 3px rgba(74, 144, 226, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RegisterSection = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid ${lightTheme.colors.border};
  color: ${lightTheme.colors.text.secondary};
  font-size: ${lightTheme.typography.fontSize.sm};
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const RegisterLink = styled.a`
  color: ${lightTheme.colors.primary};
  text-decoration: none;
  font-weight: ${lightTheme.typography.fontWeight.medium};
  margin-left: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2px 6px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: ${lightTheme.colors.primary};
    transition: width 0.3s ease;
  }

  &:hover {
    color: ${lightTheme.colors.primaryDark};
    background: rgba(74, 144, 226, 0.05);
    transform: translateY(-1px);

    &::before {
      width: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
`;

export const ErrorMessage = styled.div`
  color: ${lightTheme.colors.error};
  font-size: ${lightTheme.typography.fontSize.sm};
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: ${lightTheme.borderRadius.md};
  padding: 12px 16px;
  margin-top: 8px;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Demo Section Styles
export const DemoSection = styled.div`
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(156, 236, 251, 0.1));
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: ${lightTheme.borderRadius.md};
  padding: 16px;
  margin: 16px 0;
  text-align: center;
`;

export const DemoTitle = styled.h4`
  color: ${lightTheme.colors.primary};
  font-size: ${lightTheme.typography.fontSize.sm};
  font-weight: ${lightTheme.typography.fontWeight.semibold};
  margin: 0 0 8px 0;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const DemoText = styled.p`
  color: ${lightTheme.colors.text.secondary};
  font-size: ${lightTheme.typography.fontSize.xs};
  margin: 4px 0;
  font-family: ${lightTheme.typography.fontFamily.primary};
`;

export const DemoButton = styled.button`
  background: linear-gradient(135deg, ${lightTheme.colors.primary}, #5a8fd8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: ${lightTheme.borderRadius.sm};
  font-size: ${lightTheme.typography.fontSize.xs};
  font-weight: ${lightTheme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 8px 0;
  font-family: ${lightTheme.typography.fontFamily.primary};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DemoCredentials = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: ${lightTheme.borderRadius.sm};
  padding: 12px;
  margin-top: 8px;
  border: 1px solid rgba(74, 144, 226, 0.1);
`;

export const DemoFillButton = styled.button`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: ${lightTheme.borderRadius.sm};
  font-size: ${lightTheme.typography.fontSize.xs};
  font-weight: ${lightTheme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  font-family: ${lightTheme.typography.fontFamily.primary};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
