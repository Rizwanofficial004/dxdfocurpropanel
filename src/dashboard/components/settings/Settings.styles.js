import styled, { keyframes } from 'styled-components';

// 3D Animations
const settingsCardEntrance = keyframes`
  0% {
    transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-300px);
    opacity: 0;
    scale: 0.6;
  }
  50% {
    transform: perspective(1000px) rotateX(45deg) rotateY(20deg) translateZ(-100px);
    opacity: 0.7;
    scale: 0.8;
  }
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
    scale: 1;
  }
`;

const settingsFloat = keyframes`
  0%, 100% {
    transform: perspective(1000px) translateY(0px) rotateX(0deg);
  }
  50% {
    transform: perspective(1000px) translateY(-8px) rotateX(2deg);
  }
`;

const configCardPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
  }
`;

const tabSlide = keyframes`
  0% {
    transform: translateY(-30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const iconRotate = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const formSlideIn = keyframes`
  0% {
    transform: perspective(1000px) translateZ(-200px) rotateX(20deg);
    opacity: 0;
  }
  100% {
    transform: perspective(1000px) translateZ(0px) rotateX(0deg);
    opacity: 1;
  }
`;

// Main Container
export const SettingsWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
  };
  position: relative;
  overflow-x: hidden;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode 
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)'
    };
    pointer-events: none;
  }
`;

export const SettingsContainer = styled.div`
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

// Header Section
export const SettingsHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  perspective: 1000px;
`;

export const SettingsTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #fff, #fff, #fff)'
    : 'linear-gradient(135deg, #1e293b, #1e293b, #1e293b)'
  };
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: ${props => props.isDarkMode 
    ? '0 4px 20px rgba(96, 165, 250, 0.3)'
    : '0 4px 20px rgba(30, 64, 175, 0.2)'
  };
  transform: perspective(500px) rotateX(15deg);
  animation: ${settingsFloat} 6s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const SettingsSubtitle = styled.p`
  font-size: 1.3rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  transform: perspective(500px) rotateX(10deg);
`;

// Tab Navigation
export const TabsContainer = styled.div`
  margin-bottom: 3rem;
  perspective: 1000px;
`;

export const TabsList = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const Tab = styled.button`
  padding: 1rem 2rem;
  border: none;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  background: ${props => props.active 
    ? (props.isDarkMode 
      ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
      : 'linear-gradient(135deg, #2563eb, #4f46e5)')
    : (props.isDarkMode 
      ? 'rgba(30, 41, 59, 0.8)'
      : 'rgba(255, 255, 255, 0.8)')
  };
  
  color: ${props => props.active 
    ? '#ffffff'
    : (props.isDarkMode ? '#94a3b8' : '#64748b')
  };
  
  border: 1px solid ${props => props.active 
    ? 'transparent'
    : (props.isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)')
  };
  
  box-shadow: ${props => props.active 
    ? '0 10px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  };

  &:hover {
    transform: perspective(1000px) translateY(-3px) rotateX(5deg);
    box-shadow: ${props => props.active 
      ? '0 15px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
      : '0 8px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    };
  }

  &:active {
    transform: perspective(1000px) translateY(-1px) rotateX(2deg);
  }

  animation: ${tabSlide} 0.6s ease-out;
  animation-delay: ${props => props.index * 0.1}s;
  animation-fill-mode: both;

  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

// Content Grid
export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

export const MainContent = styled.div`
  perspective: 1000px;
`;

export const RightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  perspective: 1000px;

  @media (max-width: 1024px) {
    order: -1;
  }
`;

// Section Components
export const Section = styled.div`
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.9)'
    : 'transparent'
  };
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: perspective(1000px) translateY(-5px) rotateX(3deg);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15), 
                inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &::before {
      left: 100%;
    }
  }

  animation: ${settingsCardEntrance} 0.8s ease-out;
  animation-delay: ${props => props.index * 0.1}s;
  animation-fill-mode: both;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    font-size: 1.2rem;
    animation: ${iconRotate} 3s linear infinite;
  }
`;

// Configuration Cards
export const ConfigCard = styled.div`
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.8)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(203, 213, 225, 0.5)'
  };
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(5px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: perspective(1000px) translateY(-3px) rotateX(2deg);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);

    &::before {
      transform: scaleX(1);
    }
  }

  animation: ${settingsCardEntrance} 0.6s ease-out;
  animation-delay: ${props => props.index * 0.05}s;
  animation-fill-mode: both;
`;

export const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const ConfigInfo = styled.div`
  flex: 1;
`;

export const ConfigName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
`;

