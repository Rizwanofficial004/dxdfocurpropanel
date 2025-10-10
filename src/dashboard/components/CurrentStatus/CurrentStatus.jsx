import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { getApiBaseURL } from '../../../config/api';
import { API_CONFIG } from '../../../config/apiConfig';
import { idleTimeService } from '../../../services/idleTimeService';
import axios from 'axios';

// Styled Components
const CurrentStatusContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: auto;
  
  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
`;

const CurrentStatusTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  [data-theme="dark"] & {
    border-color: #6b7280;
    color: #9ca3af;
    
    &:hover {
      background: #374151;
      border-color: #d1d5db;
    }
  }
`;

const CurrentStatusContent = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const StatusListContainer = styled.div`
  flex: 1;
`;

const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusCount = styled.span`
  font-size: 16px;
  font-weight: 600;
  min-width: 12px;
  color: ${props => props.color};
`;

const StatusLabel = styled.span`
  font-size: 14px;
  color: #374151;
  font-weight: 400;
  
  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const IdleTimeInfo = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 400;

  [data-theme="dark"] & {
    color: #9ca3af;
  }
`;

const TotalIdleTimeDisplay = styled.div`
  background: linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%);
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  [data-theme="dark"] & {
    background: linear-gradient(135deg, #451a1a 0%, #451a03 100%);
    border-color: #d97706;
  }
`;

const TotalIdleLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  
  [data-theme="dark"] & {
    color: #fbbf24;
  }
`;

const TotalIdleValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #dc2626;
  
  [data-theme="dark"] & {
    color: #fca5a5;
  }
`;

const StatusArrow = styled.div`
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  svg {
    width: 12px;
    height: 12px;
  }
  
  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircularChart = styled.svg`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
`;

const ChartCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ChartNumber = styled.span`
  font-size: 48px;
  font-weight: 800;
  color: #1f2937;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1;

  [data-theme="dark"] & {
    color: #ffffff;
  }
`;

const ChartLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;

  [data-theme="dark"] & {
    color: #9ca3af;
  }
`;

