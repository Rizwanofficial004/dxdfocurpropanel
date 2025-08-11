import styled from 'styled-components';

// Enhanced theme detection for compatibility
const getThemeProps = (props) => {
  const isDarkMode = props.isDarkMode || props.theme?.mode === 'dark' || props.theme?.name === 'dark';
  return { isDarkMode, theme: props.theme };
};

export const Wrapper = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.surface || '#ffffff');
  }};
  border-radius: ${props => props.theme?.borderRadius?.lg || '10px'};
  padding: ${props => props.theme?.spacing?.xl || '20px'};
  box-shadow: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.3)') : (theme?.shadows?.md || '0 4px 10px rgba(0, 0, 0, 0.05)');
  }};
  font-family: ${props => props.theme?.typography?.fontFamily || "'Segoe UI', sans-serif"};
  border: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? `1px solid ${theme?.colors?.border || '#334155'}` : 'none';
  }};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme?.spacing?.lg || '20px'};
  flex-wrap: wrap;
  gap: ${props => props.theme?.spacing?.sm || '12px'};
`;

export const Title = styled.h3`
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
  }};
  margin: 0;
`;

export const FilterSection = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#f8fafc');
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  padding: ${props => props.theme?.spacing?.md || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
`;

export const FilterTitle = styled.h4`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1f2937');
  }};
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

export const FilterItem = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.selected) {
      return theme?.colors?.primary || '#0364ff';
    }
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : '#ffffff';
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.selected) {
      return '#ffffff';
    }
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#374151');
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.selected) {
      return theme?.colors?.primary || '#0364ff';
    }
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#d1d5db');
  }};
  border-radius: ${props => props.theme?.borderRadius?.sm || '6px'};
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      if (props.selected) {
        return theme?.colors?.primary || '#0364ff';
      }
      return isDarkMode ? (theme?.colors?.hover || '#334155') : (theme?.colors?.hover || '#f3f4f6');
    }};
    border-color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      if (props.selected) {
        return theme?.colors?.primary || '#0364ff';
      }
      return isDarkMode ? (theme?.colors?.text?.secondary || '#94a3b8') : '#9ca3af';
    }};
  }
`;

export const FilterCount = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.selected) {
      return 'rgba(255,255,255,0.2)';
    }
    return isDarkMode ? (theme?.colors?.hover || '#334155') : '#e5e7eb';
  }};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.selected) {
      return '#ffffff';
    }
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
`;

export const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
`;

export const BreadcrumbItem = styled.span`
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    if (props.active) {
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#0364ff');
    }
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      if (props.clickable) {
        return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#0364ff');
      }
      return props.active ? 
        (isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#0364ff')) : 
        (isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280'));
    }};
  }
`;

export const SearchInfo = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 
      (theme?.colors?.primary + '20' || 'rgba(59, 130, 246, 0.2)') : 
      (theme?.colors?.primary + '10' || '#f0f9ff');
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary + '40' || '#bae6fd');
  }};
  border-radius: ${props => props.theme?.borderRadius?.sm || '6px'};
  padding: ${props => props.theme?.spacing?.sm || '12px'};
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.primary || '#0369a1');
  }};
`;

export const LogItem = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : '#ffffff';
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
  }};
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  padding: ${props => props.theme?.spacing?.sm || '12px'};
  margin-bottom: 8px;
  display: flex;
  gap: ${props => props.theme?.spacing?.sm || '12px'};
  align-items: flex-start;
`;

export const LogImage = styled.img`
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: ${props => props.theme?.borderRadius?.sm || '4px'};
  flex-shrink: 0;
`;

export const LogContent = styled.div`
  flex: 1;
`;

export const LogTimestamp = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
  margin-bottom: 4px;
`;

export const LogAction = styled.div`
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1f2937');
  }};
  margin-bottom: 4px;
`;

export const LogDetails = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '13px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#4b5563');
  }};
`;

export const CategorySection = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : (theme?.colors?.background || '#f8fafc');
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e2e8f0');
  }};
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  padding: ${props => props.theme?.spacing?.md || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.md || '16px'};
`;

export const CategoryTitle = styled.h4`
  font-size: ${props => props.theme?.typography?.fontSize?.md || '16px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1f2937');
  }};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${props => props.theme?.spacing?.sm || '12px'};
  margin-bottom: ${props => props.theme?.spacing?.lg || '24px'};
`;

export const CategoryCard = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : '#ffffff';
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
  }};
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  padding: ${props => props.theme?.spacing?.md || '16px'};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? 
        (theme?.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.3)') : 
        '0 4px 12px rgba(0, 0, 0, 0.1)';
    }};
    border-color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#0364ff');
    }};
  }
`;

export const CategoryName = styled.div`
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#1f2937');
  }};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CategoryTime = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '18px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : (theme?.colors?.primary || '#0364ff');
  }};
`;

export const CategoryIcon = styled.span`
  font-size: 20px;
`;

export const ProgramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

