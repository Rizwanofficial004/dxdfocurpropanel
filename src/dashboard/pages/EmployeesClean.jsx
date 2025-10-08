import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

const EmployeesClean = () => {
  const { isDarkMode } = useTheme();
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/Staff/Details/');
      const data = await response.json();
      
      console.log('📊 API Response:', data);
      
      let staffArray = [];
      
      // Handle nested structure
      if (data && data.data && Array.isArray(data.data.staff)) {
        staffArray = data.data.staff;
        console.log('✅ Found staff array in data.data.staff');
      } else if (Array.isArray(data)) {
        staffArray = data;
      } else if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        staffArray = parsed.data?.staff || parsed.staff || parsed;
      }

      console.log(`📋 Loaded ${staffArray.length} employees`);

      // Transform staff data to employee format
      const employees = staffArray.map(staff => ({
        id: staff.staffid || staff.id,
        name: staff.full_name || `${staff.firstname || ''} ${staff.lastname || ''}`.trim(),
        email: staff.email,
        team: staff.job_position || 'N/A',
        status: staff.active === '1' || staff.active === 1 || staff.active === true ? 'Active' : 'Inactive',
        designation: staff.role || 'Staff',
        screensToday: 0, // This would come from another API
        lastLogin: staff.last_login || 'Never',
        captureScreenshots: true,
        dashboardAccess: staff.admin === '1' || staff.role === '5' ? 'Admin' : 'Employee',
        avatar: staff.profile_image ? 
          `https://crm.deluxebilisim.com/uploads/staff_profile_images/${staff.staffid}/thumb_${staff.profile_image}` :
          `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.full_name || 'User')}&background=random`,
        raw_data: staff
      }));

      setEmployeesData(employees);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      setLoading(false);
    }
  };

  // Filter employees
  const filteredEmployees = employeesData.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  return (
    <DashboardLayout headerTitle="Employees" headerBreadcrumb="Home / HR / Employees">
      <PageWrapper isDarkMode={isDarkMode}>
        {/* Header Section */}
        <PageHeader>
          <PageTitle isDarkMode={isDarkMode}>EMPLOYEES</PageTitle>
          <NewEmployeeButton isDarkMode={isDarkMode}>
            <span style={{ marginRight: '8px' }}>+</span>
            NEW EMPLOYEE
          </NewEmployeeButton>
        </PageHeader>

        {/* Success Message (if needed) */}
        <SuccessMessage isDarkMode={isDarkMode}>
          Your user profile has been successfully created.
          <br />
          You can now download the client app from{' '}
          <a href="https://focusro.com/download" target="_blank" rel="noopener noreferrer">
            https://focusro.com/download
          </a>{' '}
          and log in with your password to explore the features.
        </SuccessMessage>

        {/* Search and Filter Section */}
        <SearchFilterSection>
          <SearchInput
            isDarkMode={isDarkMode}
            type="text"
            placeholder="SEARCH"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <StatusFilterDropdown
            isDarkMode={isDarkMode}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </StatusFilterDropdown>
          <CloseButton isDarkMode={isDarkMode}>×</CloseButton>
        </SearchFilterSection>

        {/* Table */}
        <TableWrapper isDarkMode={isDarkMode}>
          {loading ? (
            <LoadingMessage isDarkMode={isDarkMode}>Loading employees...</LoadingMessage>
          ) : (
            <StyledTable isDarkMode={isDarkMode}>
              <thead>
                <tr>
                  <TableHeader isDarkMode={isDarkMode}>NAME ↑</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>STATUS</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>DESIGNATION</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>SCREENS TODAY</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>LAST LOGIN ⓘ</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>CAPTURE SCREENSHOTS ⓘ</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>EMPLOYEE DASHBOARD ACCESS ⓘ</TableHeader>
                  <TableHeader isDarkMode={isDarkMode}>ACTIONS</TableHeader>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length === 0 ? (
                  <tr>
                    <TableCell isDarkMode={isDarkMode} colSpan="8" style={{ textAlign: 'center' }}>
                      No employees found
                    </TableCell>
                  </tr>
                ) : (
                  currentEmployees.map((employee) => (
                    <TableRow key={employee.id} isDarkMode={isDarkMode}>
                      <TableCell isDarkMode={isDarkMode}>
                        <EmployeeNameCell>
                          <Avatar
                            src={employee.avatar}
                            alt={employee.name}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=random`;
                            }}
                          />
                          <EmployeeInfo>
                            <EmployeeName isDarkMode={isDarkMode}>
                              {employee.name}
                              {employee.email === 'dddx@example.com' && <YouTag> (You)</YouTag>}
                            </EmployeeName>
                            <TeamName isDarkMode={isDarkMode}>Team {employee.team}</TeamName>
                          </EmployeeInfo>
                        </EmployeeNameCell>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        <StatusBadge status={employee.status} isDarkMode={isDarkMode}>
                          {employee.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        {employee.designation}
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        {employee.screensToday}
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        {employee.lastLogin}
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        <ToggleSwitch enabled={employee.captureScreenshots} isDarkMode={isDarkMode}>
                          <ToggleSlider enabled={employee.captureScreenshots} />
                        </ToggleSwitch>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        <AccessBadge access={employee.dashboardAccess} isDarkMode={isDarkMode}>
                          {employee.dashboardAccess}
                        </AccessBadge>
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>
                        <ViewReportButton isDarkMode={isDarkMode}>
                          📊 VIEW REPORT
                        </ViewReportButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </tbody>
            </StyledTable>
          )}
        </TableWrapper>

        {/* Pagination */}
        <PaginationSection isDarkMode={isDarkMode}>
          <PerPageSelector isDarkMode={isDarkMode}>
            Employees per page:{' '}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                background: isDarkMode ? '#2d3748' : '#f8fafc',
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                border: isDarkMode ? '1px solid #4a5568' : '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </PerPageSelector>
          <PageInfo isDarkMode={isDarkMode}>
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length}
          </PageInfo>
          <PaginationButtons>
            <PageButton
              isDarkMode={isDarkMode}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              ‹
            </PageButton>
            <PageButton
              isDarkMode={isDarkMode}
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            >
              ›
            </PageButton>
          </PaginationButtons>
        </PaginationSection>
      </PageWrapper>
    </DashboardLayout>
  );
};

// Styled Components
const PageWrapper = styled.div`
  padding: 24px;
  background: ${props => props.isDarkMode ? '#0f172a' : '#f8fafc'};
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
  margin: 0;
`;

const NewEmployeeButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const SuccessMessage = styled.div`
  background: ${props => props.isDarkMode ? '#1e3a5f' : '#dbeafe'};
  color: ${props => props.isDarkMode ? '#93c5fd' : '#1e40af'};
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  
  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SearchFilterSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
  border: 1px solid ${props => props.isDarkMode ? '#334155' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 14px;
  
  &::placeholder {
    color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};
  }
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const StatusFilterDropdown = styled.select`
  padding: 10px 16px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
  border: 1px solid ${props => props.isDarkMode ? '#334155' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#64748b' : '#94a3b8'};
  border: 1px solid ${props => props.isDarkMode ? '#334155' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#334155' : '#f1f5f9'};
  }
`;

const TableWrapper = styled.div`
  background: ${props => props.isDarkMode ? '#1e293b' : '#ffffff'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 16px;
  background: ${props => props.isDarkMode ? '#0f172a' : '#f8fafc'};
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#334155' : '#e2e8f0'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.isDarkMode ? '#334155' : '#e2e8f0'};
  
  &:hover {
    background: ${props => props.isDarkMode ? '#334155' : '#f8fafc'};
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
  font-size: 14px;
`;

const EmployeeNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.theme?.isDarkMode ? '#334155' : '#e2e8f0'};
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
`;

const YouTag = styled.span`
  color: #3b82f6;
  font-weight: 600;
`;

const TeamName = styled.div`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 'Active' ? '#22c55e' : '#64748b'};
  color: white;
`;

const ToggleSwitch = styled.div`
  width: 44px;
  height: 24px;
  background: ${props => props.enabled ? '#3b82f6' : '#64748b'};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
`;

const ToggleSlider = styled.div`
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: ${props => props.enabled ? '22px' : '2px'};
  transition: left 0.2s ease;
`;

const AccessBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.access === 'Admin' ? '#8b5cf6' : '#06b6d4'};
  color: white;
`;

const ViewReportButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #3b82f6;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
  }
`;

const PaginationSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 0;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 14px;
`;

const PerPageSelector = styled.div`
  display: flex;
  align-items: center;
`;

const PageInfo = styled.div`
  font-weight: 500;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  width: 32px;
  height: 32px;
  background: ${props => props.isDarkMode ? '#1e293b' : '#ffffff'};
  color: ${props => props.isDarkMode ? '#e2e8f0' : '#1e293b'};
  border: 1px solid ${props => props.isDarkMode ? '#334155' : '#cbd5e1'};
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:not(:disabled):hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  font-size: 16px;
`;

export default EmployeesClean;
