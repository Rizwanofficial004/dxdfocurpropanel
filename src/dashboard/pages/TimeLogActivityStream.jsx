import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SearchHeader = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const UserSearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
`;

const UserOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const SelectedUserTag = styled.div`
  display: inline-flex;
  align-items: center;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  margin-top: 8px;
  gap: 8px;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }
`;

const CalendarContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: ${props => props.theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const MonthYear = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  min-width: 150px;
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  margin-bottom: 24px;
`;

const DateCard = styled.div`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 80px;

  ${props => props.$isSelected && `
    border-color: ${props.theme.colors.primary};
    background: rgba(59, 130, 246, 0.05);
  `}

  ${props => props.$hasActivity && `
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.3);
  `}

  &:hover {
    background: ${props => props.theme.colors.background};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DateNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const DateMonth = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const ActivityIndicator = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.theme.colors.success || '#22c55e'};
  position: absolute;
  top: 6px;
  right: 6px;
`;

const ActivityStreamContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ActivityStreamHeader = styled.div`
  padding: 20px 24px;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
`;

const ActivityList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActivityContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ActivityDescription = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const ProgramsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const ProgramTag = styled.span`
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const ActivityDuration = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.success || '#22c55e'};
  text-align: right;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const TimeLogActivityStream = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [sessionLogs, setSessionLogs] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // User search states
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // API function to search users
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowUserDropdown(false);
      return;
    }

    try {
      setIsSearching(true);
      console.log(`Searching users with query: ${query}`);
      
      const response = await axios.get(
        `https://dxdtime.ddsolutions.io/api/users/search/`,
        {
          params: { q: query },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log('User search response:', response.data);
      
      if (response.data) {
        const users = Array.isArray(response.data) ? response.data :
                     (response.data.users && Array.isArray(response.data.users)) ? response.data.users :
                     (response.data.results && Array.isArray(response.data.results)) ? response.data.results :
                     [];
        
        setSearchResults(users);
        setShowUserDropdown(users.length > 0);
        console.log('Found users:', users.length);
      } else {
        setSearchResults([]);
        setShowUserDropdown(false);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setShowUserDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // API function to fetch activity data (sessions/activity tracking)
  const fetchActivityFromAPI = useCallback(async (startDate, endDate, userEmail = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      
      console.log(`Fetching logs for date range: ${formattedStartDate} to ${formattedEndDate}`);
      if (userEmail) {
        console.log(`Filtering for user: ${userEmail}`);
      }
      
      // Use the userLogsAPI service instead of direct axios calls
      const options = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 100
      };
      
      // Add user email filter if specified
      if (userEmail) {
        options.userEmail = userEmail;
      }
      
      console.log('API options:', options);
      
      const response = await userLogsAPI.getLogs(options);
      
      console.log('Raw API response:', response);
      
      if (response) {
        // The userLogsAPI.getLogs() returns the data directly
        const logsData = response.logs || [];
        
        // Transform the logs data to match the expected format for sessionLogs
        const transformedLogs = logsData.map(log => ({
          log_info: {
            key: log.key,
            file_name: log.file_name,
            file_size: log.file_size,
            file_size_mb: log.file_size_mb,
            last_modified: log.last_modified,
            file_extension: log.file_extension,
            log_type: log.log_type,
            date: log.date,
            project_name: log.project_name,
            user_email: log.user_email,
            download_url: log.download_url
          }
        }));
        
        console.log('Transformed logs data:', transformedLogs);
        setSessionLogs(transformedLogs);
        console.log('Logs fetched successfully:', transformedLogs.length, 'entries');
      } else {
        console.log('No data in response, setting empty array');
        setSessionLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error.message || 'Failed to fetch logs');
      setSessionLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate calendar dates (showing 10 days from current date)
  const generateCalendarDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Sample session logs
  const sampleSessionLogs = [
    {
      session_info: {
        email: "haseebcodejourney@gmail.com",
        task_id: "1773",
        staff_id: "188",
        task_name: "Create Hospital Profile Pages",
        end_time: 1759179848,
        note: "testing finished",
        completed_at: "2025-09-30T00:04:10.851184"
      },
      program_tracking: {
        user_email: "haseebcodejourney@gmail.com",
        task_name: "Create Hospital Profile Pages",
        date: "2025-09-30",
        session_start: "2025-09-30T00:03:09.594721",
        session_end: "2025-09-30T00:04:09.401276",
        session_duration_seconds: 59.81,
        session_duration_formatted: "59s",
        programs_tracked: 1,
        programs: [
          {
            process_name: "FocusProapp.exe",
            total_time_seconds: 47.4,
            total_time_formatted: "47s",
            window_titles: ["DDS FocusPro"],
            browser_domains: null
          }
        ],
        capture_timestamp: "2025-09-30T00:04:09.401392"
      }
    },
    {
      session_info: {
        email: "john.doe@company.com",
        task_id: "1774",
        staff_id: "189",
        task_name: "Frontend Development Sprint",
        end_time: 1759187200,
        note: "completed development tasks",
        completed_at: "2025-09-30T08:15:30.123456"
      },
      program_tracking: {
        user_email: "john.doe@company.com",
        task_name: "Frontend Development Sprint",
        date: "2025-09-30",
        session_start: "2025-09-30T08:00:15.123456",
        session_end: "2025-09-30T08:15:30.123456",
        session_duration_seconds: 915.0,
        session_duration_formatted: "15m 15s",
        programs_tracked: 2,
        programs: [
          {
            process_name: "Code.exe",
            total_time_seconds: 800.0,
            total_time_formatted: "13m 20s",
            window_titles: ["Visual Studio Code"],
            browser_domains: null
          },
          {
            process_name: "chrome.exe",
            total_time_seconds: 115.0,
            total_time_formatted: "1m 55s",
            window_titles: ["Chrome"],
            browser_domains: ["localhost:3000", "github.com"]
          }
        ],
        capture_timestamp: "2025-09-30T08:15:30.123456"
      }
    },
    {
      session_info: {
        email: "jane.smith@company.com",
        task_id: "1775",
        staff_id: "190",
        task_name: "UI Design Review",
        end_time: 1759201200,
        note: "design review completed",
        completed_at: "2025-10-01T10:30:45.789012"
      },
      program_tracking: {
        user_email: "jane.smith@company.com",
        task_name: "UI Design Review",
        date: "2025-10-01",
        session_start: "2025-10-01T09:45:20.789012",
        session_end: "2025-10-01T10:30:45.789012",
        session_duration_seconds: 2725.0,
        session_duration_formatted: "45m 25s",
        programs_tracked: 3,
        programs: [
          {
            process_name: "Figma.exe",
            total_time_seconds: 2100.0,
            total_time_formatted: "35m",
            window_titles: ["Figma"],
            browser_domains: null
          },
          {
            process_name: "chrome.exe",
            total_time_seconds: 425.0,
            total_time_formatted: "7m 5s",
            window_titles: ["Chrome"],
            browser_domains: ["figma.com", "dribbble.com"]
          },
          {
            process_name: "Slack.exe",
            total_time_seconds: 200.0,
            total_time_formatted: "3m 20s",
            window_titles: ["Slack"],
            browser_domains: null
          }
        ],
        capture_timestamp: "2025-10-01T10:30:45.789012"
      }
    }
  ];

  // Check if a date has activity
  const hasActivity = (date) => {
    if (!Array.isArray(sessionLogs) || sessionLogs.length === 0) {
      return false;
    }
    const dateStr = date.toISOString().split('T')[0];
    return sessionLogs.some(log => log?.log_info?.date === dateStr);
  };

  // Group logs by date
  const groupLogsByDate = () => {
    if (!Array.isArray(sessionLogs) || sessionLogs.length === 0) {
      return {};
    }

    const grouped = sessionLogs.reduce((acc, log) => {
      const date = log?.log_info?.date;
      if (date) {
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(log);
      }
      return acc;
    }, {});

    // Sort each day's logs by last_modified (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = new Date(a?.log_info?.last_modified || 0);
        const timeB = new Date(b?.log_info?.last_modified || 0);
        return timeB - timeA;
      });
    });

    return grouped;
  };

  // Filter activities by search and selected date
  const filterActivities = useCallback(() => {
    if (!Array.isArray(sessionLogs)) {
      setFilteredActivities([]);
      return;
    }
    
    let filtered = [...sessionLogs];

    // Filter by selected date
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(log => log?.log_info?.date === selectedDateStr);
    }

    // Filter by user if search query exists
    if (selectedUser) {
      filtered = filtered.filter(log => 
        log?.log_info?.user_email?.toLowerCase() === selectedUser.email?.toLowerCase()
      );
    }

    // Sort by last_modified (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a?.log_info?.last_modified || 0);
      const dateB = new Date(b?.log_info?.last_modified || 0);
      return dateB - dateA;
    });

    setFilteredActivities(filtered);
  }, [sessionLogs, selectedDate, selectedUser]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStartDate(date);
    setEndDate(date);
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load data when component mounts or date range changes
  useEffect(() => {
    const userEmail = selectedUser?.email || null;
    fetchActivityFromAPI(startDate, endDate, userEmail);
  }, [fetchActivityFromAPI, startDate, endDate, selectedUser]);

  // Handle user search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-user-search]')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.email || user.name || '');
    setShowUserDropdown(false);
    console.log('Selected user:', user);
  };

  // Clear user selection
  const clearUserSelection = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowUserDropdown(false);
  };

  // Handle date range change
  const handleDateRangeChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setSelectedDate(start);
  };

  // Filter activities when dependencies change
  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  return (
    <DashboardLayout>
      <Container>
        <Header>
          <Title>
            📊 Activity Stream
          </Title>
        </Header>

        {/* Search Section */}
        <SearchSection>
          <SearchHeader>Search & Filter</SearchHeader>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
            <UserSearchContainer data-user-search>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
                Employee Search
              </label>
              <SearchInput
                type="text"
                placeholder="Type to search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowUserDropdown(true)}
              />
              {isSearching && (
                <div style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: theme.colors.text.secondary 
                }}>
                  Searching...
                </div>
              )}
              {showUserDropdown && searchResults.length > 0 && (
                <UserDropdown>
                  {searchResults.map((user, index) => (
                    <UserOption key={index} onClick={() => handleUserSelect(user)}>
                      <UserName>{user.name || user.email}</UserName>
                      {user.email && user.name && <UserEmail>{user.email}</UserEmail>}
                    </UserOption>
                  ))}
                </UserDropdown>
              )}
              {selectedUser && (
                <SelectedUserTag>
                  👤 {selectedUser.name || selectedUser.email}
                  <ClearButton onClick={clearUserSelection}>✕</ClearButton>
                </SelectedUserTag>
              )}
            </UserSearchContainer>
            <div style={{ minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
                Start Date
              </label>
              <SearchInput
                type="date"
                value={formatDateForAPI(startDate)}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
            </div>
            <div style={{ minWidth: '140px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: theme.colors.text.primary }}>
                End Date
              </label>
              <SearchInput
                type="date"
                value={formatDateForAPI(endDate)}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <button
                onClick={() => {
                  const userEmail = selectedUser?.email || null;
                  fetchLogsFromAPI(startDate, endDate, userEmail);
                }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                disabled={loading}
              >
                {loading ? 'Loading...' : selectedUser ? `Fetch Logs for ${selectedUser.name || selectedUser.email}` : 'Fetch All Logs'}
              </button>
            </div>
          </div>
          {error && (
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              backgroundColor: '#fee2e2', 
              border: '1px solid #fecaca', 
              borderRadius: '6px', 
              color: '#dc2626',
              fontSize: '14px'
            }}>
              Error: {error}
            </div>
          )}
        </SearchSection>

        {/* Calendar Section */}
        <CalendarContainer>
          <CalendarHeader>
            <MonthNavigation>
              <NavButton onClick={() => {/* Previous month logic */}}>
                ← 
              </NavButton>
              <MonthYear>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </MonthYear>
              <NavButton onClick={() => {/* Next month logic */}}>
                →
              </NavButton>
            </MonthNavigation>
          </CalendarHeader>

          <CalendarGrid>
            {calendarDates.map((date, index) => (
              <DateCard
                key={index}
                $isSelected={selectedDate?.getTime() === date.getTime()}
                $hasActivity={hasActivity(date)}
                onClick={() => handleDateSelect(date)}
              >
                <DateMonth>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </DateMonth>
                <DateNumber>
                  {date.getDate().toString().padStart(2, '0')}
                </DateNumber>
                {hasActivity(date) && <ActivityIndicator />}
              </DateCard>
            ))}
          </CalendarGrid>
        </CalendarContainer>

        {/* Activity Stream */}
        <ActivityStreamContainer>
          <ActivityStreamHeader>
            {selectedDate 
              ? `Logs for ${formatDate(selectedDate)}` 
              : searchQuery 
                ? `Search results for "${searchQuery}"` 
                : 'Logs Report - Date-wise View'
            }
          </ActivityStreamHeader>

          <ActivityList>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <div>Loading logs...</div>
              </LoadingContainer>
            ) : sessionLogs.length > 0 ? (
              (() => {
                const groupedLogs = groupLogsByDate(sessionLogs);
                return Object.entries(groupedLogs)
                  .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                  .map(([date, logs]) => (
                    <div key={date}>
                      <DateSeparator>
                        <DateLabel>
                          📅 {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          <span style={{ 
                            marginLeft: 'auto', 
                            fontSize: '14px', 
                            fontWeight: 'normal',
                            color: theme.colors.text.secondary 
                          }}>
                            {logs.length} log{logs.length !== 1 ? 's' : ''}
                          </span>
                        </DateLabel>
                      </DateSeparator>
                      
                      {logs.map((log, index) => (
                        <LogItem key={`${log.date}-${index}`}>
                          <LogHeader>
                            <LogInfo>
                              <LogTitle>
                                📁 {log.filename}
                              </LogTitle>
                              <LogMeta>
                                <span>👤 {log.user}</span>
                                <span>📅 {log.date}</span>
                                <span>📊 {log.total_duration}</span>
                                <span>🔢 {log.log_count} entries</span>
                              </LogMeta>
                            </LogInfo>
                            <DownloadLink 
                              href={log.download_url} 
                              download={log.filename}
                              target="_blank"
                            >
                              ⬇️ Download
                            </DownloadLink>
                          </LogHeader>
                        </LogItem>
                      ))}
                    </div>
                  ));
              })()
            ) : (
              <EmptyState>
                <EmptyIcon>�</EmptyIcon>
                <div>
                  {selectedDate 
                    ? 'No logs found for selected date' 
                    : searchQuery 
                      ? 'No logs found matching your search' 
                      : 'No logs available. Use the search filters above to fetch logs.'
                  }
                </div>
              </EmptyState>
            )}
          </ActivityList>
        </ActivityStreamContainer>
      </Container>
    </DashboardLayout>
  );
};

export default TimeLogActivityStream;