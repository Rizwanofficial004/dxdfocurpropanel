import styled from 'styled-components';

export const Wrapper = styled.div`
  font-family: 'Segoe UI', sans-serif;
  background: ${props => {
    if (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') {
      return 'none';
    }
    return 'transparent';
  }};
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : 'inherit'};
  min-height: auto;
  transition: all 0.3s ease;
`;

export const Container = styled.div`
  background: ${props => {
    // Check multiple ways dark mode might be indicated
    if (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') {
      return '#1f2937 !important';
    }
    return 'white !important';
  }};
  border-radius: 10px;
  padding: 20px;
  box-shadow: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)'};
  transition: all 0.3s ease;
  border: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '1px solid #374151' : 'none'};
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#1f2937'} !important;
  
  /* Force dark mode styles to override any global CSS */
  ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') && `
    * {
      color: #f3f4f6 !important;
    }
    
    input, select, textarea {
      background: #374151 !important;
      color: #f3f4f6 !important;
      border-color: #4b5563 !important;
    }
  `}
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 20px;
`;

export const DateScrollContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 500px;
  overflow-x: auto;
  padding: 4px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#f1f1f1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#6b7280' : '#c1c1c1'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#a8a8a8'};
  }
`;

export const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f9fafb' : '#111827'};
  margin-bottom: 20px;
  transition: color 0.3s ease;
`;

export const Username = styled.div`
  font-weight: 600;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff'};
  font-size: 16px;
  white-space: nowrap;
  transition: color 0.3s ease;
`;

export const Arrow = styled.div`
  cursor: pointer;
  font-size: 20px;
  padding: 4px 10px;
  user-select: none;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#374151'};
  transition: color 0.3s ease;
  
  &:hover {
    color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : '#111827'};
  }
`;

export const DateItem = styled.div`
  background: ${props => {
    if (props.active) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#3b82f6' : '#0364ff';
    if (props.singleDateActive) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#059669' : '#10b981';
    if (props.isToday) return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#d97706' : '#fbbf24';
    return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#f1f5f9';
  }};
  color: ${props => (props.active || props.singleDateActive || props.isToday) 
    ? 'white' 
    : (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#e5e7eb' : '#111827'};
  font-weight: 600;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  min-width: 55px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => {
      if (props.active || props.singleDateActive || props.isToday) return '';
      return (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#4b5563' : '#e2e8f0';
    }};
  }

  span {
    display: block;
    font-size: 10px;
    font-weight: 400;
    color: ${props => (props.active || props.singleDateActive || props.isToday) 
      ? 'white' 
      : (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  }

  ${props => props.isToday && `
    &::after {
      content: 'Today';
      position: absolute;
      bottom: -18px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 8px;
      font-weight: 500;
      color: ${(props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#d97706' : '#fbbf24'};
    }
  `}
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '8px' : '0'};
`;

export const Card = styled.div`
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
  padding: 12px;
  box-shadow: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
    ? '0 2px 4px rgba(0,0,0,0.3)' 
    : '0 2px 4px rgba(0,0,0,0.04)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : 'transparent'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? '0 4px 8px rgba(0,0,0,0.4)' 
      : '0 4px 8px rgba(0,0,0,0.08)'};
  }
`;

export const Img = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 10px;
`;

export const TaskName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#111827'};
  margin-bottom: 4px;
`;

export const TaskTime = styled.div`
  font-size: 13px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

export const FolderCard = styled.div`
  background: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#1f2937' : 'white'};
  border: 2px solid ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#374151' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#60a5fa' : '#0364ff'};
    box-shadow: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark')
      ? '0 4px 12px rgba(96, 165, 250, 0.2)' 
      : '0 4px 12px rgba(3, 100, 255, 0.1)'};
    transform: translateY(-2px);
  }
`;

export const FolderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const FolderIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

export const FolderName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#f3f4f6' : '#111827'};
  flex: 1;
`;

export const FolderStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const FolderStat = styled.div`
  font-size: 13px;
  color: ${props => (props.isDarkMode || props.theme?.name === 'dark' || props.theme?.mode === 'dark') ? '#9ca3af' : '#6b7280'};
  display: flex;
  align-items: center;
  gap: 6px;
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
