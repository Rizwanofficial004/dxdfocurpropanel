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
  background: ${props => props.theme.colors.success};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.success + 'DD'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.muted};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  color: ${props => props.theme.colors.error};
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.theme.colors.error};
  transition: all 0.3s ease;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.theme.colors.primary};
  transition: all 0.3s ease;
  font-weight: 500;
`;

const TimerInput = styled.input`
  width: 60px;
  height: 38px;
  padding: 8px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  line-height: 1;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text.light};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.light};
    font-weight: 400;
  }
`;

const StartButton = styled.button`
  background: ${props => props.running 
    ? props.theme.colors.error 
    : props.theme.colors.success};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: ${props => props.running || props.disabled ? 'not-allowed' : 'pointer'};
  height: 38px;
  min-width: 90px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover:not(:disabled) {
    background: ${props => props.running 
      ? props.theme.colors.error + 'DD' 
      : props.theme.colors.success + 'DD'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.muted};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary}40;
    outline-offset: 2px;
  }
`;

// Controls Section
const ControlsSection = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 16px 32px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  width: 300px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.light};
  }
`;

const StatusDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Table Styles
const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  margin: 0 32px 32px 32px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 30px;
  z-index: 99999;
`;

const Table = styled.table`
  width: 100%;
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
  color: ${props => props.theme.colors.text.primary};
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
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2px;
  transition: color 0.3s ease;
