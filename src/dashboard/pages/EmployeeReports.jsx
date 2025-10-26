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
  const { theme, isDarkMode } = useTheme();
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

  // Helper function to get profile photo URL
  const getProfilePhotoUrl = (employee) => {
    if (!employee || !employee.profile_url || !employee.staff_id) {
      return null;
    }
    return `https://crm.deluxebilisim.com/uploads/staff_profile_images/${employee.staff_id}/small_${encodeURIComponent(employee.profile_url)}`;
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
      <Container isDarkMode={isDarkMode}>
        <Header isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>EMPLOYEES</Title>
          <NewEmployeeButton isDarkMode={isDarkMode} onClick={handleNewEmployee}>
            + NEW EMPLOYEE
          </NewEmployeeButton>
        </Header>

        <ContentWrapper isDarkMode={isDarkMode}>
          {/* Search Section */}
          <SearchSection>
            <SearchLabel isDarkMode={isDarkMode}>SEARCH</SearchLabel>
            <SearchInput
              isDarkMode={isDarkMode}
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchSection>

          {/* Table */}
          <TableWrapper>
            <Table>
              <TableHead isDarkMode={isDarkMode}>
                <TableRow>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '160px' }}>NAME ⬆</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '80px' }}>STATUS</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '110px' }}>DESIGNATION</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '120px', textAlign: 'center' }}>SCREENSHOT INTERVAL</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '110px' }}>LAST LOGIN ⓘ</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '140px', textAlign: 'center' }}>DASHBOARD ACCESS ⓘ</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '280px', textAlign: 'center' }}>ACTIONS</TableHeader>
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
                  currentEmployees.map((employee) => {
                    const profilePhotoUrl = getProfilePhotoUrl(employee);
                    return (
                      <TableRow key={employee.id} isDarkMode={isDarkMode}>
                        <TableCell isDarkMode={isDarkMode}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: profilePhotoUrl ? 'transparent' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '14px',
                              flexShrink: 0,
                              border: '2px solid',
                              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              {profilePhotoUrl ? (
                                <>
                                  <img 
                                    src={profilePhotoUrl} 
                                    alt={employee.name}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <div 
                                    className="avatar-fallback"
                                    style={{ 
                                      display: 'none',
                                      width: '100%',
                                      height: '100%',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                                    }}
                                  >
                                    {(employee.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                </>
                              ) : (
                                (employee.name || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <EmployeeName isDarkMode={isDarkMode}>{employee.name || 'Unknown'}</EmployeeName>
                              <EmployeeTeam isDarkMode={isDarkMode}>
                                {getJobPosition(employee.job_position)}
                              </EmployeeTeam>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell isDarkMode={isDarkMode}>
                          <StatusBadge isDarkMode={isDarkMode} $status="active">Active</StatusBadge>
                        </TableCell>
                      <TableCell isDarkMode={isDarkMode}>{getJobPosition(employee.job_position)}</TableCell>
                      <TableCell isDarkMode={isDarkMode} style={{ textAlign: 'center' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                          border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                          fontSize: '13px',
                          fontWeight: '600',
                          color: isDarkMode ? '#60a5fa' : '#2563eb'
                        }}>
                          <span>⏱️</span>
                          <span>{employee.screenshot_interval || 0} mins</span>
                        </div>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>{formatDate(employee.updated_at)}</TableCell>
                      <TableCell isDarkMode={isDarkMode} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <ToggleSwitch>
                            <ToggleInput
                              type="checkbox"
                              defaultChecked={true}
                              onChange={() => handleToggleDashboard(employee.id)}
                            />
                            <ToggleSlider isDarkMode={isDarkMode} />
                          </ToggleSwitch>
                          {isManager(employee.job_position) && (
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                              Manager
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap', width: '100%' }}>
                          <ActionButton
                            isDarkMode={isDarkMode}
                            $variant="reset"
                            onClick={() => handleResetPassword(employee.id)}
                            title="Reset Password"
                          >
                            🔒 RESET PASSWORD
                          </ActionButton>
                          <ActionButton
                            isDarkMode={isDarkMode}
                            $variant="view"
                            onClick={() => handleViewReport(employee.id)}
                            title="View Report"
                          >
                            📊 VIEW REPORT
                          </ActionButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
                )}
              </TableBody>
            </Table>
          </TableWrapper>

          {/* Pagination */}
          <PaginationWrapper>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: isDarkMode ? '#e0e0e0' : '#666' }}>
                Employees per page:
              </span>
              <PageSelect
                isDarkMode={isDarkMode}
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
            
            <PaginationInfo isDarkMode={isDarkMode}>
              {startIndex + 1} – {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length}
            </PaginationInfo>
            
            <PaginationControls>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                ⟨⟨
              </PageButton>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                ⟨
              </PageButton>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                ⟩
              </PageButton>
              <PageButton
                isDarkMode={isDarkMode}
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
