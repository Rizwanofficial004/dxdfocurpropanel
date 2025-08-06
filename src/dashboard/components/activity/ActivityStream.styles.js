import styled, { keyframes, css } from 'styled-components';

// 3D Animation Keyframes
const containerEntrance = keyframes`
  0% {
    transform: perspective(1000px) rotateX(-30deg) rotateY(20deg) translateZ(-200px);
    opacity: 0;
    scale: 0.8;
  }
  50% {
    transform: perspective(1000px) rotateX(-15deg) rotateY(10deg) translateZ(-100px);
    opacity: 0.6;
    scale: 0.9;
  }
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
    scale: 1;
  }
`;

const cardFloat = keyframes`
  0%, 100% {
    transform: perspective(800px) translateY(0px) rotateX(0deg) rotateY(0deg);
  }
  33% {
    transform: perspective(800px) translateY(-3px) rotateX(1deg) rotateY(0.5deg);
  }
  66% {
    transform: perspective(800px) translateY(-1px) rotateX(-0.5deg) rotateY(-0.5deg);
  }
`;

const cardEntrance = keyframes`
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

const folderFloat = keyframes`
  0%, 100% {
    transform: perspective(600px) translateY(0px) rotateX(0deg);
  }
  50% {
    transform: perspective(600px) translateY(-5px) rotateX(2deg);
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

const dateItemFloat = keyframes`
  0%, 100% {
    transform: perspective(400px) translateY(0px) rotateY(0deg);
  }
  50% {
    transform: perspective(400px) translateY(-2px) rotateY(1deg);
  }
`;

const buttonPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
`;

export const Wrapper = styled.div`
  font-family: 'Segoe UI', sans-serif;
  background: ${props => {
    if (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') {
      return 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    }
    return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }};
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : 'inherit'};
  min-height: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  perspective: 1000px;
  transform-style: preserve-3d;
`;

export const Container = styled.div`
  background: ${props => {
    if (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') {
      return 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.9))';
    }
    return 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))';
  }};
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  // 3D Glass Morphism Effect
  backdrop-filter: blur(20px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'rgba(55, 65, 81, 0.5)' 
      : 'rgba(241, 245, 249, 0.5)'
  };
  
  // 3D Box Shadow with multiple layers
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 2px 0 rgba(255, 255, 255, 0.1),
    inset 0 -2px 0 rgba(255, 255, 255, 0.05);
  
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#1f2937'} !important;
  
  // 3D Hover Effects
  &:hover {
    transform: perspective(1000px) translateY(-8px) rotateX(2deg) rotateY(1deg);
    box-shadow: 
      0 30px 80px rgba(0, 0, 0, 0.15),
      0 12px 40px rgba(0, 0, 0, 0.12),
      inset 0 3px 0 rgba(255, 255, 255, 0.15),
      inset 0 -3px 0 rgba(255, 255, 255, 0.1);
  }
  
  // Shimmer effect
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
    transition: left 0.8s ease;
    z-index: 1;
    pointer-events: none;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  // Entrance animation
  animation: ${css`${containerEntrance} 1s cubic-bezier(0.4, 0, 0.2, 1) both`};
  
  /* Enhanced dark mode support */
  ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') && css`
    * {
      color: #f3f4f6 !important;
    }
    
    input, select, textarea {
      background: rgba(55, 65, 81, 0.8) !important;
      color: #f3f4f6 !important;
      border-color: rgba(75, 85, 99, 0.6) !important;
      backdrop-filter: blur(10px);
    }
  `}
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
  transform-style: preserve-3d;
  

`;

export const DateScrollContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 500px;
  overflow-x: auto;
  padding: 0.5rem;
  border-radius: 1rem;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(55, 65, 81, 0.3)'
      : 'rgba(248, 250, 252, 0.7)'
  };
  backdrop-filter: blur(10px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(75, 85, 99, 0.4)'
      : 'rgba(241, 245, 249, 0.4)'
  };
  
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    transform: perspective(500px) translateY(-2px) rotateX(1deg);
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(55, 65, 81, 0.5)'
        : 'rgba(248, 250, 252, 0.9)'
    };
  }
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(55, 65, 81, 0.5)' : 'rgba(241, 245, 249, 0.5)'};
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(107, 114, 128, 0.8)' : 'rgba(193, 193, 193, 0.8)'};
    border-radius: 6px;
    transition: all 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(156, 163, 175, 0.9)' : 'rgba(168, 168, 168, 0.9)'};
  }
