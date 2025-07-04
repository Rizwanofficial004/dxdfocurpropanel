// Updated: DashboardCards.js with smooth animation using styled-components
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  padding: 10px 0;
`;

const Card = styled.div`
  background-color: ${props => props.theme.colors.surface || '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.theme.colors.border || '#f1f5f9'};
  animation: ${fadeInUp} 0.4s ease both;

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Icon = styled.div`
  background-color: ${props => props.theme.colors.primary || '#6d28d9'}20;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${props => props.theme.colors.primary || '#6d28d9'};
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: 500;
  margin-bottom: 4px;
`;

const Number = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin: 4px 0;
`;

const Change = styled.div`
  font-size: 12px;
  margin-top: 4px;
  transition: color 0.3s ease;
  color: ${props => {
    if (props.type === 'positive') return '#10b981';
    if (props.type === 'negative') return '#ef4444';
    return props.theme.colors.text.secondary || '#6b7280';
  }};
`;

export const Cards = () => {
  const { t } = useLanguage();

  const statsData = [
    {
      icon: "👤",
      title: t('totalEmployee'),
      number: "313",
      change: `↑ 10% ${t('thanLastYear')}`,
      changeType: "positive"
    },
    {
      icon: "🏖️",
      title: t('onLeaveEmployee'),
      number: "55",
      change: `↑ 2.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    },
    {
      icon: "⚙️",
      title: t('totalProject'),
      number: "313",
      change: `↑ 5.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    },
    {
      icon: "✅",
      title: t('completeProject'),
      number: "150",
      change: `↓ 5.5% ${t('thanLastMonth')}`,
      changeType: "negative"
    },
    {
      icon: "👥",
      title: t('totalClient'),
      number: "151",
      change: `↑ 2.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    },
    {
      icon: "📈",
      title: t('totalRevenue'),
      number: "$55",
      change: `↑ 2.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    },
    {
      icon: "💼",
      title: t('totalJobs'),
      number: "55",
      change: `↑ 2.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    },
    {
      icon: "🎫",
      title: t('totalTicket'),
      number: "55",
      change: `↑ 2.15% ${t('thanLastMonth')}`,
      changeType: "positive"
    }
  ];

  return (
    <CardWrapper>
      {statsData.map((stat, index) => (
        <Card key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          <Icon>{stat.icon}</Icon>
          <Info>
            <Title>{stat.title}</Title>
            <Number>{stat.number}</Number>
            <Change type={stat.changeType}>{stat.change}</Change>
          </Info>
        </Card>
      ))}
    </CardWrapper>
  );
};

export default Cards;
