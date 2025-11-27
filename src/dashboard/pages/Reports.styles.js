import styled from 'styled-components';

// Main wrapper
export const ReportsWrapper = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
`;

// Layout container
export const ReportsLayout = styled.div`
  display: flex;
  gap: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
  min-width: 0;
`;

// Left sidebar for employee selection
export const EmployeeSelection = styled.div`
  width: 300px;
  min-width: 280px;
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  box-sizing: border-box;
  flex-shrink: 0;
`;

export const EmployeeHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  text-transform: uppercase;
`;

export const EmployeeSearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const EmployeeList = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100vh - 100px);
  padding-right: 4px;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.theme.colors.text.tertiary};
    }
  }
`;

export const EmployeeItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  background: ${props => props.selected ? props.theme.colors.primary + '20' : 'transparent'};
  border: ${props => props.selected ? `1px solid ${props.theme.colors.primary}` : '1px solid transparent'};
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
  }
`;

export const EmployeeInner = styled.div``;

export const EmployeeName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const EmployeeDepartment = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

// Right content area for reports
export const ReportsContent = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: hidden;
  min-width: 0;
`;

export const ReportsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const ActivePassiveContainer = styled.div`
  display: flex;
  gap: 20px;
`;

export const TimeSection = styled.div`
  text-align: center;
`;

export const TimeSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

export const TimeSectionValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.primary};
`;

// Time breakdown grid
export const TimeBreakdown = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
  margin-top: 20px;
`;

export const TimeCategory = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${props => props.theme.colors.border};
`;

export const CategoryHeader = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

export const CategoryValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const CategoryPercentage = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.tertiary};
`;

export const CategoryIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${props => props.color};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
`;

// Filter Components
export const FilterSection = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const FilterLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const ClearDateButton = styled.button`
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  width: 100%;
`;

export const CalendarDay = styled.div`
  padding: 6px 2px;
  text-align: center;
  font-size: 10px;
  cursor: pointer;
  border-radius: 4px;
  background: ${props => {
    if (props.selected) return '#3b82f6';
    if (props.today) return '#10b981';
    return props.theme.colors.surface;
  }};
  color: ${props => {
    if (props.selected || props.today) return 'white';
    return props.theme.colors.text.primary;
  }};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  position: relative;
  overflow: visible;
  
  &:hover {
    background: ${props => {
      if (props.selected) return '#3b82f6';
      if (props.today) return '#10b981';
      return props.theme.colors.primary + '20';
    }};
  }
`;

export const DataIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 1px solid ${props => {
    if (props.theme?.mode === 'dark') return '#1e293b';
    return 'white';
  }};
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.5), 0 0 0 0.5px rgba(16, 185, 129, 0.15);
  z-index: 10;
  animation: pulse 2s ease-in-out infinite;
  pointer-events: none;
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.85;
    }
  }
`;

export const DayHeader = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: 2px;
  text-transform: uppercase;
`;

export const HourGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 3px;
  width: 100%;
`;

export const HourSlot = styled.div`
  padding: 6px 4px;
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  border-radius: 4px;
  background: ${props => {
    if (props.selected) return '#3b82f6';
    return props.theme.colors.surface;
  }};
  color: ${props => props.selected ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#3b82f6' : props.theme.colors.primary + '20'};
  }
`;

export const SummaryContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const SummaryText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  
  span {
    color: ${props => props.theme.colors.primary};
  }
`;

// Tab Navigation Components
export const TabContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#f8fafc'};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#334155' : '#e2e8f0'};
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 24px;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
`;

export const TabScrollContainer = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scroll-behavior: smooth;
  flex: 1;
  padding: 0 4px;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const TabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid ${props => props.active ? 'transparent' : props.theme.colors.border};
  border-radius: 8px;
  background: ${props => {
    if (props.active) {
      return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
    }
    return props.theme.mode === 'dark' ? '#374151' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme.mode === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;
  flex-shrink: 0;
  box-shadow: ${props => props.active ? '0 4px 8px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    background: ${props => {
      if (props.active) return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
      return props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9';
    }};
    transform: translateY(-1px);
    box-shadow: ${props => props.active ? '0 6px 12px rgba(59, 130, 246, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.15)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const TabIcon = styled.span`
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0.7};
`;

export const NavigationArrow = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.mode === 'dark' ? '#374151' : '#ffffff'};
  color: ${props => props.theme.mode === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9'};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
    background: ${props => props.theme.mode === 'dark' ? '#1f2937' : '#f9fafb'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Top Activity Components
export const TopActivityContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const TopActivityHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const TopActivityTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

export const TopActivityContent = styled.div`
  padding: 24px;
`;

export const WorkTimeSection = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
`;

