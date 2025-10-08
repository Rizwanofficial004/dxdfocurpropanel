import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Styled Components
const Container = styled.div`
  padding: 24px;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: ${props => props.theme.colors.surface};
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.colors.text.primary};
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const NewEmployeeButton = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #3367d6;
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  width: 300px;

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }
`;

const StatusFilter = styled.select`
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${props => props.theme.colors.background};
`;

const TableHeaderCell = styled.th`
  padding: 16px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
`;

const TableCell = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  vertical-align: middle;
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const EmployeeAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#4285f4'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.span`
  font-weight: 600;
  color: #4285f4;
  margin-bottom: 2px;
`;

const EmployeeTeam = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'Active': return '#22c55e';
      case 'Inactive': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const ScreenshotToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToggleSwitch = styled.div`
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: ${props => props.enabled ? '#4285f4' : '#e5e7eb'};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.enabled ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ViewReportButton = styled.button`
  background: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #3367d6;
    transform: translateY(-1px);
  }
`;

const AccessBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.access) {
      case 'Admin': return '#ef4444';
      case 'Manager': return '#f59e0b';
      case 'Employee': return '#22c55e';
      case 'Viewer': return '#6b7280';
      default: return '#9ca3af';
    }
  }};
  color: white;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const PaginationInfo = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? '#4285f4' : props.theme.colors.background};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active ? '#3367d6' : props.theme.colors.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageSizeSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
`;

// Mock employee data
const mockEmployees = [
  {
    id: 1,
    name: 'dddx (You)',
    team: 'Team N/A',
    status: 'Active',
    designation: 'Admin',
    screensToday: 0,
    lastLogin: 'Never',
    captureScreenshots: true,
    dashboardAccess: 'Admin',
    avatar: 'D'
  },
  {
    id: 2,
    name: 'John Smith',
    team: 'Development',
    status: 'Active',
    designation: 'Senior Developer',
    screensToday: 45,
    lastLogin: '2 hours ago',
    captureScreenshots: true,
    dashboardAccess: 'Employee',
    avatar: 'JS'
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    team: 'Design',
    status: 'Active',
    designation: 'UI/UX Designer',
    screensToday: 32,
    lastLogin: '30 minutes ago',
    captureScreenshots: true,
    dashboardAccess: 'Employee',
    avatar: 'SJ'
  },
  {
    id: 4,
    name: 'Mike Chen',
    team: 'Marketing',
    status: 'Inactive',
    designation: 'Marketing Specialist',
    screensToday: 0,
    lastLogin: '2 days ago',
    captureScreenshots: false,
    dashboardAccess: 'Viewer',
    avatar: 'MC'
  },
  {
    id: 5,
    name: 'Emily Davis',
    team: 'Development',
    status: 'Active',
    designation: 'Frontend Developer',
    screensToday: 28,
    lastLogin: '1 hour ago',
    captureScreenshots: true,
    dashboardAccess: 'Employee',
    avatar: 'ED'
  }
];

const Employees = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + pageSize);

  const toggleScreenshots = (employeeId) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, captureScreenshots: !emp.captureScreenshots }
        : emp
    ));
  };

  const getAvatarColor = (name) => {
    const colors = ['#4285f4', '#34a853', '#ea4335', '#fbbc04', '#9aa0a6', '#8e24aa'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <DashboardLayout>
      <Container theme={theme}>
        <PageHeader theme={theme}>
          <PageTitle theme={theme}>EMPLOYEES</PageTitle>
          <NewEmployeeButton>
            + NEW EMPLOYEE
          </NewEmployeeButton>
        </PageHeader>

        <TableContainer theme={theme}>
          <TableHeader theme={theme}>
            <SearchContainer>
              <SearchInput
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                theme={theme}
              />
              <StatusFilter
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                theme={theme}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </StatusFilter>
            </SearchContainer>
          </TableHeader>

          <Table>
            <TableHead theme={theme}>
              <tr>
                <TableHeaderCell theme={theme}>NAME ↑</TableHeaderCell>
                <TableHeaderCell theme={theme}>STATUS</TableHeaderCell>
                <TableHeaderCell theme={theme}>DESIGNATION</TableHeaderCell>
                <TableHeaderCell theme={theme}>SCREENS TODAY</TableHeaderCell>
                <TableHeaderCell theme={theme}>LAST LOGIN ⓘ</TableHeaderCell>
                <TableHeaderCell theme={theme}>CAPTURE SCREENSHOTS ⓘ</TableHeaderCell>
                <TableHeaderCell theme={theme}>EMPLOYEE DASHBOARD ACCESS ⓘ</TableHeaderCell>
                <TableHeaderCell theme={theme}>ACTIONS</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} theme={theme}>
                  <TableCell theme={theme}>
                    <EmployeeInfo>
                      <EmployeeAvatar color={getAvatarColor(employee.name)}>
                        {employee.avatar}
                      </EmployeeAvatar>
                      <EmployeeDetails>
                        <EmployeeName>{employee.name}</EmployeeName>
                        <EmployeeTeam theme={theme}>{employee.team}</EmployeeTeam>
                      </EmployeeDetails>
                    </EmployeeInfo>
                  </TableCell>
                  <TableCell theme={theme}>
                    <StatusBadge status={employee.status}>
                      {employee.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell theme={theme}>{employee.designation}</TableCell>
                  <TableCell theme={theme}>{employee.screensToday}</TableCell>
                  <TableCell theme={theme}>{employee.lastLogin}</TableCell>
                  <TableCell theme={theme}>
                    <ScreenshotToggle>
                      <ToggleSwitch
                        enabled={employee.captureScreenshots}
                        onClick={() => toggleScreenshots(employee.id)}
                      />
                    </ScreenshotToggle>
                  </TableCell>
                  <TableCell theme={theme}>
                    <AccessBadge access={employee.dashboardAccess}>
                      {employee.dashboardAccess}
                    </AccessBadge>
                  </TableCell>
                  <TableCell theme={theme}>
                    <ViewReportButton>
                      📊 VIEW REPORT
                    </ViewReportButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination theme={theme}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: theme.colors.text.secondary, fontSize: '14px' }}>
                Employees per page:
              </span>
              <PageSizeSelector
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                theme={theme}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </PageSizeSelector>
            </div>
            
            <PaginationInfo theme={theme}>
              {startIndex + 1} - {Math.min(startIndex + pageSize, filteredEmployees.length)} of {filteredEmployees.length}
            </PaginationInfo>
            
            <PaginationControls>
              <PageButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                theme={theme}
              >
                ⟨⟨
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                theme={theme}
              >
                ⟨
              </PageButton>
              
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <PageButton
                    key={pageNum}
                    active={currentPage === pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    theme={theme}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}
              
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                theme={theme}
              >
                ⟩
              </PageButton>
              <PageButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                theme={theme}
              >
                ⟩⟩
              </PageButton>
            </PaginationControls>
          </Pagination>
        </TableContainer>
      </Container>
    </DashboardLayout>
  );
};

export default Employees;