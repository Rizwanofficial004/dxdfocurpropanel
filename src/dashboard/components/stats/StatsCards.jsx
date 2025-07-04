import React from 'react';
import styled from 'styled-components';
import { Card, CardBody, Grid, Typography, Heading } from '../../styles/commonStyles';
import { theme } from '../../styles/theme';

const StatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(Card)`
  background: linear-gradient(135deg, ${props => props.bgColor || theme.colors.primary} 0%, ${props => props.bgColorDark || theme.colors.primary} 100%);
  color: white;
  border: none;
`;

const StatValue = styled(Typography)`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  line-height: 1;
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled(Typography)`
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.9;
  font-weight: ${theme.typography.fontWeight.medium};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: ${theme.spacing.md};
`;

export const StatsCards = () => {
  const stats = [
    {
      label: 'Total Users',
      value: '12,345',
      icon: '👥',
      bgColor: theme.colors.primary,
      bgColorDark: '#1d4ed8'
    },
    {
      label: 'Revenue',
      value: '$98,456',
      icon: '💰',
      bgColor: theme.colors.success,
      bgColorDark: '#059669'
    },
    {
      label: 'Orders',
      value: '2,567',
      icon: '📦',
      bgColor: theme.colors.warning,
      bgColorDark: '#d97706'
    },
    {
      label: 'Growth',
      value: '+24.5%',
      icon: '📈',
      bgColor: '#8b5cf6',
      bgColorDark: '#7c3aed'
    }
  ];

  return (
    <div>
      <Heading level="h3" margin={`0 0 ${theme.spacing.lg} 0`}>
        Key Metrics
      </Heading>
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} bgColor={stat.bgColor} bgColorDark={stat.bgColorDark}>
            <CardBody>
              <StatIcon>{stat.icon}</StatIcon>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </CardBody>
          </StatCard>
        ))}
      </StatsGrid>
    </div>
  );
};
