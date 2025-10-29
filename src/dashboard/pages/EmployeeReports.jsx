import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import styled from 'styled-components';
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
  EmptyStateCell,
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

// Loader Component
const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const Loader = styled.span`
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  color: #fff;
  
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: inherit;
    height: inherit;
    border-radius: 50%;
    transform: rotateX(70deg);
    animation: 1s spin linear infinite;
  }
  
  &:after {
    color: green;
    transform: rotateY(70deg);
    animation-delay: .4s;
  }

  @keyframes rotate {
    0% {
      transform: translate(-50%, -50%) rotateZ(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotateZ(360deg);
    }
  }

  @keyframes rotateccw {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(-360deg);
    }
  }

  @keyframes spin {
    0%,
    100% {
      box-shadow: .2em 0px 0 0px currentcolor;
    }
    12% {
      box-shadow: .2em .2em 0 0 currentcolor;
    }
    25% {
      box-shadow: 0 .2em 0 0px currentcolor;
    }
    37% {
      box-shadow: -.2em .2em 0 0 currentcolor;
    }
    50% {
      box-shadow: -.2em 0 0 0 currentcolor;
    }
    62% {
      box-shadow: -.2em -.2em 0 0 currentcolor;
    }
    75% {
      box-shadow: 0px -.2em 0 0 currentcolor;
    }
    87% {
      box-shadow: .2em -.2em 0 0 currentcolor;
    }
  }
`;

