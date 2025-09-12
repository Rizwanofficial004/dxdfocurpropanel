import React, { useState } from 'react';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';
import { useTheme } from '../../context/ThemeContext';

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
  margin-left: ${props => props.isSidebarCollapsed ? '60px' : '240px'};
  margin-right: ${props => props.isRightSidebarExpanded ? '280px' : '60px'};
  transition: margin-left 0.3s ease, margin-right 0.3s ease;
`;

const HeaderBorderExtension = styled.div`
  position: absolute;
  top: 60px; /* Approximate height of the header */
  left: ${props => props.isSidebarCollapsed ? '60px' : '240px'};
  width: ${props => props.isSidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)'};
  height: 1px;
  background-color: ${props => props.theme.colors.border};
  z-index: 100; /* Slightly lower than header's z-index (101) */
  transition: left 0.3s ease, width 0.3s ease;
`;

export const DashboardLayout = ({ children, headerTitle, headerBreadcrumb }) => {
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme } = useTheme(); // Use theme to access colors

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  return (
    <LayoutContainer theme={theme}>
      <Header title={headerTitle} breadcrumb={headerBreadcrumb} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <HeaderBorderExtension isSidebarCollapsed={isSidebarCollapsed} theme={theme} />
      <LayoutBody>
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <MainContent 
          isRightSidebarExpanded={isRightSidebarExpanded}
          isSidebarCollapsed={isSidebarCollapsed}
          onClick={() => isRightSidebarExpanded && setIsRightSidebarExpanded(false)}
        >
          {children}
        </MainContent>
        <RightSidebar isExpanded={isRightSidebarExpanded} setIsExpanded={setIsRightSidebarExpanded} />
      </LayoutBody>
    </LayoutContainer>
  );
};
