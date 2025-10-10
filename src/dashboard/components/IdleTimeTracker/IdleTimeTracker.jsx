import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { getApiBaseURL } from '../../../config/api';
import { API_CONFIG } from '../../../config/apiConfig';
import axios from 'axios';

// Styled Components
const IdleTimeContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  
  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #334155;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  }
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  letter-spacing: 0.05em;
  
  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #e5e7eb;
  }

  [data-theme="dark"] & {
    background: #334155;
    border-color: #475569;
    
    &:hover {
      background: #475569;
      border-color: #64748b;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  
  [data-theme="dark"] & {
    color: #f1f5f9;
  }
`;

const UserEmail = styled.span`
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  
  [data-theme="dark"] & {
    color: #94a3b8;
  }
`;

const IdleTime = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const IdleTimeValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  
  [data-theme="dark"] & {
    color: #fca5a5;
  }
`;

const IdleTimeLabel = styled.span`
  font-size: 10px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  [data-theme="dark"] & {
    color: #9ca3af;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
  
  [data-theme="dark"] & {
    color: #9ca3af;
  }
`;

const ErrorState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  
  [data-theme="dark"] & {
    background: #451a1a;
    color: #fca5a5;
  }
`;

const RefreshButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 16px;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  [data-theme="dark"] & {
    background: #1d4ed8;
    
    &:hover {
      background: #1e40af;
    }
  }
`;

const Summary = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  
  [data-theme="dark"] & {
    background: #0c4a6e;
    border-color: #0284c7;
  }
`;

const SummaryText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #0369a1;
  font-weight: 500;
  
  [data-theme="dark"] & {
    color: #7dd3fc;
  }
`;

const IdleTimeTracker = () => {
  const { t } = useLanguage();
  const [idleTimeData, setIdleTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIdleTimeData();
  }, []);

  const fetchIdleTimeData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = `${getApiBaseURL()}${API_CONFIG.ENDPOINTS.IDLE_TIME}`;
      console.log('🕐 Fetching idle time data from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🕐 Idle Time API Response:', response.data);
      
      if (response.data && response.data.status === 'success') {
        setIdleTimeData(response.data.data || []);
      } else {
        console.warn('⚠️ Idle time API returned unexpected format:', response.data);
        setIdleTimeData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching idle time data:', error);
      setError(`Failed to fetch idle time data: ${error.message}`);
      setIdleTimeData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatIdleTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const getTotalIdleTime = () => {
    // First try to get total from API summary (more accurate)
    const summaryTotal = idleTimeService.getTotalIdleTimeFromSummary();
    if (summaryTotal > 0) {
      return summaryTotal;
    }
    
    // Fallback to calculating from individual users
    return idleTimeData.reduce((total, user) => total + (user.idle_time_minutes || 0), 0);
  };

  const getAverageIdleTime = () => {
    const summary = idleTimeService.getLastSummary();
    if (summary && summary.average_idle_per_user_minutes) {
      return summary.average_idle_per_user_minutes;
    }
    
    // Fallback calculation
    if (idleTimeData.length === 0) return 0;
    return Math.round(getTotalIdleTime() / idleTimeData.length);
  };

  if (loading) {
    return (
      <IdleTimeContainer>
        <Title>{t('idleTimeTracker') || 'User Idle Time Tracker'}</Title>
        <LoadingState>Loading idle time data...</LoadingState>
      </IdleTimeContainer>
    );
  }

  if (error) {
    return (
      <IdleTimeContainer>
        <Title>{t('idleTimeTracker') || 'User Idle Time Tracker'}</Title>
        <ErrorState>{error}</ErrorState>
        <RefreshButton onClick={fetchIdleTimeData}>
          {t('retry') || 'Retry'}
        </RefreshButton>
      </IdleTimeContainer>
    );
  }

  return (
    <IdleTimeContainer>
      <Title>{t('idleTimeTracker') || 'User Idle Time Tracker'}</Title>
      
      <RefreshButton onClick={fetchIdleTimeData} disabled={loading}>
        {loading ? 'Refreshing...' : (t('refresh') || 'Refresh')}
      </RefreshButton>

      {idleTimeData.length > 0 && (
        <Summary>
          <SummaryText>
            Total Idle Time: {formatIdleTime(getTotalIdleTime())} | 
            Average: {formatIdleTime(getAverageIdleTime())} | 
            Users: {(() => {
              const summary = idleTimeService.getLastSummary();
              return summary?.total_users_analyzed || idleTimeData.length;
            })()} |
            Sessions: {(() => {
              const summary = idleTimeService.getLastSummary();
              return summary?.total_timesheets_processed || 'N/A';
            })()}
          </SummaryText>
        </Summary>
      )}

      {idleTimeData.length === 0 ? (
        <LoadingState>No idle time data available</LoadingState>
      ) : (
        <UserList>
          {idleTimeData
            .sort((a, b) => (b.idle_time_minutes || 0) - (a.idle_time_minutes || 0))
            .map((user, index) => (
            <UserItem key={user.email || user.staff_id || index}>
              <UserInfo>
                <UserName>{user.display_name || user.name || user.email}</UserName>
                <UserEmail>
                  {user.email}
                  {user.staff_id && ` • ID: ${user.staff_id}`}
                  {user.total_sessions && ` • ${user.total_sessions} sessions`}
                </UserEmail>
              </UserInfo>
              <IdleTime>
                <IdleTimeValue>
                  {formatIdleTime(user.idle_time_minutes || 0)}
                </IdleTimeValue>
                <IdleTimeLabel>
                  {user.idle_session_count || user.auto_pause_count ? 
                    `${user.idle_session_count || 0} idle + ${user.auto_pause_count || 0} pause` : 
                    'Idle Time'
                  }
                </IdleTimeLabel>
              </IdleTime>
            </UserItem>
          ))}
        </UserList>
      )}
    </IdleTimeContainer>
  );
};

export default IdleTimeTracker;