`;

export const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f9fafb' : '#111827'};
  margin-bottom: 1.5rem;
  position: relative;
  
  // 3D Text effect
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'linear-gradient(135deg, #f9fafb, #d1d5db)'
      : 'linear-gradient(135deg, #111827, #4b5563)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 0, 0, 0.05);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  
  
`;

export const Username = styled.div`
  font-weight: 600;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff'};
  font-size: 1rem;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(96, 165, 250, 0.1)'
      : 'rgba(3, 100, 255, 0.1)'
  };
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(96, 165, 250, 0.3)'
      : 'rgba(3, 100, 255, 0.3)'
  };
  backdrop-filter: blur(10px);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  

    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

export const Arrow = styled.div`
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  user-select: none;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#374151'};
  border-radius: 50%;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.1)'
      : 'rgba(55, 65, 81, 0.1)'
  };
  backdrop-filter: blur(10px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.2)'
      : 'rgba(55, 65, 81, 0.2)'
  };
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  
  &:hover {
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : '#111827'};
    transform: perspective(400px) translateY(-2px) rotateX(5deg) scale(1.1);
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(156, 163, 175, 0.2)'
        : 'rgba(55, 65, 81, 0.2)'
    };
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: perspective(400px) translateY(0px) rotateX(2deg) scale(0.95);
  }
`;

export const DateItem = styled.div`
  background: ${props => {
    if (props.active) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #0364ff, #1e40af)';
    if (props.singleDateActive) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #10b981, #059669)';
    if (props.isToday) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(55, 65, 81, 0.6)' : 'rgba(241, 245, 249, 0.8)';
  }};
  color: ${props => (props.active || props.singleDateActive || props.isToday) 
    ? 'white' 
    : (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : '#111827'};
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  min-width: 60px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  
  // Glass morphism effect
  backdrop-filter: blur(12px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(75, 85, 99, 0.3)'
      : 'rgba(241, 245, 249, 0.4)'
  };
  
  // 3D Box shadow
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Floating animation
  animation: ${css`${dateItemFloat} 6s ease-in-out infinite`};
  animation-delay: ${props => props.index * 0.1}s;

  &:hover {
    transform: perspective(500px) translateY(-4px) rotateX(5deg) rotateY(2deg) scale(1.05);
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.15),
      inset 0 2px 0 rgba(255, 255, 255, 0.3);
    background: ${props => {
      if (props.active || props.singleDateActive || props.isToday) return '';
      return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(75, 85, 99, 0.8)' : 'rgba(226, 232, 240, 0.9)';
    }};
  }
  
  &:active {
    transform: perspective(500px) translateY(-2px) rotateX(2deg) scale(0.98);
  }

  span {
    display: block;
    font-size: 0.75rem;
    font-weight: 400;
    color: ${props => (props.active || props.singleDateActive || props.isToday) 
      ? 'rgba(255, 255, 255, 0.9)' 
      : (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
    margin-top: 0.125rem;
  }

  ${props => props.isToday && css`
    &::after {
      content: 'Today';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.625rem;
      font-weight: 600;
      color: ${(props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#d97706' : '#f59e0b'};
      background: ${(props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(217, 119, 6, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
      padding: 0.125rem 0.375rem;
      border-radius: 0.5rem;
      backdrop-filter: blur(8px);
    }
  `}
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  perspective: 1200px;
  
`;

export const Card = styled.div`
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.8))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
  };
  border: 2px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'rgba(55, 65, 81, 0.5)' 
      : 'rgba(229, 231, 235, 0.5)'
  };
  border-radius: 1.5rem;
  padding: 2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
 
  
  // Glass morphism effect
  backdrop-filter: blur(20px);
  
  // 3D shadows
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  
  &:hover {
    border-color: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
        ? '#60a5fa' 
        : '#0364ff'
    };

    box-shadow: 
      0 25px 60px ${props => 
        (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
          ? 'rgba(96, 165, 250, 0.3)' 
          : 'rgba(3, 100, 255, 0.2)'
      },
      0 12px 32px rgba(0, 0, 0, 0.15),
      inset 0 2px 0 rgba(255, 255, 255, 0.15);
  }
  

  
 
