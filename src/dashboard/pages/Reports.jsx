import React, { useState, useEffect, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  TaskTab,
  ScreensTab,
  FocusTimelineTab,
  IdleTab,
  BreaksMeetTab,
  TimeLogSummaryTab,
  TopActivityTab,
  ActivityPatternTab,
  OTReportTab,
  MonitoringActionsTab,
  OfflineTab,
  AdvancedReportTab
} from '../components/reports';
import {
  ReportsWrapper,
  ReportsLayout,
  EmployeeSelection,
  EmployeeHeader,
  EmployeeSearchInput,
  EmployeeList,
  EmployeeItem,
  EmployeeInner,
  EmployeeName,
  EmployeeDepartment,
  ReportsContent,
  ReportsHeader,
  ActivePassiveContainer,
  TimeSection,
  TimeSectionLabel,
  TimeSectionValue,
  TimeBreakdown,
  TimeCategory,
  CategoryHeader,
  CategoryValue,
  CategoryPercentage,
  CategoryIcon,
  FilterSection,
  FilterRow,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  CalendarGrid,
  CalendarDay,
  DayHeader,
  HourGrid,
  HourSlot,
  SummaryContainer,
  SummaryText,
  TabContainer,
  TabScrollContainer,
  TabButton,
  TabIcon,
  NavigationArrow,
  DataIndicator
} from './Reports.styles';
import CircularProgress from '@mui/material/CircularProgress';
import {
  getProfilePhotoUrl,
  fetchScreenshotsData as fetchScreenshotsDataUtil
} from '../../utils/reportUtils';
import { InputLabel, MenuItem, Select } from '@mui/material';

