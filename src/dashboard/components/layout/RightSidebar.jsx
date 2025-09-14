import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';

// --- SVG Icons ---
const HelpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const EmployeesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const LiveTrackingIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h.01"></path>
        <path d="M7 12h.01"></path>
        <path d="M12 12h.01"></path>
        <path d="M17 12h.01"></path>
        <path d="M22 12h.01"></path>
    </svg>
);

const QuickViewIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const LicenseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.2 8.2l-5.4-5.4c-.6-.6-1.4-1-2.2-1H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10.4c0-.8-.4-1.6-1-2.2z"></path>
        <path d="M15 2v5h5"></path>
        <path d="M12 18v-6"></path>
        <path d="M15 15l-3-3-3 3"></path>
    </svg>
);

// --- Keyframes for animation ---
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

// --- Styled Components ---
const SidebarContainer = styled.aside`
  width: ${props => props.$isExpanded ? '280px' : '60px'};
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  transition: width 0.3s ease;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
  padding-top: 80px;
  box-sizing: border-box;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 10px 0;
`;

const NavItem = styled.li`
  margin-bottom: 4px;
`;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px ${props => props.$isExpanded ? '20px' : '0'};
  justify-content: ${props => props.$isExpanded ? 'flex-start' : 'center'};
  background: ${props => props.$isActive ? props.theme.colors.background : 'transparent'};
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text.secondary};
  border: none;
  font-size: 14px;
  font-weight: ${props => props.$isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  
  ${props => props.$isBlinking && css`
    animation: ${pulseAnimation} 2s infinite;
    border-radius: 4px; // To make the shadow look nice
  `}

  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.primary};
  }
`;

const IconWrapper = styled.span`
    min-width: 40px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ContentContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.background};
  display: ${props => props.$show ? 'block' : 'none'};

  p {
    font-size: 13px;
    color: ${props => props.theme.colors.text.secondary};
    line-height: 1.6;
  }

  .video-placeholder {
    width: 100%;
    height: 120px;
    background-color: ${props => props.theme.colors.border};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.colors.text.light};
    font-weight: 500;
    margin-top: 15px;
    font-size: 14px;
  }
`;

const ContentTitle = styled.h4`
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.colors.text.primary};
    margin: 0 0 10px 0;
`;

export const RightSidebar = ({ isExpanded, setIsExpanded }) => {
    const { t } = useLanguage();
    const [openItem, setOpenItem] = useState(null);

    const menuItems = [
        { id: 'how-it-works', label: t('howItWorks'), icon: <HelpIcon /> },
        { id: 'employees', label: t('employees'), icon: <EmployeesIcon />, content: t('employeesInfo'), video: true },
        { id: 'live-tracking', label: t('liveTracking'), icon: <LiveTrackingIcon />, content: t('liveTrackingInfo'), video: true },
        { id: 'quick-view', label: t('quickView'), icon: <QuickViewIcon />, content: t('quickViewInfo'), video: true },
        { id: 'claim-license', label: t('claimLicense'), icon: <LicenseIcon />, content: t('claimLicenseInfo'), video: true },
    ];

    const handleItemClick = (item) => {
        if (item.id === 'how-it-works') {
            setIsExpanded(!isExpanded);
            if(isExpanded) setOpenItem(null);
        } else {
            if (!isExpanded) {
                setIsExpanded(true);
                setOpenItem(item.id);
            } else {
                setOpenItem(openItem === item.id ? null : item.id);
            }
        }
    };

    return (
        <SidebarContainer $isExpanded={isExpanded}>
            <NavList>
                {menuItems.map(item => (
                    <NavItem key={item.id}>
                        <NavLink 
                            onClick={() => handleItemClick(item)} 
                            $isExpanded={isExpanded} 
                            $isActive={openItem === item.id}
                            $isBlinking={item.id === 'how-it-works'}
                        >
                            <IconWrapper>{item.icon}</IconWrapper>
                            {isExpanded && item.label}
                        </NavLink>
                        {isExpanded && item.content && (
                            <ContentContainer $show={openItem === item.id}>
                                <ContentTitle>{item.label}</ContentTitle>
                                <p>{item.content}</p>
                                {item.video && <div className="video-placeholder">Video Placeholder</div>}
                            </ContentContainer>
                        )}
                    </NavItem>
                ))}
            </NavList>
        </SidebarContainer>
    );
};