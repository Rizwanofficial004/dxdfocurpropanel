import React, { useState } from 'react';

// Add spinner animation
const spinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('monitoring-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'monitoring-spinner-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}

const MonitoringActionsTab = ({ 
  theme, 
  monitoringActionsData,
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  isLoadingReportData
}) => {
  const [tooltipVisible, setTooltipVisible] = useState({});

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

  // Toggle tooltip
  const toggleTooltip = (field) => {
    setTooltipVisible(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Sample data structure - will be replaced with API data
  const defaultData = [
    {
      start: '4:12 PM',
      stop: '4:12 PM',
      reason: ''
    },
    {
      start: '10:33 AM',
      stop: '4:12 PM',
      reason: 'Did promotion work with marketing work'
    }
  ];

  const actionsData = monitoringActionsData?.actions || monitoringActionsData || defaultData;

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
        <h4>Loading Monitoring Actions Data...</h4>
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
        <p>Please select an employee from the left panel to view their monitoring actions.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      background: theme.colors.surface,
      borderRadius: '8px'
    }}>
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
          color: theme.colors.text.primary,
          textTransform: 'uppercase'
        }}>
          MONITORING ACTIONS
        </h3>

        {selectedDate && (
          <div style={{ 
            fontSize: '12px', 
            color: theme.colors.text.secondary,
            marginBottom: '16px'
          }}>
            📅 Showing data for: {selectedDate} {selectedMonth} {selectedYear}
          </div>
        )}

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
                  color: theme.colors.text.primary,
                  position: 'relative'
                }}>
                  STOP
                  <span
                    style={{
                      marginLeft: '6px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '12px',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, stop: true }))}
                    onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, stop: false }))}
                  >
                    ⓘ
                    {tooltipVisible.stop && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        marginTop: '4px',
                        padding: '8px 12px',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        Stop time is recorded based on the employee's latest activity on the client app
                      </div>
                    )}
                  </span>
                </th>
                <th style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  position: 'relative'
                }}>
                  REASON
                  <span
                    style={{
                      marginLeft: '6px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      fontSize: '12px',
                      fontWeight: 'normal'
                    }}
                    onMouseEnter={() => setTooltipVisible(prev => ({ ...prev, reason: true }))}
                    onMouseLeave={() => setTooltipVisible(prev => ({ ...prev, reason: false }))}
                  >
                    ⓘ
                    {tooltipVisible.reason && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        marginTop: '4px',
                        padding: '8px 12px',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        maxWidth: '300px',
                        zIndex: 1000,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}>
                        If an employee submits their report after stopping logging their work, the submitted report will be shown in this reason section.
                      </div>
                    )}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {actionsData && actionsData.length > 0 ? (
                actionsData.map((action, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: index < actionsData.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                  >
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {formatTime(action.start || action.start_time || action.startTime)}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {formatTime(action.stop || action.stop_time || action.end_time || action.stopTime)}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: theme.colors.text.primary
                    }}>
                      {action.reason || action.report || action.description || ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="3" 
                    style={{ 
                      padding: '40px',
                      textAlign: 'center',
                      color: theme.colors.text.secondary,
                      fontSize: '14px'
                    }}
                  >
                    No monitoring actions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#0369a1'
        }}>
          <strong>ℹ️ Note:</strong> Monitoring actions start and stop are recorded based on the employees' latest activity on the client app. 
          If an employee submits their report after stopping logging their work, the submitted report will be shown in the reason section.
        </div>
      </div>
    </div>
  );
};

export default MonitoringActionsTab;
