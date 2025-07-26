// Updated: StatsCards.jsx with 3D effects and GSAP animations
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { gsap } from 'gsap';
import { useLanguage } from '../../context/LanguageContext';

// 3D Animation Keyframes
const cardEntrance = keyframes`
  0% {
    transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-300px);
    opacity: 0;
    scale: 0.6;
  }
  50% {
    transform: perspective(1000px) rotateX(45deg) rotateY(20deg) translateZ(-100px);
    opacity: 0.7;
    scale: 0.8;
  }
  100% {
    transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px);
    opacity: 1;
    scale: 1;
  }
`;

const cardFloat = keyframes`
  0%, 100% {
    transform: perspective(1000px) translateY(0px) rotateX(0deg);
  }
  50% {
    transform: perspective(1000px) translateY(-8px) rotateX(2deg);
  }
`;

const cardPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(109, 40, 217, 0.3);
  }
  50% {
    box-shadow: 0 0 0 20px rgba(109, 40, 217, 0);
  }
`;

const iconRotate = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const numberCounter = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  perspective: 1000px;
  transform-style: preserve-3d;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  min-height: 200px;
  
  // 3D Glass Morphism Effect
  backdrop-filter: blur(20px);
  background: ${props => `linear-gradient(135deg, 
    ${props.theme.colors.surface || '#ffffff'}95, 
    ${props.theme.colors.surface || '#ffffff'}85)`
  };
  border: 1px solid ${props => `${props.theme.colors.border || '#f1f5f9'}50`};
  
  // Dynamic border color based on card type
  ${props => props.color && css`
    border-left: 4px solid ${props.color};
  `}
  
  // 3D Box Shadow with multiple layers
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1);
  
  // Smooth transitions for all transformations
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 3D Hover Effects
  &:hover {
    transform: perspective(1000px) translateY(-12px) rotateX(8deg) rotateY(5deg) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.15),
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 2px 0 rgba(255, 255, 255, 0.4),
      inset 0 -2px 0 rgba(255, 255, 255, 0.2);
  }
  
  // Active/Click state
  &:active {
    transform: perspective(1000px) translateY(-8px) rotateX(4deg) rotateY(2deg) scale(0.98);
  }
  
  // Shimmer effect on hover
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  // Floating animation
  animation: ${css`${cardFloat} 6s ease-in-out infinite`};
  animation-delay: ${props => props.index * 0.2}s;
  
  // Entrance animation
  opacity: 0;
  transform: perspective(1000px) rotateX(90deg) rotateY(45deg) translateZ(-300px);
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
  padding: 0.5rem;
  background: ${props => `linear-gradient(135deg, 
    ${props.theme.colors.background || '#f8fafc'}50, 
    ${props.theme.colors.background || '#f8fafc'}30)`
  };
  border-radius: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border || '#f1f5f9'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  background: ${props => `linear-gradient(135deg, 
    ${props.color || props.theme.colors.primary || '#6d28d9'}20, 
    ${props.color || props.theme.colors.primary || '#6d28d9'}10)`
  };
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.color || props.theme.colors.primary || '#6d28d9'};
  position: relative;
  transform-style: preserve-3d;
  
  // 3D Icon Effects
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  border: 1px solid ${props => `${props.color || props.theme.colors.primary || '#6d28d9'}30`};
  
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  // Hover rotation effect
  &:hover {
    transform: perspective(500px) rotateY(180deg) rotateX(10deg);
    box-shadow: 
      0 12px 30px rgba(0, 0, 0, 0.15),
      inset 0 3px 6px rgba(255, 255, 255, 0.4);
  }
  
  // Pulse animation for positive changes
  ${props => props.changeType === 'positive' && css`
    animation: ${cardPulse} 3s infinite;
  `}
  
  // Icon rotation animation
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, transparent, ${props => props.color || props.theme.colors.primary || '#6d28d9'}40, transparent);
    animation: ${css`${iconRotate} 8s linear infinite`};
    z-index: -1;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  transform-style: preserve-3d;
`;

