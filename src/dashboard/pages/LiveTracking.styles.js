import styled from 'styled-components';

export const LiveTrackingContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
  transition: all 0.3s ease;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.theme.colors.text.primary};
`;

export const ContentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

export const TrackingCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 2px 8px rgba(0,0,0,0.3)' 
    : '0 2px 8px rgba(0,0,0,0.04)'};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const Title = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const FilterSection = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

export const LeftFilters = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

export const RightFilters = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const EmployeeName = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 16px;
  white-space: nowrap;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const FilterDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  min-width: 140px;
  cursor: pointer;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(0,0,0,0.1)'};
  }

  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 8px;
  }
`;

export const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  min-width: 200px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    opacity: ${props => props.theme.mode === 'dark' ? '0.7' : '0.5'};
  }

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(255,255,255,0.9)'};
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(0,0,0,0.1)'};
  }
`;

export const FilterButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.primary};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export const RefreshButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.success || '#10b981'};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const ExportButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

export const TestAPIButton = styled.button`
  padding: 8px 16px;
  background: #6366f1;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);
  border: 1px solid transparent;
  transition: all 0.2s ease;
  
  background: ${props => {
    const { status, theme } = props;
    const isDark = theme.mode === 'dark';
    switch(status) {
      case 'online': 
        return isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7';
      case 'offline': 
        return isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2';
      case 'idle': 
        return isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7';
      default: 
        return isDark ? 'rgba(156, 163, 175, 0.2)' : '#f3f4f6';
    }
  }};
  
  color: ${props => {
    const { status, theme } = props;
    const isDark = theme.mode === 'dark';
    switch(status) {
      case 'online': 
        return isDark ? '#4ade80' : '#166534';
      case 'offline': 
        return isDark ? '#f87171' : '#dc2626';
      case 'idle': 
        return isDark ? '#fbbf24' : '#d97706';
      default: 
        return isDark ? '#d1d5db' : '#374151';
    }
  }};
  
  border-color: ${props => {
    const { status, theme } = props;
    const isDark = theme.mode === 'dark';
    switch(status) {
      case 'online': 
        return isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(22, 101, 52, 0.2)';
      case 'offline': 
        return isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.2)';
      case 'idle': 
        return isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.2)';
      default: 
        return isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(55, 65, 81, 0.2)';
    }
  }};

  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const ActivityInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.colors.surface} 0%, rgba(0,0,0,0.3) 100%)`
    : `linear-gradient(135deg, ${props.theme.colors.surface} 0%, ${props.theme.colors.background} 100%)`};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 2px 8px rgba(0,0,0,0.3)' 
    : '0 2px 8px rgba(0,0,0,0.04)'};
  backdrop-filter: blur(10px);
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(0,0,0,0.1)'};
    border-color: ${props => props.theme.colors.primary};
  }

  .label {
    font-size: 12px;
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .value {
    font-size: 24px;
    color: ${props => props.theme.colors.text.primary};
    font-weight: 700;
    line-height: 1;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .icon {
    font-size: 20px;
    margin-bottom: 4px;
    filter: ${props => props.theme.mode === 'dark' ? 'brightness(1.2)' : 'brightness(1)'};
  }
`;

export const ScreenshotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

export const ScreenshotCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 2px 8px rgba(0,0,0,0.3)' 
    : '0 2px 8px rgba(0,0,0,0.04)'};
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 8px 25px rgba(0,0,0,0.5)' 
      : '0 8px 25px rgba(0,0,0,0.15)'};
    border-color: ${props => props.theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.success});
  }
`;

export const ScreenshotImage = styled.div`
  width: 100%;
  height: 160px;
  background: ${props => props.theme.mode === 'dark' 
    ? `linear-gradient(135deg, ${props.theme.colors.background} 0%, rgba(0,0,0,0.5) 100%)`
    : `linear-gradient(135deg, ${props.theme.colors.background} 0%, ${props.theme.colors.border} 100%)`};
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  border: 1px solid ${props => props.theme.colors.border};
  backdrop-filter: blur(10px);

  &::after {
    content: 'Screenshot Preview';
    position: absolute;
    bottom: 12px;
    font-size: 12px;
    opacity: ${props => props.theme.mode === 'dark' ? '0.8' : '0.7'};
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(0,0,0,0.6)' 
      : 'rgba(255,255,255,0.8)'};
    padding: 4px 8px;
    border-radius: 4px;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const TaskName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 1.4;
  flex: 1;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const TaskMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const TaskTime = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &::before {
    content: '🕐';
    font-size: 12px;
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 2px 8px rgba(0,0,0,0.3)' 
    : '0 2px 8px rgba(0,0,0,0.04)'};
  backdrop-filter: blur(10px);
