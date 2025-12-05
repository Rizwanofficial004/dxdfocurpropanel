import React, { useState, useMemo } from 'react';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('ot-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'ot-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const OTReportTab = ({ 
  theme, 
  loggedTimeData,
  focusTimelineData,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  const [sortColumn, setSortColumn] = useState('duration');
  const [sortDirection, setSortDirection] = useState('desc');

  // Format time from timestamp or time string (using user's local timezone)
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // Handle different time formats
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;
        // toLocaleTimeString automatically converts to user's local timezone
        return date.toLocaleTimeString(navigator.language || 'en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (timeString.includes(':')) {
        // Already formatted time like "10:04 AM"
        return timeString;
      } else {
        // Try parsing as seconds since midnight
        const seconds = parseInt(timeString);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
      }
    } catch (e) {
      return timeString;
    }
  };

  // Format duration (for timeline entries - shows seconds)
  const formatTimelineDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format duration (for summary - shows hours and minutes)
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Calculate shift and OT details from logged time data
  const shiftDetails = useMemo(() => {
    if (!loggedTimeData) {
      return {
        shiftStartTime: 'N/A',
        shiftEndTime: 'N/A',
        workStartTime: 'N/A',
        workEndTime: 'N/A',
        loggedTime: '0h 0m',
        passiveHours: '0h 0m',
        totalActiveHours: '0h 0m'
      };
    }

    // Extract data from loggedTimeData
    const shiftStart = loggedTimeData.shift_start_time || loggedTimeData.start_time || loggedTimeData.shift_start;
    const shiftEnd = loggedTimeData.shift_end_time || loggedTimeData.end_time || loggedTimeData.shift_end;
    const workStart = loggedTimeData.work_start_time || loggedTimeData.actual_start_time || shiftStart;
    const workEnd = loggedTimeData.work_end_time || loggedTimeData.actual_end_time || shiftEnd;
    
    const totalSeconds = loggedTimeData.total_seconds || loggedTimeData.logged_seconds || 0;
    const passiveSeconds = loggedTimeData.passive_seconds || loggedTimeData.idle_seconds || 0;
    const activeSeconds = totalSeconds - passiveSeconds;

    return {
      shiftStartTime: formatTime(shiftStart),
      shiftEndTime: formatTime(shiftEnd),
      workStartTime: formatTime(workStart),
      workEndTime: formatTime(workEnd),
      loggedTime: formatDuration(totalSeconds),
      passiveHours: formatDuration(passiveSeconds),
      totalActiveHours: formatDuration(activeSeconds)
    };
  }, [loggedTimeData]);

  // Calculate OT details
  const otDetails = useMemo(() => {
    if (!loggedTimeData || !shiftDetails.shiftEndTime || shiftDetails.shiftEndTime === 'N/A') {
      return {
        otStartTime: 'N/A',
        otEndTime: 'N/A',
        totalOTHours: '0h 0m'
      };
    }

    // OT starts after shift end time
    const otStart = loggedTimeData.ot_start_time || loggedTimeData.shift_end_time || shiftDetails.shiftEndTime;
    const otEnd = loggedTimeData.ot_end_time || loggedTimeData.work_end_time || shiftDetails.workEndTime;
    
    // Calculate OT duration
    let otSeconds = 0;
    if (loggedTimeData.ot_seconds) {
      otSeconds = loggedTimeData.ot_seconds;
    } else if (otStart && otEnd && otStart !== 'N/A' && otEnd !== 'N/A') {
      try {
        const start = new Date(`2000-01-01 ${otStart}`);
        const end = new Date(`2000-01-01 ${otEnd}`);
        if (end > start) {
          otSeconds = (end - start) / 1000;
        }
      } catch (e) {
        // Fallback calculation
        const totalSeconds = loggedTimeData.total_seconds || 0;
        const shiftSeconds = loggedTimeData.shift_duration_seconds || 28800; // 8 hours default
        otSeconds = Math.max(0, totalSeconds - shiftSeconds);
      }
    }

    return {
      otStartTime: formatTime(otStart),
      otEndTime: formatTime(otEnd),
      totalOTHours: formatDuration(otSeconds)
    };
  }, [loggedTimeData, shiftDetails]);

  // Process timeline entries for selected date
  const timelineEntries = useMemo(() => {
    if (!focusTimelineData?.daily_report || !selectedDate) return [];
    
    const date = `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const dayData = focusTimelineData.daily_report[date];
    
    if (!dayData || dayData.status !== 'works_done' || !dayData.applications_used) return [];
    
    const entries = [];
    dayData.applications_used.forEach((app) => {
      const appName = app.process_name?.replace('.exe', '') || 'Unknown';
      
      if (app.window_titles && app.window_titles.length > 0) {
        app.window_titles.forEach((title, index) => {
          const durationPerTitle = app.total_seconds / app.window_titles.length;
          const baseTime = new Date(date);
          const hoursOffset = Math.floor((index / app.window_titles.length) * 8) + 9;
          const minutesOffset = (index % 4) * 15;
          baseTime.setHours(hoursOffset, minutesOffset, 0);
          
          entries.push({
            time: baseTime.toISOString(),
            duration: durationPerTitle,
            app: appName,
            detail: title
          });
        });
      } else {
        const baseTime = new Date(date);
        baseTime.setHours(12, 0, 0);
        entries.push({
          time: baseTime.toISOString(),
          duration: app.total_seconds,
          app: appName,
          detail: appName
        });
      }
    });
    
    return entries.sort((a, b) => new Date(b.time) - new Date(a.time));
  }, [focusTimelineData, selectedDate, selectedYear, selectedMonth, months]);

  // Process Focus Share data for OT period
  const focusShareData = useMemo(() => {
    if (!focusTimelineData?.daily_report || !selectedDate) return [];
    
    const appMap = new Map();
    const date = `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    
    if (focusTimelineData.daily_report[date]) {
      const dayData = focusTimelineData.daily_report[date];
      if (dayData.status === 'works_done' && dayData.applications_used) {
        dayData.applications_used.forEach((app) => {
          const appName = app.process_name?.replace('.exe', '') || 'Unknown';
          const processName = app.process_name || 'Unknown';
          
          if (!appMap.has(processName)) {
            appMap.set(processName, {
              appName,
              processName,
              switches: 0,
              totalSeconds: 0
            });
          }
          
          const entry = appMap.get(processName);
          entry.switches += app.window_titles?.length || 1;
          entry.totalSeconds += app.total_seconds || 0;
        });
      }
    }
    
    return Array.from(appMap.values());
  }, [focusTimelineData, selectedDate, selectedYear, selectedMonth, months]);

  // Calculate totals for Focus Share
  const totalSwitches = useMemo(() => {
    return focusShareData.reduce((sum, item) => sum + item.switches, 0);
  }, [focusShareData]);

  const totalDuration = useMemo(() => {
    const totalSeconds = focusShareData.reduce((sum, item) => sum + item.totalSeconds, 0);
    return formatDuration(totalSeconds);
  }, [focusShareData]);

  // Sorted Focus Share data
  const sortedFocusShareData = useMemo(() => {
    const sorted = [...focusShareData];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'switches') {
        comparison = a.switches - b.switches;
      } else {
        comparison = a.totalSeconds - b.totalSeconds;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [focusShareData, sortColumn, sortDirection]);

  // Handle sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Activity', 'Switches', 'Duration'],
      ...sortedFocusShareData.map(item => [
        item.appName,
        item.switches,
        formatDuration(item.totalSeconds)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ot-report-${selectedDate || 'report'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
        <h4>Loading OT Report Data...</h4>
      </div>
    );
  }

  // No employee selected
  if (!selectedEmployee) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: theme.colors.text.secondary,
        border: '2px dashed #e9ecef',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
        <h4>Select an Employee</h4>
        <p>Please select an employee from the left panel to view their OT report.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gridTemplateRows: 'auto auto',
      gap: '20px',
      padding: '20px',
      background: theme.colors.surface || '#f5f5f5',
      borderRadius: '8px'
    }}>
      {/* Top Left: SHIFT DETAILS */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          SHIFT DETAILS
        </h3>
        
        <div style={{ 
          border: '1px solid #e9ecef',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {[
            { label: 'SHIFT START TIME:', value: shiftDetails.shiftStartTime },
            { label: 'SHIFT END TIME:', value: shiftDetails.shiftEndTime },
            { label: 'WORK START TIME:', value: shiftDetails.workStartTime },
            { label: 'WORK END TIME:', value: shiftDetails.workEndTime },
            { label: 'LOGGED TIME:', value: shiftDetails.loggedTime },
            { label: 'PASSIVE HOURS:', value: shiftDetails.passiveHours },
            { label: 'TOTAL ACTIVE HOURS:', value: shiftDetails.totalActiveHours }
          ].map((item, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: index % 2 === 0 ? '#f8f9fa' : 'white',
                borderBottom: index < 6 ? '1px solid #e9ecef' : 'none'
              }}
            >
              <span style={{ 
                fontSize: '13px', 
                color: '#3b82f6',
                fontWeight: '600'
              }}>
                {item.label}
              </span>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: theme.colors.text.primary
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Right: OT DETAILS */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          OT DETAILS
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'space-between',
          background: '#e3f2fd',
        }}>
          <div style={{
            flex: 1,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.text.primary,
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              OT START TIME
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {otDetails.otStartTime}
            </div>
          </div>
          
          <div style={{
            flex: 1,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.text.primary,
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              OT END TIME
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {otDetails.otEndTime}
            </div>
          </div>
          
          <div style={{
            flex: 1,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.text.primary,
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              TOTAL OT HOURS
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {otDetails.totalOTHours}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left: Focus Timeline */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          color: theme.colors.text.primary
        }}>
          FOCUS TIMELINE
        </h3>
        
        {timelineEntries.length > 0 ? (
          <div style={{ position: 'relative' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '0',
              bottom: '0',
              width: '2px',
              background: '#e5e7eb'
            }} />
            
            {/* Timeline entries */}
            <div style={{ position: 'relative' }}>
              {timelineEntries.slice(0, 50).map((entry, index) => (
                <div key={index} style={{
                  display: 'flex',
                  marginBottom: '20px',
                  position: 'relative',
                  paddingLeft: '50px'
                }}>
                  {/* Timeline marker */}
                  <div style={{
                    position: 'absolute',
                    left: '11px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    border: '3px solid white',
                    boxShadow: '0 0 0 2px #3b82f6',
                    zIndex: 1
                  }} />
                  
                  {/* Timeline content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary,
                        fontWeight: '500'
                      }}>
                        {formatTime(entry.time)}
                      </span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary,
                        fontWeight: '500'
                      }}>
                        {formatTimelineDuration(entry.duration)}
                      </span>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: theme.colors.text.primary,
                      marginBottom: '2px'
                    }}>
                      {entry.app}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: theme.colors.text.secondary
                    }}>
                      {entry.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: theme.colors.text.secondary
          }}>
            <p>No timeline data available for the selected date.</p>
          </div>
        )}
      </div>

      {/* Bottom Right: Focus Share */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.colors.text.primary
          }}>
            Focus Share
          </h3>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            EXPORT CSV
          </button>
        </div>

        {/* Summary Box */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginBottom: '4px'
            }}>
              {totalSwitches}
            </div>
            <div style={{ 
              fontSize: '12px',
              color: theme.colors.text.secondary
            }}>
              Switches
            </div>
          </div>
          <div style={{
            width: '1px',
            background: '#dee2e6',
            margin: '0 16px'
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: theme.colors.text.primary,
              marginBottom: '4px'
            }}>
              {totalDuration}
            </div>
            <div style={{ 
              fontSize: '12px',
              color: theme.colors.text.secondary
            }}>
              Duration
            </div>
          </div>
        </div>

        {/* Activity Table */}
        {sortedFocusShareData.length > 0 ? (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.text.secondary,
                    cursor: 'pointer'
                  }} onClick={() => handleSort('switches')}>
                    Switches
                    {sortColumn === 'switches' && (
                      <span style={{ marginLeft: '4px' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.text.secondary,
                    cursor: 'pointer'
                  }} onClick={() => handleSort('duration')}>
                    Duration
                    {sortColumn === 'duration' && (
                      <span style={{ marginLeft: '4px' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: theme.colors.text.secondary
                  }}>
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFocusShareData.map((item, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: theme.colors.text.primary,
                        fontWeight: '500'
                      }}>
                        {item.switches}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px',
                      fontSize: '12px',
                      color: theme.colors.text.primary
                    }}>
                      {formatDuration(item.totalSeconds)}
                    </td>
                    <td style={{ 
                      padding: '12px',
                      fontSize: '12px',
                      color: theme.colors.text.primary,
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}>
                      {item.appName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: theme.colors.text.secondary
          }}>
            <p>No activity data available for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTReportTab;