export const ProgramItem = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.surface || '#1e293b') : '#ffffff';
  }};
  border: 1px solid ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
  }};
  border-radius: ${props => props.theme?.borderRadius?.sm || '6px'};
  padding: ${props => props.theme?.spacing?.sm || '12px'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    background: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.hover || '#334155') : (theme?.colors?.hover || '#f9fafb');
    }};
    border-color: ${props => {
      const { isDarkMode, theme } = getThemeProps(props);
      return isDarkMode ? (theme?.colors?.text?.secondary || '#94a3b8') : '#9ca3af';
    }};
  }
`;

export const ProgramName = styled.div`
  font-weight: ${props => props.theme?.typography?.fontWeight?.medium || '500'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#374151');
  }};
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '13px'};
  flex: 1;
  margin-right: 8px;
`;

export const ProgramTime = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.hover || '#334155') : (theme?.colors?.hover || '#f3f4f6');
  }};
  padding: 2px 8px;
  border-radius: ${props => props.theme?.borderRadius?.xl || '12px'};
`;

export const StatsOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme?.spacing?.md || '16px'};
  margin-bottom: ${props => props.theme?.spacing?.lg || '20px'};
`;

export const StatCard = styled.div`
  background: ${props => {
    // Keep gradients for visual appeal, but adjust for dark mode
    const { isDarkMode } = getThemeProps(props);
    if (isDarkMode) {
      return props.gradient ? 
        `linear-gradient(135deg, ${props.gradient.replace(/,/g, ', ')})` : 
        'linear-gradient(135deg, #374151 0%, #1f2937 100%)';
    }
    return props.gradient ? 
      `linear-gradient(135deg, ${props.gradient})` : 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }};
  color: white;
  padding: ${props => props.theme?.spacing?.lg || '20px'};
  border-radius: ${props => props.theme?.borderRadius?.lg || '10px'};
  text-align: center;
`;

export const StatValue = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.['2xl'] || '24px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  margin-bottom: 4px;
`;

export const StatLabel = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  opacity: 0.9;
`;

export const SearchBox = styled.div`
  width: 240px;
`;

export const Timeline = styled.div`
  position: relative;
  padding-left: 20px;
  border-left: 2px dashed ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.border || '#334155') : (theme?.colors?.border || '#e5e7eb');
  }};
`;

export const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Icon = styled.div`
  position: absolute;
  left: -12px;
  top: 0;
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.primary || '#3b82f6') : '#8b5cf6';
  }};
  color: white;
  border-radius: 50%;
  padding: 8px;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Content = styled.div`
  flex: 1;
  margin-left: 20px;
`;

export const TitleText = styled.div`
  font-weight: ${props => props.theme?.typography?.fontWeight?.semibold || '600'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.primary || '#f8fafc') : (theme?.colors?.text?.primary || '#111827');
  }};
  margin-bottom: 4px;
`;

export const Subtitle = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  color: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.text?.secondary || '#cbd5e1') : (theme?.colors?.text?.secondary || '#6b7280');
  }};
`;

export const Media = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;

  img {
    border-radius: ${props => props.theme?.borderRadius?.sm || '6px'};
    width: 48px;
    height: 48px;
    object-fit: cover;
  }
`;

export const Badge = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? (theme?.colors?.success || '#22c55e') : (theme?.colors?.success || '#22c55e');
  }};
  color: white;
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  padding: 4px 10px;
  border-radius: ${props => props.theme?.borderRadius?.sm || '6px'};
  margin-left: auto;
`;

// JSON Dashboard specific styles
export const DashboardContainer = styled.div`
  background: ${props => {
    const { isDarkMode, theme } = getThemeProps(props);
    return isDarkMode ? 
      'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }};
  border-radius: ${props => props.theme?.borderRadius?.xl || '12px'};
  padding: ${props => props.theme?.spacing?.lg || '20px'};
  color: white;
  margin-bottom: ${props => props.theme?.spacing?.lg || '20px'};
`;

export const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

export const DashboardTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
`;

export const DashboardBadge = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  opacity: 0.8;
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: ${props => props.theme?.borderRadius?.xl || '12px'};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
`;

export const StatItem = styled.div`
  background: rgba(255,255,255,0.2);
  padding: 15px;
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  text-align: center;
`;

export const StatItemValue = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.['2xl'] || '24px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
`;

export const StatItemLabel = styled.div`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  opacity: 0.9;
`;

export const ProgramList = styled.div`
  background: rgba(255,255,255,0.1);
  border-radius: ${props => props.theme?.borderRadius?.md || '8px'};
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
`;

export const ProgramListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: ${props => props.isLast ? 'none' : '1px solid rgba(255,255,255,0.1)'};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255,255,255,0.1);
  }
`;

export const ProgramListName = styled.span`
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '14px'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ProgramListTime = styled.span`
  font-size: ${props => props.theme?.typography?.fontSize?.xs || '12px'};
  font-weight: ${props => props.theme?.typography?.fontWeight?.bold || '700'};
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: ${props => props.theme?.borderRadius?.lg || '10px'};
`;
