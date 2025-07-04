import React from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChartsSection } from '../components/charts/ChartsSection';
import { Container } from '../styles/commonStyles';
import { theme } from '../styles/theme';
import { Cards } from '../components/card/StatsCards';
import ActivityStream from '../components/activity/ActivityStream';
import FocusTimeline from '../components/foucstimeline/FocusTimeline';
import AnnouncementTable from '../components/announcement/Announcement';

const DashboardContainer = styled.div`
  background: ${theme.colors.background};
  min-height: 100vh;
  padding: ${theme.spacing.lg} 0;
`;


const ContentSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Dashboard = () => {
  return (
    <DashboardLayout>
      <DashboardContainer>
        <Container>
          {/* For Cards  */}
          <ContentSection>
            <Cards />
          </ContentSection>
          {/* For Activity Stream */}
          <ContentSection>
            <ActivityStream />
          </ContentSection>
        {/* For FocusTimeline  */}
            <ContentSection>
            <FocusTimeline />
          </ContentSection>

           {/* For Announcement Table  */}
          <ContentSection>
            <AnnouncementTable />
          </ContentSection>
        </Container>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default Dashboard;
