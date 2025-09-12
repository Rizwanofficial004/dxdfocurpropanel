import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

// Styled Components
const SidebarContainer = styled.aside`
  width: ${props => props.$isCollapsed ? '60px' : '240px'};
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 150;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${props => props.theme.colors.border};
  box-shadow: none;
  background: transparent;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const LogoSection = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: ${props => props.$isCollapsed ? 'none' : 'flex'};
  align-items: center;
  gap: 8px;
  background: transparent;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.colors.primary};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const LogoText = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  display: ${props => props.$isCollapsed ? 'none' : 'inline'};
`;

const Navigation = styled.nav`
  padding: 0;
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0;
`;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${props => props.$isCollapsed ? '0' : '12px'};
  padding: ${props => props.$isCollapsed ? '12px 0' : '12px 20px'};
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  background: ${props => props.$isActive ? 
    (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : 
    'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-radius: 0;

  &:hover {
    background: ${props => props.$isActive ? 
      (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff') : 
      props.theme.colors.hover};
    color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.primary};
  }

  &:focus {
    outline: none;
  }
`;

const IconWrapper = styled.span`
  font-size: 14px;
  width: ${props => props.$isCollapsed ? 'auto' : '18px'};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ArrowIcon = styled.span`
  margin-left: auto;
  font-size: 10px;
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.light};
  transform: ${props => props.$isRotated ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease, color 0.3s ease;
  display: ${props => props.$isCollapsed ? 'none' : 'inline'};
`;

const SubMenuContainer = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  background: ${props => props.theme.colors.background};
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
`;

const SubMenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SubMenuItem = styled.li`
  margin-bottom: 0;
`;

const SubMenuLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 10px 50px;
  background: ${props => props.$isActive ? 
    (props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#e0f2fe') : 
    'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.success : props.theme.colors.text.secondary};
  border: none;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-radius: 0;

  &:hover {
    background: ${props => props.$isActive ? 
      (props.theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.15)' : '#e0f2fe') : 
      props.theme.colors.hover};
    color: ${props => props.$isActive ? props.theme.colors.success : props.theme.colors.text.primary};
  }

  &:focus {
    outline: none;
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: ${props => props.$isCollapsed ? 'column' : 'row'};
  align-items: ${props => props.$isCollapsed ? 'stretch' : 'center'};
  gap: ${props => props.$isCollapsed ? '4px' : '6px'};
  padding: ${props => props.$isCollapsed ? '6px' : '8px'};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.mode === 'dark' ? '#1d232c' : 'transparent'};
  margin-top: auto;
`;

const BottomItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: ${props => props.$isCollapsed ? '2px' : '8px'};
  cursor: pointer;
  padding: ${props => props.$isCollapsed ? '4px 4px' : '6px'};
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.theme.colors.hover};
  }

  &:last-of-type {
    margin-bottom: ${props => props.$isCollapsed ? '2px' : '6px'};
  }
`;

const BottomIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
`;

const BottomText = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  line-height: 1.2;
  display: ${props => props.$isCollapsed ? 'none' : 'inline'};
`;

const VersionText = styled.div`
  text-align: center;
  font-size: 10px;
  color: ${props => props.theme.colors.text.light};
  margin-top: 8px;
  font-weight: 400;
