import styled, { keyframes } from 'styled-components';

// 3D Animation Keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotateX(0deg); }
  50% { transform: translateY(-8px) rotateX(2deg); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px) rotateX(20deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const rotateIn3D = keyframes`
  0% { 
    transform: perspective(800px) rotateX(90deg) rotateY(0deg) translateZ(-300px);
    opacity: 0;
  }
  50% {
    transform: perspective(800px) rotateX(45deg) rotateY(8deg) translateZ(-150px);
    opacity: 0.7;
  }
  100% { 
    transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 10px 40px rgba(0,0,0,0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 20px 60px rgba(0,0,0,0.2);
  }
`;

const scaleUp = keyframes`
  0% { transform: scale(0.9) rotateX(15deg); opacity: 0; }
  100% { transform: scale(1) rotateX(0deg); opacity: 1; }
`;

const cardFlip = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(0deg); }
`;

// Main Container
export const EmployeesWrapper = styled.div`
  padding: 24px;
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 
    'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'};
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)' :
      'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)'};
    pointer-events: none;
  }
`;

export const EmployeesContainer = styled.div`
 
  margin: 0 auto;
  position: relative;
  z-index: 1;
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

// Header Section
export const EmployeesHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  animation: ${scaleUp} 1s cubic-bezier(0.23, 1, 0.320, 1) forwards;
`;

export const EmployeesTitle = styled.h1`
  font-size: 48px;
  font-weight: 900;
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)' :
    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.1);
  letter-spacing: -2px;
  animation: ${float} 4s ease-in-out infinite;
`;

export const EmployeesSubtitle = styled.p`
  font-size: 20px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  margin-bottom: 32px;
  font-weight: 500;
`;

// Filter Section
export const FilterSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 200ms;
  opacity: 0;
`;

export const FilterInput = styled.input`
  padding: 16px 20px;
  border: 2px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-radius: 16px;
  background: ${props => props.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1f2937'};
  font-size: 16px;
  min-width: 300px;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  box-shadow: ${props => props.isDarkMode ? 
    '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)' :
    '0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 12px 30px rgba(59, 130, 246, 0.2);
    transform: perspective(1000px) rotateX(-3deg) translateZ(8px);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  }
`;

export const FilterSelect = styled.select`
  padding: 16px 20px;
  border: 2px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-radius: 16px;
  background: ${props => props.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1f2937'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  box-shadow: ${props => props.isDarkMode ? 
    '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)' :
    '0 8px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 12px 30px rgba(59, 130, 246, 0.2);
    transform: perspective(1000px) rotateX(-3deg) translateZ(8px);
  }
`;

// Employee Cards Grid
export const EmployeesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 32px;
  margin-top: 32px;
  perspective: 1200px;
`;

// Employee Card
export const EmployeeCard = styled.div`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' : 
    'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'};
  border: ${props => props.isDarkMode ? 
    '2px solid rgba(59, 130, 246, 0.2)' : 
    '2px solid transparent'};
  border-radius: 28px;
  padding: 32px;
  cursor: pointer;
  position: relative;
  overflow: hidden;


  box-shadow: ${props => props.isDarkMode ? 
    '0 32px 64px rgba(0, 0, 0, 0.8), 0 16px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)' :
    '0 32px 64px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};





  &:hover {
    box-shadow: ${props => props.isDarkMode ? 
      '0 40px 80px rgba(0, 0, 0, 0.6), 0 20px 40px rgba(59, 130, 246, 0.4)' :
      '0 40px 80px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(59, 130, 246, 0.3)'};
    border-color: rgba(59, 130, 246, 0.6);

    &::after {
      opacity: 1;
    }
  }

  &:hover .employee-avatar {
    transform: perspective(1000px) rotateY(15deg) rotateX(8deg) scale(1.15) translateZ(20px);
  }

  &:hover .employee-info {
    transform: translateZ(15px);
  }

  &:hover .employee-rating {
    transform: translateZ(25px) scale(1.1);
  }

  &:hover .employee-actions {
    transform: translateZ(30px) rotateX(-10deg);
  }
`;

// Employee Avatar
export const EmployeeAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0 auto 24px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(102, 126, 234, 0.9) 0%, 
      rgba(118, 75, 162, 0.9) 25%, 
      rgba(255, 154, 158, 0.9) 50%, 
      rgba(250, 208, 196, 0.9) 75%, 
      rgba(102, 126, 234, 0.9) 100%);
    background-size: 300% 300%;
    animation: ${shimmer} 4s ease infinite;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  span {
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
`;

// Employee Info Section
export const EmployeeInfo = styled.div`
  text-align: center;
  margin-bottom: 24px;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;
`;

export const EmployeeName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1f2937'};
  margin-bottom: 8px;
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)' :
    'linear-gradient(135deg, #1f2937 0%, #374151 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const EmployeeTitle = styled.p`
  font-size: 16px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  margin-bottom: 4px;
  font-weight: 500;
