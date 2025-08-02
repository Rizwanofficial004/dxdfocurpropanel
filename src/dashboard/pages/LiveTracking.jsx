import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Container } from '../styles/commonStyles';
import { useLanguage } from '../context/LanguageContext';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { API_CONFIG, buildLiveTrackingUrl, buildScreenshotProxyUrl, retryExtremeApiCall } from '../../config/apiConfig';
import ImageModal from '../components/common/ImageModal';
import {
  LiveTrackingContainer,
  ContentSection,
  TrackingCard,
  CardHeader,
  Title,
  FilterSection,
  LeftFilters,
  RightFilters,
  FilterDropdown,
  SearchInput,
  RefreshButton,
  ExportButton,
  StatusBadge,
  ActivityInfo,
  InfoItem,
  ScreenshotGrid,
  ScreenshotCard,
  ScreenshotImage,
  CardContent,
  TaskHeader,
  TaskName,
  TaskMeta,
  TaskTime,
  PaginationContainer,
  PaginationButton,
  PaginationInfo,
  LoadingContainer,
  ErrorMessage,
  NoDataMessage,
  ResultsInfo,
  ImageError
} from './LiveTracking.styles';

const LiveTracking = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');  const [dateRange, setDateRange] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Image modal states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // API related states
  const [liveTrackingData, setLiveTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [activityStats, setActivityStats] = useState({
    totalActive: 0,
    online: 0,
    idle: 0,
    offline: 0,
    totalHours: '0h'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Image modal handlers
  const openImageModal = (imageUrl, imageTitle = "Screenshot") => {
    console.log('🖼️ Opening image modal for:', imageUrl);
    const imageData = {
      url: imageUrl,
      title: imageTitle,
      alt: imageTitle
    };
    setCurrentImages([imageData]);
    setCurrentImageIndex(0);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    console.log('🚫 Closing image modal');
    setIsImageModalOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  // Helper function to format time ago
  const formatTimeAgo = (minutes) => {
    if (minutes === null || minutes === undefined) return 'Unknown';
    
    if (minutes === 0) return 'just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 1) {
      if (remainingMinutes === 0) return '1 hour ago';
      if (remainingMinutes === 1) return '1 hour 1 minute ago';
      return `1 hour ${remainingMinutes} minutes ago`;
    }
    
    if (remainingMinutes === 0) return `${hours} hours ago`;
    if (remainingMinutes === 1) return `${hours} hours 1 minute ago`;
    return `${hours} hours ${remainingMinutes} minutes ago`;
  };

  // Helper function to get human-readable date range description
  const getDateRangeDescription = () => {
    const now = new Date();
    const dateParams = getDateRangeParams();
    
    switch (dateRange) {
      case 'today':
        return `Today (${now.toLocaleDateString()})`;
      case 'this_week':
        const startOfWeek = new Date(dateParams.start_date);
        const endOfWeek = new Date(dateParams.end_date);
        return `This Week (${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()})`;
      case 'this_month':
        return `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
      case 'this_year':
        return `This Year (${now.getFullYear()})`;
      default:
        return 'Today';
    }
  };

  // Enhanced image URL handler with multiple fallback strategies
  const getImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    console.log('🔍 Processing image URL:', originalUrl);
    
    // If it's already a data URL or blob, return as-is
    if (originalUrl.startsWith('data:') || originalUrl.startsWith('blob:')) {
      console.log('✅ Using data/blob URL directly');
      return originalUrl;
    }
    
    // Use the centralized helper to build the correct proxy URL
    const proxyUrl = buildScreenshotProxyUrl(originalUrl);
    console.log('🔄 Generated proxy URL:', proxyUrl);
    return proxyUrl;
  };

  // Enhanced Image Component with better error handling and fallback strategies
  const ImageComponent = ({ src, alt, style, onLoad, onError, fallbackText = "No Image" }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 2;
    
    useEffect(() => {
      setImageSrc(src);
      setHasError(false);
      setIsLoading(true);
      setRetryCount(0);
    }, [src]);

    const handleError = (e) => {
      console.error('❌ Image failed to load:', imageSrc, 'Error:', e.target.error);
      setIsLoading(false);
      
      // Try fallback strategies
      if (retryCount < maxRetries && imageSrc) {
        console.log(`🔄 Retrying image load (${retryCount + 1}/${maxRetries})`);
        
        if (retryCount === 0) {
          // First retry: try with different CORS approach
          const fallbackUrl = imageSrc.includes('?') 
            ? imageSrc.replace(/[?&]cache-control=[^&]*/, '').replace(/[?&]cors=[^&]*/, '')
            : imageSrc;
          console.log('🔄 Retry 1: Using clean URL:', fallbackUrl);
          setImageSrc(fallbackUrl + '?' + Date.now()); // Add timestamp to bypass cache
          setRetryCount(1);
          return;
        } else if (retryCount === 1) {
          // Second retry: try with proxy approach using centralized helper
          const proxyUrl = buildScreenshotProxyUrl(imageSrc);
          if (proxyUrl !== imageSrc) {
            console.log('🔄 Retry 2: Using centralized proxy URL:', proxyUrl);
            setImageSrc(proxyUrl);
            setRetryCount(2);
            return;
          }
        }
      }
      
      // All retries failed
      setHasError(true);
      if (onError) onError(e);
    };

    const handleLoad = (e) => {
      console.log('✅ Image loaded successfully:', imageSrc);
      setHasError(false);
      setIsLoading(false);
      if (onLoad) onLoad(e);
    };

    if (hasError || !imageSrc) {
      return (
        <ImageError style={style}>
          <div className="icon">🚫</div>
          <div className="message">Image Load Failed</div>
          <div className="url">
            {imageSrc ? (imageSrc.length > 30 ? imageSrc.substring(0, 30) + '...' : imageSrc) : 'No URL'}
          </div>
          {retryCount > 0 && (
            <div style={{ fontSize: '7px', marginTop: '2px', opacity: 0.5 }}>
              Tried {retryCount} fallback{retryCount > 1 ? 's' : ''}
            </div>
          )}
        </ImageError>
      );
    }

    return (
      <div style={{ position: 'relative', ...style }}>
        <img
          src={imageSrc}
          alt={alt}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            borderRadius: '8px',
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            color: '#6b7280',
            background: 'rgba(255,255,255,0.8)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            Loading...
          </div>
        )}
      </div>
    );
  };

  // Helper function to get date range for API filtering
  const getDateRangeParams = () => {
    const now = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        startDate = startOfWeek;
        endDate = endOfWeek;
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        // Default to today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    
    console.log(`📅 Date range calculation for "${dateRange}":`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startLocal: startDate.toLocaleString(),
      endLocal: endDate.toLocaleString()
    });
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch live tracking data from API
  const fetchLiveTrackingData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');
      setLoadingProgress(0);
      
      // Show refresh message if it's a manual refresh
      if (forceRefresh) {
        console.log('🔄 Manual refresh triggered...');
      }
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until real response
          return prev + Math.random() * 10;
        });
      }, 2000);
      
      // Get date range parameters for API
      const dateParams = getDateRangeParams();
      
      // Build API URL with filters - Request ALL S3 data
      const apiUrl = buildLiveTrackingUrl({
        limit: 50000, // Increased limit to get all S3 screenshots
        start_date: dateParams.start_date,
        end_date: dateParams.end_date
      });
      
      console.log('Fetching live tracking data from:', apiUrl);
      console.log('⏳ Note: This API scans S3 folders. Starting with optimized approach...');
      
      // Try a faster approach first - use fast_mode and reasonable limits
      let fastApiUrl = apiUrl.replace('limit=50000', 'limit=1000') + '&fast_mode=true';
      
      try {
        console.log('🚀 Trying fast mode with 30s timeout...');
        setError('🚀 Loading with fast mode (30s timeout)...');
        
        const response = await axios.get(fastApiUrl, {
          ...API_CONFIG.EXTENDED_REQUEST_CONFIG,
          timeout: 30000 // 30 seconds for fast mode
        });
        
        console.log('✅ Fast mode succeeded!');
        setError(''); // Clear error on success
        
        clearInterval(progressInterval);
        setLoadingProgress(100);
        
        console.log('Live tracking API response:', response.data);
        
        // Handle the API response
        if (response.data && response.data.success && response.data.data && response.data.data.users) {
          const users = response.data.data.users;
          const summary = response.data.data.summary;
          
          setLiveData(users);
          setTotalUsers(summary?.total_users || users.length);
          setActiveUsers(summary?.active_users || users.filter(u => u.status === 'active').length);
          setTotalScreenshots(summary?.total_screenshots || users.reduce((sum, u) => sum + (u.screenshot_count || 0), 0));
        } else {
          console.warn('Unexpected API response structure:', response.data);
          setError('Received unexpected data format from server');
        }
        
        return; // Exit successfully
        
      } catch (fastError) {
        console.warn('❌ Fast mode failed:', fastError.message);
        
        if (fastError.code === 'ECONNABORTED' || fastError.message.includes('timeout')) {
          console.log('⏳ Fast mode timed out, trying with extreme retry for full scan...');
          setError('⏳ Fast mode timed out, trying comprehensive S3 scan (this may take several minutes)...');
        } else {
          // Non-timeout error, don't retry
          throw fastError;
        }
      }
      
      // If fast mode failed, use extreme retry mechanism for comprehensive S3 scanning
      const response = await retryExtremeApiCall(
        (timeout) => axios.get(apiUrl, {
          ...API_CONFIG.EXTREME_REQUEST_CONFIG,
          timeout
        }),
        'S3 Live Tracking Comprehensive Scan',
        {
          onRetry: (attempt, error, timeout) => {
            const timeoutLabel = timeout >= 60000 ? `${Math.round(timeout/60000)}min` : `${timeout/1000}s`;
            setError(`🔄 Comprehensive S3 scan attempt ${attempt}/4 with ${timeoutLabel} timeout - This scans ALL S3 folders and may take several minutes...`);
            
            // Update progress based on attempt
            if (attempt === 1) setLoadingProgress(25);
            else if (attempt === 2) setLoadingProgress(50);
            else if (attempt === 3) setLoadingProgress(75);
            else setLoadingProgress(85);
          }
        }
      );
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      console.log('Live tracking API response:', response.data);
      
      // Handle the new API response structure
      if (response.data && response.data.success && response.data.data && response.data.data.users) {
        const users = response.data.data.users;
        const summary = response.data.data.summary;
        
        console.log(`📊 Total users from API: ${users.length}`);
        console.log(`Successfully fetched ${users.length} users from API`);
        
        // Log first few users with their timestamps for debugging
        if (users.length > 0) {
          console.log('📅 Sample user timestamps for debugging:');
          users.slice(0, 5).forEach((user, index) => {
            const timestamp = user.latest_screenshot?.timestamp;
            const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'No timestamp';
            console.log(`  ${index + 1}. ${user.display_name || 'Unknown'}: ${formattedTime}`);
          });
        }
        
        // Debug: Log a few sample image URLs
        const usersWithImages = users.filter(user => user.latest_screenshot?.url);
        if (usersWithImages.length > 0) {
          console.log('📷 Sample image URLs from API:');
          usersWithImages.slice(0, 3).forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.display_name}: ${user.latest_screenshot.url}`);
          });
        } else {
          console.warn('⚠️ No users with image URLs found in API response');
        }
        
        // Apply client-side filtering based on current filter states
        let filteredUsers = users;
        
        // Filter by date range (client-side backup filtering)
        if (dateRange && dateRange !== 'all') {
          const dateParams = getDateRangeParams();
          const startDate = new Date(dateParams.start_date);
          const endDate = new Date(dateParams.end_date);
          endDate.setHours(23, 59, 59, 999); // Include the entire end day
          
          console.log(`🔍 Client-side date filtering: ${dateRange}`);
          console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
          
          filteredUsers = filteredUsers.filter(user => {
            if (!user.latest_screenshot?.timestamp) {
              console.log(`⚠️ User ${user.display_name} has no timestamp, excluding from date filter`);
              return false; // Exclude users without timestamps when date filtering
            }
            
            const screenshotDate = new Date(user.latest_screenshot.timestamp);
            const isInRange = screenshotDate >= startDate && screenshotDate <= endDate;
            
            if (!isInRange) {
              console.log(`📅 Filtering out ${user.display_name}: screenshot from ${screenshotDate.toDateString()} (outside range)`);
            } else {
              console.log(`✅ Including ${user.display_name}: screenshot from ${screenshotDate.toDateString()} (in range)`);
            }
            
            return isInRange;
          });
          
          console.log(`📊 After date filtering: ${filteredUsers.length} users (was ${users.length})`);
        }
        
        // Filter by search query
        if (searchQuery.trim()) {
          console.log(`🔍 Applying search filter for: "${searchQuery}"`);
          console.log(`📊 Before search filtering: ${filteredUsers.length} users`);
          
          const beforeSearch = filteredUsers.length;
          filteredUsers = filteredUsers.filter(user => {
            const matchesName = user.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesEmail = user.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUsername = user.username?.toLowerCase().includes(searchQuery.toLowerCase());
            const matches = matchesName || matchesEmail || matchesUsername;
            
            if (matches) {
              console.log(`✅ Search match: ${user.display_name || user.email || user.username}`);
            }
            
            return matches;
          });
          
          console.log(`📊 After search filtering: ${filteredUsers.length} users (was ${beforeSearch})`);
        }
        
        // Filter by selected employee
        if (selectedEmployee !== 'all') {
          console.log(`🔍 Filtering by selected employee: "${selectedEmployee}"`);
          const beforeEmployeeFilter = filteredUsers.length;
          
          filteredUsers = filteredUsers.filter(user => {
            const employeeId = user.email || user.username || user.id || (user.display_name || user.name || user.username || 'Unknown Employee').toLowerCase().replace(/\s+/g, '_');
            const matches = employeeId === selectedEmployee ||
                           user.email === selectedEmployee || 
                           user.username === selectedEmployee ||
                           user.display_name?.toLowerCase().includes(selectedEmployee.toLowerCase());
            
            if (matches) {
              console.log(`✅ Employee filter match: ${user.display_name || user.email || user.username}`);
            }
            
            return matches;
          });
          
          console.log(`📊 After employee filtering: ${filteredUsers.length} users (was ${beforeEmployeeFilter})`);
        }
        
        // Filter by status
        if (selectedStatus !== 'all') {
          filteredUsers = filteredUsers.filter(user => {
            const userStatus = (user.status || (user.is_online ? 'online' : 'offline')).toLowerCase();
            return userStatus === selectedStatus.toLowerCase();
          });
        }
        
        setLiveTrackingData(filteredUsers);
        
        // Calculate stats from the summary or user data using screenshot-based status
        const calculateStatusFromScreenshot = (user) => {
          if (user.latest_screenshot?.timestamp) {
            const screenshotDate = new Date(user.latest_screenshot.timestamp);
            const now = new Date();
            const timeDiffMinutes = Math.floor((now - screenshotDate) / (1000 * 60));
            
            if (timeDiffMinutes <= 5) return 'online';
            if (timeDiffMinutes <= 15) return 'idle';
            return 'offline';
          }
          return 'offline';
        };
        
        // Calculate stats using screenshot-based status
        const onlineUsers = users.filter(user => calculateStatusFromScreenshot(user) === 'online').length;
        const idleUsers = users.filter(user => calculateStatusFromScreenshot(user) === 'idle').length;
        const offlineUsers = users.filter(user => calculateStatusFromScreenshot(user) === 'offline').length;
        const usersWithScreenshots = users.filter(user => user.latest_screenshot?.timestamp).length;
        
        console.log(`📊 Screenshot-based stats: Online: ${onlineUsers}, Idle: ${idleUsers}, Offline: ${offlineUsers}`);
        
        setActivityStats({
          totalActive: users.length,
          online: onlineUsers,
          idle: idleUsers,
          offline: offlineUsers,
          totalHours: `${usersWithScreenshots}h`
        });
        
        // Set total count for pagination (use filtered count)
        setTotalCount(filteredUsers.length);
        
        // Update last updated time
        setLastUpdated(new Date());
      } else {
        setLiveTrackingData([]);
        setTotalCount(0);
        setError('No data received from API or invalid response structure');
      }
      
    } catch (err) {
      console.error('Error fetching live tracking data:', err);
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError(`⏰ API Timeout: All retry attempts failed (15s, 30s, 60s timeouts tried)
        
📊 The S3 scan is taking longer than 60 seconds, which suggests:
• Large number of employee folders to scan
• Slow S3 response times
• Heavy server load

💡 Recommendations:
• Try again in a few minutes when server load is lower
• Use a smaller date range to reduce data processing
• Contact support if this persists regularly
• Consider using cached data if available`);
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError(`🌐 Network Error: Unable to connect to the API server. Please ensure:
• The API server is running on ${API_CONFIG.BASE_URL}
• CORS is properly configured
• No firewall is blocking the connection`);
      } else if (err.response) {
        setError(`🚫 Server error: ${err.response.status} - ${err.response.data?.message || 'Failed to fetch live tracking data'}`);
      } else if (err.request) {
        setError('📡 Connection error: Request was made but no response received. The API server may be slow or unreachable.');
      } else {
        setError(`❌ Unexpected error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    console.log('🔄 Refreshing live tracking data...');
    setCurrentPage(1); // Reset to first page
    fetchLiveTrackingData(true);
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveTrackingData();
    }, 300); // 300ms debounce for search

    return () => clearTimeout(timer);
  }, [searchQuery, selectedEmployee, dateRange, currentPage]);

  // Format tracking data for display
  const formatTrackingData = (user, index) => {
    // Format the screenshot timestamp for better display
    let formattedTime = new Date().toLocaleTimeString();
    let formattedDate = new Date().toLocaleDateString();
    
    if (user.latest_screenshot?.timestamp) {
      const screenshotDate = new Date(user.latest_screenshot.timestamp);
      formattedTime = screenshotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      formattedDate = screenshotDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: screenshotDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    }
    
    // Extract task information from various sources
    let taskName = user.current_task || user.current_activity || 'No Active Task';
    
    // If task is from task_folder, clean it up for better display
    if (user.latest_screenshot?.task_folder) {
      taskName = user.latest_screenshot.task_folder
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim();
    }
    
    // Determine status based on screenshot recency (within last 5 minutes = online)
    let calculatedStatus = 'offline';
    let isRecentlyActive = false;
    let minutesSinceLastScreenshot = null;
    
    if (user.latest_screenshot?.timestamp) {
      const screenshotDate = new Date(user.latest_screenshot.timestamp);
      const now = new Date();
      const timeDiffMs = now - screenshotDate;
      const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));
      minutesSinceLastScreenshot = timeDiffMinutes;
      
      if (timeDiffMinutes <= 5) {
        calculatedStatus = 'online';
        isRecentlyActive = true;
      } else if (timeDiffMinutes <= 15) {
        calculatedStatus = 'idle';
      } else {
        calculatedStatus = 'offline';
      }
      
      console.log(`📊 Status calculation for ${user.display_name}: ${timeDiffMinutes} minutes ago = ${calculatedStatus}`);
    } else {
      console.log(`⚠️ No screenshot timestamp for ${user.display_name}, defaulting to offline`);
    }
    
    return {
      id: user.id || user.user_id || user.email || index,
      task: taskName,
      time: `${formattedDate} ${formattedTime}`,
      screenshot: getImageUrl(user.latest_screenshot?.url || user.latest_screenshot?.image_url || user.latest_screenshot?.image_path),
      status: calculatedStatus,
      originalStatus: (user.status || (user.is_online ? 'online' : 'offline')).toLowerCase(),
      minutesSinceLastScreenshot: minutesSinceLastScreenshot,
      employee: user.display_name || user.name || user.username || 'Unknown Employee',
      email: user.email || '',
      department: user.department || 'Unknown Department',
      duration: user.duration || 'N/A',
      productivity: user.productivity_score || user.productivity || 'N/A',
      taskPriority: user.task_priority || 'Normal',
      location: user.location || 'Unknown Location',
      lastActivity: user.last_activity_time ? new Date(user.last_activity_time).toLocaleString() : 'Unknown',
      screenshotsCount: user.screenshots_count || 0,
      isActive: isRecentlyActive, // Based on screenshot recency instead of API status
      profileImage: user.profile_image || user.avatar,
      project: user.current_project || 'No Project',
      hasScreenshot: user.latest_screenshot?.has_screenshot || false,
      screenshotSize: user.latest_screenshot?.file_size || null,
      screenshotFilename: user.latest_screenshot?.filename || null,
      fullDate: formattedDate,
      timeOnly: formattedTime
    };
  };

  // Employee list for filter dropdown - dynamically populated from API data
  const employees = React.useMemo(() => {
    const baseEmployees = [{ id: 'all', name: t('allEmployees') || 'All Employees' }];
    
    if (liveTrackingData.length > 0) {
      const uniqueEmployees = liveTrackingData.reduce((acc, user) => {
        const employeeName = user.display_name || user.name || user.username || 'Unknown Employee';
        const employeeId = user.email || user.username || user.id || employeeName.toLowerCase().replace(/\s+/g, '_');
        
        // Check if employee already exists in the accumulator
        if (!acc.find(emp => emp.id === employeeId)) {
          acc.push({
            id: employeeId,
            name: employeeName,
            email: user.email,
            status: user.status || (user.is_online ? 'online' : 'offline')
          });
        }
        
        return acc;
      }, []);
      
      // Sort employees alphabetically by name
      uniqueEmployees.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`👥 Generated employee list: ${uniqueEmployees.length} employees from API data`);
      uniqueEmployees.forEach((emp, index) => {
        console.log(`  ${index + 1}. ${emp.name} (${emp.email || 'no email'}) - ${emp.status}`);
      });
      
      return [...baseEmployees, ...uniqueEmployees];
    }
    
    return baseEmployees;
  }, [liveTrackingData, t]);

  const departments = [
    { id: 'all', name: t('allDepartments') },
    { id: 'dev', name: t('development') },
    { id: 'design', name: t('design') },
    { id: 'marketing', name: t('marketing') }
  ];

  // Filter data based on current filters - now using real API data
  const filteredScreenshots = liveTrackingData.length > 0 
    ? liveTrackingData.map((user, index) => formatTrackingData(user, index))
    : [];

  const totalPages = Math.ceil(filteredScreenshots.length / itemsPerPage);
  
  // Apply pagination to the filtered results
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = filteredScreenshots.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedEmployee, dateRange, itemsPerPage]);

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <DashboardLayout headerTitle={t('liveTracking')} headerBreadcrumb={`${t('home')} / ${t('liveTracking')}`}>
      <LiveTrackingContainer>
        <Container>
          <ContentSection>
            <TrackingCard>
              <CardHeader>
                <Title>
                  📍 {t('realTimeActivityStream')}
                  <span style={{ fontSize: '14px', opacity: 0.7 }}>ⓘ</span>
                </Title>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  background: '#f8fafc',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  🟢 Online (≤5min) | 🟡 Idle (≤15min) | 🔴 Offline ({'>'}15min)
                </div>
              </CardHeader>

              <ActivityInfo>
                <InfoItem>
                  <div className="icon">👥</div>
                  <div className="label">{t('totalActive')}</div>
                  <div className="value">{activityStats.totalActive}</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🟢</div>
                  <div className="label">{t('online')}</div>
                  <div className="value">{activityStats.online}</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🟡</div>
                  <div className="label">{t('idle')}</div>
                  <div className="value">{activityStats.idle}</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">🔴</div>
                  <div className="label">{t('offline')}</div>
                  <div className="value">{activityStats.offline}</div>
                </InfoItem>
                <InfoItem>
                  <div className="icon">⏰</div>
                  <div className="label">{t('totalHours')}</div>
                  <div className="value">{activityStats.totalHours}</div>
                </InfoItem>
              </ActivityInfo>

              <FilterSection>
                <LeftFilters>
                  <FilterDropdown 
                    value={selectedEmployee} 
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    style={{
                      background: selectedEmployee !== 'all' ? '#f0f9ff' : undefined,
                      fontWeight: selectedEmployee !== 'all' ? '600' : 'normal'
                    }}
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.id === 'all' ? emp.name : `${emp.name}${emp.email ? ` (${emp.email})` : ''}`}
                      </option>
                    ))}
                  </FilterDropdown>

                  <FilterDropdown 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{
                      background: dateRange !== 'today' ? '#fef3c7' : undefined,
                      fontWeight: dateRange !== 'today' ? '600' : 'normal'
                    }}
                  >
                    <option value="today">{t('today') || 'Today'}</option>
                    <option value="this_week">{t('thisWeek') || 'This Week'}</option>
                    <option value="this_month">{t('thisMonth') || 'This Month'}</option>
                    <option value="this_year">This Year</option>
                  </FilterDropdown>

                  <FilterDropdown 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing items per page
                    }}
                    style={{
                      background: itemsPerPage !== 6 ? '#f0fdf4' : undefined,
                      fontWeight: itemsPerPage !== 6 ? '600' : 'normal',
                      color: itemsPerPage !== 6 ? '#166534' : undefined
                    }}
                  >
                    <option value={6}>6 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                    <option value={150}>150 per page</option>
                    <option value={200}>200 per page</option>
                    <option value={300}>300 per page</option>
                  </FilterDropdown>

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <SearchInput
                      type="text"
                      placeholder={t('searchEmployees') || 'Search employees...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: searchQuery ? '#fef3c7' : undefined,
                        fontWeight: searchQuery ? '600' : 'normal',
                        paddingRight: searchQuery ? '35px' : '12px'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#6b7280',
                          padding: '2px'
                        }}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </LeftFilters>

                <RightFilters>
                  <RefreshButton 
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={16} style={{ color: 'white' }} />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        🔄 Refresh
                      </>
                    )}
                  </RefreshButton>
                  
                  <ExportButton>
                    📊 Export
                  </ExportButton>
                </RightFilters>
           
              </FilterSection>

              {/* Results Info */}
              <ResultsInfo>
                <div>
                  Showing {filteredScreenshots.length} employee{filteredScreenshots.length !== 1 ? 's' : ''} 
                  {' for '} {getDateRangeDescription()}
                  {searchQuery && (
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      marginLeft: '8px'
                    }}>
                      matching "{searchQuery}"
                    </span>
                  )}
                  {dateRange !== 'today' && (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                      {' '}(filtered by date)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                  {loading && (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      🔄 Refreshing...
                    </span>
                  )}
                </div>
              </ResultsInfo>

              {/* Debug Panel - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '16px 0',
                  fontSize: '12px',
                  color: '#64748b'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>🔧 Debug Info:</div>
                  <div>Date Range: {dateRange} | API Params: {JSON.stringify(getDateRangeParams())}</div>
                  <div>Search Query: "{searchQuery}" | Selected Employee: {selectedEmployee}</div>
                  <div>Raw API Results: {liveTrackingData.length} users | Final Display: {filteredScreenshots.length}</div>
                  <div>Current Page: {currentPage} | Items per page: {itemsPerPage} | Showing: {displayedItems.length}</div>
                  {searchQuery && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#fef3c7', borderRadius: '4px', color: '#92400e' }}>
                      <strong>Search Active:</strong> Filtering for "{searchQuery}" - {filteredScreenshots.length} matches found
                    </div>
                  )}
                </div>
              )}

              {loading && (
                <LoadingContainer>
                  <CircularProgress />
                  <div>🔍 Scanning S3 folders for live tracking data...</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    This may take 30-90 seconds as we scan all user folders
                  </div>
                  {loadingProgress > 0 && (
                    <div style={{ marginTop: '12px', width: '200px' }}>
                      <div style={{ 
                        background: '#e5e7eb', 
                        borderRadius: '4px', 
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          background: '#3b82f6', 
                          height: '100%', 
                          width: `${loadingProgress}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                        {Math.round(loadingProgress)}% - Scanning user folders...
                      </div>
                    </div>
                  )}
                </LoadingContainer>
              )}

              {error && (
                <ErrorMessage>
                  {error}
                  <button 
                    onClick={fetchLiveTrackingData} 
                    style={{ marginLeft: '10px', fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    Retry
                  </button>
                </ErrorMessage>
              )}

              {!loading && !error && displayedItems.length === 0 && (
                <NoDataMessage>
                  No live tracking data found
                  <br />
                  <small>Try adjusting your filters or check if users have recent screenshots in the API</small>
                </NoDataMessage>
              )}

              <ResultsInfo>
                <span>
                  {t('showing')} {displayedItems.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}-{Math.min(currentPage * itemsPerPage, filteredScreenshots.length)} {t('of')} {filteredScreenshots.length} {t('results')}
                </span>
                <span>{displayedItems.length} {t('itemsOnThisPage')}</span>
              </ResultsInfo>

              <ScreenshotGrid>
                {displayedItems.map((item) => (
                  <ScreenshotCard key={item.id}>
                    <ScreenshotImage>
                        {item.hasScreenshot && item.screenshot && item.screenshot !== `Screenshot ${item.id}` ? (
                          <img 
                            src={item.screenshot} 
                            alt={item.task}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                            referrerPolicy="no-referrer"
                            onClick={() => {
                              console.log('🖼️ Image clicked:', item.screenshot);
                              openImageModal(item.screenshot, `${item.employee} - ${item.task}`);
                            }}
                            onLoad={(e) => {
                              console.log('✅ Image loaded successfully:', item.screenshot);
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load:', item.screenshot);
                              console.error('Error details:', e);
                              e.target.style.display = 'none';
                              
                              // Create a fallback div
                              const fallbackDiv = document.createElement('div');
                              fallbackDiv.style.cssText = `
                                display: flex; 
                                flex-direction: column; 
                                align-items: center; 
                                justify-content: center; 
                                height: 100%; 
                                background: #fef2f2; 
                                color: #dc2626;
                                padding: 8px;
                                text-align: center;
                              `;
                              fallbackDiv.innerHTML = `
                                <div style="font-size: 24px; margin-bottom: 8px;">�</div>
                                <div style="font-size: 10px; opacity: 0.8; margin-bottom: 4px;">Image Load Error</div>
                                <div style="font-size: 8px; opacity: 0.6; word-break: break-all;">
                                  ${item.screenshot.length > 50 ? item.screenshot.substring(0, 50) + '...' : item.screenshot}
                                </div>
                              `;
                              
                              // Replace the image with the fallback
                              if (e.target.parentElement) {
                                e.target.parentElement.appendChild(fallbackDiv);
                              }
                            }}
                          />
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            background: '#f3f4f6',
                            color: '#6b7280',
                            padding: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                              {item.hasScreenshot === false ? 'No Screenshot Available' : 'Loading...'}
                            </div>
                            {item.screenshot && (
                              <div style={{ fontSize: '8px', opacity: 0.5, wordBreak: 'break-all' }}>
                                {item.screenshot.length > 40 ? item.screenshot.substring(0, 40) + '...' : item.screenshot}
                              </div>
                            )}
                          </div>
                        )}
                      </ScreenshotImage>
                    
                    {/* Image URL below the screenshot */}
                    {item.screenshot && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#3b82f6',
                        padding: '8px 0 4px 0',
                        borderBottom: '1px solid #e5e7eb',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        wordBreak: 'break-all',
                        lineHeight: '1.3',
                        background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '4px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        fontWeight: '500',
                        border: '1px solid #bfdbfe',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => {
                        console.log('🔗 Image URL:', item.screenshot);
                        window.open(item.screenshot, '_blank');
                      }}
                      title="Click to open image in new tab"
                      >
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#1d4ed8',
                          fontWeight: 'bold'
                        }}>➤</span>
                        <span style={{ 
                          background: 'linear-gradient(90deg, #1d4ed8, #2563eb)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '600'
                        }}>🔗 {item.screenshot}</span>
                        <span style={{ 
                          fontSize: '8px', 
                          color: '#6366f1',
                          marginLeft: 'auto',
                          opacity: 0.8
                        }}>↗</span>
                      </div>
                    )}
                    
                    <CardContent>
                      <TaskHeader>
                        <TaskName>{item.task}</TaskName>
                        <StatusBadge status={item.status}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </StatusBadge>
                      </TaskHeader>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.profileImage ? (
                          <img 
                            src={item.profileImage} 
                            alt={item.employee}
                            style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                          />
                        ) : (
                          <span>👤</span>
                        )}
                        {item.employee}
                        {item.isActive && <span style={{ color: '#10b981', fontSize: '10px' }}>●</span>}
                      </div>
                      {item.email && (
                        <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>
                          📧 {item.email}
                        </div>
                      )}
                      {item.minutesSinceLastScreenshot !== null && (
                        <div style={{ 
                          fontSize: '10px', 
                          marginBottom: '4px',
                          color: item.minutesSinceLastScreenshot <= 5 ? '#10b981' : 
                                item.minutesSinceLastScreenshot <= 15 ? '#f59e0b' : '#ef4444',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{ fontSize: '8px' }}>
                            {item.minutesSinceLastScreenshot <= 5 ? '🟢' : 
                             item.minutesSinceLastScreenshot <= 15 ? '🟡' : '🔴'}
                          </span>
                          Last seen: {formatTimeAgo(item.minutesSinceLastScreenshot)}
                        </div>
                      )}
                      {item.duration && item.duration !== 'N/A' && (
                        <div style={{ fontSize: '11px', color: '#6366f1', marginBottom: '4px' }}>
                          ⏱️ Working Time: {item.duration}
                        </div>
                      )}
                      {item.productivity && item.productivity !== 'N/A' && (
                        <div style={{ fontSize: '11px', color: '#059669', marginBottom: '4px' }}>
                          📊 Efficiency: {item.productivity}
                        </div>
                      )}
                      {item.screenshotsCount > 0 && (
                        <div style={{ fontSize: '10px', color: '#8b5cf6', marginBottom: '4px' }}>
                          📷 {item.screenshotsCount} screenshots
                        </div>
                      )}
                      {item.screenshotFilename && (
                        <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '4px', opacity: 0.8 }}>
                          📁 {item.screenshotFilename}
                        </div>
                      )}
                      {item.screenshotSize && (
                        <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '4px', opacity: 0.8 }}>
                          📊 {(item.screenshotSize / 1024).toFixed(1)} KB
                        </div>
                      )}
                      {item.taskPriority && (
                        <div style={{ 
                          fontSize: '10px', 
                          marginBottom: '4px',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          backgroundColor: item.taskPriority.toLowerCase() === 'high' ? '#fef2f2' : 
                                         item.taskPriority.toLowerCase() === 'medium' ? '#fef3c7' : '#f0f9ff',
                          color: item.taskPriority.toLowerCase() === 'high' ? '#dc2626' : 
                                item.taskPriority.toLowerCase() === 'medium' ? '#d97706' : '#0369a1',
                          fontWeight: '500'
                        }}>
                          🎯 {item.taskPriority} Priority
                        </div>
                      )}
                      {item.location && item.location !== 'Unknown Location' && (
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>
                          📍 {item.location}
                        </div>
                      )}
                      {item.lastActivity && item.lastActivity !== 'Unknown' && (
                        <div style={{ fontSize: '10px', color: '#f59e0b', marginBottom: '4px' }}>
                          🔄 Last active: {item.lastActivity}
                        </div>
                      )}
                      <TaskMeta>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <TaskTime>📅 {item.fullDate}</TaskTime>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            ⏱️ {item.timeOnly}
                          </div>
                        </div>
                        {item.status && (
                          <StatusBadge status={item.status} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </StatusBadge>
                        )}
                      </TaskMeta>
                    </CardContent>
                  </ScreenshotCard>
                ))}
              </ScreenshotGrid>

              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← {t('previous')}
                  </PaginationButton>

                  {generatePageNumbers().map((page, index) => (
                    <PaginationButton
                      key={index}
                      active={page === currentPage}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                    >
                      {page}
                    </PaginationButton>
                  ))}

                  <PaginationButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t('next')} →
                  </PaginationButton>

                  <PaginationInfo>
                    {t('page')} {currentPage} {t('of')} {totalPages}
                  </PaginationInfo>
                </PaginationContainer>
              )}
            </TrackingCard>
          </ContentSection>
        </Container>
      </LiveTrackingContainer>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        images={currentImages}
        currentIndex={currentImageIndex}
        onClose={closeImageModal}
        onNavigate={setCurrentImageIndex}
      />
    </DashboardLayout>
  );
};

export default LiveTracking;