`;

export const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover:not(:disabled) {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 0 16px;
  font-weight: 500;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  flex-direction: column;
  gap: 16px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ErrorMessage = styled.div`
  color: #ef4444;
  text-align: center;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 16px 0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  white-space: pre-wrap;
  line-height: 1.5;
`;

export const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const DebugPanel = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : '#f8fafc'};
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(148, 163, 184, 0.3)' 
    : '#e2e8f0'};
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  font-size: 12px;
  color: ${props => props.theme.mode === 'dark' 
    ? '#cbd5e1' 
    : '#64748b'};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.4)' 
      : '0 4px 12px rgba(0,0,0,0.1)'};
  }

  .debug-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: ${props => props.theme.colors.text.primary};
  }

  .search-active {
    margin-top: 8px;
    padding: 8px;
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(245, 158, 11, 0.2)' 
      : '#fef3c7'};
    border-radius: 4px;
    color: ${props => props.theme.mode === 'dark' 
      ? '#fbbf24' 
      : '#92400e'};
    border: 1px solid ${props => props.theme.mode === 'dark' 
      ? 'rgba(245, 158, 11, 0.3)' 
      : 'rgba(146, 64, 14, 0.2)'};
    
    strong {
      font-weight: 600;
    }
  }
`;

export const ImageUrlDisplay = styled.div`
  font-size: 10px;
  color: #6b7280;
  padding: 8px 0 4px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
  cursor: pointer;
  word-break: break-all;
  line-height: 1.3;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }
`;

export const UserInfo = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const UserEmail = styled.div`
  font-size: 10px;
  color: #9ca3af;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ActivityStatus = styled.div`
  font-size: 11px;
  margin-bottom: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  background: ${props => {
    if (props.minutesAgo <= 5) return '#dcfce7';
    if (props.minutesAgo <= 15) return '#fef3c7';
    return '#fee2e2';
  }};
  
  color: ${props => {
    if (props.minutesAgo <= 5) return '#166534';
    if (props.minutesAgo <= 15) return '#92400e';
    return '#dc2626';
  }};
  
  border: 1px solid ${props => {
    if (props.minutesAgo <= 5) return '#bbf7d0';
    if (props.minutesAgo <= 15) return '#fde68a';
    return '#fecaca';
  }};

  .active-badge {
    font-size: 8px;
    opacity: 0.8;
  }
`;

export const MetaInfo = styled.div`
  font-size: 11px;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  &.duration {
    color: #6366f1;
  }
  
  &.productivity {
    color: #059669;
  }
  
  &.screenshots {
    color: #8b5cf6;
  }
  
  &.filename {
    color: #6b7280;
    font-size: 9px;
    opacity: 0.8;
  }
  
  &.filesize {
    color: #6b7280;
    font-size: 9px;
    opacity: 0.8;
  }
  
  &.location {
    color: #6b7280;
    font-size: 10px;
  }
  
  &.last-activity {
    color: #f59e0b;
    font-size: 10px;
  }
`;

export const PriorityBadge = styled.div`
  font-size: 10px;
  margin-bottom: 4px;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 500;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  background-color: ${props => {
    switch(props.priority?.toLowerCase()) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fef3c7';
      default: return '#f0f9ff';
    }
  }};
  
  color: ${props => {
    switch(props.priority?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      default: return '#0369a1';
    }
  }};
`;

export const TimeDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .date {
    font-size: 13px;
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    &::before {
      content: '🕐';
      font-size: 12px;
    }
  }
  
  .time {
    font-size: 11px;
    color: #9ca3af;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

export const SortingBadge = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const SearchBadge = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ClearSearchButton = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
  padding: 2px;
  transition: color 0.2s ease;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  &:hover {
    color: #374151;
  }
`;