export const WorkTimeStats = styled.div`
  flex: 1;
`;

export const WorkTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const WorkTimeLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color || props.theme.colors.text.primary};
  text-transform: uppercase;
  min-width: 80px;
`;

export const WorkTimeBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

export const WorkTimeProgress = styled.div`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.percentage}%;
  border-radius: 4px;
`;

export const WorkTimeValue = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  min-width: 60px;
`;

export const WorkTimePercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  min-width: 40px;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  min-width: 120px;
`;

export const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

export const UserDuration = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const ApplicationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

export const ApplicationCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const AppIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.color};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 12px;
`;

export const AppName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

export const AppDuration = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 4px;
`;

export const AppPercentage = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.tertiary};
`;

// Breaks & Meetings Components
export const BreaksMeetContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

export const BreakMeetSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const BreakMeetHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BreakMeetTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

export const InfoIcon = styled.span`
  width: 16px;
  height: 16px;
  background: ${props => props.theme.colors.text.tertiary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

export const BreakMeetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const BreakMeetTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

export const BreakMeetHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const BreakMeetHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BreakMeetTableBody = styled.tbody``;

export const BreakMeetRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

export const BreakMeetCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

export const DefinedBreakSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 24px;
`;

export const DefinedBreakHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DefinedBreakTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

// Task Table Components (for TASK tab)
export const TaskContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const TaskHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const TaskTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

export const TaskTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TaskTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

export const TaskHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const TaskHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TaskTableBody = styled.tbody``;

export const TaskRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

export const TaskCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

// IDLE Tab Components
export const IdleContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;

export const IdleTableSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const IdleChartSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const IdleHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const IdleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

export const IdleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const IdleTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

export const IdleHeaderRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const IdleHeaderCell = styled.th`
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const IdleTableBody = styled.tbody``;

export const IdleRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
`;

export const IdleCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  
  &.total-row {
    font-weight: 600;
    background: ${props => props.theme.colors.background};
  }
`;

export const PieChartWrapper = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
`;

export const PieChart = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg 18deg,
    #e5e7eb 18deg 360deg
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  &::before {
    content: '';
    width: 120px;
    height: 120px;
    background: ${props => props.theme.colors.surface};
    border-radius: 50%;
    position: absolute;
  }
  
  &::after {
    content: '95%';
    position: absolute;
    z-index: 1;
    font-size: 24px;
    font-weight: 700;
    color: ${props => props.theme.colors.text.primary};
  }
`;

export const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.theme.colors.text.primary};
`;

export const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  background: ${props => props.color};
  border-radius: 2px;
`;

export const LegendText = styled.span`
  font-weight: 500;
`;

// Time Log Summary Sub-tabs
export const TimeLogSummaryContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  overflow: hidden;
`;

export const TimeLogSummaryHeader = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const TimeLogSummaryTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0;
`;

export const SubTabContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const SubTabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid ${props => props.active ? 'transparent' : props.theme.colors.border};
  border-radius: 8px;
  background: ${props => {
    if (props.active) {
      return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
    }
    return props.theme.mode === 'dark' ? '#374151' : '#ffffff';
  }};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme.mode === 'dark' ? '#e5e7eb' : '#374151';
  }};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  
  &:hover {
    background: ${props => {
      if (props.active) return props.theme.mode === 'dark' ? '#3b82f6' : '#2563eb';
      return props.theme.mode === 'dark' ? '#4b5563' : '#f1f5f9';
    }};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const SubTabIcon = styled.span`
  font-size: 14px;
  opacity: ${props => props.active ? 1 : 0.7};
`;

export const HelpIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.theme.colors.text.tertiary};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
`;

export const TimeLogContent = styled.div`
  padding: 24px;
  min-height: 400px;
`;

// Weekly Report Table Components
export const WeeklyTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const WeeklyTableHeader = styled.thead`
  background: ${props => props.theme.colors.background};
`;

export const WeeklyHeaderRow = styled.tr`
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

export const WeeklyHeaderCell = styled.th`
  padding: 16px 20px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.background + '80'};
  }
`;

export const SortIcon = styled.span`
  margin-left: 8px;
  font-size: 10px;
  opacity: 0.6;
`;

export const WeeklyTableBody = styled.tbody``;

export const WeeklyRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(even) {
    background: ${props => props.theme.colors.background + '50'};
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
  }
`;

export const WeeklyCell = styled.td`
  padding: 16px 20px;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

export const EmployeeNameCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const WeeklyEmployeeName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
`;

export const EmployeeTeams = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const HoursCell = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

export const NotEnoughData = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.tertiary};
  font-style: italic;
`;

export const NoteText = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
`;

export const PaginationLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PaginationSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const PaginationArrow = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.3;
  }
`;