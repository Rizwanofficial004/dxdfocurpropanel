
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { userLogsAPI } from '../../../services/userLogsAPI';

// Base URL for API calls
const BASE_URL = 'https://dxdtime.ddsolutions.io';

const ActivityPatternContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
`;

const ContentSection = styled.div`
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FiltersContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  }

  option {
    padding: 8px;
  }
`;

const DatePicker = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    color: #1a73e8;
    cursor: pointer;
    font-size: 16px;
  }
`;

const ContentArea = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  min-height: 400px;
  position: relative;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  height: 100%;
  min-height: 400px;
`;

const NoDataIcon = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const DocumentIcon = styled.div`
  width: 80px;
  height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  position: relative;
  margin: 0 auto;
  border: 2px solid #e8eaed;

  &::before {
    content: '';
    position: absolute;
    left: 12px;
    top: 20px;
    width: 56px;
    height: 3px;
    background: #dadce0;
    border-radius: 2px;
  }

  &::after {
    content: '';
    position: absolute;
    left: 12px;
    top: 30px;
    width: 40px;
    height: 3px;
    background: #dadce0;
    border-radius: 2px;
    box-shadow: 
      0 10px 0 #dadce0,
      0 20px 0 #dadce0,
      0 30px 0 #dadce0;
  }
`;

const ColorfulBlocks = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 1;
`;

