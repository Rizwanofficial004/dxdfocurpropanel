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
  padding: 32px;
  transition: all 0.3s ease;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  transition: color 0.3s ease;
  text-transform: uppercase;
`;

const InfoIcon = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  cursor: help;
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

const ResetButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
  height: 32px;
  min-width: 60px;
  text-transform: uppercase;
  margin-left: 4px;
  
  &:hover {
    background: #d97706;
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
`;

// Controls Section
const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
`;

const LeftControls = styled.div`
  flex: 1;
  max-width: 500px;
`;

const RightControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const DateLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-right: 8px;
`;

const DateInput = styled.input`
  padding: 10px 16px;
  border: 2px solid ${props => props.theme.colors.error || '#ef4444'};
  border-radius: 6px;
  font-size: 14px;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.error || '#ef4444'};
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  background: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.light};
    font-weight: 500;
    text-transform: uppercase;
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
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 2px solid ${props => props.theme.colors.error || '#ef4444'};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.5px;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.cardBackground};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:nth-child(1) { width: 30%; }
  &:nth-child(2) { width: 15%; text-align: left; }
  &:nth-child(3) { width: 15%; text-align: center; }
  &:nth-child(4) { width: 15%; text-align: center; }
  &:nth-child(5) { width: 10%; text-align: center; }
  &:nth-child(6) { width: 10%; text-align: center; }
  &:nth-child(7) { width: 10%; text-align: center; }
  &:nth-child(8) { width: 10%; text-align: center; }
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
  padding: 14px 16px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  vertical-align: middle;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: color 0.3s ease;
  
  &:nth-child(1) { width: 30%; }
  &:nth-child(2) { width: 15%; text-align: left; }
  &:nth-child(3) { width: 15%; text-align: center; }
  &:nth-child(4) { width: 15%; text-align: center; }
  &:nth-child(5) { width: 10%; text-align: center; }
  &:nth-child(6) { width: 10%; text-align: center; }
  &:nth-child(7) { width: 10%; text-align: center; }
  &:nth-child(8) { width: 10%; text-align: center; }
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
      const apiUrl = 'http://127.0.0.1:8000/api/Staff/Details/';
      
      console.log('� Fetching staff data from:', apiUrl);
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Staff API Response:', data);

      let staffArray = [];
      
      // Handle the Staff Details API response structure
      if (data?.data?.staff && Array.isArray(data.data.staff)) {
        staffArray = data.data.staff;
        console.log(`✅ Loaded ${staffArray.length} staff members`);
      }

      // Transform staff data to employee format for Quick View
      const users = staffArray.map(staff => ({
        id: staff.staffid || staff.id,
        name: staff.full_name || `${staff.firstname || ''} ${staff.lastname || ''}`.trim(),
        team: staff.job_position || 'No Organization',
        status: staff.active === '1' || staff.active === 1 || staff.active === true ? 'Active' : 'Inactive',
        designation: staff.role || 'Staff',
        email: staff.email,
        isOnline: staff.is_logged_in === '1',
        lastLogin: staff.last_login || 'Never',
        // Mock data for time tracking (replace with actual API data when available)
        loggedTime: '2h 30m',
        activeTime: '2h 27m',
        productivity: 88,
        productiveTime: '2h 17m',
        distractionTime: '0h 0m',
        neutralTime: '0h 8m',
        meetingTime: '0h 0m',
        breakTime: '0h 0m',
        idleTime: '0h 3m',
        offlineTime: '0h 0m',
        originalData: staff
      }));

      setEmployeesData(users);
      
    } catch (error) {
      console.error('❌ Error fetching staff data:', error);
      setError(`Failed to load staff data: ${error.message}`);
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

  // Send numeric value to API
  const sendNumericValueToAPI = async (userId, numericValue, username) => {
    try {
      const apiBaseUrl = getApiUrl();
      const apiUrl = `${apiBaseUrl}/auth/register/post_users/`;
      
      console.log(`📤 Sending numeric value to API for ${username}:`, {
        userId,
        numericValue,
        apiUrl
      });

      const requestData = {
        user_id: userId,
        numeric_value: numericValue
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ API Response for ${username}:`, result);
      
      if (result.status === 'success') {
        toastService.success(`✅ Numeric value ${numericValue} sent successfully for ${username}!`);
        
        // Refresh user data to reflect the update
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } else {
        throw new Error(result.message || 'Unknown API error');
      }

    } catch (error) {
      console.error(`❌ Error sending numeric value for ${username}:`, error);
      toastService.error(`❌ Failed to send numeric value for ${username}: ${error.message}`);
    }
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

    // Send numeric value to API immediately when timer starts
    await sendNumericValueToAPI(userId, timerSeconds, username);

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

  // Reset user numeric value to 0
  const handleResetUser = async (userId, username) => {
    console.log(`🔄 Resetting numeric value for ${username} to 0`);
    
    // Send 0 value to API to reset user in SQL database
    await sendNumericValueToAPI(userId, 0, username);
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
    <DashboardLayout headerTitle="Quick View" headerBreadcrumb="Home / Quick View">
      <EmployeesPageWrapper theme={theme}>
        {/* Page Header */}
        <PageHeader>
          <TitleSection>
            <PageTitle theme={theme}>Quick View</PageTitle>
            <InfoIcon>ⓘ</InfoIcon>
          </TitleSection>
          
          {/* Controls */}
          <ControlsSection>
            <LeftControls>
              <SearchInput
                theme={theme}
                type="text"
                placeholder="SEARCH"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </LeftControls>
            
            <RightControls>
              <DateLabel theme={theme}>SELECT DATE</DateLabel>
              <DateInput
                theme={theme}
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </RightControls>
          </ControlsSection>
        </PageHeader>

        {/* Table */}
        <div style={{ padding: '0 32px 32px 32px' }}>
          <TableContainer theme={theme}>
            <Table>
              <thead>
                <tr>
                  <TableHeader theme={theme}>STATUS</TableHeader>
                  <TableHeader theme={theme}>EMPLOYEE NAME ↑</TableHeader>
                  <TableHeader theme={theme}>LOGGED TIME ⓘ</TableHeader>
                  <TableHeader theme={theme}>ACTIVE TIME ⓘ</TableHeader>
                  <TableHeader theme={theme}>PRODUCTIVE</TableHeader>
                  <TableHeader theme={theme}>DISTRACTION</TableHeader>
                  <TableHeader theme={theme}>NEUTRAL</TableHeader>
                  <TableHeader theme={theme}>MEETING</TableHeader>
                  <TableHeader theme={theme}>BREAK</TableHeader>
                  <TableHeader theme={theme}>IDLE ⓘ</TableHeader>
                  <TableHeader theme={theme}>OFFLINE</TableHeader>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id} theme={theme}>
                      <TableCell theme={theme}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: employee.status === 'Active' ? '#22c55e' : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            {employee.status === 'Active' ? '✓' : '○'}
                          </div>
                          <span style={{fontWeight: 600, fontSize: '12px', textTransform: 'uppercase'}}>
                            {employee.status === 'Active' ? 'AT WORK' : 'OFF'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell theme={theme}>
                        <EmployeeInfo>
                          <EmployeeName theme={theme}>{employee.name}</EmployeeName>
                          <TeamName theme={theme}>{employee.team || employee.designation}</TeamName>
                        </EmployeeInfo>
                      </TableCell>
                      <TableCell theme={theme}>
                        <div style={{fontWeight: 600, color: '#3b82f6'}}>
                          {employee.loggedTime || '2h 30m'}
                        </div>
                      </TableCell>
                      <TableCell theme={theme}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'}}>
                          <div style={{fontWeight: 600}}>{employee.activeTime || '2h 27m'}</div>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: `3px solid ${employee.productivity >= 80 ? '#22c55e' : employee.productivity >= 50 ? '#f59e0b' : '#ef4444'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: theme.colors.text.primary
                          }}>
                            {employee.productivity || 88}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell theme={theme}>{employee.productiveTime || '2h 17m'}</TableCell>
                      <TableCell theme={theme}>{employee.distractionTime || '0h 0m'}</TableCell>
                      <TableCell theme={theme}>{employee.neutralTime || '0h 8m'}</TableCell>
                      <TableCell theme={theme}>{employee.meetingTime || '0h 0m'}</TableCell>
                      <TableCell theme={theme}>{employee.breakTime || '0h 0m'}</TableCell>
                      <TableCell theme={theme}>{employee.idleTime || '0h 3m'}</TableCell>
                      <TableCell theme={theme}>{employee.offlineTime || '0h 0m'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow theme={theme}>
                    <TableCell theme={theme} colSpan="11" style={{textAlign: 'center', padding: '40px'}}>
                      {loading ? '🔄 Loading users...' : 'No users found.'}
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </div>

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
