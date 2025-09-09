import React from 'react';
import styled from 'styled-components';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChartsSection } from '../components/charts/ChartsSection';
import { Container } from '../styles/commonStyles';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { lightTheme } from '../../styles/theme';
import { Cards } from '../components/card/StatsCardsCRM';
import ActivityStream from '../components/activity/ActivityStream';
import FocusTimeline from '../components/foucstimeline/FocusTimeline';
import AnnouncementTable from '../components/announcement/Announcement';
import { CurrentStatus, CompanyAverage } from '../components';
// Import global slider styles
import '../styles/globalSliders.css';

const DashboardContainer = styled.div`
  background: ${lightTheme.colors.background};
  min-height: 100vh;
  padding: ${props => props.theme.spacing.lg} 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    background-image: url('https://dash.focusro.com/assets/images/a.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 831px;
    left: 0;
    top: 0;
    width: 350px;
    z-index: 0;
    opacity: 0.3;
  }

  &::after {
    content: '';
    position: absolute;
    background-image: url('https://dash.focusro.com/assets/images/b.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    height: 850px;
    right: 0;
    bottom: -80px;
    width: 370px;
    z-index: 0;
    opacity: 0.3;
  }
`;


const ContentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
  position: relative;
  z-index: 1;
`;

const StyledContainer = styled(Container)`
  position: relative;
  z-index: 1;
`;

const DashboardComponentsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Dashboard = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <DashboardContainer theme={theme}>
        <StyledContainer>
          {/* Dashboard Status and Company Average Components */}
          <ContentSection theme={theme}>
            <DashboardComponentsGrid theme={theme}>
              <CurrentStatus />
              <CompanyAverage />
            </DashboardComponentsGrid>
          </ContentSection>

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
        </StyledContainer>
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default Dashboard;
