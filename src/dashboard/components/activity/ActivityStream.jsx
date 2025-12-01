import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  IconButton,
  Skeleton,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogContent,
  Pagination,
  CircularProgress
} from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getApiBaseURL } from '../../../config/api';
import ImageModal from '../common/ImageModal';
import Tooltip from '../../../components/common/Tooltip';
import './ActivityStream.css';
import {
  Container,
  Title,
  DateNav,
  EmployeeTab,
  DateTab,
  ArrowButton,
  ContentContainer,
  SearchContainer,
  SearchInput,
  EmptyStateContainer,
  EmptyIcon,
  EmptyText,
  SelectContainer,
  Select
} from './ActivityStream.styles.jsx';

// Helper functions
const getMonthName = (month, lang) => {
  return new Date(2000, month - 1, 1).toLocaleString(lang, { month: 'short' }).toUpperCase();
};

const getFullMonthName = (month, lang) => {
  return new Date(2000, month - 1, 1).toLocaleString(lang, { month: 'long' });
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month - 1, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear + i);
};

const generateCalendarDays = (year, month, activityDates = new Set()) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const currentDate = today.getDate();

  // Previous month's trailing days
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  
  const calendarDays = [];

  // Add previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = daysInPrevMonth - i;
    const dateStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`;
    calendarDays.push({
      date: date,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: false,
      isPrevMonth: true,
      hasActivity: activityDates.has(dateStr)
    });
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    calendarDays.push({
      date: day,
      month: month,
      year: year,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === currentDate,
      isPrevMonth: false,
      hasActivity: activityDates.has(dateStr)
    });
  }

  // Add next month's leading days to complete the grid (42 days total = 6 weeks)
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remainingDays = 42 - calendarDays.length;
  
  for (let day = 1; day <= remainingDays; day++) {
    const dateStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    calendarDays.push({
      date: day,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: false,
      isPrevMonth: false,
      hasActivity: activityDates.has(dateStr)
    });
  }

  return calendarDays;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to safely format dates and handle invalid timestamps
const formatSafeDate = (timestamp, language = 'en', options = {}) => {
  if (!timestamp) return 'No date available';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Date unavailable';
    }
    return date.toLocaleDateString(language, options);
  } catch (error) {
    return 'Date unavailable';
  }
};

// Helper function to safely format time
const formatSafeTime = (timestamp, options = {}) => {
  if (!timestamp) return 'Time unavailable';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Time unavailable';
    }
    return date.toLocaleTimeString([], options);
  } catch (error) {
    return 'Time unavailable';
  }
};

// Helper function to format file size (from ScreensTab.jsx)
const getSizeLabel = (sizeMb) => {
  if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
    return null;
  }
  const numericValue = Number(sizeMb);
  if (numericValue >= 1) {
    return `${numericValue.toFixed(2)} MB`;
  }
  return `${(numericValue * 1024).toFixed(0)} KB`;
};

// Helper function to format date and time (from ScreensTab.jsx)
const formatDateTime = (timestamp, date, time) => {
  if (timestamp) {
    const parsed = dayjs(timestamp);
    if (parsed.isValid()) {
      // Add 3 hours for Turkey timezone (UTC+3)
      const turkeyTime = parsed.add(3, 'hours');
      return {
        dateLabel: turkeyTime.format('MMM D, YYYY'),
        timeLabel: turkeyTime.format('hh:mm A'),
      };
    }
  }
  const parsedDate = date ? dayjs(date) : null;
  if (parsedDate && parsedDate.isValid()) {
    // Add 3 hours for Turkey timezone (UTC+3)
    const turkeyDate = parsedDate.add(3, 'hours');
    return {
      dateLabel: turkeyDate.format('MMM D, YYYY'),
      timeLabel: time || 'Time unavailable',
    };
  }
  return {
    dateLabel: 'Date unavailable',
    timeLabel: time || 'Time unavailable',
  };
};

// Helper function to sanitize S3 URLs (fix malformed region format)
const sanitizeS3Url = (url) => {
  if (!url) return url;
  
  const originalUrl = url;
  
  // Fix malformed region format: s3.('eu-north-1',).amazonaws.com -> s3.eu-north-1.amazonaws.com
  let sanitizedUrl = url.replace(/s3\.\(['"]?([^'"]+)['"]?,?\)\.amazonaws\.com/g, 's3.$1.amazonaws.com');
  
  // Also handle other potential malformations
  sanitizedUrl = sanitizedUrl.replace(/\(['"]?([^'"]+)['"]?,?\)/g, '$1');
  
  return sanitizedUrl;
};

// Helper function to extract date from filename if timestamp is not available
const extractDateFromScreenshot = (screenshot) => {
  // Try multiple timestamp fields
  const possibleTimestamps = [
    screenshot.timestamp,
    screenshot.last_modified,
    screenshot.created_at,
    screenshot.datetime,
    screenshot.date
  ];
  
  for (const timestamp of possibleTimestamps) {
    if (timestamp) {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return timestamp;
      }
    }
  }
  
  // Try to extract date from filename like "2023-10-15_14-30-45.webp"
  if (screenshot.filename) {
    const dateMatch = screenshot.filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1] + 'T00:00:00';
    }
  }
  
  return null;
};

// Helper function to extract date from filename
const extractDateFromFilename = (filename) => {
  if (!filename) return null;
  
  // Try to extract date from filename like "2023-10-15_14-30-45.webp"
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1]; // Return just the date part like "2023-10-15"
  }
  
  return null;
};

// Helper function to get profile photo URL from CRM
const getProfilePhotoUrl = (user) => {
  // Check if user has profile_url and staff_id
  if (!user || !user.profile_url || !user.staff_id) {
    return null;
  }
  
  // Build the CRM profile photo URL with small_ prefix for thumbnail
  // Format: https://crm.deluxebilisim.com/uploads/staff_profile_images/{staff_id}/small_{profile_url}
  const profileUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${user.staff_id}/small_${encodeURIComponent(user.profile_url)}`;
  
  return profileUrl;
};

