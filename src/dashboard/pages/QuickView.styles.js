import styled from 'styled-components';

export const QuickViewContainer = styled.div`
  width: 100%;
  padding: 24px 32px;
  min-height: 100vh;
  /* max-width: 1200px; */
  margin: 0 auto;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background-color: #1d232c;
  `}
`;

export const QuickViewCard = styled.div`
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  
  /* Dark mode */
  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #6b7280;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

export const NotificationBanner = styled.div`
  border-bottom: 1px solid #42a5f5;
  padding: 16px 24px;
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: #1565c0;
  line-height: 1.5;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: linear-gradient(135deg, #1d232c 0%, #374151 100%);
    border-bottom-color: #6b7280;
    color: #fff;
  `}
`;

export const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DownloadLink = styled.a`
  text-decoration: underline;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #60a5fa;
    
    &:hover {
      color: #93c5fd;
    }
  `}
`;

export const QuickViewHeader = styled.div`
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-bottom-color: #6b7280;
  `}
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QuickViewTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #fff;
  `}
`;

export const HelpIcon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #5f6368;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #6b7280;
    color: #fff;
  `}
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  z-index: 999;
  position: relative;
`;

export const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1000;
`;

export const SearchInput = styled.input`
  padding: 8px 40px 8px 12px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  min-width: 250px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
  }

  &::placeholder {
    color: #5f6368;
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-color: #6b7280;
    color: #fff;
    
    &:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.1);
    }
    
    &::placeholder {
      color: #9ca3af;
    }
  `}
`;

export const SearchIcon = styled.span`
  position: absolute;
  right: 12px;
  color: #5f6368;
  font-size: 16px;
  pointer-events: none;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #9ca3af;
  `}
`;

export const DateControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  color: #3c4043;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-color: #6b7280;
    color: #fff;
  `}
`;

export const DateIcon = styled.span`
  font-size: 14px;
  color: #1a73e8;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #60a5fa;
  `}
`;

export const TableContainer = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeader = styled.thead`
  border-bottom: 1px solid #e0e0e0;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-bottom-color: #6b7280;
  `}
`;

export const TableHeaderRow = styled.tr`
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
  `}
`;

export const TableHeaderCell = styled.th`
  padding: 16px 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;

  &:first-child {
    padding-left: 24px;
  }

  &:last-child {
    padding-right: 24px;
  }

  &.sortable {
    cursor: pointer;
    user-select: none;

    &:hover {
      background: #f1f3f4;
    }

    &::after {
      content: '↕';
      position: absolute;
      right: 4px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 10px;
      opacity: 0.5;
    }
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #9ca3af;
    
    &.sortable:hover {
      background: #374151;
    }
  `}
`;

export const TableBody = styled.tbody`
  /* Table body styles */
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s;


  &:last-child {
    border-bottom: none;
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    border-bottom-color: #6b7280;
    
    &:hover {
      background: #374151;
    }
  `}
`;

export const TableCell = styled.td`
  padding: 16px 12px;
  font-size: 14px;

  vertical-align: middle;

  &:first-child {
    padding-left: 24px;
  }

  &:last-child {
    padding-right: 24px;
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #fff;
  `}
`;

export const StatusIndicator = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.status === 'ACTIVE' ? '#4caf50' : '#9e9e9e'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
`;

export const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const EmployeeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #1a73e8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
`;

export const EmployeeName = styled.div`
  font-weight: 500;

  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #fff;
  `}
`;

export const TeamName = styled.div`
  font-size: 12px;
  color: #5f6368;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #9ca3af;
  `}
`;

export const TimeCell = styled.div`
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  font-weight: 500;

  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #fff;
  `}
`;

export const ProductivityBar = styled.div`
  width: 60px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #6b7280;
  `}
`;

export const ProductivityFill = styled.div`
  height: 100%;
  background: #4caf50;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

export const PercentageText = styled.span`
  font-size: 13px;
  font-weight: 500;

  margin-left: 8px;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #fff;
  `}
`;

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid #dadce0;
  font-size: 13px;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-top-color: #6b7280;
  `}
`;

export const EmployeesPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5f6368;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #9ca3af;
  `}
`;

export const PerPageSelector = styled.select`
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  color: #3c4043;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-color: #6b7280;
    color: #fff;
  `}
`;

export const PaginationRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const PageInfo = styled.span`
  color: #5f6368;
  font-size: 13px;
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    color: #9ca3af;
  `}
`;

export const PaginationNav = styled.div`
  display: flex;
  gap: 4px;
`;

export const NavButton = styled.button`
  background: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  color: #5f6368;
  cursor: pointer;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }
  
  /* Dark mode */
  ${() => document.documentElement.getAttribute('data-theme') === 'dark' && `
    background: #1d232c;
    border-color: #6b7280;
    color: #9ca3af;
    
    &:hover:not(:disabled) {
      background: #374151;
    }
  `}
`;

// Responsive Design
export const ResponsiveStyles = styled.div`
  @media (max-width: 768px) {
    ${QuickViewContainer} {
      padding: 16px;
    }
    
    ${HeaderTop} {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    ${HeaderControls} {
      flex-direction: column;
      align-items: stretch;
    }
    
    ${PaginationContainer} {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    ${PaginationRight} {
      justify-content: space-between;
    }
    
    ${TableContainer} {
      overflow-x: auto;
    }
    
    ${SearchInput} {
      min-width: 100%;
    }
  }
  
  @media (min-width: 1200px) {
    ${QuickViewContainer} {
      padding: 24px 64px;
    }
  }
`;
