import styled, { keyframes } from 'styled-components';

// 3D Animation Keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotateX(0deg); }
  50% { transform: translateY(-10px) rotateX(2deg); }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) rotateX(10deg);
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

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 10px 40px rgba(0,0,0,0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 20px 60px rgba(0,0,0,0.2);
  }
`;

const rotateIn3D = keyframes`
  0% { 
    transform: perspective(600px) rotateX(90deg) rotateY(0deg) translateZ(-200px);
    opacity: 0;
  }
  50% {
    transform: perspective(600px) rotateX(45deg) rotateY(5deg) translateZ(-100px);
    opacity: 0.7;
  }
  100% { 
    transform: perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
  }
`;

const scaleUp = keyframes`
  0% { transform: scale(0.8) rotateX(20deg); opacity: 0; }
  100% { transform: scale(1) rotateX(0deg); opacity: 1; }
`;

// Main Container
export const AttendanceWrapper = styled.div`
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
      'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)' :
      'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)'};
    pointer-events: none;
  }
`;

export const AttendanceContainer = styled.div`

  margin: 0 auto;
  position: relative;
  z-index: 1;
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;

// Header Section
export const AttendanceHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
  animation: ${scaleUp} 1s cubic-bezier(0.23, 1, 0.320, 1) forwards;
`;

export const AttendanceTitle = styled.h1`
  font-size: 42px;
  font-weight: 900;
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)' :
    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.1);
  letter-spacing: -1px;
  animation: ${float} 4s ease-in-out infinite;
`;

export const AttendanceSubtitle = styled.p`
  font-size: 18px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  margin-bottom: 24px;
  font-weight: 500;
`;

// Stats Cards Section
export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  perspective: 1000px;
`;

export const StatsCard = styled.div`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)' : 
    'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'};
  border: ${props => props.isDarkMode ? 
    '2px solid rgba(59, 130, 246, 0.2)' : 
    '2px solid transparent'};
  border-radius: 24px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
  box-shadow: ${props => props.isDarkMode ? 
    '0 25px 50px rgba(0, 0, 0, 0.8), 0 10px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(59, 130, 246, 0.1)' :
    '0 25px 50px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  animation: ${rotateIn3D} 1.2s cubic-bezier(0.23, 1, 0.320, 1) forwards;
  animation-delay: ${props => props.delay || 0}ms;
  opacity: 0;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.isDarkMode ? 
      `conic-gradient(from 0deg, transparent, ${props.color}25, transparent)` :
      `conic-gradient(from 0deg, transparent, ${props.color}15, transparent)`};
    animation: ${shimmer} 3s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' :
      'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 70%)'};
    border-radius: 24px;
    pointer-events: none;
  }

  &:hover {
    transform: perspective(1000px) rotateX(-8deg) rotateY(12deg) translateZ(80px) scale(1.05);
    box-shadow: ${props => props.isDarkMode ? 
      `0 40px 80px rgba(0, 0, 0, 0.6), 0 20px 40px ${props.color}60, 0 0 40px ${props.color}40` :
      `0 40px 80px rgba(0, 0, 0, 0.2), 0 20px 40px ${props.color}40, 0 0 40px ${props.color}30`};
    border-color: ${props => props.color};

    &::before {
      opacity: 1;
    }
  }

  &:hover .stats-icon {
    transform: translateZ(40px) rotateY(15deg) scale(1.2);
  }

  &:hover .stats-value {
    transform: translateZ(30px) scale(1.1);
  }

  &:hover .stats-label {
    transform: translateZ(20px);
  }
`;

