import React, { useMemo, useState } from 'react';
import { formatDateTurkey } from '../../../utils/reportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('meeting-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'meeting-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const BreaksMeetTab = ({ 
  theme, 
  meetingTimeData, 
  loggedTimeData,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'daily'
  
  // Auto-switch to monthly view if daily view is selected but no date is selected
  React.useEffect(() => {
    if (viewMode === 'daily' && !selectedDate) {
      setViewMode('monthly');
    }
  }, [viewMode, selectedDate]);

  // Get selected date in YYYY-MM-DD format
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate || !selectedMonth || !selectedYear) return null;
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0) return null;
    return `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
  }, [selectedDate, selectedMonth, selectedYear, months]);
  // Sample data as fallback
  const breakData = [
    { start: '2:24 PM', stop: '3:17 PM', duration: '0h 53m' }
  ];

  // Transform meeting_summary API data into table format
  const meetingRows = useMemo(() => {
    if (!meetingTimeData?.daily_summary) return [];
    
    let filteredData = meetingTimeData.daily_summary;

    // Filter by selected date if in daily view
    if (viewMode === 'daily' && selectedDateFormatted) {
      filteredData = filteredData.filter((daySummary) => daySummary.date === selectedDateFormatted);
    } else if (viewMode === 'daily') {
      // If daily view but no date selected, return empty
      return [];
    }
    
    const rows = [];
    filteredData.forEach((daySummary) => {
      if (daySummary.meetings && Array.isArray(daySummary.meetings)) {
        daySummary.meetings.forEach((meeting) => {
          // Convert duration_min to hours and minutes format
          const hours = Math.floor(meeting.duration_min / 60);
          const minutes = meeting.duration_min % 60;
          const durationFormatted = `${hours}h ${minutes}m`;
          
          // Format date for display
          const displayDate = formatDateTurkey(daySummary.date, 'MMM DD, YYYY');
          
          rows.push({
            date: daySummary.date,
            displayDate,
            duration: durationFormatted,
            durationMin: meeting.duration_min,
            note: meeting.note || '',
            meetingCount: meeting.meeting_count || 1
          });
        });
      }
    });
    
    return rows;
  }, [meetingTimeData, viewMode, selectedDateFormatted]);

  // Calculate total break duration
  const totalBreakDuration = breakData.reduce((total, item) => {
    const match = item.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return total + parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return total;
  }, 0);
  const totalBreakHours = Math.floor(totalBreakDuration / 60);
  const totalBreakMinutes = totalBreakDuration % 60;
  const totalBreakFormatted = `${totalBreakHours}h ${totalBreakMinutes}m`;

  // Get total meeting duration from API or calculate from rows
  const totalMeetingDuration = useMemo(() => {
    // If daily view, calculate from filtered rows
    if (viewMode === 'daily') {
      if (meetingRows.length > 0) {
        const totalMinutes = meetingRows.reduce((sum, row) => sum + row.durationMin, 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} hr ${minutes} min`;
      }
      return '0h 0m';
    }

    // Monthly view - use total from API or calculate from all rows
    if (meetingTimeData?.total_duration) {
      return meetingTimeData.total_duration;
    }
    if (meetingRows.length > 0) {
      const totalMinutes = meetingRows.reduce((sum, row) => sum + row.durationMin, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours} hr ${minutes} min`;
    }
    return '0h 0m';
  }, [meetingTimeData, meetingRows, viewMode]);

  // Get logged hours from loggedTimeData (monthly or daily based on view mode)
  const loggedHours = useMemo(() => {
    // If daily view, get data from daily_summary for selected date
    if (viewMode === 'daily' && selectedDateFormatted && loggedTimeData?.daily_summary) {
      const dailyData = loggedTimeData.daily_summary.find(
        (day) => day.date === selectedDateFormatted
      );
      if (dailyData?.total_logged_time) {
        return dailyData.total_logged_time;
      }
      return null;
    }

    // Monthly view - use total logged time
    if (loggedTimeData?.total_logged_time) {
      return loggedTimeData.total_logged_time;
    }
    if (loggedTimeData?.total_hours) {
      return loggedTimeData.total_hours;
    }
    if (loggedTimeData?.total_seconds) {
      const hours = Math.floor(loggedTimeData.total_seconds / 3600);
      const minutes = Math.floor((loggedTimeData.total_seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
    return null;
  }, [loggedTimeData, viewMode, selectedDateFormatted]);

  // Calculate meeting chart data based on meetingTimeData and loggedTimeData
  const chartData = useMemo(() => {
    // Check for missing data and return reason
    if (!loggedTimeData) {
      return { error: 'No logged time data available. Please select an employee and date range.' };
    }
    
    if (!loggedHours) {
      return { error: 'Unable to parse logged time data. Please ensure valid time data is available.' };
    }
    
    if (!meetingTimeData) {
      return { error: 'No meeting time data available. Please ensure meeting data exists for the selected period.' };
    }

    // Get total meetings count from API (only for monthly view)
    const totalMeetings = viewMode === 'daily' 
      ? meetingRows.length 
      : (meetingTimeData.total_meetings || 0);
    
    // Parse total meeting duration (use calculated totalMeetingDuration which handles both views)
    const meetingDurationStr = totalMeetingDuration;
    const meetingMatch = meetingDurationStr.match(/(\d+)\s*(?:hr|h)\s*(\d+)\s*(?:min|m)/);
    const totalMeetingMinutes = meetingMatch 
      ? parseInt(meetingMatch[1]) * 60 + parseInt(meetingMatch[2])
      : 0;

      console.log('totalMeetingMinutes', totalMeetingMinutes);
    
    // Parse logged hours (e.g., "30 hr 4 min" -> 1804 minutes)
    const loggedMatch = loggedHours.match(/(\d+)\s*(?:hr|h)\s*(\d+)\s*(?:min|m)/);
    const loggedMinutes = loggedMatch 
      ? parseInt(loggedMatch[1]) * 60 + parseInt(loggedMatch[2])
      : 0;
    
    if (loggedMinutes === 0 && totalMeetingMinutes === 0) {
      return { error: 'No logged time found. There is no active time data to display.' };
    }
    // Calculate active time (non-meeting time)
    // If meeting time exceeds logged time, set active to 0
    const activeMinutes = Math.max(0, loggedMinutes - totalMeetingMinutes);
    
    // Calculate percentages based on the sum of loggedMinutes and totalMeetingMinutes
    // Example: if loggedMinutes=4 and totalMeetingMinutes=6
    // base = 4 + 6 = 10
    // loggedMinutes % = 4/10 * 100 = 40% ✓
    // totalMeetingMinutes % = 6/10 * 100 = 60% ✓
    const baseForPercentage = loggedMinutes + totalMeetingMinutes;
    
    // Calculate percentages: loggedMinutes % and totalMeetingMinutes %
    const loggedPercentage = baseForPercentage > 0 
      ? Math.round((loggedMinutes / baseForPercentage) * 100)
      : 0;
    const meetingPercentage = baseForPercentage > 0 
      ? Math.round((totalMeetingMinutes / baseForPercentage) * 100)
      : 0;
    
    // For display, show loggedMinutes and totalMeetingMinutes as separate segments
    // Use actual values for the chart
    const pieData = [
      { name: 'Logged Time', value: loggedMinutes, percentage: loggedPercentage, color: '#e5e7eb' },
      { name: 'Meeting Time', value: totalMeetingMinutes, percentage: meetingPercentage, color: '#3b82f6' }
    ];
    
    const nonMeetingPercentage = Math.max(0, 100 - meetingPercentage);
    
    return {
      totalMeetings,
      totalMeetingMinutes,
      loggedMinutes,
      activeMinutes,
      totalMeetingDuration: meetingDurationStr,
      meetingPercentage,
      loggedPercentage,
      nonMeetingPercentage,
      pieData
    };
  }, [meetingTimeData, loggedTimeData, loggedHours, totalMeetingDuration, viewMode, meetingRows]);

  // Loading state
  if (isLoadingReportData) {
    return (
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
        <h4>Loading Meeting Time Data...</h4>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      background: theme.colors.surface || '#f5f5f5',
      borderRadius: '8px',
      minHeight: '400px'
    }}>
      {/* View Mode Toggle Buttons - Outside the card */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('monthly')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'monthly' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: viewMode === 'monthly' ? '#3b82f6' : 'white',
            color: viewMode === 'monthly' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          📊 Monthly View
        </button>
        <button
          onClick={() => setViewMode('daily')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'daily' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: viewMode === 'daily' ? '#3b82f6' : 'white',
            color: viewMode === 'daily' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px',
            opacity: selectedDate ? 1 : 0.5,
            pointerEvents: selectedDate ? 'auto' : 'none'
          }}
          disabled={!selectedDate}
        >
          📅 Daily View
        </button>
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* Left Section: BREAK */}
        {/* <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.colors.text.primary
          }}>
            BREAK
          </h3>

          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary,
            marginBottom: '16px'
          }}>
            📅 Showing break sessions for {selectedDate ? `${selectedDate} ${selectedMonth} ${selectedYear}` : `${selectedMonth} ${selectedYear}`}
          </div>

          <div style={{
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e9ecef'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ 
                  background: theme.colors.background || '#f8f9fa',
                  borderBottom: '2px solid #e9ecef'
                }}>
                  <th style={{ 
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text.primary
                  }}>
                    START
                  </th>
                  <th style={{ 
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text.primary
                  }}>
                    STOP
                  </th>
                  <th style={{ 
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.colors.text.primary
                  }}>
                    DURATION
                  </th>
                </tr>
              </thead>
              <tbody>
                {breakData.length > 0 ? (
                  breakData.map((breakItem, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <td style={{ 
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: theme.colors.text.primary
                      }}>
                        {breakItem.start}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: theme.colors.text.primary
                      }}>
                        {breakItem.stop}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: theme.colors.text.primary
                      }}>
                        {breakItem.duration}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="3" 
                      style={{ 
                        padding: '20px',
                        textAlign: 'center',
                        color: theme.colors.text.secondary,
                        fontSize: '13px'
                      }}
                    >
                      {!meetingTimeData 
                        ? 'No break data available. Please select an employee and date.'
                        : 'No break session data for this period.'}
                    </td>
                  </tr>
                )}
                <tr style={{
                  background: theme.colors.background || '#f8f9fa',
                  borderTop: '2px solid #e9ecef'
                }}>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}>
                    Total
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}></td>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}>
                    {totalBreakFormatted}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}

        {/* Left Section: MEETING */}
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.colors.text.primary
          }}>
            MEETING
          </h3>

        <div style={{ 
          fontSize: '12px', 
          color: theme.colors.text.secondary,
          marginBottom: '16px'
        }}>
          {viewMode === 'monthly' ? (
            <>📅 Showing meeting sessions for {meetingTimeData?.month || `${selectedMonth} ${selectedYear}`}</>
          ) : (
            <>📅 Showing meeting sessions for {selectedDateFormatted ? new Date(selectedDateFormatted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'selected date'}</>
          )}
        </div>

        <div style={{
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e9ecef'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                background: theme.colors.background || '#f8f9fa',
                borderBottom: '2px solid #e9ecef'
              }}>
                <th style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text.primary
                }}>
                  DATE
                </th>
                <th style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text.primary
                }}>
                  NOTE
                </th>
                <th style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text.primary
                }}>
                  DURATION
                </th>
              </tr>
            </thead>
            <tbody>
              {meetingRows.length > 0 ? (
                meetingRows.map((row, index) => (
                  <tr
                    key={`${row.date}-${index}`}
                    style={{
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {row.displayDate}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {row.note ? (
                        <div style={{ maxWidth: '300px' }}>
                          <div style={{ 
                            fontSize: '12px',
                            color: theme.colors.text.secondary,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {row.note}
                          </div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {row.duration}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="3" 
                    style={{ 
                      padding: '20px',
                      textAlign: 'center',
                      color: theme.colors.text.secondary,
                      fontSize: '13px'
                    }}
                  >
                    {!meetingTimeData 
                      ? 'No meeting data available. Please select an employee and date.'
                      : viewMode === 'daily' 
                        ? (selectedDateFormatted 
                          ? `No meeting session data for ${new Date(selectedDateFormatted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
                          : 'Please select a date to view daily meeting data.')
                        : 'No meeting session data for this period.'}
                  </td>
                </tr>
              )}
              {meetingRows.length > 0 && (
                <tr style={{
                  background: theme.colors.background || '#f8f9fa',
                  borderTop: '2px solid #e9ecef'
                }}>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}>
                    {viewMode === 'daily' ? 'Daily Total' : 'Monthly Total'}
                  </td>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}></td>
                  <td style={{ 
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: theme.colors.text.primary
                  }}>
                    {totalMeetingDuration}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Section: MEETING CHART */}
      {chartData && !chartData.error ? (
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <h3 style={{ 
            margin: '0 0 24px 0',
            fontSize: '20px',
            fontWeight: '700',
            color: theme.colors.text.primary,
            letterSpacing: '-0.02em'
          }}>
            MEETING CHART
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            justifyContent: 'center',
            marginTop: '20px',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '100%',
            overflow: 'visible'
          }}>
            {/* Donut Chart using Recharts */}
            <div style={{ 
              width: '220px', 
              height: '220px',
              minWidth: '220px',
              maxWidth: '220px',
              position: 'relative',
              flexShrink: 0
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="white"
                    strokeWidth={2}
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          transition: 'opacity 0.3s'
                        }}
                      />
                    ))}
                    <Label
                      value={`${chartData.meetingPercentage}%`}
                      position="center"
                      style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        fill: '#3b82f6',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    />
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const item = chartData.pieData.find(d => d.value === value);
                      return [`${item?.percentage}%`, name];
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '12px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Legend */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: '1 1 auto',
              minWidth: '180px',
              maxWidth: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s',
                cursor: 'pointer',
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f3f5';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#e5e7eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}></div>
                <div style={{ 
                  flex: 1, 
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Logged Time
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {loggedHours} ({chartData.loggedPercentage}%)
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                transition: 'all 0.2s',
                cursor: 'pointer',
                width: '100%',
                minWidth: 0,
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f3f5';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#3b82f6',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                  flexShrink: 0
                }}></div>
                <div style={{ 
                  flex: 1, 
                  minWidth: 0,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Meeting Time
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {totalMeetingDuration} ({chartData.meetingPercentage}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: theme.colors.text.secondary
        }}>
          <h3 style={{ 
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.colors.text.primary
          }}>
            MEETING CHART
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '48px',
              opacity: 0.3
            }}>
              📊
            </div>
            <div style={{
              fontSize: '14px',
              textAlign: 'center',
              maxWidth: '350px',
              lineHeight: '1.6'
            }}>
              <p style={{ 
                margin: '0 0 8px 0',
                fontWeight: '600',
                color: theme.colors.text.primary
              }}>
                Why is the chart not showing?
              </p>
              <p style={{ margin: 0 }}>
                {chartData?.error || 'Chart data unavailable. Logged time data is required to display the chart.'}
              </p>
            </div>
          </div>
        </div>
      )}
      </div>

    </div>
  );
};

export default BreaksMeetTab;