import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import LogoDark from '../../../assets/dxd-logo-dark.png';
import LogoLight from '../../../assets/dxd-logo-white.png';
import CollaspeLogo from '../../../assets/collaspe-logo.png';
import CollaspeLogoLight from '../../../assets/collaspe-logo-light.png';

// Logo Component
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'center'};
  width: 100%;
`;

const LogoImage = styled.img`
  height: ${props => props.$isCollapsed ? '32px' : '75px'};
  width: auto;
  object-fit: contain;
  transition: height 0.2s ease;
`;

const LogoText = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-left: 12px;
  display: ${props => props.$isCollapsed ? 'none' : 'inline'};
  letter-spacing: -0.5px;
`;

const Logo = ({ isCollapsed = false }) => {
  const { theme } = useTheme();
  
  // Select logo based on theme mode
  const logoSrc = theme.mode === 'dark' ? LogoDark : LogoLight;
  
  return (
    <LogoContainer $isCollapsed={isCollapsed}>
      <LogoImage 
        src={logoSrc} 
        alt="DXD Logo" 
        $isCollapsed={isCollapsed}
      />
      {/* <LogoText $isCollapsed={isCollapsed} theme={theme}>
        DXD
      </LogoText> */}
    </LogoContainer>
  );
};

// Sidebar Styled Components
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
  background: transparent;
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
  // background: ${props => props.theme.mode === 'dark' ? '#1d232c' : 'transparent'};
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
  // background: ${props => props.theme.colors.primary};
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

// Dashboard SVG Icon Component
const DashboardIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
  >
    <path d="M14,10V22H4a2,2,0,0,1-2-2V10Z"></path>
    <path d="M22,10V20a2,2,0,0,1-2,2H16V10Z"></path>
    <path d="M22,4V8H2V4A2,2,0,0,1,4,2H20A2,2,0,0,1,22,4Z"></path>
  </svg>
);

// Live Tracking SVG Icon Component
const LiveTrackingIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
  >
    <g>
      <path fill="none" d="M0 0h24v24H0z"/>
      <path fillRule="nonzero" d="M16 4a1 1 0 0 1 1 1v4.2l5.213-3.65a.5.5 0 0 1 .787.41v12.08a.5.5 0 0 1-.787.41L17 14.8V19a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14zM7.4 8.829a.4.4 0 0 0-.392.32L7 9.228v5.542a.4.4 0 0 0 .542.374l.073-.036 4.355-2.772a.4.4 0 0 0 .063-.624l-.063-.05L7.615 8.89A.4.4 0 0 0 7.4 8.83z"/>
    </g>
  </svg>
);

