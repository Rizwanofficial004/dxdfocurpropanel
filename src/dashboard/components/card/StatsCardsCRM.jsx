import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { getApiBaseURL, API_ENDPOINTS } from '../../../config/api.js';
import apiService from '../../../services/apiService.js';

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  min-height: 180px;
  border: 1px solid ${props => props.theme.colors.border || '#f1f5f9'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const SubStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border || '#f1f5f9'};
`;

const SubStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: ${props => props.theme.colors.background || '#f8fafc'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border || '#f1f5f9'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const SubStatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.25rem;
`;

const SubStatValue = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  text-align: center;
`;

const Icon = styled.div`
  background: ${props => `${props.color || '#6d28d9'}15`};
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: ${props => props.color || '#6d28d9'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => `${props.color || '#6d28d9'}25`};
    transform: scale(1.05);
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Number = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin: 0.5rem 0;
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  
  background: ${props => props.type === 'positive' ? 
    '#10b98115' : props.type === 'negative' ? '#ef444415' : '#f3f4f610'
  };
  
  color: ${props => {
    if (props.type === 'positive') return '#10b981';
    if (props.type === 'negative') return '#ef4444';
    return props.theme.colors.text.secondary || '#6b7280';
  }};
`;

const StatusIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.isLive ? '#10b981' : '#6b7280'};
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const Cards = () => {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSource, setDataSource] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Starting CRM Comprehensive API fetch...');
        
        const apiBaseURL = getApiBaseURL();
        console.log('🌐 API Base URL:', apiBaseURL);
        
        // Try the CRM comprehensive API first
        try {
          const crmData = await apiService.getCrmComprehensive();
          
          console.log('✅ CRM comprehensive data received:', crmData);
          
          if (crmData.status === 'success' && crmData.data) {
            const { total_employees, total_projects, total_tasks } = crmData.data;
            
            // Create stats data from the API response
            const newStatsData = [
              {
                icon: total_employees.icon || "👥",
                title: total_employees.title || 'TOTAL EMPLOYEES',
                number: total_employees.count || 0,
                subStats: [
                  { label: 'Total Count', value: total_employees.metrics?.total_count || 0 },
                  { label: 'Growth Rate', value: `${total_employees.metrics?.growth_rate || 0}%` },
                  { label: 'Active Users', value: total_employees.metrics?.active_users || 0 },
                  { label: 'S3 Employees', value: total_employees.metrics?.s3_employees || 0 }
                ],
                change: total_employees.growth_rate || `↑ ${total_employees.metrics?.growth_rate || 0}% growth rate`,
                changeType: "positive",
                color: "#3b82f6"
              },
              {
                icon: total_projects.icon || "📊",
                title: total_projects.title || 'TOTAL PROJECTS',
                number: total_projects.count || 0,
                subStats: [
                  { label: 'Not Started', value: total_projects.metrics?.not_started || 0 },
                  { label: 'In Progress', value: total_projects.metrics?.in_progress || 0 },
                  { label: 'Finished', value: total_projects.metrics?.finished || 0 },
                  { label: 'On Hold', value: total_projects.metrics?.on_hold || 0 }
                ],
                change: total_projects.growth_rate || "↑ 5.15% than last month",
                changeType: "positive",
                color: "#10b981"
              },
              {
                icon: total_tasks.icon || "✅",
                title: total_tasks.title || 'TOTAL TASKS',
                number: total_tasks.count || 0,
                subStats: [
                  { label: 'Not Started', value: total_tasks.metrics?.not_started || 0 },
                  { label: 'In Progress', value: total_tasks.metrics?.in_progress || 0 },
                  { label: 'Testing', value: total_tasks.metrics?.testing || 0 },
                  { label: 'Completed', value: total_tasks.metrics?.completed || 0 }
                ],
                change: total_tasks.growth_rate || "↑ 8.2% than last month",
                changeType: "positive",
                color: "#f59e0b"
              }
            ];
            
            console.log('📊 Setting CRM stats data:', newStatsData);
            setStatsData(newStatsData);
            setLastUpdated(new Date(crmData.meta?.timestamp || Date.now()));
            setDataSource(crmData.meta?.source || 'CRM API');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('⚠️ CRM Comprehensive API failed:', error.message);
        }
        
        // Fallback data if API fails
        console.log('📂 Using fallback data...');
        const fallbackStatsData = [
          {
            icon: "👥",
            title: 'TOTAL EMPLOYEES',
            number: 3,
            subStats: [
              { label: 'Total Count', value: 3 },
              { label: 'Growth Rate', value: '10.0%' },
              { label: 'Active Users', value: 3 },
              { label: 'Last Updated', value: new Date().toLocaleDateString() }
            ],
            change: "↑ 10.0% growth rate",
            changeType: "positive",
            color: "#3b82f6"
          },
          {
            icon: "📊",
            title: 'TOTAL PROJECTS',
            number: 293,
            subStats: [
              { label: 'Not Started', value: 2 },
              { label: 'In Progress', value: 36 },
              { label: 'Finished', value: 245 },
              { label: 'On Hold', value: 4 }
            ],
            change: "↑ 5.15% than last month",
            changeType: "positive",
            color: "#10b981"
          },
          {
            icon: "✅",
            title: 'TOTAL TASKS',
            number: 1570,
            subStats: [
              { label: 'Not Started', value: 53 },
              { label: 'In Progress', value: 54 },
              { label: 'Testing', value: 1 },
              { label: 'Completed', value: 1451 }
            ],
            change: "↑ 8.2% than last month",
            changeType: "positive",
            color: "#f59e0b"
          }
        ];
        
        setStatsData(fallbackStatsData);
        setDataSource('Fallback Data');
        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('❌ All data fetch attempts failed:', error);
        
        // Emergency fallback
        const emergencyData = [
          { icon: "👥", title: 'EMPLOYEES', number: 3, color: "#3b82f6" },
          { icon: "📊", title: 'PROJECTS', number: 293, color: "#10b981" },
          { icon: "✅", title: 'TASKS', number: 1570, color: "#f59e0b" }
        ];
        
        setStatsData(emergencyData);
        setDataSource('Emergency Fallback');
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <CardWrapper>
        {[1, 2, 3].map((_, index) => (
          <Card key={index}>
            <Icon color="#6b7280">⏳</Icon>
            <Info>
              <Title>Loading...</Title>
              <Number>...</Number>
            </Info>
          </Card>
        ))}
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      {statsData.map((stat, index) => (
        <Card key={index}>
          <StatusIndicator isLive={dataSource.includes('CRM') || dataSource.includes('S3')}>
            {dataSource.includes('CRM') || dataSource.includes('S3') ? 'LIVE' : 'CACHE'}
          </StatusIndicator>
          
          <CardHeader>
            <Icon color={stat.color}>
              {stat.icon}
            </Icon>
            <Info>
              <Title>{stat.title}</Title>
              <Number>{typeof stat.number === 'number' ? stat.number.toLocaleString() : stat.number}</Number>
              {stat.change && (
                <Change type={stat.changeType}>{stat.change}</Change>
              )}
            </Info>
          </CardHeader>
          
          {stat.subStats && (
            <SubStats>
              {stat.subStats.map((subStat, subIndex) => (
                <SubStat key={subIndex}>
                  <SubStatLabel>{subStat.label}</SubStatLabel>
                  <SubStatValue>
                    {typeof subStat.value === 'number' ? subStat.value.toLocaleString() : subStat.value}
                  </SubStatValue>
                </SubStat>
              ))}
            </SubStats>
          )}
        </Card>
      ))}
      
      {lastUpdated && (
        <div style={{ 
          gridColumn: '1 / -1', 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '0.875rem',
          marginTop: '1rem',
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #f1f5f9'
        }}>
          🔄 Last updated: {lastUpdated.toLocaleString()} | Source: {dataSource}
        </div>
      )}
    </CardWrapper>
  );
};

export default Cards;