export const StatsIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
`;

export const StatsValue = styled.div`
  font-size: 36px;
  font-weight: 900;
  color: ${props => props.color};
  margin-bottom: 8px;
  background: ${props => `linear-gradient(135deg, ${props.color}, #667eea)`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
`;

export const StatsLabel = styled.div`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#d1d5db' : '#64748b'};
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
`;

// Table Section
export const TableSection = styled.div`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 
    'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)'};
  border-radius: 32px;
  overflow: hidden;
  box-shadow: ${props => props.isDarkMode ? 
    '0 32px 64px rgba(0, 0, 0, 0.8), 0 16px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 0 20px rgba(59, 130, 246, 0.1)' :
    '0 32px 64px rgba(0, 0, 0, 0.08), 0 16px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)'};
  border: ${props => props.isDarkMode ? 
    '1px solid rgba(59, 130, 246, 0.2)' : 
    '1px solid #e2e8f0'};
  position: relative;
  animation: ${slideInUp} 1s cubic-bezier(0.23, 1, 0.320, 1) forwards;
  animation-delay: 600ms;
  opacity: 0;
  transform-style: preserve-3d;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)' :
      'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)'};
    pointer-events: none;
    border-radius: 32px;
  }

  &:hover {
    transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) translateZ(20px);
    box-shadow: ${props => props.isDarkMode ? 
      '0 40px 80px rgba(0, 0, 0, 0.6), 0 20px 40px rgba(59, 130, 246, 0.3)' :
      '0 40px 80px rgba(0, 0, 0, 0.15), 0 20px 40px rgba(59, 130, 246, 0.2)'};
  }
`;

export const TableHeader = styled.div`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : 
    'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
  padding: 24px 32px;
  border-bottom: ${props => props.isDarkMode ? 
    '2px solid rgba(59, 130, 246, 0.3)' : 
    '2px solid #e2e8f0'};
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
      'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.08) 50%, transparent 70%)' :
      'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.05) 50%, transparent 70%)'};
    animation: ${shimmer} 3s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)' :
      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)'};
  }
`;

export const TableTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1f2937'};
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

export const TableSubtitle = styled.p`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  position: relative;
  z-index: 1;
`;

// 3D Table
export const Table3D = styled.div`
  perspective: 1200px;
  transform-style: preserve-3d;
`;

export const TableContainer = styled.div`
  min-height: 400px;
  max-height: 800px; // Increased max height
  overflow-y: auto;
  transform-style: preserve-3d;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode ? '#374151' : '#f1f5f9'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode ? '#6b7280' : '#cbd5e1'};
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.isDarkMode ? '#9ca3af' : '#94a3b8'};
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  transform-style: preserve-3d;
`;

export const TableHead = styled.thead`
  background: ${props => props.isDarkMode ? 
    'linear-gradient(135deg, #334155 0%, #475569 100%)' : 
    'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'};
  position: sticky;
  top: 0;
  z-index: 10;
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' :
      'linear-gradient(90deg, rgba(59, 130, 246, 0.02), rgba(139, 92, 246, 0.02), rgba(59, 130, 246, 0.02))'};
    background-size: 200% 100%;
    animation: ${shimmer} 4s ease infinite;
    pointer-events: none;
  }
`;

export const TableHeaderRow = styled.tr`
  transform-style: preserve-3d;
`;

export const TableHeaderCell = styled.th`
  padding: 20px 24px;
  text-align: left;
  font-weight: 700;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#1f2937' : '#1f2937'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: ${props => props.isDarkMode ? 
    '2px solid rgba(59, 130, 246, 0.4)' : 
    '2px solid #94a3b8'};
  position: relative;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;

  &:first-child {
    border-top-left-radius: 0;
  }

  &:last-child {
    border-top-right-radius: 0;
  }

  &:hover {
    background: ${props => props.isDarkMode ? 
      'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' : 
      'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'};
    transform: translateZ(5px);
    color: ${props => props.isDarkMode ? '#ffffff' : '#1f2937'};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent)' :
      'linear-gradient(90deg, transparent, #3b82f6, transparent)'};
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }
`;

export const TableBody = styled.tbody`
  transform-style: preserve-3d;