// Quick View SVG Icon Component
const QuickViewIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M18.2265 11.3805C18.3552 11.634 18.4195 11.7607 18.4195 12C18.4195 12.2393 18.3552 12.366 18.2265 12.6195C17.6001 13.8533 15.812 16.5 12 16.5C8.18799 16.5 6.39992 13.8533 5.77348 12.6195C5.64481 12.366 5.58048 12.2393 5.58048 12C5.58048 11.7607 5.64481 11.634 5.77348 11.3805C6.39992 10.1467 8.18799 7.5 12 7.5C15.812 7.5 17.6001 10.1467 18.2265 11.3805Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 4H17.2C18.9913 4 19.887 4 20.4435 4.5565C21 5.11299 21 6.00866 21 7.8V8M17 20H17.2C18.9913 20 19.887 20 20.4435 19.4435C21 18.887 21 17.9913 21 16.2V16M7 4H6.8C5.00866 4 4.11299 4 3.5565 4.5565C3 5.11299 3 6.00866 3 7.8V8M7 20H6.8C5.00866 20 4.11299 20 3.5565 19.4435C3 18.887 3 17.9913 3 16.2V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Employees SVG Icon Component
const EmployeesIcon = () => (
  <svg 
    fill="currentColor" 
    width="16" 
    height="16" 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 21.416c-5.035 0.022-9.243 3.537-10.326 8.247l-0.014 0.072c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c0.825-3.658 4.047-6.35 7.897-6.35s7.073 2.692 7.887 6.297l0.010 0.054c0.127 0.566 0.625 0.982 1.221 0.982 0.69 0 1.25-0.559 1.25-1.25 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008c-1.098-4.78-5.305-8.295-10.337-8.316h-0.002zM9.164 11.102c0 0 0 0 0 0 2.858 0 5.176-2.317 5.176-5.176s-2.317-5.176-5.176-5.176c-2.858 0-5.176 2.317-5.176 5.176v0c0.004 2.857 2.319 5.172 5.175 5.176h0zM9.164 3.25c0 0 0 0 0 0 1.478 0 2.676 1.198 2.676 2.676s-1.198 2.676-2.676 2.676c-1.478 0-2.676-1.198-2.676-2.676v0c0.002-1.477 1.199-2.674 2.676-2.676h0zM22.926 11.102c2.858 0 5.176-2.317 5.176-5.176s-2.317-5.176-5.176-5.176c-2.858 0-5.176 2.317-5.176 5.176v0c0.004 2.857 2.319 5.172 5.175 5.176h0zM22.926 3.25c1.478 0 2.676 1.198 2.676 2.676s-1.198 2.676-2.676 2.676c-1.478 0-2.676-1.198-2.676-2.676v0c0.002-1.477 1.199-2.674 2.676-2.676h0zM31.311 19.734c-0.864-4.111-4.46-7.154-8.767-7.154-0.395 0-0.784 0.026-1.165 0.075l0.045-0.005c-0.93-2.116-3.007-3.568-5.424-3.568-2.414 0-4.49 1.448-5.407 3.524l-0.015 0.038c-0.266-0.034-0.58-0.057-0.898-0.063l-0.009-0c-4.33 0.019-7.948 3.041-8.881 7.090l-0.012 0.062c-0.018 0.080-0.029 0.173-0.029 0.268 0 0.691 0.56 1.251 1.251 1.251 0.596 0 1.094-0.417 1.22-0.975l0.002-0.008c0.684-2.981 3.309-5.174 6.448-5.186h0.001c0.144 0 0.282 0.020 0.423 0.029 0.056 3.218 2.679 5.805 5.905 5.805 3.224 0 5.845-2.584 5.905-5.794l0-0.006c0.171-0.013 0.339-0.035 0.514-0.035 3.14 0.012 5.765 2.204 6.442 5.14l0.009 0.045c0.126 0.567 0.625 0.984 1.221 0.984 0.69 0 1.249-0.559 1.249-1.249 0-0.094-0.010-0.186-0.030-0.274l0.002 0.008zM16 18.416c-0 0-0 0-0.001 0-1.887 0-3.417-1.53-3.417-3.417s1.53-3.417 3.417-3.417c1.887 0 3.417 1.53 3.417 3.417 0 0 0 0 0 0.001v-0c-0.003 1.886-1.53 3.413-3.416 3.416h-0z"></path>
  </svg>
);

// Documentation SVG Icon Component
const DocumentationIcon = () => (
  <svg 
    fill="currentColor" 
    height="16" 
    width="16" 
    viewBox="0 0 296.999 296.999" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <g>
        <g>
          <path d="M169.197,43.09H18.808c-7.176,0-13.014,5.838-13.014,13.014v227.444c0,7.176,5.838,13.014,13.014,13.014h150.389
            c7.176,0,13.014-5.838,13.014-13.014V56.105C182.211,48.928,176.373,43.09,169.197,43.09z M151.794,274.258H36.21
            c-4.479,0-8.111-3.632-8.111-8.111s3.632-8.111,8.111-8.111h115.584c4.479,0,8.111,3.632,8.111,8.111
            S156.273,274.258,151.794,274.258z M151.794,235.73H36.21c-4.479,0-8.111-3.632-8.111-8.111s3.632-8.111,8.111-8.111h115.584
            c4.479,0,8.111,3.632,8.111,8.111C159.905,232.098,156.273,235.73,151.794,235.73z M151.794,197.202H36.21
            c-4.479,0-8.111-3.632-8.111-8.111s3.632-8.111,8.111-8.111h115.584c4.479,0,8.111,3.632,8.111,8.111
            S156.273,197.202,151.794,197.202z M151.794,158.674H36.21c-4.479,0-8.111-3.632-8.111-8.111s3.632-8.111,8.111-8.111h115.584
            c4.479,0,8.111,3.632,8.111,8.111S156.273,158.674,151.794,158.674z M151.794,120.146H36.21c-4.479,0-8.111-3.632-8.111-8.111
            s3.632-8.111,8.111-8.111h115.584c4.479,0,8.111,3.632,8.111,8.111S156.273,120.146,151.794,120.146z M151.794,81.618H36.21
            c-4.479,0-8.111-3.632-8.111-8.111c0-4.479,3.632-8.111,8.111-8.111h115.584c4.479,0,8.111,3.632,8.111,8.111
            C159.905,77.986,156.273,81.618,151.794,81.618z"/>
          <path d="M213.642,0H57.336c-7.177,0-13.014,5.838-13.014,13.014v13.854h124.875c16.121,0,29.237,13.115,29.237,29.237v201.931
            h15.208c7.176,0,13.014-5.838,13.014-13.014V13.014C226.656,5.838,220.818,0,213.642,0z"/>
          <path d="M291.205,23.324C291.204,10.464,281.88,0,270.42,0c-11.461,0-20.785,10.464-20.785,23.324v13.584h41.57V23.324z"/>
          <path d="M249.635,53.13v214.537h0c0,1.2,0.342,2.373,0.983,3.371l14.921,23.249c1.087,1.694,2.919,2.712,4.881,2.712
            c1.961,0,3.794-1.018,4.881-2.712l14.921-23.249c0.641-0.998,0.983-2.171,0.983-3.371V53.13H249.635z"/>
        </g>
      </g>
    </g>
  </svg>
);

