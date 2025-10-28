import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';

const OldScreenshots = () => {
  const { t, translations } = useLanguage();
  const [currentDate] = useState(new Date());
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    setScreenshots([
      {
        id: 1,
        user_name: 'John Doe',
        timestamp: new Date().toISOString(),
        screenshot_url: null,
        application: 'Chrome Browser'
      },
      {
        id: 2,
        user_name: 'Jane Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        screenshot_url: null,
        application: 'VS Code'
      },
      {
        id: 3,
        user_name: 'Mike Johnson',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        screenshot_url: null,
        application: 'Slack'
      },
      {
        id: 4,
        user_name: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        screenshot_url: null,
        application: 'Adobe Photoshop'
      }
    ]);
  }, []);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = currentDate.getDate();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isToday: day === today,
        hasActivity: Math.random() > 0.7 // Random activity indicator
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <DashboardLayout>
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            📷 {t('oldScreenshotsHeader')}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            opacity: 0.9
          }}>
            {t('oldScreenshotsSubheader')}
          </p>
        </div>

        {/* Main Content Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '20px',
          height: 'calc(100vh - 200px)'
        }}>
          {/* Left Sidebar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{
              marginBottom: '15px',
              fontSize: '1.2rem'
            }}>📅 {t('quickFilters')}</h3>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('year')}</label>
              <select style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333'
              }}>
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('month')}</label>
              <select style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#333'
              }}>
                <option>September</option>
                <option>August</option>
                <option>July</option>
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>{t('userSearch')}</label>
              <input 
                type="text" 
                placeholder={t('searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#333'
                }}
              />
            </div>
            <div style={{
              padding: '15px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
              <div style={{ fontSize: '0.9rem' }}>{t('liveStatistics')}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '5px' }}>{screenshots.length}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{t('screenshotsToday')}</div>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'auto'
          }}>
            <h3 style={{
              marginBottom: '20px',
              fontSize: '1.3rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📸 {t('liveActivityFeed')}
              <span style={{
                background: '#10b981',
                color: 'white',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>{t('live')}</span>
            </h3>

            {/* Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              marginBottom: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '15px',
              borderRadius: '8px'
            }}>
              {translations.calendarDays.map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '8px',
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  {day}
                </div>
              ))}
              {calendarDays.map((dayObj, i) => (
                <div key={i} style={{
                  background: dayObj.isToday ? '#10b981' : 
                             dayObj.hasActivity ? 'rgba(16, 185, 129, 0.3)' : 
                             'rgba(255, 255, 255, 0.1)',
                  color: dayObj.isToday ? 'white' : 'inherit',
                  padding: '10px',
                  borderRadius: '6px',
                  textAlign: 'center',
                  cursor: dayObj.day ? 'pointer' : 'default',
                  border: dayObj.isToday ? '2px solid #059669' : '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: dayObj.isToday ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  opacity: dayObj.day ? 1 : 0.3
                }}>
                  {dayObj.day || ''}
                </div>
              ))}
            </div>

            {/* Screenshots Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {screenshots.map((screenshot) => (
                <div key={screenshot.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                >
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    height: '120px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    border: '2px dashed rgba(255, 255, 255, 0.3)'
                  }}>
                    📱
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    marginBottom: '5px', 
                    fontWeight: 'bold' 
                  }}>
                    {screenshot.user_name}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7,
                    marginBottom: '8px' 
                  }}>
                    {formatTimestamp(screenshot.timestamp)}
                  </div>
                  {screenshot.application && (
                    <div style={{
                      fontSize: '0.7rem',
                      background: 'rgba(16, 185, 129, 0.8)',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}>
                      {screenshot.application}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {screenshots.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                opacity: 0.7
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📷</div>
                <div>{t('noScreenshots')}</div>
                <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                  {t('screenshotsWillAppear')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OldScreenshots;
