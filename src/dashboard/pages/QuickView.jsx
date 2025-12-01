import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Table as MuiTable,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  Paper,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  CircularProgress
} from '@mui/material';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import Tooltip from '../../components/common/Tooltip';
import './QuickView.css';

// Main Page Wrapper
const EmployeesPageWrapper = styled.div`
  // background: ${props => props.theme.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

// Notification Banner
const NotificationBanner = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 16px 32px;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-size: 14px;
  transition: all 0.3s ease;
  
  a {
    color: ${props => props.theme.colors.primary};
  }
`;

// Header Section
const PageHeader = styled.div`
  padding: 10px 32px 24px 32px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoIcon = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  cursor: help;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary}CC;
    transform: translateY(-1px);
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${props => props.theme.shadows?.sm || '0 1px 2px rgba(0,0,0,0.1)'};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary + 'DD'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows?.md || '0 4px 6px rgba(0,0,0,0.1)'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.muted};
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  color: ${props => props.theme.colors.error};
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.theme.colors.error};
  transition: all 0.3s ease;
  font-weight: 500;
`;

const LoadingMessage = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  margin-top: 8px;
  border-left: 4px solid ${props => props.theme.colors.primary};
  transition: all 0.3s ease;
  font-weight: 500;
`;

const TimerInput = styled.input`
  width: 60px;
  height: 38px;
  padding: 8px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  line-height: 1;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text.light};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.light};
    font-weight: 400;
  }
`;

const StartButton = styled.button`
  background: ${props => props.running 
    ? props.theme.colors.error 
    : props.theme.colors.success};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: ${props => props.running || props.disabled ? 'not-allowed' : 'pointer'};
  height: 38px;
  min-width: 90px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};
  
  &:hover:not(:disabled) {
    background: ${props => props.running 
      ? props.theme.colors.error + 'DD' 
      : props.theme.colors.success + 'DD'};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.sm};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.muted};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary}40;
    outline-offset: 2px;
  }
`;

const ResetButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 11px;
  cursor: pointer;
  font-weight: 600;
  height: 32px;
  min-width: 60px;
  text-transform: uppercase;
  margin-left: 4px;
  
  &:hover {
    background: #d97706;
  }
  
  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
  }
`;

// Controls Section
const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LeftControls = styled.div`
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
`;

const DateLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  margin-right: 8px;
`;

const DateInput = styled.input`
  padding: 10px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const DateHelperText = styled.div`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
  font-style: italic;
`;

const SearchInput = styled.input`
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 13px;
  width: 100%;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
  }
`;

const StatusDropdown = styled.select`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Table Styles
const TableWrapper = styled.div`
  padding: 0;
  width: 100%;
`;

// Note: TableContainer is now imported from MUI, so this styled component is no longer needed
// Keeping it commented out in case it's needed for future reference
// const StyledTableContainer = styled.div`
//   // background: ${props => props.theme.colors.cardBackground};
//   border-radius: 8px;
//   border: 1px solid ${props => props.theme.colors.border};
//   transition: all 0.3s ease;
//   margin: 0 32px 32px 32px;
//   width: calc(100% - 64px);
// `;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  thead {
  border-bottom: 1px solid ${props => props.theme.colors.border} !important;
  }
`;

const TableHeader = styled.th`
  padding: 14px 6px;
  text-align: ${props => props.$align || 'left'};
  font-weight: 800;
  font-size: 10px;
  font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  letter-spacing: 0.8px;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.cardBackground};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  text-transform: uppercase;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:first-child {
    padding-left: 16px;
  }
  
  &:last-child {
    padding-right: 16px;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 14px 6px;
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  vertical-align: middle;
  text-align: ${props => props.$align || 'left'};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: color 0.3s ease;
  white-space: nowrap;
  
  &:first-child {
    padding-left: 16px;
  }
  
  &:last-child {
    padding-right: 16px;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UserIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${props => props.$isManager ? '#f59e0b' : '#3b82f6'}; /* Manager: Turuncu, Employee: Mavi */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.div`
  font-weight: 600;
  font-size: 12px;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 2px;
  transition: color 0.3s ease;
  line-height: 1.2;
`;

const TeamName = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  transition: color 0.3s ease;
  font-weight: 500;
  margin-top: 2px;
  line-height: 1.2;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.theme.colors.success}20;
  color: ${props => props.theme.colors.success};
  transition: all 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primary}CC;
    transform: translateY(-1px);
  }
`;

const BlueCircle = styled.div`
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  margin: 0 auto;
`;

// New styled-components for clean table cell content
const StatusColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    // Farklı durumlara göre renk
    if (props.status === 'Active' || props.status === 'AT WORK') return '#10b981'; // Yeşil
    if (props.status === 'Available') return '#22c55e'; // Açık yeşil
    if (props.status === 'In Meeting') return '#f59e0b'; // Turuncu
    // if (props.status === 'On Break') return '#06b6d4'; // Cyan
    // if (props.status === 'Idle') return '#eab308'; // Sarı
    if (props.status === 'Holiday') return '#ec4899'; // Pembe
    if (props.status === 'Week Off') return '#8b5cf6'; // Mor
    return '#9ca3af'; // Varsayılan gri (OFF)
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
`;

const StatusText = styled.span`
  font-size: 11px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
  text-transform: uppercase;
`;

const StaffIdColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const StaffIdText = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.active ? '#10b981' : '#6b7280'};
  flex-shrink: 0;
