// Updated: StatsCards.jsx with 3D effects and GSAP animations
import React, { useEffect, useRef } from 'react';
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  align-items: center;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  
  // 3D Glass Morphism Effect
  backdrop-filter: blur(20px);
  background: ${props => `linear-gradient(135deg, 
    ${props.theme.colors.surface || '#ffffff'}95, 
    ${props.theme.colors.surface || '#ffffff'}85)`
  };
  border: 1px solid ${props => `${props.theme.colors.border || '#f1f5f9'}50`};
  
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

const Icon = styled.div`
  background: ${props => `linear-gradient(135deg, 
    ${props.theme.colors.primary || '#6d28d9'}20, 
    ${props.theme.colors.primary || '#6d28d9'}10)`
  };
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.theme.colors.primary || '#6d28d9'};
  position: relative;
  transform-style: preserve-3d;
  
  // 3D Icon Effects
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
  border: 1px solid ${props => `${props.theme.colors.primary || '#6d28d9'}30`};
  
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
    background: conic-gradient(from 0deg, transparent, ${props => props.theme.colors.primary || '#6d28d9'}40, transparent);
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

  useEffect(() => {
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
  }, []);

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
        <Card 
          key={index} 
          index={index}
          ref={el => cardsRef.current[index] = el}
        >
          <Icon changeType={stat.changeType}>
            {stat.icon}
          </Icon>
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