const EmployeeReports = () => {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [editingInterval, setEditingInterval] = useState(null);
  const [intervalValue, setIntervalValue] = useState('');
  const [updating, setUpdating] = useState(false);

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
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Handlers (non-functional for now)
  const handleNewEmployee = () => {
    console.log('Add new employee');
  };

  const handleViewReport = (employeeId) => {
    console.log('View report for employee:', employeeId);
  };

  const handleEditInterval = (employee) => {
    setEditingInterval(employee.staff_id);
    setIntervalValue(employee.screenshot_interval || 0);
  };

  const handleCancelEdit = () => {
    setEditingInterval(null);
    setIntervalValue('');
  };

  const handleSaveInterval = async (employee) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/update-staff/${employee.staff_id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshot_interval: parseInt(intervalValue, 10)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.staff_id === employee.staff_id
            ? { ...emp, screenshot_interval: parseInt(intervalValue, 10) }
            : emp
        )
      );

      setEditingInterval(null);
      setIntervalValue('');
      console.log('✅ Screenshot interval updated successfully');
    } catch (error) {
      console.error('Error updating screenshot interval:', error);
      alert('Failed to update screenshot interval. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearFilter = () => {
    setFilterStatus('Active');
  };

  return (
    <DashboardLayout headerTitle={t('employees')} headerBreadcrumb={`${t('dashboard')} / ${t('employees')}`}>
      <Container isDarkMode={isDarkMode}>
        <Header isDarkMode={isDarkMode}>
          <Title isDarkMode={isDarkMode}>{t('employees').toUpperCase()}</Title>
          {/* <NewEmployeeButton isDarkMode={isDarkMode} onClick={handleNewEmployee}>
            {t('newEmployee')}
          </NewEmployeeButton> */}

        </Header>

        <ContentWrapper isDarkMode={isDarkMode}>
          {/* Search Section */}
          <SearchSection>
            <SearchLabel isDarkMode={isDarkMode}>{t('search').toUpperCase()}</SearchLabel>
            <SearchInput
              isDarkMode={isDarkMode}
              type="text"
              placeholder={t('searchEmployeeName')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchSection>

          {/* Table */}
          <TableWrapper>
            <Table>
              <TableHead isDarkMode={isDarkMode}>
                <TableRow>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '160px' }}>{t('name')} ⬆</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '80px' }}>{t('status').toUpperCase()}</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '110px' }}>{t('designation').toUpperCase()}</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '180px', textAlign: 'center' }}>{t('screenshotInterval').toUpperCase()}</TableHeader>
                  <TableHeader isDarkMode={isDarkMode} style={{ width: '110px' }}>{t('lastLogin').toUpperCase()} ⓘ</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <EmptyStateCell isDarkMode={isDarkMode} colSpan={5}>
                      <LoaderWrapper>
                        <Loader className="loader"></Loader>
                      </LoaderWrapper>
                    </EmptyStateCell>
                  </TableRow>
                ) : currentEmployees.length === 0 ? (
                  <TableRow>
                    <EmptyStateCell isDarkMode={isDarkMode} colSpan={5}>
                      {t('noEmployeesFound')}
                    </EmptyStateCell>
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
                                color: isDarkMode ? 'white' : '#0f172a',
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
                          <StatusBadge isDarkMode={isDarkMode} $status="active">{t('active')}</StatusBadge>
                        </TableCell>
                      <TableCell isDarkMode={isDarkMode}>{getJobPosition(employee.job_position)}</TableCell>
                      <TableCell isDarkMode={isDarkMode} style={{ textAlign: 'center' }}>
                        {editingInterval === employee.staff_id ? (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              value={intervalValue}
                              onChange={(e) => setIntervalValue(e.target.value)}
                              style={{
                                width: '70px',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
                                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'white',
                                color: isDarkMode ? '#e0e0e0' : '#0f172a',
                                fontSize: '13px',
                                fontWeight: '600',
                                outline: 'none',
                                textAlign: 'center'
                              }}
                              disabled={updating}
                              autoFocus
                            />
                            <span style={{ fontSize: '12px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                              {t('mins')}
                            </span>
                            <button
                              onClick={() => handleSaveInterval(employee)}
                              disabled={updating}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#10b981',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: updating ? 'not-allowed' : 'pointer',
                                opacity: updating ? 0.6 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              {updating ? '...' : '✓'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: updating ? 'not-allowed' : 'pointer',
                                opacity: updating ? 0.6 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleEditInterval(employee)}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '8px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                              border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                              fontSize: '13px',
                              fontWeight: '600',
                              color: isDarkMode ? '#60a5fa' : '#2563eb',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title={t('edit')}
                          >
                            <span>⏱️</span>
                            <span>{employee.screenshot_interval || 0} {t('mins')}</span>
                            <span style={{ fontSize: '11px', opacity: 0.7 }}>✏️</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell isDarkMode={isDarkMode}>{formatDate(employee.updated_at)}</TableCell>
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
                {t('employeesPerPage')}
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
              {filteredEmployees.length > 0 ? (
                <>
                  {startIndex + 1} – {Math.min(endIndex, filteredEmployees.length)} {t('of')} {filteredEmployees.length}
                  <span style={{ 
                    marginLeft: '12px', 
                    padding: '4px 12px',
                    borderRadius: '4px',
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                    border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: isDarkMode ? '#60a5fa' : '#2563eb'
                  }}>
                    Page {currentPage} of {totalPages}
                  </span>
                </>
              ) : (
                '0 – 0 of 0'
              )}
            </PaginationInfo>
            
            <PaginationControls>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || filteredEmployees.length === 0}
                title="First Page"
              >
                ⟨⟨
              </PageButton>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || filteredEmployees.length === 0}
                title="Previous Page"
              >
                ⟨
              </PageButton>
              
              {/* Page Number Input */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                margin: '0 8px'

              }}>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  onBlur={(e) => {
                    const page = parseInt(e.target.value);
                    if (isNaN(page) || page < 1) {
                      setCurrentPage(1);
                    } else if (page > totalPages) {
                      setCurrentPage(totalPages);
                    }
                  }}
                  disabled={filteredEmployees.length === 0}
                  style={{
                    width: '50px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'white',
                    color: isDarkMode ? '#e0e0e0' : '#0f172a',
                    fontSize: '13px',
                    fontWeight: '600',
                    textAlign: 'center',
                    overflow: 'hidden',
                    outline: 'none'
                  }}
                />
             
              </div>
              
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredEmployees.length === 0}
                title="Next Page"
              >
                ⟩
              </PageButton>
              <PageButton
                isDarkMode={isDarkMode}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || filteredEmployees.length === 0}
                title="Last Page"
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
