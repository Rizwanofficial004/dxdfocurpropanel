import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('idle-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'idle-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const IdleTab = ({ 
  theme, 
  idleTimeData,
  loggedTimeData,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  console.log("🚀 ~ IdleTab ~ loggedTimeData:", loggedTimeData)
  // Format time from timestamp or time string (using Turkey timezone)
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        // Add 3 hours for Turkey timezone (UTC+3)
        const turkeyDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
        return turkeyDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      } else if (timeString.includes(':')) {
        return timeString;
      } else {
        return timeString;
      }
    } catch (e) {
      return timeString;
    }
  };

  // Format duration from seconds or time string
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0h 0m';
    if (typeof seconds === 'string' && seconds.includes('h')) {
      return seconds; // Already formatted
    }
    const totalSeconds = typeof seconds === 'number' ? seconds : parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Transform idle data into rows (one per day with count > 0)
  const idleRows = useMemo(() => {
    if (!idleTimeData?.daily_counts) return [];

    return idleTimeData.daily_counts
      .filter((day) => day.total_count > 0)
      .map((day) => {
        const dateObj = new Date(day.date);
        // Add 3 hours for Turkey timezone (UTC+3)
        const turkeyDate = new Date(dateObj.getTime() + (3 * 60 * 60 * 1000));
        const displayDate = turkeyDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        const totalMinutes = day.total_count * 3;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return {
          date: day.date,
          displayDate,
          count: day.total_count,
          duration: `${hours}h ${minutes}m`
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [idleTimeData]);
  console.log("🚀 ~ IdleTab ~ idleRows:", idleRows)

  const totalIdleCount = useMemo(() => {
    return idleRows.reduce((sum, row) => sum + row.count, 0);
  }, [idleRows]);

  // Calculate total idle duration based on total count (3 minutes per event)
  const totalIdleDuration = useMemo(() => {
    const estimatedMinutes = totalIdleCount * 3;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `${hours}h ${minutes}m`;
  }, [totalIdleCount]);

  // Get logged hours from loggedTimeData
  const loggedHours = useMemo(() => {
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
  }, [loggedTimeData]);

  // Calculate idle percentage and chart data
  const chartData = useMemo(() => {
    // Check for missing data and return reason
    if (!loggedTimeData) {
      return { error: 'No logged time data available. Please select an employee and date range.' };
    }
    
    if (!loggedHours) {
      return { error: 'Unable to parse logged time data. Please ensure valid time data is available.' };
    }

    // Parse logged hours (e.g., "30 hr 4 min" or "9h 50m" -> minutes)
    const loggedMatch = loggedHours.match(/(\d+)\s*(?:hr|h)\s*(\d+)\s*(?:min|m)/);
    const loggedMinutes = loggedMatch 
      ? parseInt(loggedMatch[1]) * 60 + parseInt(loggedMatch[2])
      : 0;
    
    if (loggedMinutes === 0) {
      return { error: 'No logged time found. There is no active time data to display.' };
    }
    
    // Parse idle hours (e.g., "0h 29m" -> 29 minutes)
    const idleMatch = totalIdleDuration.match(/(\d+)h\s*(\d+)m/);
    const idleMinutes = idleMatch 
      ? parseInt(idleMatch[1]) * 60 + parseInt(idleMatch[2])
      : 0;
    
    // Calculate active time
    const activeMinutes = loggedMinutes - idleMinutes;
    
    // Check if active time exists
    if (activeMinutes <= 0) {
      return { error: 'No active time available. All logged time is idle time, so the chart cannot be displayed.' };
    }
    
    // Calculate percentages based on logged hours (idle is part of logged time)
    const totalMinutes = loggedMinutes; // Total logged time includes idle time
    const idlePercentage = totalMinutes > 0 ? Math.round((idleMinutes / totalMinutes) * 100) : 0;
    const loggedPercentage = 100 - idlePercentage;
    
    // Prepare data for Recharts PieChart
    const pieData = [
      { name: 'Active Time', value: activeMinutes, percentage: loggedPercentage, color: '#e5e7eb' },
      { name: 'Idle Time', value: idleMinutes, percentage: idlePercentage, color: '#3b82f6' }
    ];
    
    return {
      loggedMinutes,
      idleMinutes,
      activeMinutes,
      idlePercentage,
      loggedPercentage,
      totalMinutes,
      pieData
    };
  }, [loggedTimeData, loggedHours, totalIdleDuration]);

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
        <h4>Loading Idle Time Data...</h4>
      </div>
    );
  }

  // No employee selected - still show cards but with message
  if (!selectedEmployee) {
    return (
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '20px',
        background: theme.colors.surface || '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: theme.colors.text.secondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
          <h4>Select an Employee</h4>
          <p>Please select an employee from the left panel to view their idle time data.</p>
        </div>
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: theme.colors.text.secondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h4>Idle Chart</h4>
          <p>Chart will appear when employee is selected.</p>
        </div>
      </div>
    );
  }

  // Debug: Log data to console
  console.log('IdleTab - idleTimeData:', idleTimeData);
  console.log('IdleTab - selectedDate:', selectedDate);
  console.log('IdleTab - totalIdleDuration:', totalIdleDuration);

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      padding: '20px',
      background: theme.colors.surface || '#f5f5f5',
      borderRadius: '8px',
      minHeight: '400px'
    }}>
      {/* Left Section: IDLE Table */}
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
          IDLE
        </h3>

        <div style={{ 
          fontSize: '12px', 
          color: theme.colors.text.secondary,
          marginBottom: '16px'
        }}>
          📅 Showing idle sessions for {idleTimeData?.month || `${selectedMonth} ${selectedYear}`}
          {selectedDate && (
            <span style={{ marginLeft: '8px', fontWeight: 'bold', color: '#ef4444' }}>
              Selected date: {selectedDate} {selectedMonth} {selectedYear}
            </span>
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
                <th
                  style={{ 
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
                  TOTAL COUNT
                </th>
                <th style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text.primary
                }}>
                  TOTAL DURATION
                </th>
              </tr>
            </thead>
            <tbody>
              {idleRows.length > 0 ? (
                idleRows.map((row) => {
                  const isSelected =
                    selectedDate &&
                    row.date === `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
                  return (
                    <tr
                      key={row.date}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        background: isSelected ? '#eff6ff' : 'white'
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
                        color: theme.colors.text.primary,
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}>
                        {row.count}
                      </td>
                      <td style={{ 
                        padding: '12px 16px',
                        fontSize: '13px',
                        color: theme.colors.text.primary,
                        fontWeight: isSelected ? 'bold' : 'normal'
                      }}>
                        {row.duration}
                      </td>
                    </tr>
                  );
                })
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
                    {!idleTimeData 
                      ? 'No idle data available. Please select an employee and date.'
                      : 'No idle session data above zero count for this period.'}
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
                }}>
                  {totalIdleCount}
                </td>
                <td style={{ 
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: theme.colors.text.primary
                }}>
                  {totalIdleDuration}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Section: IDLE CHART */}
      {chartData && !chartData.error ? (
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
            IDLE CHART
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '50px',
            justifyContent: 'center',
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Donut Chart using Recharts */}
            <div style={{ 
              width: '240px', 
              height: '240px',
              position: 'relative'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
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
                      value={`${chartData.idlePercentage}%`}
                      position="center"
                      style={{
                        fontSize: '32px',
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
              gap: '16px',
              minWidth: '200px'
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
                cursor: 'pointer'
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
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: '2px'
                  }}>
                    Active Time
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary
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
                cursor: 'pointer'
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
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: '2px'
                  }}>
                    Idle Time
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.colors.text.secondary
                  }}>
                    {totalIdleDuration} ({chartData.idlePercentage}%)
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
            IDLE CHART
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
  );
};

export default IdleTab;