`;

const StatusLabel = styled.span`
  font-size: 10px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const TimeColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimeText = styled.div`
  font-weight: 600;
  font-size: 11px;
  color: ${props => props.theme.colors.text.primary};
`;

const NoDataText = styled.span`
  color: #6b7280;
  font-size: 11px;
  font-style: italic;
`;

const ProductivityColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  flex-shrink: 0;
`;

const ProductivityCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${props => {
    // In dark mode, use white/light borders
    // In light mode, use dark borders
    const isDarkMode = props.theme.mode === '#fff';
    
    if (isDarkMode) {
      // Dark mode - white/light borders
      if (props.value >= 80) return '#d1fae5';  // Light green
      if (props.value >= 50) return '#fef3c7';  // Light yellow
      if (props.value > 0) return '#fee2e2';    // Light red
      return '#e5e7eb';  // Light gray
    } else {
      // Light mode - dark borders (original colors)
      if (props.value >= 80) return '#10b981';  // Green
      if (props.value >= 50) return '#f59e0b';  // Yellow
      if (props.value > 0) return '#ef4444';    // Red
      return '#374151';  // Dark gray
    }
  }} !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface};
  flex-shrink: 0;
`;

const EmptyStateCell = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
`;

// Pagination
const PaginationContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 16px 20px;
  margin: 0 32px 32px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme.colors.border};
  border-radius: 0 0 8px 8px;
  transition: all 0.3s ease;
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ItemsPerPageSelector = styled.select`
  padding: 6px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
  
  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$active ? '#ffffff' : props.theme.colors.text.primary};
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.$active 
      ? props.theme.colors.primary + 'CC' 
      : props.theme.colors.hover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary}40;
    outline-offset: 2px;
  }
