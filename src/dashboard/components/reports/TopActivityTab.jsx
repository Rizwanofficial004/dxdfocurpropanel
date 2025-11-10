import React, { useEffect } from 'react';
import styled from 'styled-components';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('top-activity-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'top-activity-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const TopActivityContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const TopActivityHeader = styled.div`
  margin-bottom: 20px;
`;

const TopActivityTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const TopActivityContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const WorkTimeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const WorkTimeStats = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WorkTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WorkTimeLabel = styled.div`
  min-width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
`;

const WorkTimeBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
`;

const WorkTimeProgress = styled.div`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const WorkTimeValue = styled.div`
  min-width: 60px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
`;

const WorkTimePercentage = styled.div`
  min-width: 40px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 30px;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const UserDuration = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const ApplicationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
`;

const ApplicationCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const AppIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const AppName = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
  font-weight: 500;
`;

const AppDuration = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

// Helper function to format seconds to readable time
const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0h 0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Helper function to format hours to readable time
const formatHours = (hours) => {
  if (!hours && hours !== 0) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

// Helper function to calculate percentage
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

const TopActivityTab = ({
  theme,
  meetingTimeData,
  idleTimeData,
  focusTimelineData,
  loggedTimeData,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  // Calculate work time data from API responses
  const calculateWorkTimeData = () => {
    // Get total logged time in seconds
    let totalLoggedSeconds = 0;
    if (loggedTimeData?.total_logged_time) {
      // Parse "X hr Y min" format (e.g., "30 hr 4 min")
      const loggedMatch = loggedTimeData.total_logged_time.match(/(\d+)\s*hr\s*(\d+)\s*min/);
      if (loggedMatch) {
        totalLoggedSeconds = parseInt(loggedMatch[1]) * 3600 + parseInt(loggedMatch[2]) * 60;
      }
    }

    // Get meeting time in seconds
    let meetingSeconds = 0;
    if (meetingTimeData?.total_meeting_seconds) {
      meetingSeconds = meetingTimeData.total_meeting_seconds;
    } else if (meetingTimeData?.total_duration) {
      // Parse "X hr Y min" format (e.g., "5 hr 17 min")
      const meetingMatch = meetingTimeData.total_duration.match(/(\d+)\s*hr\s*(\d+)\s*min/);
      if (meetingMatch) {
        meetingSeconds = parseInt(meetingMatch[1]) * 3600 + parseInt(meetingMatch[2]) * 60;
      }
    } else if (meetingTimeData?.total_meeting_time) {
      // Parse "Xh Ym" format (fallback for other formats)
      const meetingMatch = meetingTimeData.total_meeting_time.match(/(\d+)h\s*(\d+)m/);
      if (meetingMatch) {
        meetingSeconds = parseInt(meetingMatch[1]) * 3600 + parseInt(meetingMatch[2]) * 60;
      }
    }

    // Get idle time in seconds (total_monthly_idle is in hours)
    let idleSeconds = 0;
    if (idleTimeData?.total_monthly_idle) {
      idleSeconds = idleTimeData.total_monthly_idle * 3600; // Convert hours to seconds
    }

    // Calculate breaks (assuming breaks are part of idle or separate)
    // For now, we'll use a placeholder or calculate from other data
    const breaksSeconds = 0; // This would come from breaks API if available

    // Calculate active hours (logged - idle - meeting - breaks)
    const activeSeconds = Math.max(0, totalLoggedSeconds - idleSeconds - meetingSeconds - breaksSeconds);

    // Calculate percentages
    const total = totalLoggedSeconds || 1; // Avoid division by zero

    return [
      {
        label: 'IDLE',
        value: formatTime(idleSeconds),
        percentage: parseFloat(calculatePercentage(idleSeconds, total)),
        color: '#6b7280'
      },
      {
        label: 'MEETING',
        value: formatTime(meetingSeconds),
        percentage: parseFloat(calculatePercentage(meetingSeconds, total)),
        color: '#3b82f6'
      },
      {
        label: 'BREAKS',
        value: formatTime(breaksSeconds),
        percentage: parseFloat(calculatePercentage(breaksSeconds, total)),
        color: '#f97316'
      },
      {
        label: 'Active hours',
        value: formatTime(activeSeconds),
        percentage: parseFloat(calculatePercentage(activeSeconds, total)),
        color: '#10b981'
      },
    ];
  };

  // Get application data from focus timeline
  const getApplicationData = () => {
    // Get total time for percentage calculation
    const totalHours = focusTimelineData.total_worked_hours || 0;
    const totalSeconds = totalHours * 3600;

    return focusTimelineData.monthly_app_usage
      .sort((a, b) => b.total_hours - a.total_hours) // Top 10 applications
      .map(app => ({
        name: app.process_name?.replace('.exe', '') || 'Unknown',
        duration: formatHours(app.total_hours),
        percentage: `${app.percent?.toFixed(0) || 0}%`,
        color: getAppColor(app.process_name)
      }));
  };

  // Get app color based on process name
  const getAppColor = (processName) => {
    const colors = {
      'chrome.exe': '#4285f4',
      'Code.exe': '#007acc',
      'explorer.exe': '#ffc107',
      'notepad.exe': '#28a745',
      'WINWORD.EXE': '#2b579a',
      'Postman.exe': '#ff6c37',
      'firefox.exe': '#ff7139',
      'wine': '#8b5cf6',
      'libreoffice-calc': '#0369a1'
    };
    return colors[processName?.toLowerCase()] || '#6c757d';
  };

  // Calculate total duration for display
  const getTotalDuration = () => {
    if (loggedTimeData?.total_time) {
      return loggedTimeData.total_time;
    } else if (loggedTimeData?.total_logged_time) {
      return loggedTimeData.total_logged_time;
    } else if (focusTimelineData?.total_worked_hours) {
      return formatHours(focusTimelineData.total_worked_hours);
    } else if (loggedTimeData?.total_seconds) {
      return formatTime(loggedTimeData.total_seconds);
    }
    return '0h 0m';
  };

  // Use API data or fallback to sample data
  const workTimeData = calculateWorkTimeData()

  const applicationData = focusTimelineData?.monthly_app_usage?.length > 0 && getApplicationData()

  return (
    <TopActivityContainer theme={theme}>
      <TopActivityHeader theme={theme}>
        <TopActivityTitle theme={theme}>Work Time</TopActivityTitle>
        {selectedEmployee && (
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary, marginTop: '8px' }}>
            📊 {selectedEmployee.display_name || selectedEmployee.email}
            {selectedDate && ` • Date: ${selectedDate}`}
            {!selectedDate && ` • Month: ${selectedMonth} ${selectedYear}`}
          </div>
        )}
      </TopActivityHeader>

      {/* Loading State */}
      {isLoadingReportData && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.colors.text.secondary,
          border: '2px dashed #3b82f6',
          borderRadius: '8px',
          background: '#eff6ff'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h4>Loading Top Activity Data...</h4>
        </div>
      )}

      {/* No Data State */}
      {!isLoadingReportData && !selectedEmployee && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: theme.colors.text.secondary,
          border: '2px dashed #e9ecef',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h4>Select an Employee</h4>
          <p>Please select an employee from the left panel to view their top activity data.</p>
        </div>
      )}

      {/* Data Content */}
      {!isLoadingReportData && selectedEmployee && (
        <TopActivityContent theme={theme}>
          {/* <WorkTimeSection>
            <WorkTimeStats>
              {workTimeData.map((item, index) => (
                <WorkTimeItem key={index}>
                  <WorkTimeLabel theme={theme} color={item.color}>
                    {item.label}
                  </WorkTimeLabel>
                  <span style={{ fontSize: '12px', minWidth: '20px' }}>{index + 1}</span>
                  <WorkTimeBar theme={theme}>
                    <WorkTimeProgress color={item.color} percentage={item.percentage} />
                  </WorkTimeBar>
                  <WorkTimeValue theme={theme}>{item.value}</WorkTimeValue>
                  <WorkTimePercentage theme={theme}>{item.percentage.toFixed(2)}%</WorkTimePercentage>
                </WorkTimeItem>
              ))}
            </WorkTimeStats>
            <UserInfo theme={theme}>
              <UserName theme={theme}>
                {selectedEmployee.display_name || selectedEmployee.name || 'Employee'}
              </UserName>
              <UserDuration theme={theme}>({getTotalDuration()})</UserDuration>
            </UserInfo>
          </WorkTimeSection> */}

          {applicationData.length > 0 ? (
            <ApplicationsGrid>
              {applicationData.map((app, index) => (
                <ApplicationCard key={index} theme={theme}>
                  <AppIcon color={app.color}>
                    {app.percentage}
                  </AppIcon>
                  <AppName theme={theme}>{app.name}</AppName>
                  <AppDuration theme={theme}>{app.duration}</AppDuration>
                </ApplicationCard>
              ))}
            </ApplicationsGrid>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              border: '1px dashed #e9ecef',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
              <p>No application usage data available</p>
            </div>
          )}
        </TopActivityContent>
      )}
    </TopActivityContainer>
  );
};

export default TopActivityTab;