import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import Tooltip from '../../components/common/Tooltip';

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
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
  width: 100%;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
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
const TableWrapper = styled.div`
  padding: 0 32px 32px 32px;
`;

const TableContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead {
  border-bottom: 1px solid ${props => props.theme.colors.border} !important;
  }
`;

const TableHeader = styled.th`
  padding: 16px 20px;
  text-align: ${props => props.align || 'left'};
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.8px;
  color: ${props => props.theme.colors.text.secondary};
  background: ${props => props.theme.colors.cardBackground};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  text-transform: uppercase;
  transition: all 0.3s ease;
  white-space: nowrap;
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
  padding: 20px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 13px;
  vertical-align: middle;
  text-align: ${props => props.align || 'left'};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: color 0.3s ease;
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
  transition: color 0.3s ease;
`;

const TeamName = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  transition: color 0.3s ease;
  font-weight: 500;
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

// New styled-components for clean table cell content
const StatusColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.active ? '#10b981' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatusText = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  text-transform: uppercase;
`;

const StaffIdColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const StaffIdText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#10b981' : '#6b7280'};
  flex-shrink: 0;
`;

const StatusLabel = styled.span`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const TimeColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimeText = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
`;

const NoDataText = styled.span`
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
`;

const ActiveTimeColumn = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const ProductivityColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductivityCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${props => {
    // In dark mode, use white/light borders
    // In light mode, use dark borders
    const isDarkMode = props.theme.mode === '#fff';
    
    if (isDarkMode) {
      // Dark mode - white/light borders
      if (props.value >= 80) return '#d1fae5';  // Light green
      if (props.value >= 50) return '#fef3c7';  // Light yellow
      if (props.value > 0) return '#fee2e2';    // Light red
      return '#e5e7eb';  // Light gray
    } else {
      // Light mode - dark borders (original colors)
      if (props.value >= 80) return '#10b981';  // Green
      if (props.value >= 50) return '#f59e0b';  // Yellow
      if (props.value > 0) return '#ef4444';    // Red
      return '#374151';  // Dark gray
    }
  }} !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface};
`;

