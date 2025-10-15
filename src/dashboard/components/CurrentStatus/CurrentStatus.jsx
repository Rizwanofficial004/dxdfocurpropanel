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
  
  [data-theme="dark"] & {
    color: #f8fafc;
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

  useEffect(() => {
    fetchStaffStatus();
    fetchIdleTimeData();
  }, []);

  // Fetch idle time data for all users
  const fetchIdleTimeData = async () => {
    try {
      setIdleTimeLoading(true);
      const data = await idleTimeService.fetchAllUsersIdleTime();
      setIdleTimeData(data);
      console.log('🕐 Loaded idle time data for', data.length, 'users');
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
      const response = await axios.get('/api/Staff/Details/');
      
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
    return idleTimeService.formatIdleTime(idleTimeService.calculateTotalIdleTime(idleTimeData));
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
      <CurrentStatusTitle>{t('currentStatus') || 'CURRENT STATUS'}</CurrentStatusTitle>
      
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
    </CurrentStatusContainer>
  );
};

export default CurrentStatus;