export const ConfigDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  line-height: 1.4;
`;

export const ConfigActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ConfigButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.variant === 'danger' 
    ? '#ef4444' 
    : (props.isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)')
  };
  background: ${props => props.variant === 'danger' 
    ? 'rgba(239, 68, 68, 0.1)' 
    : (props.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)')
  };
  color: ${props => props.variant === 'danger' 
    ? '#ef4444' 
    : (props.isDarkMode ? '#94a3b8' : '#64748b')
  };
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: perspective(1000px) translateY(-2px);
    background: ${props => props.variant === 'danger' 
      ? 'rgba(239, 68, 68, 0.2)' 
      : (props.isDarkMode ? 'rgba(51, 65, 85, 0.9)' : 'rgba(248, 250, 252, 0.9)')
    };
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const ConfigData = styled.div`
  background: ${props => props.isDarkMode ? '#0f172a' : '#f8fafc'};
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.3)'
    : 'rgba(203, 213, 225, 0.3)'
  };

  pre {
    margin: 0;
    white-space: pre-wrap;
    color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
    line-height: 1.4;
  }

  strong {
    color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  }
`;

// Sidebar Cards
export const SidebarCard = styled.div`
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.9)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.3)'
    : 'rgba(203, 213, 225, 0.3)'
  };
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1), 
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(59, 130, 246, 0.1),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: perspective(1000px) translateY(-3px) rotateX(2deg);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15), 
                inset 0 1px 0 rgba(255, 255, 255, 0.2);

    &::before {
      left: 100%;
    }
  }

  animation: ${settingsCardEntrance} 0.8s ease-out;
  animation-delay: ${props => props.index * 0.1}s;
  animation-fill-mode: both;
`;

export const SidebarTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
`;

// Form Components
export const FormContainer = styled.div`
  background: ${props => {
    const baseColor = props.type === 'upload' ? '#f0f9ff' : 
                     props.type === 'database' ? '#f0fdf4' : 
                     props.type === 'aws' ? '#fef3c7' : '#f8fafc';
    return props.isDarkMode ? 'rgba(30, 41, 59, 0.9)' : baseColor;
  }};
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(203, 213, 225, 0.5)'
  };
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 1rem;
  backdrop-filter: blur(10px);
  animation: ${formSlideIn} 0.6s ease-out;
  transform-style: preserve-3d;

  &:hover {
    transform: perspective(1000px) translateY(-2px);
  }
`;

export const FormTitle = styled.h4`
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr 1fr'};
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
`;

export const Input = styled.input`
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(203, 213, 225, 0.5)'
  };
  background: ${props => props.isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transform: perspective(1000px) translateY(-1px);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#64748b' : '#9ca3af'};
  }
`;

export const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.className === 'primary' 
    ? 'transparent'
    : (props.isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)')
  };
  background: ${props => props.className === 'primary' 
    ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
    : (props.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)')
  };
  color: ${props => props.className === 'primary' 
    ? '#ffffff'
    : (props.isDarkMode ? '#94a3b8' : '#64748b')
  };
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);

  &:hover {
    transform: perspective(1000px) translateY(-2px) rotateX(5deg);
    box-shadow: ${props => props.className === 'primary' 
      ? '0 8px 25px rgba(59, 130, 246, 0.3)'
      : '0 8px 25px rgba(0, 0, 0, 0.1)'
    };
  }

  &:active {
    transform: perspective(1000px) translateY(0px) rotateX(2deg);
  }
`;

export const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }
`;

// Status Components
export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.status === 'connected' 
    ? (props.isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4')
    : (props.isDarkMode ? 'rgba(100, 116, 139, 0.2)' : '#f8fafc')
  };
  margin-bottom: 0.5rem;

  span {
    &:first-child {
      color: ${props => props.status === 'connected' 
        ? '#10b981' 
        : '#64748b'
      };
      margin-right: 0.5rem;
    }

    &:last-child {
      color: ${props => props.status === 'connected' 
        ? (props.isDarkMode ? '#34d399' : '#166534')
        : (props.isDarkMode ? '#94a3b8' : '#64748b')
      };
    }
  }
`;

// Message Components
export const MessageBox = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 0.5rem;
  background: ${props => props.type === 'success' 
    ? (props.isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4')
    : (props.isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2')
  };
  border: 1px solid ${props => props.type === 'success' 
    ? (props.isDarkMode ? 'rgba(52, 211, 153, 0.3)' : '#bbf7d0')
    : (props.isDarkMode ? 'rgba(248, 113, 113, 0.3)' : '#fecaca')
  };
  color: ${props => props.type === 'success' 
    ? (props.isDarkMode ? '#34d399' : '#166534')
    : (props.isDarkMode ? '#f87171' : '#dc2626')
  };
  animation: ${formSlideIn} 0.4s ease-out;
`;

// Loading and Empty States
export const LoadingMessage = styled.p`
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  text-align: center;
  padding: 2rem;
  font-style: italic;
`;

export const EmptyMessage = styled.p`
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-style: italic;
  text-align: center;
  padding: 1.5rem;
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  border-radius: 0.5rem;
  border: 2px dashed ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(203, 213, 225, 0.5)'
  };
`;

// API Documentation Styling
export const ApiEndpoint = styled.div`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;

  strong {
    color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

// Category Items
export const CategoryItem = styled.div`
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  span:first-child {
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  strong {
    color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  }

  p {
    font-size: 0.75rem;
    margin: 0.25rem 0 0 1.5rem;
    color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
    line-height: 1.3;
  }
`;
