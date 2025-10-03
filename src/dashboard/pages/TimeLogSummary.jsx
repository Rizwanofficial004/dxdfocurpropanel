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

const FiltersContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const FilterInput = styled.input`
  padding: 10px 12px;
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
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
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
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryHover || props.theme.colors.primary};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.background};
      color: ${props.theme.colors.text.primary};
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogsContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px 150px 120px 120px 120px 150px 100px;
  gap: 16px;
  padding: 16px 20px;
  background: ${props => props.theme.colors.background};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px 150px 120px 120px 120px 150px 100px;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch(props.status) {
      case 'active':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
        `;
      case 'completed':
        return `
          background: rgba(59, 130, 246, 0.1);
          color: #2563eb;
        `;
      case 'in-progress':
        return `
          background: rgba(251, 191, 36, 0.1);
          color: #d97706;
        `;
      case 'offline':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        `;
    }
  }}
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

const TimeLogSummary = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employee: ''
  });

  // Sample session log data based on the actual structure
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
      },
      session_logs: []
    },
    {
      session_info: {
        email: "john.doe@company.com",
        task_id: "1774",
        staff_id: "189",
        task_name: "Frontend Development",
        end_time: 1759187200,
        note: "completed development tasks",
        completed_at: "2025-09-30T02:15:30.123456"
      },
      program_tracking: {
        user_email: "john.doe@company.com",
        task_name: "Frontend Development",
        date: "2025-09-30",
        session_start: "2025-09-30T01:30:15.123456",
        session_end: "2025-09-30T02:15:30.123456",
        session_duration_seconds: 2715.0,
        session_duration_formatted: "45m 15s",
        programs_tracked: 2,
        programs: [
          {
            process_name: "Code.exe",
            total_time_seconds: 2400.0,
            total_time_formatted: "40m",
            window_titles: ["Visual Studio Code"],
            browser_domains: null
          },
          {
            process_name: "chrome.exe",
            total_time_seconds: 315.0,
            total_time_formatted: "5m 15s",
            window_titles: ["Chrome"],
            browser_domains: ["localhost:3000", "github.com"]
          }
        ],
        capture_timestamp: "2025-09-30T02:15:30.123456"
      },
      session_logs: []
    }
  ];

  // Fetch session logs from S3 (placeholder for API integration)
  const fetchSessionLogsFromS3 = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual S3 API call
      // const response = await fetch('/api/s3/session-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     startDate: filters.startDate,
      //     endDate: filters.endDate,
      //     userEmail: filters.employee
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use sample data for now
      setSessionLogs(sampleSessionLogs);
      applyClientSideFilters(sampleSessionLogs);
      
    } catch (error) {
      console.error('Error fetching session logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Apply client-side filters
  const applyClientSideFilters = (logs) => {
    let filtered = [...logs];

    // Filter by employee email
    if (filters.employee) {
      filtered = filtered.filter(log => 
        log.session_info.email.toLowerCase().includes(filters.employee.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(log => 
        log.program_tracking.date >= filters.startDate
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => 
        log.program_tracking.date <= filters.endDate
      );
    }

    setFilteredLogs(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    if (sessionLogs.length > 0) {
      applyClientSideFilters(sessionLogs);
    } else {
      fetchSessionLogsFromS3();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employee: ''
    });
    setFilteredLogs(sessionLogs);
  };

  // Format time from seconds
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Initial load
  useEffect(() => {
    fetchSessionLogsFromS3();
  }, []);

  return (
    <DashboardLayout>
      <Container>
        <Header>
          <Title>
            📊 {t('timeLogSummary') || 'Time Log Summary'}
          </Title>
        </Header>

        {/* Filters */}
        <FiltersContainer>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Start Date</FilterLabel>
              <FilterInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>End Date</FilterLabel>
              <FilterInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Employee</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Search employee..."
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
              />
            </FilterGroup>
          </FilterRow>
          
          <ButtonGroup>
            <Button onClick={resetFilters}>
              🔄 Reset
            </Button>
            <Button variant="primary" onClick={applyFilters} disabled={loading}>
              {loading ? '🔍 Searching...' : '🔍 Apply Filters'}
            </Button>
          </ButtonGroup>
        </FiltersContainer>

        {/* Session Logs Table */}
        <LogsContainer>
          <TableHeader>
            <div>User Email</div>
            <div>Task Name</div>
            <div>Date</div>
            <div>Session Start</div>
            <div>Session End</div>
            <div>Duration</div>
            <div>Programs Used</div>
            <div>Status</div>
          </TableHeader>
          
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <div>Loading session logs from S3...</div>
            </LoadingContainer>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((sessionLog, index) => (
              <TableRow key={`${sessionLog.session_info.task_id}-${index}`}>
                <TableCell>{sessionLog.session_info.email}</TableCell>
                <TableCell>
                  <div style={{ fontWeight: '600' }}>
                    {sessionLog.session_info.task_name}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>
                    ID: {sessionLog.session_info.task_id}
                  </div>
                </TableCell>
                <TableCell>{sessionLog.program_tracking.date}</TableCell>
                <TableCell>
                  {formatTimestamp(sessionLog.program_tracking.session_start)}
                </TableCell>
                <TableCell>
                  {formatTimestamp(sessionLog.program_tracking.session_end)}
                </TableCell>
                <TableCell>
                  <StatusBadge status="active">
                    {sessionLog.program_tracking.session_duration_formatted}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: '12px' }}>
                    {sessionLog.program_tracking.programs.map((program, idx) => (
                      <div key={idx} style={{ marginBottom: '2px' }}>
                        <strong>{program.process_name}</strong>
                        <br />
                        <span style={{ opacity: 0.7 }}>
                          {program.total_time_formatted}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status="completed">
                    {sessionLog.session_info.note || 'Completed'}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <div>No session logs found</div>
              <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                Try adjusting your filters or check your S3 connection
              </div>
            </EmptyState>
          )}
        </LogsContainer>
      </Container>
    </DashboardLayout>
  );
};

export default TimeLogSummary;