export const StatusInfo = styled.div`
  font-size: 11px;
  color: #6b7280;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const HeaderInfoBadge = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

export const StatusLegend = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : '#f8fafc'};
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

export const FilterIndicator = styled.div`
  background: ${props => props.isActive ? '#f0f9ff' : 'transparent'};
  font-weight: ${props => props.isActive ? '600' : 'normal'};
`;

export const DateFilterIndicator = styled.div`
  background: ${props => props.isActive ? '#fef3c7' : 'transparent'};
  font-weight: ${props => props.isActive ? '600' : 'normal'};
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SearchActiveIndicator = styled.div`
  background: ${props => props.hasSearch ? '#fef3c7' : 'transparent'};
  font-weight: ${props => props.hasSearch ? '600' : 'normal'};
  padding-right: ${props => props.hasSearch ? '35px' : '12px'};
`;

export const LoadingSpinner = styled.div`
  .spinner {
    color: white;
  }
`;

export const FilterHighlight = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const DateFilterNote = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
`;

export const LastUpdatedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const RefreshingIndicator = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const DebugTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

export const SearchActiveDebug = styled.div`
  margin-top: 8px;
  padding: 8px;
  background: #fef3c7;
  border-radius: 4px;
  color: #92400e;
  
  strong {
    font-weight: 600;
  }
`;

export const LoadingMessage = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ProgressContainer = styled.div`
  margin-top: 12px;
  width: 200px;
`;

export const ProgressBar = styled.div`
  background: #e5e7eb;
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  background: #3b82f6;
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

export const ProgressText = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  text-align: center;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ImageFallback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f3f4f6;
  color: #6b7280;
  padding: 8px;
  text-align: center;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  .icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .message {
    font-size: 12px;
    opacity: 0.7;
    margin-bottom: 4px;
  }

  .url {
    font-size: 8px;
    opacity: 0.5;
    word-break: break-all;
  }
`;

export const ImageError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fef2f2;
  color: #dc2626;
  padding: 8px;
  text-align: center;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  .icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .message {
    font-size: 10px;
    opacity: 0.8;
    margin-bottom: 4px;
  }

  .url {
    font-size: 8px;
    opacity: 0.6;
    word-break: break-all;
  }
`;

export const ProfileImage = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
`;

export const UserIcon = styled.span`
  font-size: 16px;
`;

export const OnlineIndicator = styled.span`
  color: #10b981;
  font-size: 10px;
`;

export const WorkingTime = styled.div`
  font-size: 11px;
  color: #6366f1;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const EfficiencyScore = styled.div`
  font-size: 11px;
  color: #059669;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const ScreenshotCount = styled.div`
  font-size: 10px;
  color: #8b5cf6;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Filename = styled.div`
  font-size: 9px;
  color: #6b7280;
  margin-bottom: 4px;
  opacity: 0.8;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const Filesize = styled.div`
  font-size: 9px;
  color: #6b7280;
  margin-bottom: 4px;
  opacity: 0.8;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const LocationInfo = styled.div`
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const LastActivityInfo = styled.div`
  font-size: 10px;
  color: #f59e0b;
  margin-bottom: 4px;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

export const TimeColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const TimeValue = styled.div`
  font-size: 11px;
  color: #9ca3af;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

// Dark Mode Theme Toggle Indicator
export const ThemeIndicator = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 8px 12px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.9)' 
    : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme.mode === 'dark' 
    ? '0 4px 12px rgba(0,0,0,0.4)' 
    : '0 4px 12px rgba(0,0,0,0.1)'};
  z-index: 1000;
  transition: all 0.3s ease;
  opacity: 0.8;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }

  &::before {
    content: '${props => props.theme.mode === 'dark' ? '🌙' : '☀️'}';
    margin-right: 6px;
  }
`;

// Enhanced Glass Effect for Dark Mode
export const GlassEffect = styled.div`
  background: ${props => props.theme.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.7)' 
    : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.mode === 'dark' 
    ? 'rgba(148, 163, 184, 0.2)' 
    : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.mode === 'dark' 
      ? 'rgba(30, 41, 59, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)'};
    border-color: ${props => props.theme.colors.primary};
  }
`;
