import styled from 'styled-components';
import { theme } from './theme';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.md};
`;

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

export const CardHeader = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
`;

export const CardBody = styled.div`
  padding: ${theme.spacing.lg};
`;

export const Grid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  grid-template-columns: ${props => props.columns || 'repeat(auto-fit, minmax(300px, 1fr))'};
  
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
  font-family: ${theme.typography.fontFamily};
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
