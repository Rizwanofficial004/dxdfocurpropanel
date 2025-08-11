import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ToggleButton = styled.button`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  width: 60px;
  height: 32px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ToggleSlider = styled.div`
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 2px;
  left: ${props => props.isDark ? '32px' : '2px'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const ThemeLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleContainer>
      <ThemeLabel>☀️</ThemeLabel>
      <ToggleButton onClick={toggleTheme}>
        <ToggleSlider isDark={isDarkMode}>
          {isDarkMode ? '🌙' : '☀️'}
        </ToggleSlider>
      </ToggleButton>
      <ThemeLabel>🌙</ThemeLabel>
    </ToggleContainer>
  );
};
