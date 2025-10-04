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
  const searchContainerRef = useRef(null);
  const dateScrollRef = useRef(null);

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1, language)
  }));

  // Advanced preload with predictive caching and background prefetching
  const preloadCommonUsers = async () => {
    try {
      const apiBaseURL = getApiBaseURL();
      // Preload ALL alphabet letters for instant search using configured API
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const apiEndpoint = `${apiBaseURL}/users/search/`;
      
      console.log('🚀 Starting comprehensive preload with API:', apiEndpoint);
      
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
                console.log(`🎯 Preloaded ${data.data.users.length} users for "${letter}"`);
              }
            }
          } catch (error) {
            console.log(`Failed to preload "${letter}"`);
          }
        });

        await Promise.allSettled(batchPromises);
        
        // Small delay between batches to not overwhelm the server
        if (i + batchSize < allLetters.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('� Comprehensive preload complete - Search is now INSTANT!');
      
    } catch (error) {
      console.log('Failed to preload users');
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(false);
      
      // Load all users first
      await fetchAllUsers();
      
      // Load user suggestions for default display
      setLoadingSuggestions(true);
      const suggestions = await fetchUserSuggestions();
      setUserSuggestions(suggestions);
      setLoadingSuggestions(false);
      
      // Show suggestions by default if no search results
      if (!showResults) {
        setSearchResults(suggestions);
        setShowResults(true);
      }

      // Preload common search results for faster search - do this after users are loaded
      setTimeout(() => {
        preloadCommonUsers();
      }, 1000);
    }, 100);
    return () => clearTimeout(timer);
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

  

  

  const fetchAllUsers = async () => {
    setError(null);
    try {
      const apiBaseURL = getApiBaseURL();
      console.log('🌐 Using API base URL:', apiBaseURL);
      
      // Use the proper API configuration with higher page size for better caching
      const response = await fetch(`${apiBaseURL}/users/search/?q=&page=1&page_size=200`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Preloaded users for instant search:', data);
        if (data.status === 'success' && data.data && data.data.users) {
          setAllUsers(data.data.users);
          setApiStatus('connected');
          console.log(`✅ Preloaded ${data.data.users.length} users for instant search`);
          
          // Pre-cache common search prefixes for instant search
          const prefixes = ['a', 'b', 'c', 'd', 'e', 'h', 'j', 'k', 'm', 'n', 'r', 's', 't'];
          prefixes.forEach(prefix => {
            const prefixResults = data.data.users.filter(user => {
              const displayName = (user.display_name || '').toLowerCase();
              const email = (user.email || '').toLowerCase();
              return displayName.startsWith(prefix) || email.startsWith(prefix);
            });
            
            if (prefixResults.length > 0) {
              setSearchCache(prev => {
                const newCache = new Map(prev);
                newCache.set(prefix, prefixResults);
                return newCache;
              });
            }
          });
          
          // Cache common search results for instant responses
          const commonUsers = data.data.users.slice(0, 20);
          commonUsers.forEach(user => {
            const displayName = (user.display_name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            
            // Cache by first few characters for instant results
            if (displayName.length > 0) {
              for (let i = 1; i <= Math.min(3, displayName.length); i++) {
                const prefix = displayName.substring(0, i);
                setSearchCache(prev => {
                  const newCache = new Map(prev);
                  const existing = newCache.get(prefix) || [];
                  if (!existing.find(u => u.id === user.id)) {
                    newCache.set(prefix, [...existing, user]);
                  }
                  return newCache;
                });
              }
            }
            
            if (email.length > 0) {
              for (let i = 1; i <= Math.min(3, email.length); i++) {
                const prefix = email.substring(0, i);
                setSearchCache(prev => {
                  const newCache = new Map(prev);
                  const existing = newCache.get(prefix) || [];
                  if (!existing.find(u => u.id === user.id)) {
                    newCache.set(prefix, [...existing, user]);
                  }
                  return newCache;
                });
              }
            }
          });
        } else {
          console.log('No users in API response');
          setAllUsers([]);
        }
      } else {
        console.log('API request failed');
        setApiStatus('disconnected');
        setAllUsers([]);
      }
    } catch (error) {
      console.error('Error preloading users:', error);
      setApiStatus('error');
      setAllUsers([]);
    }
  };

  // Fetch available user suggestions from the search API
  const fetchUserSuggestions = async () => {
    try {
      const apiBaseURL = getApiBaseURL();
      // Use the search API with common search terms to get available users
      const searchTerms = ['haseeb', 'nawaz', 'mohsin', 'dxd', 'global'];
      let allSuggestions = [];
      
      for (const term of searchTerms) {
        try {
          const response = await fetch(`${apiBaseURL}/users/search/?q=${term}&page=1&page_size=10`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data && data.data.users) {
              // Add users to suggestions, avoiding duplicates
              data.data.users.forEach(user => {
                if (!allSuggestions.find(existing => existing.email === user.email)) {
                  allSuggestions.push({
                    email: user.email,
                    display_name: user.display_name,
                    original_name: user.original_name,
                    total_screenshots: user.total_screenshots || 0,
                    total_size_mb: user.total_size_mb || 0,
                    active_days_count: user.active_days_count || 0,
                    last_activity: user.last_activity || 'Unknown',
                    status: user.status || 'unknown',
                    suggestion: true // Mark as suggestion
                  });
                }
              });
            }
          }
        } catch (error) {
          console.log(`Failed to fetch suggestions for term: ${term}`);
          continue;
        }
      }
      
      // Sort by activity (active users first, then by screenshot count)
      allSuggestions.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        return (b.total_screenshots || 0) - (a.total_screenshots || 0);
      });
      
      return allSuggestions.slice(0, 6); // Return top 6 suggestions
    } catch (error) {
      console.log('Failed to fetch user suggestions:', error);
      return [];
    }
  };

  // Real-time API search for dynamic users - NO MOCK DATA
  const searchUsers = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults(allUsers.slice(0, 10));
      setShowResults(true);
      setIsSearching(false);
      return;
    }

    setError(null); // Clear any previous errors
    
    try {
      const apiBaseURL = getApiBaseURL();
      const apiUrl = `${apiBaseURL}/users/search/?q=${encodeURIComponent(query)}`;
      console.log('🔍 Searching API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('🎯 Raw API Response for', query, ':', data);
        
        if (data.status === 'success' && data.data && data.data.users && Array.isArray(data.data.users)) {
          console.log(`✅ Found ${data.data.users.length} users for "${query}":`, data.data.users.map(u => u.display_name || u.email));
          setSearchResults(data.data.users);
          setShowResults(true);
          setApiStatus('connected');
          
          // Cache results for instant next time
          setSearchCache(prev => {
            const newCache = new Map(prev);
            newCache.set(query.toLowerCase(), data.data.users);
            return newCache;
          });
        } else {
          console.log('❌ No users found in API response for:', query);
          setSearchResults([]);
          setShowResults(true);
          setApiStatus('connected'); // API is working but no results
          setError(`No users found for "${query}". Try searching for different terms.`);
        }
      } else {
        const errorText = await response.text();
        console.log('❌ API request failed with status:', response.status, 'Error:', errorText);
        setApiStatus('disconnected');
        setError(`API Error: ${response.status} ${response.statusText}. Please check your network connection.`);
        setSearchResults([]);
        setShowResults(true);
      }
    } catch (error) {
      console.error('🚨 Search API Error:', error);
      setApiStatus('error');
      setError(`Network Error: ${error.message}. Please check your internet connection and try again.`);
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch user screenshots function with enhanced date filtering and pagination
  const fetchUserScreenshots = async (user, specificDate = null, page = 1) => {
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    
    try {
      const apiBaseURL = getApiBaseURL();
      
      // Calculate offset for future offset-based pagination
      const offset = (page - 1) * screenshotsPerPage;
      
      // Build the screenshots API endpoint with both page-based and offset-based parameters
      // The API currently uses page/page_size but we're preparing for offset/limit transition
      const searchParams = new URLSearchParams({
        q: user.email || user.display_name || user.original_name, // Use email as primary identifier
        // Current API uses page/page_size
        page: page.toString(),
        page_size: screenshotsPerPage.toString(),
        // Future API support for offset/limit
        offset: offset.toString(),
        limit: screenshotsPerPage.toString(),
        load_more: page > 1 ? 'true' : 'false' // Add load_more flag for subsequent pages
      });

      // Add date filtering - use current month/year by default or specific date
      if (specificDate) {
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
        searchParams.set('start_date', dateStr);
        searchParams.set('end_date', dateStr);
      } else {
        // Use current selected month
        const startDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`;
        const endDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth).toString().padStart(2, '0')}`;
        searchParams.set('start_date', startDate);
        searchParams.set('end_date', endDate);
      }

      const apiUrl = `${apiBaseURL}/users/screenshots/?${searchParams.toString()}`;
      console.log(`📸 Fetching screenshots from API: ${apiUrl}`);
      console.log(`📸 Request parameters:`, Object.fromEntries(searchParams));
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout for screenshots
      });
      
      if (response.ok) {
        console.log(`✅ Successfully connected to API for page ${page}`);
        setApiStatus('connected');
        
        const data = await response.json();
        console.log('📸 Complete API Response for page', page, ':', data);
        console.log('📸 API Pagination:', data.data?.pagination);
        console.log('📸 Screenshots count in response:', data.data?.screenshots?.length);
        
        if (data.status === 'success' && data.data) {
          let screenshots = [];
          const activityDates = new Set();
          
          // Handle the new API response structure
          if (data.data.screenshots && Array.isArray(data.data.screenshots)) {
            console.log(`📸 Processing ${data.data.screenshots.length} screenshots from new API`);
            
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
          console.log('📸 Pagination data from API:', pagination);
          
          if (pagination && pagination.total_screenshots) {
            console.log('📸 Processing pagination data - total:', pagination.total_screenshots, 'page:', pagination.page);
            
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
              console.log('📸 First page - resetting screenshots:', screenshots.length);
              updates.userScreenshots = screenshots;
              updates.allScreenshots = screenshots;
              
              // Only update page size on first load
              const apiPageSize = pagination.page_size || pagination.limit;
              if (apiPageSize && apiPageSize !== screenshotsPerPage) {
                console.log('📸 Updating page size from', screenshotsPerPage, 'to', apiPageSize);
                updates.screenshotsPerPage = apiPageSize;
              }
            } else {
              console.log('📸 Load more - appending screenshots:', screenshots.length);
              // For load more, we need to update the state directly since we can't batch array updates
              setAllScreenshots(prev => {
                const newData = [...prev, ...screenshots];
                console.log('📸 Total all screenshots after append:', newData.length);
                return newData;
              });
              setUserScreenshots(prev => {
                const newData = [...prev, ...screenshots];
                console.log('📸 Total user screenshots after append:', newData.length);
                return newData;
              });
            }
            
            // Apply batch updates
            console.log('📸 Applying state updates:', updates);
            if (updates.totalScreenshots) setTotalScreenshots(updates.totalScreenshots);
            if (updates.currentPage) setCurrentPage(updates.currentPage);
            if (updates.screenshotsPerPage) setScreenshotsPerPage(updates.screenshotsPerPage);
            if (updates.userScreenshots) setUserScreenshots(updates.userScreenshots);
            if (updates.allScreenshots) setAllScreenshots(updates.allScreenshots);
            
          } else {
            console.log('📸 No valid pagination data found, using fallback');
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
            console.log(`📸 Found ${screenshots.length} screenshots starting from offset ${currentOffset}`);
            console.log(`📸 Total screenshots: ${pagination?.total_screenshots || screenshots.length}`);
            console.log(`📸 Current page: ${currentPage}, Total pages: ${totalPages}`);
          } else {
            console.log('📸 No screenshots found for this offset');
            if (page === 1) {
              setUserScreenshots([]);
              setScreenshotError(`No screenshots found for ${user.display_name || user.email} in the selected period.`);
            }
          }
        } else {
          console.log('� No user data in response');
          setUserScreenshots([]);
          setAllScreenshots([]);
          setTotalScreenshots(0);
          setScreenshotError(`No screenshots available for ${user.display_name || user.email}.`);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Screenshot API Error Details:`);
        console.error(`   Status: ${response.status} - ${response.statusText}`);
        console.error(`   URL: ${apiUrl}`);
        console.error(`   Params:`, Object.fromEntries(searchParams));
        console.error(`   Response: ${errorText}`);
        throw new Error(`API request failed: ${response.status} - ${response.statusText}. Response: ${errorText}`);
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

  // INSTANT search with immediate response and better caching
  useEffect(() => {
    const trimmedQuery = searchValue.trim();
    
    if (!trimmedQuery) {
      setSearchResults(userSuggestions.length > 0 ? userSuggestions : allUsers.slice(0, 10));
      setShowResults(true);
      setIsSearching(false);
      return;
    }

    // INSTANT cache check first - no delay
    const cacheKey = trimmedQuery.toLowerCase();
    if (searchCache.has(cacheKey)) {
      console.log(`⚡ INSTANT cached result for: "${trimmedQuery}"`);
      const cachedResults = searchCache.get(cacheKey);
      setSearchResults(cachedResults);
      setShowResults(true);
      setIsSearching(false);
      return;
    }

    // INSTANT local search through loaded users (no delay)
    if (allUsers.length > 0) {
      const localResults = allUsers.filter(user => {
        const displayName = (user.display_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const originalName = (user.original_name || '').toLowerCase();
        
        return displayName.includes(cacheKey) || 
               email.includes(cacheKey) ||
               originalName.includes(cacheKey);
      });
      
      if (localResults.length > 0) {
        console.log(`⚡ INSTANT local search found ${localResults.length} results for: "${trimmedQuery}"`);
        setSearchResults(localResults);
        setShowResults(true);
        setIsSearching(false);
        
        // Cache local results immediately
        setSearchCache(prev => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, localResults);
          return newCache;
        });
        return;
      }
    }

    // Debounced API search only if no local results found
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchUsers(searchValue);
    }, 300); // Reduced from default to 300ms

    return () => clearTimeout(timer);
  }, [searchValue, searchCache, allUsers]);

  // INSTANT search input with immediate feedback
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Immediate feedback - show results instantly for better UX
    if (value.trim()) {
      // Check cache first for instant results
      const cacheKey = value.trim().toLowerCase();
      if (searchCache.has(cacheKey)) {
        setSearchResults(searchCache.get(cacheKey));
        setShowResults(true);
        setIsSearching(false);
        return;
      }
      
      // Check local users for instant results
      if (allUsers.length > 0) {
        const localResults = allUsers.filter(user => {
          const searchLower = cacheKey;
          const displayName = (user.display_name || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const originalName = (user.original_name || '').toLowerCase();
          
          return displayName.includes(searchLower) || 
                 email.includes(searchLower) ||
                 originalName.includes(searchLower);
        });
        
        if (localResults.length > 0) {
          setSearchResults(localResults);
          setShowResults(true);
          setIsSearching(false);
          return;
        }
      }
      
      // Show loading only if no immediate results available
      setShowResults(true);
      setIsSearching(true);
    } else {
      // Show default suggestions when empty
      setSearchResults(userSuggestions.length > 0 ? userSuggestions : allUsers.slice(0, 10));
      setShowResults(true);
      setIsSearching(false);
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
          console.log(`🔮 Prefetched results for "${query}"`);
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
    return searchResults.slice(0, 20); // Limit to first 20 results for better performance
  }, [searchResults]);

  // Memoized result selection handler
  const handleResultSelect = useCallback((user) => {
    setSearchValue(user.display_name || user.email);
    setShowResults(false);
    setSelectedUser(user);
    setUserActivityDates(new Set()); // Reset activity dates
    setActiveDate(null); // Reset active date selection
    setCurrentPage(1); // Reset pagination
    console.log('Selected user:', user);
    
    // Fetch screenshots for selected user (full month initially)
    fetchUserScreenshots(user, null);
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
    console.log('📸 Load More clicked:', { 
      currentPage, 
      nextPage, 
      totalPages, 
      totalScreenshots, 
      screenshotsPerPage,
      userScreenshotsLength: userScreenshots.length 
    });
    
    if (selectedUser) {
      console.log('📸 Attempting to load next page:', nextPage);
      setIsLoadingScreenshots(true);
      
      try {
        // Force load next page regardless of pagination calculations
        console.log('📸 Calling fetchUserScreenshots for page:', nextPage);
        await fetchUserScreenshots(selectedUser, activeDate, nextPage);
        console.log('📸 Successfully loaded page:', nextPage);
      } catch (error) {
        console.error('📸 Error loading more screenshots:', error);
        setIsLoadingScreenshots(false);
      }
    } else {
      console.log('📸 Cannot load more - no user selected');
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
        console.log(`📅 Selected date: ${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDateStr}`);
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
          <SearchInput
            type="text"
            placeholder={t('searchEmployeeName')}
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            style={{
              transition: 'all 0.2s ease',
              borderColor: searchValue ? '#4285f4' : undefined,
              boxShadow: searchValue ? '0 0 0 2px rgba(66, 133, 244, 0.1)' : undefined
            }}
          />
          
          
          
          {/* API Status Indicator */}
          {apiStatus !== 'unknown' && (
            <div style={{
              position: 'absolute',
              top: '-25px',
              right: '0',
              fontSize: '12px',
              color: apiStatus === 'connected' ? '#28a745' : '#ffc107',
              fontWeight: '500'
            }}>
              {apiStatus === 'connected' }
            </div>
          )}
          
          {/* Enhanced Search Results Dropdown with performance optimizations */}
          {showResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              zIndex: 9999,
              maxHeight: '300px',
              overflowY: 'auto',
              marginTop: '4px',
              animation: 'fadeIn 0.15s ease-out' // Faster animation
            }}
            className="search-dropdown"
            >
              
              {/* Header - Show if these are suggestions or search results */}
              {(!searchValue || searchValue.trim() === '') && userSuggestions.length > 0 && (
                <div className="available-header" style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e5e9',
                  backgroundColor: '#f8f9fa',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6c757d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📋 Available Users ({searchResults.length})
                </div>
              )}
              
              {/* Google-style search header with enhanced info */}
              {(searchValue && searchValue.trim() !== '') && (
                <div className="search-header" style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e1e5e9',
                  backgroundColor: '#e3f2fd',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#1976d2',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>🔍 Results for "{searchValue}" ({memoizedSearchResults.length}{memoizedSearchResults.length >= 15 ? '+' : ''})</span>
                  {searchPerformance && (
                    <span style={{ 
                      fontSize: '10px',
                      backgroundColor: searchPerformance.source === 'cache' ? '#28a745' : 
                                     searchPerformance.source === 'local' ? '#17a2b8' : '#ffc107',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}>
                      {searchPerformance.time < 1 ? '⚡ Instant' : `${searchPerformance.time.toFixed(0)}ms`}
                      {searchPerformance.source === 'cache' && ' (Cached)'}
                      {searchPerformance.source === 'local' && ' (Google-style)'}
                    </span>
                  )}
                </div>
              )}
              
              <style>{`
                @keyframes fadeIn {
                  0% { opacity: 0; transform: translateY(-5px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                [data-theme="dark"] .search-dropdown {
                  background-color: #1d232c !important;
                  border-color: #6b7280 !important;
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
                }
                [data-theme="dark"] .search-dropdown .available-header {
                  background-color: #374151 !important;
                  border-bottom-color: #6b7280 !important;
                  color: #9ca3af !important;
                }
                [data-theme="dark"] .search-dropdown .search-header {
                  background-color: #1e3a8a !important;
                  color: #bfdbfe !important;
                }
              `}</style>
              {memoizedSearchResults.map((user, index) => (
                <div
                  key={user.id || index}
                  onClick={() => handleResultSelect(user)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < memoizedSearchResults.length - 1 ? `1px solid var(--border-color)` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-color)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
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
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {(user.display_name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '500', 
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {highlightText(user.display_name || user.email, searchValue)}
                    </div>
                    {user.email && user.display_name && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {highlightText(user.email, searchValue)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fast Search Loading Indicator - More subtle */}
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '12px',
              height: '12px',
              border: '1.5px solid #f3f3f3',
              borderTop: '1.5px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              opacity: '0.8'
            }}>
              <style>{`
                @keyframes spin {
                  0% { transform: translateY(-50%) rotate(0deg); }
                  100% { transform: translateY(-50%) rotate(360deg); }
                }
              `}</style>
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
                                console.log(' Replaced S3 URL with local:', localUrl);
                                return localUrl;
                              }
                              
                              // Handle other S3 formats
                              if (screenshot.screenshot_url.includes('s3') && screenshot.screenshot_url.includes('amazonaws.com')) {
                                const urlParts = screenshot.screenshot_url.split('/');
                                const pathIndex = urlParts.findIndex(part => part.includes('amazonaws.com'));
                                if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
                                  const s3Path = urlParts.slice(pathIndex + 1).join('/');
                                  console.log('📸 Using direct path for S3:', s3Path);
                                  return `${currentHost}/${s3Path}`;
                                }
                              }
                              
                              // Return original URL for non-S3 images
                              console.log('📸 Using direct URL:', screenshot.screenshot_url);
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
                              console.log('✅ Image loaded successfully:', e.target.src);
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
                              console.log('📋 Original URL:', screenshot.screenshot_url);
                              
                              // Only try direct S3 URL as fallback
                              if (!e.target.src.startsWith('https://ddsfocustime.s3.eu-north-1.amazonaws.com')) {
                                console.log('🔄 Local URL failed, trying direct S3 URL...');
                                e.target.src = screenshot.screenshot_url;
                              } else {
                                // Show placeholder if direct S3 also fails
                                console.log('❌ All loading attempts failed, showing placeholder');
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
                      searchUsers(searchValue);
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
                  No users found for "{searchValue}"
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
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M7.493 0.015 C 7.442 0.021,7.268 0.039,7.107 0.055 C 5.234 0.242,3.347 1.208,2.071 2.634 C 0.660 4.211,-0.057 6.168,0.009 8.253 C 0.124 11.854,2.599 14.903,6.110 15.771 C 8.169 16.280,10.433 15.917,12.227 14.791 C 14.017 13.666,15.270 11.933,15.771 9.887 C 15.943 9.186,15.983 8.829,15.983 8.000 C 15.983 7.171,15.943 6.814,15.771 6.113 C 14.979 2.878,12.315 0.498,9.000 0.064 C 8.716 0.027,7.683 -0.006,7.493 0.015 M8.853 1.563 C 9.548 1.653,10.198 1.848,10.840 2.160 C 11.538 2.500,12.020 2.846,12.587 3.413 C 13.154 3.980,13.500 4.462,13.840 5.160 C 14.285 6.075,14.486 6.958,14.486 8.000 C 14.486 9.054,14.284 9.932,13.826 10.867 C 13.654 11.218,13.307 11.781,13.145 11.972 L 13.090 12.037 8.527 7.473 L 3.963 2.910 4.028 2.855 C 4.219 2.693,4.782 2.346,5.133 2.174 C 6.305 1.600,7.555 1.395,8.853 1.563 M7.480 8.534 L 12.040 13.095 11.973 13.148 C 11.734 13.338,11.207 13.662,10.867 13.828 C 10.239 14.135,9.591 14.336,8.880 14.444 C 8.456 14.509,7.544 14.509,7.120 14.444 C 5.172 14.148,3.528 13.085,2.493 11.451 C 2.279 11.114,1.999 10.526,1.859 10.119 C 1.468 8.989,1.403 7.738,1.670 6.535 C 1.849 5.734,2.268 4.820,2.766 4.147 C 2.836 4.052,2.899 3.974,2.907 3.974 C 2.914 3.974,4.972 6.026,7.480 8.534 " 
                    stroke="none" 
                    fillRule="evenodd" 
                    fill={isDarkMode ? '#ffffff' : '#1f2937'}
                  />
                </svg>
                <EmptyText style={{ marginTop: '16px' }}>
                  {t('searchForEmployees')}
                </EmptyText>
              </>
            )}
          </EmptyStateContainer>
        )}
      </ContentContainer>
    </Container>
    </>
  );
};

export default ActivityStream;