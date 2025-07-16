import styled from 'styled-components';
import { theme } from './theme';

export const Container = styled.div`
  // max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const CardBody = styled.div`
  padding: ${theme.spacing.lg};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Grid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(300px, 1fr))'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || theme.spacing.sm};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Button = styled.button`
  background: ${props => {
    switch(props.variant) {
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Typography = styled.div`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize.base};
  font-weight: ${props => theme.typography.fontWeight[props.weight] || theme.typography.fontWeight.normal};
  color: ${props => {
    switch(props.color) {
      case 'secondary': return theme.colors.text.secondary;
      case 'light': return theme.colors.text.light;
      case 'primary': return theme.colors.primary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.text.primary;
    }
  }};
  line-height: 1.5;
  margin: ${props => props.margin || '0'};
`;

export const Heading = styled(Typography).attrs(props => ({
  as: props.level || 'h2',
  weight: 'semibold'
}))`
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: ${props => {
    switch(props.level) {
      case 'h1': return theme.typography.fontSize['4xl'];
      case 'h2': return theme.typography.fontSize['3xl'];
      case 'h3': return theme.typography.fontSize['2xl'];
      case 'h4': return theme.typography.fontSize.xl;
      case 'h5': return theme.typography.fontSize.lg;
      case 'h6': return theme.typography.fontSize.base;
      default: return theme.typography.fontSize['2xl'];
    }
  }};
  margin-bottom: ${theme.spacing.sm};
`;

// Enhanced theme detection for compatibility
const getThemeProps = (props) => {
  const isDarkMode = props.isDarkMode || props.theme?.mode === 'dark' || props.theme?.name === 'dark';
  return { isDarkMode, theme: props.theme };
};

// Global Slider Styles for Dark/Light Mode
export const SliderContainer = styled.div`
  width: 100%;
  padding: ${props => props.theme?.spacing?.sm || '8px'} 0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Slider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.slider?.track || '#475569') : (theme?.colors?.slider?.track || '#e2e8f0');
  }};
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  /* Track styling for WebKit browsers (Chrome, Safari) */
  &::-webkit-slider-track {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.slider?.track || '#475569') : (theme?.colors?.slider?.track || '#e2e8f0');
    }};
    border: none;
  }

  /* Thumb styling for WebKit browsers */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.slider?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
    }};
    border: 3px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.primary || '#60a5fa') : (theme?.colors?.primary || '#3b82f6');
    }};
    cursor: pointer;
    box-shadow: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)';
      return `0 0 0 0px transparent, 0 4px 8px ${shadowColor}, 0 2px 4px rgba(0, 0, 0, 0.1)`;
    }};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: scale(1.15);
      border-width: 4px;
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.3)';
        return `0 0 0 8px ${hoverColor}, 0 6px 12px ${shadowColor}, 0 3px 6px rgba(0, 0, 0, 0.15)`;
      }};
    }

    &:active {
      transform: scale(1.1);
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.15)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
        return `0 0 0 12px ${hoverColor}, 0 4px 8px ${shadowColor}, 0 2px 4px rgba(0, 0, 0, 0.2)`;
      }};
    }
  }

  /* Track styling for Firefox */
  &::-moz-range-track {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.slider?.track || '#475569') : (theme?.colors?.slider?.track || '#e2e8f0');
    }};
    border: none;
  }

  /* Thumb styling for Firefox */
  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.slider?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
    }};
    border: 3px solid ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.primary || '#60a5fa') : (theme?.colors?.primary || '#3b82f6');
    }};
    cursor: pointer;
    box-shadow: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)';
      return `0 0 0 0px transparent, 0 4px 8px ${shadowColor}, 0 2px 4px rgba(0, 0, 0, 0.1)`;
    }};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: scale(1.15);
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.3)';
        return `0 0 0 8px ${hoverColor}, 0 6px 12px ${shadowColor}, 0 3px 6px rgba(0, 0, 0, 0.15)`;
      }};
    }

    &:active {
      transform: scale(1.1);
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.15)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
        return `0 0 0 12px ${hoverColor}, 0 4px 8px ${shadowColor}, 0 2px 4px rgba(0, 0, 0, 0.2)`;
      }};
    }
  }

  /* Focus styles */
  &:focus {
    outline: none;
    
    &::-webkit-slider-thumb {
      border-width: 4px;
      transform: scale(1.1);
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
        return `0 0 0 12px ${hoverColor}, 0 8px 16px ${shadowColor}, 0 4px 8px rgba(0, 0, 0, 0.2)`;
      }};
    }

    &::-moz-range-thumb {
      transform: scale(1.1);
      box-shadow: ${props => {
        const { isDarkMode, theme } = getThemeProps(props);
        const hoverColor = isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(59, 130, 246, 0.2)';
        const shadowColor = isDarkMode ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)';
        return `0 0 0 12px ${hoverColor}, 0 8px 16px ${shadowColor}, 0 4px 8px rgba(0, 0, 0, 0.2)`;
      }};
    }
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &::-webkit-slider-thumb {
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #6b7280;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: none !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        border-width: 3px !important;
      }
    }

    &::-moz-range-thumb {
      cursor: not-allowed;
      background: #9ca3af;
      border-color: #6b7280;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: none !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
    }
  }
`;

export const SliderLabel = styled.label`
  display: block;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1e293b');
  }};
  margin-bottom: ${props => props.theme?.spacing?.xs || '4px'};
`;

export const SliderValue = styled.span`
  display: inline-block;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#2563eb');
  }};
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
  }};
  padding: ${props => props.theme?.spacing?.xs || '2px 6px'};
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  margin-left: ${props => props.theme?.spacing?.sm || '8px'};
`;

export const SliderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme?.spacing?.xs || '4px'};
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;
