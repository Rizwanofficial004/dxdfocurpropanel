import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Container,
  Header,
  Title,
  NewEmployeeButton,
  ContentWrapper,
  SearchSection,
  SearchLabel,
  SearchInput,
  FilterSection,
  FilterLabel,
  FilterSelect,
  ClearButton,
  TableWrapper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  EmployeeName,
  EmployeeTeam,
  StatusBadge,
  ToggleSwitch,
  ToggleInput,
  ToggleSlider,
  ActionButton,
  PaginationWrapper,
  PaginationInfo,
  PaginationControls,
  PageButton,
  PageSelect
} from './EmployeeReports.styles';

const EmployeeReports = () => {
  const { theme } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Use Vite proxy - it will forward to https://dxdtime.ddsolutions.io/api/sync-staffs/
      const response = await fetch('/api/sync-staffs/');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setEmployees(result.data || []);
      setTotalCount(result.count || result.data?.length || 0);
      console.log(`✅ Loaded ${result.data?.length || 0} employees`);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Set empty array on error so UI still renders
      setEmployees([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get job position name
  const getJobPosition = (positionId) => {
    if (!positionId) return 'Employee';
    const positions = {
      '1': 'HR',
      '2': 'Employee',
      '3': 'Team Lead',
      '4': 'Project Manager',
      '5': 'Manager',
      '6': 'Developer',
      '7': 'Designer',
      '8': 'QA',
      '9': 'DevOps'
    };
    return positions[positionId] || 'Employee';
  };

  // Helper function to check if employee is manager
  const isManager = (positionId) => {
    return positionId === '5' || positionId === '3' || positionId === '4';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  };

  // Filter and search employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.staff_id?.toLowerCase().includes(searchTerm.toLowerCase());
    // For now, all employees from API are considered active
    const matchesFilter = filterStatus === 'Active' || filterStatus === 'All';
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Handlers (non-functional for now)
  const handleNewEmployee = () => {
    console.log('Add new employee');
  };

  const handleResetPassword = (employeeId) => {
    console.log('Reset password for employee:', employeeId);
  };

  const handleViewReport = (employeeId) => {
    console.log('View report for employee:', employeeId);
  };

  const handleToggleScreenshot = (employeeId) => {
    console.log('Toggle screenshot for employee:', employeeId);
  };

  const handleToggleDashboard = (employeeId) => {
    console.log('Toggle dashboard access for employee:', employeeId);
  };

  const handleClearFilter = () => {
    setFilterStatus('Active');
  };

  return (
    <DashboardLayout headerTitle="Employees" headerBreadcrumb="Dashboard / Employees">
      <Container theme={theme}>
        <Header>
          <Title theme={theme}>EMPLOYEES</Title>
          <NewEmployeeButton theme={theme} onClick={handleNewEmployee}>
            + NEW EMPLOYEE
          </NewEmployeeButton>
        </Header>

        <ContentWrapper theme={theme}>
          {/* Search Section */}
          <SearchSection>
            <SearchLabel theme={theme}>SEARCH</SearchLabel>
            <SearchInput
              theme={theme}
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchSection>

          {/* Table */}
          <TableWrapper>
            <Table>
              <TableHead theme={theme}>
                <TableRow>
                  <TableHeader theme={theme} style={{ width: '160px' }}>NAME ⬆</TableHeader>
                  <TableHeader theme={theme} style={{ width: '80px' }}>STATUS</TableHeader>
                  <TableHeader theme={theme} style={{ width: '110px' }}>DESIGNATION</TableHeader>
                  <TableHeader theme={theme} style={{ width: '120px', textAlign: 'center' }}>SCREENSHOT INTERVAL</TableHeader>
                  <TableHeader theme={theme} style={{ width: '110px' }}>LAST LOGIN ⓘ</TableHeader>
                  <TableHeader theme={theme} style={{ width: '140px', textAlign: 'center' }}>DASHBOARD ACCESS ⓘ</TableHeader>
                  <TableHeader theme={theme} style={{ width: '280px', textAlign: 'center' }}>ACTIONS</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : currentEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentEmployees.map((employee) => (
                    <TableRow key={employee.id} theme={theme}>
                      <TableCell theme={theme}>
                        <EmployeeName theme={theme}>{employee.name || 'Unknown'}</EmployeeName>
                        <EmployeeTeam theme={theme}>
                          {getJobPosition(employee.job_position)}
                        </EmployeeTeam>
                      </TableCell>
                      <TableCell theme={theme}>
                        <StatusBadge theme={theme} $status="active">Active</StatusBadge>
                      </TableCell>
                      <TableCell theme={theme}>{getJobPosition(employee.job_position)}</TableCell>
                      <TableCell theme={theme} style={{ textAlign: 'center' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                          border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                          fontSize: '13px',
                          fontWeight: '600',
                          color: theme === 'dark' ? '#60a5fa' : '#2563eb'
                        }}>
                          <span>⏱️</span>
                          <span>{employee.screenshot_interval || 0} mins</span>
                        </div>
                      </TableCell>
                      <TableCell theme={theme}>{formatDate(employee.updated_at)}</TableCell>
                      <TableCell theme={theme} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <ToggleSwitch>
                            <ToggleInput
                              type="checkbox"
                              defaultChecked={true}
                              onChange={() => handleToggleDashboard(employee.id)}
                            />
                            <ToggleSlider theme={theme} />
                          </ToggleSwitch>
                          {isManager(employee.job_position) && (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Manager
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell theme={theme} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap', width: '100%' }}>
                          <ActionButton
                            theme={theme}
                            $variant="reset"
                            onClick={() => handleResetPassword(employee.id)}
                            title="Reset Password"
                          >
                            🔒 RESET PASSWORD
                          </ActionButton>
                          <ActionButton
                            theme={theme}
                            $variant="view"
                            onClick={() => handleViewReport(employee.id)}
                            title="View Report"
                          >
                            📊 VIEW REPORT
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableWrapper>

          {/* Pagination */}
          <PaginationWrapper>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: theme === 'dark' ? '#e0e0e0' : '#666' }}>
                Employees per page:
              </span>
              <PageSelect
                theme={theme}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </PageSelect>
            </div>
            
            <PaginationInfo theme={theme}>
              {startIndex + 1} – {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length}
            </PaginationInfo>
            
            <PaginationControls>
              <PageButton
                theme={theme}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                ⟨⟨
              </PageButton>
              <PageButton
                theme={theme}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ⟨
              </PageButton>
              <PageButton
                theme={theme}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                ⟩
              </PageButton>
              <PageButton
                theme={theme}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ⟩⟩
              </PageButton>
            </PaginationControls>
          </PaginationWrapper>
        </ContentWrapper>
      </Container>
    </DashboardLayout>
  );
};

export default EmployeeReports;
