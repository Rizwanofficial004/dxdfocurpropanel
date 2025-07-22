import styled, { keyframes } from 'styled-components';

// 3D Animations
const chatbotEntrance = keyframes`
  0% {
    transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-200px) scale(0.3);
    opacity: 0;
  }
  50% {
    transform: perspective(1000px) rotateX(45deg) rotateY(20deg) translateZ(-50px) scale(0.7);
    opacity: 0.8;
  }
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1);
    opacity: 1;
  }
`;

const chatbotFloat = keyframes`
  0%, 100% {
    transform: perspective(500px) translateY(0px) rotateZ(0deg);
  }
  25% {
    transform: perspective(500px) translateY(-8px) rotateZ(2deg);
  }
  75% {
    transform: perspective(500px) translateY(8px) rotateZ(-2deg);
  }
`;

const chatbotPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
  }
`;

const messageSlideIn = keyframes`
  0% {
    transform: translateX(100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
`;

const messageSlideOut = keyframes`
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(100px) scale(0.8);
    opacity: 0;
  }
`;

const typingDots = keyframes`
  0%, 20% {
    color: rgba(59, 130, 246, 0.4);
    transform: scale(1);
  }
  50% {
    color: rgba(59, 130, 246, 1);
    transform: scale(1.2);
  }
  80%, 100% {
    color: rgba(59, 130, 246, 0.4);
    transform: scale(1);
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

const sparkle = keyframes`
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

// Main Chatbot Container
export const ChatbotContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10000;
  perspective: 1000px;
  transform-style: preserve-3d;

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
  }
`;

// Chatbot Button/Avatar
export const ChatbotButton = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)'
    : 'linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 2rem;
  color: white;
  box-shadow: ${props => props.isDarkMode 
    ? '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
    : '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(59, 130, 246, 0.3)'
  };
  border: 3px solid ${props => props.isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)'};
  backdrop-filter: blur(10px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${chatbotEntrance} 1.5s ease-out, ${chatbotFloat} 4s ease-in-out infinite 1.5s, ${chatbotPulse} 3s infinite 2s;
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.6s ease;
    opacity: 0;
  }

  &::after {
    content: '✨';
    position: absolute;
    top: -10px;
    right: -10px;
    font-size: 1rem;
    animation: ${sparkle} 2s infinite;
    animation-delay: 3s;
  }

  &:hover {
    transform: perspective(500px) rotateX(-10deg) rotateY(10deg) translateZ(20px) scale(1.1);
    box-shadow: ${props => props.isDarkMode 
      ? '0 30px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.6)'
      : '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 50px rgba(59, 130, 246, 0.5)'
    };

    &::before {
      opacity: 1;
      animation: ${shimmer} 1.5s ease;
    }
  }

  &:active {
    transform: perspective(500px) rotateX(-5deg) rotateY(5deg) translateZ(10px) scale(1.05);
  }

  ${props => props.isOpen && `
    background: linear-gradient(135deg, #ef4444, #dc2626, #b91c1c);
    animation: ${chatbotFloat} 2s ease-in-out infinite;
    
    &:hover {
      background: linear-gradient(135deg, #f87171, #ef4444, #dc2626);
    }
  `}
`;

// Chat Window
export const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 500px;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(51, 65, 85, 0.98))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))'
  };
  border-radius: 20px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  backdrop-filter: blur(30px);
  box-shadow: ${props => props.isDarkMode 
    ? '0 50px 100px rgba(0, 0, 0, 0.8), 0 0 50px rgba(59, 130, 246, 0.2)'
    : '0 50px 100px rgba(0, 0, 0, 0.3), 0 0 50px rgba(59, 130, 246, 0.1)'
  };
  transform-style: preserve-3d;
  animation: ${props => props.isClosing ? messageSlideOut : messageSlideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    background: ${props => props.isDarkMode 
      ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))'
      : 'linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))'
    };
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 320px;
    height: 450px;
    bottom: 75px;
  }

  @media (max-width: 480px) {
    width: 280px;
    height: 400px;
    right: -10px;
  }
`;

// Chat Header
export const ChatHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'};
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

export const ChatAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: ${chatbotFloat} 3s ease-in-out infinite;
`;

export const ChatHeaderInfo = styled.div`
  flex: 1;
`;

export const ChatTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  margin-bottom: 0.25rem;
`;

export const ChatStatus = styled.p`
  font-size: 0.9rem;
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    animation: ${chatbotPulse} 2s infinite;
  }
`;

export const ChatCloseButton = styled.button`
  background: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  border: 1px solid ${props => props.isDarkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(203, 213, 225, 0.6)'};
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
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

// Chat Messages Area
export const ChatMessages = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.2)' : 'rgba(226, 232, 240, 0.3)'};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(148, 163, 184, 0.5)'};
    border-radius: 3px;

    &:hover {
      background: ${props => props.isDarkMode ? 'rgba(100, 116, 139, 0.7)' : 'rgba(148, 163, 184, 0.7)'};
    }
  }
`;

// Message Components
export const Message = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  animation: ${messageSlideIn} 0.5s ease-out;
  animation-delay: ${props => props.delay || 0}ms;
  animation-fill-mode: both;

  ${props => props.isUser && `
    flex-direction: row-reverse;
  `}
`;

export const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
`;

export const MessageBubble = styled.div`
  max-width: 75%;
  padding: 1rem;
  border-radius: ${props => props.isUser 
    ? '20px 20px 5px 20px'
    : '20px 20px 20px 5px'
  };
  background: ${props => {
    if (props.isUser) {
      return props.isDarkMode 
        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        : 'linear-gradient(135deg, #60a5fa, #3b82f6)';
    } else {
      return props.isDarkMode 
        ? 'rgba(51, 65, 85, 0.8)'
        : 'rgba(248, 250, 252, 0.9)';
    }
  }};
  color: ${props => props.isUser 
    ? 'white'
    : props.isDarkMode ? '#e2e8f0' : '#374151'
  };
  border: 1px solid ${props => {
    if (props.isUser) {
      return 'rgba(59, 130, 246, 0.3)';
    } else {
      return props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)';
    }
  }};
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  word-wrap: break-word;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

export const MessageText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
`;

export const MessageTime = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin-top: 0.5rem;
  display: block;
`;

// Typing Indicator
export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
  animation: ${messageSlideIn} 0.5s ease-out;
`;

export const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 44px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    animation: ${typingDots} 1.5s infinite;

    &:nth-child(1) { animation-delay: 0ms; }
    &:nth-child(2) { animation-delay: 150ms; }
    &:nth-child(3) { animation-delay: 300ms; }
  }
`;

// Chat Input Area
export const ChatInputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'};
  display: flex;
  gap: 0.75rem;
  align-items: center;
  position: relative;
  z-index: 1;
`;

export const ChatInput = styled.input`
  flex: 1;
  padding: 1rem;
  border-radius: 25px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'};
  background: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  font-size: 0.95rem;
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
`;

export const SendButton = styled.button`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  transform-style: preserve-3d;

  &:hover {
    background: linear-gradient(135deg, #1d4ed8, #1e40af);
    transform: perspective(500px) rotateX(-10deg) rotateY(10deg) translateZ(10px) scale(1.1);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: perspective(500px) rotateX(-5deg) rotateY(5deg) translateZ(5px) scale(1.05);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Quick Actions
export const QuickActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

export const QuickActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.6)'};
  background: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)'
    : 'rgba(248, 250, 252, 0.8)'
  };
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#374151'};
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isDarkMode 
      ? 'rgba(71, 85, 105, 0.7)'
      : 'rgba(226, 232, 240, 0.9)'
    };
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

// Notification Badge
export const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${chatbotPulse} 2s infinite;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
`;
