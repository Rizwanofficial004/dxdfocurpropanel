import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FlexContainer, Button } from '../../styles/commonStyles';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border-bottom: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  padding: 12px 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 101;
  margin-left: 240px;
`;

const HeaderContent = styled(FlexContainer)`
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const LeftSection = styled(FlexContainer)`
  align-items: center;
  gap: 20px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  
  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LogoIcon = styled.div`
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 2px;
    background: white;
    border-radius: 1px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 8px;
    height: 2px;
    background: white;
    border-radius: 1px;
  }
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary || '#111827'};
`;

const Greeting = styled.div`
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RightSection = styled(FlexContainer)`
  align-items: center;
  gap: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchBox = styled.input`
  background: ${props => props.theme.colors.background || '#f9fafb'};
  border: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  border-radius: 6px;
  padding: 8px 12px 8px 36px;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  font-size: 13px;
  width: 240px;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${props => props.theme.colors.text.light || '#9ca3af'};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary || '#667eea'};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  color: ${props => props.theme.colors.text.light || '#9ca3af'};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  z-index: 999;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  border-bottom: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
    color: ${props => props.theme.colors.primary || '#4f46e5'};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border || '#e5e7eb'};
  margin: 4px 0;
`;

const LanguageSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  border-radius: 6px;
  cursor: pointer;
  background: ${props => props.theme.colors.surface || '#ffffff'};
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
    border-color: ${props => props.theme.colors.primary || '#4f46e5'};
  }

  ${props => props.$isOpen && `
    border-color: ${props.theme.colors.primary || '#4f46e5'};
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  `}
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
  }
`;

const NotificationDot = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  border: 1px solid white;
`;

const ProfileSection = styled(FlexContainer)`
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
  }

  ${props => props.$isOpen && `
    background: ${props.theme.colors.background || '#f9fafb'};
  `}
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.span`
  color: ${props => props.theme.colors.text.primary || '#111827'};
  font-weight: 600;
  font-size: 13px;
`;

const UserRole = styled.span`
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  font-size: 11px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 13px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Icons as simple SVG components
const HamburgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const SearchIconSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

// New icon components
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <point cx="12" cy="17"></point>
  </svg>
);

const ProfileDropdownMenu = styled(DropdownMenu)`
  min-width: 250px;
`;

const ProfileHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin-bottom: 2px;
`;

const ProfileEmail = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
`;

const StatusBadge = styled.div`
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
`;

const NotificationDropdownMenu = styled(DropdownMenu)`
  min-width: 320px;
  right: -50px;
`;

const NotificationHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin: 0;
`;

const NotificationCount = styled.span`
  background: ${props => props.theme.colors.primary || '#4f46e5'};
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
`;

const NotificationItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.15s ease;
  border-bottom: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  position: relative;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
  }

  ${props => !props.$isRead && `
    background: rgba(79, 70, 229, 0.05);
    
    &::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      background: #4f46e5;
      border-radius: 50%;
    }
  `}
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: ${props => {
    switch(props.type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationText = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary || '#111827'};
  margin-bottom: 4px;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
`;

const NotificationFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  text-align: center;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary || '#4f46e5'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
  }
`;

const EmptyNotifications = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
`;

// Add theme toggle styled components
const ThemeToggleButton = styled.button`
  background: ${props => props.theme.colors.surface || '#ffffff'};
  border: 1px solid ${props => props.theme.colors.border || '#e5e7eb'};
  border-radius: 6px;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary || '#6b7280'};
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;

  &:hover {
    background: ${props => props.theme.colors.background || '#f9fafb'};
    border-color: ${props => props.theme.colors.primary || '#4f46e5'};
    color: ${props => props.theme.colors.primary || '#4f46e5'};
  }
`;

// Add theme toggle icons
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

export const Header = ({ 
  greeting
}) => {
  // Get user info from sessionStorage/localStorage with better handling
  let user = null;
  try {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    const sessionAdmin = sessionStorage.getItem('admin');
    const localAdmin = localStorage.getItem('admin');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const loginUsername = sessionStorage.getItem('loginUsername') || localStorage.getItem('loginUsername');
    
    // Debug: log what's in storage
    console.log('Session user:', sessionUser);
    console.log('Local user:', localUser);
    console.log('Session admin:', sessionAdmin);
    console.log('Local admin:', localAdmin);
    console.log('Auth token:', authToken);
    console.log('Login username:', loginUsername);
    
    // Try to parse JSON data first
    if (sessionUser && sessionUser !== 'null') {
      try {
        user = JSON.parse(sessionUser);
      } catch (e) {
        // If it's not JSON, treat as plain text
        if (sessionUser.toLowerCase().includes('admin')) {
          user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
        }
      }
    }
    
    if (!user && localUser && localUser !== 'null') {
      try {
        user = JSON.parse(localUser);
      } catch (e) {
        if (localUser.toLowerCase().includes('admin')) {
          user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
        }
      }
    }
    
    if (!user && sessionAdmin && sessionAdmin !== 'null') {
      try {
        user = JSON.parse(sessionAdmin);
      } catch (e) {
        user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
      }
    }
    
    if (!user && localAdmin && localAdmin !== 'null') {
      try {
        user = JSON.parse(localAdmin);
      } catch (e) {
        user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
      }
    }
    
    // Check if login username is stored
    if (!user && loginUsername) {
      const username = loginUsername.toLowerCase();
      if (username === 'admin') {
        user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
      } else {
        user = { name: loginUsername, role: 'User', email: `${loginUsername}@dds.com` };
      }
    }
    
    // If user logged in but no proper user data, check if it's admin login
    if (!user && authToken) {
      // If there's an auth token but no user data, assume admin login
      user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
    }
    
    // Last resort: check if any storage contains "admin"
    if (!user && (
      (sessionUser && sessionUser.toLowerCase().includes('admin')) ||
      (localUser && localUser.toLowerCase().includes('admin')) ||
      (sessionAdmin) ||
      (localAdmin)
    )) {
      user = { name: 'Admin', role: 'Administrator', email: 'admin@dds.com' };
    }
    
    console.log('Final user object:', user);
  } catch (e) {
    console.error('Error parsing user data:', e);
    user = null;
  }

  // Dynamic user data - use actual logged in user info
  const userName = user?.name || user?.username || user?.fullName || "Guest User";
  const userRole = user?.role || user?.userType || user?.position || "User";
  const userEmail = user?.email || user?.emailAddress || "user@example.com";

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const languageRef = useRef(null);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Only English and Turkish languages
  const languages = [
    { flag: "🇺🇸", name: "English", code: "en" },
    { flag: "🇹🇷", name: "Türkçe", code: "tr" }
  ];

  // Get current language info
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const notifications = [
    {
      id: 1,
      type: 'success',
      icon: '✅',
      text: t('orderProcessed') || 'Your order has been successfully processed',
      time: t('minutesAgo', { count: 2 }) || '2 minutes ago',
      isRead: false
    },
    {
      id: 2,
      type: 'warning',
      icon: '⚠️',
      text: t('serverMaintenance') || 'Server maintenance scheduled for tonight',
      time: t('hourAgo') || '1 hour ago',
      isRead: false
    },
    {
      id: 3,
      type: 'info',
      icon: '📊',
      text: t('weeklyReportAvailable') || 'Weekly report is now available',
      time: t('hoursAgo', { count: 3 }) || '3 hours ago',
      isRead: true
    },
    {
      id: 4,
      type: 'error',
      icon: '❌',
      text: t('syncDataFailed') || 'Failed to sync data. Please try again',
      time: t('dayAgo') || '1 day ago',
      isRead: true
    },
    {
      id: 5,
      type: 'info',
      icon: '👥',
      text: t('newUserRegistered') || 'New user registered on your platform',
      time: t('daysAgo', { count: 2 }) || '2 days ago',
      isRead: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (selectedLang) => {
    setLanguage(selectedLang.code);
    setIsLanguageOpen(false);
  };

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('loginUsername');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('admin');
    sessionStorage.removeItem('loginUsername');
    
    // Close dropdown
    setIsProfileOpen(false);
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <LeftSection>
          <MenuButton>
            <HamburgerIcon />
          </MenuButton>
          
          <Logo>
            <LogoIcon></LogoIcon>
            <LogoText>DDS Admin</LogoText>
          </Logo>
          
          {/* <Greeting>{greeting || `${t('hello')} Thomas 👋`}</Greeting> */}
        </LeftSection>

        <RightSection>
          <SearchContainer>
            <SearchIcon>
              <SearchIconSVG />
            </SearchIcon>
            <SearchBox placeholder={t('searchHere')} />
          </SearchContainer>

          <DropdownContainer ref={languageRef}>
            <LanguageSelector 
              $isOpen={isLanguageOpen}
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.name}</span>
              <ChevronDownIcon />
            </LanguageSelector>
            
            <DropdownMenu $isOpen={isLanguageOpen}>
              {languages.map((lang) => (
                <DropdownItem
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang)}
                  style={{ 
                    backgroundColor: lang.code === language ? 'rgba(79, 70, 229, 0.1)' : 'transparent'
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </DropdownContainer>

          <ThemeToggleButton onClick={toggleTheme} title={isDarkMode ? t('switchToLight') || 'Switch to Light Mode' : t('switchToDark') || 'Switch to Dark Mode'}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </ThemeToggleButton>

          <DropdownContainer ref={notificationRef}>
            <IconButton onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
              <BellIcon />
              {unreadCount > 0 && <NotificationDot />}
            </IconButton>

            <NotificationDropdownMenu $isOpen={isNotificationOpen}>
              <NotificationHeader>
                <NotificationTitle>{t('notifications')}</NotificationTitle>
                {unreadCount > 0 && <NotificationCount>{unreadCount}</NotificationCount>}
              </NotificationHeader>
              
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} $isRead={notification.isRead}>
                      <NotificationIcon type={notification.type}>
                        {notification.icon}
                      </NotificationIcon>
                      <NotificationContent>
                        <NotificationText>{notification.text}</NotificationText>
                        <NotificationTime>{notification.time}</NotificationTime>
                      </NotificationContent>
                    </NotificationItem>
                  ))}
                  <NotificationFooter>
                    <ViewAllButton>{t('viewAllNotifications') || 'View All Notifications'}</ViewAllButton>
                  </NotificationFooter>
                </>
              ) : (
                <EmptyNotifications>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
                  <div>{t('noNotifications') || 'No notifications yet'}</div>
                </EmptyNotifications>
              )}
            </NotificationDropdownMenu>
          </DropdownContainer>

          <IconButton>
            <MessageIcon />
          </IconButton>

          <DropdownContainer ref={profileRef}>
            <ProfileSection 
              $isOpen={isProfileOpen}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <UserInfo>
                <UserName>{userName}</UserName>
                <UserRole>{userRole}</UserRole>
              </UserInfo>
              <Avatar>
                {userName.split(' ').map(n => n[0]).join('')}
              </Avatar>
            </ProfileSection>

            <ProfileDropdownMenu $isOpen={isProfileOpen}>
              <ProfileHeader>
                <Avatar style={{ width: '48px', height: '48px', fontSize: '16px' }}>
                  {userName.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <ProfileInfo>
                  <ProfileName>{userName}</ProfileName>
                  <ProfileEmail>{userEmail}</ProfileEmail>
                </ProfileInfo>
                <StatusBadge>{t('active')}</StatusBadge>
              </ProfileHeader>
              
              <DropdownItem>
                <UserIcon />
                <span>{t('viewProfile')}</span>
              </DropdownItem>
              
              <DropdownItem>
                <SettingsIcon />
                <span>{t('accountSettings')}</span>
              </DropdownItem>
              
              <DropdownItem>
                <HelpIcon />
                <span>{t('helpSupport')}</span>
              </DropdownItem>
              
              <DropdownDivider />
              
              <DropdownItem 
                style={{ color: '#ef4444' }}
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>{t('signOut')}</span>
              </DropdownItem>
            </ProfileDropdownMenu>
          </DropdownContainer>
        </RightSection>
      </HeaderContent>
    </HeaderContainer>
  );
};