`;

export const Img = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 1rem;
  margin-bottom: 1rem;
  position: relative;
  
 
`;

export const TaskName = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#111827'};
  margin-bottom: 0.5rem;
  text-align: center;
  position: relative;
  
  // 3D text effect
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'linear-gradient(135deg, #f3f4f6, #d1d5db)'
      : 'linear-gradient(135deg, #111827, #4b5563)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 
    1px 1px 2px rgba(0, 0, 0, 0.1),
    0 0 10px rgba(0, 0, 0, 0.05);
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: perspective(400px) rotateX(3deg) scale(1.02);
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.15),
      0 0 15px rgba(0, 0, 0, 0.1);
  }
`;

export const TaskTime = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.1)'
      : 'rgba(107, 114, 128, 0.1)'
  };
  backdrop-filter: blur(8px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.2)'
      : 'rgba(107, 114, 128, 0.2)'
  };
  
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    transform: perspective(300px) translateY(-1px) rotateX(2deg);
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(156, 163, 175, 0.2)'
        : 'rgba(107, 114, 128, 0.2)'
    };
  }
`;

export const ImageUrl = styled.div`
  font-size: 10px;
  color: ${props =>
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  margin-top: 4px;
  padding: 4px 6px;
  background: ${props =>
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#f9fafb'};
  border-radius: 4px;
  border: 1px solid ${props =>
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#e5e7eb'};
  font-family: 'Courier New', monospace;

  /* Add ellipsis after one line */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%; /* Ensure it respects container width */
  height: auto; /* Adjust height to fit single line */
  line-height: normal; /* Ensure consistent line height */
`;

export const BackendStatusBadge = styled.div`
  font-size: 8px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
  margin-top: 2px;
  text-align: center;
  background: ${props => 
    props.status === 'connected' ? '#10b981' :
    props.status === 'disconnected' ? '#ef4444' : '#6b7280'
  };
  color: white;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'transparent' : 'transparent'};
`;

export const PaginationContainer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '16px' : '0'};
`;

export const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#d1d5db'};
  background: ${props => {
    if (props.active) return '#0364ff';
    return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : 'white';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#374151';
  }};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.active) return '#0364ff';
      return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#f3f4f6';
    }};
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
  }
  
  &:disabled {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1f2937' : '#f9fafb'};
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
    cursor: not-allowed;
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#e5e7eb'};
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  margin: 0 8px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  flex-direction: column;
  gap: 16px;
`;

export const ErrorMessage = styled.div`
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#fca5a5' : '#ef4444'};
  text-align: center;
  padding: 20px;
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1f2937' : '#fef2f2'};
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#fecaca'};
  border-radius: 8px;
  margin: 16px 0;
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  font-size: 16px;
`;

export const DummyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

export const SearchInfo = styled.div`
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1e3a8a' : '#f0f9ff'};
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#3b82f6' : '#bae6fd'};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#93c5fd' : '#0369a1'};
`;

export const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#f8fafc'};
  border-radius: 6px;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#e2e8f0'};
`;

export const BreadcrumbItem = styled.button`
  background: none;
  border: none;
  color: ${props => props.active 
    ? ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#374151')
    : ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff')};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: ${props => props.active ? 'default' : 'pointer'};
  text-decoration: ${props => props.active ? 'none' : 'underline'};
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'transparent' : ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#f1f5f9')};
  }
`;

export const BreadcrumbSeparator = styled.span`
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
  font-size: 14px;
`;

export const FoldersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  perspective: 1200px;
  transform-style: preserve-3d;
`;

