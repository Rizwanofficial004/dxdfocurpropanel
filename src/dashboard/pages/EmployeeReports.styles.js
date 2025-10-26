import styled from 'styled-components';

export const Container = styled.div`
  /* Keep no top padding, but add 24px to left/right/bottom to match page layouts */
  padding: 0 24px 24px 24px;
  background: transparent;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: ${props => props.isDarkMode ? '#1a1f2e' : '#ffffff'};
  border-bottom: 1px solid ${props => props.isDarkMode ? '#2d3748' : '#e2e8f0'};
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#ffffff' : '#1a202c'};
  margin: 0;
  letter-spacing: 0.5px;
`;

export const NewEmployeeButton = styled.button`
  padding: 10px 24px;
  background: ${props => props.isDarkMode ? '#3b82f6' : '#2563eb'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isDarkMode ? '#2563eb' : '#1d4ed8'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ContentWrapper = styled.div`
  background: ${props => props.isDarkMode ? '#1a1f2e' : '#ffffff'};
  border: 1px solid ${props => props.isDarkMode ? '#2d3748' : '#e2e8f0'};
  border-top: none;
  padding: 24px 32px;
  min-height: calc(100vh - 200px);
  overflow-x: auto;
`;

export const SearchSection = styled.div`
  margin-bottom: 24px;
`;

export const SearchLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  margin-bottom: 8px;
  letter-spacing: 0.5px;
`;

export const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  background: ${props => props.isDarkMode ? '#0f1419' : '#f8fafc'};
  border: 1px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#1a202c'};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#6b7280' : '#94a3b8'};
  }
`;

export const FilterSection = styled.div`
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#2d3748' : '#e2e8f0'};
`;

export const FilterLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  letter-spacing: 0.5px;
`;

export const FilterSelect = styled.select`
  padding: 8px 32px 8px 12px;
  background: ${props => props.isDarkMode ? '#0f1419' : '#f8fafc'};
  border: 1px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 13px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#1a202c'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const ClearButton = styled.button`
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  border-radius: 4px;
  font-size: 18px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.isDarkMode ? '#374151' : '#e2e8f0'};
    color: ${props => props.isDarkMode ? '#e0e0e0' : '#1a202c'};
  }
`;

export const TableWrapper = styled.div`
  overflow-x: auto;
  margin-bottom: 24px;
  width: 100%;
  position: relative;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode ? '#0f1419' : '#f1f5f9'};
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
    border-radius: 4px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  min-width: 1080px;
`;

export const TableHead = styled.thead`
  background: ${props => props.isDarkMode ? '#0f1419' : '#f8fafc'};
  border-bottom: 2px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.isDarkMode ? '#2d3748' : '#e2e8f0'};
  transition: background-color 0.2s ease;

  &:hover {
    /* Use a subtle light overlay in dark mode (not solid white) so text remains visible */
    background: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'};
  }
`;

export const TableHeader = styled.th`
  padding: 14px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  letter-spacing: 0.8px;
  text-transform: uppercase;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.3;
`;

export const TableCell = styled.td`
  padding: 12px 10px;
  font-size: 13px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#1a202c'};
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;

  /* Ensure cell text remains readable when the parent row is hovered */
  ${TableRow}:hover & {
    color: ${props => props.isDarkMode ? '#e6eefc' : '#0f172a'};
  }
`;

// Special variant used for empty/loading full-row cells so we can force a specific hover color
export const EmptyStateCell = styled(TableCell)`
  text-align: center;
  padding: 40px;

  /* In dark mode, when hovered, force black text as requested */
  ${TableRow}:hover & {
    color: ${props => props.isDarkMode ? '#000000' : '#0f172a'} !important;
  }
`;

export const EmployeeName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#3b82f6' : '#2563eb'};
  margin-bottom: 4px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

export const EmployeeTeam = styled.div`
  font-size: 11px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: ${props => {
    if (props.$status === 'active') return props.isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7';
    if (props.$status === 'inactive') return props.isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2';
    return props.isDarkMode ? 'rgba(156, 163, 175, 0.15)' : '#f3f4f6';
  }};
  color: ${props => {
    if (props.$status === 'active') return '#22c55e';
    if (props.$status === 'inactive') return '#ef4444';
    return props.isDarkMode ? '#9ca3af' : '#6b7280';
  }};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

export const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #3b82f6;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

export const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

export const ActionButton = styled.button`
  padding: 9px 16px;
  background: ${props => {
    if (props.$variant === 'reset') return props.isDarkMode ? '#1e293b' : '#f1f5f9';
    if (props.$variant === 'view') return props.isDarkMode ? '#1e3a8a' : '#dbeafe';
    return props.isDarkMode ? '#1e293b' : '#f1f5f9';
  }};
  color: ${props => {
    if (props.$variant === 'reset') return props.isDarkMode ? '#e0e0e0' : '#475569';
    if (props.$variant === 'view') return props.isDarkMode ? '#93c5fd' : '#1e40af';
    return props.isDarkMode ? '#e0e0e0' : '#475569';
  }};
  border: 1px solid ${props => {
    if (props.$variant === 'reset') return props.isDarkMode ? '#374151' : '#cbd5e1';
    if (props.$variant === 'view') return props.isDarkMode ? '#1e40af' : '#93c5fd';
    return props.isDarkMode ? '#374151' : '#cbd5e1';
  }};
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.1px;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex: 1;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  line-height: 1;
  display: inline-block;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => {
      if (props.$variant === 'reset') return 'rgba(0, 0, 0, 0.15)';
      if (props.$variant === 'view') return 'rgba(59, 130, 246, 0.25)';
      return 'rgba(0, 0, 0, 0.15)';
    }};
    background: ${props => {
      if (props.$variant === 'reset') return props.isDarkMode ? '#334155' : '#e2e8f0';
      if (props.$variant === 'view') return props.isDarkMode ? '#1e40af' : '#bfdbfe';
      return props.isDarkMode ? '#334155' : '#e2e8f0';
    }};
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid ${props => props.isDarkMode ? '#2d3748' : '#e2e8f0'};
`;

export const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
`;

export const PaginationControls = styled.div`
  display: flex;
  gap: 8px;
`;

export const PageButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#f8fafc'};
  border: 1px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#475569'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.isDarkMode ? '#334155' : '#e2e8f0'};
    border-color: #3b82f6;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const PageSelect = styled.select`
  padding: 6px 24px 6px 10px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#f8fafc'};
  border: 1px solid ${props => props.isDarkMode ? '#374151' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#1a202c'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;