const CurrentStatus = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState({
    atWork: 0,
    inMeeting: 0,
    atBreak: 0,
    idle: 0,
    off: 0
  });
  const [idleTimeData, setIdleTimeData] = useState([]);
  const [idleTimeLoading, setIdleTimeLoading] = useState(false);
  const [lastIdleTimeUpdate, setLastIdleTimeUpdate] = useState(null);

  useEffect(() => {
    fetchStaffStatus();
    fetchIdleTimeData();
    
    // Set up auto-refresh for idle time every 2 minutes
    const interval = setInterval(() => {
      fetchIdleTimeData();
    }, 120000); // 2 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Fetch idle time data for all users
  const fetchIdleTimeData = async () => {
    try {
      setIdleTimeLoading(true);
      const data = await idleTimeService.fetchAllUsersIdleTime();
      setIdleTimeData(data);
      setLastIdleTimeUpdate(new Date());
      console.log('🕐 Loaded idle time data for', data.length, 'users');
      console.log('🕐 Total idle time:', idleTimeService.formatIdleTime(idleTimeService.calculateTotalIdleTime(data)));
    } catch (error) {
      console.error('❌ Error fetching idle time data:', error);
      setIdleTimeData([]);
    } finally {
      setIdleTimeLoading(false);
    }
  };

  const fetchStaffStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/Staff/Details/');
      
      console.log('📊 Staff API Response:', response.data);
      
      if (response.data && response.data.status === 'success' && response.data.data) {
        const summary = response.data.data.summary;
        const staffList = response.data.data.staff || [];
        
        if (summary) {
          // Count active employees (those who are both active and logged in)
          const activeEmployees = staffList.filter(staff => 
            staff.active === true && staff.raw_data?.is_logged_in === "1"
          ).length;
          
          const idleEmployees = staffList.filter(staff => 
            staff.active === true && staff.raw_data?.is_logged_in !== "1"
          ).length;
          
          const offEmployees = staffList.filter(staff => 
            staff.active === false
          ).length;

          console.log('📊 Status Breakdown:');
          console.log('  At Work (Active + Logged In):', activeEmployees);
          console.log('  Idle (Active but not logged in):', idleEmployees);
          console.log('  OFF (Inactive):', offEmployees);
          
          setStatusData({
            atWork: activeEmployees,
            inMeeting: 0,
            atBreak: 0,
            idle: idleEmployees,
            off: offEmployees
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching staff status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get total idle time across all users
  const getTotalIdleTime = () => {
    // First try to get total from API summary (more accurate)
    const summaryTotal = idleTimeService.getTotalIdleTimeFromSummary();
    if (summaryTotal > 0) {
      return idleTimeService.formatIdleTime(summaryTotal);
    }
    
    // Fallback to calculating from individual users
    return idleTimeService.formatIdleTime(idleTimeService.calculateTotalIdleTime(idleTimeData));
  };

  // Get additional summary information
  const getSummaryInfo = () => {
    const summary = idleTimeService.getLastSummary();
    if (summary) {
      return {
        totalUsers: summary.total_users_analyzed || 0,
        averageIdlePerUser: summary.average_idle_per_user_minutes || 0,
        totalTimesheets: summary.total_timesheets_processed || 0
      };
    }
    return null;
  };

  // Helper function to get idle time for a specific user
  const getUserIdleTime = (userEmail) => {
    const userIdleData = idleTimeData.find(user => user.email === userEmail);
    return userIdleData ? userIdleData.idle_time_minutes || 0 : 0;
  };

  const statusArray = [
    { id: 1, label: t('atWork') || 'At Work', count: statusData.atWork, color: '#10b981' },
    { id: 2, label: t('inMeeting') || 'In Meeting', count: statusData.inMeeting, color: '#3b82f6' },
    { id: 3, label: t('atBreak') || 'At Break', count: statusData.atBreak, color: '#f59e0b' },
    { 
      id: 4, 
      label: t('idle') || 'Idle', 
      count: statusData.idle, 
      color: '#6b7280',
      hasIdleTime: idleTimeData.length > 0,
      idleTimeLoading: idleTimeLoading
    },
    { id: 5, label: t('off') || 'OFF', count: statusData.off, color: '#ef4444' }
  ];

  const totalCount = statusArray.reduce((sum, item) => sum + item.count, 0);

  return (
    <CurrentStatusContainer>
      <CurrentStatusTitle>
        <span>{t('currentStatus') || 'CURRENT STATUS'}</span>
        <RefreshButton 
          onClick={() => {
            fetchStaffStatus();
            fetchIdleTimeData();
          }}
          disabled={loading || idleTimeLoading}
        >
          {(loading || idleTimeLoading) ? '⟳' : '↻'} Refresh
        </RefreshButton>
      </CurrentStatusTitle>
      
      <CurrentStatusContent>
        <StatusListContainer>
          <StatusList>
            {statusArray.map((item) => (
              <StatusItem key={item.id}>
                <StatusInfo>
                  <StatusCount color={item.color}>
                    {loading ? '...' : item.count}
                  </StatusCount>
                  <div>
                    <StatusLabel>{item.label}</StatusLabel>
                    {item.id === 4 && (
                      <IdleTimeInfo>
                        {idleTimeLoading ? 
                          'Loading idle time...' : 
                          idleTimeData.length > 0 ? 
                            `Total: ${getTotalIdleTime()}` : 
                            'No idle time data'
                        }
                      </IdleTimeInfo>
                    )}
                  </div>
                </StatusInfo>
                <StatusArrow>
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </StatusArrow>
              </StatusItem>
            ))}
          </StatusList>
        </StatusListContainer>
        
        <ChartContainer>
          <CircularChart viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="60"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
            />
            
            {/* Generate segments for each status */}
            {!loading && (() => {
              const radius = 60;
              const circumference = 2 * Math.PI * radius;
              let currentOffset = 0;
              
              return statusArray.map((item, index) => {
                if (item.count === 0) return null;
                
                const percentage = (item.count / totalCount) * 100;
                const dashLength = (percentage / 100) * circumference;
                const dashOffset = currentOffset;
                
                currentOffset += dashLength;
                
                return (
                  <circle
                    key={item.id}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={-dashOffset}
                    style={{
                      transition: 'all 0.6s ease-in-out',
                      filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                );
              });
            })()}
          </CircularChart>
          <ChartCenter>
            <ChartNumber>{loading ? '...' : totalCount}</ChartNumber>
            <ChartLabel>Total</ChartLabel>
          </ChartCenter>
        </ChartContainer>
      </CurrentStatusContent>
      
      {/* Total Idle Time Display */}
      {idleTimeData.length > 0 && (
        <TotalIdleTimeDisplay>
          <div>
            <TotalIdleLabel>🕐 Total Company Idle Time</TotalIdleLabel>
            <div style={{ 
              fontSize: '11px', 
              color: '#6b7280', 
              marginTop: '2px',
              opacity: 0.8 
            }}>
              {(() => {
                const summary = getSummaryInfo();
                if (summary) {
                  return `${summary.totalUsers} users analyzed • Avg: ${idleTimeService.formatIdleTime(summary.averageIdlePerUser)} per user`;
                }
                return lastIdleTimeUpdate ? `Last updated: ${lastIdleTimeUpdate.toLocaleTimeString()}` : 'Loading...';
              })()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <TotalIdleValue>
              {idleTimeLoading ? 'Loading...' : getTotalIdleTime()}
            </TotalIdleValue>
            {lastIdleTimeUpdate && (
              <div style={{ 
                fontSize: '9px', 
                color: '#6b7280', 
                marginTop: '2px',
                opacity: 0.7 
              }}>
                Updated: {lastIdleTimeUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </TotalIdleTimeDisplay>
      )}
    </CurrentStatusContainer>
  );
};

export default CurrentStatus;
