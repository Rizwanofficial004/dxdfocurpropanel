import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
// Styled Components
const CompanyAverageContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: fit-content;
  min-height: 330px;

  [data-theme="dark"] & {
    background: #1d232c;
    border-color: #374151;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  }
`;

const CompanyAverageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const CompanyAverageTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  letter-spacing: 0.05em;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const DateInput = styled.input`
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  min-width: 120px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  [data-theme="dark"] & {
    background: #374151;
    border-color: #6b7280;
    color: #f8fafc;
  }
`;

const CompanyAverageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MetricCard = styled.div`
  flex: 1;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;

  [data-theme="dark"] & {
     background: #0f172a;
    border-color: #0f172a;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const MetricIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => {
    switch (props.type) {
      case 'breaks': return '#fef3c7';
      case 'meetings': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'breaks': return '#d97706';
      case 'meetings': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`;

const MetricTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  letter-spacing: 0.05em;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const MetricSubtitle = styled.span`
  font-size: 9px;
  color: #6b7280;
  font-weight: 500;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const MetricStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const StatValues = styled.div`
  display: flex;
  gap: 16px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const StatValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.color};
`;

const StatLabelSmall = styled.span`
  font-size: 9px;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const WorkTimeSpreadCard = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;

  [data-theme="dark"] & {
    background: #0f172a;
    border-color: #0f172a;
  }
`;

const WorkTimeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const WorkTimeIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #d1fae5;
  color: #059669;
`;

const WorkTimeTitle = styled.h3`
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  letter-spacing: 0.05em;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const WorkTimeStats = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const WorkTimeItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
`;

const WorkTimePercentage = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.color};
`;

const WorkTimeLabel = styled.span` 
  font-size: 9px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;

  [data-theme="dark"] & {
    color: #f8fafc;
  }
`;

const CompanyAverage = () => {
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedDate, setSelectedDate] = useState('2025-09-05');

  const dailyBreaksData = {
    title: t('dailyBreaks'),
    subtitle: t('thirtyDaysAvg'),
    icon: '☕',
    stats: [
      { label: t('breaksPerDay'), value: '0', color: '#3b82f6' },
      { label: t('minutesPerBreak'), value: '0', color: '#3b82f6' }
    ],
    avgLabel: t('avg')
  };

  const meetingsData = {
    title: t('meetings'),
    subtitle: t('thirtyDaysAvg'),
    icon: '📅',
    stats: [
      { label: t('meetingsPerDay'), value: '0', color: '#3b82f6' },
      { label: t('minutesPerMeeting'), value: '0', color: '#3b82f6' }
    ],
    avgLabel: t('avg')
  };

  const workTimeSpreadData = {
    title: t('workTimeSpread'),
    categories: [
      { label: t('atWork'), percentage: '0', color: '#10b981' },
      { label: t('meetings'), percentage: '0', color: '#3b82f6' },
      { label: t('breaks'), percentage: '0', color: '#f59e0b' },
      { label: t('idle'), percentage: '0', color: '#6b7280' }
    ]
  };

  return (
    <CompanyAverageContainer>
      <CompanyAverageHeader>
        <CompanyAverageTitle>{t('companyAverage')}</CompanyAverageTitle>
        {/* <DateInput
          type="date"
          value={selectedDate}
           style={{ 
              backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc'
            }} 
          onChange={(e) => setSelectedDate(e.target.value)}
        /> */}
      </CompanyAverageHeader>

      <CompanyAverageContent>
        {/* Daily Breaks and Meetings Row */}
        <MetricRow>
          {/* Daily Breaks Section */}
          <MetricCard>
            <MetricHeader>
              <MetricIcon type="breaks">{dailyBreaksData.icon}</MetricIcon>
              <MetricTitleGroup>
                <MetricTitle>{dailyBreaksData.title}</MetricTitle>
                <MetricSubtitle>{dailyBreaksData.subtitle}</MetricSubtitle>
              </MetricTitleGroup>
            </MetricHeader>
            <MetricStats>
              <StatLabel>{dailyBreaksData.avgLabel}</StatLabel>
              <StatValues>
                {dailyBreaksData.stats.map((stat, index) => (
                  <StatItem key={index}>
                    <StatValue color={stat.color}>
                      {stat.value}
                    </StatValue>
                    <StatLabelSmall>{stat.label}</StatLabelSmall>
                  </StatItem>
                ))}
              </StatValues>
            </MetricStats>
          </MetricCard>

          {/* Meetings Section */}
          <MetricCard>
            <MetricHeader>
              <MetricIcon type="meetings">{meetingsData.icon}</MetricIcon>
              <MetricTitleGroup>
                <MetricTitle>{meetingsData.title}</MetricTitle>
                <MetricSubtitle>{meetingsData.subtitle}</MetricSubtitle>
              </MetricTitleGroup>
            </MetricHeader>
            <MetricStats>
              <StatLabel>{meetingsData.avgLabel}</StatLabel>
              <StatValues>
                {meetingsData.stats.map((stat, index) => (
                  <StatItem key={index}>
                    <StatValue color={stat.color}>
                      {stat.value}
                    </StatValue>
                    <StatLabelSmall>{stat.label}</StatLabelSmall>
                  </StatItem>
                ))}
              </StatValues>
            </MetricStats>
          </MetricCard>
        </MetricRow>

        {/* Work Time Spread Section */}
        <WorkTimeSpreadCard>
          <WorkTimeHeader>
            <WorkTimeIcon>⏰</WorkTimeIcon>
            <WorkTimeTitle>{workTimeSpreadData.title}</WorkTimeTitle>
          </WorkTimeHeader>
          <WorkTimeStats>
            {workTimeSpreadData.categories.map((category, index) => (
              <WorkTimeItem key={index}>
                <WorkTimePercentage color={category.color}>
                  {category.percentage}%
                </WorkTimePercentage>
                <WorkTimeLabel>{category.label}</WorkTimeLabel>
              </WorkTimeItem>
            ))}
          </WorkTimeStats>
        </WorkTimeSpreadCard>
      </CompanyAverageContent>
    </CompanyAverageContainer>
  );
};

export default CompanyAverage;