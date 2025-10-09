import React from 'react';
import styled from 'styled-components';

const FocusTimeline = ({ activities = [] }) => {
  // Sample data structure - replace with actual data from props
  const timelineData = activities.length > 0 ? activities : [
    { time: '3:41 PM', duration: '0m 8s', app: 'Wine', detail: 'Save' },
    { time: '3:39 PM', duration: '1m 52s', app: 'Wine', detail: 'PhotoScape' },
    { time: '3:39 PM', duration: '0m 16s', app: 'Google-chrome', detail: 'Edit Reports | FocusRO Documentation - Google Chrome' },
    { time: '3:39 PM', duration: '0m 3s', app: 'Google-chrome-stable', detail: 'Save File' },
    { time: '3:39 PM', duration: '0m 11s', app: 'Google-chrome', detail: 'Edit Reports | FocusRO Documentation - Google Chrome' },
    { time: '3:38 PM', duration: '0m 26s', app: 'Wine', detail: 'PhotoScape' },
    { time: '3:38 PM', duration: '0m 32s', app: 'Google-chrome', detail: 'Edit Reports | FocusRO Documentation - Google Chrome' },
  ];

  return (
    <TimelineContainer>
      <TimelineHeader>FOCUS TIMELINE</TimelineHeader>
      <TimelineList>
        {timelineData.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineMarker>
              <RadioButton />
              {index < timelineData.length - 1 && <TimelineLine />}
            </TimelineMarker>
            <TimelineContent>
              <TimelineTime>{item.time}</TimelineTime>
              <TimelineDuration>{item.duration}</TimelineDuration>
              <TimelineApp>{item.app}</TimelineApp>
              <TimelineDetail>{item.detail}</TimelineDetail>
            </TimelineContent>
          </TimelineItem>
        ))}
      </TimelineList>
    </TimelineContainer>
  );
};

// Styled Components
const TimelineContainer = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.mode === 'dark' ? '#ef4444' : '#dc2626'};
  border-radius: 8px;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const TimelineHeader = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 20px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimelineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 16px;
  position: relative;
`;

const TimelineMarker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 4px;
`;

const RadioButton = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid #3b82f6;
  background: ${props => props.theme.colors.cardBackground};
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #3b82f6;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const TimelineLine = styled.div`
  width: 2px;
  flex: 1;
  background: ${props => props.theme.colors.border};
  margin-top: 4px;
  min-height: 60px;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-bottom: 24px;
`;

const TimelineTime = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const TimelineDuration = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 6px;
`;

const TimelineApp = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
`;

const TimelineDetail = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.4;
`;

export default FocusTimeline;
