import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import toastService from '../../services/toastService';

// Main Page Wrapper
const EmployeesPageWrapper = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

// Notification Banner
const NotificationBanner = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 16px 32px;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 14px;
  transition: all 0.3s ease;
  
  a {
    color: ${props => props.theme.colors.primary};
  }
`;

// Header Section
const PageHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 24px 32px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  transition: color 0.3s ease;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary}CC;
    transform: translateY(-1px);
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.darkMode ? '#059669' : '#10b981'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.darkMode ? '#047857' : '#059669'};
  }
  
  &:disabled {
    background: ${props => props.darkMode ? '#4b5563' : '#6b7280'};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.darkMode ? '#7f1d1d' : '#fef2f2'};
  color: ${props => props.darkMode ? '#fca5a5' : '#dc2626'};
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.darkMode ? '#ef4444' : '#dc2626'};
  transition: all 0.3s ease;
`;

const LoadingMessage = styled.div`
  background: ${props => props.darkMode ? '#1e3a8a' : '#f0f9ff'};
  color: ${props => props.darkMode ? '#93c5fd' : '#0369a1'};
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.darkMode ? '#3b82f6' : '#0369a1'};
  transition: all 0.3s ease;
`;

const TimerInput = styled.input`
  width: 50px;
  height: 32px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  font-weight: bold;
  line-height: 1;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
  }
`;

const StartButton = styled.button`
  background: ${props => props.running ? '#dc2626' : '#10b981'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: ${props => props.running ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  height: 32px;
  min-width: 70px;
  text-transform: uppercase;
  
  &:hover {
    background: ${props => props.running ? '#dc2626' : '#059669'};
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
`;

// Controls Section
const ControlsSection = styled.div`
  background: #ffffff;
  padding: 16px 32px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const StatusDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

// Table Styles
const TableContainer = styled.div`
  background: #ffffff;
  margin: 0 32px 32px 32px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const Table = styled.table`
  width: 70%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  text-transform: uppercase;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:nth-child(1) { width: 40%; }
  &:nth-child(2) { width: 20%; text-align: center; }
  &:nth-child(3) { width: 20%; text-align: center; }
  &:nth-child(4) { width: 20%; text-align: center; }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: ${props => props.darkMode ? '#f9fafb' : '#1f2937'};
  font-size: 14px;
  vertical-align: middle;
  transition: color 0.3s ease;
  
  &:nth-child(1) { width: 40%; }
  &:nth-child(2) { width: 20%; text-align: center; }
  &:nth-child(3) { width: 20%; text-align: center; }
  &:nth-child(4) { width: 20%; text-align: center; }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: ${props => props.darkMode ? '#60a5fa' : '#3b82f6'};
  margin-bottom: 2px;
  transition: color 0.3s ease;
`;

const TeamName = styled.div`
  font-size: 12px;
  color: ${props => props.darkMode ? '#9ca3af' : '#6b7280'};
  transition: color 0.3s ease;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.darkMode ? '#065f46' : '#dcfce7'};
  color: ${props => props.darkMode ? '#10b981' : '#166534'};
  transition: all 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.darkMode ? '#2563eb' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.darkMode ? '#1d4ed8' : '#2563eb'};
  }
`;

const BlueCircle = styled.div`
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  margin: 0 auto;
`;