const ColorBlock = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  
  &:nth-child(1) { background: #ff4444; }
  &:nth-child(2) { background: #ffaa00; }
  &:nth-child(3) { background: #ffee00; }
  &:nth-child(4) { background: #00aa44; }
  &:nth-child(5) { background: #0088cc; }
`;

const NoDataText = styled.p`
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  font-weight: 500;
`;

// New styled components for logs viewer
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#fff' : props.theme.colors.text};
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  margin-right: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const TimeRangeButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.active ? '#fff' : props.theme.colors.text};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const LogsContainer = styled.div`
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
`;

const LogsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 100px 150px 120px;
  gap: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 150px 80px;
    gap: 8px;
    font-size: 12px;
  }
`;

const LogItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 200px 100px 150px 120px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 150px 80px;
    gap: 8px;
    font-size: 12px;
  }
`;

const LogFileName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  word-break: break-word;
`;

const LogUser = styled.div`
  color: #1a73e8;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const LogSize = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const LogDate = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogType = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    switch (props.type) {
      case 'users_logs': return '#e8f5e8';
      case 'logs': return '#e8f0ff';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'users_logs': return '#2d7d2d';
      case 'logs': return '#1a73e8';
      default: return '#666';
    }
  }};
  font-size: 12px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 24px;
`;

const CalendarDay = styled.div`
  aspect-ratio: 1;
  background: ${props => {
    if (props.logCount === 0) return props.theme.colors.surface;
    if (props.logCount <= 2) return '#e8f5e8';
    if (props.logCount <= 5) return '#a8e6a8';
    if (props.logCount <= 10) return '#68d668';
    return '#28a745';
  }};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${props => props.logCount > 5 ? '#fff' : props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #3c3;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #cfc;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #5f6368;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ActivityPattern = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'calendar'
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeRange, setTimeRange] = useState('last_7_days');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logsData, setLogsData] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [statistics, setStatistics] = useState({});

  // Time range options
  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' }
  ];

  // Fetch employees list on component mount
  useEffect(() => {
    fetchEmployees();
    fetchLogsData(); // Load initial data
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogsData();
    } else {
      fetchCalendarData();
    }
  }, [timeRange, selectedEmployee, startDate, endDate, activeTab]);

  const fetchEmployees = async () => {
    try {
      const endpoints = [
        `${BASE_URL}/api/users/search/`,
        'http://127.0.0.1:8000/api/users/search/',
        'http://localhost:8000/api/users/search/'
      ];

      let response = null;
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Connected to: ${endpoint}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to fetch from: ${endpoint}`, error);
          continue;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.users) {
          setEmployees(data.data.users);
        } else {
          setEmployees([
            { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
            { id: 2, email: 'kiranaiza4@gmail.com', display_name: 'Kiran' },
            { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
          ]);
        }
      } else {
        setEmployees([
          { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
          { id: 2, email: 'kiranaiza4@gmail.com', display_name: 'Kiran' },
          { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([
        { id: 1, email: 'haseebcodejourney@gmail.com', display_name: 'Haseeb' },
        { id: 2, email: 'kiranaiza4@gmail.com', display_name: 'Kiran' },
        { id: 3, email: 'nawaz@dxdglobal.com', display_name: 'Nawaz' }
      ]);
    }
  };

  const fetchLogsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the API service
      const options = {
        limit: 50,
        sortBy: 'date',
        sortOrder: 'desc'
      };

      // Add time range or custom dates
      if (timeRange && !startDate && !endDate) {
        options.timeRange = timeRange;
      } else if (startDate && endDate) {
        options.startDate = startDate;
        options.endDate = endDate;
      } else {
        options.timeRange = 'last_7_days'; // Default
      }
      
      // Add user filter if selected
      if (selectedEmployee) {
        options.userEmail = selectedEmployee;
      }

      const data = await userLogsAPI.getLogs(options);
      
      setLogsData(data.logs || []);
      setStatistics(data.statistics || {});
      setSuccess(`Found ${data.total_count || 0} log files`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error fetching logs data:', error);
      setError(error.message || 'Failed to fetch logs data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentDate = new Date();
      const options = {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      };
      
      if (selectedEmployee) {
        options.userEmail = selectedEmployee;
      }

      const data = await userLogsAPI.getCalendar(options);
      
      setCalendarData(data.calendar || {});
      setSuccess(`Calendar data for ${options.year}-${options.month.toString().padStart(2, '0')}`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError(error.message || 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (sizeInMB) => {
    return userLogsAPI.formatFileSize(sizeInMB);
  };

  const formatDate = (dateString) => {
    const formatted = userLogsAPI.formatDate(dateString);
    return `${formatted.date} ${formatted.time}`;
  };

  const generateCalendarDays = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData[dateKey];
      days.push({
        day,
        dateKey,
        logCount: dayData ? dayData.log_count : 0,
        data: dayData
      });
    }
    return days;
  };

  const renderLogsView = () => (
    <>
      {statistics && Object.keys(statistics).length > 0 && (
        <StatsGrid theme={theme}>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{statistics.total_files || 0}</StatValue>
            <StatLabel theme={theme}>Total Files</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{statistics.unique_users || 0}</StatValue>
            <StatLabel theme={theme}>Users</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{formatFileSize(statistics.total_size_mb || 0)}</StatValue>
            <StatLabel theme={theme}>Total Size</StatLabel>
          </StatCard>
          <StatCard theme={theme}>
            <StatValue theme={theme}>{statistics.unique_projects || 0}</StatValue>
            <StatLabel theme={theme}>Projects</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      <LogsContainer theme={theme}>
        <LogsHeader theme={theme}>
          <div>File Name</div>
          <div>User</div>
          <div>Size</div>
          <div>Date</div>
          <div>Type</div>
        </LogsHeader>
        
        {logsData.length === 0 ? (
          <NoDataContainer>
            <NoDataIcon>
              <DocumentIcon>
                <ColorfulBlocks>
                  <ColorBlock />
                  <ColorBlock />
                  <ColorBlock />
                  <ColorBlock />
                  <ColorBlock />
                </ColorfulBlocks>
              </DocumentIcon>
            </NoDataIcon>
            <NoDataText>No logs found for the selected criteria</NoDataText>
          </NoDataContainer>
        ) : (
          logsData.map((log, index) => (
            <LogItem key={index} theme={theme}>
              <LogFileName theme={theme}>{log.file_name}</LogFileName>
              <LogUser>{log.user_email}</LogUser>
              <LogSize theme={theme}>{formatFileSize(log.file_size_mb)}</LogSize>
              <LogDate theme={theme}>{formatDate(log.last_modified)}</LogDate>
              <LogType type={log.log_type}>{log.log_type}</LogType>
            </LogItem>
          ))
        )}
      </LogsContainer>
    </>
  );

  const renderCalendarView = () => (
    <>
      <CalendarGrid>
        {generateCalendarDays().map((day) => (
          <CalendarDay
            key={day.day}
            theme={theme}
            logCount={day.logCount}
            title={`${day.dateKey}: ${day.logCount} logs`}
            onClick={() => {
              if (day.data) {
                console.log('Day data:', day.data);
              }
            }}
          >
            {day.day}
          </CalendarDay>
        ))}
      </CalendarGrid>
      
      {Object.keys(calendarData).length === 0 && (
        <NoDataContainer>
          <NoDataIcon>
            <DocumentIcon>
              <ColorfulBlocks>
                <ColorBlock />
                <ColorBlock />
                <ColorBlock />
                <ColorBlock />
                <ColorBlock />
              </ColorfulBlocks>
            </DocumentIcon>
          </NoDataIcon>
          <NoDataText>No calendar data available</NoDataText>
        </NoDataContainer>
      )}
    </>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading {activeTab === 'logs' ? 'logs' : 'calendar'} data...</p>
        </LoadingContainer>
      );
    }

    return activeTab === 'logs' ? renderLogsView() : renderCalendarView();
  };

  return (
    <DashboardLayout>
      <ActivityPatternContainer theme={theme}>
        <ContentSection theme={theme}>
          <Header>
            <Title theme={theme}>USER LOGS ACTIVITY PATTERN</Title>
          </Header>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <FiltersContainer theme={theme}>
            <FiltersGrid>
              <FilterGroup>
                <FilterLabel theme={theme}>Employee</FilterLabel>
                <FilterSelect
                  theme={theme}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">All employees</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.email || employee.display_name}>
                      {employee.display_name || employee.email}
                    </option>
                  ))}
                </FilterSelect>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel theme={theme}>Start Date</FilterLabel>
                <DatePicker
                  theme={theme}
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTimeRange(''); // Clear time range when custom dates are used
                  }}
                />
              </FilterGroup>

              <FilterGroup>
                <FilterLabel theme={theme}>End Date</FilterLabel>
                <DatePicker
                  theme={theme}
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setTimeRange(''); // Clear time range when custom dates are used
                  }}
                  min={startDate}
                />
              </FilterGroup>
            </FiltersGrid>

            <div style={{ marginTop: '16px' }}>
              <FilterLabel theme={theme}>Quick Time Ranges</FilterLabel>
              <TimeRangeSelector>
                {timeRangeOptions.map((option) => (
                  <TimeRangeButton
                    key={option.value}
                    theme={theme}
                    active={timeRange === option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setStartDate(''); // Clear custom dates when time range is used
                      setEndDate('');
                    }}
                  >
                    {option.label}
                  </TimeRangeButton>
                ))}
              </TimeRangeSelector>
            </div>
          </FiltersContainer>

          <TabsContainer theme={theme}>
            <Tab
              theme={theme}
              active={activeTab === 'logs'}
              onClick={() => setActiveTab('logs')}
            >
              📋 Logs List
            </Tab>
            <Tab
              theme={theme}
              active={activeTab === 'calendar'}
              onClick={() => setActiveTab('calendar')}
            >
              📅 Calendar View
            </Tab>
          </TabsContainer>

          <ContentArea theme={theme}>
            {renderContent()}
          </ContentArea>
        </ContentSection>
      </ActivityPatternContainer>
    </DashboardLayout>
  );
};

export default ActivityPattern;
