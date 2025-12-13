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
  margin-bottom: 2px;
  position: relative;
  padding: 12px 8px;
  background: ${props => props.theme.colors.background || '#f8fafc'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  gap: 2px;
`;

const TimeLabel = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  position: relative;
  flex: 1;
  text-align: center;
  padding: 6px 4px;
  border-radius: 6px;
  background: transparent;
  transition: all 0.2s ease;
  min-width: 0;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: ${props => props.theme.colors.border};
    opacity: 0.4;
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary ? props.theme.colors.primary + '20' : '#3b82f620'};
    transform: translateY(-2px);
  }
  
  &:first-child {
    text-align: left;
    padding-left: 0;
  }
  
  &:last-child {
    text-align: right;
    padding-right: 0;
    
    &::after {
      display: none;
    }
  }
`;

const TimelineBar = styled.div`
  position: relative;
  height: 48px;
  background: ${props => props.theme.colors.background};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const HourDivider = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${props => props.left}%;
  width: 1px;
  background: ${props => props.theme.colors.border};
  opacity: 0.3;
  pointer-events: none;
  z-index: 1;
`;

const ActivitySegment = styled.div`
  position: absolute;
  height: 100%;
  left: ${props => props.left}%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0;
  
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

const SummaryContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  margin-bottom: 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const SummaryCard = styled.div`
  flex: 1;
  min-width: 140px;
  background: ${props => props.bgColor || props.theme.colors.background};
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor || props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color || props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SummaryIcon = styled.span`
  font-size: 16px;
  opacity: 0.8;
`;

const ActivityPatternTab = ({ 
  theme, 
  selectedEmployee,
  selectedYear,
  selectedMonth,
  selectedDate,
  months,
  activityPatternData,
  isLoadingReportData
}) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Activity type colors
  const activityColors = {
    active: '#60a5fa',      // Light blue
    meeting: '#fb923c',     // Orange
    idle: '#86efac'         // Light green
  };

  // Activity type labels
  const activityLabels = {
    active: 'Active',
    meeting: 'Meeting',
    idle: 'Idle'
  };

  // Generate time labels from 0 AM to 11 PM (all 24 hours)
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let hour = 0; hour <= 23; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      labels.push(`${displayHour} ${period}`);
    }
    return labels;
  }, []);

  // Calculate total minutes in the day (24 hours = 1440 minutes)
  const totalMinutes = 24 * 60; // 1440 minutes
  const startHour = 0;

  // Format minutes to duration string
  const formatDuration = (minutes) => {
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  // Format decimal hours to "Xh Ym" format
  const formatHours = (decimalHours) => {
    if (!decimalHours || decimalHours === 0) return '0h 0m';
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  // Process API data into activity segments
  const activities = useMemo(() => {
    if (!activityPatternData?.hourly_pattern || !Array.isArray(activityPatternData.hourly_pattern)) {
      return [];
    }

    const segments = [];
    
    activityPatternData.hourly_pattern.forEach((hourData) => {
      const hour = hourData.hour;
      const hourStartMinutes = hour * 60; // Start of hour in minutes from midnight
      
      // Calculate the total activity minutes for this hour
      const totalActivityMinutes = hourData.total_minutes || 0;
      
      // If there's no activity, skip this hour
      if (totalActivityMinutes <= 0) {
        return;
      }
      
      // Scale factor: if total_minutes > 60, we need to scale down proportionally
      // Otherwise, use the actual minutes
      const maxMinutesInHour = 60;
      const scaleFactor = totalActivityMinutes > maxMinutesInHour ? maxMinutesInHour / totalActivityMinutes : 1;
      
      let currentOffset = 0; // Track offset within the hour for sequential segments
      
      // Process active minutes (first priority)
      if (hourData.active_minutes > 0) {
        const scaledActiveMinutes = hourData.active_minutes * scaleFactor;
        const activeStart = currentOffset;
        const activeEnd = currentOffset + scaledActiveMinutes;
        segments.push({
          type: 'active',
          hour,
          start: hourStartMinutes + activeStart,
          end: hourStartMinutes + activeEnd,
          minutes: hourData.active_minutes,
          duration: formatDuration(hourData.active_minutes)
        });
        currentOffset = activeEnd;
      }
      
      // Process meeting minutes (second priority)
      if (hourData.meeting_minutes > 0) {
        const scaledMeetingMinutes = hourData.meeting_minutes * scaleFactor;
        const meetingStart = currentOffset;
        const meetingEnd = currentOffset + scaledMeetingMinutes;
        segments.push({
          type: 'meeting',
          hour,
          start: hourStartMinutes + meetingStart,
          end: hourStartMinutes + meetingEnd,
          minutes: hourData.meeting_minutes,
          duration: formatDuration(hourData.meeting_minutes)
        });
        currentOffset = meetingEnd;
      }
      
      // Process idle minutes (third priority)
      if (hourData.idle_minutes > 0) {
        const scaledIdleMinutes = hourData.idle_minutes * scaleFactor;
        const idleStart = currentOffset;
        const idleEnd = currentOffset + scaledIdleMinutes;
        segments.push({
          type: 'idle',
          hour,
          start: hourStartMinutes + idleStart,
          end: hourStartMinutes + idleEnd,
          minutes: hourData.idle_minutes,
          duration: formatDuration(hourData.idle_minutes)
        });
        currentOffset = idleEnd;
      }
    });

    return segments;
  }, [activityPatternData]);

  // Process activities into segments for rendering
  const activitySegments = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    return activities.map((activity, index) => {
      const startMinutes = activity.start;
      const endMinutes = activity.end;
      const duration = endMinutes - startMinutes;
      
      const left = (startMinutes / totalMinutes) * 100;
      const width = (duration / totalMinutes) * 100;

      // Calculate start and end times for display
      const startHour = Math.floor(startMinutes / 60);
      const startMin = Math.round(startMinutes % 60);
      const startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      
      const endHour = Math.floor(endMinutes / 60);
      const endMin = Math.round(endMinutes % 60);
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      return {
        ...activity,
        left,
        width,
        color: activityColors[activity.type] || activityColors.active,
        label: activityLabels[activity.type] || 'Active',
        start: startTime,
        end: endTime,
        isFirst: index === 0,
        isLast: index === activities.length - 1
      };
    });
  }, [activities]);

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

  // Show loading state
  if (isLoadingReportData) {
    return (
      <ActivityPatternContainer theme={theme}>
        <EmptyState theme={theme}>
          Loading activity pattern data...
        </EmptyState>
      </ActivityPatternContainer>
    );
  }

  if (!selectedDate) {
    return (
      <ActivityPatternContainer theme={theme}>
        <EmptyState theme={theme}>
          Please select a date to view activity pattern
        </EmptyState>
      </ActivityPatternContainer>
    );
  }

  // Show empty state if no data
  if (!activityPatternData || !activityPatternData.hourly_pattern || activitySegments.length === 0) {
    return (
      <ActivityPatternContainer theme={theme}>
        <ActivityPatternHeader>
          <ActivityPatternTitle theme={theme}>Activity Pattern</ActivityPatternTitle>
          <DateLabel theme={theme}>{displayDate}</DateLabel>
        </ActivityPatternHeader>
        <EmptyState theme={theme}>
          No activity data available for this date
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

        {activityPatternData?.summary && (
          <SummaryContainer theme={theme}>
            <SummaryCard 
              theme={theme}
              bgColor="#eff6ff"
              borderColor="#60a5fa"
            >
              <SummaryLabel theme={theme}>Active</SummaryLabel>
              <SummaryValue theme={theme} color="#60a5fa">
                <SummaryIcon>⚡</SummaryIcon>
                {formatHours(activityPatternData.summary.total_active_hours)}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard 
              theme={theme}
              bgColor="#fff7ed"
              borderColor="#fb923c"
            >
              <SummaryLabel theme={theme}>Meeting</SummaryLabel>
              <SummaryValue theme={theme} color="#fb923c">
                <SummaryIcon>👥</SummaryIcon>
                {formatHours(activityPatternData.summary.total_meeting_hours)}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard 
              theme={theme}
              bgColor="#f0fdf4"
              borderColor="#86efac"
            >
              <SummaryLabel theme={theme}>Idle</SummaryLabel>
              <SummaryValue theme={theme} color="#22c55e">
                <SummaryIcon>😴</SummaryIcon>
                {formatHours(activityPatternData.summary.total_idle_hours)}
              </SummaryValue>
            </SummaryCard>

            <SummaryCard 
              theme={theme}
              bgColor="#f8fafc"
              borderColor="#94a3b8"
            >
              <SummaryLabel theme={theme}>Total Work</SummaryLabel>
              <SummaryValue theme={theme} color="#475569">
                <SummaryIcon>⏱️</SummaryIcon>
                {formatHours(activityPatternData.summary.total_work_hours)}
              </SummaryValue>
            </SummaryCard>
          </SummaryContainer>
        )}

        <TimeAxis theme={theme}>
          {timeLabels.map((label, index) => (
            <TimeLabel key={index} theme={theme}>
              {label}
            </TimeLabel>
          ))}
        </TimeAxis>

        <TimelineBar theme={theme}>
          {/* Hour divider lines */}
          {Array.from({ length: 23 }, (_, i) => {
            const hourPosition = ((i + 1) / 24) * 100;
            return (
              <HourDivider
                key={`divider-${i}`}
                theme={theme}
                left={hourPosition}
              />
            );
          })}
          
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