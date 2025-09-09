import React, { useState, useEffect, useMemo, useRef } from 'react';
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
      // Prepare search parameters
      const searchParams = new URLSearchParams({
        q: query,
        page: 1,
        page_size: 50,
        group_by: 'date',
        start_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
        end_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth).toString().padStart(2, '0')}`,
        month: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
        year: selectedYear.toString()
      });

      // Try multiple API endpoints with enhanced parameters (Django backend first)
      const endpoints = [
        `http://127.0.0.1:8000/api/users/search/?${searchParams.toString()}`,
        `http://localhost:8001/api/users/search/?${searchParams.toString()}`,
        `https://dxdtime.ddsolutions.io/api/users/search/?${searchParams.toString()}`
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log(`✅ Connected to: ${endpoint}`);
            setApiStatus('connected');
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to connect to: ${endpoint}`);
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        // Fallback to mock data when API is not available
        console.log('🔄 API unavailable, using mock search data');
        setApiStatus('mock');
        const mockUsers = [
          {
            id: 1,
            display_name: 'Haseeb Ahmad',
            email: 'haseebcodejourney@gmail.com',
            original_name: 'haseebcodejourney_at_gmail.com'
          },
          {
            id: 2,
            display_name: 'Kiran Ahmad', 
            email: 'kiranaiz4@gmail.com',
            original_name: 'kiranaiz4_at_gmail.com'
          },
          {
            id: 3,
            display_name: 'Nawaz Sheikh',
            email: 'nawaz@dxdglobal.com',
            original_name: 'nawaz_at_dxdglobal.com'
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
      console.log('🔍 Search API Response:', data);
      
      if (data.status === 'success' && data.data) {
        // Handle both user list and screenshot data in response
        if (data.data.users) {
          setSearchResults(data.data.users);
          setShowResults(true);
        } else if (data.data.screenshots) {
          // If response contains screenshots directly
          setSearchResults([{
            id: 1,
            display_name: query,
            email: `${query}@company.com`,
            screenshots: data.data.screenshots
          }]);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('🚨 Search Error:', error);
      setApiStatus('mock');
      
      // Always provide fallback mock data on error
      const mockUsers = [
        {
          id: 1,
          display_name: 'Haseeb Ahmad',
          email: 'haseebcodejourney@gmail.com',
          original_name: 'haseebcodejourney_at_gmail.com'
        },
        {
          id: 2,
          display_name: 'Kiran Ahmad', 
          email: 'kiranaiz4@gmail.com',
          original_name: 'kiranaiz4_at_gmail.com'
        },
        {
          id: 3,
          display_name: 'Nawaz Sheikh',
          email: 'nawaz@dxdglobal.com',
          original_name: 'nawaz_at_dxdglobal.com'
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

  // Fetch user screenshots function
  const fetchUserScreenshots = async (user) => {
    setIsLoadingScreenshots(true);
    setScreenshotError(null);
    
    try {
      const searchParams = new URLSearchParams({
        q: user.display_name || user.email || user.original_name,
        page: 1,
        page_size: 50,
        group_by: 'date',
        start_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
        end_date: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${getDaysInMonth(selectedYear, selectedMonth).toString().padStart(2, '0')}`,
        month: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`,
        year: selectedYear.toString()
      });

      const endpoints = [
        `http://127.0.0.1:8000/api/users/search/?${searchParams.toString()}`,
        `http://localhost:8001/api/users/search/?${searchParams.toString()}`,
        `https://dxdtime.ddsolutions.io/api/users/search/?${searchParams.toString()}`
      ];

      let response = null;
      
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
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to fetch screenshots from: ${endpoint}`);
          continue;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        console.log('📸 Screenshots API Response:', data);
        
        if (data.status === 'success' && data.data) {
          // Extract screenshots and activity dates for calendar highlighting
          const activityDates = new Set();
          let screenshots = [];
          
          if (data.data.users && data.data.users.length > 0) {
            const userData = data.data.users[0]; // Get the first matching user
            
            // Parse grouped screenshots for calendar highlighting
            if (userData.grouped_screenshots) {
              try {
                const groupedData = typeof userData.grouped_screenshots === 'string' 
                  ? JSON.parse(userData.grouped_screenshots.replace(/@{|}/g, match => match === '@{' ? '{' : '}'))
                  : userData.grouped_screenshots;
                
                Object.keys(groupedData).forEach(date => {
                  activityDates.add(date);
                });
                
                // If we have a specific active date, get screenshots for that date
                if (activeDate) {
                  const targetDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate}`;
                  if (groupedData[targetDate]) {
                    screenshots = Array.isArray(groupedData[targetDate]) ? groupedData[targetDate] : [];
                  }
                } else {
                  // Get all screenshots for the month
                  Object.values(groupedData).forEach(dateScreenshots => {
                    if (Array.isArray(dateScreenshots)) {
                      screenshots = [...screenshots, ...dateScreenshots];
                    }
                  });
                }
              } catch (error) {
                console.warn('Failed to parse grouped_screenshots:', error);
              }
            }
            
            // Update calendar days with real activity data
            setUserActivityDates(activityDates);
          }
          
          if (screenshots.length > 0) {
            setUserScreenshots(screenshots);
          } else {
            // Mock screenshots for demonstration
            setUserScreenshots([
              {
                id: 1,
                timestamp: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate || '01'} 17:35:00`,
                screenshot_url: 'https://via.placeholder.com/400x300/4285f4/ffffff?text=Live+Screenshot',
                activity_type: 'ACTIVE',
                file_size: '0.501 MB'
              },
              {
                id: 2,
                timestamp: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate || '01'} 17:12:00`,
                screenshot_url: 'https://via.placeholder.com/400x300/34a853/ffffff?text=Work+Activity',
                activity_type: 'ACTIVE',
                file_size: '0.479 MB'
              }
            ]);
          }
        } else {
          throw new Error('No screenshot data found');
        }
      } else {
        throw new Error('Failed to fetch screenshots');
      }
    } catch (error) {
      console.error('🚨 Screenshot Error:', error);
      setScreenshotError('Failed to load screenshots');
      // Provide mock data on error
      setUserScreenshots([
        {
          id: 1,
          timestamp: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${activeDate || '01'} 17:35:00`,
          screenshot_url: 'https://via.placeholder.com/400x300/f44336/ffffff?text=Demo+Screenshot',
          activity_type: 'ACTIVE',
          file_size: '0.501 MB'
        }
      ]);
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
    console.log('Selected user:', user);
    
    // Fetch screenshots for selected user
    fetchUserScreenshots(user);
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
    // Refresh screenshots if user is selected
    if (selectedUser) {
      fetchUserScreenshots(selectedUser);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    setActiveDate(null); // Reset active date when month changes
    // Refresh screenshots if user is selected
    if (selectedUser) {
      fetchUserScreenshots(selectedUser);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (day) => {
    if (day.isCurrentMonth) {
      setActiveDate(day.date.toString().padStart(2, '0'));
      if (selectedUser) {
        // Update the API call to fetch screenshots for the specific date
        const searchParams = new URLSearchParams({
          q: selectedUser.display_name || selectedUser.email || selectedUser.original_name,
          page: 1,
          page_size: 50,
          group_by: 'date',
          start_date: `${day.year}-${day.month.toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`,
          end_date: `${day.year}-${day.month.toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`,
          month: `${day.year}-${day.month.toString().padStart(2, '0')}`,
          year: day.year.toString()
        });
        
        // Trigger screenshot refresh for the specific date
        fetchUserScreenshots(selectedUser);
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
        Real Time Activity Stream
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
          {selectedUser ? (selectedUser.display_name || selectedUser.email) : (searchValue || 'Search Employee')}
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
          minWidth: 'fit-content'
        }}>
          {/* Get first 5 dates of current month for horizontal display */}
          {calendarDays.filter(day => day.isCurrentMonth).slice(0, 5).map((day, index) => {
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
            placeholder="Search employees by name, email..."
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
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserScreenshots([]);
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
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                padding: '8px 0'
              }}>
                {userScreenshots.map((screenshot, index) => (
                  <div
                    key={screenshot.id || index}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e1e5e9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Screenshot Image */}
                    <div style={{
                      width: '100%',
                      height: '120px',
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      {screenshot.screenshot_url ? (
                        <img
                          src={screenshot.screenshot_url}
                          alt={`Screenshot ${screenshot.timestamp}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: screenshot.screenshot_url ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#5f6368',
                        fontSize: '14px'
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>📸</div>
                        <span>Screenshot</span>
                      </div>
                    </div>

                    {/* Screenshot Info */}
                    <div style={{ padding: '12px' }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#202124',
                        marginBottom: '4px'
                      }}>
                        {new Date(screenshot.timestamp).toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#5f6368',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{screenshot.activity_type || 'ACTIVE'}</span>
                        <span>{screenshot.file_size || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                  Found {searchResults.length} user(s) for "{searchValue}"
                  <br/>
                  Select a user to view their activity stream
                </EmptyText>
              </>
            ) : (
              <>
                <EmptyIcon src="/images/no-data-illustration.svg" alt="No data" />
                <EmptyText>
                  Search for employees to view their activity stream
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