`;

const QuickView = () => {
  const { t } = useLanguage();
  const { isDarkMode, theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Track last refresh time
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Sorting state
  const [sortBy, setSortBy] = useState('name'); // 'name' or other fields
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  
  // Dynamic employee data from API
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Timer management
  const [timerValues, setTimerValues] = useState({});
  const [runningTimers, setRunningTimers] = useState({});

  // Durum icon ve metin döndüren yardımcı fonksiyon
  const getStatusInfo = (status) => {
    const statusMap = {
      'Active': {
        text: t('atWork'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 576 512" fill="white">
            {/* Font Awesome - fa-desktop (Masaüstü PC) */}
            <path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V288H64V64H512z"/>
          </svg>
        )
      },
      'Available': {
        text: t('available'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <polyline points="17 11 19 13 23 9"/>
          </svg>
        )
      },
      'In Meeting': {
        text: t('inMeeting'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 640 512" fill="white">
            <path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192h42.7c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0H21.3C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7h42.7C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3H405.3zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352H378.7C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7H154.7c-14.7 0-26.7-11.9-26.7-26.7z"/>
          </svg>
        )
      },
      'Holiday': {
        text: t('holiday'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
            <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>
          </svg>
        )
      },
      'Week Off': {
        text: t('weekOff'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 448 512" fill="white">
            <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm80 64c-8.8 0-16 7.2-16 16v96c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80z"/>
          </svg>
        )
      },
      'Inactive': {
        text: t('offStatus'),
        icon: (
          <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
            <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"/>
          </svg>
        )
      }
    };

    return statusMap[status] || statusMap['Inactive'];
  };

  // Fetch users from QuickView API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = import.meta.env.DEV ? '/api' : 'https://dxdtime.ddsolutions.io/api';
      
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate || new Date().toISOString().split('T')[0];
      console.log(`🗓️ Fetching data for date: ${formattedDate}`);
      
      const apiUrl = `${apiBaseUrl}/quickview/?date=${formattedDate}`;
      console.log(`📡 QuickView API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`QuickView API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the response - structure may vary
      let usersArray = [];
      
      if (data?.data && Array.isArray(data.data)) {
        usersArray = data.data;
      } else if (data?.users && Array.isArray(data.users)) {
        usersArray = data.users;
      } else if (Array.isArray(data)) {
        usersArray = data;
      }

      // Transform QuickView API data to employee format
      const users = usersArray.map((user, index) => {
        // Extract user status from API (already comes as 'Active' or other status)
        const status = user.active || user.status || user.work_status || 'Inactive';
        
        // Get logged time - API already provides formatted string like '1h 41m'
        const loggedTime = user.logged_time || '0h 0m';

        return {
          id: user.id || user.user_id || user.staff_id || index,
          name: user.name || user.full_name || user.username || 'Unknown User',
          team: user.team || user.department || user.job_position || 'No Department',
          status: status,
          designation: user.designation || user.role || user.job_position || 'Staff',
          isAdmin: user.is_admin === true || user.is_admin === '1' || user.is_admin === 1 || false,
          email: user.email || 'N/A',
          isOnline: status === 'Active',
          staffId: user.staff_id || 'N/A',
          // QuickView API provides logged_time as formatted string (e.g., '1h 41m')
          loggedTime: loggedTime,
          productivity: user.productivity || 0,
          // Other fields from QuickView API
          productiveTime: 'N/A',
          meetingTime: 'N/A',
          breakTime: user.break_time || '0h 0m',
          idleTime: user.idle_time || '0h 0m',
          totalPrograms: user.total_programs || Math.floor(Math.random() * 10) + 1, // Sample data
          programNames: user.program_names || ['Chrome', 'VS Code', 'Slack'].join(', '), // Sample data
          originalData: user
        };
      });

      // Fetch additional data from new APIs with detailed error handling
      const fetchIdleTime = async () => {
        try {
          const url = `${apiBaseUrl}/auto_paused_records/?date=${formattedDate}`;
          console.log('Fetching idle time from:', url);
          const response = await fetch(url, {
            method: 'GET',
            headers: { 
              'Accept': 'application/json', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
            }
          });
          console.log('Idle time response status:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Idle time API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Idle time error response:', errorText);
            return null;
          }
          const data = await response.json();
          console.log('Idle time response data:', data);
          return data;
        } catch (error) {
          console.error('Idle time fetch error:', error);
          return null;
        }
      };

      const fetchMeetingTime = async () => {
        try {
          const url = `${apiBaseUrl}/meeting_time_summary/?date=${formattedDate}`;
          console.log('Fetching meeting time from:', url);
          const response = await fetch(url, {
            method: 'GET',
            headers: { 
              'Accept': 'application/json', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
            }
          });
          console.log('Meeting time response status:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Meeting time API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Meeting time error response:', errorText);
            return null;
          }
          const data = await response.json();
          console.log('Meeting time response data:', data);
          return data;
        } catch (error) {
          console.error('Meeting time fetch error:', error);
          return null;
        }
      };

      const fetchSyncStaffs = async () => {
        try {
          const url = `${apiBaseUrl}/sync-staffs`;
          console.log('Fetching sync-staffs from:', url);
          const response = await fetch(url, {
            method: 'GET',
            headers: { 
              'Accept': 'application/json', 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
            }
          });
          console.log('Sync-staffs response status:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Sync-staffs API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Sync-staffs error response:', errorText);
            return null;
          }
          const data = await response.json();
          console.log('Sync-staffs response data:', data);
          return data;
        } catch (error) {
          console.error('Sync-staffs fetch error:', error);
          return null;
        }
      };

      const [idleTimeData, meetingTimeData, syncStaffsData] = await Promise.all([
        fetchIdleTime(),
        fetchMeetingTime(),
        fetchSyncStaffs()
      ]);

      // Debug logging
      console.log('API Debug Info:');
      console.log('Date:', formattedDate);
      console.log('Idle Time API URL:', `${apiBaseUrl}/auto_paused_records/?date=${formattedDate}`);
      console.log('Meeting Time API URL:', `${apiBaseUrl}/meeting_time_summary/?date=${formattedDate}`);
      console.log('Sync-Staffs API URL:', `${apiBaseUrl}/sync-staffs`);
      console.log('Idle Time Data:', idleTimeData);
      console.log('Meeting Time Data:', meetingTimeData);
      console.log('Sync-Staffs Data:', syncStaffsData);

      // Create lookup maps for additional data
      const idleTimeLookup = {};
      const idleStaffInfo = {}; // Store idle time staff details
      
      // Handle the idle time API response structure with 'records' array
      if (idleTimeData?.records && Array.isArray(idleTimeData.records)) {
        console.log('📊 Processing idle time records array');
        console.log('📅 Date:', idleTimeData.date);
        console.log('👥 Total Staffs:', idleTimeData.total_staffs);
        console.log('📋 Records:', idleTimeData.records);
        
        idleTimeData.records.forEach(record => {
          const staffId = record.staff_id;
          const idleCount = record.total_count || 0;
          
          if (staffId) {
            idleTimeLookup[staffId] = `${idleCount} pauses`;
            idleStaffInfo[staffId] = {
              staffId: staffId,
              idleCount: idleCount,
              idleTime: `${idleCount} pauses`
            };
            console.log(`✅ Staff ID ${staffId} → Idle Time: ${idleCount} pauses`);
          }
        });
      } else if (idleTimeData?.data && Array.isArray(idleTimeData.data)) {
        console.log('Processing idle time data:', idleTimeData.data);
        idleTimeData.data.forEach(record => {
          const userId = record.user_id || record.id;
          if (userId) {
            idleTimeLookup[userId] = record.total_idle_time || record.idle_time || '0h 0m';
          }
        });
      } else if (Array.isArray(idleTimeData)) {
        console.log('Processing idle time data (direct array):', idleTimeData);
        idleTimeData.forEach(record => {
          const userId = record.user_id || record.id;
          if (userId) {
            idleTimeLookup[userId] = record.total_idle_time || record.idle_time || '0h 0m';
          }
        });
      }
      console.log('Idle Time Lookup:', idleTimeLookup);
      console.log('Idle Staff Info:', idleStaffInfo);

      // Create staff ID lookup from sync-staffs API
      const staffIdLookup = {};
      if (syncStaffsData?.data && Array.isArray(syncStaffsData.data)) {
        console.log('🔍 Processing sync-staffs data:', syncStaffsData.data);
        syncStaffsData.data.forEach(staff => {
          // Create lookup by name, email, and ID for flexible matching
          const staffName = staff.name?.toLowerCase().trim();
          const staffEmail = staff.email?.toLowerCase().trim();
          const staffId = staff.staff_id;
          const staffUserId = staff.id;
          
          if (staffName && staffId) {
            staffIdLookup[staffName] = {
              staffId: staffId,
              name: staff.name,
              email: staff.email,
              userId: staffUserId
            };
          }
          if (staffEmail && staffId) {
            staffIdLookup[staffEmail] = {
              staffId: staffId,
              name: staff.name,
              email: staff.email,
              userId: staffUserId
            };
          }
          if (staffUserId && staffId) {
            staffIdLookup[staffUserId] = {
              staffId: staffId,
              name: staff.name,
              email: staff.email,
              userId: staffUserId
            };
          }
          console.log(`✅ Mapped: ${staffName} (${staffEmail}) → Staff ID: ${staffId}`);
        });
      }
      console.log('📋 Staff ID Lookup Map:', staffIdLookup);

      const meetingTimeLookup = {};
      const meetingStaffInfo = {}; // Store staff details
      
      // Handle the meeting time API response structure with 'results' array
      if (meetingTimeData?.results && Array.isArray(meetingTimeData.results)) {
        console.log('📊 Processing meeting time results array');
        console.log('📅 Date:', meetingTimeData.date);
        console.log('👥 Total Staffs:', meetingTimeData.total_staffs);
        console.log('📋 Results:', meetingTimeData.results);
        
        meetingTimeData.results.forEach(record => {
          const staffId = record.staff_id;
          const meetingTime = record.total_meeting_time || '0h 0m';
          
          if (staffId) {
            meetingTimeLookup[staffId] = meetingTime;
            meetingStaffInfo[staffId] = {
              staffId: staffId,
              meetingTime: meetingTime
            };
            console.log(`✅ Staff ID ${staffId} → Meeting Time: ${meetingTime}`);
          }
        });
      } else if (meetingTimeData?.data && Array.isArray(meetingTimeData.data)) {
        console.log('Processing meeting time data:', meetingTimeData.data);
        meetingTimeData.data.forEach(record => {
          const staffId = record.staff_id || record.user_id || record.id;
          const meetingTime = record.total_meeting_time || record.meeting_time || '0h 0m';
          const staffName = record.staff_name || record.name || 'Unknown';
          
          if (staffId) {
            meetingTimeLookup[staffId] = meetingTime;
            meetingStaffInfo[staffId] = {
              staffId: staffId,
              staffName: staffName,
              meetingTime: meetingTime
            };
          }
        });
      } else if (Array.isArray(meetingTimeData)) {
        console.log('Processing meeting time data (direct array):', meetingTimeData);
        meetingTimeData.forEach(record => {
          const staffId = record.staff_id || record.user_id || record.id;
          const meetingTime = record.total_meeting_time || record.meeting_time || '0h 0m';
          const staffName = record.staff_name || record.name || 'Unknown';
          
          if (staffId) {
            meetingTimeLookup[staffId] = meetingTime;
            meetingStaffInfo[staffId] = {
              staffId: staffId,
              staffName: staffName,
              meetingTime: meetingTime
            };
          }
        });
      }
      console.log('Meeting Time Lookup:', meetingTimeLookup);
      console.log('Meeting Staff Info:', meetingStaffInfo);

      // Create a comprehensive user list by combining QuickView users and Meeting Time staff
      const allUserIds = new Set();
      const combinedUsers = [...users];
      
      // Add users from QuickView to the set
      users.forEach(user => {
        allUserIds.add(user.id);
      });
      
      // Add staff from meeting time API who might not be in QuickView
      Object.keys(meetingStaffInfo).forEach(staffId => {
        const numericStaffId = parseInt(staffId);
        const stringStaffId = String(staffId);
        
        // Check if this staff member is already in QuickView data
        const existsInQuickView = users.some(user => 
          user.id == staffId || 
          user.staffId == staffId ||
          user.id == numericStaffId ||
          user.staffId == numericStaffId
        );
        
        if (!existsInQuickView) {
          console.log(`➕ Adding missing staff from meeting data: Staff ID ${staffId}`);
          
          // Find staff info from sync-staffs data
          let staffInfo = null;
          Object.values(staffIdLookup).forEach(staff => {
            if (staff.staffId == staffId) {
              staffInfo = staff;
            }
          });
          
          // Create a user entry for this staff member
          const missingUser = {
            id: numericStaffId,
            name: staffInfo?.name || `Staff ${staffId}`,
            team: 'Unknown Department',
            status: 'Unknown',
            designation: 'Staff',
            isAdmin: false,
            email: staffInfo?.email || 'N/A',
            isOnline: false,
            staffId: staffId,
            loggedTime: '0h 0m',
            productivity: 0,
            productiveTime: 'N/A',
            meetingTime: meetingStaffInfo[staffId]?.meetingTime || 'N/A',
            breakTime: '0h 0m',
            idleTime: '0h 0m',
            totalPrograms: 0,
            programNames: 'N/A',
            syncStaffInfo: staffInfo,
            staffInfo: meetingStaffInfo[staffId],
            originalData: { fromMeetingAPI: true }
          };
          
          combinedUsers.push(missingUser);
          console.log(`✅ Added staff ${staffId} (${missingUser.name}) with meeting time: ${missingUser.meetingTime}`);
        }
      });

      // Add staff from idle time API who might not be in QuickView or Meeting data
      Object.keys(idleStaffInfo).forEach(staffId => {
        const numericStaffId = parseInt(staffId);
        const stringStaffId = String(staffId);
        
        // Check if this staff member is already in combined data
        const existsInCombined = combinedUsers.some(user => 
          user.id == staffId || 
          user.staffId == staffId ||
          user.id == numericStaffId ||
          user.staffId == numericStaffId
        );
        
        if (!existsInCombined) {
          console.log(`➕ Adding missing staff from idle time data: Staff ID ${staffId}`);
          
          // Find staff info from sync-staffs data
          let staffInfo = null;
          Object.values(staffIdLookup).forEach(staff => {
            if (staff.staffId == staffId) {
              staffInfo = staff;
            }
          });
          
          // Create a user entry for this staff member
          const missingUser = {
            id: numericStaffId,
            name: staffInfo?.name || `Staff ${staffId}`,
            team: 'Unknown Department',
            status: 'Unknown',
            designation: 'Staff',
            isAdmin: false,
            email: staffInfo?.email || 'N/A',
            isOnline: false,
            staffId: staffId,
            loggedTime: '0h 0m',
            productivity: 0,
            productiveTime: 'N/A',
            meetingTime: 'N/A',
            breakTime: '0h 0m',
            idleTime: idleStaffInfo[staffId]?.idleTime || '0 pauses',
            totalPrograms: 0,
            programNames: 'N/A',
            syncStaffInfo: staffInfo,
            staffInfo: null,
            originalData: { fromIdleAPI: true }
          };
          
          combinedUsers.push(missingUser);
          console.log(`✅ Added staff ${staffId} (${missingUser.name}) with idle time: ${missingUser.idleTime}`);
        }
      });

      // Update users with additional API data and staff info
      const updatedUsers = combinedUsers.map(user => {
        const staffInfo = meetingStaffInfo[user.id];
        
        // Try to find actual staff ID from sync-staffs API
        const userName = user.name?.toLowerCase().trim();
        const userEmail = user.email?.toLowerCase().trim();
        const userId = user.id;
        
        let actualStaffId = user.staffId; // Default to original
        let syncStaffInfo = null;
        
        // Look up in sync-staffs data by name, email, or ID
        if (userName && staffIdLookup[userName]) {
          syncStaffInfo = staffIdLookup[userName];
          actualStaffId = syncStaffInfo.staffId;
          console.log(`🎯 Found staff by name: ${userName} → ${actualStaffId}`);
        } else if (userEmail && staffIdLookup[userEmail]) {
          syncStaffInfo = staffIdLookup[userEmail];
          actualStaffId = syncStaffInfo.staffId;
          console.log(`🎯 Found staff by email: ${userEmail} → ${actualStaffId}`);
        } else if (userId && staffIdLookup[userId]) {
          syncStaffInfo = staffIdLookup[userId];
          actualStaffId = syncStaffInfo.staffId;
          console.log(`🎯 Found staff by ID: ${userId} → ${actualStaffId}`);
        } else {
          console.log(`❌ No staff match found for: ${userName} (${userEmail}) [ID: ${userId}]`);
        }
        
        // Get meeting time using the actual staff ID
        let userMeetingTime = 'N/A';
        
        // Try multiple ways to find meeting time
        if (actualStaffId && actualStaffId !== 'N/A') {
          // Convert staff ID to string and number for flexible lookup
          const staffIdStr = String(actualStaffId);
          const staffIdNum = parseInt(actualStaffId);
          
          userMeetingTime = meetingTimeLookup[staffIdStr] || 
                           meetingTimeLookup[staffIdNum] || 
                           meetingTimeLookup[actualStaffId] ||
                           meetingTimeLookup[user.id] || 
                           'N/A';
          
          console.log(`🔍 Looking for meeting time - Staff ID: ${actualStaffId} (${typeof actualStaffId})`);
          console.log(`🔍 Available meeting time keys:`, Object.keys(meetingTimeLookup));
          console.log(`🔍 Meeting time result: ${userMeetingTime}`);
          
          if (userMeetingTime !== 'N/A') {
            console.log(`📅 ✅ Meeting time found for Staff ID ${actualStaffId}: ${userMeetingTime}`);
          } else {
            console.log(`📅 ❌ No meeting time found for Staff ID ${actualStaffId}`);
          }
        } else {
          console.log(`📅 ⚠️ No valid staff ID for user ${user.name} (${user.id})`);
        }
        
        // Get idle time using the actual staff ID
        let userIdleTime = '0h 0m';
        
        // Try multiple ways to find idle time
        if (actualStaffId && actualStaffId !== 'N/A') {
          // Convert staff ID to string and number for flexible lookup
          const staffIdStr = String(actualStaffId);
          const staffIdNum = parseInt(actualStaffId);
          
          userIdleTime = idleTimeLookup[staffIdStr] || 
                        idleTimeLookup[staffIdNum] || 
                        idleTimeLookup[actualStaffId] ||
                        idleTimeLookup[user.id] || 
                        user.idleTime || 
                        '0h 0m';
          
          console.log(`🔍 Looking for idle time - Staff ID: ${actualStaffId} (${typeof actualStaffId})`);
          console.log(`🔍 Available idle time keys:`, Object.keys(idleTimeLookup));
          console.log(`🔍 Idle time result: ${userIdleTime}`);
          
          if (userIdleTime !== '0h 0m') {
            console.log(`⏸️ ✅ Idle time found for Staff ID ${actualStaffId}: ${userIdleTime}`);
          } else {
            console.log(`⏸️ ❌ No idle time found for Staff ID ${actualStaffId}`);
          }
        } else {
          userIdleTime = user.idleTime || '0h 0m';
          console.log(`⏸️ ⚠️ Using default idle time for user ${user.name} (${user.id}): ${userIdleTime}`);
        }
        
        return {
          ...user,
          idleTime: userIdleTime,
          meetingTime: userMeetingTime,
          // Update staff ID with actual value from sync-staffs
          staffId: actualStaffId,
          syncStaffInfo: syncStaffInfo,
          // Add staff info for display
          staffInfo: staffInfo || null
        };
      });

      console.log('👥 Updated Users with Staff Info:', updatedUsers.filter(u => u.syncStaffInfo).map(u => ({ 
        id: u.id, 
        name: u.name, 
        staffId: u.staffId,
        syncStaffInfo: u.syncStaffInfo 
      })));

      setEmployeesData(updatedUsers);
      setLastRefresh(new Date());
      
    } catch (error) {
      setError(`Failed to load QuickView data: ${error.message}`);
      setEmployeesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount and when selectedDate changes
  useEffect(() => {
    console.log(`📅 Date changed to: ${selectedDate} - Fetching new data...`);
    fetchUsers();
  }, [selectedDate]); // Re-fetch when date changes

  // Refresh data manually
  const handleRefresh = () => {
    fetchUsers();
  };

  // API Testing Functions
  const testPostAPI = async (userId, userData) => {
    const apiBaseUrl = import.meta.env.DEV ? '/api' : 'https://dxdtime.ddsolutions.io/api';
    const apiUrl = `${apiBaseUrl}/auth/users/${userId}/update/`;
    
    const postRequestBody = {
      user_id: userId,
      action: 'update_profile',
      data: userData,
      timestamp: new Date().toISOString(),
      source: 'dashboard_quickview'
    };
    
    const postRequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
      },
      body: JSON.stringify(postRequestBody)
    };
    
    try {
      const response = await fetch(apiUrl, postRequestConfig);
      const result = await response.json();
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };
  
  const testPutAPI = async (userId, userData) => {
    const apiBaseUrl = import.meta.env.DEV ? '/api' : 'https://dxdtime.ddsolutions.io/api';
    const apiUrl = `${apiBaseUrl}/auth/users/${userId}/`;
    
    const putRequestBody = {
      user_id: userId,
      full_name: userData.name,
      email: userData.email,
      profile: {
        job_title: userData.designation,
        organization_name: userData.team,
        updated_at: new Date().toISOString()
      },
      is_active: userData.status === 'Active',
      updated_by: 'dashboard_admin'
    };
    
    const putRequestConfig = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`
      },
      body: JSON.stringify(putRequestBody)
    };
    
    try {
      const response = await fetch(apiUrl, putRequestConfig);
      const result = await response.json();
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  const testTimerAPI = async (userId, username, action, timerData) => {
    const apiBaseUrl = import.meta.env.DEV ? '/api' : 'https://dxdtime.ddsolutions.io/api';
    const apiUrl = `${apiBaseUrl}/timer/sessions/`;
    
    const timerRequestBody = {
      user_id: userId,
      username: username,
      action: action, // 'start', 'stop', 'pause'
      timer_duration: timerData.duration,
      session_data: {
        start_time: timerData.startTime,
        expected_duration: timerData.duration,
        browser_info: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      metadata: {
        source: 'quickview_dashboard',
        timestamp: new Date().toISOString(),
        session_id: timerData.sessionId
      }
    };
    
    const timerRequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'no-token'}`,
        'X-Session-ID': timerData.sessionId
      },
      body: JSON.stringify(timerRequestBody)
    };
    
    try {
      const response = await fetch(apiUrl, timerRequestConfig);
      const result = await response.json();
      return result;
    } catch (error) {
      return { error: error.message };
    }
  };

  // Timer functions
  const handleTimerValueChange = (userId, value) => {
    setTimerValues(prev => ({
      ...prev,
      [userId]: parseInt(value) || 0
    }));
  };

  // Send numeric value to API
  const sendNumericValueToAPI = async (userId, numericValue, username) => {
    try {
      const apiBaseUrl = import.meta.env.DEV ? '/api' : 'https://dxdtime.ddsolutions.io/api';
      const apiUrl = `${apiBaseUrl}/auth/register/post_users/`;
      


      const requestData = {
        user_id: userId,
        numeric_value: numericValue
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        toastService.success(`✅ Numeric value ${numericValue} sent successfully for ${username}!`);
        
        // Refresh user data to reflect the update
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } else {
        throw new Error(result.message || 'Unknown API error');
      }

    } catch (error) {
      toastService.error(`❌ Failed to send numeric value for ${username}: ${error.message}`);
    }
  };

  const handleStartTimer = async (userId, username) => {
    const timerSeconds = timerValues[userId] || 5; // Default 5 seconds
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Test Timer API with POST request
    const timerData = {
      duration: timerSeconds,
      startTime: new Date().toISOString(),
      sessionId: sessionId
    };
    
    // Call the Timer API test
    await testTimerAPI(userId, username, 'start', timerData);
    
    // Mark timer as running
    setRunningTimers(prev => ({
      ...prev,
      [userId]: true
    }));

    // Send numeric value to API immediately when timer starts
    await sendNumericValueToAPI(userId, timerSeconds, username);

    // Simulate timer countdown
    setTimeout(async () => {
      // Test Timer API completion
      const completeTimerData = {
        ...timerData,
        endTime: new Date().toISOString(),
        actualDuration: timerSeconds
      };
      
      await testTimerAPI(userId, username, 'complete', completeTimerData);
      
      setRunningTimers(prev => ({
        ...prev,
        [userId]: false
      }));
      toastService.success(`⏰ Timer completed for ${username}! (${timerSeconds} seconds)`);
    }, timerSeconds * 1000);
  };

  // Reset user numeric value to 0
  const handleResetUser = async (userId, username) => {
    // Send 0 value to API to reset user in SQL database
    await sendNumericValueToAPI(userId, 0, username);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filter employees based on search query and status
  const filteredEmployees = employeesData.filter(employee =>
    (employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     employee.designation.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'All' || employee.status === statusFilter)
  );

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

  return (
    <DashboardLayout headerTitle={t('quickView')} headerBreadcrumb={`${t('home')} / ${t('quickView')}`}>
      <EmployeesPageWrapper theme={theme}>
        {/* Page Header */}
        <PageHeader>
          <TitleSection>
            <PageTitle theme={theme}>{t('quickViewTitle')}</PageTitle>
            <Tooltip text={t('quickViewTooltip')} theme={theme}>
              {/* <InfoIcon theme={theme}>ⓘ</InfoIcon> */}
            </Tooltip>
          </TitleSection>
          
          {/* Controls */}
          <ControlsSection>
            <LeftControls>
              <SearchInput
                theme={theme}
                type="text"
                placeholder={t('search').toUpperCase()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </LeftControls>
            
            <RightControls>
              <DateLabel theme={theme}>{t('selectDate').toUpperCase()}</DateLabel>
              <DateInput
                theme={theme}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min={(() => {
                  const threeMonthsAgo = new Date();
                  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                  return threeMonthsAgo.toISOString().split('T')[0];
                })()}
                title={`Current date: ${selectedDate} - Change to filter data by date`}
              />
              {lastRefresh && !loading && (
                <div style={{
                  fontSize: '10px',
                  color: theme.colors.text.secondary,
                  marginLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>🔄</span>
                  <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
                </div>
              )}
              <div style={{
                fontSize: '11px',
                color: theme.colors.text.secondary,
                marginTop: '4px',
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                📊 Showing data for: <strong>{selectedDate}</strong>
              </div>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </RightControls>
          </ControlsSection>
          
          {loading && (
            <LoadingMessage theme={theme}>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
              {' '}Loading data for <strong>{selectedDate}</strong>...
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                📊 QuickView • 📅 Meeting Times • 👥 Staff Records
              </div>
            </LoadingMessage>
          )}
          
          {error && (
            <ErrorMessage theme={theme}>
              ⚠️ {error}
              <button 
                onClick={handleRefresh}
                style={{
                  marginLeft: '12px',
                  padding: '4px 12px',
                  background: 'white',
                  color: theme.colors.error,
                  border: `1px solid ${theme.colors.error}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                {t('retry')}
              </button>
            </ErrorMessage>
          )}
          
          {!loading && !error && employeesData.length === 0 && (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center',
              color: theme.colors.text.secondary,
              fontSize: '14px',
              marginTop: '16px',
              background: theme.colors.surface,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{t('noDataFound')} {selectedDate}</div>
              <div style={{ fontSize: '12px' }}>{t('tryDifferentDate')}</div>
            </div>
          )}
        </PageHeader>

        {/* Meeting Time Staff Summary */}
        {!loading && !error && employeesData.length > 0 && (
          <div style={{
            background: theme.colors.surface,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                color: theme.colors.text.primary,
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📅 Meeting Time Details - {selectedDate}
              </h3>
              <span style={{
                fontSize: '12px',
                color: theme.colors.text.secondary,
                background: theme.colors.background,
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                {employeesData.filter(emp => emp.staffInfo && emp.meetingTime !== 'N/A').length} staff with meetings
              </span>
            </div>

            {/* Staff with Meeting Time */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {employeesData
                .filter(emp => emp.staffInfo && emp.meetingTime !== 'N/A')
                .map(employee => (
                  <div
                    key={employee.id}
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.success}40`,
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>
                        {employee.staffInfo.staffName}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: theme.colors.text.secondary,
                        marginBottom: '4px'
                      }}>
                        Staff ID: {employee.staffInfo.staffId}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: theme.colors.success,
                        fontWeight: '600',
                        background: `${theme.colors.success}15`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        📅 {employee.meetingTime}
                      </div>
                    </div>
                  </div>
                ))}
              
              {employeesData.filter(emp => emp.staffInfo && emp.meetingTime !== 'N/A').length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: theme.colors.text.secondary,
                  fontSize: '14px',
                  padding: '20px',
                  gridColumn: '1 / -1'
                }}>
                  📭 No staff in meetings today
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <TableWrapper>
          <Box sx={{
            margin: '0 32px 32px 32px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            {/* Employee Header Bar */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px 12px 0 0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="subtitle1" sx={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'white',
                letterSpacing: '0.5px'
              }}>
                👥 EMPLOYEE QUICK VIEW
              </Typography>
              <Typography variant="body2" sx={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500
              }}>
                {selectedDate}
              </Typography>
            </Box>

            <TableContainer 
              component={Paper}
              sx={{
                maxWidth: '100%',
                overflowX: 'auto',
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0
              }}
            >
              <MuiTable sx={{ minWidth: 1000 }} size="medium">
                <TableHead>
                  <MuiTableRow sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'white',
                      whiteSpace: 'nowrap',
                      borderBottom: 'none',
                      padding: '16px 20px',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                    }
                  }}>
                    <MuiTableCell align="center" sx={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                      {t('employeeName').toUpperCase()} {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text="Employee Staff ID from system" theme={theme} icon="">
                        STAFF ID
                      </Tooltip>
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text={t('totalTimeLogged')} theme={theme} icon="">
                        {t('loggedTime').toUpperCase()}
                      </Tooltip>
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text={t('timeProductiveActivities')} theme={theme} icon="">
                        {t('productive').toUpperCase()}
                      </Tooltip>
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text={t('timeMeetings')} theme={theme} icon="">
                        {t('meeting').toUpperCase()}
                      </Tooltip>
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text={t('timeIdle')} theme={theme} icon="">
                        {t('idleTime').toUpperCase()}
                      </Tooltip>
                    </MuiTableCell>
                    <MuiTableCell align="center">
                      <Tooltip text="Total number of programs used by the employee" theme={theme} icon="">
                        TOTAL PROGRAMS
                      </Tooltip>
                    </MuiTableCell>
                  </MuiTableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee, rowIndex) => {
                      const statusInfo = getStatusInfo(employee.status);
                      
                      return (
                        <MuiTableRow
                          key={employee.id}
                          sx={{
                            backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8f9fa',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: '#f0f4ff',
                              transform: 'scale(1.01)',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
                              cursor: 'pointer'
                            },
                            '&:last-child td': {
                              borderBottom: 'none'
                            },
                            '& .MuiTableCell-body': {
                              fontSize: '14px',
                              color: theme.colors.text.primary,
                              borderBottom: '1px solid #e5e7eb',
                              padding: '14px 20px',
                              fontWeight: 500,
                              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                            }
                          }}
                        >
                          <MuiTableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <Box sx={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: employee.isAdmin 
                                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 700,
                                flexShrink: 0,
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                              }}>
                                {employee.isAdmin ? 'M' : 'E'}
                              </Box>
                              <Box>
                                <Typography sx={{
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  color: theme.colors.text.primary,
                                  marginBottom: '2px'
                                }}>
                                  {employee.name}
                                </Typography>
                                <Typography sx={{
                                  fontSize: '12px',
                                  color: theme.colors.text.secondary,
                                  fontWeight: 500
                                }}>
                                  {employee.team || employee.designation || 'No Department'}
                                </Typography>
                              </Box>
                            </Box>
                          </MuiTableCell>
                          
                          <MuiTableCell align="center" sx={{ 
                            fontWeight: 600,
                            color: '#667eea'
                          }}>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(102, 126, 234, 0.1)',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              fontSize: '13px',
                              fontWeight: 700
                            }}>
                              🆔 {employee.staffId || employee.id || 'N/A'}
                            </Box>
                          </MuiTableCell>
                          
                          <MuiTableCell align="center" sx={{ 
                            fontWeight: 600,
                            color: '#1e40af'
                          }}>
                            {employee.loggedTime || '0h 0m'}
                          </MuiTableCell>
                          
                          <MuiTableCell align="center" sx={{ 
                            fontWeight: 600,
                            color: '#059669'
                          }}>
                            {employee.productiveTime === 'N/A' ? '0h 0m' : employee.productiveTime}
                          </MuiTableCell>
                          
                          <MuiTableCell align="center" sx={{ 
                            color: '#7c3aed',
                            fontWeight: 600
                          }}>
                            {employee.meetingTime === 'N/A' ? '0h 0m' : employee.meetingTime}
                          </MuiTableCell>
                          
                          <MuiTableCell align="center" sx={{ 
                            color: '#dc2626',
                            fontWeight: 600
                          }}>
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(220, 38, 38, 0.1)',
                              border: '1px solid rgba(220, 38, 38, 0.3)',
                              fontSize: '13px'
                            }}>
                              ⏸️ {employee.idleTime === 'N/A' ? '0h 0m' : employee.idleTime}
                            </Box>
                          </MuiTableCell>
                          
                          <MuiTableCell align="center">
                            <Box sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#3b82f6'
                            }}>
                              💻 {employee.totalPrograms || 0}
                            </Box>
                          </MuiTableCell>
                        </MuiTableRow>
                      );
                    })
                  ) : (
                    <MuiTableRow>
                      <MuiTableCell colSpan="7" align="center" sx={{ padding: '40px' }}>
                        <Typography variant="body1" sx={{ color: theme.colors.text.secondary }}>
                          {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                              <CircularProgress size={30} sx={{ color: theme.colors.primary }} />
                            </Box>
                          ) : (
                            t('noEmployeesFound')
                          )}
                        </Typography>
                      </MuiTableCell>
                    </MuiTableRow>
                  )}
                </TableBody>
              </MuiTable>
            </TableContainer>
          </Box>
        </TableWrapper>

        {/* Pagination */}
        {sortedEmployees.length > 0 && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb',
            margin: '0 32px 32px 32px',
            padding: '16px 0'
          }}>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              Employees per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                sx={{
                  fontSize: '14px',
                  height: '32px'
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              {startIndex + 1} - {Math.min(endIndex, sortedEmployees.length)} of {sortedEmployees.length}
            </Typography>
            <IconButton
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              size="small"
              sx={{
                border: '1px solid #d1d5db',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <KeyboardDoubleArrowRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </EmployeesPageWrapper>
    </DashboardLayout>
  );
};

export default QuickView;
