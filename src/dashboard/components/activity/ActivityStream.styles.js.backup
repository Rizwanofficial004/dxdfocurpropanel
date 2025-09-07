import styled, { keyframes, css } from 'styled-components';

// Simple fade-in animations
const containerEntrance = keyframes`

`;

const cardEntrance = keyframes`

`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
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
  transition: all 0.3s ease;
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
  
  // Glass morphism effect
  backdrop-filter: blur(20px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
      ? 'rgba(55, 65, 81, 0.5)' 
      : 'rgba(241, 245, 249, 0.5)'
  };
  
  // Simple shadow
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  transition: all 0.3s ease;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#1f2937'} !important;
  
  // Simple hover effects
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  // Entrance animation
  animation: ${css`${containerEntrance} 0.6s ease both`};
  
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
  
  &:hover {
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
  
  transition: all 0.3s ease;
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
  
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(96, 165, 250, 0.2)'
        : 'rgba(3, 100, 255, 0.2)'
    };
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : '#111827'};
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(156, 163, 175, 0.2)'
        : 'rgba(55, 65, 81, 0.2)'
    };
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    opacity: 0.8;
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
  
  // Glass morphism effect
  backdrop-filter: blur(12px);
  border: 1px solid ${props => 
    (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? 'rgba(75, 85, 99, 0.3)'
      : 'rgba(241, 245, 249, 0.4)'
  };
  
  // Simple shadow
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    background: ${props => {
      if (props.active || props.singleDateActive || props.isToday) return '';
      return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? 'rgba(75, 85, 99, 0.8)' : 'rgba(226, 232, 240, 0.9)';
    }};
  }
  
  &:active {
    opacity: 0.9;
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
  
  // Simple shadows
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
        ? '#60a5fa' 
        : '#0364ff'
    };
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff'};
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
  
  &:hover {
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
  
  // Glass morphism effect
  backdrop-filter: blur(20px);
  
  // Simple shadow
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') 
        ? '#60a5fa' 
        : '#0364ff'
    };
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  
  &:hover {
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
  
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff'};
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
  
  &:hover {
    background: ${props => 
      (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
        ? 'rgba(156, 163, 175, 0.2)'
        : 'rgba(107, 114, 128, 0.2)'
    };
  }
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

// Inline Style Components
export const StatusBanner = styled.div`
  background: ${props => props.status === 'disconnected' ? '#fef2f2' : '#f0f9ff'};
  border: 1px solid ${props => props.status === 'disconnected' ? '#fecaca' : '#bae6fd'};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${props => props.status === 'disconnected' ? '#dc2626' : '#0369a1'};
`;

export const StatusText = styled.small`
  font-size: 12px;
`;

export const ImageComponentContainer = styled.div`
  position: relative;
  ${props => props.customStyle && Object.entries(props.customStyle).map(([key, value]) => 
    `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
  ).join('\n')}
`;

export const StyledImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
`;

export const TaskInfoSmall = styled.div`
  font-size: 10px;
  margin-top: 4px;
`;

export const TaskInfoTiny = styled.div`
  font-size: 8px;
  margin-top: 2px;
  opacity: 0.7;
`;

export const TaskInfoMicro = styled.div`
  font-size: 7px;
  margin-top: 2px;
  opacity: 0.5;
`;

export const LoadingCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: 8px;
  padding: 20px;
  min-height: 200px;
  text-align: center;
`;

export const LoadingEmoji = styled.div`
  font-size: 16px;
  margin-bottom: 4px;
`;

export const LoadingText = styled.div`
  font-size: 10px;
`;

export const LoadingSubtext = styled.div`
  font-size: 8px;
  margin-top: 2px;
  opacity: 0.7;
`;

export const ErrorCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme?.colors?.surface || '#ffffff'};
  border: 1px solid ${props => props.theme?.colors?.border || '#e5e7eb'};
  border-radius: 8px;
  padding: 24px;
  min-height: 200px;
  text-align: center;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
`;

export const ErrorEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

export const ErrorTitle = styled.div`
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 2px;
`;

export const ErrorDescription = styled.div`
  font-size: 8px;
  line-height: 1.2;
  opacity: 0.8;
`;

export const ErrorDetails = styled.div`
  font-size: 7px;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  color: #dc2626;
`;

export const HelpContainer = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  font-size: 12px;
  color: #856404;
`;

export const HelpList = styled.ol`
  margin: 8px 0 0 16px;
  padding: 0;
`;

export const CodeSnippet = styled.code`
  background: #f8f9fa;
  padding: 2px 4px;
`;

export const CardDetailContainer = styled.div`
  position: relative;
  ${props => props.customStyles && Object.entries(props.customStyles).map(([key, value]) => 
    `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
  ).join('\n')}
`;

export const TaskDetailHeader = styled.div`
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #e5e7eb;
`;

export const TaskDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 0;
`;

export const TaskDetailItem = styled.div`
  font-size: 8px;
  color: #6b7280;
  line-height: 1.3;
`;
