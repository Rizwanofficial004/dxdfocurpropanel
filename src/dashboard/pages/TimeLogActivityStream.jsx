import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

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
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    const dateStr = date.toISOString().split('T')[0];
    return sessionLogs.some(log => log.program_tracking.date === dateStr);
  };

  // Filter activities by search and selected date
  const filterActivities = useCallback(() => {
    let filtered = [...sessionLogs];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(log => 
        log.session_info.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.session_info.task_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected date
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(log => log.program_tracking.date === selectedDateStr);
    }

    // Sort by session start time (newest first)
    filtered.sort((a, b) => new Date(b.program_tracking.session_start) - new Date(a.program_tracking.session_start));

    setFilteredActivities(filtered);
  }, [sessionLogs, searchQuery, selectedDate]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(selectedDate?.getTime() === date.getTime() ? null : date);
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

  // Load data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSessionLogs(sampleSessionLogs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter activities when dependencies change
  useEffect(() => {
    filterActivities();
  }, [filterActivities]);

  return (
    <DashboardLayout>
      <Container>
        <Header>
          <Title>
            📊 Logs Report
          </Title>
        </Header>

        {/* Search Section */}
        <SearchSection>
          <SearchHeader>Search Employee</SearchHeader>
          <SearchInput
            type="text"
            placeholder="Search employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              ? `Activity for ${formatDate(selectedDate)}` 
              : searchQuery 
                ? `Search results for "${searchQuery}"` 
                : 'Recent Activity Stream'
            }
          </ActivityStreamHeader>

          <ActivityList>
            {loading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <div>Loading activity stream...</div>
              </LoadingContainer>
            ) : filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <ActivityItem key={`${activity.session_info.task_id}-${index}`}>
                  <ActivityTime>
                    🕒 {formatTime(activity.program_tracking.session_start)} - {formatTime(activity.program_tracking.session_end)}
                  </ActivityTime>
                  
                  <ActivityContent>
                    <ActivityDetails>
                      <ActivityTitle>
                        {activity.session_info.task_name}
                      </ActivityTitle>
                      <ActivityDescription>
                        👤 {activity.session_info.email} • 📋 Task ID: {activity.session_info.task_id}
                      </ActivityDescription>
                      <ProgramsList>
                        {activity.program_tracking.programs.map((program, idx) => (
                          <ProgramTag key={idx}>
                            {program.process_name.replace('.exe', '')} ({program.total_time_formatted})
                          </ProgramTag>
                        ))}
                      </ProgramsList>
                    </ActivityDetails>
                    
                    <ActivityDuration>
                      {activity.program_tracking.session_duration_formatted}
                    </ActivityDuration>
                  </ActivityContent>
                </ActivityItem>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>🚫</EmptyIcon>
                <div>
                  {selectedDate 
                    ? 'No activity found for selected date' 
                    : searchQuery 
                      ? 'No employees found matching your search' 
                      : 'Search for employees to view their activity stream'
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