`;

export const EmployeeEmail = styled.p`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#60a5fa' : '#3b82f6'};
  margin-bottom: 8px;
  font-weight: 500;
`;

export const EmployeeContact = styled.p`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#6b7280'};
  margin-bottom: 16px;
`;

// Employee Details Grid
export const EmployeeDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

export const DetailItem = styled.div`
  background: ${props => props.isDarkMode ? 
    'rgba(51, 65, 85, 0.5)' : 
    'rgba(248, 250, 252, 0.8)'};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid ${props => props.isDarkMode ? 
    'rgba(59, 130, 246, 0.2)' : 
    'rgba(226, 232, 240, 0.8)'};
  transition: all 0.3s ease;
  transform-style: preserve-3d;

  &:hover {
    transform: perspective(1000px) rotateX(-5deg) translateZ(10px);
    background: ${props => props.isDarkMode ? 
      'rgba(59, 130, 246, 0.1)' : 
      'rgba(59, 130, 246, 0.05)'};
    border-color: rgba(59, 130, 246, 0.4);
  }
`;

export const DetailLabel = styled.div`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 600;
`;

export const DetailValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1f2937'};
`;

// Rating Section
export const RatingSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;
`;

export const RatingStars = styled.div`
  display: flex;
  gap: 4px;
  margin-right: 8px;
`;

export const Star = styled.span`
  font-size: 20px;
  color: ${props => props.filled ? '#fbbf24' : (props.isDarkMode ? '#4b5563' : '#e5e7eb')};
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));

  &:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(251, 191, 36, 0.5));
  }
`;

export const RatingValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#6b7280'};
  margin-left: 8px;
`;

// Action Buttons
export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;
`;

export const ActionButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
  `}

  ${props => props.variant === 'secondary' && `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  `}

  ${props => props.variant === 'danger' && `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(15px) scale(1.05);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) translateZ(8px) scale(0.98);
  }
`;

// Loading and Empty States
export const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 60px auto;

  @keyframes spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  font-size: 20px;
  font-weight: 500;
  
  &::before {
    content: '👥';
    display: block;
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.5;
  }
`;

// Statistics Summary
export const StatsSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 100ms;
  opacity: 0;
`;

export const StatCard = styled.div`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' : 
    'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'};
  border: ${props => props.isDarkMode ? 
    '2px solid rgba(59, 130, 246, 0.2)' : 
    '2px solid transparent'};
  border-radius: 20px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
  box-shadow: ${props => props.isDarkMode ? 
    '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)' :
    '0 20px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};

  &:hover {
    transform: perspective(1000px) rotateX(-5deg) rotateY(8deg) translateZ(30px) scale(1.05);
    border-color: ${props => props.color || '#3b82f6'};
    box-shadow: ${props => props.isDarkMode ? 
      `0 25px 50px rgba(0, 0, 0, 0.4), 0 15px 30px ${props.color || '#3b82f6'}40` :
      `0 25px 50px rgba(0, 0, 0, 0.15), 0 15px 30px ${props.color || '#3b82f6'}30`};
  }
`;

export const StatIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
`;

export const StatValue = styled.div`
  font-size: 28px;
  font-weight: 900;
  color: ${props => props.color || '#3b82f6'};
  margin-bottom: 8px;
  background: ${props => `linear-gradient(135deg, ${props.color || '#3b82f6'}, #667eea)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#d1d5db' : '#64748b'};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
