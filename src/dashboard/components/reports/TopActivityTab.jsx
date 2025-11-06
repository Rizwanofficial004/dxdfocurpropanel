import React from 'react';
import styled from 'styled-components';

const TopActivityContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
`;

const TopActivityHeader = styled.div`
  margin-bottom: 20px;
`;

const TopActivityTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme.colors.text.primary};
  font-size: 18px;
  font-weight: 600;
`;

const TopActivityContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const WorkTimeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const WorkTimeStats = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WorkTimeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const WorkTimeLabel = styled.div`
  min-width: 80px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.color};
`;

const WorkTimeBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
`;

const WorkTimeProgress = styled.div`
  height: 100%;
  background: ${props => props.color};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const WorkTimeValue = styled.div`
  min-width: 60px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
`;

const WorkTimePercentage = styled.div`
  min-width: 40px;
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  text-align: right;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 30px;
`;

const UserName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const UserDuration = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 4px;
`;

const ApplicationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
`;

const ApplicationCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const AppIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const AppName = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
  font-weight: 500;
`;

const AppDuration = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
`;

const TopActivityTab = ({ theme }) => {
  // Sample data
  const workTimeData = [
    { label: 'IDLE', value: '0h 6m', percentage: 1.82, color: '#6b7280' },
    { label: 'MEETING', value: '0h 20m', percentage: 6.19, color: '#3b82f6' },
    { label: 'BREAKS', value: '0h 54m', percentage: 16.14, color: '#f97316' },
    { label: 'Active hours', value: '4h 30m', percentage: 82.04, color: '#10b981' },
  ];

  const applicationData = [
    { name: 'Google-chrome', duration: '3h 25m', percentage: '98%', color: '#4285f4' },
    { name: 'Wine', duration: '0h 15m', percentage: '22%', color: '#8b5cf6' },
    { name: 'firefox', duration: '0h 3m', percentage: '3%', color: '#ff7139' },
    { name: 'Google-chrome-s', duration: '0h 1m', percentage: '2%', color: '#4285f4' },
    { name: 'libreoffice-calc', duration: '0h 1m', percentage: '1%', color: '#0369a1' },
  ];

  return (
    <TopActivityContainer theme={theme}>
      <TopActivityHeader theme={theme}>
        <TopActivityTitle theme={theme}>Work Time</TopActivityTitle>
      </TopActivityHeader>
      <TopActivityContent theme={theme}>
        <WorkTimeSection>
          <WorkTimeStats>
            {workTimeData.map((item, index) => (
              <WorkTimeItem key={index}>
                <WorkTimeLabel theme={theme} color={item.color}>
                  {item.label}
                </WorkTimeLabel>
                <span style={{ fontSize: '12px', minWidth: '20px' }}>{index + 1}</span>
                <WorkTimeBar theme={theme}>
                  <WorkTimeProgress color={item.color} percentage={item.percentage} />
                </WorkTimeBar>
                <WorkTimeValue theme={theme}>{item.value}</WorkTimeValue>
                <WorkTimePercentage theme={theme}>{item.percentage}%</WorkTimePercentage>
              </WorkTimeItem>
            ))}
          </WorkTimeStats>
          <UserInfo theme={theme}>
            <UserName theme={theme}>ABAA</UserName>
            <UserDuration theme={theme}>(5h 30m)</UserDuration>
          </UserInfo>
        </WorkTimeSection>
        
        <ApplicationsGrid>
          {applicationData.map((app, index) => (
            <ApplicationCard key={index} theme={theme}>
              <AppIcon color={app.color}>
                {app.percentage}
              </AppIcon>
              <AppName theme={theme}>{app.name}</AppName>
              <AppDuration theme={theme}>{app.duration}</AppDuration>
            </ApplicationCard>
          ))}
        </ApplicationsGrid>
      </TopActivityContent>
    </TopActivityContainer>
  );
};

export default TopActivityTab;