`;

export const TableRow = styled.tr`
  background: ${props => props.isDarkMode ? 
    (props.index % 2 === 0 ? 'rgba(30, 41, 59, 0.8)' : 'rgba(51, 65, 85, 0.8)') : 
    (props.index % 2 === 0 ? '#ffffff' : '#f8fafc')};
  border-bottom: ${props => props.isDarkMode ? 
    '1px solid rgba(59, 130, 246, 0.15)' : 
    '1px solid #e2e8f0'};
  cursor: pointer;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: ${props => (props.index || 0) * 50}ms;
  opacity: 1; // Start visible by default
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(90deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))' :
      'linear-gradient(90deg, rgba(59, 130, 246, 0.02), rgba(139, 92, 246, 0.02), rgba(59, 130, 246, 0.02))'};
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    background: ${props => props.isDarkMode ? 
      'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' : 
      'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'};
    transform: perspective(1000px) rotateX(-3deg) translateZ(15px) scale(1.02);
    box-shadow: ${props => props.isDarkMode ? 
      '0 15px 30px rgba(0, 0, 0, 0.3), 0 8px 15px rgba(59, 130, 246, 0.4)' :
      '0 15px 30px rgba(0, 0, 0, 0.1), 0 8px 15px rgba(59, 130, 246, 0.2)'};
    border-color: ${props => props.isDarkMode ? 
      'rgba(59, 130, 246, 0.6)' : 
      '#3b82f6'};

    &::before {
      opacity: 1;
    }
  }

  &:hover td {
    transform: translateZ(5px);
    color: ${props => props.isDarkMode ? '#f1f5f9' : '#1f2937'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 20px 24px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#374151'};
  border-bottom: ${props => props.isDarkMode ? 
    '1px solid rgba(59, 130, 246, 0.15)' : 
    '1px solid #e2e8f0'};
  transform-style: preserve-3d;
  transition: all 0.3s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.isDarkMode ? 
      'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.08), transparent)' :
      'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.05), transparent)'};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

// Status Badge
export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;

  ${props => {
    switch (props.status) {
      case 'Present':
        return `
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        `;
      case 'Absent':
        return `
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        `;
      case 'Late':
        return `
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        `;
      case 'Early Leave':
        return `
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        `;
      default:
        return `
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4);
        `;
    }
  }}

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
    transform: perspective(1000px) rotateX(-5deg) rotateY(8deg) translateZ(10px) scale(1.1);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);

    &::before {
      left: 100%;
    }
  }
`;

// Avatar Component
export const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.320, 1);
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

  &:hover {
    transform: perspective(1000px) rotateY(15deg) rotateX(8deg) scale(1.2) translateZ(20px);
    box-shadow: 0 20px 50px rgba(102, 126, 234, 0.6), 0 0 35px rgba(102, 126, 234, 0.7);

    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }
`;

// Action Buttons
export const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 4px;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;

  ${props => props.variant === 'edit' && `
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  `}

  ${props => props.variant === 'delete' && `
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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
    transform: perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(8px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) translateZ(4px) scale(0.98);
  }
`;

// Loading States
export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 40px auto;

  @keyframes spin {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(360deg); }
  }
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  font-size: 18px;
  font-weight: 500;
  
  &::before {
    content: '📊';
    display: block;
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

// Filter Section
export const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
  animation: ${slideInUp} 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: 400ms;
  opacity: 0;
`;

export const FilterInput = styled.input`
  padding: 12px 16px;
  border: 2px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-radius: 12px;
  background: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1f2937'};
  font-size: 14px;
  transition: all 0.3s ease;
  transform-style: preserve-3d;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 8px 20px rgba(59, 130, 246, 0.2);
    transform: perspective(1000px) rotateX(-2deg) translateZ(5px);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#9ca3af' : '#6b7280'};
  }
`;

export const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid ${props => props.isDarkMode ? '#4b5563' : '#e2e8f0'};
  border-radius: 12px;
  background: ${props => props.isDarkMode ? '#374151' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#f9fafb' : '#1f2937'};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  transform-style: preserve-3d;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 8px 20px rgba(59, 130, 246, 0.2);
    transform: perspective(1000px) rotateX(-2deg) translateZ(5px);
  }
`;
