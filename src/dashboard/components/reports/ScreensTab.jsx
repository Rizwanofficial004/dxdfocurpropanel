import React from 'react';

const ScreensTab = ({ 
  theme, 
  screenshotCountData, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months 
}) => {
  return (
    <div style={{ padding: '20px', background: theme.colors.surface, borderRadius: '8px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>
          Screenshot Monitoring
        </h3>
        {screenshotCountData && (
          <div style={{ fontSize: '12px', color: theme.colors.text.secondary }}>
            📊 API Data from: {selectedDate || `${selectedYear}-${String(months.indexOf(selectedMonth) + 1).padStart(2, '0')}`}
          </div>
        )}
      </div>

      {/* Screenshot Summary */}
      {screenshotCountData && (
        <div style={{ 
          background: theme.colors.card || '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
            📸 Screenshot Summary
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {screenshotCountData.total_screenshots && (
              <div>
                <strong>Total Screenshots:</strong><br />
                <span style={{ color: '#3b82f6' }}>{screenshotCountData.total_screenshots}</span>
              </div>
            )}
            {screenshotCountData.screenshots_per_hour && (
              <div>
                <strong>Per Hour:</strong><br />
                <span style={{ color: '#10b981' }}>{screenshotCountData.screenshots_per_hour}</span>
              </div>
            )}
            {screenshotCountData.monitoring_duration && (
              <div>
                <strong>Monitoring Duration:</strong><br />
                <span style={{ color: '#f59e0b' }}>{screenshotCountData.monitoring_duration}</span>
              </div>
            )}
            {screenshotCountData.active_hours && (
              <div>
                <strong>Active Hours:</strong><br />
                <span style={{ color: '#8b5cf6' }}>{screenshotCountData.active_hours}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshot Count by Hour */}
      {screenshotCountData && screenshotCountData.hourly_counts ? (
        <div style={{ 
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
            📊 Hourly Screenshot Distribution
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
            {screenshotCountData.hourly_counts.map((hour, index) => (
              <div key={index} style={{
                padding: '8px',
                background: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {hour.hour || `${index}:00`}
                </div>
                <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>
                  {hour.count || hour.screenshots || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          color: theme.colors.text.secondary,
          border: '2px dashed #e9ecef',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
          <h4>No Screenshot Data Available</h4>
          <p>
            {selectedEmployee 
              ? `No screenshot data found for ${selectedEmployee.display_name || selectedEmployee.email}`
              : 'Please select an employee to view screenshot monitoring data'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ScreensTab;