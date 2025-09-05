import React from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import Chatbot from '../chatbot/Chatbot';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: ${props => props.theme.typography.fontFamily};
  position: relative;
`;

const LayoutBody = styled.div`
  display: flex;
  flex: 1;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-x: hidden;
  background: transparent;
  min-height: calc(100vh - 80px);
  position: relative;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
`;

export const DashboardLayout = ({ children, headerTitle, headerBreadcrumb }) => {
  return (
    <LayoutContainer>
      <Header title={headerTitle} breadcrumb={headerBreadcrumb} />
      <LayoutBody>
        <Sidebar />
        <MainContent>
          {children}
          <Chatbot />
        </MainContent>
      </LayoutBody>
    </LayoutContainer>
  );
};