const Reports = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Define constants first
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Filter states - Set defaults to current date
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonthIndex = currentDate.getMonth();
  const currentDay = currentDate.getDate().toString();
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [syncStaffsUsers, setSyncStaffsUsers] = useState([]); // Users from sync-staffs API
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users for search
  
  // API Data States
  const [meetingTimeData, setMeetingTimeData] = useState(null);
  const [idleTimeData, setIdleTimeData] = useState(null);
  const [focusTimelineData, setFocusTimelineData] = useState(null);
  const [taskReportData, setTaskReportData] = useState(null);
  const [loggedTimeData, setLoggedTimeData] = useState(null);
  const [screenshotCountData, setScreenshotCountData] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [screenshotsTotal, setScreenshotsTotal] = useState(0);
  const [screenshotsPage, setScreenshotsPage] = useState(1);
  const [screenshotsPerPage, setScreenshotsPerPage] = useState(10);
  const [screenshotsDateRange, setScreenshotsDateRange] = useState([null, null]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [screenshotsError, setScreenshotsError] = useState(null);
  const [monitoringActionsData, setMonitoringActionsData] = useState(null);
  const [idleQuickviewData, setIdleQuickviewData] = useState(null);
  const [activityPatternData, setActivityPatternData] = useState(null);
  const [advancedReportData, setAdvancedReportData] = useState(null);
  const [isLoadingReportData, setIsLoadingReportData] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [dataAvailability, setDataAvailability] = useState(null);
  const [screenshotsOrder, setScreenshotsOrder] = useState('desc');
        
  // Ref to prevent concurrent API calls
  const isFetchingRef = useRef(false);
  const isFetchingAdvancedReportRef = useRef(false);
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const [selectedDate, setSelectedDate] = useState(currentDay);
  const [selectedHour, setSelectedHour] = useState('All');
  const [activeTab, setActiveTab] = useState('SCREENS'); // Start with Focus Timeline
  const [activeTimeLogTab, setActiveTimeLogTab] = useState('WEEKLY');

  const computeDefaultScreenshotRange = useCallback(() => {
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0) {
      return [null, null];
    }

    const baseMonth = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthStart = dayjs(`${baseMonth}-01`).startOf('day');

    if (selectedDate) {
      const normalizedDate = dayjs(`${baseMonth}-${String(selectedDate).padStart(2, '0')}`).startOf('day');
      return [normalizedDate, normalizedDate];
    }

    const monthEnd = monthStart.endOf('month').startOf('day');
    return [monthStart, monthEnd];
  }, [months, selectedMonth, selectedYear, selectedDate]);

  // Tab scroll states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabScrollRef = React.useRef(null);

  // Tab data
  const tabs = [
    { id: 'SCREENS', name: 'SCREENS', icon: '🖥️' },
    { id: 'FOCUS_TIMELINE', name: 'FOCUS TIMELINE', icon: '⏱️' },
    { id: 'TASK', name: 'TASK', icon: '📋' },
    { id: 'ACTIVITY_PATTERN', name: 'ACTIVITY PATTERN', icon: '📊' },
    { id: 'TOP_ACTIVITY', name: 'TOP ACTIVITY', icon: '🔥' },
    // { id: 'OT_REPORT', name: 'OT REPORT', icon: '📈' },
    { id: 'MONITORING_ACTIONS', name: 'MONITORING ACTIONS', icon: '👁️' },
    { id: 'BREAKS_MEET', name: 'MEETINGS', icon: '☕' },
    { id: 'IDLE', name: 'IDLE', icon: '😴' },
    { id: 'ADVANCED_REPORT', name: 'ADVANCED REPORT', icon: '📊' },
    // { id: 'OFFLINE', name: 'OFFLINE', icon: '📴' },
    // { id: 'TIME_LOG_SUMMARY', name: 'TIME LOG SUMMARY', icon: '📅' },
  ];


  // Calculate total duration
  const totalDuration = '3h 35m';

  // Work time data for TOP_ACTIVITY tab
  const workTimeData = [
    { label: 'IDLE', value: '0h 6m', percentage: 1.82, color: '#6b7280' },
    { label: 'MEETING', value: '0h 20m', percentage: 6.19, color: '#3b82f6' },
    { label: 'BREAKS', value: '0h 54m', percentage: 16.14, color: '#f97316' },
    { label: 'Active hours', value: '4h 30m', percentage: 82.04, color: '#10b981' },
  ];

  // Application usage data
  const applicationData = [
    { name: 'Google-chrome', duration: '3h 25m', percentage: '98%', color: '#4285f4' },
    { name: 'Wine', duration: '0h 15m', percentage: '22%', color: '#8b5cf6' },
    { name: 'firefox', duration: '0h 3m', percentage: '3%', color: '#ff7139' },
    { name: 'Google-chrome-s', duration: '0h 1m', percentage: '2%', color: '#4285f4' },
    { name: 'libreoffice-calc', duration: '0h 1m', percentage: '1%', color: '#0369a1' },
  ];

  // Break data for BREAKS_MEET tab
  const breakData = [
    { start: '2:24 PM', stop: '3:17 PM', duration: '0h 53m' }
  ];

  // Meeting data for BREAKS_MEET tab
  const meetingData = [
    { start: '2:03 PM', stop: '2:24 PM', duration: '0h 20m' }
  ];

  // Defined break data
  const definedBreakData = [
    { start: '11:00 AM', stop: '11:15 AM', duration: '0h 15m' },
    { start: '2:00 PM', stop: '2:30 PM', duration: '0h 30m' },
    { start: '5:30 PM', stop: '5:45 PM', duration: '0h 15m' }
  ];

  // IDLE data for IDLE tab
  const idleData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  // OFFLINE data for OFFLINE tab
  const offlineData = [
    { start: '10:59 AM', stop: '11:11 AM', duration: '0h 12m' },
    { start: '11:25 AM', stop: '11:29 AM', duration: '0h 4m' },
    { start: '4:26 PM', stop: '4:31 PM', duration: '0h 5m' },
    { start: '5:08 PM', stop: '5:13 PM', duration: '0h 5m' },
    { start: '6:39 PM', stop: '6:42 PM', duration: '0h 3m' }
  ];

  // Fetch users from sync-staffs API (same as ActivityStream)
  const fetchSyncStaffsUsers = async () => {
    try {
      const response = await fetch('/api/sync-staffs/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const staffList = data.data || [];
      
      if (staffList && Array.isArray(staffList) && staffList.length > 0) {
        // Map sync-staffs data to our user format
        const formattedUsers = staffList.filter(staff => staff.email).map(staff => ({
          id: staff.id || staff.email,
          email: staff.email,
          username: staff.name || staff.email,
          display_name: staff.name || staff.email,
          name: staff.name || staff.email, // For compatibility
          department: staff.job_position || 'No Department',
          staff_id: staff.staff_id,
          profile_url: staff.profile_url,
          phone_number: staff.phone_number,
          job_position: staff.job_position || '',
          screenshot_interval: staff.screenshot_interval,
          totalScreenshots: 0, // Will be loaded when user is selected
          status: 'active'
        }));

        setSyncStaffsUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        setEmployees(formattedUsers);
        
        if (formattedUsers.length > 0) {
          setSelectedEmployee(prev => prev || formattedUsers[0]);
        }
        
        return formattedUsers;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to load users:', error.message);
      return [];
    }
  };

  // API Functions for Employee Reports
  const fetchMeetingTimeData = async (employee, month) => {
    if (!employee?.staff_id) return null;
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/meeting_summary/monthly/?staff_id=${employee.staff_id}&month=${month}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Meeting Time Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching meeting time data:', error);
    }
    return null;
  };

  const fetchIdleTimeData = async (employee, month) => {
    if (!employee?.staff_id) return null;
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/idle_summary/?staff_id=${employee.staff_id}&month=${month}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Idle Time Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching idle time data:', error);
    }
    return null;
  };

  const fetchFocusTimelineData = async (employee, month) => {
    if (!employee?.email) {
      console.log('❌ Focus Timeline API: No employee email provided');
      return null;
    }
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/focus_timeline/?email=${employee.email}&month=${month}`;
      
      // TEMPORARY TEST: Return sample data if email matches test data
 
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Focus Timeline Data received:', data);
        return data;
      } else {
        console.log('❌ Focus Timeline API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching focus timeline data:', error);
    }
    return null;
  };

  const fetchTaskReportData = async (employee, month) => {
    if (!employee?.email) {
      console.log('❌ fetchTaskReportData: No employee email provided');
      return null;
    }
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/monthly_task_report/?email=${employee.email}&month=${month}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Task Report Data received:', data);
        return data;
      } else {
        console.log('❌ fetchTaskReportData: API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching task report data:', error);
    }
    return null;
  };

  const fetchLoggedTimeData = async (employee, month, date = null) => {
    if (!employee?.email) return null;
    
    try {
      let url;
      if (date) {
        // Daily logged time
        url = `https://dxdtime.ddsolutions.io/api/logged_time?email=${employee.email}&date=${date}`;
      } else {
        // Monthly logged time
        url = `https://dxdtime.ddsolutions.io/api/logged_time/monthly/?email=${employee.email}&month=${month}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Logged Time Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching logged time data:', error);
    }
    return null;
  };

  const fetchScreenshotCountData = async (date) => {
    try {
      const url = `https://dxdtime.ddsolutions.io/api/screenshot_count/?date=${date}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Screenshot Count Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching screenshot count data:', error);
    }
    return null;
  };

  const fetchMonitoringActionsData = async (employee, startDate = null, endDate = null) => {
    if (!employee?.staff_id) return null;
    
    try {
      let url = `https://dxdtime.ddsolutions.io/api/monitoring-action/?staff_id=${employee.staff_id}`;
      
      // Add date range parameters (always provided - either selected date or current date)
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      } else {
        // Fallback to current date if not provided
        const currentDate = new Date().toISOString().split('T')[0];
        url += `&start_date=${currentDate}&end_date=${currentDate}`;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Monitoring Actions Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching monitoring actions data:', error);
    }
    return null;
  };

  const fetchIdleTimeQuickview = async (employee, date) => {
    if (!employee?.staff_id) return null;
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/auto_paused_records/?staff_id=${employee.staff_id}&date=${date}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Idle Time Quickview Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching idle time quickview data:', error);
    }
    return null;
  };

  const fetchDataAvailability = async (employee, month) => {
    if (!employee?.email) return null;
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/users/data-availability/?email=${employee.email}&month=${month}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Data Availability:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching data availability:', error);
    }
    return null;
  };

  const fetchActivityPatternData = async (employee, date) => {
    if (!employee?.staff_id || !date) return null;
    
    try {
      const url = `https://dxdtime.ddsolutions.io/api/activity-pattern/?staff_id=${employee.staff_id}&date=${date}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Activity Pattern Data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error fetching activity pattern data:', error);
    }
    return null;
  };

  const fetchAdvancedReportData = async (employee, startDate, endDate, period = null) => {
    if (!employee?.staff_id) return null;
    
    try {
      let url;
      if (period) {
        // Use period parameter (this_month, this_week, etc.)
        url = `https://dxdtime.ddsolutions.io/api/advanced-report/?staff_id=${employee.staff_id}&period=${period}`;
      } else if (startDate && endDate) {
        // Use date range
        url = `https://dxdtime.ddsolutions.io/api/advanced-report/?staff_id=${employee.staff_id}&start_date=${startDate}&end_date=${endDate}`;
      } else {
        return null;
      }
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Advanced Report Data:', data);
        return data;
      } else {
        console.log('Advanced Report API Error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching advanced report data:', error);
    }
    return null;
  };

  const fetchScreenshotsData = useCallback((params) => fetchScreenshotsDataUtil(params), []);

  const applyScreenshotResult = useCallback((result, meta) => {
    const { page, perPage, dateRange } = meta;

    if (result?.error) {
      setScreenshotsError(result.error);
    } else {
      setScreenshotsError(null);
    }

    setScreenshots(result?.items ?? []);
    setScreenshotsTotal(result?.total ?? 0);
    
    // Only update page if it's different to prevent unnecessary re-renders
    setScreenshotsPage(prev => {
      const newPage = result?.page ?? page ?? 1;
      return prev !== newPage ? newPage : prev;
    });
    
    // Only update perPage if it's different to prevent infinite loops
    setScreenshotsPerPage(prev => {
      const newPerPage = perPage ?? 10;
      return prev !== newPerPage ? newPerPage : prev;
    });

    if (Array.isArray(dateRange)) {
      setScreenshotsDateRange(prev => {
        // Only update if the range actually changed
        const [prevStart, prevEnd] = prev || [null, null];
        const [newStart, newEnd] = dateRange || [null, null];
        if (prevStart?.valueOf() === newStart?.valueOf() && prevEnd?.valueOf() === newEnd?.valueOf()) {
          return prev;
        }
        return dateRange;
      });
    }
  }, []);

  const loadScreenshots = useCallback(async ({
    page = screenshotsPage,
    perPage = screenshotsPerPage,
    dateRange,
    order = screenshotsOrder,
    showLoader = true
  } = {}) => {
    if (!selectedEmployee?.email) {
      setScreenshots([]);
      setScreenshotsTotal(0);
      setScreenshotsError('Please select an employee to view screenshots.');
      return;
    }

    const targetRange = Array.isArray(dateRange)
      ? dateRange
      : (screenshotsDateRange[0] && screenshotsDateRange[1])
        ? screenshotsDateRange
        : computeDefaultScreenshotRange();

    if (showLoader) {
      setIsLoadingScreenshots(true);
    }
    setScreenshotsError(null);

    try {
      const result = await fetchScreenshotsData({
        employee: selectedEmployee,
        page,
        perPage,
        dateRange: targetRange,
        order: order || screenshotsOrder,
      });

      applyScreenshotResult(result, { page, perPage, dateRange: targetRange });
    } catch (error) {
      console.error('Failed to load screenshots:', error);
      setScreenshots([]);
      setScreenshotsTotal(0);
      setScreenshotsError(error.message || 'Failed to load screenshots.');
    } finally {
      if (showLoader) {
        setIsLoadingScreenshots(false);
      }
    }
  }, [
    selectedEmployee,
    fetchScreenshotsData,
    applyScreenshotResult,
    screenshotsPage,
    screenshotsPerPage,
    screenshotsDateRange,
    computeDefaultScreenshotRange
  ]);

  const handleScreenshotsPageChange = useCallback((_, page) => {
    loadScreenshots({ page });
  }, [loadScreenshots]);

  const handleScreenshotsPerPageChange = useCallback((value) => {
    loadScreenshots({ page: 1, perPage: value });
  }, [loadScreenshots]);

  const handleScreenshotsDateRangeChange = useCallback((range) => {
    setScreenshotsDateRange(range);
    const [start, end] = range || [];
    if (start && end) {
      loadScreenshots({ page: 1, dateRange: range });
    }
  }, [loadScreenshots]);

  const handleScreenshotsRefresh = useCallback(() => {
    loadScreenshots({ page: screenshotsPage });
  }, [loadScreenshots, screenshotsPage]);

  const handleScreenshotsOrderChange = useCallback((order) => {
    setScreenshotsOrder(order);
    // Refetch screenshots with new order - reset to page 1
    loadScreenshots({ page: 1, order, showLoader: true });
  }, [loadScreenshots]);


  // Main function to fetch all report data
  const fetchReportData = useCallback(async (employee) => {
    if (!employee) {
      console.log('❌ fetchReportData: No employee provided');
      return;
    }
    
    // Prevent concurrent calls
    if (isFetchingRef.current) {
      console.log('⏸️ fetchReportData: Already fetching, skipping...');
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoadingReportData(true);
    setReportError(null);
    setIsLoadingScreenshots(true);
    setScreenshotsError(null);
    
    try {
      // Format current month as YYYY-MM
      const monthIndex = months.indexOf(selectedMonth);
      const currentMonth = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      
      // Format specific date as YYYY-MM-DD
      const specificDate = selectedDate 
        ? `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
        : null;

        console.log('specificDate', specificDate);

      const defaultRange = computeDefaultScreenshotRange();

      // Calculate date range for monitoring actions (use selected date, or current date if not selected)
      const currentDateFormatted = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const monitoringStartDate = specificDate || currentDateFormatted;
      const monitoringEndDate = specificDate || currentDateFormatted;

      // Fetch all data in parallel (excluding advanced report - fetched separately)
      const [
        meetingData,
        idleData,
        focusData,
        taskData,
        loggedData,
        screenshotCount,
        screenshotsResult,
        idleQuickview,
        availabilityData,
        activityPattern,
        monitoringActions
      ] = await Promise.all([
        fetchMeetingTimeData(employee, currentMonth),
        fetchIdleTimeData(employee, currentMonth),
        fetchFocusTimelineData(employee, currentMonth),
        fetchTaskReportData(employee, currentMonth),
        fetchLoggedTimeData(employee, currentMonth, null), // Always fetch monthly data for TopActivityTab
        specificDate ? fetchScreenshotCountData(specificDate) : null,
        fetchScreenshotsData({
          employee,
          page: 1,
          perPage: screenshotsPerPage,
          dateRange: defaultRange,
          order: screenshotsOrder,
        }),
        specificDate ? fetchIdleTimeQuickview(employee, specificDate) : null,
        fetchDataAvailability(employee, currentMonth),
        specificDate ? fetchActivityPatternData(employee, specificDate) : null,
        fetchMonitoringActionsData(employee, monitoringStartDate, monitoringEndDate)
      ]);
      
      // Update state with fetched data
      console.log('📝 Setting Focus Timeline Data:', focusData);
      setMeetingTimeData(meetingData);
      setIdleTimeData(idleData);
      setFocusTimelineData(focusData);
      setTaskReportData(taskData);
      setLoggedTimeData(loggedData);
      setScreenshotCountData(screenshotCount);
      applyScreenshotResult(screenshotsResult, {
        page: 1,
        perPage: screenshotsPerPage,
        dateRange: defaultRange,
      });
      setIdleQuickviewData(idleQuickview);
      setDataAvailability(availabilityData);
      setActivityPatternData(activityPattern);
      setMonitoringActionsData(monitoringActions);
      
      console.log('✅ All report data fetched successfully');
      
    } catch (error) {
      console.error('❌ Error fetching report data:', error);
      setReportError(`Failed to load report data: ${error.message}`);
    } finally {
      console.log('🔄 Setting isLoadingReportData to false');
      isFetchingRef.current = false;
      setIsLoadingReportData(false);
      setIsLoadingScreenshots(false);
    }
  }, [
    selectedYear,
    selectedMonth,
    selectedDate,
    months,
    fetchScreenshotsData,
    applyScreenshotResult,
    computeDefaultScreenshotRange
  ]);

  // Local search function to filter sync-staffs users quickly (same as ActivityStream)
  const filterSyncStaffsUsers = (query) => {
    if (!query || query.trim().length === 0) {
      return syncStaffsUsers;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return syncStaffsUsers.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm)) ||
      (user.name && user.name.toLowerCase().includes(searchTerm)) ||
      (user.job_position && user.job_position.toLowerCase().includes(searchTerm)) ||
      (user.department && user.department.toLowerCase().includes(searchTerm))
    );
  };


  // Filter options
  const years = ['2023', '2024', '2025'];
  
  // Calculate valid dates for selected month
  const getValidDates = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const year = parseInt(selectedYear);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    return Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());
  };
  const dates = getValidDates();
  
  const hours = ['All', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', 
                '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];

  // Calculate calendar days dynamically based on selected month/year
  const getCalendarDays = () => {
    const monthIndex = months.indexOf(selectedMonth);
    const year = parseInt(selectedYear);
    const month = monthIndex + 1; // JavaScript months are 0-indexed
    
    // Get first and last day of the month
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get today's date for comparison
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
    const todayDay = today.getDate();
    
    // Generate array of days for the month
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = isCurrentMonth && day === todayDay;
      const isSelected = day.toString() === selectedDate;
      
      days.push({
        day,
        dayName,
        today: isToday,
        selected: isSelected
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  // Sample time data
  const timeData = {
    loggedTime: '9h 50m',
    productive: '3h 19m',
    distraction: '0h 12m',
    neutral: '0h 40m',
    meetings: '4h 13m',
    break: '0h 55m',
    idle: '0h 29m',
    offline: '0h 0m',
    activeHours: '8h 25m',
    passiveHours: '1h 24m'
  };

  useEffect(() => {
    let isMounted = true;
    // Load users from sync-staffs API on startup (same as ActivityStream)
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      setIsLoadingEmployees(true);
      
      try {
        const users = await fetchSyncStaffsUsers();
        
        if (users && users.length > 0) {
          console.log('✅ Loaded', users.length, 'users from sync-staffs API');
        } else {
          console.log('⚠️ No users found from sync-staffs API');
        }
      } catch (error) {
        console.error('❌ Failed to load users:', error);
      } finally {
        if (isMounted) {
          setIsLoadingEmployees(false);
        }
      }
    }, 10);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const checkScrollButtons = useCallback(() => {
    if (tabScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  const scrollTabs = useCallback((direction) => {
    if (tabScrollRef.current) {
      const scrollAmount = 250;
      const newScrollLeft = direction === 'left' 
        ? tabScrollRef.current.scrollLeft - scrollAmount
        : tabScrollRef.current.scrollLeft + scrollAmount;
      
      tabScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 300);
    }
  }, [checkScrollButtons]);

  useEffect(() => {
    // Multiple checks to ensure DOM is ready
    const timer1 = setTimeout(checkScrollButtons, 50);
    const timer2 = setTimeout(checkScrollButtons, 200);
    const timer3 = setTimeout(checkScrollButtons, 500);
    
    // Add scroll detection when component mounts and when window resizes
    const handleResize = () => {
      setTimeout(checkScrollButtons, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollButtons]);

  const filteredEmployees = filteredUsers.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (emp.display_name && emp.display_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEmployeeSelect = (employee) => {
    console.log('👤 Employee Selected:', employee);
    setSelectedEmployee(employee);
    
    // Fetch report data for the selected employee
    console.log('🔄 Fetching report data for selected employee...');
    fetchReportData(employee);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Filter sync-staffs users locally for fast search (same as ActivityStream)
    const filtered = filterSyncStaffsUsers(query);
    setFilteredUsers(filtered);
    
    // No API calls needed - just local filtering
    setIsLoadingEmployees(false);
  };

  // Ensure current date is selected when viewing current month
  useEffect(() => {
    const monthIndex = months.indexOf(selectedMonth);
    const isCurrentMonth = selectedYear === currentYear && monthIndex === currentMonthIndex;
    
    // If viewing current month and no date is selected, select current date
    if (isCurrentMonth && !selectedDate) {
      setSelectedDate(currentDay);
    }
    
    // If viewing current month and selected date is not valid for current month, select current date
    if (isCurrentMonth && selectedDate) {
      const daysInMonth = new Date(parseInt(selectedYear), monthIndex + 1, 0).getDate();
      if (parseInt(selectedDate) > daysInMonth) {
        setSelectedDate(currentDay);
      }
    }
  }, [selectedYear, selectedMonth, currentYear, currentMonthIndex, currentDay, months]);

  // Fetch report data when filters change
  useEffect(() => {
    if (selectedEmployee) {
      fetchReportData(selectedEmployee);
    }
  }, [selectedEmployee, selectedYear, selectedMonth, selectedDate, selectedHour]);

  // Fetch advanced report data only when month or year changes (not when date changes)
  useEffect(() => {
    if (!selectedEmployee?.staff_id) {
      return;
    }

    // Prevent concurrent calls
    if (isFetchingAdvancedReportRef.current) {
      return;
    }

    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex < 0 || !selectedYear) {
      return;
    }

    isFetchingAdvancedReportRef.current = true;

    // Calculate date range for advanced report (always use month range)
    const monthStart = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(parseInt(selectedYear), monthIndex + 1, 0).getDate();
    const advancedStartDate = monthStart;
    const advancedEndDate = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Fetch advanced report data
    fetchAdvancedReportData(selectedEmployee, advancedStartDate, advancedEndDate, null)
      .then((data) => {
        if (data) {
          setAdvancedReportData(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching advanced report data:', error);
      })
      .finally(() => {
        isFetchingAdvancedReportRef.current = false;
      });
  }, [selectedEmployee?.staff_id, selectedYear, selectedMonth]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    // Show error state
    if (reportError) {
      return (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center', 
          background: theme.colors.surface, 
          borderRadius: '8px',
          border: '2px solid #ef4444',
          color: '#ef4444'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>Error Loading Report Data</h3>
          <p>{reportError}</p>
          <button
            onClick={() => selectedEmployee && fetchReportData(selectedEmployee)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    // Common props to pass to all tab components
    const tabProps = {
      theme,
      selectedEmployee,
      selectedYear,
      selectedMonth,
      selectedDate,
      months,
      isLoadingReportData // Pass loading state to individual tabs
    };

    switch (activeTab) {
      case 'TASK':
        return (
          <TaskTab 
            {...tabProps}
            taskReportData={taskReportData}
            isLoadingReportData={isLoadingReportData}
          />
        );
      
      case 'SCREENS':
        return (
          <ScreensTab 
            {...tabProps}
            screenshotCountData={screenshotCountData}
            screenshots={screenshots}
            screenshotsTotal={screenshotsTotal}
            screenshotsPage={screenshotsPage}
            screenshotsPerPage={screenshotsPerPage}
            screenshotsDateRange={screenshotsDateRange}
            isLoadingScreenshots={isLoadingScreenshots}
            screenshotsError={screenshotsError}
            screenshotsOrder={screenshotsOrder}
            onScreenshotsPageChange={handleScreenshotsPageChange}
            onScreenshotsPerPageChange={handleScreenshotsPerPageChange}
            onScreenshotsDateRangeChange={handleScreenshotsDateRangeChange}
            onScreenshotsRefresh={handleScreenshotsRefresh}
            onScreenshotsOrderChange={handleScreenshotsOrderChange}
          />
        );
      
      case 'FOCUS_TIMELINE':
        return (
          <FocusTimelineTab 
            {...tabProps}
            focusTimelineData={focusTimelineData}
          />
        );
      
      case 'ACTIVITY_PATTERN':
        return (
          <ActivityPatternTab 
            {...tabProps}
            activityPatternData={activityPatternData}
            isLoadingReportData={isLoadingReportData}
          />
        );
      
      case 'TOP_ACTIVITY':
        return (
          <TopActivityTab 
            {...tabProps}
            meetingTimeData={meetingTimeData}
            idleTimeData={idleTimeData}
            focusTimelineData={focusTimelineData}
            loggedTimeData={loggedTimeData}
            isLoadingReportData={isLoadingReportData}
          />
        );
      
      // case 'OT_REPORT':
      //   return (
      //     <OTReportTab 
      //       {...tabProps}
      //       loggedTimeData={loggedTimeData}
      //       focusTimelineData={focusTimelineData}
      //       isLoadingReportData={isLoadingReportData}
      //     />
      //   );
      
      case 'MONITORING_ACTIONS':
        return (
          <MonitoringActionsTab 
            {...tabProps}
            monitoringActionsData={monitoringActionsData}
            isLoadingReportData={isLoadingReportData}
          />
        );
      
      case 'BREAKS_MEET':
        return (
          <BreaksMeetTab 
            {...tabProps}
            meetingTimeData={meetingTimeData}
            loggedTimeData={loggedTimeData}
          />
        );
      
      case 'IDLE':
        return (
          <IdleTab 
            {...tabProps}
            idleTimeData={idleTimeData}
            loggedTimeData={loggedTimeData}
            isLoadingReportData={isLoadingReportData}
          />
        );
      
      case 'ADVANCED_REPORT':
        return (
          <AdvancedReportTab 
            theme={theme}
            employees={employees}
            selectedEmployee={selectedEmployee}
            advancedReportData={advancedReportData}
            isLoadingReportData={isLoadingReportData}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            months={months}
          />
        );
      
      // case 'OFFLINE':
      //   return <OfflineTab theme={theme} />;
      
      // case 'TIME_LOG_SUMMARY':
      //   return (
      //     <TimeLogSummaryTab 
      //       {...tabProps}
      //       loggedTimeData={loggedTimeData}
      //       activeTimeLogTab={activeTimeLogTab}
      //       setActiveTimeLogTab={setActiveTimeLogTab}
      //     />
      //   );
      
      default:
        return (
          <>
            <ReportsHeader>
              <ActivePassiveContainer>
                <TimeSection>
                  <TimeSectionLabel theme={theme}>Active Hours</TimeSectionLabel>
                  <TimeSectionValue theme={theme} color="#3b82f6">
                    {timeData.activeHours} ⓘ
                  </TimeSectionValue>
                </TimeSection>
                <TimeSection>
                  <TimeSectionLabel theme={theme}>Passive Hours</TimeSectionLabel>
                  <TimeSectionValue theme={theme} color="#3b82f6">
                    {timeData.passiveHours} ⓘ
                  </TimeSectionValue>
                </TimeSection>
              </ActivePassiveContainer>
            </ReportsHeader>

            <TimeBreakdown>
              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Logged Time
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.loggedTime}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Productive
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.productive}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Distraction
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.distraction}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Neutral
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.neutral}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Meetings
                  <CategoryIcon color="#3b82f6">4</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.meetings}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Break
                  <CategoryIcon color="#f97316">1</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.break}</CategoryValue>
                <CategoryPercentage theme={theme}>4.92 % ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Idle
                  <CategoryIcon color="#6b7280">5</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.idle}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>

              <TimeCategory theme={theme}>
                <CategoryHeader theme={theme}>
                  Offline
                  <CategoryIcon color="#000000">0</CategoryIcon>
                </CategoryHeader>
                <CategoryValue theme={theme}>{timeData.offline}</CategoryValue>
                <CategoryPercentage theme={theme}>ⓘ</CategoryPercentage>
              </TimeCategory>
            </TimeBreakdown>
          </>
        );
    }
  };

  return (
    <DashboardLayout headerTitle="Employee Reports" headerBreadcrumb={[{ label: t('dashboard'), path: '/dashboard' }, { label: 'Reports' }]}>
      <ReportsWrapper theme={theme}>
        <ReportsLayout>
          {/* Left sidebar - Employee selection */}
          <EmployeeSelection theme={theme}>
            <EmployeeHeader theme={theme}>EMPLOYEE</EmployeeHeader>
            <EmployeeSearchInput
              theme={theme}
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <EmployeeList>
              {isLoadingEmployees ? (
                <div
                  style={{
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: theme.colors.text.secondary,
                  }}
                >
                  <CircularProgress
                    size={32}
                    thickness={4}
                    sx={{
                      color:  theme.colors.text.primary,
                    }}
                  />
                  <div>Loading employees…</div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: theme.colors.text.secondary 
                }}>
                  No employees found
                </div>
              ) : (
                filteredEmployees.map((employee) => {
                  const profilePhotoUrl = getProfilePhotoUrl(employee);
                  
                  return (
                    <EmployeeItem
                      key={employee.id}
                      theme={theme}
                      selected={selectedEmployee?.id === employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <EmployeeInner style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Profile Photo */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {profilePhotoUrl ? (
                            <>
                              <img 
                                src={profilePhotoUrl} 
                                alt={employee.display_name || employee.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  borderRadius: 'inherit',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0
                                }}
                                onError={(e) => {
                                  // Hide the broken image and show fallback
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextSibling;
                                  if (fallback) {
                                    fallback.style.display = 'flex';
                                  }
                                }}
                              />
                              <div style={{ 
                                display: 'none',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}>
                                {(employee.display_name || employee.name || employee.email || '').charAt(0).toUpperCase()}
                              </div>
                            </>
                          ) : (
                            <div>
                              {(employee.display_name || employee.name || employee.email || '').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        {/* Employee Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <EmployeeName theme={theme}>
                            {employee.display_name || employee.name}
                          </EmployeeName>
                          {employee.email && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: theme.colors.text.secondary, 
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {employee.email}
                            </div>
                          )}
                          {employee.job_position && (
                            <div style={{ 
                              fontSize: '10px', 
                              color: theme.colors.primary,
                              marginTop: '2px',
                              backgroundColor: theme.colors.primary + '20',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              display: 'inline-block',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              💼 {employee.job_position}
                            </div>
                          )}
                        </div>
                      </EmployeeInner>
                      {selectedEmployee?.id === employee.id && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>✓</div>
                      )}
                    </EmployeeItem>
                  );
                })
              )}
            </EmployeeList>
          </EmployeeSelection>

          {/* Right content - Time reports */}
          <ReportsContent >
            {/* Filter Section */}
            <FilterSection>
              <FilterRow>
                {/* Year Filter */}
                <FilterGroup>
                  <InputLabel sx={{color:'#1e293b',fontWeight:'600',fontSize:'11px',letterSpacing:'0.5px',textTransform:'uppercase'}} >Year</InputLabel>
                  <Select
                    theme={theme}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    
                    {years.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FilterGroup>

                {/* Month Filter */}
                <FilterGroup>
                  <InputLabel sx={{color:'#1e293b',fontWeight:'600',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Month</InputLabel>
                  <Select
                    theme={theme}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map(month => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FilterGroup>

                {/* Date Filter */}
                <FilterGroup>
                  <InputLabel sx={{color:'#1e293b',fontWeight:'600',fontSize:'11px',letterSpacing:'0.5px',textTransform:'uppercase'}}>Date</InputLabel>
                  <Select
                    theme={theme}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  >
                    <MenuItem value="Select Date" sx={{mr:0}}>Select Date</MenuItem>
                    {dates.map(date => (
                      <MenuItem key={date} value={date}>{date}</MenuItem>
                    ))}
                  </Select>
                </FilterGroup>

                {/* Hour Filter */}
                {/* <FilterGroup>
                  <FilterLabel theme={theme}>Hour</FilterLabel>
                  <FilterSelect
                    theme={theme}
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                  >
                    {hours.map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </FilterSelect>
                </FilterGroup> */}

                {/* Calendar View */}
                <FilterGroup style={{ flex: 2 }}>
                  <FilterLabel theme={theme}>Calendar View</FilterLabel>
                  <CalendarGrid>
                    {calendarDays.map((day, index) => {
                      const isSelected = day.day.toString() === selectedDate;
                      // Format date as YYYY-MM-DD to check data availability
                      const monthIndex = months.indexOf(selectedMonth);
                      const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
                      const hasData = dataAvailability?.data_availability?.[dateString] === true;
                      
                      return (
                        <CalendarDay
                          key={index}
                          theme={theme}
                          selected={isSelected}
                          today={day.today}
                          onClick={() => {
                            // Toggle: if already selected, deselect it
                            if (isSelected) {
                              setSelectedDate('');
                            } else {
                              setSelectedDate(day.day.toString());
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <DayHeader theme={theme}>{day.dayName}</DayHeader>
                          <div>{day.day}</div>
                          {hasData && <DataIndicator theme={theme} />}
                        </CalendarDay>
                      );
                    })}
                  </CalendarGrid>
                </FilterGroup>

                {/* Hour Range */}
                {/* <FilterGroup style={{ flex: 1.5 }}>
                  <FilterLabel theme={theme}>Hour Range</FilterLabel>
                  <HourGrid>
                    {hours.slice(1, 13).map((hour, index) => (
                      <HourSlot
                        key={index}
                        theme={theme}
                        selected={selectedHour === hour}
                        onClick={() => setSelectedHour(hour)}
                      >
                        {hour}
                      </HourSlot>
                    ))}
                  </HourGrid>
                </FilterGroup> */}
              </FilterRow>

              {/* Summary */}
              <SummaryContainer theme={theme}>
                <SummaryText>
                  Employee Name: <span theme={theme}> {selectedEmployee?.display_name || selectedEmployee?.name}</span>
                </SummaryText>
                <SummaryText theme={theme}>
                  Showing data for: <span>{selectedMonth} {selectedDate}, {selectedYear}</span>
                  {selectedHour !== 'All' && <span> at {selectedHour}</span>}
                </SummaryText>
              </SummaryContainer>
            </FilterSection>

            {/* Tab Navigation */}
            <TabContainer theme={theme}>
              <NavigationArrow 
                theme={theme}
                disabled={!canScrollLeft}
                onClick={() => scrollTabs('left')}
              >
                ←
              </NavigationArrow>
              
              <TabScrollContainer 
                ref={tabScrollRef}
                onScroll={checkScrollButtons}
              >
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    theme={theme}
                    active={activeTab === tab.id}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <TabIcon active={activeTab === tab.id}>{tab.icon}</TabIcon>
                    {tab.name}
                  </TabButton>
                ))}
              </TabScrollContainer>
              
              <NavigationArrow 
                theme={theme}
                disabled={!canScrollRight}
                onClick={() => scrollTabs('right')}
              >
                →
              </NavigationArrow>
            </TabContainer>

            {/* Tab Content */}
            {renderTabContent()}
          </ReportsContent>
        </ReportsLayout>
      </ReportsWrapper>
    </DashboardLayout>
  );
};

export default Reports;
