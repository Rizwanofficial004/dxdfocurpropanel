import styled, { keyframes, css } from 'styled-components';

// Keyframe animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
`;

const fadeInDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
`;

export const TooltipIcon = styled.span`
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

export const TooltipContent = styled.div`
  position: absolute;
  ${props => {
    // Vertical positioning
    if (props.position?.vertical === 'bottom') {
      return `
        top: calc(100% + 8px);
      `;
    }
    return `
      bottom: calc(100% + 8px);
    `;
  }}
  
  ${props => {
    // Horizontal positioning
    if (props.position?.horizontal === 'left') {
      return `
        left: 0;
        transform-origin: left center;
      `;
    }
    if (props.position?.horizontal === 'right') {
      return `
        right: 0;
        transform-origin: right center;
      `;
    }
    return `
      left: 50%;
      transform: translateX(-50%);
      transform-origin: center bottom;
    `;
  }}
  
  padding: 12px 16px;
  background: ${props => props.$isDarkMode ? '#ffffff' : '#1f2937'};
  border: 2px solid ${props => props.$isDarkMode ? '#e5e7eb' : '#374151'};
  border-radius: 8px;
  color: ${props => props.$isDarkMode ? '#1f2937' : '#ffffff'};
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  white-space: normal;
  max-width: 300px;
  min-width: 150px;
  z-index: 999999;
  box-shadow: ${props => props.$isDarkMode 
    ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)' 
    : '0 10px 25px rgba(0, 0, 0, 0.5)'};
  
  /* Visibility and Display */
  display: ${props => props.show ? 'block' : 'none'};
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  pointer-events: none;
  
  /* Smooth Animations */
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Animation based on position */
  ${props => {
    if (!props.show) return '';
    
    const isBottom = props.position?.vertical === 'bottom';
    const isCenter = props.position?.horizontal === 'center';
    const isLeft = props.position?.horizontal === 'left';
    const isRight = props.position?.horizontal === 'right';
    
    if (isCenter && isBottom) {
      return css`animation: ${fadeInUp} 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    }
    if (isCenter && !isBottom) {
      return css`animation: ${fadeInDown} 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    }
    if (isLeft) {
      return css`animation: ${fadeInLeft} 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    }
    if (isRight) {
      return css`animation: ${fadeInRight} 0.3s cubic-bezier(0.4, 0, 0.2, 1);`;
    }
    return '';
  }}
  
  /* Scale effect on show */
  transform: ${props => {
    const isCenter = props.position?.horizontal === 'center';
    if (!props.show) {
      return isCenter ? 'translateX(-50%) scale(0.95)' : 'scale(0.95)';
    }
    return isCenter ? 'translateX(-50%) scale(1)' : 'scale(1)';
  }};
  
  &::after {
    content: '';
    position: absolute;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${props => props.show ? 1 : 0};
    ${props => {
      const isTop = props.position?.vertical !== 'bottom';
      const isCenter = props.position?.horizontal === 'center';
      const isLeft = props.position?.horizontal === 'left';
      const borderColor = props.$isDarkMode ? '#e5e7eb' : '#374151';
      
      if (isTop) {
        // Arrow pointing down (tooltip is above)
        return `
          top: 100%;
          ${isCenter ? 'left: 50%; transform: translateX(-50%);' : ''}
          ${isLeft ? 'left: 16px;' : ''}
          ${!isCenter && !isLeft ? 'right: 16px;' : ''}
          border: 6px solid transparent;
          border-top-color: ${borderColor};
        `;
      } else {
        // Arrow pointing up (tooltip is below)
        return `
          bottom: 100%;
          ${isCenter ? 'left: 50%; transform: translateX(-50%);' : ''}
          ${isLeft ? 'left: 16px;' : ''}
          ${!isCenter && !isLeft ? 'right: 16px;' : ''}
          border: 6px solid transparent;
          border-bottom-color: ${borderColor};
        `;
      }
    }}
  }
  
  &::before {
    content: '';
    position: absolute;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: ${props => props.show ? 1 : 0};
    ${props => {
      const isTop = props.position?.vertical !== 'bottom';
      const isCenter = props.position?.horizontal === 'center';
      const isLeft = props.position?.horizontal === 'left';
      const bgColor = props.$isDarkMode ? '#ffffff' : '#1f2937';
      
      if (isTop) {
        // Inner arrow (tooltip is above)
        return `
          top: 100%;
          ${isCenter ? 'left: 50%; transform: translateX(-50%);' : ''}
          ${isLeft ? 'left: 16px;' : ''}
          ${!isCenter && !isLeft ? 'right: 16px;' : ''}
          border: 5px solid transparent;
          border-top-color: ${bgColor};
          margin-top: -1px;
        `;
      } else {
        // Inner arrow (tooltip is below)
        return `
          bottom: 100%;
          ${isCenter ? 'left: 50%; transform: translateX(-50%);' : ''}
          ${isLeft ? 'left: 16px;' : ''}
          ${!isCenter && !isLeft ? 'right: 16px;' : ''}
          border: 5px solid transparent;
          border-bottom-color: ${bgColor};
          margin-bottom: -1px;
        `;
      }
    }}
  }
`;
