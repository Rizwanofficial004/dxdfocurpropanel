import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { formatDateTurkey, formatTimeTurkey } from '../../../utils/reportUtils';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('focus-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'focus-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const FocusTimelineTab = ({ 
  theme, 
  focusTimelineData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  const [sortColumn, setSortColumn] = useState('duration'); // 'switches' or 'duration'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [timelineFilter, setTimelineFilter] = useState('monthly'); // 'monthly' or 'daily'

  // Format seconds to readable time (e.g., "3h 50m 12s" or "0m 8s")
  const formatDuration = (seconds) => {
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

  // Format hours to readable time
  const formatHours = (hours) => {
    if (!hours && hours !== 0) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Format time from timestamp (using Turkey timezone)
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return formatTimeTurkey(timestamp);
  };

  // Process monthly timeline data from monthly_app_usage
  const monthlyTimelineEntries = useMemo(() => {
    if (!focusTimelineData?.monthly_app_usage) return [];
    
    const entries = [];
    const month = focusTimelineData.month || '';
    
    focusTimelineData.monthly_app_usage.forEach((app) => {
      entries.push({
        date: month,
        processName: app.process_name || 'Unknown',
        totalHours: app.total_hours || 0,
        totalSeconds: app.total_seconds || 0,
        percent: app.percent || 0
      });
    });
    
    // Sort by total seconds or hours (descending)
    return entries.sort((a, b) => {
      const aValue = a.totalSeconds || (a.totalHours * 3600);
      const bValue = b.totalSeconds || (b.totalHours * 3600);
      return bValue - aValue;
    });
  }, [focusTimelineData]);

  // Process timeline data from daily reports
  const dailyTimelineEntries = useMemo(() => {
    if (!focusTimelineData?.daily_report) return [];
    
    const entries = [];
    const days = Object.entries(focusTimelineData.daily_report)
      .filter(([_, data]) => data.status === 'works_done')
    console.log("🚀 ~ FocusTimelineTab ~ days:", days)
    
    days.forEach(([date, dayData]) => {
      if (dayData.applications_used) {
        dayData.applications_used.forEach((app) => {
          entries.push({
            date,
            processName: app.process_name || 'Unknown',
            totalHours: app.total_hours || 0,
            totalSeconds: app.total_seconds || 0,
            percent: app.percent || 0,
            windowTitles: app.window_titles || []
          });
        });
      }
    });
    
    return entries;
  }, [focusTimelineData]);

  // Select timeline entries based on filter
  const timelineEntries = useMemo(() => {
    return timelineFilter === 'monthly' ? monthlyTimelineEntries : dailyTimelineEntries;
  }, [timelineFilter, monthlyTimelineEntries, dailyTimelineEntries]);

  // Process Focus Share data (aggregate by application)
  const focusShareData = useMemo(() => {
    if (!focusTimelineData?.daily_report) return [];
    
    const appMap = new Map();
    
    Object.entries(focusTimelineData.daily_report).forEach(([date, dayData]) => {
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
          entry.switches += 1; // Count each occurrence as a switch
          entry.totalSeconds += app.total_seconds || 0;
        });
      }
    });
    
    return Array.from(appMap.values());
  }, [focusTimelineData]);

  // Calculate totals
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
    a.download = `focus-share-${focusTimelineData?.month || 'report'}.csv`;
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
        <h4>Loading Focus Timeline Data...</h4>
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
        <p>Please select an employee from the left panel to view their focus timeline data.</p>
      </div>
    );
  }

  // No data available
  const hasMonthlyData = focusTimelineData?.monthly_app_usage && focusTimelineData.monthly_app_usage.length > 0;
  const hasDailyData = focusTimelineData?.daily_report && 
    Object.values(focusTimelineData.daily_report).some(dayData => dayData.status === 'works_done');
  const hasData = timelineFilter === 'monthly' ? hasMonthlyData : hasDailyData;

  if (!focusTimelineData || (!hasMonthlyData && !hasDailyData)) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        color: theme.colors.text.secondary,
        border: '2px dashed #e9ecef',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h4>No Data Available</h4>
        <p>No focus timeline data found for {selectedEmployee?.display_name || selectedEmployee?.email}.</p>
      </div>
    );
  }

  return (
    <>
      {/* View Toggle Buttons */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setTimelineFilter('monthly')}
          style={{
            padding: '8px 16px',
            border: timelineFilter === 'monthly' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: timelineFilter === 'monthly' ? '#3b82f6' : 'white',
            color: timelineFilter === 'monthly' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          📊 Monthly Timeline
        </button>
        <button
          onClick={() => setTimelineFilter('daily')}
          style={{
            padding: '8px 16px',
            border: timelineFilter === 'daily' ? '2px solid #3b82f6' : '1px solid #e9ecef',
            borderRadius: '6px',
            background: timelineFilter === 'daily' ? '#3b82f6' : 'white',
            color: timelineFilter === 'daily' ? 'white' : theme.colors.text.primary,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '12px'
          }}
        >
          📅 Daily Timeline
        </button>
      </div>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '20px',
      padding: '20px',
      background: theme.colors.surface,
      borderRadius: '8px'
    }}>

      {/* Left Panel: FOCUS TIMELINE */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0', 
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: theme.colors.text.primary
        }}>
          FOCUS TIMELINE
        </h3>

        
        {!hasData ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: theme.colors.text.secondary
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h4>No {timelineFilter === 'monthly' ? 'Monthly' : 'Daily'} Data Available</h4>
            <p>No {timelineFilter === 'monthly' ? 'monthly' : 'daily'} timeline data found for this period.</p>
          </div>
        ) : (
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
                    {/* Date/Time header */}
                    {timelineFilter === 'daily' && entry.date && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary,
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        {formatDateTurkey(entry.date, 'MMM DD, YYYY')}
                      </div>
                    )}
                    {timelineFilter === 'monthly' && entry.date && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary,
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        {formatDateTurkey(entry.date + '-01', 'MMMM YYYY')}
                      </div>
                    )}
                    
                    {/* Process Name */}
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: theme.colors.text.primary,
                      marginBottom: '8px'
                    }}>
                      {entry.processName?.replace('.exe', '') || entry.processName || 'Unknown'}
                    </div>
                    
                    {/* Total Seconds/Hours and Percentage */}
                    <div style={{ 
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      marginBottom: timelineFilter === 'daily' ? '8px' : '0'
                    }}>
                      <span style={{ 
                        fontSize: '12px', 
                        color: theme.colors.text.secondary,
                        fontWeight: '500'
                      }}>
                        {entry.totalSeconds ? formatDuration(entry.totalSeconds) : formatHours(entry.totalHours)}
                      </span>
                      <span style={{ 
                        padding: '2px 8px',
                        background: '#e0e7ff',
                        borderRadius: '4px',
                        color: '#3b82f6',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {entry.percent?.toFixed(2) || '0.00'}%
                      </span>
                    </div>
                    
                    {/* Window Titles (Daily only) */}
                    {timelineFilter === 'daily' && entry.windowTitles && entry.windowTitles.length > 0 && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '8px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          fontSize: '11px',
                          color: theme.colors.text.secondary,
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          Window Titles:
                        </div>
                        <div style={{ 
                          fontSize: '11px',
                          color: theme.colors.text.secondary,
                          lineHeight: '1.5'
                        }}>
                          {entry.windowTitles.map((title, idx) => (
                            <div key={idx} style={{ marginBottom: '2px' }}>
                              • {title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Focus Share */}
      <div style={{ 
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxHeight: '80vh',
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
            fontSize: '18px',
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
      </div>
    </div>
    </>
  );
};

export default FocusTimelineTab;