// Settings SVG Icon Component
const SettingsIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="style=fill">
      <g id="setting">
        <path id="Subtract" fillRule="evenodd" clipRule="evenodd" d="M10.8946 3.00654C10.2226 1.87704 8.75191 1.45656 7.59248 2.14193L5.86749 3.12906C4.59518 3.85639 4.16378 5.48726 4.8906 6.74522L4.89112 6.74611C5.26606 7.39298 5.20721 7.8062 5.09018 8.00929C4.97308 8.21249 4.64521 8.47001 3.9 8.47001C2.43322 8.47001 1.25 9.66837 1.25 11.12V12.88C1.25 14.3317 2.43322 15.53 3.9 15.53C4.64521 15.53 4.97308 15.7875 5.09018 15.9907C5.20721 16.1938 5.26606 16.607 4.89112 17.2539L4.8906 17.2548C4.16378 18.5128 4.59558 20.1439 5.8679 20.8712L7.59257 21.8581C8.75199 22.5434 10.2226 22.123 10.8946 20.9935L11.0091 20.7958C11.3841 20.1489 11.773 19.9925 12.0087 19.9925C12.2434 19.9925 12.6293 20.1476 12.9993 20.793L13.0009 20.7958L13.1109 20.9858L13.1154 20.9935C13.7874 22.123 15.258 22.5434 16.4174 21.8581L18.1425 20.871C19.4157 20.1431 19.8444 18.5235 19.1212 17.2579L19.1189 17.2539C18.7439 16.607 18.8028 16.1938 18.9198 15.9907C19.0369 15.7875 19.3648 15.53 20.11 15.53C21.5768 15.53 22.76 14.3317 22.76 12.88V11.12C22.76 9.65323 21.5616 8.47001 20.11 8.47001C19.3648 8.47001 19.0369 8.21249 18.9198 8.00929C18.8028 7.8062 18.7439 7.39298 19.1189 6.74611L19.1194 6.74522C19.8463 5.48713 19.4147 3.85604 18.1421 3.12883L16.4175 2.14193C15.2581 1.45656 13.7874 1.877 13.1154 3.00651L13.0009 3.20423C12.6259 3.85115 12.237 4.00751 12.0012 4.00751C11.7666 4.00751 11.3807 3.85247 11.0107 3.20701L11.0091 3.20423L10.8991 3.01421L10.8946 3.00654ZM15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" fill="currentColor"/>
      </g>
    </g>
  </svg>
);

