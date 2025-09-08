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

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear + i);
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: getMonthName(i + 1)
}));

// Main component
const ActivityStream = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(9); // September
  const [activeDate, setActiveDate] = useState('05');
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'connected', 'mock', 'unknown'
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

  // Search API function
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Try multiple API endpoints
      const endpoints = [
        `https://dxdtime.ddsolutions.io/api/users/search/?q=${encodeURIComponent(query)}`,
        `http://127.0.0.1:8000/api/users/search/?q=${encodeURIComponent(query)}`
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
            email: 'haseeb@ddsolutions.io',
            original_name: 'nawaz_at_dxdglobal.com'
          },
          {
            id: 2,
            display_name: 'Nawaz Sheikh', 
            email: 'nawaz@dxdglobal.com',
            original_name: 'nawaz'
          },
          {
            id: 3,
            display_name: 'Test User',
            email: 'testuser@example.com',
            original_name: 'test'
          },
          {
            id: 4,
            display_name: 'Admin User',
            email: 'admin@focus.com',
            original_name: 'admin'
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
      
      if (data.status === 'success' && data.data && data.data.users) {
        setSearchResults(data.data.users);
        setShowResults(true);
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
          email: 'haseeb@ddsolutions.io',
          original_name: 'nawaz_at_dxdglobal.com'
        },
        {
          id: 2,
          display_name: 'Nawaz Sheikh', 
          email: 'nawaz@dxdglobal.com',
          original_name: 'nawaz'
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
    console.log('Selected user:', user);
  };

  // Get the last 4 days of the selected month
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
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    setActiveDate(null); // Reset active date when month changes
  };

  if (isLoading) {
    return null;
  }

  return (
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
        <EmployeeTab>{searchValue || 'LOLL'}</EmployeeTab>
        <ArrowButton type="button" onClick={() => {
          const newDate = new Date(selectedYear, selectedMonth - 1, 1);
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedMonth(newDate.getMonth() + 1);
          setSelectedYear(newDate.getFullYear());
        }}>←</ArrowButton>
        {dates.map(({ date, month, year, active }) => (
          <DateTab 
            key={date} 
            active={active}
            onClick={() => setActiveDate(date)}
          >
            <span className="date">{date}</span>
            <span className="month">{month}</span>
          </DateTab>
        ))}
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
        
        {/* Right Side Content - Always Visible */}
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
      </ContentContainer>
    </Container>
  );
};

export default ActivityStream;
