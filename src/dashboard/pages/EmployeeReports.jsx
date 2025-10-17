import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Container,
  LayoutWrapper,
  TimelineSection,
  TimelineHeader,
  TimelineTitle,
  TimelineList,
  TimelineItem,
  TimelineTime,
  TimelineDot,
  TimelineLine,
  TimelineContent,
  TimelineDuration,
  TimelineApp,
  TimelineDescription,
  ShareSection,
  ShareHeader,
  ShareTitle,
  ExportButton,
  ShareStats,
  StatBox,
  StatNumber,
  StatLabel,
  ShareTable,
  TableHeader,
  TableRow,
  TableCell,
  SortIcon,
  ActivityLink
} from './EmployeeReports.styles';

const EmployeeReports = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Sample timeline data
  const timelineData = [
    { time: '3:41 PM', duration: '0m 8s', app: 'Wine', description: 'Save' },
    { time: '3:39 PM', duration: '1m 52s', app: 'Wine', description: 'PhotoScape' },
    { time: '3:39 PM', duration: '0m 16s', app: 'Google-chrome', description: 'Edit Reports | FocusRO Documentation - Google Chrome' },
    { time: '3:39 PM', duration: '0m 3s', app: 'Google-chrome-stable', description: 'Save File' },
    { time: '3:39 PM', duration: '0m 11s', app: 'Google-chrome', description: 'Edit Reports | FocusRO Documentation - Google Chrome' },
    { time: '3:38 PM', duration: '0m 26s', app: 'Wine', description: 'PhotoScape' },
    { time: '3:38 PM', duration: '0m 32s', app: 'Google-chrome', description: 'Edit Reports | FocusRO Documentation - Google Chrome' },
  ];

  // Sample activity data
  const activityData = [
    { switches: 846, duration: '3h 11m 58s', activity: 'Google-chrome', type: 'app' },
    { switches: 1, duration: '0h 20m 26s', activity: 'MEETING', type: 'meeting' },
    { switches: 24, duration: '0h 11m 11s', activity: 'Wine', type: 'app' },
    { switches: 3, duration: '0h 2m 32s', activity: 'firefox', type: 'app' },
    { switches: 2, duration: '0h 1m 33s', activity: 'libreoffice-calc', type: 'app' },
    { switches: 18, duration: '0h 1m 5s', activity: 'Google-chrome-stable', type: 'app' },
    { switches: 3, duration: '0h 0m 32s', activity: 'Gnome-control-center', type: 'app' },
  ];

  const totalSwitches = activityData.reduce((sum, item) => sum + item.switches, 0);
  
  // Calculate total duration
  const calculateTotalDuration = () => {
    let totalSeconds = 0;
    activityData.forEach(item => {
      const match = item.duration.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
      if (match) {
        totalSeconds += parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]);
      }
    });
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
    // Implement CSV export logic
  };

  return (
    <DashboardLayout headerTitle="Employee Reports" headerBreadcrumb="Reports / Employee Reports">
      <Container theme={theme}>
        <LayoutWrapper>
          {/* Left Side - Timeline */}
          <TimelineSection theme={theme}>
            <TimelineHeader>
              <TimelineTitle theme={theme}>FOCUS TIMELINE</TimelineTitle>
            </TimelineHeader>
            
            <TimelineList>
              {timelineData.map((item, index) => (
                <TimelineItem key={index}>
                  <TimelineTime theme={theme}>{item.time}</TimelineTime>
                  <TimelineDot theme={theme} />
                  {index < timelineData.length - 1 && <TimelineLine theme={theme} />}
                  <TimelineContent>
                    <TimelineDuration theme={theme}>{item.duration}</TimelineDuration>
                    <TimelineApp theme={theme}>{item.app}</TimelineApp>
                    <TimelineDescription theme={theme}>{item.description}</TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </TimelineList>
          </TimelineSection>

          {/* Right Side - Focus Share */}
          <ShareSection theme={theme}>
            <ShareHeader>
              <ShareTitle theme={theme}>Focus Share</ShareTitle>
              <ExportButton theme={theme} onClick={handleExportCSV}>
                EXPORT CSV
              </ExportButton>
            </ShareHeader>

            <ShareStats theme={theme}>
              <StatBox theme={theme}>
                <StatNumber theme={theme}>{totalSwitches}</StatNumber>
                <StatLabel theme={theme}>Switches</StatLabel>
              </StatBox>
              <StatBox theme={theme}>
                <StatNumber theme={theme} $isDuration>{calculateTotalDuration()}</StatNumber>
                <StatLabel theme={theme}>Duration</StatLabel>
              </StatBox>
            </ShareStats>

            <ShareTable>
              <thead>
                <TableRow $isHeader theme={theme}>
                  <TableHeader theme={theme}>
                    Switches <SortIcon>⬍</SortIcon>
                  </TableHeader>
                  <TableHeader theme={theme}>
                    Duration <SortIcon>⬍</SortIcon>
                  </TableHeader>
                  <TableHeader theme={theme}>Activity</TableHeader>
                </TableRow>
              </thead>
              <tbody>
                {activityData.map((item, index) => (
                  <TableRow key={index} theme={theme}>
                    <TableCell theme={theme}>{item.switches}</TableCell>
                    <TableCell theme={theme}>{item.duration}</TableCell>
                    <TableCell theme={theme}>
                      {item.type === 'meeting' ? (
                        <ActivityLink theme={theme} $isMeeting>{item.activity}</ActivityLink>
                      ) : (
                        <ActivityLink theme={theme}>{item.activity}</ActivityLink>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </ShareTable>
          </ShareSection>
        </LayoutWrapper>
      </Container>
    </DashboardLayout>
  );
};

export default EmployeeReports;
