import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getApiBaseURL } from '../../../config/api';
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

// Main component
const ActivityStream = () => {
  const { t, language } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // getMonth() is 0-indexed
  const [activeDate, setActiveDate] = useState(today.getDate().toString().padStart(2, '0'));
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [totalScreenshots, setTotalScreenshots] = useState(0); // Total screenshots count
  const [allScreenshots, setAllScreenshots] = useState([]); // Store all screenshots
  const [allUsers, setAllUsers] = useState([]);
  const [searchCache, setSearchCache] = useState(new Map()); // Cache for search results
  const [lastSuccessfulEndpoint, setLastSuccessfulEndpoint] = useState(null); // Cache successful endpoint
  const [userSuggestions, setUserSuggestions] = useState([]); // Store user suggestions
  const [loadingSuggestions, setLoadingSuggestions] = useState(true); // Loading state for suggestions
  const [isDarkMode, setIsDarkMode] = useState(false); // Track dark mode state
  const [screenshotsPerPage, setScreenshotsPerPage] = useState(50); // Screenshots per page
  const [allUsersScreenshots, setAllUsersScreenshots] = useState([]); // Store screenshots for all users
  const [isLoadingAllScreenshots, setIsLoadingAllScreenshots] = useState(false); // Loading state for all screenshots
  const searchContainerRef = useRef(null);
  const dateScrollRef = useRef(null);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1, language)
  }));

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
        // For empty queries, we should still search the API to get all users
        console.log('🔍 Empty query - searching for all users with screenshots');
        query = 'a'; // Use a common letter that will match many users
      }
      
      // Build URL with date range parameters
      const searchParams = new URLSearchParams({
        q: encodeURIComponent(query.trim()),
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      // Add date range if provided
      if (startDate && endDate) {
        searchParams.append('start_date', startDate);
        searchParams.append('end_date', endDate);
        console.log('📅 Using custom date range:', { startDate, endDate });
      } else if (startDate === null && endDate === null) {
        // No date filtering - search all time
        console.log('🌐 Searching all time periods');
      } else {
        // Use selected month/year for date range
        const year = selectedYear;
        const month = selectedMonth;
        const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${getDaysInMonth(year, month).toString().padStart(2, '0')}`;
        searchParams.append('start_date', startOfMonth);
        searchParams.append('end_date', endOfMonth);
        console.log('📅 Using month range:', { startOfMonth, endOfMonth });
      }
      
      // Use the main working API endpoint
      const apiUrl = `http://localhost:8000/api/users/search/?${searchParams.toString()}`;
      
      console.log('🔍 API Request:', apiUrl);
      console.log('📅 Search Parameters:', Object.fromEntries(searchParams));
      
      // Make the API request
      const fetchPromise = fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 120 seconds')), 120000);
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('📡 API Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response Data:', data);
      
      // Handle different API response formats
      let users = [];
      
      if (data.status === 'success' && data.data && data.data.users && Array.isArray(data.data.users)) {
        users = data.data.users;
      } else if (data.users && Array.isArray(data.users)) {
        // Direct users array
        users = data.users;
      } else if (Array.isArray(data)) {
        // Response is directly an array of users
        users = data;
      } else {
        console.log('❌ Unexpected API response format:', data);
      }
      
      if (users.length > 0) {
        // Map and process users - Filter to only show users with screenshots
        const formattedUsers = users
          .filter(user => {
            // Only include users who have screenshots
            const hasScreenshots = (user.total_screenshots && user.total_screenshots > 0) || 
                                  (user.recent_screenshots && user.recent_screenshots.length > 0) ||
                                  (user.grouped_screenshots && Object.keys(user.grouped_screenshots).length > 0);
            
            if (hasScreenshots) {
              console.log(`✅ User ${user.display_name || user.email} has ${user.total_screenshots || 0} screenshots - INCLUDED`);
            } else {
              console.log(`❌ User ${user.display_name || user.email} has no screenshots - EXCLUDED`);
            }
            
            return hasScreenshots;
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
        
        console.log(`✅ Found ${formattedUsers.length} users with screenshots for query "${query}" (filtered from ${users.length} total users)`);
        console.log('👤 Users with screenshots:', formattedUsers.map(u => `${u.display_name} (${u.total_screenshots} screenshots)`));
        
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
        console.log('⚠️ API returned empty users array');
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
      console.error('❌ Error fetching users:', error);
      
      // Check if our request is still the latest one before updating state
      setLastRequestId(currentLatestId => {
        if (currentLatestId === requestId) {
          // Retry logic for timeout and network errors
          if ((error.message.includes('timeout') || error.message.includes('Failed to fetch')) && retryCount < maxRetries) {
            console.log(`🔄 Retrying search... Attempt ${retryCount + 1} of ${maxRetries}`);
            // Retry after a brief delay
            setTimeout(() => {
              searchUsersFromAPI(query, limit, offset, retryCount + 1, startDate, endDate);
            }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
            return currentLatestId;
          }
          
          setApiStatus('disconnected');
          
          // Provide specific error messages
          if (error.message.includes('timeout')) {
            setError(retryCount > 0 
              ? `Search timed out after ${retryCount + 1} attempts. Please check your connection.`
              : 'Search timed out. Please try again or check your connection.'
            );
          } else if (error.name === 'AbortError') {
            setError('Search was cancelled. Please try again.');
          } else if (error.message.includes('Failed to fetch')) {
            setError('Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
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
                  screenshot_url: screenshot.screenshot_url,
                  thumbnail_url: screenshot.thumbnail_url,
                  timestamp: screenshot.datetime,
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
                screenshot_url: screenshot.screenshot_url,
                thumbnail_url: screenshot.thumbnail_url,
                timestamp: screenshot.datetime,
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
        
        // Sort screenshots by timestamp (newest first)
        formattedScreenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        
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
      console.error('❌ Error loading user from API response:', error);
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

  useEffect(() => {
    console.log('🚀 Component mounted - setting up initial load timer');
    
    // Failsafe timer to ensure component always shows
    const failsafeTimer = setTimeout(() => {
      console.log('🚨 Failsafe timer - forcing isLoading to false');
      setIsLoading(false);
    }, 1000);
    
    const timer = setTimeout(async () => {
      console.log('⏰ Timer fired - setting isLoading to false');
      setIsLoading(false);
      clearTimeout(failsafeTimer); // Clear failsafe since we succeeded
      
      // Load all users on startup using the simple fetchAllUsers function
      try {
        console.log('🚀 Loading all users on startup...');
        const users = await fetchAllUsers();
        
        if (users && users.length > 0) {
          console.log(`✅ Loaded ${users.length} users with screenshots successfully`);
          // Set all users and show them by default
          setAllUsers(users);
          setSearchResults(users);
          setShowResults(true); // Show dropdown by default with all users
          setError(null);
          
          // Immediately show results in dropdown
          setTimeout(() => {
            console.log('📋 Auto-showing user dropdown with', users.length, 'users with screenshots');
            setShowResults(true);
          }, 100); // Reduced delay for faster appearance
          
          // Also set search results immediately so they show in dropdown
          setSearchResults(users);
        } else {
          console.log('⚠️ No users with screenshots found from fetchAllUsers');
          // Try a search with no query to get all users with screenshots
          console.log('🔍 Trying fallback search to find users with screenshots...');
          const fallbackUsers = await searchUsersFromAPI('', 100, 0, 0, null, null);
          if (fallbackUsers && fallbackUsers.length > 0) {
            console.log(`✅ Found ${fallbackUsers.length} users with screenshots via fallback search`);
            setAllUsers(fallbackUsers);
            setSearchResults(fallbackUsers);
            setShowResults(true);
            setError(null);
          } else {
            console.log('❌ No users with screenshots found in the system');
            // Try known working search queries to test API
            console.log('🧪 Testing with known queries...');
            const testQueries = ['nawaz', 'a', 'admin'];
            
            for (const testQuery of testQueries) {
              console.log(`🔍 Testing search with query: "${testQuery}"`);
              const testResults = await searchUsersFromAPI(testQuery, 10, 0, 0, null, null);
              if (testResults && testResults.length > 0) {
                console.log(`✅ Found ${testResults.length} users with screenshots using query "${testQuery}"`);
                setAllUsers(testResults);
                setSearchResults(testResults);
                setShowResults(true);
                setError(null);
                break;
              }
            }
            
            // If still no results, show helpful error
            if (!allUsers || allUsers.length === 0) {
              setError('No users with screenshots found. Please ensure users have uploaded screenshots for the current month.');
              setAllUsers([]);
              setSearchResults([]);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading users on startup:', error);
        // Show error but still try to make search available
        setError('Failed to load users. You can still search manually.');
      }
    }, 10);
    return () => {
      clearTimeout(timer);
      clearTimeout(failsafeTimer);
    };
  }, []);

  // Auto-show dropdown when users are loaded
  useEffect(() => {
    if (allUsers.length > 0 && !searchValue) {
      console.log('👥 Users loaded - ensuring dropdown is visible with', allUsers.length, 'users');
      setSearchResults(allUsers);
      setShowResults(true);
    }
  }, [allUsers]);

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

  // Close search dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (showResults && searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [showResults]);

  // Auto-refresh screenshots when date/month changes for dynamic date-wise loading
  useEffect(() => {
    if (selectedUser && selectedUser.email) {
      // Clear current screenshots before fetching new ones
      setUserScreenshots([]);
      setCurrentPage(1); // Reset to first page
      // Fetch screenshots for the new date
      fetchUserScreenshots(selectedUser, null, 1);
    }
    
    // Also refresh all users' screenshots when date changes
    if (allUsers.length > 0) {
      fetchAllUsersScreenshots();
    }
  }, [selectedYear, selectedMonth]); // Dependency on date changes

  // Auto-refresh user search results when API connectivity changes
  useEffect(() => {
    if (searchValue && searchValue.length > 0) {
      // Calculate current month date range
      const year = selectedYear;
      const month = selectedMonth;
      const startOfMonth = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endOfMonth = `${year}-${month.toString().padStart(2, '0')}-${getDaysInMonth(year, month).toString().padStart(2, '0')}`;
      
      searchUsersFromAPI(searchValue, 10, 0, 0, startOfMonth, endOfMonth);
    }
  }, [selectedYear, selectedMonth]); // Refresh search when date changes too

  const fetchAllUsers = async () => {
    setError(null);
    try {
      console.log('🔍 Fetching all users with screenshots...');
      
      // Use searchUsersFromAPI with a common query to get users
      const users = await searchUsersFromAPI('a', 100, 0, 0, null, null);
      
      if (users && users.length > 0) {
        console.log(`✅ Found ${users.length} users with screenshots`);
        setAllUsers(users);
        setApiStatus('connected');
        return users;
      } else {
        console.log('❌ No users with screenshots found');
        setApiStatus('disconnected');
        setError('No users with screenshots found in the system');
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
        page: page.toString(),
        page_size: screenshotsPerPage.toString()
      });

      // Enhanced date filtering - use current month/year by default or specific date
      if (specificDate) {
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
        searchParams.set('start_date', dateStr);
        searchParams.set('end_date', dateStr);
      } else {
        // Use current selected month for dynamic date-wise filtering
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth).toString().padStart(2, '0')}`;
        searchParams.set('start_date', startDate);
        searchParams.set('end_date', endDate);
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
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 15000 // 15 second timeout for screenshots
          });
          
          if (response.ok) {
            successfulUrl = apiUrl;
            break;
          }
        } catch (err) {
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
          
          // Handle the new API response structure
          if (data.data.screenshots && Array.isArray(data.data.screenshots)) {
            
            screenshots = data.data.screenshots.map((screenshot, index) => ({
              ...screenshot,
              id: screenshot.filename || screenshot.file_key || index,
              timestamp: screenshot.last_modified || screenshot.timestamp || screenshot.created_at,
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
          
          // Sort screenshots by timestamp (newest first)
          screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
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
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowResults(true);
    
    // Show loading state when user starts typing
    if (value.trim().length >= 1) {
      setIsSearching(true);
    }
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

  // Memoized result selection handler
  const handleResultSelect = useCallback((user) => {
    
    setSearchValue(user.display_name || user.email);
    setShowResults(false);
    setSelectedUser(user);
    setUserActivityDates(new Set()); // Reset activity dates
    setActiveDate(null); // Reset active date selection
    setCurrentPage(1); // Reset pagination
    
    // Show loading state immediately for better UX
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    setUserScreenshots([]); // Clear previous screenshots
    
    // Scroll to screenshots section after a brief delay
    setTimeout(() => {
      const screenshotsSection = document.querySelector('[data-screenshots-section]');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    
    // Check if this user has existing screenshot data (from API response)
    if (user.grouped_screenshots && Object.keys(user.grouped_screenshots).length > 0) {
      
      // Create a mock API response and load it
      const mockApiResponse = {
        status: "success",
        data: {
          users: [user]
        }
      };
      
      loadUserFromApiResponse(mockApiResponse);
    } else if (user.recent_screenshots && user.recent_screenshots.length > 0) {
      
      // Load from recent screenshots
      const formattedScreenshots = user.recent_screenshots.map(screenshot => ({
        id: screenshot.filename,
        filename: screenshot.filename,
        screenshot_url: screenshot.screenshot_url,
        thumbnail_url: screenshot.thumbnail_url,
        timestamp: screenshot.datetime,
        date: screenshot.date,
        time: screenshot.time,
        size_mb: screenshot.size_mb,
        size_bytes: screenshot.size_bytes,
        activity_type: 'ACTIVE',
        folder: screenshot.subfolder_path,
        full_key: screenshot.full_key
      }));
      
      setUserScreenshots(formattedScreenshots);
      setTotalScreenshots(user.total_screenshots || formattedScreenshots.length);
      setAllScreenshots(formattedScreenshots);
      setIsLoadingScreenshots(false);
      setScreenshotError(null);
    } else {
      // Fetch screenshots for selected user (full month initially)
      fetchUserScreenshots(user, null);
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

  // Handle year and month changes
  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    setActiveDate(null); // Reset active date when year changes
    setUserActivityDates(new Set()); // Reset activity dates
    setCurrentPage(1); // Reset pagination
    // Refresh screenshots if user is selected
    if (selectedUser) {
      fetchUserScreenshots(selectedUser, null);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    setActiveDate(null); // Reset active date when month changes
    setUserActivityDates(new Set()); // Reset activity dates
    setCurrentPage(1); // Reset pagination
    // Refresh screenshots if user is selected
    if (selectedUser) {
      fetchUserScreenshots(selectedUser, null);
    }
  };

  // Pagination handlers - Updated to use API pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalScreenshots / screenshotsPerPage)) {
      // For API-based pagination, fetch new page from server
      if (selectedUser) {
        fetchUserScreenshots(selectedUser, activeDate, newPage);
      }
      
      // Scroll to top of screenshots section
      const screenshotsSection = document.querySelector('[data-screenshots-section]');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Load More handler - loads next page and appends to current results
  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    
    if (selectedUser) {
      setIsLoadingScreenshots(true);
      
      try {
        // Force load next page regardless of pagination calculations
        await fetchUserScreenshots(selectedUser, activeDate, nextPage);
      } catch (error) {
        console.error('📸 Error loading more screenshots:', error);
        setIsLoadingScreenshots(false);
      }
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
  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      const selectedDateStr = day.date.toString().padStart(2, '0');
      setActiveDate(selectedDateStr);
      
      if (selectedUser) {
        // Fetch screenshots specifically for the selected date
        fetchUserScreenshots(selectedUser, day.date);
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
      <Container>
      <Title>
        {t('realTimeActivityStream')}
        <span className="help-icon" ref={helpRef} style={{ marginLeft: 8 }}>
     
         
        </span>
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
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e1e5e9',
            overflowX: 'auto',
            flex: 1,
            scrollBehavior: 'smooth',
          }}
          data-theme-aware="true"
          className="date-row"
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
                  <div style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                  }}>
                    {day.date.toString().padStart(2, '0')}
                  </div>

                  {/* Right side: Month and Year */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    lineHeight: '1.2'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 'normal',
                      textTransform: 'uppercase',
                    }}>
                      {getMonthName(day.month, language)}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 'normal',
                      opacity: 0.8,
                    }}>
                      {day.year}
                    </div>
                  </div>
                    {day.hasActivity && (
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--success-color)'
                    }} />
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
          style={{ 
            position: 'relative',
            isolation: 'isolate'
          }}
        >
          <div style={{ position: 'relative' }}>
            <SearchInput
              type="text"
              placeholder="Click to see all users or search by name/email..."
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
                ✓
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div style={{
              position: 'absolute',
              top: '45px',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              maxHeight: '400px',
              overflowY: 'auto',
              marginTop: '4px'
            }}
            className="search-dropdown"
            >
              {/* Header */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e1e5e9',
                backgroundColor: '#f8f9fa',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6c757d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {searchValue 
                  ? `🔍 Users with screenshots for "${searchValue}" (${memoizedSearchResults.length})` 
                  : `📋 All Users with Screenshots (${memoizedSearchResults.length})`
                }
              </div>
              
              {/* User List */}
              {memoizedSearchResults.map((user, index) => (
                <div
                  key={user.id || index}
                  onClick={() => handleResultSelect(user)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < memoizedSearchResults.length - 1 ? '1px solid #e1e5e9' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#4285f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {(user.display_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: '#1a1a1a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.display_name || user.email}
                    </div>
                    {user.email && user.display_name && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.email}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#28a745',
                      fontWeight: '500',
                      marginTop: '2px'
                    }}>
                      📷 {user.total_screenshots || 0} screenshots
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading State */}
              {isSearching && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #4285f4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 8px'
                  }}></div>
                  <div>Loading users...</div>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              )}
              
              {/* No Results */}
              {!isSearching && memoizedSearchResults.length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                  <div>No users with screenshots found{searchValue ? ` for "${searchValue}"` : ''}</div>
                  {!searchValue && (
                    <button
                      onClick={async () => {
                        console.log('🔄 Manual retry - loading users...');
                        setIsSearching(true);
                        try {
                          const users = await fetchAllUsers();
                          if (users && users.length > 0) {
                            setAllUsers(users);
                            setSearchResults(users);
                            setShowResults(true);
                            setError(null);
                          }
                        } catch (error) {
                          console.error('❌ Manual retry failed:', error);
                          setError('Failed to load users. Please check your connection.');
                        } finally {
                          setIsSearching(false);
                        }
                      }}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🔄 Load Users
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </SearchContainer>
        
        {/* Right Side Content - Screenshots or Empty State */}
        {selectedUser ? (
          <div style={{ 
            flex: 1, 
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '600px'
          }}>
                <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '10px',
                  borderBottom: `1px solid var(--border-color)`
            }}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600',
                      color: 'var(--text-primary)'
                }}>
                  {selectedUser.display_name || selectedUser.email}
                </h3>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '14px', 
                      color: 'var(--text-secondary)'
                }}>
                  Activity Stream - {getFullMonthName(selectedMonth, language)} {selectedYear}
                  {activeDate && ` (Day ${activeDate})`}
                </p>
                {totalScreenshots > 0 && (
                  <div style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '12px', 
                    color: 'var(--primary-color)',
                    fontWeight: '500',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div>
                      📊 {totalScreenshots} total screenshots found
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                      Currently viewing {userScreenshots.length} screenshots • Page {currentPage} of {totalPages}
                      {currentPage < totalPages && (
                        <span style={{ color: 'var(--success-color)', marginLeft: '8px' }}>
                          • {Math.min(screenshotsPerPage, totalScreenshots - (currentPage * screenshotsPerPage))} more available
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserScreenshots([]);
                  setAllScreenshots([]);
                  setTotalScreenshots(0);
                  setCurrentPage(1);
                  setSearchValue('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Screenshots Loading */}
                {isLoadingScreenshots && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                    color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #4285f4',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '16px'
                }}></div>
                <p>Loading screenshots...</p>
              </div>
            )}

            {/* Screenshot Error */}
                {screenshotError && !isLoadingScreenshots && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                    color: 'var(--error-color)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <p>{screenshotError}</p>
                <button
                  onClick={() => fetchUserScreenshots(selectedUser)}
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
                  Retry
                </button>
              </div>
            )}

            {/* Screenshots Grid */}
            {!isLoadingScreenshots && !screenshotError && userScreenshots.length > 0 && (
              <div data-screenshots-section>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  padding: '8px 0',
                  marginBottom: '30px'
                }}>
                  {userScreenshots.map((screenshot, index) => (
                    <div
                      key={screenshot.id || screenshot.filename || index}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                      }}
                      className="screenshot-card"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px var(--shadow-color)';
                      }}
                      onClick={() => {
                        // Open screenshot in new tab
                        if (screenshot.screenshot_url) {
                          window.open(screenshot.screenshot_url, '_blank');
                        }
                      }}
                    >
                      <style>{`
                        [data-theme="dark"] .screenshot-card {
                          background-color: #1d232c !important;
                          border-color: #6b7280 !important;
                          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                        }
                      `}</style>
                      {/* Screenshot Image */}
                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {screenshot.screenshot_url ? (
                          <img
                            src={(() => {
                              // Get current host and port for full URL construction
                              const currentHost = 'http://localhost:3001/s3-images';
                              
                              // Replace S3 URL with current app URL
                              if (screenshot.screenshot_url.includes('ddsfocustime.s3.eu-north-1.amazonaws.com')) {
                                // Replace the S3 domain with proxy server URL
                                const localUrl = screenshot.screenshot_url.replace(
                                  'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
                                  currentHost
                                );
                                return localUrl;
                              }
                              
                              // Handle other S3 formats
                              if (screenshot.screenshot_url.includes('s3') && screenshot.screenshot_url.includes('amazonaws.com')) {
                                const urlParts = screenshot.screenshot_url.split('/');
                                const pathIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
                                if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
                                  const s3Path = urlParts.slice(pathIndex + 1).join('/');
                                  return `${currentHost}/${s3Path}`;
                                }
                              }
                              
                              // Return original URL for non-S3 images
                              return screenshot.screenshot_url;
                            })()}
                            alt={`Screenshot ${screenshot.timestamp}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.2s',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              zIndex: 2,
                              opacity: 0
                            }}
                            onLoad={(e) => {
                              e.target.style.display = 'block';
                              e.target.style.opacity = '1';
                              // Hide the placeholder when image loads
                              const placeholder = e.target.parentElement.querySelector('div:not([style*="position: absolute"])');
                              if (placeholder && placeholder.querySelector('span')) {
                                placeholder.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load:', e.target.src);
                              
                              // Only try direct S3 URL as fallback
                              if (!e.target.src.startsWith('https://ddsfocustime.s3.eu-north-1.amazonaws.com')) {
                                e.target.src = screenshot.screenshot_url;
                              } else {
                                // Show placeholder if direct S3 also fails
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentElement.querySelector('div:not([style*="position: absolute"])');
                                if (placeholder && placeholder.querySelector('span')) {
                                  placeholder.style.display = 'flex';
                                  placeholder.querySelector('span').textContent = 'Failed to load';
                                }
                              }
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                            }}
                          />
                        ) : null}
                        <div style={{
                          display: screenshot.screenshot_url ? 'none' : 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#5f6368',
                          fontSize: '14px',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#f8f9fa',
                          zIndex: 1
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                          <span>Loading...</span>
                        </div>
                        
                        {/* Overlay with timestamp */}
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {new Date(screenshot.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Screenshot Info */}
                      <div style={{ padding: '16px' }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: screenshot.activity_type === 'ACTIVE' ? '#4caf50' : '#ff9800'
                          }}></span>
                          {new Date(screenshot.timestamp).toLocaleDateString(language, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <span style={{
                            backgroundColor: '#e8f5e8',
                            color: '#2e7d32',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '500'
                          }}>
                            {screenshot.activity_type || 'ACTIVE'}
                          </span>
                          <span style={{ fontWeight: '500' }}>
                            {screenshot.file_size || `${screenshot.size_mb || 0} MB`}
                          </span>
                        </div>
                        
                        {screenshot.filename && (
                          <div style={{
                            fontSize: '10px',
                            color: 'var(--text-secondary)',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            lineHeight: '1.3'
                          }}>
                            {screenshot.filename}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simple Footer - Always show when user is selected */}
                <div style={{
                  borderTop: `1px solid var(--border-color)`,
                  marginTop: '20px',
                  paddingTop: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  {/* Screenshot Statistics */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      {totalScreenshots > 0 ? (
                        <strong>📊 Showing {((currentPage - 1) * screenshotsPerPage) + 1} to {Math.min(currentPage * screenshotsPerPage, totalScreenshots)} of {totalScreenshots} screenshots</strong>
                      ) : (
                        <strong>📷 No screenshots found for the selected period</strong>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <label htmlFor="screenshots-per-page" style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>Screenshots per page:</label>
                      <select 
                        id="screenshots-per-page"
                        value={screenshotsPerPage} 
                        onChange={(e) => {
                          const newPageSize = parseInt(e.target.value);
                          setScreenshotsPerPage(newPageSize);
                          setCurrentPage(1);
                          // Refetch with new page size
                          if (selectedUser) {
                            fetchUserScreenshots(selectedUser, activeDate, 1);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          border: `1px solid var(--border-color)`,
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>
                  </div>

                  {/* Temporary: Always show Load More for debugging */}
                  {userScreenshots.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: '16px'
                    }}>
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingScreenshots}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: isLoadingScreenshots ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: isLoadingScreenshots ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {isLoadingScreenshots ? (
                          <>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            Loading More...
                          </>
                        ) : (
                          <>
                            📸 Load More
                            <span style={{
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              Current: {userScreenshots.length}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                 

                  {/* Traditional Pagination - Only show if multiple pages */}
                  {totalScreenshots > 0 && totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === 1 ? '#6c757d' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        ← Prev
                      </button>

                      {/* Page Info */}
                      <div style={{
                        padding: '8px 16px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        border: `1px solid var(--border-color)`
                      }}>
                        Page {currentPage} of {totalPages}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: currentPage === totalPages ? '#6c757d' : '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div style={{
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid var(--border-color)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)'
                  }}>
                    <div>
                      🕒 Last updated: {new Date().toLocaleTimeString()}
                    </div>
                    <button
                      onClick={() => {
                        if (selectedUser) {
                          setCurrentPage(1);
                          fetchUserScreenshots(selectedUser, activeDate, 1);
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        color: 'var(--primary-color)',
                        border: `1px solid var(--primary-color)`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* No Screenshots */}
            {!isLoadingScreenshots && !screenshotError && userScreenshots.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#5f6368'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p>No screenshots found for this period</p>
                <button
                  onClick={() => fetchUserScreenshots(selectedUser)}
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
                  Refresh
                </button>
              </div>
            )}
          </div>
        ) : (
          // Show all users' screenshots instead of empty state
          <div style={{ 
            flex: 1, 
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '600px'
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
                <p>Loading screenshots for all users...</p>
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
                    All Users Activity - {getFullMonthName(selectedMonth, language)} {selectedYear}
                  </h3>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '14px', 
                    color: 'var(--text-secondary)'
                  }}>
                    📊 {allUsersScreenshots.length} users with activity found
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
                            {userScreenshotData.totalCount} screenshots
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
                              {new Date(screenshot.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
                          View All {userScreenshotData.totalCount} Screenshots
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
                      Searching for "{searchValue}"...
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
                      Retry Search
                    </button>
                  </>
                ) : searchValue && searchResults.length === 0 ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <EmptyText>
                      No users with screenshots found for "{searchValue}"
                    </EmptyText>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#6c757d', 
                      marginTop: '8px',
                      textAlign: 'center'
                    }}>
                      API Status: {apiStatus} | Results: {searchResults.length}
                      <br/>
                      Try searching for: "k", "haseeb", "nawaz"
                    </div>
                  </>
                ) : searchValue && searchResults.length > 0 ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                    <EmptyText>
                      {`Found ${searchResults.length} user(s) for "${searchValue}"`}
                      <br/>
                      {t('selectUserToView')}
                    </EmptyText>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>�</div>
                    <EmptyText style={{ marginTop: '16px' }}>
                      Welcome to the Activity Stream
                    </EmptyText>
                    <div style={{ 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)', 
                      marginTop: '12px',
                      textAlign: 'center',
                      maxWidth: '400px'
                    }}>
                      <p>📋 Click the search box above to see all available users</p>
                      <p>� Type a name or email to search specific users</p>
                      <p>📊 Select any user to view their detailed activity and screenshots</p>
                    </div>
                  </>
                )}
              </EmptyStateContainer>
            )}
          </div>
        )}
      </ContentContainer>
    </Container>
    </>
  );
};

export default ActivityStream;