`;

export const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openDropdowns, setOpenDropdowns] = useState({});
  // isCollapsed is provided as prop (defaults to false)

  const toggleDropdown = (label) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navigationItems = [
    { icon: "📊", label: t('dashboard').toUpperCase(), path: "/dashboard", isActive: true },
    { icon: "🛰️", label: t('liveTracking').toUpperCase(), path: "/dashboard/live-tracking" },
    { icon: "👁️", label: t('quickView').toUpperCase(), path: "/dashboard/quick-view" },
    { 
      icon: "📈", 
      label: t('reports').toUpperCase(), 
      path: "/dashboard/reports", 
      hasArrow: true,
      subItems: [
        { label: t('employeeReports').toUpperCase(), path: "/dashboard/reports/employee" },
        { label: t('activityPattern').toUpperCase(), path: "/dashboard/reports/activity-pattern" },
        { label: t('advancedReport').toUpperCase(), path: "/dashboard/reports/advanced" },
        { label: t('timeLogSummary').toUpperCase(), path: "/dashboard/reports/time-log" },
        { label: t('dormantEmployees').toUpperCase(), path: "/dashboard/reports/dormant" },
        { label: t('highIdleHours').toUpperCase(), path: "/dashboard/reports/idle" },
        { label: t('clientAppActivity').toUpperCase(), path: "/dashboard/reports/client-activity" },
        { label: t('otReport').toUpperCase(), path: "/dashboard/reports/overtime" },
      ]
    },
    { icon: "🌐", label: t('site').toUpperCase(), path: "/dashboard/site", hasArrow: true },
    { icon: "📋", label: t('taskManagement').toUpperCase(), path: "/dashboard/task-management", hasArrow: true },
    { icon: "📅", label: t('attendance').toUpperCase(), path: "/dashboard/attendence", hasArrow: true },
    { icon: "👥", label: t('employees').toUpperCase(), path: "/dashboard/employees" },
    { icon: "🏢", label: t('teams').toUpperCase(), path: "/dashboard/teams" },
    { icon: "💼", label: t('jobs').toUpperCase(), path: "/dashboard/jobs", hasArrow: true, badge: "BETA" },
    { 
      icon: "⚙️", 
      label: t('settings').toUpperCase(), 
      path: "/dashboard/settings", 
      hasArrow: true,
      subItems: [
        { label: t('styleSettings').toUpperCase(), path: "/dashboard/settings/style" },
        { label: t('credentialsSettings').toUpperCase(), path: "/dashboard/settings/credentials" },
      ]
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <LogoSection>
        <LogoIcon>F</LogoIcon>
        <LogoText $isCollapsed={isCollapsed}>FOCUS</LogoText>
      </LogoSection>

      <Navigation>
        <NavList>
          {navigationItems.map((item, index) => (
            <NavItem key={index}>
              <NavLink
                $isActive={location.pathname === item.path}
                $isCollapsed={isCollapsed}
                title={isCollapsed ? item.label : undefined}
                onClick={() => {
                  if (isCollapsed) {
                    // When collapsed, always navigate on click (no dropdowns)
                    handleNavigation(item.path);
                    return;
                  }

                  if (item.subItems) {
                    toggleDropdown(item.label);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <IconWrapper $isCollapsed={isCollapsed}>{item.icon}</IconWrapper>
                {!isCollapsed && item.label}
                {!isCollapsed && item.badge && (
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: '9px',
                    padding: '2px 5px',
                    borderRadius: '8px',
                    marginLeft: 'auto',
                    marginRight: item.hasArrow ? '5px' : '0',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.hasArrow && (
                  <ArrowIcon $isActive={openDropdowns[item.label]} $isRotated={item.subItems && openDropdowns[item.label]} $isCollapsed={isCollapsed}>▶</ArrowIcon>
                )}
              </NavLink>
              
              {/* Dropdown Submenu */}
              {item.subItems && (
                <SubMenuContainer $isOpen={openDropdowns[item.label]} $isCollapsed={isCollapsed}>
                  {item.subItems.map((subItem, subIndex) => (
                    <SubMenuLink
                      key={subIndex}
                      onClick={() => handleNavigation(subItem.path)}
                      $isActive={location.pathname === subItem.path}
                    >
                      {subItem.label}
                    </SubMenuLink>
                  ))}
                </SubMenuContainer>
              )}
            </NavItem>
          ))}
        </NavList>
      </Navigation>

      <BottomSection $isCollapsed={isCollapsed}>
        <BottomItem style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon>💬</BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('liveChat')}</BottomText>
        </BottomItem>
        
        <BottomItem onClick={() => window.open('https://wa.me/905488612323', '_blank') } style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon>📞</BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('scheduleCall')}</BottomText>
        </BottomItem>
        
        <BottomItem onClick={() => window.open('https://drive.google.com/drive/folders/1MVYaOcSkV97iNxzMFJm8dtLeJ2R03NcJ?usp=drive_link', '_blank') } style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon>📱</BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('downloadClientApp')}</BottomText>
        </BottomItem>
        
        {/* <VersionText>V 4.0.2</VersionText> */}
      </BottomSection>
    </SidebarContainer>
  );
};