// Pagination
const PaginationContainer = styled.div`
  background: #ffffff;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #e5e7eb;
  margin: 0 32px;
  border-radius: 0 0 8px 8px;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ItemsPerPageSelector = styled.select`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: ${props => props.active ? '#3b82f6' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#374151'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuickView = () => {
  const { t } = useLanguage();
  const { isDarkMode, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Dynamic employee data from API
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Timer management
  const [timerValues, setTimerValues] = useState({});
  const [runningTimers, setRunningTimers] = useState({});

  // API configuration
  // API Configuration
  const getApiUrl = () => {
    // In development, use Vite proxy
    if (import.meta.env.DEV) {
      return '/api';
    }
    // In production, use full URL
    return 'https://dxdtime.ddsolutions.io/api';
  };

  // Fetch users from external API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = getApiUrl();
      const apiUrl = `${apiBaseUrl}/auth/register/users/`;
      console.log('🔄 Fetching users from API...');
      console.log('📡 API URL:', apiUrl);
      console.log('🌐 Environment:', import.meta.env.DEV ? 'Development (using proxy)' : 'Production (direct)');
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Fetch user data from external API with timeout
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 External API Response:', data);

      // Transform backend data to employee format
      let users = [];
      let userArray = null;
      
      // Handle different API response structures
      if (data.status === 'success') {
        if (data.data && data.data.users && Array.isArray(data.data.users)) {
          // Correct API structure: data.data.users is the array of users
          userArray = data.data.users;
          console.log('✅ Using correct API structure (data.data.users as array)');
        } else if (data.data && Array.isArray(data.data)) {
          // Alternative structure: data.data is directly an array of users
          userArray = data.data;
          console.log('✅ Using alternative API structure (data.data as array)');
        } else if (data.users && Array.isArray(data.users)) {
          // Alternative structure: data.users
          userArray = data.users;
          console.log('✅ Using alternative API structure (data.users)');
        }
      }
      
      if (userArray && userArray.length > 0) {
        users = userArray.map(user => ({
          id: user.user_id,
          name: user.full_name || user.username || user.email,
          team: user.profile?.organization_name || 'No Organization',
          status: user.is_active ? 'Active' : 'Inactive',
          designation: user.profile?.job_title || 'Employee',
          screensToday: user.profile?.numeric_value || 0, // Using numeric_value as a substitute
          lastLogin: user.last_login ? 
            new Date(user.last_login).toLocaleDateString() : 'Never',
          captureScreenshots: true,
          dashboardAccess: user.is_staff ? 'Admin' : 'User',
          isOnline: user.is_active,
          email: user.email,
          originalName: user.username,
          totalSize: 0, // This API doesn't provide size info
          activeDays: 0, // This API doesn't provide active days
          dateJoined: new Date(user.date_joined).toLocaleDateString(),
          country: user.profile?.country || 'Unknown',
          phoneNumber: user.profile?.phone_number || 'Not provided',
          profileCompletion: user.profile?.completion_percentage || 0
        }));
        
        console.log(`✅ Processed ${users.length} users from external API:`, users.map(u => u.name));
      } else {
        console.warn('❌ No users found in API response or invalid data structure');
        console.log('📊 Full API Response:', data);
        console.log('📋 API Response keys:', Object.keys(data));
        if (data.data) {
          console.log('📋 data.data type:', typeof data.data);
          console.log('📋 data.data is array:', Array.isArray(data.data));
          if (Array.isArray(data.data)) {
            console.log('📋 data.data length:', data.data.length);
            if (data.data.length > 0) {
              console.log('📋 First item in data.data:', data.data[0]);
            }
          } else {
            console.log('📋 data.data keys:', Object.keys(data.data));
          }
        }
        // Set empty array as fallback
        users = [];
      }

      console.log(`🎯 Setting employeesData with ${users.length} users`);
      setEmployeesData(users);
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timeout - API took too long to respond (>10s)');
      } else {
        setError(`Failed to connect to external API: ${error.message}`);
      }
      
      // Fallback to empty array if backend fails
      setEmployeesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Refresh data manually
  const handleRefresh = () => {
    fetchUsers();
  };

  // Timer functions
  const handleTimerValueChange = (userId, value) => {
    setTimerValues(prev => ({
      ...prev,
      [userId]: parseInt(value) || 0
    }));
  };

  const handleStartTimer = (userId, username) => {
    const timerSeconds = timerValues[userId] || 5; // Default 5 seconds
    
    console.log(`🚀 Starting timer for ${username}: ${timerSeconds} seconds`);
    
    // Mark timer as running
    setRunningTimers(prev => ({
      ...prev,
      [userId]: true
    }));

    // Simulate timer countdown
    setTimeout(() => {
      setRunningTimers(prev => ({
        ...prev,
        [userId]: false
      }));
      console.log(`⏰ Timer completed for ${username}!`);
      toastService.success(`⏰ Timer completed for ${username}! (${timerSeconds} seconds)`);
    }, timerSeconds * 1000);
  };

  // Filter employees based on search query and status
  const filteredEmployees = employeesData.filter(employee =>
    (employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     employee.designation.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'All' || employee.status === statusFilter)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  return (
    <DashboardLayout headerTitle="Employee Management" headerBreadcrumb="Home / HR / Employees">
      <EmployeesPageWrapper>
        {/* Notification Banner */}
        <NotificationBanner>
          Your user profile has been successfully created.<br />
          You can now download the client app from <a href="https://focusro.com/download">https://focusro.com/download</a> and log in with your password to explore the features.
        </NotificationBanner>

        {/* Page Header */}
        <PageHeader>
          <div>
            <PageTitle>EMPLOYEES</PageTitle>
            {loading && (
              <LoadingMessage>
                🔄 Loading users from API...
              </LoadingMessage>
            )}
            {error && (
              <ErrorMessage>
                ⚠️ {error} - Showing fallback data
              </ErrorMessage>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <RefreshButton onClick={handleRefresh} disabled={loading}>
              {loading ? '🔄' : '↻'} Refresh ({employeesData.length} users)
            </RefreshButton>
            <AddButton>
              <span>+</span>
              NEW EMPLOYEE
            </AddButton>
          </div>
        </PageHeader>

        {/* Table */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>NAME ↑</TableHeader>
                <TableHeader>STATUS</TableHeader>
                <TableHeader>SET TIMER</TableHeader>
                <TableHeader>BUTTON</TableHeader>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <EmployeeInfo>
                        <EmployeeName>{employee.name}</EmployeeName>
                        <TeamName>User ID: {employee.id}</TeamName>
                      </EmployeeInfo>
                    </TableCell>
                    <TableCell>
                      <StatusBadge>{employee.status}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}>
                        <TimerInput
                          type="number"
                          min="1"
                          max="3600"
                          placeholder="5"
                          value={timerValues[employee.id] || ''}
                          onChange={(e) => handleTimerValueChange(employee.id, e.target.value)}
                          disabled={runningTimers[employee.id]}
                        />
                        <span style={{fontSize: '12px', fontWeight: '500'}}>sec</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StartButton
                        running={runningTimers[employee.id]}
                        disabled={runningTimers[employee.id]}
                        onClick={() => handleStartTimer(employee.id, employee.name)}
                      >
                        {runningTimers[employee.id] ? 'RUNNING...' : 'START'}
                      </StartButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" style={{textAlign: 'center', padding: '40px'}}>
                    {loading ? '🔄 Loading users...' : 'No users found. Register a new user to see them here.'}
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <PaginationContainer>
          <PaginationInfo>
            <span>Users per page:</span>
            <ItemsPerPageSelector
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </ItemsPerPageSelector>
            <span>
              {filteredEmployees.length > 0 
                ? `${startIndex + 1} – ${Math.min(endIndex, filteredEmployees.length)} of ${filteredEmployees.length}`
                : '0 – 0 of 0'
              }
            </span>
          </PaginationInfo>
          
          <PaginationButtons>
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ←
            </PaginationButton>
            
            <PaginationButton active="true">
              1
            </PaginationButton>
            
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              →
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      </EmployeesPageWrapper>
    </DashboardLayout>
  );
};

export default QuickView;
