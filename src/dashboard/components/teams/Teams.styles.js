import styled, { keyframes } from 'styled-components';

// 3D Animations
const teamCardEntrance = keyframes`
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

const teamFloat = keyframes`
  0%, 100% {
    transform: perspective(1000px) translateY(0px) rotateX(0deg);
  }
  50% {
    transform: perspective(1000px) translateY(-8px) rotateX(2deg);
  }
`;

const teamPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
  }
`;

const memberSlide = keyframes`
  0% {
    transform: translateX(-30px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
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

const statsCounter = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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

// Main Container
export const TeamsWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
  };
  position: relative;
  overflow-x: hidden;

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

export const TeamsContainer = styled.div`
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// Header Section
export const TeamsHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  perspective: 1000px;
`;

export const TeamsTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)'
    : 'linear-gradient(135deg, #1e40af, #7c3aed, #059669)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: ${props => props.isDarkMode 
    ? '0 4px 20px rgba(96, 165, 250, 0.3)'
    : '0 4px 20px rgba(30, 64, 175, 0.2)'
  };
  transform: perspective(500px) rotateX(15deg);
  animation: ${teamFloat} 6s ease-in-out infinite;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const TeamsSubtitle = styled.p`
  font-size: 1.3rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  transform: perspective(500px) rotateX(10deg);
`;

// Statistics Section
export const TeamStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  perspective: 1000px;
`;

export const StatCard = styled.div`
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))'
  };
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  backdrop-filter: blur(20px);
  text-align: center;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${statsCounter} 1s ease-out;
  animation-delay: ${props => props.delay || 0}ms;
  animation-fill-mode: both;

  &:hover {
    transform: perspective(1000px) rotateX(-10deg) rotateY(5deg) translateZ(30px) scale(1.02);
    box-shadow: ${props => props.isDarkMode 
      ? '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)'
      : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(59, 130, 246, 0.1)'
    };
  }
`;

export const StatIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  animation: ${iconRotate} 20s linear infinite;
`;

export const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${props => props.color || '#3b82f6'};
  margin-bottom: 0.5rem;
`;

export const StatLabel = styled.div`
  font-size: 1rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-weight: 600;
`;

// Filter Section
export const FilterSection = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const FilterInput = styled.input`
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.9)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  font-size: 1rem;
  width: 300px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    transform: scale(1.02);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FilterSelect = styled.select`
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.9)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  font-size: 1rem;
  min-width: 200px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Teams Grid
export const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  perspective: 1000px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// Team Card
export const TeamCard = styled.div`
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.95))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))'
  };
  border-radius: 25px;
  padding: 2rem;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  backdrop-filter: blur(20px);
  transform-style: preserve-3d;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: ${teamCardEntrance} 1.2s ease-out;
  animation-delay: ${props => props.index * 100}ms;
  animation-fill-mode: both;

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
    transform: perspective(1000px) rotateX(-8deg) rotateY(12deg) translateZ(40px) scale(1.02);
    box-shadow: ${props => props.isDarkMode 
      ? '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.2)'
      : '0 30px 60px rgba(0, 0, 0, 0.2), 0 0 40px rgba(59, 130, 246, 0.1)'
    };
    animation: ${teamFloat} 3s ease-in-out infinite;

    &::before {
      left: 100%;
    }

    .team-members {
      transform: translateX(10px);
    }

    .team-stats {
      transform: scale(1.05);
    }
  }
`;

// Team Header
export const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'};
`;

export const TeamIcon = styled.div`
  font-size: 3rem;
  margin-right: 1rem;
  padding: 1rem;
  border-radius: 20px;
  background: ${props => `linear-gradient(135deg, ${props.color}20, ${props.color}40)`};
  border: 2px solid ${props => `${props.color}30`};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  animation: ${teamPulse} 4s infinite;
`;

export const TeamInfo = styled.div`
  flex: 1;
`;

export const TeamName = styled.h3`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 0.5rem;
`;

export const TeamDescription = styled.p`
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 1rem;
  line-height: 1.5;
`;

// Team Stats
export const TeamStatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &.team-stats {
    transform-origin: center;
  }
`;

export const TeamStatItem = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 15px;
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)'};
`;

export const TeamStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#3b82f6'};
  margin-bottom: 0.25rem;
`;

export const TeamStatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-weight: 600;
`;

// Team Members
export const TeamMembersSection = styled.div`
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &.team-members {
    transform-origin: left;
  }
`;

export const TeamMembersTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  margin-bottom: 1rem;
`;

export const TeamMembersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TeamMemberChip = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  background: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(241, 245, 249, 0.8)'
  };
  border: 1px solid ${props => props.isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.6)'};
  font-size: 0.9rem;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#475569'};
  transition: all 0.3s ease;
  animation: ${memberSlide} 0.6s ease-out;
  animation-delay: ${props => props.index * 50}ms;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

export const MemberAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 0.5rem;
`;

// Action Buttons
export const TeamActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          &:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: ${props.isDarkMode 
            ? 'rgba(71, 85, 105, 0.5)' 
            : 'rgba(248, 250, 252, 0.8)'
          };
          color: ${props.isDarkMode ? '#e2e8f0' : '#374151'};
          border: 1px solid ${props.isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.6)'};
          &:hover {
            background: ${props.isDarkMode 
              ? 'rgba(100, 116, 139, 0.5)' 
              : 'rgba(241, 245, 249, 0.9)'
            };
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        `;
    }
  }}
`;

// Loading and Empty States
export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};

  &::before {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid ${props => props.isDarkMode ? 'rgba(148, 163, 184, 0.3)' : 'rgba(100, 116, 139, 0.3)'};
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 1.2rem;
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border-radius: 20px;
  border: 2px dashed ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'};
`;

