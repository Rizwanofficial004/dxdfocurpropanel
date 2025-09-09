import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'short' }).toUpperCase();
};

const getFullMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
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

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1)
}));

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Main component
const ActivityStream = () => {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [activeDate, setActiveDate] = useState('05'); // Set default to 05 like in the image
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'connected', 'mock', 'unknown'
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScreenshots, setUserScreenshots] = useState([]);
  const [isLoadingScreenshots, setIsLoadingScreenshots] = useState(false);
  const [screenshotError, setScreenshotError] = useState(null);
  const [calendarView, setCalendarView] = useState(true); // New state for calendar view toggle
  const [userActivityDates, setUserActivityDates] = useState(new Set()); // Activity dates for calendar highlighting
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [totalScreenshots, setTotalScreenshots] = useState(0); // Total screenshots count
  const [allScreenshots, setAllScreenshots] = useState([]); // Store all screenshots
  const screenshotsPerPage = 50; // Screenshots per page
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle clicking outside search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search API function with enhanced parameters
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Prepare search parameters for enhanced API
      const searchParams = new URLSearchParams({
        q: query,
        page: 1,
        page_size: 50,
        group_by: 'date',
        month: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
        year: selectedYear.toString()
      });

      // Primary API endpoint (production) first
      const endpoints = [
        `https://dxdtime.ddsolutions.io/api/users/search/?${searchParams.toString()}`,
        `http://127.0.0.1:8000/api/users/search/?${searchParams.toString()}`,
        `http://localhost:8001/api/users/search/?${searchParams.toString()}`
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Searching users via: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Search successful via: ${endpoint}`);
            setApiStatus('connected');
            break;
          }
        } catch (error) {
          console.log(`❌ Search failed via: ${endpoint}`);
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        console.log('🔄 API unavailable, using mock search data');
        setApiStatus('mock');
        
        // Enhanced mock data matching the API structure
        const mockUsers = [
          {
            id: 1,
            email: 'haseebcodejourney@gmail.com',
            display_name: 'haseebcodejourney',
            original_name: 'haseebcodejourney_at_gmail.com',
            total_screenshots: 10,
            total_size_mb: 1.52,
            active_days_count: 2,
            status: 'active'
          },
          {
            id: 2,
            email: 'kiranaiz4@gmail.com',
            display_name: 'kiranaiz4', 
            original_name: 'kiranaiz4_at_gmail.com',
            total_screenshots: 53,
            total_size_mb: 7.96,
            active_days_count: 1,
            status: 'inactive'
          },
          {
            id: 3,
            email: 'nawaz@dxdglobal.com',
            display_name: 'nawaz',
            original_name: 'nawaz_at_dxdglobal.com',
            total_screenshots: 475,
            total_size_mb: 88.29,
            active_days_count: 1,
            status: 'inactive'
          }
        ];

        // Filter mock users based on query
        const filteredUsers = mockUsers.filter(user => 
          user.display_name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          (user.original_name && user.original_name.toLowerCase().includes(query.toLowerCase()))
        );

        setSearchResults(filteredUsers);
        setShowResults(filteredUsers.length > 0);
        return;
      }

      const data = await response.json();
      console.log('🔍 Enhanced Search API Response:', data);
      
      if (data.status === 'success' && data.data && data.data.users) {
        setSearchResults(data.data.users);
        setShowResults(true);
        
        console.log(`✅ Found ${data.data.users.length} users with search query: "${query}"`);
      } else {
        setSearchResults([]);
        setShowResults(false);
        console.log('🔍 No users found in search results');
      }
    } catch (error) {
      console.error('🚨 Search Error:', error);
      setApiStatus('mock');
      
      // Fallback to mock data on error
      const mockUsers = [
        {
          id: 1,
          email: 'haseebcodejourney@gmail.com',
          display_name: 'haseebcodejourney',
          original_name: 'haseebcodejourney_at_gmail.com',
          total_screenshots: 10,
          total_size_mb: 1.52
        },
        {
          id: 2,
          email: 'kiranaiz4@gmail.com',
          display_name: 'kiranaiz4', 
          original_name: 'kiranaiz4_at_gmail.com',
          total_screenshots: 53,
          total_size_mb: 7.96
        },
        {
          id: 3,
          email: 'nawaz@dxdglobal.com',
          display_name: 'nawaz',
          original_name: 'nawaz_at_dxdglobal.com',
          total_screenshots: 475,
          total_size_mb: 88.29
        }
      ];

      const filteredUsers = mockUsers.filter(user => 
        user.display_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredUsers);
      setShowResults(filteredUsers.length > 0);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch user screenshots function with enhanced date filtering and pagination
  const fetchUserScreenshots = async (user, specificDate = null, page = 1) => {
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    
    try {
      const searchParams = new URLSearchParams({
        q: user.display_name || user.email || user.original_name,
        page: page,
        page_size: 500, // Get more to handle client-side pagination
        group_by: 'date',
        month: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
        year: selectedYear.toString()
      });

      // Add specific date filtering if provided
      if (specificDate) {
        const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
        searchParams.set('start_date', dateStr);
        searchParams.set('end_date', dateStr);
      } else {
        // Get the full month
        searchParams.set('start_date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`);
        searchParams.set('end_date', `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth).toString().padStart(2, '0')}`);
      }

      // Primary endpoint with fallbacks
      const endpoints = [
        `https://dxdtime.ddsolutions.io/api/users/search/?${searchParams.toString()}`,
        `http://127.0.0.1:8000/api/users/search/?${searchParams.toString()}`,
        `http://localhost:8001/api/users/search/?${searchParams.toString()}`
      ];

      let response = null;
      let endpoint_used = '';
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📸 Fetching screenshots from: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            endpoint_used = endpoint;
            console.log(`✅ Successfully connected to: ${endpoint}`);
            setApiStatus('connected');
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to fetch from: ${endpoint}`, error);
          continue;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        console.log('📸 Enhanced API Response:', data);
        
        if (data.status === 'success' && data.data && data.data.users) {
          const activityDates = new Set();
          let screenshots = [];
          
          // Process all users in the response
          data.data.users.forEach(userData => {
            if (userData.grouped_screenshots) {
              // Handle the grouped_screenshots object
              Object.keys(userData.grouped_screenshots).forEach(dateKey => {
                activityDates.add(dateKey);
                
                const dayData = userData.grouped_screenshots[dateKey];
                if (dayData && dayData.screenshots && Array.isArray(dayData.screenshots)) {
                  // Filter for specific date if provided
                  if (specificDate) {
                    const targetDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${specificDate.toString().padStart(2, '0')}`;
                    if (dateKey === targetDate) {
                      screenshots = [...screenshots, ...dayData.screenshots.map(screenshot => ({
                        ...screenshot,
                        id: screenshot.filename || screenshots.length,
                        timestamp: screenshot.datetime || screenshot.date,
                        activity_type: 'ACTIVE',
                        file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A'
                      }))];
                    }
                  } else {
                    // Add all screenshots for the month
                    screenshots = [...screenshots, ...dayData.screenshots.map(screenshot => ({
                      ...screenshot,
                      id: screenshot.filename || screenshots.length,
                      timestamp: screenshot.datetime || screenshot.date,
                      activity_type: 'ACTIVE',
                      file_size: screenshot.size_mb ? `${screenshot.size_mb} MB` : 'N/A'
                    }))];
                  }
                }
              });
            }
          });
          
          // Update calendar with activity dates
          setUserActivityDates(activityDates);
          
          // Sort screenshots by timestamp (newest first)
          screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          // Set all screenshots and pagination info
          setAllScreenshots(screenshots);
          setTotalScreenshots(screenshots.length);
          setCurrentPage(1); // Reset to first page
          
          if (screenshots.length > 0) {
            console.log(`📸 Found ${screenshots.length} total screenshots`);
            // Set current page screenshots
            const startIndex = 0;
            const endIndex = screenshotsPerPage;
            setUserScreenshots(screenshots.slice(startIndex, endIndex));
          } else {
            console.log('📸 No screenshots found');
            setUserScreenshots([]);
          }
        } else {
          console.log('📸 No user data in response');
          setUserScreenshots([]);
          setAllScreenshots([]);
          setTotalScreenshots(0);
        }
      } else {
        throw new Error(`API request failed: ${response?.status || 'Network Error'}`);
      }
    } catch (error) {
      console.error('🚨 Screenshot Error:', error);
      setApiStatus('mock');
      setScreenshotError(`Failed to load screenshots: ${error.message}`);
      setUserScreenshots([]);
      setAllScreenshots([]);
      setTotalScreenshots(0);
    } finally {
      setIsLoadingScreenshots(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchUsers(searchValue);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchValue]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // Handle search result selection
  const handleResultSelect = (user) => {
    setSearchValue(user.display_name || user.email);
    setShowResults(false);
    setSelectedUser(user);
    setUserActivityDates(new Set()); // Reset activity dates
    setActiveDate(null); // Reset active date selection
    setCurrentPage(1); // Reset pagination
    console.log('Selected user:', user);
    
    // Fetch screenshots for selected user (full month initially)
    fetchUserScreenshots(user, null);
  };

  // Generate calendar days for the selected month
  const calendarDays = useMemo(() => {
    return generateCalendarDays(selectedYear, selectedMonth, userActivityDates);
  }, [selectedYear, selectedMonth, userActivityDates]);

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
          month: getMonthName(selectedMonth),
          year: selectedYear.toString(),
          active: day === activeDate
        };
      }
    );
  }, [selectedYear, selectedMonth, activeDate]);

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

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(totalScreenshots / screenshotsPerPage)) {
      setCurrentPage(newPage);
      const startIndex = (newPage - 1) * screenshotsPerPage;
      const endIndex = startIndex + screenshotsPerPage;
      setUserScreenshots(allScreenshots.slice(startIndex, endIndex));
      
      // Scroll to top of screenshots section
      const screenshotsSection = document.querySelector('[data-screenshots-section]');
      if (screenshotsSection) {
        screenshotsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const totalPages = Math.ceil(totalScreenshots / screenshotsPerPage);

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
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <Container>
      <Title>
        {t('realTimeActivityStream')}
        <span style={{ color: '#9ca3af', fontSize: '15px', marginTop: '1px' }}>ⓘ</span>
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
          const newDate = new Date(selectedYear, selectedMonth - 1, 1);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedMonth(newDate.getMonth() + 1);
          setSelectedYear(newDate.getFullYear());
        }}>←</ArrowButton>
        
        {/* Horizontal Date Row */}
        <div style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #e1e5e9',
          overflowX: 'auto',
          minWidth: 'fit-content',
          maxWidth: '100%'
        }}>
          {/* Show all dates of current month for horizontal display */}
          {calendarDays.filter(day => day.isCurrentMonth).map((day, index) => {
              const isSelected = activeDate === day.date.toString().padStart(2, '0');
              const isToday = day.isToday;
              
              return (
                <div
                  key={`${day.year}-${day.month}-${day.date}`}
                  onClick={() => handleDateSelect(day)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '50px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    position: 'relative',
                    backgroundColor: isSelected
                      ? '#4285f4' 
                      : 'transparent',
                    color: isSelected
                      ? 'white'
                      : '#202124',
                    fontWeight: isSelected ? '600' : '400',
                    transition: 'all 0.2s',
                    border: isSelected ? '1px solid #4285f4' : '1px solid #e1e5e9'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: isSelected ? '600' : '500',
                    marginBottom: '1px'
                  }}>
                    {day.date.toString().padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: '8px',
                    opacity: 0.7,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    {getMonthName(day.month)}
                  </div>
                  {day.hasActivity && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.9)' : '#4caf50'
                    }} />
                  )}
                </div>
              );
            })}
        </div>
        
        <ArrowButton type="button" onClick={() => {
          const newDate = new Date(selectedYear, selectedMonth - 1, 1);
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedMonth(newDate.getMonth() + 1);
          setSelectedYear(newDate.getFullYear());
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
            onFocus={() => searchValue && setShowResults(true)}
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
              {apiStatus === 'connected' ? ' ' : '🟡 Using Mock Data'}
            </div>
          )}
          
          {/* Search Results Dropdown */}
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
              marginTop: '4px'
            }}>
              {searchResults.map((user, index) => (
                <div
                  key={user.id || index}
                  onClick={() => handleResultSelect(user)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #f1f3f4' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                      color: '#202124',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.display_name || user.email}
                    </div>
                    {user.email && user.display_name && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#5f6368',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Loading Indicator */}
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              border: '2px solid #f3f3f3',
              borderTop: '2px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}>
              <style jsx>{`
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
              borderBottom: '1px solid #e1e5e9'
            }}>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: '#202124'
                }}>
                  {selectedUser.display_name || selectedUser.email}
                </h3>
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '14px', 
                  color: '#5f6368'
                }}>
                  Activity Stream - {getMonthName(selectedMonth)} {selectedYear}
                  {activeDate && ` (Day ${activeDate})`}
                </p>
                {totalScreenshots > 0 && (
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    fontSize: '12px', 
                    color: '#1a73e8',
                    fontWeight: '500'
                  }}>
                    {totalScreenshots} total screenshots • Page {currentPage} of {totalPages} • Showing {((currentPage - 1) * screenshotsPerPage) + 1}-{Math.min(currentPage * screenshotsPerPage, totalScreenshots)}
                  </p>
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
                  color: '#5f6368',
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
                color: '#5f6368'
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
                color: '#d93025'
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                      onClick={() => {
                        // Open screenshot in new tab
                        if (screenshot.screenshot_url) {
                          window.open(screenshot.screenshot_url, '_blank');
                        }
                      }}
                    >
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
                                console.log('� Replaced S3 URL with local:', localUrl);
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
                          color: '#202124',
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
                          {new Date(screenshot.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: '#5f6368',
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
                            color: '#9ca3af',
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '20px 0',
                    borderTop: '1px solid #e1e5e9',
                    marginTop: '20px'
                  }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === 1 ? '#f8f9fa' : '#4285f4',
                        color: currentPage === 1 ? '#9ca3af' : 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '6px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      ← Previous
                    </button>

                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 7) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 4) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          pageNumber = totalPages - 6 + i;
                        } else {
                          pageNumber = currentPage - 3 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: currentPage === pageNumber ? '#4285f4' : 'white',
                              color: currentPage === pageNumber ? 'white' : '#202124',
                              border: '1px solid #e1e5e9',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: currentPage === pageNumber ? '600' : '400',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== pageNumber) {
                                e.target.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== pageNumber) {
                                e.target.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#4285f4',
                        color: currentPage === totalPages ? '#9ca3af' : 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '6px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
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
                color: '#5f6368'
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
            {searchValue && searchResults.length === 0 && !isSearching ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <EmptyText>
                  No users found for "{searchValue}"
                </EmptyText>
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
                <EmptyIcon src="/images/no-data-illustration.svg" alt={t('noData')} />
                <EmptyText>
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