export const FolderCard = styled.div`
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.8))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8))'
  };
  border: 2px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'rgba(55, 65, 81, 0.5)' 
      : 'rgba(229, 231, 235, 0.5)'
  };
  border-radius: 1.5rem;
  padding: 2rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  
  // Glass morphism effect
  backdrop-filter: blur(20px);
  
  // 3D shadows
  box-shadow: 
    0 12px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Floating animation
  animation: ${css`${folderFloat} 10s ease-in-out infinite`};
  animation-delay: ${props => (props.index || 0) * 0.15}s;
  
  &:hover {
    border-color: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
        ? '#60a5fa' 
        : '#0364ff'
    };
    transform: perspective(800px) translateY(-12px) rotateX(8deg) rotateY(5deg) scale(1.02);
    box-shadow: 
      0 25px 60px ${props => 
        (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
          ? 'rgba(96, 165, 250, 0.3)' 
          : 'rgba(3, 100, 255, 0.2)'
      },
      0 12px 32px rgba(0, 0, 0, 0.15),
      inset 0 2px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: perspective(800px) translateY(-8px) rotateX(4deg) rotateY(2deg) scale(0.98);
  }
  
  // Shimmer effect
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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s ease;
    z-index: 1;
    pointer-events: none;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

export const FolderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
`;

export const FolderIcon = styled.div`
  font-size: 2rem;
  margin-right: 1rem;
  padding: 0.75rem;
  border-radius: 50%;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(96, 165, 250, 0.2)'
      : 'rgba(3, 100, 255, 0.1)'
  };
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(96, 165, 250, 0.3)'
      : 'rgba(3, 100, 255, 0.2)'
  };
  backdrop-filter: blur(10px);
  
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  
  &:hover {
    transform: perspective(400px) rotateY(15deg) rotateX(5deg);
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(96, 165, 250, 0.3)'
        : 'rgba(3, 100, 255, 0.2)'
    };
  }
`;

export const FolderName = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#111827'};
  flex: 1;
  position: relative;
  
  // 3D text effect
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'linear-gradient(135deg, #f3f4f6, #d1d5db)'
      : 'linear-gradient(135deg, #111827, #4b5563)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 
    1px 1px 2px rgba(0, 0, 0, 0.1),
    0 0 10px rgba(0, 0, 0, 0.05);
  
  transition: all 0.3s ease;
  
  &:hover {
    transform: perspective(400px) rotateX(3deg) scale(1.02);
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.15),
      0 0 15px rgba(0, 0, 0, 0.1);
  }
`;

export const FolderStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
`;

export const FolderStat = styled.div`
  font-size: 0.875rem;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  background: ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.1)'
      : 'rgba(107, 114, 128, 0.1)'
  };
  backdrop-filter: blur(8px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(156, 163, 175, 0.2)'
      : 'rgba(107, 114, 128, 0.2)'
  };
  
  transition: all 0.3s ease;
  transform-style: preserve-3d;
  
`;

export const ViewModeToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

export const ViewModeButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#d1d5db'};
  background: ${props => props.active 
    ? '#0364ff' 
    : ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : 'white')};
  color: ${props => props.active 
    ? 'white' 
    : ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#374151')};
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? '#0364ff' 
      : ((props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#f3f4f6')};
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
  }
`;

export const PerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

export const PerPageLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#374151'};
`;

export const PerPageSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#d1d5db'};
  border-radius: 6px;
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : 'white'};
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#374151'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  min-width: 80px;
  
  &:hover:not(:disabled) {
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
  }
  
  &:focus {
    outline: none;
    border-color: #0364ff;
    box-shadow: 0 0 0 3px rgba(3, 100, 255, 0.1);
  }
  
  &:disabled {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1f2937' : '#f9fafb'};
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#9ca3af'};
    cursor: not-allowed;
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#e5e7eb'};
  }
`;

export const DisabledButton = styled.button`
  padding: 8px 24px;
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#f9fafb'};
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#e5e7eb'};
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  border-radius: 6px;
  cursor: not-allowed;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
`;

export const ButtonContainer = styled.div`
  margin-top: 24px;
  text-align: center;
`;