// Modal Animations
const modalAppear = keyframes`
  0% {
    opacity: 0;
    transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-500px) scale(0.5);
  }
  50% {
    opacity: 0.8;
    transform: perspective(1000px) rotateX(45deg) rotateY(20deg) translateZ(-200px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1);
  }
`;

const modalDisappear = keyframes`
  0% {
    opacity: 1;
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: perspective(1000px) rotateX(-45deg) rotateY(-20deg) translateZ(-200px) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: perspective(1000px) rotateX(-90deg) rotateY(-45deg) translateZ(-500px) scale(0.3);
  }
`;

const overlayFadeIn = keyframes`
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(20px);
  }
`;

const overlayFadeOut = keyframes`
  0% {
    opacity: 1;
    backdrop-filter: blur(20px);
  }
  100% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
`;

const profileImageFloat = keyframes`
  0%, 100% {
    transform: perspective(500px) rotateY(0deg) translateZ(0px);
  }
  50% {
    transform: perspective(500px) rotateY(5deg) translateZ(20px);
  }
`;

const skillBarFill = keyframes`
  0% {
    width: 0%;
    opacity: 0;
  }
  100% {
    width: var(--skill-level);
    opacity: 1;
  }
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.isDarkMode 
    ? 'rgba(0, 0, 0, 0.8)'
    : 'rgba(0, 0, 0, 0.6)'
  };
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  animation: ${props => props.isClosing ? overlayFadeOut : overlayFadeIn} 0.6s ease;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const ModalContainer = styled.div`
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(51, 65, 85, 0.98))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))'
  };
  border-radius: 25px;
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  backdrop-filter: blur(30px);
  box-shadow: ${props => props.isDarkMode 
    ? '0 50px 100px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.2)'
    : '0 50px 100px rgba(0, 0, 0, 0.3), 0 0 50px rgba(59, 130, 246, 0.1)'
  };
  transform-style: preserve-3d;
  animation: ${props => props.isClosing ? modalDisappear : modalAppear} 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 25px;
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))'
      : 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))'
    };
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
    max-height: 95vh;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'};
  position: relative;
  z-index: 1;
`;

export const ModalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #60a5fa, #a78bfa)'
    : 'linear-gradient(135deg, #1e40af, #7c3aed)'
  };
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

export const ModalCloseButton = styled.button`
  background: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border: 1px solid ${props => props.isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.6)'};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isDarkMode 
      ? 'rgba(100, 116, 139, 0.7)'
      : 'rgba(226, 232, 240, 0.9)'
    };
    transform: scale(1.1) rotate(90deg);
  }
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

export const ProfileImageContainer = styled.div`
  position: relative;
  perspective: 500px;
`;

export const ProfileImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => `linear-gradient(135deg, ${props.color}, ${props.color}90)`};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  box-shadow: ${props => props.isDarkMode 
    ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.3)'
    : '0 20px 40px rgba(0, 0, 0, 0.2), 0 0 30px rgba(59, 130, 246, 0.2)'
  };
  animation: ${profileImageFloat} 4s ease-in-out infinite;
  transform-style: preserve-3d;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: ${props => `linear-gradient(45deg, ${props.color}40, transparent, ${props.color}40)`};
    animation: ${iconRotate} 10s linear infinite;
  }
`;

export const ProfileInfo = styled.div`
  flex: 1;
`;

export const ProfileName = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 0.5rem;
`;

export const ProfileRole = styled.p`
  font-size: 1.2rem;
  color: ${props => props.color || '#3b82f6'};
  font-weight: 600;
  margin-bottom: 1rem;
`;

export const ProfileDescription = styled.p`
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 1rem;
  line-height: 1.6;
`;

export const DetailsSection = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

export const SectionTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DetailsList = styled.div`
  display: grid;
  gap: 1rem;
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border-radius: 15px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

export const DetailIcon = styled.div`
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 30px;
  text-align: center;
`;

export const DetailContent = styled.div`
  flex: 1;
`;

export const DetailLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const DetailValue = styled.div`
  font-size: 1rem;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  font-weight: 500;
`;

export const SkillsSection = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

export const SkillsList = styled.div`
  display: grid;
  gap: 1rem;
`;

export const SkillItem = styled.div`
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  padding: 1rem;
  border-radius: 15px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)'};
`;

export const SkillName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
`;

export const SkillLevel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.color || '#3b82f6'};
  font-weight: 600;
`;

export const SkillBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(226, 232, 240, 0.8)'
  };
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

export const SkillProgress = styled.div`
  height: 100%;
  background: ${props => `linear-gradient(90deg, ${props.color}, ${props.color}80)`};
  border-radius: 4px;
  width: 0%;
  animation: ${skillBarFill} 2s ease-out forwards;
  animation-delay: ${props => props.delay || 0}ms;
  --skill-level: ${props => props.level}%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: ${shimmer} 2s infinite;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

export const ModalActionButton = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 15px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          &:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
          }
        `;
      case 'secondary':
        return `
          background: ${props.isDarkMode 
            ? 'rgba(71, 85, 105, 0.5)' 
            : 'rgba(248, 250, 252, 0.8)'
          };
          color: ${props.isDarkMode ? '#e2e8f0' : '#374151'};
          border: 1px solid ${props.isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.6)'};
          &:hover {
            background: ${props.isDarkMode 
              ? 'rgba(100, 116, 139, 0.7)' 
              : 'rgba(226, 232, 240, 0.9)'
            };
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        `;
    }
  }}
`;