const Title = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  
  // 3D Text effect
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);
  
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary || '#6d28d9'};
    text-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.15),
      0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const Number = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin: 0.5rem 0;
  position: relative;
  
  // 3D Number effect
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.text.primary || '#111827'}, 
    ${props => props.theme.colors.text.secondary || '#6b7280'}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 0, 0, 0.05);
  
  transition: all 0.4s ease;
  
  &:hover {
    transform: perspective(500px) rotateX(10deg) scale(1.05);
    text-shadow: 
      3px 3px 6px rgba(0, 0, 0, 0.15),
      0 0 30px rgba(0, 0, 0, 0.1);
  }
  
  // Counter animation
  animation: ${css`${numberCounter} 2s ease-out`};
`;

const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
  position: relative;
  
  // 3D Badge effect
  background: ${props => props.type === 'positive' ? 
    'linear-gradient(135deg, #10b98120, #10b98110)' : 
    'linear-gradient(135deg, #ef444420, #ef444410)'
  };
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  border: 1px solid ${props => props.type === 'positive' ? '#10b98130' : '#ef444430'};
  
  backdrop-filter: blur(10px);
  
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  transition: all 0.3s ease;
  color: ${props => {
    if (props.type === 'positive') return '#10b981';
    if (props.type === 'negative') return '#ef4444';
    return props.theme.colors.text.secondary || '#6b7280';
  }};
  
  &:hover {
    transform: perspective(300px) rotateX(5deg) translateZ(10px);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.12),
      inset 0 2px 0 rgba(255, 255, 255, 0.3);
  }
  
  // Shimmer effect for positive changes
  ${props => props.type === 'positive' && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(16, 185, 129, 0.3),
        transparent
      );
      transition: left 0.6s ease;
      border-radius: 1rem;
    }
    
    &:hover::before {
      animation: ${shimmer} 1s ease-in-out;
    }
  `}
