import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

// Styled Components
const MainContainer = styled.div`
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 140px);
`;

const UsersSidebar = styled.div`
  width: 280px;
  flex-shrink: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
`;

const SidebarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UsersCount = styled.span`
  font-size: 12px;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  padding: 12px;
  border: 1px solid ${props => props.$isSelected ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$isSelected ? props.theme.colors.primary + '10' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const UserName = styled.div`
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Container = styled.div`
  /* Remove the old container padding since we moved it to MainContainer */
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

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text.secondary};
  margin: 8px 0 0 0;
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

const DateInput = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  min-width: 160px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
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

const CalendarTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 24px 0;
  text-align: center;
`;

const YearMonthControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SelectDropdown = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  min-width: 80px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
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
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
  transition: all 0.2s ease;
  width: 50px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  grid-template-columns: auto repeat(8, 1fr) auto;
  gap: 12px;
  margin-bottom: 24px;
  max-width: 100%;
  align-items: center;
`;

const DateCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  min-height: 90px;
  padding: 12px 8px;
  background: ${props => props.theme.colors.background};

  ${props => props.$isSelected && `
    border-color: ${props.theme.colors.primary};
    background: ${props.theme.colors.primary};
    color: white;
    
    ${DateNumber}, ${DateMonth} {
      color: white;
    }
    
    ${ActivityIndicator} {
      background: #22c55e;
      box-shadow: 0 0 0 2px ${props.theme.colors.primary};
    }
  `}

  ${props => props.$hasActivity && !props.$isSelected && `
    background: rgba(34, 197, 94, 0.05);
    border-color: rgba(34, 197, 94, 0.3);
  `}

  &:hover:not([data-selected="true"]) {
    background: ${props => props.theme.colors.surface};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DateNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
  line-height: 1;
`;

