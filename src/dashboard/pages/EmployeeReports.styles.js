import styled from 'styled-components';

export const Container = styled.div`
  padding: 0;
  background: transparent;
  min-height: 100vh;
`;

export const LayoutWrapper = styled.div`
  display: grid;
  grid-template-columns: 45% 55%;
  gap: 0;
  height: calc(100vh - 100px);
`;

// ============ TIMELINE SECTION (LEFT) ============

export const TimelineSection = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border};
  border-right: none;
  padding: 24px;
  overflow-y: auto;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#0f1419' : '#f1f5f9'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#374151' : '#cbd5e1'};
    border-radius: 4px;
  }
`;

export const TimelineHeader = styled.div`
  margin-bottom: 32px;
`;

export const TimelineTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
`;

export const TimelineList = styled.div`
  position: relative;
`;

export const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 80px 40px 1fr;
  gap: 0;
  margin-bottom: 32px;
  position: relative;
`;

export const TimelineTime = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  text-align: right;
  padding-right: 16px;
  padding-top: 2px;
`;

export const TimelineDot = styled.div`
  width: 16px;
  height: 16px;
  background: ${props => props.theme.colors.primary};
  border: 3px solid ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#ffffff'};
  border-radius: 50%;
  position: relative;
  z-index: 2;
  margin: 0 auto;
  margin-top: 4px;
`;

export const TimelineLine = styled.div`
  position: absolute;
  left: 99px;
  top: 20px;
  width: 2px;
  height: calc(100% + 32px);
  background: ${props => props.theme.colors.border};
  z-index: 1;
`;

export const TimelineContent = styled.div`
  padding-left: 8px;
`;

export const TimelineDuration = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

export const TimelineApp = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const TimelineDescription = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

// ============ SHARE SECTION (RIGHT) ============

export const ShareSection = styled.div`
  background: ${props => props.theme.mode === 'dark' ? '#1a1f2e' : '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 24px;
  overflow-y: auto;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.mode === 'dark' ? '#0f1419' : '#f1f5f9'};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.mode === 'dark' ? '#374151' : '#cbd5e1'};
    border-radius: 4px;
  }
`;

export const ShareHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const ShareTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const ExportButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.mode === 'dark' ? '#2563eb' : '#1d4ed8'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ShareStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

export const StatBox = styled.div`
  flex: 1;
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

export const StatNumber = styled.div`
  font-size: ${props => props.$isDuration ? '18px' : '28px'};
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
`;

export const ShareTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  ${props => !props.$isHeader && `
    &:hover {
      background: ${props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.05)' : '#f8fafc'};
    }
  `}
`;

export const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.mode === 'dark' ? '#0f1419' : '#f8fafc'};
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

export const TableCell = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

export const SortIcon = styled.span`
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.6;
`;

export const ActivityLink = styled.span`
  color: ${props => props.$isMeeting ? '#3b82f6' : props.theme.colors.text.primary};
  text-decoration: ${props => props.$isMeeting ? 'underline' : 'none'};
  cursor: ${props => props.$isMeeting ? 'pointer' : 'default'};
  font-weight: ${props => props.$isMeeting ? '500' : '400'};
  
  &:hover {
    ${props => props.$isMeeting && `
      color: #2563eb;
    `}
  }
`;