const EmptyStateCell = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
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
      // Use proxy to production API
      const apiEndpoints = [
        '/api/Staff/Details/'
      ];
      
      let response;
      let apiUrl;
      
      for (const endpoint of apiEndpoints) {
        try {
          apiUrl = endpoint;
          console.log('🔍 Trying Staff API endpoint:', apiUrl);
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('✅ Successfully connected to:', apiUrl);
            break;
          }
        } catch (err) {
          console.log(`❌ Failed to connect to ${endpoint}:`, err.message);
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`All Staff API endpoints failed. Last status: ${response?.status || 'No response'}`);
      }

      const data = await response.json();
      console.log('📊 Staff API Response:', data);
      console.log('📊 Sample Staff Object:', data?.data?.staff?.[0]);
      
      // Log the structure for debugging
      if (data?.data?.staff?.[0]) {
        const sampleStaff = data.data.staff[0];
        console.log('🔍 Available staff fields:', Object.keys(sampleStaff));
        console.log('🔍 Sample raw_data fields:', Object.keys(sampleStaff.raw_data || {}));
        console.log('🔍 Staff active status:', sampleStaff.active, 'type:', typeof sampleStaff.active);
        console.log('🔍 Staff logged_in status:', sampleStaff.raw_data?.is_logged_in, 'type:', typeof sampleStaff.raw_data?.is_logged_in);
      }

      let staffArray = [];
      
      // Handle the Staff Details API response structure
      if (data?.data?.staff && Array.isArray(data.data.staff)) {
        staffArray = data.data.staff;
        console.log(`✅ Loaded ${staffArray.length} staff members`);
        console.log('📋 Available staff fields:', Object.keys(staffArray[0] || {}));
      }

      // Transform staff data to employee format for Quick View
      const users = staffArray.map(staff => {
        // Get data from raw_data if available, otherwise use main staff object
        const rawData = staff.raw_data || {};
        
        // Calculate work status based on API data
        const isActive = staff.active === true || staff.active === '1' || staff.active === 1 || 
                        rawData.active === '1' || rawData.active === 1;
        const isLoggedIn = staff.is_logged_in === '1' || staff.is_logged_in === 1 || 
                          rawData.is_logged_in === '1' || rawData.is_logged_in === 1;
        const workStatus = isActive && isLoggedIn ? 'Active' : isActive ? 'Available' : 'Inactive';
        
        // Extract real data from API - using actual fields from the response
        // The Staff API provides real data for last_login and last_activity
        // These are the main time-based fields available in the API
        const lastLogin = staff.last_login || rawData.last_login;
        const lastActivity = rawData.last_activity;
        
        // Calculate time differences for display
        const formatTimeData = (timestamp) => {
          if (!timestamp) return 'N/A';
          const date = new Date(timestamp);
          const now = new Date();
          const diffMs = now - date;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          
          if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m ago`;
          } else if (diffMinutes > 0) {
            return `${diffMinutes}m ago`;
          } else {
            return 'Just now';
          }
        };
        
        // Use actual API data for these columns
        const loggedTime = lastLogin ? formatTimeData(lastLogin) : 'Never';
        const activeTime = lastActivity ? formatTimeData(lastActivity) : 'N/A';
        
        // Other fields that may not have time tracking data
        const productivityScore = staff.productivity_score || rawData.productivity_score || 0;
        const productiveTime = staff.productive_time || rawData.productive_time || 'N/A';
        const meetingTime = staff.meeting_time || rawData.meeting_time || 'N/A';
        const breakTime = staff.break_time || rawData.break_time || 'N/A';
        const idleTime = staff.idle_time || rawData.idle_time || 'N/A';
        
        console.log(`👤 Mapped employee: ${staff.full_name}`, {
          status: workStatus,
          isActive: isActive,
          isLoggedIn: isLoggedIn,
          lastLogin: lastLogin,
          lastActivity: lastActivity,
          loggedTimeFormatted: loggedTime,
          activeTimeFormatted: activeTime,
          productivity: productivityScore,
          staffId: rawData.staffid,
          statusWork: rawData.status_work
        });

        return {
          id: staff.staffid || rawData.staffid || staff.id,
          name: staff.full_name || `${rawData.firstname || ''} ${rawData.lastname || ''}`.trim(),
          team: rawData.job_position || staff.department_name || staff.organization || 'No Organization',
          status: workStatus,
          designation: staff.role || rawData.role || 'Staff',
          email: staff.email || rawData.email,
          isOnline: isLoggedIn,
          lastLogin: staff.last_login || rawData.last_login || 'Never',
          lastActivity: rawData.last_activity || 'Unknown',
          staffId: rawData.staff_identifi || 'N/A',
          hourlyRate: rawData.hourly_rate || 'N/A',
          // Real-time data from Staff API (showing actual availability)
          loggedTime: loggedTime,
          activeTime: activeTime,
          productivity: productivityScore,
          productiveTime: productiveTime,
          meetingTime: meetingTime,
          breakTime: breakTime,
          idleTime: idleTime,
          // Raw timestamps for indicators
          rawLastLogin: lastLogin,
          rawLastActivity: lastActivity,
          // Additional staff information
          phoneNumber: rawData.phonenumber || 'N/A',
          workplace: rawData.workplace || 'N/A',
          statusWork: rawData.status_work || 'unknown',
          dateUpdated: rawData.date_update || 'N/A',
          originalData: staff,
          apiNote: 'Staff Management API - Time tracking data may not be available'
        };
      });

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
            
            </RightControls>
          </ControlsSection>
        </PageHeader>

        {/* Table */}
        <TableWrapper>
          <TableContainer theme={theme}>
            <Table>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                  <TableHeader theme={theme} align="left">STATUS</TableHeader>
                  <TableHeader theme={theme} align="left">EMPLOYEE NAME ↑</TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Total time employee has been logged into the system" theme={theme}>
                      LOGGED TIME
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Time since last activity was recorded" theme={theme}>
                      ACTIVE TIME
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Total productive work hours" theme={theme}>
                      PRODUCTIVE
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Time spent in meetings" theme={theme}>
                      MEETING
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Break time taken by employee" theme={theme}>
                      BREAK
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Time when employee was idle" theme={theme}>
                      IDLE
                    </Tooltip>
                  </TableHeader>
                  <TableHeader theme={theme} align="center">
                    <Tooltip text="Time when employee was offline" theme={theme}>
                      OFFLINE
                    </Tooltip>
                  </TableHeader>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id} theme={theme}>
                      <TableCell theme={theme} align="left">
                        <StatusColumn>
                          <StatusCircle active={employee.status === 'Active'} />
                          <StatusText theme={theme}>
                            {employee.status === 'Active' ? 'Active' : 'OFF'}
                          </StatusText>
                        </StatusColumn>
                      </TableCell>
                      
                      <TableCell theme={theme} align="left">
                        <EmployeeInfo>
                          <EmployeeDetails>
                            <EmployeeName theme={theme}>{employee.name}</EmployeeName>
                           
                          </EmployeeDetails>
                        </EmployeeInfo>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>{employee.loggedTime}</TimeText>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <ActiveTimeColumn>
                          <TimeText theme={theme}>
                            {employee.activeTime === 'N/A' ? '0h 0m' : employee.activeTime}
                          </TimeText>
                          <ProductivityCircle value={employee.productivity} theme={theme}>
                            {employee.productivity > 0 ? `${employee.productivity}%` : '0%'}
                          </ProductivityCircle>
                        </ActiveTimeColumn>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>0h 0m</TimeText>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>
                          {employee.meetingTime === 'N/A' ? '0h 0m' : employee.meetingTime}
                        </TimeText>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>
                          {employee.breakTime === 'N/A' ? '0h 0m' : employee.breakTime}
                        </TimeText>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>
                          {employee.idleTime === 'N/A' ? '0h 0m' : employee.idleTime}
                        </TimeText>
                      </TableCell>
                      
                      <TableCell theme={theme} align="center">
                        <TimeText theme={theme}>0h 0m</TimeText>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow theme={theme}>
                    <TableCell theme={theme} colSpan="9">
                      <EmptyStateCell theme={theme}>
                        {loading ? '🔄 Loading users...' : 'No users found.'}
                      </EmptyStateCell>
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </TableWrapper>

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
