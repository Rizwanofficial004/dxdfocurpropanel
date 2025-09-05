import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

// Styled Components
const SidebarContainer = styled.aside`
  width: 240px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 150;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e7eb;
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
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #2563eb;
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
  color: #1f2937;
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
  gap: 12px;
  padding: 12px 20px;
  background: ${props => props.isActive ? '#eff6ff' : 'transparent'};
  color: ${props => props.isActive ? '#2563eb' : '#6b7280'};
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-radius: 0;

  &:hover {
    background: ${props => props.isActive ? '#eff6ff' : '#f9fafb'};
    color: ${props => props.isActive ? '#2563eb' : '#374151'};
  }

  &:focus {
    outline: none;
  }
`;

const IconWrapper = styled.span`
  font-size: 14px;
  width: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ArrowIcon = styled.span`
  margin-left: auto;
  font-size: 10px;
  color: ${props => props.isActive ? '#2563eb' : '#9ca3af'};
  transform: ${props => props.isRotated ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.3s ease, color 0.3s ease;
`;

const SubMenuContainer = styled.div`
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: ${props => props.isOpen ? '500px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  background: #f8fafc;
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
  background: ${props => props.isActive ? '#e0f2fe' : 'transparent'};
  color: ${props => props.isActive ? '#0369a1' : '#64748b'};
  border: none;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  border-radius: 0;

  &:hover {
    background: ${props => props.isActive ? '#e0f2fe' : '#f1f5f9'};
    color: ${props => props.isActive ? '#0369a1' : '#334155'};
  }

  &:focus {
    outline: none;
  }
`;

const BottomSection = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  margin-top: auto;
`;

const BottomItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
  }

  &:last-of-type {
    margin-bottom: 8px;
  }
`;

const BottomIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const BottomText = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
`;

const VersionText = styled.div`
  text-align: center;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 8px;
  font-weight: 400;
`;

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (label) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navigationItems = [
    { icon: "📊", label: "DASHBOARD", path: "/dashboard", isActive: true },
    { icon: "�", label: "LIVE TRACKING", path: "/dashboard/live-tracking" },
    { icon: "👁️", label: "QUICK VIEW", path: "/dashboard/quick-view" },
    { 
      icon: "📈", 
      label: "REPORTS", 
      path: "/dashboard/reports", 
      hasArrow: true,
      subItems: [
        { label: "EMPLOYEE REPORTS", path: "/dashboard/reports/employee" },
        { label: "ACTIVITY PATTERN", path: "/dashboard/reports/activity-pattern" },
        { label: "ADVANCED REPORT", path: "/dashboard/reports/advanced" },
        { label: "TIME LOG SUMMARY", path: "/dashboard/reports/time-log" },
        { label: "DORMANT EMPLOYEES", path: "/dashboard/reports/dormant" },
        { label: "HIGH IDLE HOURS", path: "/dashboard/reports/idle" },
        { label: "CLIENT APP ACTIVITY", path: "/dashboard/reports/client-activity" },
        { label: "OT REPORT", path: "/dashboard/reports/overtime" },
      ]
    },
    { icon: "🌐", label: "SITE", path: "/dashboard/site", hasArrow: true },
    { icon: "�", label: "TASK MANAGEMENT", path: "/dashboard/task-management", hasArrow: true },
    { icon: "📅", label: "ATTENDANCE", path: "/dashboard/attendence", hasArrow: true },
    { icon: "👥", label: "EMPLOYEES", path: "/dashboard/employees" },
    { icon: "🏢", label: "TEAMS", path: "/dashboard/teams" },
    { icon: "💼", label: "JOBS", path: "/dashboard/jobs", hasArrow: true, badge: "BETA" },
    { icon: "⚙️", label: "SETTINGS", path: "/dashboard/settings", hasArrow: true },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoIcon>F</LogoIcon>
        <LogoText>FOCUS</LogoText>
      </LogoSection>

      <Navigation>
        <NavList>
          {navigationItems.map((item, index) => (
            <NavItem key={index}>
              <NavLink
                isActive={location.pathname === item.path}
                onClick={() => {
                  if (item.subItems) {
                    toggleDropdown(item.label);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <IconWrapper>{item.icon}</IconWrapper>
                {item.label}
                {item.badge && (
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
                  <ArrowIcon isActive={openDropdowns[item.label]} isRotated={item.subItems && openDropdowns[item.label]}>▶</ArrowIcon>
                )}
              </NavLink>
              
              {/* Dropdown Submenu */}
              {item.subItems && (
                <SubMenuContainer isOpen={openDropdowns[item.label]}>
                  {item.subItems.map((subItem, subIndex) => (
                    <SubMenuLink
                      key={subIndex}
                      onClick={() => handleNavigation(subItem.path)}
                      isActive={location.pathname === subItem.path}
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

      <BottomSection>
        <BottomItem>
          <BottomIcon>💬</BottomIcon>
          <BottomText>Live Chat</BottomText>
        </BottomItem>
        
        <BottomItem>
          <BottomIcon>📞</BottomIcon>
          <BottomText>Schedule a Call</BottomText>
        </BottomItem>
        
        <BottomItem>
          <BottomIcon>📱</BottomIcon>
          <BottomText>Download Client App</BottomText>
        </BottomItem>
        
        {/* <VersionText>V 4.0.2</VersionText> */}
      </BottomSection>
    </SidebarContainer>
  );
};
