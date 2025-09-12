import React, { useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';

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
  margin-right: ${props => props.isRightSidebarExpanded ? '280px' : '60px'};
  transition: margin-left 0.3s ease, margin-right 0.3s ease;
`;

export const DashboardLayout = ({ children, headerTitle, headerBreadcrumb }) => {
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);

  return (
    <LayoutContainer>
      <Header title={headerTitle} breadcrumb={headerBreadcrumb} />
      <LayoutBody>
        <Sidebar />
        <MainContent isRightSidebarExpanded={isRightSidebarExpanded}>
          {children}
        </MainContent>
        <RightSidebar isExpanded={isRightSidebarExpanded} setIsExpanded={setIsRightSidebarExpanded} />
      </LayoutBody>
    </LayoutContainer>
  );
};