const DateMonth = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
`;

const ActivityIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  position: absolute;
  top: 8px;
  right: 8px;
  box-shadow: 0 0 0 2px ${props => props.theme.colors.background};
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
  const currentDate = new Date(); // September 30, 2025
  const [selectedDate, setSelectedDate] = useState(currentDate);
  // Set start date to first day of current month
  const [startDate, setStartDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  // Set end date to last day of current month
  const [endDate, setEndDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));
  const [sessionLogs, setSessionLogs] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(currentDate);
  
  // Calendar navigation states
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  // Calculate initial date range to show current date (Sep 30 should be in range 25-30)
  const [dateRangeStart, setDateRangeStart] = useState(() => {
    const currentDay = currentDate.getDate();
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    // Calculate which 8-day range contains current date
    return Math.floor((currentDay - 1) / 8) * 8;
  });
  
  // Users sidebar states
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // API function to fetch users from date range logs
  const fetchUsersFromDateRange = useCallback(async (startDate, endDate) => {
    try {
      setLoadingUsers(true);
      console.log('Fetching users from date range logs...');
      
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      
      const response = await axios.get(
        `/api/logs/date-range/`,
        {
          params: {
            start_date: formattedStartDate,
            end_date: formattedEndDate
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('Date range response for users:', response.data);
      
      if (response.data && response.data.data && response.data.data.statistics) {
        const statistics = response.data.data.statistics;
        let usersList = statistics.users_list || [];
        
        // If we have logs data available, filter out users from excluded projects
        if (response.data.data.logs) {
          const excludedFolders = ['Select_a_Task_', 'Emri_Secim_', '--_İş_Emri_Seçin_--'];
          const validLogs = response.data.data.logs.filter(file => {
            const projectName = file.project_name || '';
            const keyPath = file.key || '';
            return !excludedFolders.some(folder => 
              projectName.includes(folder) || keyPath.includes(folder)
            );
          });
          
          // Extract users only from valid logs
          const validUserEmails = [...new Set(validLogs.map(log => log.user_email).filter(Boolean))];
          
          // Filter usersList to only include users with valid logs
          usersList = usersList.filter(email => 
            validUserEmails.some(validEmail => 
              email.toLowerCase().includes(validEmail.toLowerCase()) || 
              validEmail.toLowerCase().includes(email.toLowerCase())
            )
          );
          
          console.log(`Filtered users to exclude unwanted folders: ${usersList.length} users`);
        }
        
        // Convert user emails to user objects with proper formatting
        const users = usersList.map((email, index) => {
          // Clean up email format (convert _at_ back to @, _com back to .com etc)
          const cleanEmail = email.replace(/_at_/g, '@').replace(/_com/g, '.com').replace(/_org/g, '.org');
          
          // Extract name from email (part before @)
          const emailParts = cleanEmail.split('@');
          const namePart = emailParts[0] || 'Unknown';
          
          // Convert email-style name to readable format
          const displayName = namePart
            .split(/[._-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
          
          return {
            id: index + 1,
            email: cleanEmail,
            first_name: displayName.split(' ')[0] || 'Unknown',
            last_name: displayName.split(' ').slice(1).join(' ') || '',
            full_name: displayName
          };
        });
        
        // Remove duplicates based on email
        const uniqueUsers = users.filter((user, index, self) => 
          index === self.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase())
        );
        
        setAllUsers(uniqueUsers);
        console.log('Extracted users from logs:', uniqueUsers);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users from date range:', error);
      // Set some sample users for testing if API fails
      const sampleUsers = [
        {
          id: 1,
          email: 'haseebcodejourney@gmail.com',
          first_name: 'Haseeb',
          last_name: 'Code Journey',
          full_name: 'Haseeb Code Journey'
        },
        {
          id: 2,
          email: 'nawaz@dxdglobal.com',
          first_name: 'Nawaz',
          last_name: '',
          full_name: 'Nawaz'
        }
      ];
      setAllUsers(sampleUsers);
    } finally {
      setLoadingUsers(false);
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
      
      const response = await axios.get(
        `/api/logs/date-range/`,
        {
          params: {
            start_date: formattedStartDate,
            end_date: formattedEndDate
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('Raw API response:', response);
      
      if (response.data && response.data.data && response.data.data.logs) {
        const logFiles = response.data.data.logs;
        console.log(`Found ${logFiles.length} log files`);
        
        // Define folders to exclude (the ones you crossed out)
        const excludedFolders = ['Select_a_Task_', 'Emri_Secim_', '--_İş_Emri_Seçin_--'];
        
        // Filter out excluded folders first
        let filteredLogFiles = logFiles.filter(file => {
          // Check both project_name field and S3 key path for folder exclusions
          const projectName = file.project_name || '';
          const keyPath = file.key || '';
          
          const shouldExclude = excludedFolders.some(folder => 
            projectName.includes(folder) || keyPath.includes(folder)
          );
          
          if (shouldExclude) {
            console.log(`Excluding file from project: ${projectName} or key: ${keyPath}`);
          }
          return !shouldExclude;
        });
        
        console.log(`After excluding unwanted folders: ${filteredLogFiles.length} log files`);
        
        // Debug: Show sample file structure and emails
        if (filteredLogFiles.length > 0) {
          console.log('Sample log file structure:', filteredLogFiles[0]);
          console.log('All user emails in logs:', [...new Set(filteredLogFiles.map(f => f.user_email))]);
        }
        
        // Filter by user email if specified
        if (userEmail) {
          const normalizedUserEmail = userEmail.toLowerCase();
          // Convert email to S3 key format: haseebcodejourney@gmail.com -> haseebcodejourney_at_gmail_com
          const s3EmailFormat = normalizedUserEmail.replace('@', '_at_').replace(/\./g, '_');
          
          console.log('🔍 USER FILTERING:');
          console.log('Looking for user:', normalizedUserEmail);
          console.log('S3 email format:', s3EmailFormat);
          console.log('Available user emails in logs:', [...new Set(filteredLogFiles.map(f => f.user_email))]);
          console.log('Sample S3 keys:', filteredLogFiles.slice(0, 3).map(f => f.key));
          
          filteredLogFiles = filteredLogFiles.filter(file => {
            if (!file.key && !file.user_email) return false;
            
            // Check both the S3 key path and user_email field with multiple formats
            const keyMatch = file.key && file.key.toLowerCase().includes(s3EmailFormat);
            const emailMatch = file.user_email && file.user_email.toLowerCase().includes(s3EmailFormat);
            
            // Also try direct email match
            const directEmailMatch = file.user_email && file.user_email.toLowerCase() === normalizedUserEmail;
            
            // Try with just username part (before @)
            const usernamePart = normalizedUserEmail.split('@')[0];
            const usernameMatch = (file.key && file.key.toLowerCase().includes(usernamePart)) || 
                                 (file.user_email && file.user_email.toLowerCase().includes(usernamePart));
            
            const match = keyMatch || emailMatch || directEmailMatch || usernameMatch;
            
            if (match) {
              console.log(`✅ MATCHED file: ${file.file_name || file.key}`);
              console.log(`   - Key: ${file.key}`);
              console.log(`   - User email: ${file.user_email}`);
              console.log(`   - Match type: ${keyMatch ? 'key' : emailMatch ? 'email' : directEmailMatch ? 'direct' : 'username'}`);
            }
            
            return match;
          });
          console.log(`🎯 Filtered to ${filteredLogFiles.length} log files for user ${userEmail}`);
        } else {
          console.log('No user filter applied, showing all valid logs');
        }
        
        // Fetch actual log content from download URLs (limit to first 10 for performance)
        const logContents = [];
        const filesToFetch = filteredLogFiles.slice(0, 10);
        
        for (const logFile of filesToFetch) {
          try {
            console.log(`Fetching content from: ${logFile.file_name}`);
            
            // Convert S3 URL to use our proxy - simplified approach
            let proxyUrl;
            if (logFile.download_url.includes('amazonaws.com')) {
              const s3Path = logFile.download_url.split('amazonaws.com/')[1];
              proxyUrl = `/s3-proxy/${s3Path}`;
            } else {
              proxyUrl = logFile.download_url; // fallback to original URL
            }
            
            console.log(`Proxy URL: ${proxyUrl}`);
            
            const contentResponse = await axios.get(proxyUrl, {
              timeout: 5000
            });
            
            if (contentResponse.data) {
              // Add metadata to the log content
              const logContent = {
                ...contentResponse.data,
                _metadata: {
                  file_name: logFile.file_name,
                  user_email: logFile.user_email,
                  project_name: logFile.project_name,
                  file_size: logFile.file_size,
                  last_modified: logFile.last_modified
                }
              };
              logContents.push(logContent);
            }
          } catch (fetchError) {
            console.warn(`Failed to fetch content for ${logFile.file_name}:`, fetchError);
            
            // If S3 content fetch fails, create a placeholder entry with metadata
            logContents.push({
              session_info: {
                email: logFile.user_email,
                task_name: logFile.project_name?.replace(/_/g, ' ') || 'Unknown Task',
                note: 'Content fetch failed - showing metadata only',
                completed_at: new Date().toISOString()
              },
              _metadata: {
                file_name: logFile.file_name,
                user_email: logFile.user_email,
                project_name: logFile.project_name,
                file_size: logFile.file_size || 0,
                last_modified: logFile.last_modified || new Date().toISOString(),
                fetch_error: fetchError.message
              }
            });
          }
        }
        
        console.log('Fetched log contents:', logContents);
        setSessionLogs(logContents);
        console.log('Logs processed successfully:', logContents.length, 'entries');
      } else {
        console.log('No data in response, setting empty array');
        setSessionLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(`API Error: ${error.response?.data?.message || error.message || 'Failed to fetch logs'}`);
      
      // Set sample data for testing when API fails
      const sampleLogs = [
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
          },
          _metadata: {
            file_name: "session_complete_2025-09-30_00-04-10.json",
            user_email: "haseebcodejourney@gmail.com",
            project_name: "Create_Hospital_Profile_Pages",
            file_size: 967,
            last_modified: "2025-09-29T21:04:13+00:00"
          }
        }
      ];
      setSessionLogs(sampleLogs);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate calendar dates for the selected month and year
  const generateCalendarDates = () => {
    const currentDate = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const allDates = [];
    
    // Generate all days in the selected month
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      allDates.push(date);
    }
    
    // Return only 8 dates starting from dateRangeStart
    return allDates.slice(dateRangeStart, dateRangeStart + 8);
  };

  const calendarDates = generateCalendarDates();
  
  // Get total days in current month for navigation limits
  const getTotalDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };
  
  // Check if we can navigate to previous/next set of dates
  const canNavigatePrevious = dateRangeStart > 0;
  const canNavigateNext = dateRangeStart + 8 < getTotalDaysInMonth();

  // Generate year options (current year ± 5 years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      years.push(year);
    }
    return years;
  };

  // Month names
  const monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];

  // Handle year/month change
  const handleYearChange = (year) => {
    setSelectedYear(parseInt(year));
    setCurrentMonth(new Date(year, selectedMonth, 1));
    
    // Refresh users list for new date range
    const newStart = new Date(year, selectedMonth, 1);
    const newEnd = new Date(year, selectedMonth + 1, 0);
    fetchUsersFromDateRange(newStart, newEnd);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(parseInt(month));
    setCurrentMonth(new Date(selectedYear, month, 1));
    
    // Refresh users list for new date range
    const newStart = new Date(selectedYear, month, 1);
    const newEnd = new Date(selectedYear, month + 1, 0);
    fetchUsersFromDateRange(newStart, newEnd);
  };

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
    return sessionLogs.some(log => {
      // Check both program_tracking.date and session_info dates
      return (log?.program_tracking?.date === dateStr) || 
             (log?.session_info?.completed_at && log.session_info.completed_at.startsWith(dateStr));
    });
  };

  // Filter activities by search and selected date
  const filterActivities = useCallback(() => {
    if (!Array.isArray(sessionLogs)) {
      console.log('SessionLogs is not an array:', sessionLogs);
      setFilteredActivities([]);
      return;
    }
    
    console.log('🔍 RAW SESSION LOGS:', sessionLogs);
    console.log('� Filtering activities from sessionLogs:', sessionLogs.length, 'logs');
    console.log('📅 Selected date:', selectedDate);
    
    // ENABLE DATE FILTERING
    let filtered = [...sessionLogs];

    // Filter by selected date if one is selected
    if (selectedDate) {
      // Use local date string to avoid timezone issues
      const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      console.log('🎯 Filtering for selected date (local):', selectedDateStr);
      
      filtered = filtered.filter((log, logIndex) => {
        // Check multiple possible date formats in the log
        const programDate = log?.program_tracking?.date; // "2025-09-30"
        const sessionDate = log?.session_info?.completed_at?.split('T')[0]; // "2025-09-30"
        const metadataFileName = log?._metadata?.file_name || '';
        const metadataDate = metadataFileName.includes(selectedDateStr);
        
        const matches = programDate === selectedDateStr || 
                       sessionDate === selectedDateStr || 
                       metadataDate;
        
        console.log(`Log ${logIndex + 1} date check:`, {
          programDate,
          sessionDate,
          metadataFileName,
          metadataDate,
          matches,
          selectedDateStr
        });
        
        return matches;
      });
      
      console.log(`✅ Filtered to ${filtered.length} logs for date ${selectedDateStr}`);
    } else {
      console.log('ℹ️ No date selected - showing all logs');
    }
    
    console.log('🎉 Final filtered activities for selected date:', filtered.length, 'entries');
    console.log('📋 Filtered data:', filtered);
    setFilteredActivities(filtered);
  }, [sessionLogs, selectedDate, selectedUser]);

  // Calculate total productive time from filtered activities
  const calculateProductiveTime = useCallback(() => {
    if (!Array.isArray(filteredActivities) || filteredActivities.length === 0) {
      return { seconds: 0, formatted: '0h 0m 0s' };
    }

    let totalSeconds = 0;
    
    console.log('🕒 Calculating productive time from', filteredActivities.length, 'activities');
    
    filteredActivities.forEach((activity, index) => {
      // Get duration from multiple possible sources
      let duration = 0;
      
      // Try program_tracking.session_duration_seconds
      if (activity?.program_tracking?.session_duration_seconds) {
        duration = activity.program_tracking.session_duration_seconds;
        console.log(`Activity ${index + 1}: Found duration in program_tracking:`, duration);
      }
      // Try session_info.session_duration_seconds  
      else if (activity?.session_info?.session_duration_seconds) {
        duration = activity.session_info.session_duration_seconds;
        console.log(`Activity ${index + 1}: Found duration in session_info:`, duration);
      }
      // Try to calculate from start/end times
      else if (activity?.program_tracking?.session_start && activity?.program_tracking?.session_end) {
        const startTime = new Date(activity.program_tracking.session_start);
        const endTime = new Date(activity.program_tracking.session_end);
        duration = (endTime - startTime) / 1000; // Convert to seconds
        console.log(`Activity ${index + 1}: Calculated duration from start/end times:`, duration);
      }
      // Try session_info start/end
      else if (activity?.session_info?.start_time && activity?.session_info?.end_time) {
        const startTime = new Date(activity.session_info.start_time);
        const endTime = new Date(activity.session_info.end_time);
        duration = (endTime - startTime) / 1000;
        console.log(`Activity ${index + 1}: Calculated duration from session_info times:`, duration);
      }
      // Try programs array total time
      else if (activity?.program_tracking?.programs) {
        const programsTotal = activity.program_tracking.programs.reduce((sum, program) => {
          return sum + (program.total_time_seconds || 0);
        }, 0);
        duration = programsTotal;
        console.log(`Activity ${index + 1}: Calculated duration from programs array:`, duration);
      }
      else {
        console.log(`Activity ${index + 1}: No duration found, using 0`);
      }
      
      totalSeconds += duration;
      console.log(`Activity ${index + 1}: Added ${duration}s, total now: ${totalSeconds}s`);
    });

    console.log('🎯 Final total seconds:', totalSeconds);

    // Format the time
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    const formatted = totalSeconds > 0 ? `${hours}h ${minutes}m ${seconds}s` : '0h 0m 0s';
    
    console.log('⏰ Formatted time:', formatted);
    
    return { seconds: totalSeconds, formatted };
  }, [filteredActivities]);

  const productiveTime = calculateProductiveTime();

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStartDate(date);
    setEndDate(date);
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      // Handle both Unix timestamps and ISO strings
      const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.warn('Error formatting time:', timestamp, error);
      return 'Invalid Time';
    }
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load current month logs and users on component mount
  useEffect(() => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    console.log('Loading logs and users for current month:', formatDateForAPI(monthStart), 'to', formatDateForAPI(monthEnd));
    
    // First fetch users from the date range
    fetchUsersFromDateRange(monthStart, monthEnd);
    
    // Then fetch logs
    fetchActivityFromAPI(monthStart, monthEnd, null);
  }, []); // Run only once on mount

  // Reset date range when month or year changes via dropdowns
  useEffect(() => {
    setDateRangeStart(0);
  }, [selectedYear, selectedMonth]);

  // Load data when date range or user selection changes (but not on initial mount)
  useEffect(() => {
    // Skip if this is the initial mount (handled by separate useEffect above)
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    if (sessionLogs.length === 0 && 
        startDate.getTime() === monthStart.getTime() && 
        endDate.getTime() === monthEnd.getTime()) {
      return;
    }
    const userEmail = selectedUser?.email || null;
    fetchActivityFromAPI(startDate, endDate, userEmail);
  }, [fetchActivityFromAPI, startDate, endDate, selectedUser]);

  // Handle user selection from sidebar
  const handleUserSelect = (user) => {
    setSelectedUser(selectedUser?.email === user.email ? null : user);
    console.log('Selected user:', user);
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
        <CalendarContainer>
          <CalendarTitle>Real Time Activity Stream</CalendarTitle>
          
          <YearMonthControls>
            <SelectDropdown 
              value={selectedYear} 
              onChange={(e) => handleYearChange(e.target.value)}
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </SelectDropdown>
            
            <SelectDropdown 
              value={selectedMonth} 
              onChange={(e) => handleMonthChange(e.target.value)}
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </SelectDropdown>
          </YearMonthControls>

          <CalendarGrid>
            <NavButton 
              onClick={() => {
                if (canNavigatePrevious) {
                  setDateRangeStart(Math.max(0, dateRangeStart - 8));
                } else {
                  // Go to previous month
                  const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                  const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                  setSelectedMonth(newMonth);
                  setSelectedYear(newYear);
                  // Set to last 8 days of previous month
                  const prevMonthDays = new Date(newYear, newMonth + 1, 0).getDate();
                  setDateRangeStart(Math.max(0, prevMonthDays - 8));
                }
              }}
              disabled={false}
            >
              ←
            </NavButton>
            
            {calendarDates.map((date, index) => (
              <DateCard
                key={index}
                $isSelected={selectedDate?.toDateString() === date.toDateString()}
                $hasActivity={hasActivity(date)}
                onClick={() => {
                  console.log('Date clicked:', date);
                  console.log('Date details:', {
                    dateObject: date,
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    localDateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                  });
                  
                  setSelectedDate(date);
                  
                  // Use local date components to avoid timezone issues
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const day = date.getDate();
                  
                  const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
                  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
                  
                  setStartDate(startOfDay);
                  setEndDate(endOfDay);
                  
                  console.log('Setting date range for local date:', {
                    localDateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                    startOfDay,
                    endOfDay
                  });
                }}
                data-selected={selectedDate?.toDateString() === date.toDateString()}
              >
                <DateNumber>
                  {date.getDate().toString().padStart(2, '0')}
                </DateNumber>
                <DateMonth>
                  {monthNames[date.getMonth()]}
                </DateMonth>
                <DateMonth>
                  {date.getFullYear()}
                </DateMonth>
                {hasActivity(date) && <ActivityIndicator />}
              </DateCard>
            ))}
            
            <NavButton 
              onClick={() => {
                if (canNavigateNext) {
                  setDateRangeStart(dateRangeStart + 8);
                } else {
                  // Go to next month
                  const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                  const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                  setSelectedMonth(newMonth);
                  setSelectedYear(newYear);
                  setDateRangeStart(0);
                }
              }}
              disabled={false}
            >
              →
            </NavButton>
          </CalendarGrid>
        </CalendarContainer>

        <MainContainer>
          <UsersSidebar>
            <SidebarTitle>
              Users <UsersCount>({allUsers.length})</UsersCount>
            </SidebarTitle>
            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.text.secondary, 
              marginBottom: '16px' 
            }}>
              {loadingUsers ? 'Loading users...' : 'Select a user to view their activity logs'}
            </div>
            <UsersList>
              {allUsers.map((user) => (
                <UserItem
                  key={user.id}
                  $isSelected={selectedUser?.id === user.id}
                  onClick={() => handleUserSelect(user)}
                >
                  <UserName>{user.first_name} {user.last_name}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserItem>
              ))}
            </UsersList>
          </UsersSidebar>

          <ContentWrapper>

        {/* Activity Stream */}
        <ActivityStreamContainer>
          <ActivityStreamHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                {selectedUser 
                  ? `${selectedUser.first_name} ${selectedUser.last_name} Activity for ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}` 
                  : `All Activity for ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                }
                <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                  📊 Total logs fetched: {sessionLogs.length} | Filtered logs: {filteredActivities.length} | Selected date: {selectedDate.getFullYear()}-{String(selectedDate.getMonth() + 1).padStart(2, '0')}-{String(selectedDate.getDate()).padStart(2, '0')}
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                minWidth: '150px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '2px' }}>Productive Time</div>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{productiveTime.formatted}</div>
              </div>
            </div>
          </ActivityStreamHeader>

          <ActivityList>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <div>Loading logs...</div>
              </LoadingContainer>
            ) : (
              <div>
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => {
                    console.log('🎨 Rendering activity:', index, activity);
                    // Handle both session_complete and other log types
                    const sessionInfo = activity.session_info;
                    const programTracking = activity.program_tracking;
                    const metadata = activity._metadata;
                
                return (
                  <ActivityItem key={`${sessionInfo?.task_id || metadata?.file_name}-${index}`}>
                    <ActivityTime>
                      🕒 {programTracking?.session_start ? 
                          `${formatTime(programTracking.session_start)} - ${formatTime(programTracking.session_end)}` :
                          `Completed: ${sessionInfo?.completed_at ? formatTime(sessionInfo.completed_at) : 'N/A'}`
                      }
                    </ActivityTime>
                    
                    <ActivityContent>
                      <ActivityDetails>
                        <ActivityTitle>
                          {sessionInfo?.task_name || metadata?.project_name || 'Unknown Task'}
                        </ActivityTitle>
                        <ActivityDescription>
                          👤 {sessionInfo?.email || metadata?.user_email || 'Unknown User'} 
                          {sessionInfo?.task_id && ` • 📋 Task ID: ${sessionInfo.task_id}`}
                          {sessionInfo?.staff_id && ` • 👥 Staff ID: ${sessionInfo.staff_id}`}
                        </ActivityDescription>
                        {programTracking?.programs && programTracking.programs.length > 0 && (
                          <ProgramsList>
                            {programTracking.programs.map((program, idx) => (
                              <ProgramTag key={idx}>
                                {program.process_name?.replace('.exe', '') || 'Unknown Process'} 
                                ({program.total_time_formatted || 'N/A'})
                              </ProgramTag>
                            ))}
                          </ProgramsList>
                        )}
                        {sessionInfo?.note && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#6b7280', 
                            marginTop: '8px',
                            fontStyle: 'italic'
                          }}>
                            📝 {sessionInfo.note}
                          </div>
                        )}
                        
                        {/* JSON Data Toggle */}
                        <div style={{ marginTop: '12px' }}>
                          <button 
                            onClick={() => {
                              const jsonElement = document.getElementById(`json-${index}`);
                              jsonElement.style.display = jsonElement.style.display === 'none' ? 'block' : 'none';
                            }}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            📄 Show/Hide JSON Data
                          </button>
                          <pre 
                            id={`json-${index}`}
                            style={{
                              display: 'none',
                              background: '#1f2937',
                              color: '#e5e7eb',
                              padding: '12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              marginTop: '8px',
                              overflow: 'auto',
                              maxHeight: '300px',
                              border: '1px solid #374151'
                            }}
                          >
                            {JSON.stringify(activity, null, 2)}
                          </pre>
                        </div>
                      </ActivityDetails>
                      
                      <ActivityDuration>
                        {programTracking?.session_duration_formatted || 
                         (metadata?.file_size ? `${(metadata.file_size / 1024).toFixed(1)}KB` : 'N/A')}
                      </ActivityDuration>
                    </ActivityContent>
                  </ActivityItem>
                );
              })
                ) : (
                  <EmptyState>
                    <EmptyIcon>🚫</EmptyIcon>
                    <div>
                      {selectedUser 
                        ? `No activity found for ${selectedUser.first_name} ${selectedUser.last_name} on ${formatDate(selectedDate)}` 
                        : `No activity found for ${formatDate(selectedDate)}`
                      }
                    </div>
                  </EmptyState>
                )}
              </div>
            )}
          </ActivityList>
        </ActivityStreamContainer>
          </ContentWrapper>
        </MainContainer>
      </Container>
    </DashboardLayout>
  );
};

export default TimeLogActivityStream;