// Main component
const ActivityStream = ({ compactPadding }) => {
  const { t, language } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear()); // Default to current year
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // Default to current month (JavaScript months are 0-indexed)
  const [activeDate, setActiveDate] = useState(today.getDate().toString().padStart(2, '0')); // Default to today's date
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(true); // Changed to true to show users by default
  const [searchPerformance, setSearchPerformance] = useState(null); // Track search speed
  const [apiStatus, setApiStatus] = useState('unknown'); // 'connected', 'disconnected', 'error', 'unknown'
  const [error, setError] = useState(null); // General error state
  const [lastRequestId, setLastRequestId] = useState(null); // Track latest request to prevent race conditions
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScreenshots, setUserScreenshots] = useState([]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [screenshotError, setScreenshotError] = useState(null);
  const [calendarView, setCalendarView] = useState(true); // New state for calendar view toggle
  const [userActivityDates, setUserActivityDates] = useState(new Set()); // Activity dates for calendar highlighting
  const [currentPage, setCurrentPage] = useState(1); // Pagination state for screenshots_page
  const [totalScreenshots, setTotalScreenshots] = useState(0); // Total screenshots count
  const [allScreenshots, setAllScreenshots] = useState([]); // Store all screenshots
  const [allUsers, setAllUsers] = useState([]);
  const [searchCache, setSearchCache] = useState(new Map()); // Cache for search results
  const [lastSuccessfulEndpoint, setLastSuccessfulEndpoint] = useState(null); // Cache successful endpoint
  const [userSuggestions, setUserSuggestions] = useState([]); // Store user suggestions
  const [loadingSuggestions, setLoadingSuggestions] = useState(true); // Loading state for suggestions
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode state
  const [screenshotsPerPage, setScreenshotsPerPage] = useState(50); // Screenshots per page (default 50)
  const [allUsersScreenshots, setAllUsersScreenshots] = useState([]); // Store screenshots for all users
  const [isLoadingAllScreenshots, setIsLoadingAllScreenshots] = useState(false); // Loading state for all screenshots
  const [syncStaffsUsers, setSyncStaffsUsers] = useState([]); // Users from sync-staffs API
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users for search
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(null); // Active screenshot index for modal
  // Theme context (used for Tooltip theming/positioning)
  const themeContext = useTheme && useTheme();
  const { theme: tooltipTheme = {}, theme: themeObj = {} } = themeContext || {};
  
  // Modal state for image viewing (using activeScreenshotIndex instead)
  
  const searchContainerRef = useRef(null);
  const dateScrollRef = useRef(null);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1, language)
  }));

  // Auto-scroll to today's date when component mounts or month/year changes
  useEffect(() => {
    if (!isLoading && dateScrollRef.current && activeDate) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        // Calculate the scroll position based on the active date
        const dateNumber = parseInt(activeDate, 10);
        const dateWidth = 120; // Width of each date element
        const containerWidth = dateScrollRef.current.offsetWidth;
        
        // Calculate scroll position to center the selected date
        // Each date is 120px wide, so multiply by (dateNumber - 1) to get the position
        const scrollPosition = (dateNumber - 1) * dateWidth - (containerWidth / 2) + (dateWidth / 2);
        
        // Scroll to the calculated position
        dateScrollRef.current.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }, 500); // Increased delay to ensure everything is rendered
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, selectedYear, selectedMonth, activeDate]);

  // Enhanced API-based user search function with better error handling and retry logic
  const searchUsersFromAPI = async (query = '', limit = 10, offset = 0, retryCount = 0, startDate = null, endDate = null) => {
    setIsSearching(true);
    setError(null);
    
    // Create unique request ID to prevent race conditions
    const requestId = Date.now() + '-' + Math.random();
    setLastRequestId(requestId);
    
    const maxRetries = 2; // Allow up to 2 retries
    
    try {
      if (!query || query.trim().length === 0) {
        query = 'a'; // Use a common letter that will match many users
      }
      
      // Build URL with date range parameters - using exact dxdtime.ddsolutions.io format
      const searchParams = new URLSearchParams({
        q: encodeURIComponent(query.trim()),
        limit: limit.toString(),
        offset: offset.toString(),
        // Add pagination parameters for screenshots
        screenshots_per_page: screenshotsPerPage.toString(),
        screenshots_page: currentPage.toString()
      });
      
      // Backend API requires start_date and end_date - always add them
      if (startDate && endDate) {
        searchParams.append('start_date', startDate);
        searchParams.append('end_date', endDate);
      } else if (startDate === null && endDate === null) {
        // Check if we have an active date selected
        if (activeDate) {
          // Use specific selected date for both start and end date
          const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
          searchParams.append('start_date', specificDate);
          searchParams.append('end_date', specificDate);
        } else {
          // Search from September 1st, 2025 to current date (as requested by user)
          const today = new Date();
          const currentYear = today.getFullYear();
          const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
          const currentDay = today.getDate();
          const wideStartDate = '2025-09-01'; // Start from September 1st, 2025 as requested
          const wideEndDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
          searchParams.append('start_date', wideStartDate);
          searchParams.append('end_date', wideEndDate);
        }
      } else {
        // Use selected month/year for date range, but check for active date first
        if (activeDate) {
          // Use specific selected date
          const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
          searchParams.append('start_date', specificDate);
          searchParams.append('end_date', specificDate);
        } else {
          // Use selected month/year for date range
          const year = selectedYear;
          const month = selectedMonth;
          const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
          const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${getDaysInMonth(year, month).toString().padStart(2, '0')}`;
          searchParams.append('start_date', startOfMonth);
          searchParams.append('end_date', endOfMonth);
        }
      }
      
      // Use the proxy endpoint that routes to dxdtime.ddsolutions.io
      const apiUrl = `/api/users/search/?${searchParams.toString()}`;
      
      // Make the API request with increased timeout for slow servers
      const fetchPromise = fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add signal for better timeout handling
        signal: AbortSignal.timeout(300000) // 5 minutes timeout
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 300 seconds (5 minutes)')), 300000);
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Could not read error response body
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Handle different API response formats
      let users = [];
      
      if (data.status === 'success' && data.data && data.data.users && Array.isArray(data.data.users)) {
        users = data.data.users;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
      } else if (Array.isArray(data)) {
        users = data;
      }
      
      if (users.length > 0) {
        // Map and process users - Filter to only show users with screenshots
        const formattedUsers = users
          .filter(user => {
            // Only include users who have screenshots
            return (user.total_screenshots && user.total_screenshots > 0) || 
                   (user.recent_screenshots && user.recent_screenshots.length > 0) ||
                   (user.grouped_screenshots && Object.keys(user.grouped_screenshots).length > 0);
          })
          .map(user => ({
          id: user.email || user.id,
          email: user.email,
          display_name: user.display_name || user.email || user.original_name,
          original_name: user.original_name || user.email,
          total_screenshots: user.total_screenshots || 0,
          total_size_mb: user.total_size_mb || 0,
          active_days_count: user.active_days_count || 0,
          active_months_count: user.active_months_count || 0,
          first_activity: user.first_activity,
          last_activity: user.last_activity,
          status: user.status || 'active',
          // Handle grouped_screenshots - might be string or object
          grouped_screenshots: typeof user.grouped_screenshots === 'string' 
            ? {} 
            : (user.grouped_screenshots || {}),
          // Handle recent_screenshots - might be string or array
          recent_screenshots: Array.isArray(user.recent_screenshots) 
            ? user.recent_screenshots 
            : [],
          folders: user.folders || [],
          activity_summary: typeof user.activity_summary === 'string' 
            ? {} 
            : (user.activity_summary || {}),
          // Additional fields from API
          match_reason: user.match_reason,
          search_score: user.search_score,
          match_reasons: user.match_reasons
        }));
        
        // IMPORTANT: Only update if this is still the most recent request (prevent race conditions)
        setLastRequestId(currentLatestId => {
          if (currentLatestId === requestId) {
            // Our request is still the latest, update the UI
            setSearchResults(formattedUsers);
            setApiStatus('connected');
            setShowResults(true);
            setIsSearching(false);
            setError(null);
          }
          return currentLatestId;
        });
        
        return formattedUsers;
      } else {
        setLastRequestId(currentLatestId => {
          if (currentLatestId === requestId) {
            setSearchResults([]);
            setApiStatus('connected');
            setIsSearching(false);
            setError(`No users with screenshots found for "${query}"`);
          }
          return currentLatestId;
        });
        return [];
      }
      
    } catch (error) {
      
      // Check if our request is still the latest one before updating state
      setLastRequestId(currentLatestId => {
        if (currentLatestId === requestId) {
          // Retry logic for timeout and network errors
          if ((error.message.includes('timeout') || error.message.includes('Failed to fetch')) && retryCount < maxRetries) {
            // Retry after a brief delay
            setTimeout(() => {
              searchUsersFromAPI(query, limit, offset, retryCount + 1, startDate, endDate);
            }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
            return currentLatestId;
          }
          
          setApiStatus('disconnected');
          
          // Provide specific error messages with updated timeout info
          if (error.message.includes('timeout') || error.message.includes('300 seconds')) {
            setError(retryCount > 0 
              ? `Search timed out after ${retryCount + 1} attempts (5 minutes each). The server may be overloaded. Please try a more specific search term.`
              : 'Search timed out after 5 minutes. The server may be overloaded. Please try a more specific search term or try again later.'
            );
          } else if (error.name === 'AbortError') {
            setError('Search was cancelled or timed out. Please try again with a more specific search term.');
          } else if (error.message.includes('Failed to fetch')) {
            setError('Cannot connect to server. Please check your internet connection.');
          } else if (error.message.includes('504') || error.message.includes('Gateway Time-out')) {
            setError('Server is taking too long to respond (504 Gateway Timeout). Please try again with a more specific search term.');
          } else {
            setError(`Network Error: ${error.message}`);
          }
          
          setSearchResults([]);
          setIsSearching(false);
        }
        return currentLatestId;
      });
    }
  };

  // Function to search for a specific user by name or email
  const searchUserByNameOrEmail = async (searchQuery, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      setIsLoadingScreenshots(true);
      setError(null);
      
      // Use the full search query (name) instead of extracting email
      const query = searchQuery;
      
      // Use specific date if activeDate is selected, otherwise use broad range
      let startDate, endDate;
      
      if (activeDate) {
        // Use specific selected date for both start and end date
        const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
        startDate = specificDate;
        endDate = specificDate;
      } else {
        // Use dynamic date range from September 1st, 2025 to current date
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        startDate = '2025-09-01'; // Start from September 1st, 2025
        endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
      }
      
      const searchParams = new URLSearchParams({
        q: query,
        start_date: startDate,
        end_date: endDate,
        screenshots_per_page: screenshotsPerPage.toString(),
        screenshots_page: currentPage.toString()
      });
      
      const apiUrl = `/api/users/search/?${searchParams.toString()}`;
      
      const controller = new AbortController();
      let isAborted = false;
      
      const timeoutId = setTimeout(() => {
        if (!isAborted) {
          isAborted = true;
          controller.abort();
        }
      }, 60000);
      
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      isAborted = true;
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          // Error reading response
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      let foundUser = null;
      if (data.status === 'success' && data.data && data.data.users && Array.isArray(data.data.users)) {
        
        // Find user by matching display name or email
        foundUser = data.data.users.find(user => 
          user.display_name === searchQuery || 
          user.original_name === searchQuery ||
          user.email === searchQuery
        ) || data.data.users[0]; // Use first result if no exact match
      }
      
      if (foundUser) {
        const formattedUser = {
          id: foundUser.email || foundUser.id,
          email: foundUser.email,
          display_name: foundUser.display_name || foundUser.email || foundUser.original_name,
          original_name: foundUser.original_name || foundUser.email,
          total_screenshots: foundUser.total_screenshots || 0,
          total_size_mb: foundUser.total_size_mb || 0,
          active_days_count: foundUser.active_days_count || 0,
          active_months_count: foundUser.active_months_count || 0,
          first_activity: foundUser.first_activity,
          last_activity: foundUser.last_activity,
          recent_screenshots: foundUser.recent_screenshots || [],
          grouped_screenshots: foundUser.grouped_screenshots || {}
        };
        
        setSelectedUser(formattedUser);
        setApiStatus('connected');
        setError(null);
        
        if (formattedUser.recent_screenshots && formattedUser.recent_screenshots.length > 0) {
          setUserScreenshots(formattedUser.recent_screenshots);
          
          const activityDates = new Set();
          
          formattedUser.recent_screenshots.forEach(s => {
            if (s.date) activityDates.add(s.date);
          });
          
          if (foundUser.grouped_screenshots) {
            Object.keys(foundUser.grouped_screenshots).forEach(date => {
              activityDates.add(date);
            });
          }
          
          setUserActivityDates(activityDates);
        } else {
          const activityDates = new Set();
          if (foundUser.grouped_screenshots) {
            Object.keys(foundUser.grouped_screenshots).forEach(date => {
              activityDates.add(date);
            });
          }
          setUserActivityDates(activityDates);
        }
        
        let allScreenshots = [];
        if (foundUser.grouped_screenshots) {
          Object.keys(foundUser.grouped_screenshots).forEach(date => {
            const dayData = foundUser.grouped_screenshots[date];
            if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
              dayData.screenshots.forEach((screenshot, index) => {
                allScreenshots.push({
                  ...screenshot,
                  id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                  timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                  activity_type: 'ACTIVE',
                  file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                  date: screenshot.date || date,
                  size_mb: screenshot.size_mb,
                  user_email: foundUser.email,
                  project_folder: screenshot.subfolder_path
                });
              });
            }
          });
        }
        
        // Also include recent_screenshots if available (avoid duplicates)
        if (foundUser.recent_screenshots && Array.isArray(foundUser.recent_screenshots)) {
          foundUser.recent_screenshots.forEach((screenshot, index) => {
            if (!allScreenshots.find(s => s.filename === screenshot.filename)) {
              allScreenshots.push({
                ...screenshot,
                id: screenshot.filename || screenshot.full_key || `recent-${index}`,
                timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                activity_type: 'ACTIVE',
                file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                date: screenshot.date,
                size_mb: screenshot.size_mb,
                user_email: foundUser.email,
                project_folder: screenshot.subfolder_path
              });
            }
          });
        }
        
        // Sort screenshots by timestamp (newest first)
        allScreenshots.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          return dateB - dateA;
        });
        
        setAllScreenshots(allScreenshots);
        setUserScreenshots(allScreenshots);
        // Use total_screenshots from API response, not the length of current page results
        setTotalScreenshots(foundUser.total_screenshots || allScreenshots.length);
        
        return formattedUser;
      } else {
        setError(`User "${searchQuery}" not found in the date range.`);
        return null;
      }
      
    } catch (error) {
      const shouldRetry = (
        (error.name === 'AbortError' || 
         error.message.includes('504') || 
         error.message.includes('Gateway Time-out') ||
         error.message.includes('Failed to fetch')) && 
        retryCount < maxRetries
      );
      
      if (shouldRetry) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return searchUserByNameOrEmail(searchQuery, retryCount + 1);
      }
      
      if (error.name === 'AbortError') {
        setError(`Search request timed out after ${maxRetries + 1} attempts. The server may be busy. Please try again.`);
      } else if (error.message.includes('504') || error.message.includes('Gateway Time-out')) {
        setError('Server is temporarily unavailable (504 Gateway Timeout). Please try again in a moment.');
      } else if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError(`Error searching for user: ${error.message}`);
      }
      
      setApiStatus('error');
      return null;
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  // Enhanced function to handle user selection with better feedback
  const handleUserSelect = async (user) => {
    
    // Set the selected user immediately to show the user area
    setSelectedUser({
      email: user.email,
      display_name: user.display_name || user.username,
      username: user.username,
      staff_id: user.staff_id,
      profile_url: user.profile_url,
      total_screenshots: 0,
      recent_screenshots: []
    });
    
    // Load the user data via API using email (more reliable than name)
    const searchQuery = user.email; // Use email for exact match
    await searchUserByNameOrEmail(searchQuery);
  };

  // Function to load user data from API response
  const loadUserFromApiResponse = (apiResponseData) => {
    try {
      if (apiResponseData && apiResponseData.data && apiResponseData.data.users && apiResponseData.data.users.length > 0) {
        const user = apiResponseData.data.users[0]; // Get the first user
        
        // Set the selected user
        setSelectedUser(user);
        
        // Extract and format screenshots from the grouped_screenshots
        const formattedScreenshots = [];
        if (user.grouped_screenshots) {
          Object.keys(user.grouped_screenshots).forEach(date => {
            const dayData = user.grouped_screenshots[date];
            if (dayData.screenshots) {
              dayData.screenshots.forEach(screenshot => {
                formattedScreenshots.push({
                  id: screenshot.filename,
                  filename: screenshot.filename,
                  screenshot_url: sanitizeS3Url(screenshot.screenshot_url),
                  thumbnail_url: sanitizeS3Url(screenshot.thumbnail_url),
                  timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime,
                  date: screenshot.date,
                  time: screenshot.time,
                  size_mb: screenshot.size_mb,
                  size_bytes: screenshot.size_bytes,
                  activity_type: 'ACTIVE', // Default to active
                  folder: screenshot.subfolder_path,
                  full_key: screenshot.full_key
                });
              });
            }
          });
        }
        
        // Also use recent_screenshots if available
        if (user.recent_screenshots && user.recent_screenshots.length > 0) {
          user.recent_screenshots.forEach(screenshot => {
            // Avoid duplicates
            if (!formattedScreenshots.find(s => s.filename === screenshot.filename)) {
              formattedScreenshots.push({
                id: screenshot.filename,
                filename: screenshot.filename,
                screenshot_url: sanitizeS3Url(screenshot.screenshot_url),
                thumbnail_url: sanitizeS3Url(screenshot.thumbnail_url),
                timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime,
                date: screenshot.date,
                time: screenshot.time,
                size_mb: screenshot.size_mb,
                size_bytes: screenshot.size_bytes,
                activity_type: 'ACTIVE',
                folder: screenshot.subfolder_path,
                full_key: screenshot.full_key
              });
            }
          });
        }
        
        // Sort screenshots by timestamp (newest first) with safe date handling
        formattedScreenshots.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          
          // Handle invalid dates by putting them at the end
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          return dateB - dateA;
        });
        
        
        // Update state
        setUserScreenshots(formattedScreenshots);
        setTotalScreenshots(user.total_screenshots || formattedScreenshots.length);
        setAllScreenshots(formattedScreenshots);
        setCurrentPage(1);
        setIsLoadingScreenshots(false);
        setScreenshotError(null);
        
        // Add user to allUsers array if not already present
        setAllUsers(prevUsers => {
          const existingUserIndex = prevUsers.findIndex(u => u.email === user.email);
          if (existingUserIndex >= 0) {
            // Update existing user
            const updatedUsers = [...prevUsers];
            updatedUsers[existingUserIndex] = user;
            return updatedUsers;
          } else {
            // Add new user
            return [...prevUsers, user];
          }
        });
        
        // Clear search to focus on selected user
        setSearchValue(user.display_name || user.email);
        setShowResults(false);
        
        return true;
      }
      return false;
    } catch (error) {
      setScreenshotError('Failed to load user data');
      return false;
    }
  };

  // Advanced preload with predictive caching and background prefetching
  const preloadCommonUsers = async () => {
    try {
      const apiBaseURL = getApiBaseURL();
      // Preload ALL alphabet letters for instant search using configured API
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const apiEndpoint = `${apiBaseURL}/users/search/`;
      
      
      // Parallel batch processing for maximum speed
      const batchSize = 5;
      for (let i = 0; i < allLetters.length; i += batchSize) {
        const batch = allLetters.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (letter) => {
          try {
            const response = await fetch(`${apiEndpoint}?q=${letter}&limit=100`, {
              method: 'GET',
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.status === 'success' && data.data && data.data.users) {
                setSearchCache(prev => {
                  const newCache = new Map(prev);
                  newCache.set(letter, data.data.users);
                  
                  // Also preload common 2-letter combinations
                  const commonSeconds = ['a', 'e', 'i', 'o', 'u', 'n', 'r', 's', 't'];
                  commonSeconds.forEach(second => {
                    const combo = letter + second;
                    const filteredResults = data.data.users.filter(user =>
                      (user.display_name && user.display_name.toLowerCase().includes(combo)) ||
                      (user.email && user.email.toLowerCase().includes(combo))
                    );
                    if (filteredResults.length > 0) {
                      newCache.set(combo, filteredResults);
                    }
                  });
                  
                  return newCache;
                });
              }
            }
          } catch (error) {
          }
        });

        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to not overwhelm the server
        if (i + batchSize < allLetters.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      
    } catch (error) {
    }
  };

  // Fetch users from sync-staffs API
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

      const staffList = data.data || []; if (staffList && Array.isArray(staffList) && staffList.length > 0) {
        // Map sync-staffs data to our user format
        const formattedUsers = staffList.filter(staff => staff.email).map(staff => ({
          id: staff.id || staff.email,
          email: staff.email,
          username: staff.name || staff.email,
          display_name: staff.name || staff.email,
          original_name: staff.name || staff.email,
          staff_id: staff.staff_id,
          profile_url: staff.profile_url,
          phone_number: staff.phone_number,
          job_position: staff.job_position || '',
          screenshot_interval: staff.screenshot_interval,
          total_screenshots: 0, // Will be loaded when user is selected
          status: 'active'
        }));

        setSyncStaffsUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        return formattedUsers;
      } else {
        return [];
      }
    } catch (error) {
      setError(`Failed to load users: ${error.message}`);
      return [];
    }
  };

  useEffect(() => {
    // Failsafe timer to ensure component always shows
    const failsafeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    const timer = setTimeout(async () => {
      setIsLoading(false);
      clearTimeout(failsafeTimer); // Clear failsafe since we succeeded
      
      // Load users from sync-staffs API on startup
      try {
        const users = await fetchSyncStaffsUsers();
        
        if (users && users.length > 0) {
          setError(null);
        } else {
          setError('No users found. Please check your connection.');
        }
      } catch (error) {
        setError('Failed to load users. Please try again later.');
      }
    }, 10);
    return () => {
      clearTimeout(timer);
      clearTimeout(failsafeTimer);
    };
  }, []);

  // Track theme changes
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark' || 
                    document.documentElement.classList.contains('dark') ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    // Check initial theme
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  // Close help popover when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (showHelp && helpRef.current && !helpRef.current.contains(e.target)) {
        setShowHelp(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showHelp]);

  // Close search dropdown when clicking outside (but keep open for default user list)
  useEffect(() => {
    const onDocClick = (e) => {
      if (showResults && searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        // Only close if user is actively searching, keep open for default user list
        if (searchValue.trim().length > 0) {
          setShowResults(false);
        }
        // If no search value, keep dropdown open to show all users
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showResults, searchValue]);

  // Auto-refresh screenshots when date/month changes for dynamic date-wise loading
  useEffect(() => {
    if (selectedUser && selectedUser.email) {
      // Don't make new API calls - just filter existing screenshots
      // The screenshots are already loaded by searchUserByEmail and stored in allScreenshots
      
      // Reset current page when date changes
      setCurrentPage(1);
      
      // The filtering will be handled by the separate useEffect for activeDate filtering
    }
    
    // Also refresh all users' screenshots when date changes
    if (allUsers.length > 0) {
      fetchAllUsersScreenshots();
    }
  }, [selectedYear, selectedMonth]); // Dependency on date changes

  // Auto-refresh user search results when API connectivity changes or when activeDate changes
  useEffect(() => {
    if (searchValue && searchValue.length > 0) {
      // If activeDate is selected, use specific date, otherwise use month range
      if (activeDate) {
        const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
        searchUsersFromAPI(searchValue, 10, 0, 0, specificDate, specificDate);
      } else {
        // Calculate current month date range
        const year = selectedYear;
        const month = selectedMonth;
        const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${getDaysInMonth(year, month).toString().padStart(2, '0')}`;
        
        searchUsersFromAPI(searchValue, 10, 0, 0, startOfMonth, endOfMonth);
      }
    }
  }, [selectedYear, selectedMonth, activeDate]); // Added activeDate to dependencies

  useEffect(() => {
    
    if (selectedUser && allScreenshots.length > 0) {
      if (activeDate) {
        const targetDateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate.toString().padStart(2, '0')}`;
        
        const filteredScreenshots = allScreenshots.filter(screenshot => {
          const screenshotDate = screenshot.date || 
                               (screenshot.timestamp ? new Date(screenshot.timestamp).toISOString().split('T')[0] : null);
          return screenshotDate === targetDateStr;
        });
        
        if (filteredScreenshots.length === 0) {
          const availableDates = [...new Set(allScreenshots.map(s => s.date).filter(Boolean))].sort();
          const availableDatesInMonth = availableDates.filter(date => 
            date.startsWith(`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`)
          );
          
          if (availableDatesInMonth.length > 0) {
            setError(`No screenshots on ${targetDateStr}. ${selectedUser.display_name} has screenshots on: ${availableDatesInMonth.join(', ')} in this month. Click on a highlighted date to view screenshots.`);
          } else {
            const availableMonthsFormatted = availableDates.slice(0, 5).map(date => {
              const [year, month, day] = date.split('-');
              return `${month}/${year}`;
            });
            setError(`No screenshots on ${targetDateStr}. ${selectedUser.display_name} has screenshots in: ${[...new Set(availableMonthsFormatted)].join(', ')}${availableDates.length > 5 ? ` and more` : ''}. Use the month/year selectors to navigate.`);
          }
        } else {
          setError(null);
        }
        
        setUserScreenshots(filteredScreenshots);
        setCurrentPage(1);
      } else {
        // Show ALL screenshots when no specific date is selected
        // This allows users to see all available screenshots when first selecting a user
        
        setUserScreenshots(allScreenshots);
        setError(null);
        setCurrentPage(1);
        
        // Optional: Show a helpful message about available dates
        if (allScreenshots.length > 0) {
          const availableDates = [...new Set(allScreenshots.map(s => s.date).filter(Boolean))].sort();
          const availableMonths = [...new Set(availableDates.map(date => date.substring(0, 7)))].sort();
          console.log(`📅 Available screenshot months:`, availableMonths);
        }
      }
    }
  }, [activeDate, selectedYear, selectedMonth, allScreenshots]);

  // Update activity dates when screenshots change
  useEffect(() => {
    if (allScreenshots.length > 0) {
      const activityDates = new Set();
      allScreenshots.forEach(screenshot => {
        if (screenshot.date) {
          activityDates.add(screenshot.date);
        }
      });
      setUserActivityDates(activityDates);
    } else {
      setUserActivityDates(new Set());
    }
  }, [allScreenshots]);

  const fetchAllUsers = async () => {
    setError(null);
    try {
      
      // Try multiple search strategies to get all users
      const searchStrategies = [
        { query: 'a', limit: 10 }, // Search for 'a' (common letter) - this works per user, use exact format you provided
      ];
      
      let allFoundUsers = [];
      const seenEmails = new Set();
      
      for (const strategy of searchStrategies) {
        try {
          console.log(`🔍 Trying search strategy: "${strategy.query}"`);
          const users = await searchUsersFromAPI(strategy.query, strategy.limit, 0, 0, null, null);
          
          if (users && users.length > 0) {
            // Add unique users (avoid duplicates by email)
            users.forEach(user => {
              if (user.email && !seenEmails.has(user.email)) {
                seenEmails.add(user.email);
                allFoundUsers.push(user);
              }
            });
            console.log(`✅ Found ${users.length} users with strategy "${strategy.query}", total unique: ${allFoundUsers.length}`);
          }
        } catch (strategyError) {
          console.log(`❌ Strategy "${strategy.query}" failed:`, strategyError.message);
          continue;
        }
      }
      
      if (allFoundUsers.length > 0) {
        console.log(`✅ Found total ${allFoundUsers.length} unique users with screenshots`);
        setAllUsers(allFoundUsers);
        setApiStatus('connected');
        return allFoundUsers;
      } else {
        
        setApiStatus('disconnected');
        
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      setApiStatus('disconnected');
      setError(`Failed to load users: ${error.message}`);
      return [];
    }
  };

  // Fetch available user suggestions from the search API - Load ALL users on page load
  const fetchUserSuggestions = async () => {
    try {
      
      // Get current date for API call
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Use the proxy-based API endpoint with broad search to get ALL users  
      const response = await fetch(`/api/users/search/?q=@&page=1&page_size=50`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'success' && data.data && data.data.users && data.data.users.length > 0) {
          // Filter out test/placeholder users
          const filteredUsers = data.data.users.filter(user => {
            const email = (user.email || '').toLowerCase();
            const displayName = (user.display_name || '').toLowerCase();
            
            // List of test/placeholder patterns to exclude
            const testPatterns = [
              'atakankahraman35@outlook.com',
              'batol0786@gmail.com',
              'test@',
              'demo@',
              'sample@',
              'placeholder@',
              'dummy@'
            ];
            
            // Check if user matches any test pattern
            return !testPatterns.some(pattern => 
              email.includes(pattern.toLowerCase()) || 
              displayName.includes(pattern.toLowerCase())
            );
          });
          
          const users = filteredUsers.map(user => ({
            id: user.email,
            email: user.email,
            display_name: user.display_name || user.name || user.email,
            original_name: user.original_name || user.name || user.email,
            total_screenshots: user.total_screenshots || 0,
            total_size_mb: user.total_size_mb || 0,
            active_days_count: user.active_days_count || 0,
            last_activity: user.last_activity || 'Unknown',
            status: user.status || 'active',
            suggestion: true,
            grouped_screenshots: user.grouped_screenshots || {},
            recent_screenshots: user.recent_screenshots || []
          }));
          
          // Sort by screenshot count (most active users first)
          users.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (b.status === 'active' && a.status !== 'active') return 1;
            return (b.total_screenshots || 0) - (a.total_screenshots || 0);
          });
          
          return users;
        }
      }
      
      
    } catch (error) {
      console.error('❌ Error fetching user suggestions:', error);
    }

    // Fallback: return empty array instead of placeholder
    return [];
  };

  // Removed old complex search functions - now using simplified API-based search
  // Enhanced fetch user screenshots function with local API support and better date filtering
  const fetchUserScreenshots = async (user, specificDate = null, page = 1) => {
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    
    try {
      const apiBaseURL = getApiBaseURL();
      
      // Calculate offset for future offset-based pagination
      const offset = (page - 1) * screenshotsPerPage;
      
      // Build the screenshots API endpoint with simplified parameters
      const searchParams = new URLSearchParams({
        q: user.email || user.display_name || user.original_name, // Use email as primary identifier
        screenshots_page: page.toString(),
        screenshots_per_page: screenshotsPerPage.toString()
      });

      // Enhanced date filtering - use current month/year by default or specific date
      if (specificDate) {
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
        searchParams.set('start_date', dateStr);
        searchParams.set('end_date', dateStr);
        console.log(`🗓️ Filtering screenshots for specific date: ${dateStr}`);
      } else {
        // Use a broader date range to show user's available screenshots
        // Go back 3 months and forward 1 month from current selection
        const currentDate = new Date(selectedYear, selectedMonth - 1, 1);
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDateStr = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-01`;
        const endDateStr = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
        
        searchParams.set('start_date', startDateStr);
        searchParams.set('end_date', endDateStr);
        console.log(`📅 Filtering screenshots for broader range: ${startDateStr} to ${endDateStr}`);
      }

      // Try local API first, then fallback to production
      const screenshotEndpoints = [
        // Priority 1: Local API screenshots endpoint (via proxy)
        `/api/users/screenshots/?${searchParams.toString()}`,
        // Priority 2: Production API screenshots endpoint (via proxy)
        `/api/users/screenshots/?${searchParams.toString()}`,
        // Priority 3: Alternative live tracking endpoint (via proxy)
        `/api/live-tracking/screenshots/?${searchParams.toString()}`
      ];

      let response = null;
      let successfulUrl = null;

      for (const apiUrl of screenshotEndpoints) {
        try {
          console.log(`🔗 Trying API endpoint: ${apiUrl}`);
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            signal: AbortSignal.timeout(180000) // 3 minutes timeout for screenshots
          });
          
          if (response.ok) {
            successfulUrl = apiUrl;
            break;
          }
        } catch (err) {
          console.log(`❌ Endpoint ${apiUrl} failed:`, err.message);
          continue;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`All screenshot API endpoints failed. Last status: ${response?.status || 'No response'}`);
      }
      
      
      setApiStatus('connected');
      
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        let screenshots = [];
        const activityDates = new Set();
          
      if (data.status === 'success' && data.data) {
        let screenshots = [];
        const activityDates = new Set();
        
        // Handle the response structure from /api/users/search/ endpoint
        // which returns user data with grouped_screenshots
        if (data.data.users && Array.isArray(data.data.users) && data.data.users.length > 0) {
          const userData = data.data.users[0]; // Get the first user
          console.log('📊 Processing user data with grouped_screenshots:', userData);
          
          // Extract screenshots from grouped_screenshots
          if (userData.grouped_screenshots) {
            Object.keys(userData.grouped_screenshots).forEach(date => {
              const dayData = userData.grouped_screenshots[date];
              if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
                dayData.screenshots.forEach((screenshot, index) => {
                  screenshots.push({
                    ...screenshot,
                    id: screenshot.filename || screenshot.full_key || index,
                    timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                    activity_type: 'ACTIVE',
                    file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                    date: screenshot.date,
                    size_mb: screenshot.size_mb,
                    user_email: userData.email,
                    project_folder: screenshot.subfolder_path
                  });
                });
                
                // Add this date to activity dates
                activityDates.add(date);
              }
            });
          }
          
          // Also handle recent_screenshots if available
          if (userData.recent_screenshots && Array.isArray(userData.recent_screenshots)) {
            userData.recent_screenshots.forEach((screenshot, index) => {
              // Avoid duplicates
              if (!screenshots.find(s => s.filename === screenshot.filename)) {
                screenshots.push({
                  ...screenshot,
                  id: screenshot.filename || screenshot.full_key || index,
                  timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                  activity_type: 'ACTIVE',
                  file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                  date: screenshot.date,
                  size_mb: screenshot.size_mb,
                  user_email: userData.email,
                  project_folder: screenshot.subfolder_path
                });
                
                if (screenshot.date) {
                  activityDates.add(screenshot.date);
                }
              }
            });
          }
        }
        // Handle the direct screenshots response structure (alternative endpoints)
        else if (data.data.screenshots && Array.isArray(data.data.screenshots)) {
          screenshots = data.data.screenshots.map((screenshot, index) => ({
            ...screenshot,
            id: screenshot.filename || screenshot.file_key || index,
            timestamp: extractDateFromScreenshot(screenshot) || screenshot.last_modified || screenshot.timestamp || screenshot.created_at,
            activity_type: 'ACTIVE',
            file_size: screenshot.file_size_mb ? `${screenshot.file_size_mb} MB` : 'N/A',
            date: screenshot.date,
            size_mb: screenshot.file_size_mb,
            user_email: screenshot.user_email,
            project_folder: screenshot.project_folder
          }));
          
          // Add activity dates from screenshots
          screenshots.forEach(screenshot => {
            if (screenshot.date) {
              activityDates.add(screenshot.date);
            }
          });
          
          // Also add dates from project folders if available
          if (data.data.project_folders && data.data.project_folders.projects) {
            data.data.project_folders.projects.forEach(project => {
              if (project.date_range) {
                // Add date range to activity dates
                const startDate = new Date(project.date_range.earliest);
                const endDate = new Date(project.date_range.latest);
                
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                  activityDates.add(d.toISOString().split('T')[0]);
                }
              }
            });
          }
        }
        
        // Update calendar with activity dates
        setUserActivityDates(activityDates);
          
          // Apply client-side date filtering if specificDate is provided
          if (specificDate) {
            const targetDateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
            console.log(`🔍 Client-side filtering for date: ${targetDateStr}`);
            
            screenshots = screenshots.filter(screenshot => {
              // Check multiple date fields
              const screenshotDate = screenshot.date || 
                                   (screenshot.timestamp ? new Date(screenshot.timestamp).toISOString().split('T')[0] : null) ||
                                   (screenshot.filename ? extractDateFromFilename(screenshot.filename) : null);
              
              const matches = screenshotDate === targetDateStr;
              if (matches) {
                console.log(`✅ Screenshot matches date: ${screenshot.filename} - ${screenshotDate}`);
              }
              return matches;
            });
            
            console.log(`📊 After date filtering: ${screenshots.length} screenshots for ${targetDateStr}`);
          }
          
          // Sort screenshots by timestamp (newest first) with safe date handling
          screenshots.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            
            // Handle invalid dates by putting them at the end
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            
            return dateB - dateA;
          });
          
          // Handle pagination from API response (supports both page-based and offset-based)
          const pagination = data.data.pagination;
          
          if (pagination && pagination.total_screenshots) {
            
            // Batch state updates to avoid race conditions
            const updates = {};
            
            // Set total screenshots
            updates.totalScreenshots = pagination.total_screenshots;
            
            // Determine current page
            if (pagination.page) {
              updates.currentPage = pagination.page;
            } else if (pagination.offset !== undefined) {
              updates.currentPage = Math.floor(pagination.offset / screenshotsPerPage) + 1;
            } else {
              updates.currentPage = page;
            }
            
            // Handle screenshots data
            if (page === 1) {
              updates.userScreenshots = screenshots;
              updates.allScreenshots = screenshots;
              
              // Only update page size on first load
              const apiPageSize = pagination.page_size || pagination.limit;
              if (apiPageSize && apiPageSize !== screenshotsPerPage) {
                updates.screenshotsPerPage = apiPageSize;
              }
            } else {
              // For load more, we need to update the state directly since we can't batch array updates
              setAllScreenshots(prev => {
                const newData = [...prev, ...screenshots];
                return newData;
              });
              setUserScreenshots(prev => {
                const newData = [...prev, ...screenshots];
                return newData;
              });
            }
            
            // Apply batch updates
            if (updates.totalScreenshots) setTotalScreenshots(updates.totalScreenshots);
            if (updates.currentPage) setCurrentPage(updates.currentPage);
            if (updates.screenshotsPerPage) setScreenshotsPerPage(updates.screenshotsPerPage);
            if (updates.userScreenshots) setUserScreenshots(updates.userScreenshots);
            if (updates.allScreenshots) setAllScreenshots(updates.allScreenshots);
            
          } else {
            // Only use fallback for the first page
            if (page === 1) {
              setTotalScreenshots(screenshots.length);
              setCurrentPage(1);
              setAllScreenshots(screenshots);
              setUserScreenshots(screenshots);
            }
            // For subsequent pages without pagination data, don't update anything
          }
          
          if (screenshots.length > 0) {
            const currentOffset = (page - 1) * screenshotsPerPage;
          } else {
            if (page === 1) {
              setUserScreenshots([]);
              setScreenshotError(`No screenshots found for ${user.display_name || user.email} in the selected period.`);
            }
          }
        } else {
          setUserScreenshots([]);
          setAllScreenshots([]);
          setTotalScreenshots(0);
          setScreenshotError(`No screenshots available for ${user.display_name || user.email}.`);
        }
      } else {
        setUserScreenshots([]);
        setAllScreenshots([]);
        setTotalScreenshots(0);
        setScreenshotError(`No data returned from API for ${user.display_name || user.email}.`);
      }
    } catch (error) {
      console.error('🚨 Screenshot Error:', error);
      setApiStatus('error');
      setScreenshotError(`Failed to load screenshots: ${error.message}`);
      setUserScreenshots([]);
      setAllScreenshots([]);
      setTotalScreenshots(0);
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  // Function to fetch screenshots for all users
  const fetchAllUsersScreenshots = async () => {
    if (allUsers.length === 0) {
      return;
    }

    setIsLoadingAllScreenshots(true);
    
    try {
      const allScreenshotsData = [];
      const batchSize = 5; // Process 5 users at a time to not overwhelm the server
      
      for (let i = 0; i < allUsers.length; i += batchSize) {
        const batch = allUsers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (user) => {
          try {
            const apiUrl = `${getApiBaseURL()}/api/Screenshots/`;
            const params = new URLSearchParams({
              user_email: user.email,
              year: selectedYear.toString(),
              month: selectedMonth.toString(),
              page: '1',
              page_size: '10' // Limit to first 10 screenshots per user for overview
            });
            
            const response = await fetch(`${apiUrl}?${params}`);
            
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                return {
                  user: user,
                  screenshots: data.results.slice(0, 5), // Show max 5 screenshots per user
                  totalCount: data.count || data.results.length
                };
              }
            }
            return null;
          } catch (error) {
            return null;
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        const validResults = batchResults
          .filter(result => result.status === 'fulfilled' && result.value !== null)
          .map(result => result.value);
        
        allScreenshotsData.push(...validResults);
        
        // Small delay between batches
        if (i + batchSize < allUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setAllUsersScreenshots(allScreenshotsData);
      
    } catch (error) {
      console.error('❌ Error fetching all users screenshots:', error);
    } finally {
      setIsLoadingAllScreenshots(false);
    }
  };

  // Search effect - new implementation with proper API endpoint
  useEffect(() => {
    const trimmedQuery = searchValue.trim();
    
    if (trimmedQuery.length >= 1) {
      // Debounce search to avoid too many API calls
      const timer = setTimeout(() => {
        console.log('🔍 Initiating search for:', trimmedQuery);
        
        // For initial search, try without date restrictions first
        // This will help us get results even if the specific date range has no data
        searchUsersFromAPI(trimmedQuery, 10, 0, 0, null, null)
          .then(results => {
            if (!results || results.length === 0) {
              console.log('📅 No results without date filter, trying with current month...');
              // If no results, try with current month range
              const year = selectedYear;
              const month = selectedMonth;
              const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
              const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${getDaysInMonth(year, month).toString().padStart(2, '0')}`;
              
              return searchUsersFromAPI(trimmedQuery, 10, 0, 0, startOfMonth, endOfMonth);
            }
            return results;
          })
          .catch(error => {
            console.error('🚨 Search error:', error);
          });
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      // When search is empty, show all users
      setSearchResults(allUsers);
      setShowResults(true);
      setError(null);
      setIsSearching(false);
    }
  }, [searchValue, allUsers, selectedYear, selectedMonth]); // Add selectedYear and selectedMonth as dependencies

  // Enhanced search input handler
  // Local search function to filter sync-staffs users quickly
  const filterSyncStaffsUsers = (query) => {
    if (!query || query.trim().length === 0) {
      return syncStaffsUsers;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return syncStaffsUsers.filter(user => 
      (user.username && user.username.toLowerCase().includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm)) ||
      (user.job_position && user.job_position.toLowerCase().includes(searchTerm))
    );
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowResults(true);
    
    // Filter sync-staffs users locally for fast search
    const filtered = filterSyncStaffsUsers(value);
    setFilteredUsers(filtered);
    
    // No API calls needed - just local filtering
    setIsSearching(false);
  };

  // Google-style fuzzy matching for typos and partial matches
  const fuzzyMatch = (text, query) => {
    if (!text || !query) return false;
    
    // Simple fuzzy matching - allows 1 character difference for short queries
    if (query.length <= 3) {
      let differences = 0;
      const minLength = Math.min(text.length, query.length);
      
      for (let i = 0; i < minLength; i++) {
        if (text[i] !== query[i]) differences++;
        if (differences > 1) return false;
      }
      
      return differences <= 1 && Math.abs(text.length - query.length) <= 1;
    }
    
    // For longer queries, use contains matching with character proximity
    return text.includes(query) || levenshteinDistance(text, query) <= 2;
  };

  // Simple Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  // Google-style text highlighting for multiple terms
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    // Split query into individual terms like Google
    const searchTerms = query.trim().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    // Highlight each term with different colors like Google
    searchTerms.forEach((term, index) => {
      const colors = [
        { bg: '#fff3cd', color: '#856404' }, // Yellow
        { bg: '#d1ecf1', color: '#0c5460' }, // Blue  
        { bg: '#d4edda', color: '#155724' }, // Green
        { bg: '#f8d7da', color: '#721c24' }  // Red
      ];
      
      const colorScheme = colors[index % colors.length];
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      
      highlightedText = highlightedText.replace(regex, (match) => 
        `<mark style="background-color: ${colorScheme.bg}; color: ${colorScheme.color}; font-weight: bold; padding: 1px 2px; border-radius: 2px;">${match}</mark>`
      );
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  // Background search prefetching (non-blocking)
  const fetchSearchInBackground = async (query) => {
    try {
      const apiBaseURL = getApiBaseURL();
      const response = await fetch(`${apiBaseURL}/users/search/?q=${encodeURIComponent(query)}&limit=20`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.users) {
          setSearchCache(prev => {
            const newCache = new Map(prev);
            newCache.set(query.toLowerCase(), data.data.users);
            return newCache;
          });
        }
      }
    } catch (error) {
      // Silent fail for background requests
    }
  };

  // Handle keyboard navigation with advanced features
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setSearchValue('');
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      // Auto-select first result on Enter
      handleResultSelect(searchResults[0]);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // TODO: Add arrow key navigation through results
      e.preventDefault();
    } else if (e.key === 'Tab' && searchResults.length > 0) {
      // Tab completion - auto-complete with first result
      e.preventDefault();
      const firstResult = searchResults[0];
      setSearchValue(firstResult.display_name || firstResult.email);
    }
  };

  // Memoized search results for better performance
  const memoizedSearchResults = useMemo(() => {
    // If user is searching (has typed something), show filtered search results
    // If no search query, show all users by default
    const trimmedSearchValue = searchValue.trim();
    
    console.log('🔄 memoizedSearchResults update:', {
      trimmedSearchValue,
      searchResultsLength: searchResults.length,
      allUsersLength: allUsers.length
    });
    
    if (trimmedSearchValue.length > 0) {
      // User is actively searching, show search results
      console.log('📋 Showing search results:', searchResults.length);
      return searchResults;
    } else {
      // No search query, show all users loaded on mount
      console.log('👥 Showing all users:', allUsers.length);
      return allUsers;
    }
  }, [searchResults, allUsers, searchValue]);

  // Enhanced user selection handler that searches API with user name and date
  const handleResultSelect = useCallback(async (user) => {
    console.log('🎯 User selected:', user);
    
    setSearchValue(user.display_name || user.email);
    setShowResults(false);
    setSelectedUser({
      ...user,
      email: user.email,
      display_name: user.display_name || user.username,
      username: user.username,
      staff_id: user.staff_id,
      profile_url: user.profile_url,
      total_screenshots: 0,
      recent_screenshots: []
    });
    setUserActivityDates(new Set()); // Reset activity dates
    setActiveDate(null); // Reset active date selection
    setCurrentPage(1); // Reset pagination
    
    // Show loading state immediately for better UX
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    setUserScreenshots([]); // Clear previous screenshots
    setError(null);
    
    // Scroll to screenshots section after a brief delay
    setTimeout(() => {
      const screenshotsSection = document.querySelector('[data-screenshots-section]');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    
    // Prepare search query - use user's display name (not email)
    const searchQuery = user.display_name || user.username || user.original_name || '';
    
    // Set default date range - September 1st to current date as requested
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // Default start date: September 1st, 2025 (as requested)
    const defaultStartDate = '2025-09-01';
    const defaultEndDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    console.log(`🔍 Searching API for user name: "${searchQuery}" from ${defaultStartDate} to ${defaultEndDate}`);
    
    try {
      // Call the API with user name and date range
      const apiUsers = await searchUsersFromAPI(searchQuery, 10, 0, 0, defaultStartDate, defaultEndDate);
      
      if (apiUsers && apiUsers.length > 0) {
        // Find the exact user from API response
        const apiUser = apiUsers.find(u => 
          u.email === user.email || 
          u.display_name === user.display_name || 
          u.original_name === user.original_name
        ) || apiUsers[0]; // Use first result if no exact match
        
        console.log('✅ Found user data from API:', apiUser);
        
        // Update selected user with fresh API data, preserving profile_url and staff_id from original user
        setSelectedUser({
          ...apiUser,
          staff_id: user.staff_id || apiUser.staff_id,
          profile_url: user.profile_url || apiUser.profile_url
        });
        
        // Process and load screenshots from API response
        let allScreenshots = [];
        const activityDates = new Set();
        
        // Extract screenshots from grouped_screenshots
        if (apiUser.grouped_screenshots && Object.keys(apiUser.grouped_screenshots).length > 0) {
          Object.keys(apiUser.grouped_screenshots).forEach(date => {
            const dayData = apiUser.grouped_screenshots[date];
            activityDates.add(date);
            
            if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
              dayData.screenshots.forEach((screenshot, index) => {
                allScreenshots.push({
                  ...screenshot,
                  id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                  timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                  activity_type: 'ACTIVE',
                  file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                  date: screenshot.date || date,
                  size_mb: screenshot.size_mb,
                  user_email: apiUser.email,
                  project_folder: screenshot.subfolder_path
                });
              });
            }
          });
        }
        
        // Also include recent_screenshots if available (avoid duplicates)
        if (apiUser.recent_screenshots && Array.isArray(apiUser.recent_screenshots)) {
          apiUser.recent_screenshots.forEach((screenshot, index) => {
            if (!allScreenshots.find(s => s.filename === screenshot.filename)) {
              const screenshotDate = screenshot.date || (screenshot.datetime ? screenshot.datetime.split(' ')[0] : null);
              if (screenshotDate) activityDates.add(screenshotDate);
              
              allScreenshots.push({
                ...screenshot,
                id: screenshot.filename || screenshot.full_key || `recent-${index}`,
                timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                activity_type: 'ACTIVE',
                file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                date: screenshot.date || screenshotDate,
                size_mb: screenshot.size_mb,
                user_email: apiUser.email,
                project_folder: screenshot.subfolder_path
              });
            }
          });
        }
        
        // Sort screenshots by timestamp (newest first)
        allScreenshots.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          return dateB - dateA;
        });
        
        console.log(`📸 Loaded ${allScreenshots.length} screenshots for ${apiUser.display_name}`);
        console.log(`📅 Activity dates:`, Array.from(activityDates));
        console.log(`🔍 Sample screenshot dates:`, allScreenshots.slice(0, 3).map(s => s.date));
        console.log(`📅 Current UI state - Year: ${selectedYear}, Month: ${selectedMonth}, ActiveDate: ${activeDate}`);
        
        // Update state with API data
        setAllScreenshots(allScreenshots);
        setUserScreenshots(allScreenshots);
        setUserActivityDates(activityDates);
        setTotalScreenshots(apiUser.total_screenshots || allScreenshots.length);
        setApiStatus('connected');
        setError(null);
        
      } else {
        console.warn('⚠️ No data found for user from API');
        setError(`No screenshots found for ${searchQuery} in the specified date range (${defaultStartDate} to ${defaultEndDate})`);
        setApiStatus('disconnected');
      }
      
    } catch (error) {
      console.error('❌ Error searching user from API:', error);
      setError(`Failed to load data for ${searchQuery}: ${error.message}`);
      setApiStatus('error');
    } finally {
      setIsLoadingScreenshots(false);
    }
  }, [selectedYear, selectedMonth]);

  // Generate calendar days for the selected month
  const calendarDays = useMemo(() => {
    return generateCalendarDays(selectedYear, selectedMonth, userActivityDates);
  }, [selectedYear, selectedMonth, userActivityDates]);

  const currentMonthDays = calendarDays.filter(day => day.isCurrentMonth);

  // Get the last 4 days of the selected month (for the original view)
  const dates = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const startDay = Math.max(1, daysInMonth - 3);
    
    return Array.from(
      { length: daysInMonth - startDay + 1 },
      (_, i) => {
        const day = (startDay + i).toString().padStart(2, '0');
        return {
          date: day,
          month: getMonthName(selectedMonth, language),
          year: selectedYear.toString(),
          active: day === activeDate
        };
      }
    );
  }, [selectedYear, selectedMonth, activeDate, language]);

  // Function to refresh user data from API when date selection changes
  const refreshUserDataFromAPI = async (user, customStartDate = null, customEndDate = null) => {
    if (!user) return;
    
    setIsLoadingScreenshots(true);
    setError(null);
    
    try {
      // Prepare search query
      const searchQuery = user.display_name || user.username || user.email || user.original_name || '';
      
      // Determine date range
      let startDate, endDate;
      
      if (customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        // Use current selected year/month or default to September 1st
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        if (selectedYear && selectedMonth) {
          // Use selected month/year
          startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;
        } else {
          // Default to September 1st to current date
          startDate = '2025-09-01';
          endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
        }
      }
      
      console.log(`🔄 Refreshing user data: "${searchQuery}" from ${startDate} to ${endDate}`);
      
      // Call API to get fresh data
      const apiUsers = await searchUsersFromAPI(searchQuery, 10, 0, 0, startDate, endDate);
      
      if (apiUsers && apiUsers.length > 0) {
        const apiUser = apiUsers.find(u => 
          u.email === user.email || 
          u.display_name === user.display_name || 
          u.original_name === user.original_name
        ) || apiUsers[0];
        
        // Update selected user with fresh data
        setSelectedUser(apiUser);
        
        // Process screenshots and activity dates (same as in handleResultSelect)
        let allScreenshots = [];
        const activityDates = new Set();
        
        if (apiUser.grouped_screenshots && Object.keys(apiUser.grouped_screenshots).length > 0) {
          Object.keys(apiUser.grouped_screenshots).forEach(date => {
            const dayData = apiUser.grouped_screenshots[date];
            activityDates.add(date);
            
            if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
              dayData.screenshots.forEach((screenshot, index) => {
                allScreenshots.push({
                  ...screenshot,
                  id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                  timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                  activity_type: 'ACTIVE',
                  file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                  date: screenshot.date || date,
                  size_mb: screenshot.size_mb,
                  user_email: apiUser.email,
                  project_folder: screenshot.subfolder_path
                });
              });
            }
          });
        }
        
        if (apiUser.recent_screenshots && Array.isArray(apiUser.recent_screenshots)) {
          apiUser.recent_screenshots.forEach((screenshot, index) => {
            if (!allScreenshots.find(s => s.filename === screenshot.filename)) {
              const screenshotDate = screenshot.date || (screenshot.datetime ? screenshot.datetime.split(' ')[0] : null);
              if (screenshotDate) activityDates.add(screenshotDate);
              
              allScreenshots.push({
                ...screenshot,
                id: screenshot.filename || screenshot.full_key || `recent-${index}`,
                timestamp: extractDateFromScreenshot(screenshot) || screenshot.datetime || screenshot.last_modified,
                activity_type: 'ACTIVE',
                file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                date: screenshot.date || screenshotDate,
                size_mb: screenshot.size_mb,
                user_email: apiUser.email,
                project_folder: screenshot.subfolder_path
              });
            }
          });
        }
        
        // Sort screenshots by timestamp (newest first)
        allScreenshots.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          
          return dateB - dateA;
        });
        
        // Update state
        setAllScreenshots(allScreenshots);
        setUserScreenshots(allScreenshots);
        setUserActivityDates(activityDates);
        setTotalScreenshots(apiUser.total_screenshots || allScreenshots.length);
        setCurrentPage(1);
        setApiStatus('connected');
        setError(null);
        
        console.log(`✅ Refreshed: ${allScreenshots.length} screenshots, ${activityDates.size} activity dates`);
        
      } else {
        setError(`No screenshots found for ${searchQuery} in the date range (${startDate} to ${endDate})`);
        setUserScreenshots([]);
        setAllScreenshots([]);
        setUserActivityDates(new Set());
      }
      
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      setError(`Failed to refresh data: ${error.message}`);
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  // Handle year and month changes
  const handleYearChange = async (e) => {
    const newYear = Number(e.target.value);
    setSelectedYear(newYear);
    setUserActivityDates(new Set()); // Reset activity dates
    setCurrentPage(1); // Reset pagination
    
    // If user is selected, refresh data with new year but keep active date if selected
    if (selectedUser) {
      if (activeDate) {
        // Keep the selected date and make API call with specific date
        const specificDate = `${newYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
        console.log(`📅 Year changed to ${newYear}, refreshing with specific date: ${specificDate}`);
        await searchUserByNameOrEmail(
          selectedUser.display_name || selectedUser.original_name || selectedUser.email,
          0 // retryCount
        );
      } else {
        // No specific date selected, refresh with month range
        refreshUserDataFromAPI(selectedUser);
      }
    }
  };

  const handleMonthChange = async (e) => {
    const newMonth = Number(e.target.value);
    setSelectedMonth(newMonth);
    setUserActivityDates(new Set()); // Reset activity dates  
    setCurrentPage(1); // Reset pagination
    
    // If user is selected, refresh data with new month but keep active date if selected
    if (selectedUser) {
      if (activeDate) {
        // Keep the selected date and make API call with specific date
        const specificDate = `${selectedYear}-${newMonth.toString().padStart(2, '0')}-${activeDate}`;
        console.log(`📅 Month changed to ${newMonth}, refreshing with specific date: ${specificDate}`);
        await searchUserByNameOrEmail(
          selectedUser.display_name || selectedUser.original_name || selectedUser.email,
          0 // retryCount
        );
      } else {
        // No specific date selected, refresh with month range
        refreshUserDataFromAPI(selectedUser);
      }
    }
  };

  // Handle screenshots per page change
  const handleScreenshotsPerPageChange = async (e) => {
    const newPerPage = Number(e.target.value);
    console.log(`📊 Changing screenshots per page from ${screenshotsPerPage} to: ${newPerPage}`);
    
    setScreenshotsPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
    
    // If user is selected, refresh data with new page size
    if (selectedUser) {
      console.log(`� Refetching data for user: ${selectedUser.display_name || selectedUser.email}`);
      
      // Clear current screenshots to show loading state
      setIsLoadingScreenshots(true);
      
      if (activeDate) {
        // Specific date selected, make API call with new page size
        const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
        console.log(`📅 Fetching for specific date: ${specificDate} with ${newPerPage} per page`);
        
        try {
          const searchParams = new URLSearchParams({
            q: selectedUser.display_name || selectedUser.original_name || selectedUser.email,
            start_date: specificDate,
            end_date: specificDate,
            screenshots_per_page: newPerPage.toString(),
            screenshots_page: '1'
          });
          
          const apiUrl = `/api/users/search/?${searchParams.toString()}`;
          console.log(`🌐 API call: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success' && data.data && data.data.users && data.data.users.length > 0) {
              const foundUser = data.data.users[0];
              
              // Process screenshots for the specific date
              let allScreenshots = [];
              if (foundUser.grouped_screenshots) {
                Object.keys(foundUser.grouped_screenshots).forEach(date => {
                  if (date === specificDate) {
                    const dayData = foundUser.grouped_screenshots[date];
                    if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
                      dayData.screenshots.forEach((screenshot, index) => {
                        allScreenshots.push({
                          ...screenshot,
                          id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                          date: date,
                          url: screenshot.s3_presigned_url || screenshot.url,
                          thumbnail_url: screenshot.thumbnail_url,
                          filename: screenshot.filename || screenshot.full_key,
                          created_at: screenshot.created_at,
                          user_id: screenshot.user_id
                        });
                      });
                    }
                  }
                });
              }
              
              console.log(`✅ Fetched ${allScreenshots.length} screenshots for date ${specificDate}`);
              setUserScreenshots(allScreenshots);
              setAllScreenshots(allScreenshots);
              setTotalScreenshots(foundUser.total_screenshots || allScreenshots.length);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching screenshots:', error);
        } finally {
          setIsLoadingScreenshots(false);
        }
      } else {
        // No specific date selected, refresh with month range and new page size
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
        const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        
        console.log(`📅 Fetching for date range: ${startDate} to ${endDate} with ${newPerPage} per page`);
        
        try {
          const searchParams = new URLSearchParams({
            q: selectedUser.display_name || selectedUser.original_name || selectedUser.email,
            start_date: startDate,
            end_date: endDate,
            screenshots_per_page: newPerPage.toString(),
            screenshots_page: '1'
          });
          
          const apiUrl = `/api/users/search/?${searchParams.toString()}`;
          console.log(`🌐 API call: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success' && data.data && data.data.users && data.data.users.length > 0) {
              const foundUser = data.data.users[0];
              
              // Process all screenshots
              let allScreenshots = [];
              if (foundUser.grouped_screenshots) {
                Object.keys(foundUser.grouped_screenshots).forEach(date => {
                  const dayData = foundUser.grouped_screenshots[date];
                  if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
                    dayData.screenshots.forEach((screenshot, index) => {
                      allScreenshots.push({
                        ...screenshot,
                        id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                        date: date,
                        url: screenshot.s3_presigned_url || screenshot.url,
                        thumbnail_url: screenshot.thumbnail_url,
                        filename: screenshot.filename || screenshot.full_key,
                        created_at: screenshot.created_at,
                        user_id: screenshot.user_id
                      });
                    });
                  }
                });
              }
              
              console.log(`✅ Fetched ${allScreenshots.length} screenshots for date range`);
              setUserScreenshots(allScreenshots);
              setAllScreenshots(allScreenshots);
              setTotalScreenshots(foundUser.total_screenshots || allScreenshots.length);
            }
          }
        } catch (error) {
          console.error('❌ Error fetching screenshots:', error);
        } finally {
          setIsLoadingScreenshots(false);
        }
      }
    }
  };

  // Shared function to process screenshot URLs consistently
  const processScreenshotUrl = (screenshotUrl) => {
    if (!screenshotUrl) {
      console.log('🖼️ No URL provided');
      return null;
    }
    
    // FIRST: Sanitize the URL to fix malformed S3 region format
    const sanitizedUrl = sanitizeS3Url(screenshotUrl);
    console.log('🖼️ Processing URL:', screenshotUrl, '→ Sanitized:', sanitizedUrl);
    
    // If URL is already processed (starts with /s3-images), return as is
    if (sanitizedUrl.startsWith('/s3-images')) {
      console.log('🖼️ URL already processed:', sanitizedUrl);
      return sanitizedUrl;
    }
    
    // Get current host and port for full URL construction - using Vite dev server proxy
    const currentHost = '/s3-images';
    
    // Replace S3 URL with current app URL
    if (sanitizedUrl.includes('ddsfocustime.s3.eu-north-1.amazonaws.com')) {
      // Replace the S3 domain with proxy server URL
      const localUrl = sanitizedUrl.replace(
        'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
        currentHost
      );
      console.log('🖼️ Converted S3 URL:', sanitizedUrl, '→', localUrl);
      return localUrl;
    }
    
    // Handle other S3 formats
    if (sanitizedUrl.includes('s3') && sanitizedUrl.includes('amazonaws.com')) {
      const urlParts = sanitizedUrl.split('/');
      const pathIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
      if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
        const s3Path = urlParts.slice(pathIndex + 1).join('/');
        const finalUrl = `${currentHost}/${s3Path}`;
        console.log('🖼️ Converted generic S3 URL:', sanitizedUrl, '→', finalUrl);
        return finalUrl;
      }
    }
    
    // Return sanitized URL for non-S3 images
    console.log('🖼️ Non-S3 URL, returning sanitized:', sanitizedUrl);
    return sanitizedUrl;
  };

  // Modal functions for image viewing - Use MUI Dialog
  const handleCardClick = (index) => {
    if (!userScreenshots[index]) return;
    setActiveScreenshotIndex(index);
  };

  const handleCloseModal = () => setActiveScreenshotIndex(null);

  const handleModalNavigation = useCallback((direction) => {
    setActiveScreenshotIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      const total = userScreenshots.length;
      if (!total) return null;

      if (direction === 'next') {
        return prevIndex < total - 1 ? prevIndex + 1 : prevIndex;
      }

      if (direction === 'previous') {
        return prevIndex > 0 ? prevIndex - 1 : prevIndex;
      }

      return prevIndex;
    });
  }, [userScreenshots.length]);

  const handleModalKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handleModalNavigation('previous');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleModalNavigation('next');
    } else if (event.key === 'Escape') {
      handleCloseModal();
    }
  }, [handleModalNavigation, handleCloseModal]);

  // Keyboard navigation for modal (handled in handleModalKeyDown callback)

  // Pagination handlers - Updated to refetch data when page changes
  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalScreenshots / screenshotsPerPage)) {
      setCurrentPage(newPage);
      
      // Refetch screenshots for the new page if user is selected
      if (selectedUser) {
        await fetchUserScreenshots(selectedUser, activeDate, newPage);
      }
      
      // Scroll to top of screenshots section
      const screenshotsSection = document.querySelector('[data-screenshots-section]');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Load More handler - goes to next page
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(totalScreenshots / screenshotsPerPage)) {
      await handlePageChange(nextPage);
    }
  };

  // Calculate total pages from API pagination or fallback to local calculation
  const totalPages = useMemo(() => {
    // If we have pagination data from API, use it directly
    if (totalScreenshots > 0 && screenshotsPerPage > 0) {
      return Math.ceil(totalScreenshots / screenshotsPerPage);
    }
    return 1;
  }, [totalScreenshots, screenshotsPerPage]);

  // Handle date selection from calendar
  const handleDateSelect = async (day) => {
    if (day.isCurrentMonth) {
      const selectedDateStr = day.date.toString().padStart(2, '0');
      console.log(`📅 Date selected: ${selectedDateStr}`);
      setActiveDate(selectedDateStr);
      
      // If a user is selected, make API call with specific date
      if (selectedUser && selectedUser.email) {
        const specificDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDateStr}`;
        console.log(`🔍 Making API call for user ${selectedUser.display_name} on specific date: ${specificDate}`);
        
        // Make API call with the specific date passed directly
        setIsLoadingScreenshots(true);
        setError(null);
        
        try {
          const searchParams = new URLSearchParams({
            q: selectedUser.display_name || selectedUser.original_name || selectedUser.email,
            start_date: specificDate,
            end_date: specificDate,
            screenshots_per_page: screenshotsPerPage.toString(),
            screenshots_page: currentPage.toString()
          });
          
          const apiUrl = `/api/users/search/?${searchParams.toString()}`;
          console.log(`🌐 API call: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success' && data.data && data.data.users && data.data.users.length > 0) {
              const foundUser = data.data.users[0];
              
              // Process screenshots for the specific date
              let allScreenshots = [];
              if (foundUser.grouped_screenshots) {
                Object.keys(foundUser.grouped_screenshots).forEach(date => {
                  if (date === specificDate) {
                    const dayData = foundUser.grouped_screenshots[date];
                    if (dayData.screenshots && Array.isArray(dayData.screenshots)) {
                      dayData.screenshots.forEach((screenshot, index) => {
                        allScreenshots.push({
                          ...screenshot,
                          id: screenshot.filename || screenshot.full_key || `${date}-${index}`,
                          timestamp: screenshot.datetime || screenshot.last_modified,
                          activity_type: 'ACTIVE',
                          file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A',
                          date: date,
                          size_mb: screenshot.size_mb,
                          user_email: foundUser.email,
                          project_folder: screenshot.subfolder_path
                        });
                      });
                    }
                  }
                });
              }
              
              // Sort screenshots by timestamp (newest first)
              allScreenshots.sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB - dateA;
              });
              
              setUserScreenshots(allScreenshots);
              setAllScreenshots(allScreenshots);
              setTotalScreenshots(allScreenshots.length);
              setCurrentPage(1);
              
              if (allScreenshots.length === 0) {
                setError(`No screenshots found on ${specificDate} for ${selectedUser.display_name}`);
              } else {
                setError(null);
                console.log(`✅ Found ${allScreenshots.length} screenshots for ${specificDate}`);
              }
            } else {
              setError(`No data found for ${selectedUser.display_name} on ${specificDate}`);
              setUserScreenshots([]);
              setAllScreenshots([]);
              setTotalScreenshots(0);
            }
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('❌ Error fetching screenshots for date:', error);
          setError(`Failed to load screenshots for ${specificDate}: ${error.message}`);
          setUserScreenshots([]);
          setAllScreenshots([]);
          setTotalScreenshots(0);
        } finally {
          setIsLoadingScreenshots(false);
        }
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
  <Container dashboard={compactPadding}>
      <Title>
        {t('realTimeActivityStream')}
        {/* Use the shared Tooltip component for the signal icon so the tooltip is positioned and themed consistently */}
  <Tooltip text={t('realTimeActivityStream')} theme={tooltipTheme} icon="">
          <span className="help-icon" ref={helpRef} aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px' }}>
            {/* Local SVG matching the attached 'signal stream' icon: symmetric left/right arcs + center dot */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
          </span>
        </Tooltip>
      </Title>

      <SelectContainer>
        <Select value={selectedYear} onChange={handleYearChange}>
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
        <Select value={selectedMonth} onChange={handleMonthChange}>
          {MONTHS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={screenshotsPerPage} onChange={handleScreenshotsPerPageChange}>
          <option value={50}>50 {t('perPage')}</option>
          <option value={100}>100 {t('perPage')}</option>
          <option value={200}>200 {t('perPage')}</option>
          <option value={500}>500 {t('perPage')}</option>
          <option value={1000}>1000 {t('perPage')}</option>
        </Select>
      </SelectContainer>

      <DateNav>
        <EmployeeTab>
          {selectedUser ? (selectedUser.display_name || selectedUser.email) : (searchValue || t('searchEmployee'))}
        </EmployeeTab>
        
        <ArrowButton type="button" onClick={() => {
          if (dateScrollRef.current) {
            dateScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
          }
        }}>←</ArrowButton>
        
        {/* Horizontal Date Row */}
        <div 
          ref={dateScrollRef}
          className="date-row-container"
          data-theme-aware="true"
        >
          <style>{`
            .date-row::-webkit-scrollbar {
              display: none;
            }
            .date-row {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
            [data-theme="dark"] .date-row {
              background-color: #1d232c !important;
              border-color: #6b7280 !important;
            }
          `}</style>
          {/* Show all dates of current month for horizontal display */}
          {currentMonthDays.map((day, index) => {
              const isSelected = activeDate === day.date.toString().padStart(2, '0');
              const isToday = day.isToday;
              
              return (
                <div
                  key={`${day.year}-${day.month}-${day.date}`}
                  onClick={() => handleDateSelect(day)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    flexShrink: 0,
                    width: '120px', 
                    height: '60px', 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    borderRadius: '9px', // Rounded corners
                    position: 'relative',
                    backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.2s',
                    border: isSelected ? `1px solid var(--primary-color)` : `1px solid var(--border-color)`
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      // Use CSS variable for hover color so it respects theme
                      e.target.style.backgroundColor = 'var(--hover-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {/* Left side: Day */}
                  <div className="calendar-day">
                    {day.date.toString().padStart(2, '0')}
                  </div>

                  {/* Right side: Month and Year */}
                  <div className="calendar-month-info">
                    <div className="calendar-month">
                      {getMonthName(day.month, language)}
                    </div>
                    <div className="calendar-year">
                      {day.year}
                    </div>
                  </div>
                    {day.hasActivity && (
                    <div className={`activity-indicator ${isSelected ? 'selected' : ''}`} />
                  )}
                </div>
              );
            })}
        </div>
        
        <ArrowButton type="button" onClick={() => {
          if (dateScrollRef.current) {
            dateScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
          }
        }}>→</ArrowButton>
      </DateNav>

      <ContentContainer>
        <SearchContainer 
          ref={searchContainerRef}
          className="search-container-relative"
        >
          <style>{`
            .search-input-relative .activity-search-input { background-color: #ffffff !important; color: var(--text-primary) !important; padding-right: 30px !important; }
            .dark-theme .search-input-relative .activity-search-input,
            [data-theme="dark"] .search-input-relative .activity-search-input { background-color: #1e293b !important; color: #ffffff !important; padding-right: 30px !important; }

            /* User section background: white by default, dark variant in dark mode */
            .user-section-wrapper { background-color: transparent !important; border-radius: 8px !important; }
            .dark-theme .user-section-wrapper,
            [data-theme="dark"] .user-section-wrapper { background-color: transparent !important; border-radius: 8px !important; }
            /* Make only the user list scrollable so header stays fixed */
            .search-dropdown .dropdown-relative { display: flex; flex-direction: column; }
            .search-dropdown .dropdown-header { flex: 0 0 auto; padding: 8px 12px; border-bottom: 1px solid var(--border-color); }
            .search-dropdown .user-list { flex: 1 1 auto; overflow-y: auto; max-height: 300px; }
          `}</style>
          <div className="search-input-relative">
            <SearchInput
              className="activity-search-input"
              type="text"
              placeholder={t('searchUsersByName')}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                console.log('🎯 Search input focused - showing dropdown');
                setShowResults(true);
                
                // If we have users, show them immediately
                if (allUsers.length > 0) {
                  setSearchResults(allUsers);
                  console.log('📋 Showing', allUsers.length, 'users in dropdown');
                } else {
                  // If no users loaded yet, try to load them
                  console.log('🔄 No users available - loading from API...');
                  fetchAllUsers().then(users => {
                    if (users && users.length > 0) {
                      console.log('✅ Loaded', users.length, 'users and showing in dropdown');
                      setAllUsers(users);
                      setSearchResults(users);
                      setShowResults(true);
                    } else {
                      // Try with different search terms if fetchAllUsers fails
                      console.log('🔍 Trying alternative search...');
                      searchUsersFromAPI('a', 50, 0, 0, null, null).then(fallbackUsers => {
                        if (fallbackUsers && fallbackUsers.length > 0) {
                          console.log('✅ Found', fallbackUsers.length, 'users via fallback search');
                          setAllUsers(fallbackUsers);
                          setSearchResults(fallbackUsers);
                          setShowResults(true);
                        }
                      });
                    }
                  });
                }
              }}
              style={{ 
                width: '100%',
                borderColor: selectedUser ? '#28a745' : undefined,
                borderWidth: selectedUser ? '2px' : undefined
              }}
            />
            {selectedUser && (
              <div style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#28a745',
                fontSize: '18px',
                pointerEvents: 'none'
              }}>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="search-dropdown">
              <div className="dropdown-relative">
                {/* Header */}
                <div className="dropdown-header">
                  {searchValue 
                    ? `🔍 ${t('searchResultsFor')} "${searchValue}" (${filteredUsers.length} ${t('found')})` 
                    : `👥 ${t('availableUsers')} (${syncStaffsUsers.length})`
                  }
                </div>

                {/* User List - make this the only scrollable area so header stays fixed */}
                <div className="user-list">
                  {filteredUsers.map((user, index) => {
                    const profilePhotoUrl = getProfilePhotoUrl(user);
                    
                    return (
                      <div
                        key={user.email}
                        onClick={() => handleUserSelect(user)}
                        className="user-item"
                      >
                        <div className="user-item-content">
                          <div className="user-avatar" style={{ position: 'relative', overflow: 'hidden' }}>
                            {profilePhotoUrl ? (
                              <>
                                <img 
                                  src={profilePhotoUrl} 
                                  alt={user.display_name || user.username}
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
                                  fontSize: '20px',
                                  fontWeight: '600'
                                }}>
                                  {(user.display_name || user.username || user.email || '').charAt(0).toUpperCase()}
                                </div>
                              </>
                            ) : (
                              <div style={{ 
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: '600'
                              }}>
                                {(user.display_name || user.username || user.email || '').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="user-info-flex">
                            <div className="user-name-primary">
                              {user.display_name || user.username}
                            </div>
                            <div className="user-email-secondary">
                              {user.email}
                            </div>
                            <div className="user-stats-small">
                              {user.job_position ? `💼 ${user.job_position}` : `👤 ${t('clickToLoadData')}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Loading State */}
              {isSearching && (
                  <div className="loader-wrap">
                    <div className="loader"></div>
                    <div style={{marginTop:"7px"}}>{t('loadingUsers')}</div>
                  </div>
              )}
              
            </div>
          )}
        </SearchContainer>
        
        {/* Right Side Content - Screenshots or Empty State */}
        {selectedUser ? (
          <div className="user-section-wrapper">
            {/* Screenshots Loading */}
            {isLoadingScreenshots && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: themeObj.colors?.text?.secondary || '#6b7280'
              }}>
                <CircularProgress size={40} sx={{ color: themeObj.colors?.primary || '#2563eb', mb: 2 }} />
                <Typography variant="body1">{t('loadingScreenshots')}</Typography>
              </Box>
            )}

            {/* Screenshot Error */}
            {screenshotError && !isLoadingScreenshots && (
              <Box
                sx={{
                  mt: 3,
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  border: `1px solid ${themeObj.mode === 'dark' ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`,
                  backgroundColor: themeObj.mode === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                  color: themeObj.mode === 'dark' ? '#fca5a5' : '#b91c1c',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'inherit', mb: 1 }}>
                  Failed to load screenshots
                </Typography>
                <Typography variant="body2" sx={{ color: 'inherit', mb: 2 }}>
                  {screenshotError}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ 
                    backgroundColor: themeObj.colors?.primary || '#2563eb',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: themeObj.mode === 'dark' ? '#3b82f6' : '#1d4ed8',
                    },
                  }}
                  onClick={() => refreshUserDataFromAPI(selectedUser)}
                >
                  {t('retry')}
                </Button>
              </Box>
            )}

            {/* Screenshots Grid - MUI Design */}
            {!isLoadingScreenshots && !screenshotError && userScreenshots.length > 0 && (
              <Box data-screenshots-section sx={{ mt: 3 }}>
                <Divider sx={{ mb: 3, borderColor: themeObj.colors?.border || 'rgba(0,0,0,0.08)' }} />
                
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 2,
                  }}
                >
                  {userScreenshots.map((screenshot, index) => {
                    const { dateLabel, timeLabel } = formatDateTime(
                      screenshot.timestamp,
                      screenshot.date,
                      screenshot.time
                    );
                    const sizeLabel = getSizeLabel(screenshot.size_mb);

                    return (
                      <Box key={screenshot.id || screenshot.filename || index}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `1px solid ${themeObj.colors?.border || 'rgba(0,0,0,0.08)'}`,
                            backgroundColor: themeObj.colors?.surface || '#fff',
                            boxShadow: 'none',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: themeObj.mode === 'dark' 
                                ? '0 12px 24px rgba(0,0,0,0.3)' 
                                : '0 12px 24px rgba(15,23,42,0.12)',
                            },
                          }}
                        >
                          <CardActionArea onClick={() => handleCardClick(index)}>
                            <Box sx={{ position: 'relative', pt: '62%' }}>
                              {screenshot.thumbnail_url || screenshot.screenshot_url ? (
                                <CardMedia
                                  component="img"
                                  image={processScreenshotUrl(screenshot.thumbnail_url || screenshot.screenshot_url)}
                                  alt={screenshot.filename || 'Screenshot'}
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                  onError={(e) => {
                                    console.error('❌ Image failed to load:', e.target.src);
                                    const sanitizedUrl = sanitizeS3Url(screenshot.screenshot_url);
                                    if (sanitizedUrl && sanitizedUrl !== e.target.src) {
                                      e.target.src = sanitizedUrl;
                                    }
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: themeObj.colors?.background || 'rgba(148,163,184,0.15)',
                                    color: themeObj.colors?.text?.secondary || '#6b7280',
                                    flexDirection: 'column',
                                  }}
                                >
                                  <ImageNotSupportedIcon fontSize="large" />
                                  <Typography variant="caption">Preview unavailable</Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  bgcolor: themeObj.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.55)',
                                  color: '#fff',
                                  borderRadius: '50%',
                                  width: 36,
                                  height: 36,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <ZoomInMapIcon fontSize="small" />
                              </Box>
                            </Box>
                            <CardContent sx={{ minHeight: 96, backgroundColor: themeObj.colors?.surface || '#fff' }}>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600, mb: 0.5, color: themeObj.colors?.text?.primary || '#1f2937' }}
                                noWrap
                              >
                                {screenshot.filename || screenshot.project_folder || 'Screenshot'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: themeObj.colors?.text?.secondary || '#6b7280' }}>
                                {dateLabel} · {timeLabel}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                                {sizeLabel && (
                                  <Chip
                                    size="small"
                                    label={sizeLabel}
                                    sx={{ backgroundColor: 'rgba(59,130,246,0.12)', color: themeObj.colors?.primary || '#2563eb' }}
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>

                {/* Footer with Pagination - MUI Design */}
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', md: 'center' }}
                  justifyContent="space-between"
                  sx={{ mt: 3 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: 160,
                        '& .MuiInputLabel-root': {
                          color: themeObj.colors?.text?.secondary || '#6b7280',
                        },
                        '& .MuiOutlinedInput-root': {
                          color: themeObj.colors?.text?.primary || '#1f2937',
                          backgroundColor: themeObj.colors?.background || themeObj.colors?.surface || '#fff',
                          '& fieldset': {
                            borderColor: themeObj.colors?.border || 'rgba(0,0,0,0.08)',
                          },
                          '&:hover fieldset': {
                            borderColor: themeObj.colors?.primary || '#2563eb',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: themeObj.colors?.primary || '#2563eb',
                          },
                        },
                      }}
                    >
                      <InputLabel id="screenshots-per-page-label">{t('screenshotsPerPage')}</InputLabel>
                      <MuiSelect
                        labelId="screenshots-per-page-label"
                        value={screenshotsPerPage}
                        label={t('screenshotsPerPage')}
                        onChange={handleScreenshotsPerPageChange}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              backgroundColor: themeObj.colors?.surface || '#fff',
                              color: themeObj.colors?.text?.primary || '#1f2937',
                              '& .MuiMenuItem-root': {
                                color: themeObj.colors?.text?.primary || '#1f2937',
                                '&:hover': {
                                  backgroundColor: themeObj.colors?.background || 'rgba(59,130,246,0.1)',
                                },
                              },
                            },
                          },
                        }}
                      >
                        <MenuItem value={50}>50 {t('perPage')}</MenuItem>
                        <MenuItem value={100}>100 {t('perPage')}</MenuItem>
                        <MenuItem value={200}>200 {t('perPage')}</MenuItem>
                        <MenuItem value={500}>500 {t('perPage')}</MenuItem>
                        <MenuItem value={1000}>1000 {t('perPage')}</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </Stack>

                  <Box>
                    <Typography variant="caption" sx={{ color: themeObj.colors?.text?.secondary || '#6b7280' }}>
                      {t('showingOf')} {userScreenshots.length || 0} {t('of')} {totalScreenshots || 0}
                    </Typography>
                  </Box>
                </Stack>

                {totalScreenshots > screenshotsPerPage && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      color="primary"
                      page={Math.min(currentPage, totalPages)}
                      count={totalPages}
                      onChange={(event, page) => handlePageChange(page)}
                      disabled={isLoadingScreenshots}
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: themeObj.colors?.text?.primary || '#1f2937',
                          '&.Mui-selected': {
                            backgroundColor: themeObj.colors?.primary || '#2563eb',
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: themeObj.colors?.primary || '#2563eb',
                            },
                          },
                          '&:hover': {
                            backgroundColor: themeObj.colors?.background || 'rgba(59,130,246,0.1)',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* No Screenshots */}
            {!isLoadingScreenshots && !screenshotError && userScreenshots.length === 0 && (
              <Box
                sx={{
                  borderRadius: 3,
                  border: `2px dashed ${themeObj.colors?.border || 'rgba(148,163,184,0.6)'}`,
                  p: 4,
                  textAlign: 'center',
                  color: themeObj.colors?.text?.secondary || '#6b7280',
                  mt: 3
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  No screenshots to display
                </Typography>
                <Typography variant="body2">
                  {selectedUser 
                    ? `No screenshots found for ${selectedUser.display_name || selectedUser.email || 'the selected user'} in this range.`
                    : 'Select a user to view their screenshots.'}
                </Typography>
                {selectedUser && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      mt: 2,
                      backgroundColor: themeObj.colors?.primary || '#2563eb',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: themeObj.mode === 'dark' ? '#3b82f6' : '#1d4ed8',
                      },
                    }}
                    onClick={() => refreshUserDataFromAPI(selectedUser)}
                  >
                    {t('refresh')}
                  </Button>
                )}
              </Box>
            )}
          </div>
        ) : (
          // Show all users' screenshots instead of empty state
          <div style={{ 
            flex: 1, 
            padding: '0px 20px 20px 20px',
            overflowY: 'auto'
          }}>
            {isLoadingAllScreenshots ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>{t('loadingScreenshots')}</p>
              </div>
            ) : allUsersScreenshots.length > 0 ? (
              <div>
                <div style={{
                  marginBottom: '20px',
                  paddingBottom: '10px',
                  borderBottom: `1px solid var(--border-color)`
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: 'var(--text-primary)'
                  }}>
                    {t('allUsersActivity')} - {getFullMonthName(selectedMonth, language)} {selectedYear}
                  </h3>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)'
                  }}>
                    📊 {allUsersScreenshots.length} {t('usersWithActivity')}
                  </p>
                </div>
                
                {/* Grid of all users' screenshots */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {allUsersScreenshots.map((userScreenshotData, index) => (
                    <div key={index} style={{
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: 'var(--card-background)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {/* User Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleResultSelect(userScreenshotData.user)}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#4285f4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          marginRight: '12px'
                        }}>
                          {(userScreenshotData.user.display_name || userScreenshotData.user.email || '').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {userScreenshotData.user.display_name || userScreenshotData.user.email}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                          }}>
                            {userScreenshotData.totalCount} {t('screenshots')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Screenshots Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                        gap: '8px'
                      }}>
                        {userScreenshotData.screenshots.map((screenshot, screenshotIndex) => (
                          <div key={screenshotIndex} style={{
                            position: 'relative',
                            aspectRatio: '16/9',
                            overflow: 'hidden',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            handleResultSelect(userScreenshotData.user);
                            // Optionally scroll to the specific screenshot
                          }}
                          >
                            <img
                              src={screenshot.screenshot_url}
                              alt={`Screenshot ${screenshotIndex + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                backgroundColor: '#f5f5f5'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const parent = e.target.parentElement;
                                if (parent && !parent.querySelector('.error-placeholder')) {
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'error-placeholder';
                                  placeholder.style.cssText = `
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    background-color: #f5f5f5;
                                    color: #999;
                                    font-size: 12px;
                                  `;
                                  placeholder.textContent = '📷';
                                  parent.appendChild(placeholder);
                                }
                              }}
                            />
                            {/* Timestamp overlay */}
                            <div style={{
                              position: 'absolute',
                              bottom: '2px',
                              right: '2px',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              fontSize: '10px',
                              padding: '2px 4px',
                              borderRadius: '2px'
                            }}>
                              
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* View More Button */}
                      {userScreenshotData.totalCount > userScreenshotData.screenshots.length && (
                        <button
                          onClick={() => handleResultSelect(userScreenshotData.user)}
                          style={{
                            width: '100%',
                            marginTop: '12px',
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: `1px solid var(--border-color)`,
                            borderRadius: '4px',
                            color: 'var(--primary-color)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {t('viewAll')} {userScreenshotData.totalCount} {t('screenshots')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Fallback to original empty state if no screenshots found
              <EmptyStateContainer>
                {isSearching ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <EmptyText>
                      {t('searchingFor')} "{searchValue}"...
                    </EmptyText>
                  </>
                ) : error ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <EmptyText>
                      {error}
                    </EmptyText>
                    <button
                      onClick={() => {
                        setError(null);
                        if (searchValue) {
                          searchUsersFromAPI(searchValue);
                        }
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('retrySearch')}
                    </button>
                  </>
                ) : searchValue && searchResults.length === 0 ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <EmptyText>
                      {t('noUsersWithScreenshots')} {t('searchResultsFor').toLowerCase()} "{searchValue}"
                    </EmptyText>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d', 
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      {t('apiStatus')}: {apiStatus} | {t('results')}: {searchResults.length}
                      <br/>
                      {t('trySearchingFor')} "k", "haseeb", "nawaz"
                    </div>
                  </>
                ) : searchValue && searchResults.length > 0 ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                    <EmptyText>
                      {`${t('found')} ${searchResults.length} user(s) ${t('searchResultsFor').toLowerCase()} "${searchValue}"`}
                      <br/>
                      {t('selectUserToView')}
                    </EmptyText>
                  </>
                ) : (
                  <>
                    <EmptyText style={{ marginTop: '16px' }}>
                      {t('welcomeActivityStream')}
                    </EmptyText>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)', 
                      marginTop: '12px',
                      textAlign: 'center',
                      maxWidth: '400px'
                    }}>
                      <p>📋 {t('clickSearchBox')}</p>
                      <p>🔍 {t('typeNameOrEmail')}</p>
                      <p>📊 {t('selectAnyUser')}</p>
                    </div>
                  </>
                )}
              </EmptyStateContainer>
            )}
          </div>
        )}
      </ContentContainer>
      
      {/* MUI Dialog Modal for Screenshots */}
      {activeScreenshotIndex !== null && userScreenshots[activeScreenshotIndex] && (
        <Dialog
          open={activeScreenshotIndex !== null}
          fullWidth
          maxWidth="lg"
          onClose={handleCloseModal}
          onKeyDown={handleModalKeyDown}
          sx={{
            zIndex: 10000,
            '& .MuiBackdrop-root': {
              zIndex: 10000,
            },
          }}
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              zIndex: 10000,
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              position: 'relative',
              backgroundColor: themeObj.mode === 'dark' ? '#000' : '#0f172a',
              maxHeight: '90vh',
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                color: '#fff',
                backgroundColor: 'rgba(15,23,42,0.5)',
                '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
              }}
              aria-label="Close screenshot preview"
            >
              <CloseIcon />
            </IconButton>

            {activeScreenshotIndex > 0 && (
              <IconButton
                onClick={() => handleModalNavigation('previous')}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 16,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  color: '#fff',
                  backgroundColor: 'rgba(15,23,42,0.5)',
                  '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
                }}
                aria-label="Previous screenshot"
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}
            {activeScreenshotIndex < userScreenshots.length - 1 && (
              <IconButton
                onClick={() => handleModalNavigation('next')}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 16,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  color: '#fff',
                  backgroundColor: 'rgba(15,23,42,0.5)',
                  '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
                }}
                aria-label="Next screenshot"
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}

            {userScreenshots[activeScreenshotIndex]?.screenshot_url || userScreenshots[activeScreenshotIndex]?.thumbnail_url ? (
              <Box
                component="img"
                src={processScreenshotUrl(userScreenshots[activeScreenshotIndex].screenshot_url || userScreenshots[activeScreenshotIndex].thumbnail_url)}
                alt={userScreenshots[activeScreenshotIndex].filename || 'Screenshot preview'}
                sx={{
                  width: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  display: 'block',
                  backgroundColor: themeObj.mode === 'dark' ? '#000' : '#0f172a',
                }}
                onError={(e) => {
                  const sanitizedUrl = sanitizeS3Url(userScreenshots[activeScreenshotIndex].screenshot_url);
                  if (sanitizedUrl && sanitizedUrl !== e.target.src) {
                    e.target.src = sanitizedUrl;
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  minHeight: '60vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <ImageNotSupportedIcon fontSize="large" />
                <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                  Preview unavailable
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      )}
    </Container>
    </>
  );
};

export default ActivityStream;