// Chat SVG Icon Component
const ChatIcon = () => (
  <svg 
    fill="currentColor" 
    width="40" 
    height="40" 
    viewBox="0 0 2.33333 2.33333" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="Layer_x0020_1">
      <path className="fil0" d="M1.652 1.79018c-0.00416535,0 -0.00833071,-0.00138976 -0.0111102,-0.00416929l-0.279118 -0.199965c-0.36987,0.136689 -0.742933,-0.135827 -0.742933,-0.512417 0,-0.301343 0.245791,-0.547134 0.54713,-0.547134 0.302728,0 0.547134,0.245791 0.547134,0.547134 0,0.11387 -0.0347205,0.223575 -0.0999843,0.315224l0.0583228 0.377717c0.0019685,0.0122677 -0.0101339,0.0236102 -0.0194409,0.0236102zm-0.273567 -0.24163l0.247185 0.177748 -0.0513819 -0.34022c0,-0.00833071 0.00416535,-0.0138858 0.00694094,-0.0166654 0.0611024,-0.0860984 0.0944291,-0.187469 0.0944291,-0.295783 0,-0.279122 -0.227736,-0.506862 -0.508248,-0.506862 -0.279122,0 -0.506866,0.227736 -0.506866,0.506862 0,0.280508 0.22774,0.508252 0.506866,0.508252 0.0624882,0 0.124976,-0.0111102 0.184689,-0.0347165 0.0125,-0.00694488 0.0222205,-0.00138976 0.0263858,0.00138583zm-0.0263858 0.0305512c0,0 0,0 0,0z"/>
      <path className="fil0" d="M1.8978 1.09307c-0.0111102,0 -0.0194409,-0.00833071 -0.0194409,-0.0194409 0,-0.391602 -0.31939,-0.710996 -0.712382,-0.710996 -0.391602,0 -0.710996,0.319394 -0.710996,0.710996 0,0.0257717 -0.038878,0.0257717 -0.038878,0 0,-0.413823 0.337445,-0.751268 0.751264,-0.751268 0.413823,0 0.751268,0.337445 0.751268,0.751268 -0.00138976,0.0111102 -0.00972441,0.0194409 -0.0208346,0.0194409z"/>
      <path className="fil0" d="M1.8978 1.57077l-0.10137 0c-0.0111102,0 -0.0194409,-0.00833071 -0.0194409,-0.0194409l0 -0.477701c0,-0.0111102 0.00833071,-0.0194409 0.0194409,-0.0194409l0.10137 0c0.0666575,0 0.122205,0.0541575 0.122205,0.122205l0 0.273563c0,0.0652677 -0.0555472,0.120815 -0.122205,0.120815zm-0.0819291 -0.0402717l0.0819291 0c0.0458268,0 0.0819331,-0.0361063 0.0819331,-0.0819331l0 -0.272173c0,-0.0458268 -0.0361063,-0.0819331 -0.0819331,-0.0819331l-0.0819291 0 0 0.436039z"/>
      <path className="fil0" d="M0.536909 1.57077l-0.10137 0c-0.0666575,0 -0.122205,-0.0541575 -0.122205,-0.122205l0 -0.272173c0,-0.0666575 0.0541575,-0.122205 0.122205,-0.122205l0.10137 0c0.0111102,0 0.0194409,0.00833071 0.0194409,0.0194409l0 0.476311c0.00138583,0.0111102 -0.00833071,0.0208307 -0.0194409,0.0208307zm-0.10137 -0.477701c-0.0458268,0 -0.0819331,0.0361024 -0.0819331,0.0819291l0 0.273567c0,0.0458268 0.0361063,0.0819331 0.0819331,0.0819331l0.0819252 0 0 -0.437429 -0.0819252 0z"/>
      <path className="fil0" d="M1.02155 1.91377c-0.00138583,0 -0.00277559,0 -0.00416535,0 -0.206909,-0.0416614 -0.388827,-0.169417 -0.497142,-0.35272 -0.0137165,-0.0236063 0.0216339,-0.0433228 0.0347165,-0.0208346 0.10276,0.173583 0.274957,0.295787 0.470756,0.334669 0.0244843,0.00548425 0.0182126,0.0388858 -0.00416535,0.0388858z"/>
      <path className="fil0" d="M1.22985 2.01097l-0.127756 0c-0.0555472,0 -0.101374,-0.0458268 -0.101374,-0.10137 0,-0.056937 0.0458268,-0.102764 0.101374,-0.102764l0.127756 0c0.0555472,0 0.101374,0.0458268 0.101374,0.102764 0.00138583,0.0555472 -0.0444409,0.10137 -0.101374,0.10137zm-0.127756 -0.163862c-0.0347165,0 -0.0624921,0.0277756 -0.0624921,0.0624921 0,0.0347165 0.0277756,0.0624921 0.0624921,0.0624921l0.127756 -3.93701e-006c0.0347165,0 0.0624921,-0.0277717 0.0624921,-0.0624882 0,-0.0347205 -0.0277756,-0.0624921 -0.0624921,-0.0624921l-0.127756 0z"/>
      <path className="fil0" d="M0.897961 1.17222c-0.0624882,0 -0.11248,-0.0499882 -0.11248,-0.11248 0,-0.0624921 0.0499921,-0.11248 0.11248,-0.11248 0.0611024,0 0.112484,0.0499882 0.112484,0.11248 0,0.0624882 -0.0499961,0.11248 -0.112484,0.11248zm0 -0.184689c-0.0402717,0 -0.0735984,0.0333268 -0.0735984,0.0735945 0,0.0402756 0.0333307,0.0722126 0.0735984,0.0722126 0.0402717,0 0.0722126,-0.031937 0.0722126,-0.0722126 0,-0.0416575 -0.0319409,-0.0735945 -0.0722126,-0.0735945z"/>
      <path className="fil0" d="M1.16597 1.17222c-0.0610984,0 -0.11248,-0.0499882 -0.11248,-0.11248 0,-0.0624921 0.0499882,-0.11248 0.11248,-0.11248 0.0624921,0 0.11248,0.0499882 0.11248,0.11248 0,0.0624882 -0.0499921,0.11248 -0.11248,0.11248zm0 -0.184689c-0.0402717,0 -0.0722087,0.031937 -0.0722087,0.0735945 0,0.0402756 0.031937,0.0722126 0.0722087,0.0722126 0.0402717,0 0.0735984,-0.031937 0.0735984,-0.0722126 0,-0.0402717 -0.0333268,-0.0735945 -0.0735984,-0.0735945z"/>
      <path className="fil0" d="M1.43537 1.17222c-0.0624882,0 -0.11248,-0.0499882 -0.11248,-0.11248 0,-0.0624921 0.0499921,-0.11248 0.11248,-0.11248 0.0611024,0 0.112484,0.0499882 0.112484,0.11248 -0.00138976,0.0624882 -0.051378,0.11248 -0.112484,0.11248zm0 -0.184689c-0.0402717,0 -0.0735945,0.0333268 -0.0735945,0.0735945 0,0.0402756 0.0333268,0.0722126 0.0735945,0.0722126 0.0402717,0 0.0722126,-0.031937 0.0722126,-0.0722126 0,-0.0416575 -0.0319409,-0.0735945 -0.0722126,-0.0735945z"/>
    </g>
  </svg>
);

