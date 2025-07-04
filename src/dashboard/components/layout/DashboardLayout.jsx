import React from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: ${props => props.theme.typography.fontFamily};
`;

const LayoutBody = styled.div`
  display: flex;
  flex: 1;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-x: hidden;
  background: ${props => props.theme.colors.background};
  min-height: calc(100vh - 80px);
`;

export const DashboardLayout = ({ children, headerTitle, headerBreadcrumb }) => {
  return (
    <LayoutContainer>
      <Header title={headerTitle} breadcrumb={headerBreadcrumb} />
      <LayoutBody>
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </LayoutBody>
    </LayoutContainer>
  );
};
