import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';

// Styled Components
const ActivityPatternContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 24px;
`;

const ActivityPatternHeader = styled.div`
  margin-bottom: 24px;
`;

const ActivityPatternTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  text-transform: uppercase;
  margin: 0 0 8px 0;
`;

const DateLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 20px;
`;

const TimelineWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TimelineTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
`;

const TimeAxis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  padding: 0 2px;
`;

const TimeLabel = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  position: relative;
  flex: 1;
  text-align: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 6px;
    background: ${props => props.theme.colors.border};
  }
  
  &:first-child {
    text-align: left;
  }
  
  &:last-child {
    text-align: right;
  }
`;

const TimelineBar = styled.div`
  position: relative;
  height: 48px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ActivitySegment = styled.div`
  position: absolute;
  height: 100%;
  left: ${props => props.left}%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${props => props.isFirst ? '6px 0 0 6px' : props.isLast ? '0 6px 6px 0' : '0'};
  
  &:hover {
    opacity: 0.85;
    transform: scaleY(1.05);
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.92);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 140px;
  text-align: center;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.92);
  }
  
  div {
    margin: 2px 0;
    
    &:first-child {
      margin-top: 0;
      font-size: 13px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${props => props.color};
  border: 1px solid ${props => props.theme.colors.border};
`;

const LegendLabel = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
`;

const ActivityPatternTab = ({ 
  theme, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Activity type colors
  const activityColors = {
    active: '#60a5fa',      // Light blue
    break: '#fb923c',       // Orange
    meeting: '#fb923c',     // Orange (same as break)
    idle: '#86efac',        // Light green
    offline: '#9ca3af',     // Grey
    other: '#e5e7eb'        // Very light grey
  };

  // Activity type labels
  const activityLabels = {
    active: 'Active',
    break: 'Break',
    meeting: 'Meeting',
    idle: 'Idle',
    offline: 'Offline',
    other: 'Other'
  };

  // Generate time labels from 9 AM to 8 PM
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = 9; hour <= 20; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      labels.push(`${displayHour} ${period}`);
    }
    return labels;
  }, []);

  // Calculate total minutes in the day (9 AM to 8 PM = 11 hours = 660 minutes)
  const totalMinutes = 11 * 60; // 660 minutes
  const startHour = 9;

  // Sample activity data - this should be replaced with actual API data
  // Format: { type: 'active'|'break'|'meeting'|'idle'|'offline', start: 'HH:mm', end: 'HH:mm', duration: 'Xh Ym' }
  const sampleActivities = useMemo(() => {
    if (!selectedDate) return [];

    // Generate sample data based on the image description
    return [
      // 9:00 AM - 9:15 AM: Mixed (very thin segments)
      { type: 'active', start: '09:00', end: '09:05', duration: '5m' },
      { type: 'idle', start: '09:05', end: '09:07', duration: '2m' },
      { type: 'active', start: '09:07', end: '09:10', duration: '3m' },
      // 9:15 AM - 9:45 AM: Light blue (active)
      { type: 'active', start: '09:15', end: '09:45', duration: '30m' },
      // 9:45 AM - 12:00 PM: Mixed pattern
      { type: 'active', start: '09:45', end: '10:30', duration: '45m' },
      { type: 'idle', start: '10:30', end: '10:35', duration: '5m' },
      { type: 'active', start: '10:35', end: '12:00', duration: '1h 25m' },
      // 12:00 PM - 2:00 PM: Solid light blue (active)
      { type: 'active', start: '12:00', end: '14:00', duration: '2h' },
      // 2:00 PM - 3:00 PM: Solid orange (break)
      { type: 'break', start: '14:00', end: '15:00', duration: '1h' },
      // 3:00 PM - 3:15 PM: Mixed
      { type: 'active', start: '15:00', end: '15:05', duration: '5m' },
      { type: 'idle', start: '15:05', end: '15:07', duration: '2m' },
      { type: 'active', start: '15:07', end: '15:10', duration: '3m' },
      // 3:15 PM - 4:00 PM: Light blue (active)
      { type: 'active', start: '15:15', end: '16:00', duration: '45m' },
      // 4:00 PM - 7:00 PM: Light green (idle) with mixed pattern
      { type: 'idle', start: '16:00', end: '16:30', duration: '30m' },
      { type: 'active', start: '16:30', end: '16:35', duration: '5m' },
      { type: 'idle', start: '16:35', end: '17:00', duration: '25m' },
      { type: 'active', start: '17:00', end: '17:05', duration: '5m' },
      { type: 'idle', start: '17:05', end: '19:00', duration: '1h 55m' },
      // 7:00 PM - 8:00 PM: Mixed
      { type: 'active', start: '19:00', end: '19:05', duration: '5m' },
      { type: 'idle', start: '19:05', end: '19:07', duration: '2m' },
      { type: 'active', start: '19:07', end: '19:10', duration: '3m' },
      { type: 'active', start: '19:15', end: '19:30', duration: '15m' },
      { type: 'idle', start: '19:30', end: '19:45', duration: '15m' },
      { type: 'active', start: '19:45', end: '20:00', duration: '15m' },
    ];
  }, [selectedDate]);

  // Convert time string (HH:mm) to minutes from start (9 AM = 0)
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMins = (hours - startHour) * 60 + minutes;
    return Math.max(0, Math.min(totalMinutes, totalMins));
  };

  // Process activities into segments for rendering
  const activitySegments = useMemo(() => {
    if (!sampleActivities || sampleActivities.length === 0) return [];

    return sampleActivities.map((activity, index) => {
      const startMinutes = timeToMinutes(activity.start);
      const endMinutes = timeToMinutes(activity.end);
      const duration = endMinutes - startMinutes;
      
      const left = (startMinutes / totalMinutes) * 100;
      const width = (duration / totalMinutes) * 100;

      return {
        ...activity,
        left,
        width,
        color: activityColors[activity.type] || activityColors.other,
        label: activityLabels[activity.type] || 'Other',
        isFirst: index === 0,
        isLast: index === sampleActivities.length - 1
      };
    });
  }, [sampleActivities]);

  // Format date for display
  const displayDate = useMemo(() => {
    if (!selectedDate || !selectedMonth || !selectedYear) {
      return dayjs().format('DD-MM-YYYY');
    }
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0) return dayjs().format('DD-MM-YYYY');
    
    const dateStr = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    return dayjs(dateStr).format('DD-MM-YYYY');
  }, [selectedDate, selectedMonth, selectedYear, months]);

  if (!selectedDate) {
    return (
      <ActivityPatternContainer theme={theme}>
        <EmptyState theme={theme}>
          Please select a date to view activity pattern
        </EmptyState>
      </ActivityPatternContainer>
    );
  }

  return (
    <ActivityPatternContainer theme={theme}>
      <ActivityPatternHeader>
        <ActivityPatternTitle theme={theme}>Activity Pattern</ActivityPatternTitle>
        <DateLabel theme={theme}>{displayDate}</DateLabel>
      </ActivityPatternHeader>

      <TimelineWrapper>
        <TimelineHeader>
          <TimelineTitle theme={theme}>Daily Activity Timeline</TimelineTitle>
        </TimelineHeader>

        <TimeAxis>
          {timeLabels.map((label, index) => (
            <TimeLabel key={index} theme={theme}>
              {label}
            </TimeLabel>
          ))}
        </TimeAxis>

        <TimelineBar theme={theme}>
          {activitySegments.map((segment, index) => (
            <ActivitySegment
              key={index}
              left={segment.left}
              width={segment.width}
              color={segment.color}
              isFirst={segment.isFirst}
              isLast={segment.isLast}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              {hoveredSegment === index && (
                <Tooltip>
                  <div><strong>{segment.label}</strong></div>
                  <div>{segment.start} - {segment.end}</div>
                  <div>Duration: {segment.duration}</div>
                </Tooltip>
              )}
            </ActivitySegment>
          ))}
        </TimelineBar>
      </TimelineWrapper>

      <LegendContainer theme={theme}>
        {Object.entries(activityLabels).map(([key, label]) => (
          <LegendItem key={key}>
            <LegendColor color={activityColors[key]} theme={theme} />
            <LegendLabel theme={theme}>{label}</LegendLabel>
          </LegendItem>
        ))}
      </LegendContainer>
    </ActivityPatternContainer>
  );
};

export default ActivityPatternTab;