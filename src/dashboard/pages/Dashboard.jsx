import React from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChartsSection } from '../components/charts/ChartsSection';
import { Container } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';
import { Cards } from '../components/card/StatsCards';
import ActivityStream from '../components/activity/ActivityStream';
import FocusTimeline from '../components/foucstimeline/FocusTimeline';
import AnnouncementTable from '../components/announcement/Announcement';
// Import global slider styles
import '../styles/globalSliders.css';

const DashboardContainer = styled.div`
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
`;


const ContentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Dashboard = () => {
  const { theme } = useTheme();

  return (
    <DashboardLayout>
      <DashboardContainer theme={theme}>
        <Container>
          {/* For Cards  */}
          <ContentSection theme={theme}>
            <Cards />
          </ContentSection>
          {/* For Activity Stream */}
          <ContentSection theme={theme}>
            <ActivityStream />
          </ContentSection>
        {/* For FocusTimeline  */}
            <ContentSection theme={theme}>
            <FocusTimeline />
          </ContentSection>

           {/* For Announcement Table  */}
          <ContentSection theme={theme}>
            <AnnouncementTable />
          </ContentSection>
        </Container>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default Dashboard;