`;

const TeamName = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  transition: color 0.3s ease;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.theme.colors.success}20;
  color: ${props => props.theme.colors.success};
  transition: all 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary}CC;
    transform: translateY(-1px);
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
  background: ${props => props.theme.colors.surface};
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme.colors.border};
  margin: 0 32px;
  border-radius: 0 0 8px 8px;
  transition: all 0.3s ease;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ItemsPerPageSelector = styled.select`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? '#ffffff' : props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? props.theme.colors.primary + 'CC' 
      : props.theme.colors.hover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary}40;
    outline-offset: 2px;
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
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Log API request details
      const requestConfig = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      };
      
      console.log('📡 API Request Details:');
      console.log('🌐 API URL:', apiUrl);
      console.log('🔧 Request Method:', requestConfig.method);
      console.log('📋 Request Headers:', JSON.stringify(requestConfig.headers, null, 2));
      console.log('📦 Request Body:', requestConfig.method === 'GET' ? 'No body (GET request)' : 'N/A');
      console.log('🌍 Environment:', import.meta.env.DEV ? 'Development (using proxy)' : 'Production (direct)');
      
      // Fetch user data from external API with timeout
      const response = await fetch(apiUrl, requestConfig);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform backend data to employee format
      let users = [];
      let userArray = null;
      
      // Handle different API response structures
      if (data.status === 'success') {
        if (data.data && data.data.users && Array.isArray(data.data.users)) {
          // Correct API structure: data.data.users is the array of users
          userArray = data.data.users;
        } else if (data.data && Array.isArray(data.data)) {
          // Alternative structure: data.data is directly an array of users
          userArray = data.data;
        } else if (data.users && Array.isArray(data.users)) {
          // Alternative structure: data.users
          userArray = data.users;
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
        
      } else {
        // Set empty array as fallback
        users = [];
      }

      setEmployeesData(users);
      
    } catch (error) {
      
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

  // API Testing Functions
  const testPostAPI = async (userId, userData) => {
    const apiBaseUrl = getApiUrl();
    const apiUrl = `${apiBaseUrl}/auth/users/${userId}/update/`;
    
    const postRequestBody = {
      user_id: userId,
      action: 'update_profile',
      data: userData,
      timestamp: new Date().toISOString(),
      source: 'dashboard_quickview'
    };
    
    const postRequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
      },
      body: JSON.stringify(postRequestBody)
    };
    
    console.log('🔵 POST API Test - Request Details:');
    console.log('🌐 API URL:', apiUrl);
    console.log('🔧 Request Method:', postRequestConfig.method);
    console.log('📋 Request Headers:', JSON.stringify(postRequestConfig.headers, null, 2));
    console.log('📦 Request Body:', JSON.stringify(postRequestBody, null, 2));
    
    try {
      const response = await fetch(apiUrl, postRequestConfig);
      const result = await response.json();
      console.log('✅ POST API Response:', result);
      return result;
    } catch (error) {
      console.error('❌ POST API Error:', error);
      return { error: error.message };
    }
  };
  
  const testPutAPI = async (userId, userData) => {
    const apiBaseUrl = getApiUrl();
    const apiUrl = `${apiBaseUrl}/auth/users/${userId}/`;
    
    const putRequestBody = {
      user_id: userId,
      full_name: userData.name,
      email: userData.email,
      profile: {
        job_title: userData.designation,
        organization_name: userData.team,
        updated_at: new Date().toISOString()
      },
      is_active: userData.status === 'Active',
      updated_by: 'dashboard_admin'
    };
    
    const putRequestConfig = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
      },
      body: JSON.stringify(putRequestBody)
    };
    
    console.log('🟣 PUT API Test - Request Details:');
    console.log('🌐 API URL:', apiUrl);
    console.log('🔧 Request Method:', putRequestConfig.method);
    console.log('📋 Request Headers:', JSON.stringify(putRequestConfig.headers, null, 2));
    console.log('📦 Request Body:', JSON.stringify(putRequestBody, null, 2));
    
    try {
      const response = await fetch(apiUrl, putRequestConfig);
      const result = await response.json();
      console.log('✅ PUT API Response:', result);
      return result;
    } catch (error) {
      console.error('❌ PUT API Error:', error);
      return { error: error.message };
    }
  };

  const testTimerAPI = async (userId, username, action, timerData) => {
    const apiBaseUrl = getApiUrl();
    const apiUrl = `${apiBaseUrl}/timer/sessions/`;
    
    const timerRequestBody = {
      user_id: userId,
      username: username,
      action: action, // 'start', 'stop', 'pause'
      timer_duration: timerData.duration,
      session_data: {
        start_time: timerData.startTime,
        expected_duration: timerData.duration,
        browser_info: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      metadata: {
        source: 'quickview_dashboard',
        timestamp: new Date().toISOString(),
        session_id: timerData.sessionId
      }
    };
    
    const timerRequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`,
        'X-Session-ID': timerData.sessionId
      },
      body: JSON.stringify(timerRequestBody)
    };
    
    console.log('⏱️ TIMER API Test - Request Details:');
    console.log('🌐 API URL:', apiUrl);
    console.log('🔧 Request Method:', timerRequestConfig.method);
    console.log('📋 Request Headers:', JSON.stringify(timerRequestConfig.headers, null, 2));
    console.log('📦 Request Body:', JSON.stringify(timerRequestBody, null, 2));
    
    try {
      const response = await fetch(apiUrl, timerRequestConfig);
      const result = await response.json();
      console.log('✅ TIMER API Response:', result);
      return result;
    } catch (error) {
      console.error('❌ TIMER API Error:', error);
      return { error: error.message };
    }
  };

  // Timer functions
  const handleTimerValueChange = (userId, value) => {
    setTimerValues(prev => ({
      ...prev,
      [userId]: parseInt(value) || 0
    }));
  };

  const handleStartTimer = async (userId, username) => {
    const timerSeconds = timerValues[userId] || 5; // Default 5 seconds
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Test Timer API with POST request
    const timerData = {
      duration: timerSeconds,
      startTime: new Date().toISOString(),
      sessionId: sessionId
    };
    
    // Call the Timer API test
    await testTimerAPI(userId, username, 'start', timerData);
    
    // Mark timer as running
    setRunningTimers(prev => ({
      ...prev,
      [userId]: true
    }));

    // Simulate timer countdown
    setTimeout(async () => {
      // Test Timer API completion
      const completeTimerData = {
        ...timerData,
        endTime: new Date().toISOString(),
        actualDuration: timerSeconds
      };
      
      await testTimerAPI(userId, username, 'complete', completeTimerData);
      
      setRunningTimers(prev => ({
        ...prev,
        [userId]: false
      }));
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
                        {runningTimers[employee.id] ? 'Loading...' : 'Apply'}
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