// Phone SVG Icon Component
const PhoneIcon = () => (
  <svg 
    width="25px" 
    height="25px" 
    viewBox="-0.5 0 187 187" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0)">
      <path d="M8.84829 182.833C11.4115 182.494 13.9451 181.96 16.4271 181.235C16.9955 181.085 17.5625 180.935 18.1296 180.79C24.3504 179.196 31.0206 177.469 37.6536 175.626C41.3829 174.59 43.9545 174.986 46.5391 176.992C48.3047 178.364 50.5179 179.134 52.6575 179.88C53.1275 180.043 53.5948 180.208 54.0542 180.374C67.7287 185.372 81.8701 185.956 95.1308 185.829C96.706 185.927 98.2871 185.977 99.8728 185.976C115.661 185.976 131.843 181.134 146.966 171.844C164.1 161.318 175.673 146.057 181.362 126.484C185.99 110.557 186.23 93.0077 182.094 72.8345C177.05 48.222 163.646 29.2341 142.255 16.3896C131.976 10.2318 120.807 5.70121 109.143 2.95837C101.167 1.12996 92.9314 0.72977 84.8164 1.77678C74.913 2.93062 65.6923 5.88544 54.8956 9.96783C32.8695 18.2954 17.3571 34.4368 7.47004 59.3153C-0.865429 80.2925 -0.505172 103.487 8.60807 132.307C10.3552 137.833 10.5725 141.994 9.33397 146.222C7.69904 151.8 6.12909 157.494 4.60836 163.002C3.8877 165.616 3.1635 168.23 2.43584 170.843C2.30458 171.303 2.15826 171.762 2.00993 172.222C1.81303 172.824 1.61225 173.448 1.45342 174.083C0.762951 176.85 1.15071 179.257 2.54608 180.862C3.90273 182.421 6.14613 183.122 8.84829 182.833ZM18.8404 135.294C15.3212 125.757 14.0446 115.386 12.81 105.357C12.6656 104.184 12.5203 103.014 12.3742 101.843C10.7209 88.7395 12.017 76.3571 16.2268 65.0413C24.643 42.4127 38.4347 27.5146 58.388 19.4915C66.1682 16.3647 75.4479 13.0003 85.289 11.7526C100.232 9.85776 115.299 13.2477 132.703 22.42C146.814 29.857 157.041 39.6947 163.966 52.4933C168.367 60.7482 171.253 69.7254 172.487 78.9988C174.231 91.0584 175.522 105.384 171.876 120.177C167.451 138.141 157.551 151.629 141.612 161.409C128.473 169.561 113.255 173.735 97.7955 173.424C88.3442 173.285 80.0094 172.837 72.3211 172.052C65.2292 171.439 58.3605 169.268 52.2047 165.694C50.0425 164.312 47.5389 163.557 44.9731 163.514C43.7739 163.52 42.5806 163.685 41.4243 164.003C36.4893 165.325 31.4283 166.524 26.534 167.685C24.3182 168.21 22.103 168.739 19.8885 169.273C18.379 169.641 16.8695 170.021 15.0396 170.482L12.976 171C13.5621 168.843 14.1135 166.764 14.6491 164.742C16.0346 159.514 17.3439 154.577 18.8719 149.778C20.3493 145.142 20.9092 140.901 18.8404 135.294Z" fill="currentColor"/>
      <path d="M34.4151 66.8566C35.7153 70.0615 37.2582 73.1627 39.0305 76.1333C52.2229 96.9839 66.9621 115.638 82.8435 131.575C87.9826 136.625 93.4578 141.322 99.2316 145.633C104.008 149.437 109.927 151.522 116.034 151.55C119.184 151.527 122.312 151.03 125.314 150.077C134.312 147.302 142.051 142.276 149.074 137.259C151.995 135.173 153.656 132.573 153.882 129.741C154.108 126.881 152.805 123.965 150.114 121.312C141.698 113.013 132.676 105.09 124.18 97.7642C119.144 93.4239 115.713 93.3582 110.065 97.4932C109.351 98.0182 108.659 98.5774 107.988 99.1202C107.448 99.558 106.909 99.9958 106.356 100.415C101.023 104.462 100.167 104.442 94.9247 100.162C93.2058 98.8164 91.6739 97.2464 90.3704 95.4946L89.4515 94.2023C86.3221 89.9624 83.4086 85.5669 80.7222 81.0329C75.184 71.2968 75.5608 69.8154 85.1965 63.4214C85.3343 63.3302 85.4334 63.1912 85.4754 63.0314C86.6785 58.4626 84.7167 55.4331 82.4175 52.8399C79.8532 49.9467 77.2922 47.0499 74.7338 44.1498C71.7987 40.8275 68.8602 37.507 65.92 34.1881C64.9801 33.1274 63.9509 32.1219 63.0648 31.2621C61.1398 29.4007 59.0238 29.0199 56.7719 30.1337C49.2162 33.8749 40.7927 38.8934 35.5978 47.7664C31.9807 53.9465 31.516 60.219 34.2148 66.4103L34.4151 66.8566ZM74.1057 61.0361C72.965 61.6481 71.9063 62.4028 70.9553 63.282C67.6079 66.6742 66.2756 71.0861 67.3861 75.0825C72.4222 93.2053 79.7745 104.792 91.2276 112.653C97.6538 117.063 104.239 117.036 110.803 112.573C112.822 111.2 114.766 109.703 116.824 108.119C117.648 107.483 118.496 106.831 119.379 106.162L139.524 127.73C131.901 133.76 125.32 137.108 118.263 138.56C116.05 139.073 113.744 139.045 111.543 138.48C109.342 137.913 107.309 136.826 105.617 135.307C104.197 134.058 102.773 132.811 101.344 131.566C95.2824 126.276 89.0144 120.802 83.3397 114.969C71.3779 102.666 60.2007 88.5873 49.1683 71.9275C48.0361 70.2177 47.0522 68.3465 46.0999 66.5383C45.7166 65.8092 45.3333 65.0805 44.9388 64.3585C42.0752 59.1111 42.6988 54.0081 46.7412 49.6021C49.1971 47.0306 51.7899 44.5933 54.5082 42.301C55.6752 41.2778 56.8762 40.2255 58.1147 39.1065L75.188 60.3817C74.8218 60.6101 74.4594 60.828 74.1057 61.0361Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="185.087" height="185.744" fill="white" transform="translate(0.567627 0.773926)"/>
      </clipPath>
    </defs>
  </svg>
);

