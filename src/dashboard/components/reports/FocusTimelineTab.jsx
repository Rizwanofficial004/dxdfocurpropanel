import React, { useState, useEffect } from 'react';

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
  const [activeView, setActiveView] = useState('monthly'); // 'monthly' or 'daily'
  const [selectedDay, setSelectedDay] = useState(null);

  // Add spinner styles
  useEffect(() => {
    const spinnerStyles = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    if (typeof document !== 'undefined' && !document.getElementById('focus-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'focus-spinner-styles';
      style.textContent = spinnerStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Debug logging
  console.log('🔍 FocusTimelineTab Debug:');
  console.log('- Selected Employee:', selectedEmployee);
  console.log('- Focus Timeline Data:', focusTimelineData);
  console.log('- Is Loading Report Data:', isLoadingReportData);
  console.log('- Selected Year:', selectedYear);
  console.log('- Selected Month:', selectedMonth);
  console.log('- Selected Date:', selectedDate);

  // Get app icon color based on app name
  const getAppColor = (processName) => {
    const colors = {
      'chrome.exe': '#4285f4',
      'Code.exe': '#007acc',
      'explorer.exe': '#ffc107',
      'notepad.exe': '#28a745',
      'WINWORD.EXE': '#2b579a',
      'Postman.exe': '#ff6c37',
      'dbeaver.exe': '#372923',
      'DDSFocusPro.exe': '#6f42c1',
      'Taskmgr.exe': '#dc3545'
    };
    return colors[processName] || '#6c757d';
  };

  // Get app icon based on app name
  const getAppIcon = (processName) => {
    const icons = {
      'chrome.exe': '🌐',
      'Code.exe': '💻',
      'explorer.exe': '📁',
      'notepad.exe': '📝',
      'WINWORD.EXE': '📄',
      'Postman.exe': '📡',
      'dbeaver.exe': '🗄️',
      'DDSFocusPro.exe': '🎯',
      'Taskmgr.exe': '⚙️'
    };
    return icons[processName] || '💼';
  };

  // Format hours to readable format
  const formatHours = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Get working days from daily report
  const getWorkingDays = () => {
    if (!focusTimelineData?.daily_report) return [];
    
    return Object.entries(focusTimelineData.daily_report)
      .filter(([date, data]) => data.status === 'works_done')
      .sort(([a], [b]) => new Date(a) - new Date(b));
  };

  return (
    <div style={{ padding: '20px', background: theme.colors.surface, borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>
          Focus Timeline - Application Usage Report
        </h3>
        <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
          {selectedEmployee ? (
            <>
              � Employee: <strong>{selectedEmployee.display_name || selectedEmployee.email}</strong>
              <br />
              📅 Period: {selectedDate || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
            </>
          ) : (
            'Please select an employee to view focus timeline data'
          )}
        </div>
      </div>

      {/* Show when employee is selected but data is loading */}
      {selectedEmployee && isLoadingReportData && (
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
          <p>Fetching application usage data for {selectedEmployee.display_name || selectedEmployee.email}</p>
        </div>
      )}

      {/* Show when employee is selected but no data yet and not loading */}
      {selectedEmployee && !focusTimelineData && !isLoadingReportData && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: theme.colors.text.secondary,
          border: '2px dashed #f59e0b',
          borderRadius: '8px',
          background: '#fef3c7'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h4>No Data Available</h4>
          <p>No focus timeline data found for {selectedEmployee.display_name || selectedEmployee.email}</p>
        </div>
      )}

      {/* Monthly Summary */}
      {focusTimelineData && (
        <div style={{ 
          background: theme.colors.card || '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
            � Monthly Summary for {selectedEmployee?.display_name || selectedEmployee?.email}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            <div>
              <strong>Total Worked Hours:</strong><br />
              <span style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
                {formatHours(focusTimelineData.total_worked_hours)}
              </span>
            </div>
            <div>
              <strong>Working Days:</strong><br />
              <span style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 'bold' }}>
                {getWorkingDays().length} days
              </span>
            </div>
            <div>
              <strong>Applications Used:</strong><br />
              <span style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 'bold' }}>
                {focusTimelineData.monthly_app_usage?.length || 0} apps
              </span>
            </div>
            <div>
              <strong>Month/Year:</strong><br />
              <span style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 'bold' }}>
                {focusTimelineData.month}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      {focusTimelineData && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveView('monthly')}
              style={{
                padding: '8px 16px',
                border: activeView === 'monthly' ? '2px solid #3b82f6' : '1px solid #e9ecef',
                borderRadius: '6px',
                background: activeView === 'monthly' ? '#3b82f6' : 'white',
                color: activeView === 'monthly' ? 'white' : theme.colors.text.primary,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              📊 Monthly App Usage
            </button>
            <button
              onClick={() => setActiveView('daily')}
              style={{
                padding: '8px 16px',
                border: activeView === 'daily' ? '2px solid #3b82f6' : '1px solid #e9ecef',
                borderRadius: '6px',
                background: activeView === 'daily' ? '#3b82f6' : 'white',
                color: activeView === 'daily' ? 'white' : theme.colors.text.primary,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              📅 Daily Breakdown
            </button>
          </div>
        </div>
      )}

      {/* Monthly App Usage View */}
      {focusTimelineData && activeView === 'monthly' && focusTimelineData.monthly_app_usage && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
            � Monthly Application Usage ({focusTimelineData.monthly_app_usage.length} applications)
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {focusTimelineData.monthly_app_usage.map((app, index) => (
              <div key={index} style={{
                background: 'white',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '16px',
                transition: 'transform 0.2s ease',
                ':hover': { transform: 'translateY(-2px)' }
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: getAppColor(app.process_name),
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    marginRight: '12px'
                  }}>
                    {getAppIcon(app.process_name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: '4px' }}>
                      {app.process_name.replace('.exe', '')}
                    </div>
                    <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                      {formatHours(app.total_hours)} • {app.percent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: '#e9ecef',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${app.percent}%`,
                    height: '100%',
                    background: getAppColor(app.process_name),
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Breakdown View */}
      {focusTimelineData && activeView === 'daily' && (
        <div>
          <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
            📅 Daily Activity Breakdown ({getWorkingDays().length} working days)
          </h4>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            {getWorkingDays().map(([date, dayData]) => (
              <button
                key={date}
                onClick={() => setSelectedDay(selectedDay === date ? null : date)}
                style={{
                  padding: '8px 12px',
                  border: selectedDay === date ? '2px solid #3b82f6' : '1px solid #e9ecef',
                  borderRadius: '6px',
                  background: selectedDay === date ? '#3b82f6' : 'white',
                  color: selectedDay === date ? 'white' : theme.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
                <br />
                <span style={{ fontSize: '10px', opacity: 0.8 }}>
                  {formatHours(dayData.total_worked_hours)}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Day Details */}
          {selectedDay && focusTimelineData.daily_report[selectedDay] && (
            <div style={{
              background: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h5 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                📆 {new Date(selectedDay).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h5>
              
              <div style={{ marginBottom: '16px' }}>
                <strong>Total Working Time: </strong>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {formatHours(focusTimelineData.daily_report[selectedDay].total_worked_hours)}
                </span>
              </div>

              {focusTimelineData.daily_report[selectedDay].applications_used && (
                <div>
                  <h6 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
                    Applications Used ({focusTimelineData.daily_report[selectedDay].applications_used.length})
                  </h6>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                    {focusTimelineData.daily_report[selectedDay].applications_used.map((app, index) => (
                      <div key={index} style={{
                        background: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ marginRight: '8px', fontSize: '16px' }}>
                            {getAppIcon(app.process_name)}
                          </span>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                              {app.process_name.replace('.exe', '')}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
                              {formatHours(app.total_hours)} • {app.percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Window titles */}
                        {app.window_titles && app.window_titles.length > 0 && (
                          <details style={{ fontSize: '11px', color: theme.colors.text.tertiary }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                              Window titles ({app.window_titles.length})
                            </summary>
                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                              {app.window_titles.slice(0, 5).map((title, idx) => (
                                <li key={idx} style={{ marginBottom: '2px' }}>
                                  {title.length > 50 ? title.substring(0, 50) + '...' : title}
                                </li>
                              ))}
                              {app.window_titles.length > 5 && (
                                <li style={{ fontStyle: 'italic', color: theme.colors.text.secondary }}>
                                  ... and {app.window_titles.length - 5} more
                                </li>
                              )}
                            </ul>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedDay && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: theme.colors.text.secondary,
              border: '2px dashed #e9ecef',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>�</div>
              <h4>Select a Day</h4>
              <p>Click on any working day above to see detailed application usage for that day.</p>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!selectedEmployee ? (
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
      ) : focusTimelineData && (!focusTimelineData.monthly_app_usage || focusTimelineData.monthly_app_usage.length === 0) ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: theme.colors.text.secondary,
          border: '2px dashed #e9ecef',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>�</div>
          <h4>No Activity Data Found</h4>
          <p>No application usage data available for {selectedEmployee?.display_name || selectedEmployee?.email} for the selected period.</p>
        </div>
      ) : null}

      {/* Debug Information */}
      {focusTimelineData && (
        <div style={{ 
          marginTop: '20px',
          padding: '12px', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          fontSize: '11px',
          color: '#666'
        }}>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 Debug Info (Click to expand)</summary>
            <pre style={{ marginTop: '8px', fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(focusTimelineData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default FocusTimelineTab;