`;

export const Cards = () => {
  const { t } = useLanguage();
  const cardsRef = useRef([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState(0);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch comprehensive database data
        const comprehensiveResponse = await fetch('http://127.0.0.1:8000/api/database/comprehensive/?format=detailed&include_ai_analysis=true');
        const comprehensiveData = await comprehensiveResponse.json();
        
        // Fetch users count
        const usersResponse = await fetch('http://127.0.0.1:8000/api/dashboard/analytics/employees/?include_list=true');
        const usersData = await usersResponse.json();
        
        if (comprehensiveData.success) {
          const stats = comprehensiveData.statistics;
          
          // Set users count
          setUsersCount(usersData.data?.length || 0);
          
          // Create stats data array
          const newStatsData = [
            {
              icon: "👥",
              title: t('totalUsers') || 'Total Users',
              number: usersData.data?.length || 0,
              change: `↑ ${((usersData.data?.length || 0) / 100 * 5).toFixed(1)}% ${t('thanLastMonth') || 'than last month'}`,
              changeType: "positive",
              color: "#3b82f6" // Blue
            },
            {
              icon: "📊",
              title: t('totalProjects') || 'Total Projects',
              number: stats.projects?.total_projects || 0,
              subStats: [
                { label: 'In Progress', value: stats.projects?.in_progress_projects || 0 },
                { label: 'Finished', value: stats.projects?.finished_projects || 0 },
                { label: 'On Hold', value: stats.projects?.on_hold_projects || 0 },
                { label: 'Cancelled', value: stats.projects?.cancelled_projects || 0 }
              ],
              change: `↑ 5.15% ${t('thanLastMonth') || 'than last month'}`,
              changeType: "positive",
              color: "#10b981" // Green
            },
            {
              icon: "✅",
              title: t('totalTasks') || 'Total Tasks',
              number: stats.tasks?.total_tasks || 0,
              subStats: [
                { label: 'Not Started', value: stats.tasks?.not_started_tasks || 0 },
                { label: 'In Progress', value: stats.tasks?.in_progress_tasks || 0 },
                { label: 'Completed', value: stats.tasks?.completed_tasks || 0 }
              ],
              change: `↑ 8.2% ${t('thanLastMonth') || 'than last month'}`,
              changeType: "positive",
              color: "#f59e0b" // Orange
            },
            {
              icon: "🏢",
              title: t('totalClients') || 'Total Clients',
              number: stats.clients?.total_clients || 0,
              subStats: [
                { label: 'Active', value: stats.clients?.active_clients || 0 },
                { label: 'Inactive', value: (stats.clients?.total_clients || 0) - (stats.clients?.active_clients || 0) }
              ],
              change: `↑ 12.5% ${t('thanLastMonth') || 'than last month'}`,
              changeType: "positive",
              color: "#8b5cf6" // Purple
            },
            {
              icon: "💰",
              title: t('totalInvoices') || 'Total Invoices',
              number: stats.invoices?.total_invoices || 0,
              subStats: [
                { label: 'Total Paid', value: `$${parseFloat(stats.invoices?.total_paid || 0).toLocaleString()}` },
                { label: 'Overdue', value: `$${parseFloat(stats.invoices?.total_overdue || 0).toLocaleString()}` },
                { label: 'Total Invoiced', value: `$${parseFloat(stats.invoices?.total_invoiced || 0).toLocaleString()}` }
              ],
              change: `↑ 15.3% ${t('thanLastMonth') || 'than last month'}`,
              changeType: "positive",
              color: "#ef4444" // Red
            }
          ];
          
          setStatsData(newStatsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback data in case of error
        setStatsData([
          {
            icon: "👥",
            title: 'Total Users',
            number: "Loading...",
            change: "Fetching data...",
            changeType: "neutral"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  useEffect(() => {
    if (!loading && statsData.length > 0) {
      // GSAP entrance animation for cards
      gsap.set(cardsRef.current, {
        opacity: 0,
        rotationX: 90,
        rotationY: 45,
        z: -300,
        scale: 0.8
      });

      gsap.to(cardsRef.current, {
        opacity: 1,
        rotationX: 0,
        rotationY: 0,
        z: 0,
        scale: 1,
        duration: 1.2,
        ease: "back.out(1.7)",
        stagger: 0.2,
        delay: 0.3
      });

      // Hover animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              rotationX: 8,
              rotationY: 5,
              y: -12,
              scale: 1.02,
              duration: 0.4,
              ease: "power2.out"
            });
          });

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              rotationX: 0,
              rotationY: 0,
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "power2.out"
            });
          });
        }
      });
    }
  }, [loading, statsData]);

  if (loading) {
    return (
      <CardWrapper>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <Card key={index} index={index}>
            <Icon>⏳</Icon>
            <Info>
              <Title>Loading...</Title>
              <Number>...</Number>
              <Change type="neutral">Fetching data...</Change>
            </Info>
          </Card>
        ))}
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      {statsData.map((stat, index) => (
        <Card 
          key={index} 
          index={index}
          color={stat.color}
          ref={el => cardsRef.current[index] = el}
        >
          <CardHeader>
            <Icon changeType={stat.changeType} color={stat.color}>
              {stat.icon}
            </Icon>
            <Info>
              <Title>{stat.title}</Title>
              <Number>{stat.number}</Number>
              <Change type={stat.changeType}>{stat.change}</Change>
            </Info>
          </CardHeader>
          
          {stat.subStats && (
            <SubStats>
              {stat.subStats.map((subStat, subIndex) => (
                <SubStat key={subIndex}>
                  <SubStatLabel>{subStat.label}</SubStatLabel>
                  <SubStatValue>{subStat.value}</SubStatValue>
                </SubStat>
              ))}
            </SubStats>
          )}
        </Card>
      ))}
    </CardWrapper>
  );
};

export default Cards;