// Download SVG Icon Component
const DownloadIcon = () => (
  <svg 
    width="25" 
    height="25" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 7L12 14M12 14L15 11M12 14L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Main Sidebar Component
export const Sidebar = ({ isCollapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (label) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const navigationItems = [
    { icon: <DashboardIcon />, label: t('dashboard').toUpperCase(), path: "/dashboard", isActive: true },
    { icon: <LiveTrackingIcon />, label: t('liveTracking').toUpperCase(), path: "/dashboard/live-tracking" },
    // { icon: "📷", label: t('oldScreenshots').toUpperCase(), path: "/dashboard/old-screenshots" },
    { icon: <QuickViewIcon />, label: t('quickView').toUpperCase(), path: "/dashboard/quick-view" },
    // { icon: "⏰", label: t('timeLogSummary').toUpperCase(), path: "/dashboard/reports/time-log" },
    { icon: <EmployeesIcon />, label: t('employees').toUpperCase(), path: "/dashboard/employee-reports" },
    // { icon: "🏢", label: t('teams').toUpperCase(), path: "/dashboard/teams" },
    { icon: <DocumentationIcon />, label: t('documentation').toUpperCase(), path: "/dashboard/documentation" },
    { 
      icon: <SettingsIcon />, 
      label: t('settings').toUpperCase(), 
      path: "/dashboard/settings", 
      hasArrow: true,
      subItems: [
        { label: t('credentialsSettings').toUpperCase(), path: "/dashboard/settings/credentials" },
      ]
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Select collapse logo based on theme mode
  const collapseLogoSrc = theme.mode === 'dark' ? CollaspeLogo : CollaspeLogoLight;

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <LogoSection $isCollapsed={isCollapsed}>
        <Logo isCollapsed={isCollapsed} />
      </LogoSection>

      <div className="logo-divider" style={{height: isCollapsed ? '63px' : '0px', display: isCollapsed ? 'flex' : 'none', alignItems:'center', justifyContent:'center'}}>
        <img src={collapseLogoSrc} alt="Collapsed Logo" style={{ height: '45px', display: isCollapsed ? 'block' : 'none', margin: 'auto', paddingTop: '12px' }} />
      </div>
     
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
                  <SubMenuList>
                    {item.subItems.map((subItem, subIndex) => (
                      <SubMenuItem key={subIndex}>
                        <SubMenuLink
                          onClick={() => handleNavigation(subItem.path)}
                          $isActive={location.pathname === subItem.path}
                        >
                          {subItem.label}
                        </SubMenuLink>
                      </SubMenuItem>
                    ))}
                  </SubMenuList>
                </SubMenuContainer>
              )}
            </NavItem>
          ))}
        </NavList>
      </Navigation>

      <BottomSection $isCollapsed={isCollapsed}>
        <BottomItem style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon><ChatIcon /></BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('liveChat')}</BottomText>
        </BottomItem>
        
        <BottomItem onClick={() => window.open('https://wa.me/905488612323', '_blank') } style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon><PhoneIcon /></BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('scheduleCall')}</BottomText>
        </BottomItem>
        
        <BottomItem onClick={() => window.open('https://drive.google.com/drive/folders/1MVYaOcSkV97iNxzMFJm8dtLeJ2R03NcJ?usp=drive_link', '_blank') } style={{ width: isCollapsed ? '100%' : 'auto', padding: isCollapsed ? '8px 6px' : undefined }}>
          <BottomIcon><DownloadIcon /></BottomIcon>
          <BottomText $isCollapsed={isCollapsed}>{t('downloadClientApp')}</BottomText>
        </BottomItem>
        
        {/* <VersionText>V 4.0.2</VersionText> */}
      </BottomSection>
    </SidebarContainer>
  );
};