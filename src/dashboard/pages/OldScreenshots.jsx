import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useTheme } from '../context/ThemeContext';

// Add CSS animation for loading spinner
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the keyframes into the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = spinKeyframes;
  if (!document.head.querySelector('style[data-spin-animation]')) {
    styleElement.setAttribute('data-spin-animation', 'true');
    document.head.appendChild(styleElement);
  }
}

// Screenshot Modal Component
const ScreenshotModal = ({ screenshot, screenshots, currentIndex, isOpen, onClose, onPrevious, onNext, isDarkMode, theme }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
  };

  // Reset loading state when screenshot changes
  useEffect(() => {
    if (screenshot) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [screenshot]);

  // Add keyboard listeners when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Don't render if modal is closed or no screenshot
  if (!isOpen || !screenshot) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
      }}
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}
      >
        ×
      </button>

      {/* Navigation Buttons */}
      {screenshots && screenshots.length > 1 && currentIndex > 0 && (
        <button
          onClick={onPrevious}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          ‹
        </button>
      )}

      {screenshots && screenshots.length > 1 && currentIndex < screenshots.length - 1 && (
        <button
          onClick={onNext}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          ›
        </button>
      )}

      {/* Image Container */}
      <div style={{
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        
        {/* Loading State */}
        {imageLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '300px',
            minHeight: '200px',
            color: 'white',
            fontSize: '18px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }}></div>
            Loading image...
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '300px',
            minHeight: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center',
            padding: '40px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Could not load image</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>The screenshot may have been moved or deleted</div>
          </div>
        )}

        {/* Main Image */}
        {!imageError && (
          <img
            src={screenshot.screenshot_url}
            alt={`Screenshot from ${screenshot.datetime}`}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: imageLoading ? 'none' : 'block'
            }}
            onLoad={() => {
              setImageLoading(false);
              setImageError(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        )}

        {/* Image Info */}
        {!imageError && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '12px 20px',
            borderRadius: '6px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              {screenshot.datetime}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Size: {screenshot.size_mb}MB
              {screenshots && screenshots.length > 1 && (
                <> • {currentIndex + 1} of {screenshots.length}</>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const OldScreenshots = () => {
  const themeContext = useTheme();
  const { isDarkMode = false, theme = {} } = themeContext || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Date filtering state
  const [startDate, setStartDate] = useState('2025-08-01');
  const [endDate, setEndDate] = useState('2025-08-31');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('08');
  const [selectedDay, setSelectedDay] = useState('01');
  const [dateSelectionMode, setDateSelectionMode] = useState('month'); // 'month' or 'day'
  const [searchPerformance, setSearchPerformance] = useState(null);
  
  // Users state
  const [topUsers, setTopUsers] = useState([
    { value: '', label: 'Select a user to view screenshots', searchName: '', count: 0, displayEmail: '' }
  ]);
  const [usersLoading, setUsersLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50); // Dynamic page size - default 50
  
  // Load More functionality state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreScreenshots, setHasMoreScreenshots] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  
  // Debug modal state changes
  useEffect(() => {
    console.log('🎭 Modal state changed:', { modalOpen, hasSelectedScreenshot: !!selectedScreenshot, currentImageIndex });
  }, [modalOpen, selectedScreenshot, currentImageIndex]);

  // Debug page size changes
  useEffect(() => {
    console.log('📏 PageSize state updated to:', pageSize);
  }, [pageSize]);
  
  // Modal functions
  const openModal = (screenshot, index) => {
    console.log('🖼️ Opening modal for screenshot:', screenshot.datetime, 'at index:', index);
    console.log('📸 Screenshot data:', screenshot);
    console.log('🔢 Modal state before:', { modalOpen, selectedScreenshot, currentImageIndex });
    
    setSelectedScreenshot(screenshot);
    setCurrentImageIndex(index);
    setModalOpen(true);
    
    console.log('✅ Modal should now be open');
  };

  const closeModal = () => {
    console.log('❌ Closing modal');
    setModalOpen(false);
    setSelectedScreenshot(null);
    setCurrentImageIndex(0);
  };

  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedScreenshot(screenshots[newIndex]);
    }
  };

  const goToNext = () => {
    if (currentImageIndex < screenshots.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedScreenshot(screenshots[newIndex]);
    }
  };

  // Fetch top users from API
  const fetchTopUsers = async () => {
    setUsersLoading(true);
    try {
      // For now, use the static user list since the API endpoint structure is unclear
      // TODO: Update this when the correct user list endpoint is confirmed
      console.log('🔍 Using static user list (API endpoint needs confirmation)');
      
      // Static user list as fallback
      setTopUsers([
        { value: '', label: 'Select a user to view screenshots', searchName: '', count: 0, displayEmail: '' },
        { value: 'ilahe@dxdglobal.com', label: 'ilahe@dxdglobal.com', searchName: 'ilahe_at_dxdglobal.com', count: 0, displayEmail: 'ilahe@dxdglobal.com' },
        { value: 'gulsummelisa.23@gmail.com', label: 'gulsummelisa.23@gmail.com', searchName: 'gulsummelisa.23_at_gmail.com', count: 0, displayEmail: 'gulsummelisa.23@gmail.com' },
        { value: 'begumdamlasen@gmail.com', label: 'begumdamlasen@gmail.com', searchName: 'begumdamlasen_at_gmail.com', count: 0, displayEmail: 'begumdamlasen@gmail.com' },
        { value: 'cagla.shr@gmail.com', label: 'cagla.shr@gmail.com', searchName: 'cagla.shr_at_gmail.com', count: 0, displayEmail: 'cagla.shr@gmail.com' },
        { value: 'atakankahraman35@outlook.com', label: 'atakankahraman35@outlook.com', searchName: 'atakankahraman35_at_outlook.com', count: 0, displayEmail: 'atakankahraman35@outlook.com' },
        { value: 'kadircagtas@gmail.com', label: 'kadircagtas@gmail.com', searchName: 'kadircagtas_at_gmail.com', count: 0, displayEmail: 'kadircagtas@gmail.com' },
        { value: 'mohsinabbass688630@gmail.com', label: 'mohsinabbass688630@gmail.com', searchName: 'mohsinabbass688630_at_gmail.com', count: 0, displayEmail: 'mohsinabbass688630@gmail.com' },
        { value: 'yunussemrekatirci@gmail.com', label: 'yunussemrekatirci@gmail.com', searchName: 'yunussemrekatirci_at_gmail.com', count: 0, displayEmail: 'yunussemrekatirci@gmail.com' },
        { value: 'rignimeyikur02@gmail.com', label: 'rignimeyikur02@gmail.com', searchName: 'rignimeyikur02_at_gmail.com', count: 0, displayEmail: 'rignimeyikur02@gmail.com' },
        { value: 'ilahe.avci2004@gmail.com', label: 'ilahe.avci2004@gmail.com', searchName: 'ilahe.avci2004_at_gmail.com', count: 0, displayEmail: 'ilahe.avci2004@gmail.com' }
      ]);
      
    } catch (err) {
      console.error(`❌ Error in fetchTopUsers:`, err);
      // Fallback to static users if any error occurs
      setTopUsers([
        { value: '', label: 'Select a user to view screenshots', searchName: '', count: 0, displayEmail: '' },
        { value: 'ilahe@dxdglobal.com', label: 'ilahe@dxdglobal.com', searchName: 'ilahe_at_dxdglobal.com', count: 0, displayEmail: 'ilahe@dxdglobal.com' },
        { value: 'gulsummelisa.23@gmail.com', label: 'gulsummelisa.23@gmail.com', searchName: 'gulsummelisa.23_at_gmail.com', count: 0, displayEmail: 'gulsummelisa.23@gmail.com' },
        { value: 'begumdamlasen@gmail.com', label: 'begumdamlasen@gmail.com', searchName: 'begumdamlasen_at_gmail.com', count: 0, displayEmail: 'begumdamlasen@gmail.com' },
        { value: 'cagla.shr@gmail.com', label: 'cagla.shr@gmail.com', searchName: 'cagla.shr_at_gmail.com', count: 0, displayEmail: 'cagla.shr@gmail.com' },
        { value: 'atakankahraman35@outlook.com', label: 'atakankahraman35@outlook.com', searchName: 'atakankahraman35_at_outlook.com', count: 0, displayEmail: 'atakankahraman35@outlook.com' },
        { value: 'kadircagtas@gmail.com', label: 'kadircagtas@gmail.com', searchName: 'kadircagtas_at_gmail.com', count: 0, displayEmail: 'kadircagtas@gmail.com' },
        { value: 'mohsinabbass688630@gmail.com', label: 'mohsinabbass688630@gmail.com', searchName: 'mohsinabbass688630_at_gmail.com', count: 0, displayEmail: 'mohsinabbass688630@gmail.com' },
        { value: 'yunussemrekatirci@gmail.com', label: 'yunussemrekatirci@gmail.com', searchName: 'yunussemrekatirci_at_gmail.com', count: 0, displayEmail: 'yunussemrekatirci@gmail.com' },
        { value: 'rignimeyikur02@gmail.com', label: 'rignimeyikur02@gmail.com', searchName: 'rignimeyikur02_at_gmail.com', count: 0, displayEmail: 'rignimeyikur02@gmail.com' },
        { value: 'ilahe.avci2004@gmail.com', label: 'ilahe.avci2004@gmail.com', searchName: 'ilahe.avci2004_at_gmail.com', count: 0, displayEmail: 'ilahe.avci2004@gmail.com' }
      ]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchUserScreenshots = async (searchName, page = 1, startDate = '2025-08-01', endDate = '2025-08-31') => {
    return fetchUserScreenshotsWithPageSize(searchName, page, startDate, endDate, pageSize);
  };

  const fetchUserScreenshotsWithPageSize = async (searchName, page = 1, startDate = '2025-08-01', endDate = '2025-08-31', customPageSize = null, isLoadMore = false) => {
    if (!searchName) return;
    
    const actualPageSize = customPageSize || pageSize;
    const offsetValue = isLoadMore ? currentOffset : 0;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setCurrentOffset(0); // Reset offset for new searches
    }
    setError(null);
    
    try {
      // Use proxy to fetch screenshots with offset for pagination
      const baseUrl = '/api/users/screenshots/';
      const params = new URLSearchParams({
        q: searchName,
        start_date: startDate,
        end_date: endDate,
        page_size: actualPageSize,
        offset: offsetValue
      });
      
      const fullUrl = `${baseUrl}?${params}`;
      console.log(`🔍 Fetching screenshots via proxy (${isLoadMore ? 'Load More' : 'Initial'}):`, fullUrl);
      console.log('📊 Search parameters:', { searchName, startDate, endDate, pageSize: actualPageSize, offset: offsetValue });
      
      // Increased timeout for large data sets
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Proxy API Response (${isLoadMore ? 'Load More' : 'Initial'}):`, data);
      
      if (data.status === 'success' && data.data) {
        const newScreenshots = Array.isArray(data.data.screenshots) ? data.data.screenshots : [];
        const totalCount = data.data.total_count || 0;
        
        if (isLoadMore) {
          // Append new screenshots to existing ones
          setScreenshots(prevScreenshots => [...prevScreenshots, ...newScreenshots]);
          setCurrentOffset(offsetValue + newScreenshots.length);
          
          // Check if there are more screenshots to load
          const totalLoaded = offsetValue + newScreenshots.length;
          setHasMoreScreenshots(totalLoaded < totalCount);
          
          console.log(`📸 Loaded ${newScreenshots.length} more screenshots. Total loaded: ${totalLoaded} of ${totalCount}`);
        } else {
          // Replace screenshots for initial load
          setScreenshots(newScreenshots);
          setCurrentOffset(newScreenshots.length);
          setHasMoreScreenshots(newScreenshots.length < totalCount);
          
          console.log(`📸 Initial load: ${newScreenshots.length} screenshots of ${totalCount} total`);
        }
        
        setTotalCount(totalCount);
        setSearchPerformance(data.data.search_performance || null);
        
      } else {
        console.log('❌ Invalid API response structure:', data);
        if (!isLoadMore) {
          setScreenshots([]);
          setTotalCount(0);
          setHasMoreScreenshots(false);
          setCurrentOffset(0);
        }
        setSearchPerformance(null);
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error(`⏰ Request timeout after 60 seconds for ${searchName}`);
        setError(`Request timeout - The search is taking too long. Please try a smaller date range or try again later.`);
      } else {
        console.error(`❌ Error fetching screenshots:`, err);
        setError(`Failed to load screenshots: ${err.message}`);
      }
      
      if (!isLoadMore) {
        setScreenshots([]);
        setTotalCount(0);
        setHasMoreScreenshots(false);
        setCurrentOffset(0);
        setSearchPerformance(null);
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Handle Load More button click
  const handleLoadMore = () => {
    if (selectedUser && !loadingMore) {
      const user = topUsers.find(u => u.value === selectedUser);
      if (user && user.searchName) {
        fetchUserScreenshotsWithPageSize(user.searchName, 1, startDate, endDate, pageSize, true);
      }
    }
  };

  const handleUserChange = (event) => {
    const userEmail = event.target.value;
    setSelectedUser(userEmail);
    
    if (userEmail) {
      const user = topUsers.find(u => u.value === userEmail);
      if (user && user.searchName) {
        setCurrentPage(1);
        fetchUserScreenshots(user.searchName, 1, startDate, endDate);
      }
    } else {
      setScreenshots([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
      setSearchPerformance(null);
    }
  };

  const handlePageChange = (page) => {
    if (selectedUser) {
      const user = topUsers.find(u => u.value === selectedUser);
      if (user && user.searchName) {
        fetchUserScreenshots(user.searchName, page, startDate, endDate);
      }
    }
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value);
    console.log('📏 Page size changing from', pageSize, 'to', newPageSize);
    
    // Update state first
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
    
    // Use the new page size directly in the API call instead of relying on state
    if (selectedUser) {
      const user = topUsers.find(u => u.value === selectedUser);
      if (user && user.searchName) {
        console.log('🔄 Fetching screenshots with new page size:', newPageSize);
        // Call fetchUserScreenshots with the new page size directly
        fetchUserScreenshotsWithPageSize(user.searchName, 1, startDate, endDate, newPageSize);
      }
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    updateDateRange(year, selectedMonth);
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    updateDateRange(selectedYear, month);
  };

  const updateDateRange = (year, month, day = null) => {
    let newStartDate, newEndDate;
    
    if (dateSelectionMode === 'day' && day) {
      // Single day selection
      newStartDate = `${year}-${month}-${day}`;
      newEndDate = `${year}-${month}-${day}`;
    } else {
      // Full month selection
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      newStartDate = `${year}-${month}-01`;
      newEndDate = `${year}-${month}-${daysInMonth.toString().padStart(2, '0')}`;
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // If user is selected, refresh data with new date range
    if (selectedUser) {
      const user = topUsers.find(u => u.value === selectedUser);
      if (user && user.searchName) {
        setCurrentPage(1);
        fetchUserScreenshots(user.searchName, 1, newStartDate, newEndDate);
      }
    }
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setDateSelectionMode('day');
    updateDateRange(selectedYear, selectedMonth, day);
  };

  const handleMonthModeToggle = () => {
    setDateSelectionMode('month');
    updateDateRange(selectedYear, selectedMonth);
  };

  const getMonthName = (monthNum) => {
    const months = {
      '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR',
      '05': 'MAY', '06': 'JUN', '07': 'JUL', '08': 'AUG',
      '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC'
    };
    return months[monthNum] || monthNum;
  };

  const generateDateButtons = () => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    const buttons = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const isToday = year === currentYear && month === currentMonth && day === currentDay;
      const isFuture = year > currentYear || 
                      (year === currentYear && month > currentMonth) ||
                      (year === currentYear && month === currentMonth && day > currentDay);
      
      buttons.push({
        day: dayStr,
        dayNum: day,
        isToday,
        isFuture,
        isSelected: dayStr === selectedDay
      });
    }
    
    return buttons;
  };

  const getInitials = (email) => {
    if (!email) return '';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase();
  };

  const getAvatarColor = (email) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const testAllUsers = async () => {
    console.log('🧪 Testing all users with proxy API...');
    console.log(`📅 Date range: ${startDate} to ${endDate}`);
    
    for (const user of topUsers.slice(1)) { // Skip the first empty option
      console.log(`\n🔍 Testing user: ${user.displayEmail} (${user.searchName})`);
      
      try {
        const baseUrl = '/api/users/screenshots/';
        const params = new URLSearchParams({
          q: user.searchName,
          start_date: startDate,
          end_date: endDate,
          page: 1,
          page_size: 5 // Just get a few for testing
        });
        
        const response = await fetch(`${baseUrl}?${params}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          const totalCount = data.data.total_count || 0;
          const searchTime = data.data.search_performance?.search_time_ms || 0;
          const objectsScanned = data.data.search_performance?.objects_scanned || 0;
          
          console.log(`✅ ${user.displayEmail}:`);
          console.log(`   📸 Screenshots: ${totalCount.toLocaleString()}`);
          console.log(`   ⏱️ Search time: ${searchTime}ms`);
          console.log(`   🔍 Objects scanned: ${objectsScanned.toLocaleString()}`);
        } else {
          console.log(`❌ ${user.displayEmail}: No data returned`, data);
        }
      } catch (err) {
        console.log(`❌ ${user.displayEmail}: Error - ${err.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ User testing completed! Check console for results.');
  };

  return (
    <DashboardLayout>
      <div style={{ 
        padding: '24px', 
        background: isDarkMode ? theme.colors?.background || '#1a1d29' : '#f8fafc', 
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#1e293b',
            margin: '0 0 8px 0'
          }}>
            User Screenshots ({dateSelectionMode === 'day' ? `${selectedDay} ${getMonthName(selectedMonth)} ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`})
          </h1>
          <p style={{ 
            color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#64748b', 
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            {usersLoading ? 'Loading top users...' : 
              dateSelectionMode === 'day' 
                ? `Select a user to view their screenshots from ${startDate}`
                : `Select a user to view their screenshots from ${startDate} to ${endDate}`
            }
          </p>
        </div>

        {/* Controls */}
        <div style={{ marginBottom: '24px' }}>
          {/* Month/Year Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Year Dropdown */}
            <select 
              value={selectedYear}
              onChange={handleYearChange}
              style={{
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                fontSize: '14px',
                color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
                minWidth: '80px',
                cursor: 'pointer'
              }}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>

            {/* Month Dropdown */}
            <select 
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                fontSize: '14px',
                color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
                minWidth: '100px',
                cursor: 'pointer'
              }}
            >
              <option value="01">JAN</option>
              <option value="02">FEB</option>
              <option value="03">MAR</option>
              <option value="04">APR</option>
              <option value="05">MAY</option>
              <option value="06">JUN</option>
              <option value="07">JUL</option>
              <option value="08">AUG</option>
              <option value="09">SEP</option>
              <option value="10">OCT</option>
              <option value="11">NOV</option>
              <option value="12">DEC</option>
            </select>

            {/* Mode Toggle */}
            <button
              onClick={handleMonthModeToggle}
              style={{
                padding: '8px 16px',
                border: `1px solid ${dateSelectionMode === 'month' ? '#3b82f6' : (isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db')}`,
                borderRadius: '6px',
                background: dateSelectionMode === 'month' ? '#3b82f6' : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                color: dateSelectionMode === 'month' ? 'white' : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Full Month
            </button>

            {/* Date Range Display */}
            <div style={{
              padding: '8px 12px',
              background: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${isDarkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
              borderRadius: '6px',
              fontSize: '12px',
              color: isDarkMode ? '#93c5fd' : '#2563eb',
              fontFamily: 'monospace'
            }}>
              📅 {startDate} {startDate !== endDate ? `→ ${endDate}` : ''}
            </div>

            {/* User Dropdown */}
            <select 
              value={selectedUser}
              onChange={handleUserChange}
              disabled={usersLoading}
              style={{
                padding: '8px 12px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                background: usersLoading 
                  ? (isDarkMode ? '#2d3748' : '#f7fafc') 
                  : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                fontSize: '14px',
                color: usersLoading 
                  ? (isDarkMode ? '#718096' : '#a0aec0')
                  : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                minWidth: '300px',
                flex: 1,
                cursor: usersLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {usersLoading ? (
                <option>Loading users...</option>
              ) : (
                topUsers.map((user, index) => (
                  <option key={index} value={user.value}>
                    {user.label}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left Side - User Info (when user selected) */}
          {selectedUser && (
            <div style={{ width: '280px' }}>
              <div style={{
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`,
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: getAvatarColor(selectedUser),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {getInitials(selectedUser)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#1f2937' }}>
                      {selectedUser.split('@')[0]}
                    </div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>
                      {selectedUser}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280',
                  textAlign: 'center',
                  padding: '12px 0'
                }}>
                  Found {totalCount.toLocaleString()} screenshot(s) 
                  <br />
                  for {dateSelectionMode === 'day' ? `${selectedDay} ${getMonthName(selectedMonth)} ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`}
                  <br />
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>
                    ({dateSelectionMode === 'day' ? startDate : `${startDate} to ${endDate}`})
                  </span>
                </div>
              </div>
              
              {/* Search Performance Indicator */}
              {searchPerformance && (
                <div style={{
                  background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                  borderRadius: '8px',
                  border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`,
                  padding: '12px',
                  marginTop: '12px'
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: '600', 
                    color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#1f2937',
                    marginBottom: '8px'
                  }}>
                    🚀 Search Performance
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    ⏱️ {searchPerformance.search_time_ms}ms
                    <br />
                    🔍 {searchPerformance.objects_scanned?.toLocaleString()} objects scanned
                    <br />
                    📷 {searchPerformance.screenshots_found?.toLocaleString()} screenshots found
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Side - Screenshots Grid */}
          <div style={{ flex: 1 }}>
            
            {/* Error State */}
            {error && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#ef4444' : '#fecaca'}`,
                color: '#dc2626'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h3>Error Loading Screenshots</h3>
                <p>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151' }}>Loading Screenshots...</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>
                  Fetching {dateSelectionMode === 'day' ? `${selectedDay} ${getMonthName(selectedMonth)} ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`} data from S3
                  <br />
                  <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Large datasets may take up to 60 seconds to load
                  </span>
                </p>
              </div>
            )}

            {/* Screenshots Grid */}
            {!loading && !error && screenshots.length > 0 && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {screenshots.map((screenshot, index) => {
                    console.log(`🖼️ Rendering screenshot ${index + 1}/${screenshots.length}:`, {
                      url: screenshot.screenshot_url,
                      datetime: screenshot.datetime,
                      size: screenshot.size_mb
                    });
                    
                    return (
                    <div
                      key={screenshot.full_key || index}
                      style={{
                        background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                        borderRadius: '8px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                        // Show overlay
                        const overlay = e.currentTarget.querySelector('[data-overlay]');
                        if (overlay) overlay.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                        // Hide overlay
                        const overlay = e.currentTarget.querySelector('[data-overlay]');
                        if (overlay) overlay.style.opacity = '0';
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ Screenshot clicked:', index, screenshot.datetime);
                        openModal(screenshot, index);
                      }}
                    >
                      <div style={{
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        background: isDarkMode ? '#4b5563' : '#f3f4f6'
                      }}>
                        {screenshot.screenshot_url ? (
                          <>
                            <img 
                              src={screenshot.screenshot_url}
                              alt={`Screenshot from ${screenshot.datetime}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                pointerEvents: 'none', // Prevent direct image interaction
                                display: 'block'
                              }}
                              onLoad={(e) => {
                                console.log('✅ Image loaded successfully:', screenshot.screenshot_url);
                              }}
                              onError={(e) => {
                                console.log('❌ Image failed to load:', screenshot.screenshot_url);
                                e.target.style.display = 'none';
                                // Show fallback icon
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div style={{ 
                              fontSize: '24px', 
                              color: '#9ca3af',
                              display: 'none',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0
                            }}>📷</div>
                          </>
                        ) : (
                          <div style={{ fontSize: '24px', color: '#9ca3af' }}>📷</div>
                        )}
                        
                        {/* Click overlay */}
                        <div 
                          data-overlay
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            pointerEvents: 'none'
                          }}
                        >
                          🔍 Click to view
                        </div>
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontSize: '12px', color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280', marginBottom: '4px' }}>
                          {screenshot.datetime}
                        </div>
                        <div style={{ fontSize: '11px', color: isDarkMode ? theme.colors?.text?.light || '#6b7280' : '#9ca3af' }}>
                          {screenshot.size_mb}MB
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
                {/* Log final rendering confirmation */}
                {console.log(`🎨 FINAL RENDERING COMPLETE: ${screenshots.length} screenshots displayed on page ${currentPage} (requested: ${pageSize}, actual pageSize used: ${pageSize})`)}

                {/* Load More Button */}
                {console.log('🔍 Load More Debug:', { 
                  hasMoreScreenshots, 
                  screenshotsLength: screenshots.length, 
                  totalCount, 
                  currentOffset,
                  loadingMore 
                })}
                {hasMoreScreenshots && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '24px',
                    marginBottom: '20px'
                  }}>
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        background: loadingMore 
                          ? (isDarkMode ? '#4b5563' : '#e5e7eb')
                          : '#3b82f6',
                        color: loadingMore 
                          ? (isDarkMode ? '#9ca3af' : '#6b7280')
                          : 'white',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minWidth: '140px',
                        justifyContent: 'center'
                      }}
                    >
                      {loadingMore ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid currentColor',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Loading...
                        </>
                      ) : (
                        <>
                          📷 Load More Screenshots
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Debug Load More Button (always visible for testing) */}
                {screenshots.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '12px',
                    marginBottom: '20px'
                  }}>
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        background: loadingMore 
                          ? (isDarkMode ? '#4b5563' : '#f3f4f6')
                          : 'transparent',
                        color: loadingMore 
                          ? (isDarkMode ? '#9ca3af' : '#6b7280')
                          : '#3b82f6',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: loadingMore ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {loadingMore ? 'Testing Load More...' : 'Load More'}
                    </button>
                  </div>
                )}

                {/* Page Size Selector and Pagination Info */}
                {screenshots.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    padding: '16px',
                    background: isDarkMode ? theme.colors?.surface || '#374151' : '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <label style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'
                      }}>
                        Screenshots per page:
                      </label>
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{
                          padding: '6px 12px',
                          border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                          borderRadius: '6px',
                          background: isDarkMode ? theme.colors?.background || '#1f2937' : 'white',
                          color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={200}>200 per page</option>
                        <option value={250}>250 per page</option>
                        <option value={350}>350 per page</option>
                        <option value={450}>450 per page</option>
                        <option value={500}>500 per page</option>
                      </select>
                    </div>
                    
                    <div style={{
                      fontSize: '14px',
                      color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280'
                    }}>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} screenshots
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '24px'
                  }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: currentPage <= 1 ? (isDarkMode ? '#374151' : '#f9fafb') : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                        color: currentPage <= 1 ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '8px 12px',
                            border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                            borderRadius: '6px',
                            background: currentPage === pageNum ? '#3b82f6' : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                            color: currentPage === pageNum ? 'white' : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                            cursor: 'pointer',
                            fontSize: '14px',
                            minWidth: '40px'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{
                        padding: '8px 12px',
                        border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#d1d5db'}`,
                        borderRadius: '6px',
                        background: currentPage >= totalPages ? (isDarkMode ? '#374151' : '#f9fafb') : (isDarkMode ? theme.colors?.surface || '#374151' : 'white'),
                        color: currentPage >= totalPages ? (isDarkMode ? '#6b7280' : '#9ca3af') : (isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151'),
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && screenshots.length === 0 && selectedUser && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151' }}>No Screenshots Found</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>
                  No screenshots available for this user on {dateSelectionMode === 'day' ? `${selectedDay} ${getMonthName(selectedMonth)} ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`}
                  <br />
                  <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Date range: {dateSelectionMode === 'day' ? startDate : `${startDate} to ${endDate}`}
                  </span>
                </p>
              </div>
            )}

            {/* Default State */}
            {!selectedUser && (
              <div style={{ 
                textAlign: 'center', 
                padding: '80px',
                background: isDarkMode ? theme.colors?.surface || '#374151' : 'white',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? theme.colors?.border || '#4b5563' : '#e5e7eb'}`
              }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>👥</div>
                <h3 style={{ color: isDarkMode ? theme.colors?.text?.primary || '#ffffff' : '#374151', marginBottom: '8px' }}>Select a User</h3>
                <p style={{ color: isDarkMode ? theme.colors?.text?.secondary || '#94a3b8' : '#6b7280' }}>
                  Choose a user from the dropdown to view their {dateSelectionMode === 'day' ? `${selectedDay} ${getMonthName(selectedMonth)} ${selectedYear}` : `${getMonthName(selectedMonth)} ${selectedYear}`} screenshots
                  <br />
                  <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
                    Current range: {dateSelectionMode === 'day' ? startDate : `${startDate} to ${endDate}`}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Screenshot Modal */}
        {console.log('🎭 Rendering modal with props:', { 
          modalOpen, 
          hasSelectedScreenshot: !!selectedScreenshot,
          currentImageIndex,
          screenshotsLength: screenshots.length 
        })}
        <ScreenshotModal
          screenshot={selectedScreenshot}
          screenshots={screenshots}
          currentIndex={currentImageIndex}
          isOpen={modalOpen}
          onClose={closeModal}
          onPrevious={goToPrevious}
          onNext={goToNext}
          isDarkMode={isDarkMode}
          theme={theme}
        />
      </div>
    </DashboardLayout>
  );
};

export default OldScreenshots;
