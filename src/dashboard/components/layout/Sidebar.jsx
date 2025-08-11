import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const SidebarContainer = styled.aside`
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.md};
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Logo = styled.h2`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Navigation = styled.nav`
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const NavList = styled.ul`
  list-style: none;
`;

const NavItem = styled.li`
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background: ${props => props.isActive ? props.theme.colors.primary + '20' : 'transparent'};
  color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text.primary};
  border: none;
  border-left: 3px solid ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.primary};
  }
`;

const IconWrapper = styled.span`
  font-size: 18px;
  width: 20px;
  display: flex;
  justify-content: center;
`;

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navigationItems = [
    {
      section: t('main'),
      items: [
        { icon: "📊", label: t('dashboard'), path: "/dashboard" },
        { icon: "📍", label: t('liveTracking'), path: "/dashboard/live-tracking" },
        { icon: "👁️", label: t('quickView'), path: "/dashboard/quick-view" },
        { icon: "📈", label: t('reports'), path: "/dashboard/reports" },
        { icon: "🌐", label: t('site'), path: "/dashboard/site" },
      ]
    },
    {
      section: t('management'),
      items: [
        { icon: "📝", label: t('taskManagement'), path: "/dashboard/task-management" },
        { icon: "📅", label: t('attendance'), path: "/dashboard/attendence" },
        { icon: "👥", label: t('employees'), path: "/dashboard/employees" },
        { icon: "🏢", label: t('teams'), path: "/dashboard/teams" },
      ]
    },
    {
      section: t('system'),
      items: [
        { icon: "⚙️", label: t('settings'), path: "/dashboard/settings" },
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Logo>
          <span>🚀</span>
          Admin Pro
        </Logo>
      </SidebarHeader>
      
      <Navigation>
        {navigationItems.map((section, sectionIndex) => (
          <NavSection key={sectionIndex}>
            <SectionTitle>{section.section}</SectionTitle>
            <NavList>
              {section.items.map((item, itemIndex) => (
                <NavItem key={itemIndex}>
                  <NavLink
                    isActive={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <IconWrapper>{item.icon}</IconWrapper>
                    {item.label}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </NavSection>
        ))}
      </Navigation>
    </SidebarContainer>
  );
};
