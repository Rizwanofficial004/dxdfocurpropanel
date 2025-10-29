import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import { getApiBaseURL } from '../../config/api';
import ImageModal from '../components/common/ImageModal';
import axios from 'axios';
import './LiveTracking.css';
import { removeRedBorders } from '../../utils/removeDebugStyles';
import { testUserAPIs } from '../../utils/userAPIDebugger';
import liveTrackingService from '../../services/liveTrackingService';

const LiveTracking = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  
  // API data states
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allScreenshots, setAllScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef(null);
  
  // Staff data from API
  const [staffData, setStaffData] = useState([]);
  const [staffMap, setStaffMap] = useState(new Map());
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('all');

  // Image Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Remove any red debugging borders on component mount and updates
  useEffect(() => {
    const timer = setTimeout(() => {
      removeRedBorders();
    }, 100);
    return () => clearTimeout(timer);
  }, [apiData]); // Run when apiData changes

  // Helper function to build API URL
  const buildApiUrl = (params = {}) => {
    const baseUrl = `${getApiBaseURL()}/live-tracking/fast-screenshots/`;
    if (Object.keys(params).length === 0) return baseUrl;
    
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        urlParams.append(key, value);
      }
    });
    
    return `${baseUrl}?${urlParams.toString()}`;
  };

  // Test S3 connection and AWS credentials
  const testS3Connection = async () => {
    try {
      const result = await liveTrackingService.testS3Connection();
      return result;
    } catch (error) {
      return null;
    }
  };

  // Fetch data from live tracking API
  const fetchLiveTrackingData = async (showRetryMessage = false) => {
    const startTime = Date.now(); // Add performance timing
    try {
      setLoading(true);
      setError('');
      if (showRetryMessage) {
        setRetryCount(prev => prev + 1);
      }
      
      // Use the new live tracking service
      const response = await liveTrackingService.getScreenshots({
        limit_screenshots: 10, // Get more screenshots for better data
        include_metadata_only: false,
        sort_by: 'latest_date',
        order: 'desc',
        aws_region: 'eu-north-1',
        bucket_name: 'ddsfocustime',
        force_refresh: true, // Force fresh data from S3
        timeout: 90000 // Increase timeout to 90 seconds for S3 operations
      });
      
      setApiData(response);
      
      // Parse screenshots using the service
      const screenshots = liveTrackingService.parseScreenshots(response);
      
      // Log summary statistics
      const summary = liveTrackingService.getSummary(response);
      
      if (screenshots.length > 0) {
        // Convert parsed screenshots to component format
        const formattedScreenshots = screenshots.map(screenshot => ({
          user_email: screenshot.email,
          screenshot_url: screenshot.url,
          fallback_url: screenshot.fallbackUrl,
          filename: screenshot.fileName,
          timestamp: screenshot.timestamp,
          activity_type: 'ACTIVE',
          size_mb: screenshot.fileSize,
          file_count: screenshot.metadata.totalFiles,
          days_active: 1,
          latest_date: screenshot.metadata.latestFileDate
        }));
        
        // Sort screenshots by timestamp (newest first)
        formattedScreenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAllScreenshots(formattedScreenshots);
        setFilteredScreenshots(formattedScreenshots);
        setImageErrors(new Set());
      } else {
        setAllScreenshots([]);
        setFilteredScreenshots([]);
      }
      
    } catch (err) {
      
      if (err.code === 'ECONNABORTED') {
        setError('⏰ Request timeout (90s). The S3 API is processing a large dataset. Please try again or contact support if this persists.');
      } else if (err.response) {
        const errorMsg = err.response.data?.message || 'Failed to fetch data';
        if (err.response.status === 403) {
          setError(`� S3 Access Denied (403): Check AWS credentials for bucket 'ddsfocustime' in region 'eu-north-1'. ${errorMsg}`);
        } else if (err.response.status === 404) {
          setError(`🗄️ S3 Bucket Not Found (404): Bucket 'ddsfocustime' may not exist or be accessible. ${errorMsg}`);
        } else if (err.response.status === 500) {
          setError(`⚠️ Server Error (500): S3 service may be experiencing issues. ${errorMsg}`);
        } else {
          setError(`🚫 Server error: ${err.response.status} - ${errorMsg}`);
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('🌐 Network error: Unable to connect to the API. Please check your internet connection and ensure the API server is running on localhost:8000.');
      } else if (err.code === 'ERR_BLOCKED_BY_CLIENT') {
        setError('🛡️ Request blocked by ad blocker or browser security. Please disable ad blockers for this site.');
      } else {
        setError(`❌ Network error: Unable to connect to the API. ${err.message}`);
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Filter screenshots based on search query and team filter
  useEffect(() => {
    if (!allScreenshots.length) {
      setFilteredScreenshots([]);
      return;
    }

    let filtered = allScreenshots;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(screenshot => {
        const employeeInfo = getEmployeeInfo(screenshot.user_email);
        return (
          screenshot.user_email?.toLowerCase().includes(searchLower) ||
          screenshot.filename?.toLowerCase().includes(searchLower) ||
          employeeInfo.fullName.toLowerCase().includes(searchLower) ||
          employeeInfo.team.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filter by selected team
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(screenshot => {
        const employeeInfo = getEmployeeInfo(screenshot.user_email);
        return employeeInfo.team === selectedTeam;
      });
    }
    
    setFilteredScreenshots(filtered);
    setCurrentPage(1); // Reset to first page when searching or filtering
  }, [searchQuery, allScreenshots, selectedTeam, staffMap]);

  // Load data on component mount
  useEffect(() => {
    // Fetch both staff data and screenshots
    const initializeData = async () => {
      await Promise.all([
        fetchStaffData(),
        fetchLiveTrackingData()
      ]);
    };
    
    initializeData();
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

  // Modal functions
  const openImageModal = (screenshots, initialIndex = 0) => {
    const modalImageData = screenshots.map((screenshot, index) => ({
      id: screenshot.id || index,
      src: screenshot.screenshot_url,
      fallbackSrc: screenshot.fallback_url,
      alt: `Screenshot ${index + 1} - ${screenshot.user_email || 'Unknown User'}`,
      title: `${screenshot.user_email || 'Unknown User'} - ${screenshot.filename || 'Live Screenshot'}`,
      downloadUrl: screenshot.screenshot_url,
      metadata: {
        user: screenshot.user_email,
        filename: screenshot.filename,
        timestamp: screenshot.timestamp || new Date().toISOString()
      }
    }));
    
    setModalImages(modalImageData);
    setCurrentImageIndex(initialIndex);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  // Calculate pagination
  const totalScreenshots = filteredScreenshots.length;
  const totalPages = Math.ceil(totalScreenshots / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScreenshots = filteredScreenshots.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Format file size
  const formatFileSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Format user email for display
  const formatUserEmail = (email) => {
    return email?.replace('_at_', '@') || 'Unknown User';
  };

  // Fetch staff data from API
  const fetchStaffData = async () => {
    try {
      const response = await liveTrackingService.getStaffs();
      
      // Try different response structures
      let staffArray = [];
      
      if (response?.data && Array.isArray(response.data)) {
        staffArray = response.data;
      } else if (response?.count && response?.data) {
        // Response has count and data array
        staffArray = response.data;
      } else if (Array.isArray(response)) {
        staffArray = response;
      }
      
      if (staffArray.length > 0) {
        setStaffData(staffArray);
        
        // Job position mapping (ID to name)
        const jobPositionMap = {
          '1': 'Management',
          '2': 'Development',
          '3': 'Design',
          '4': 'Marketing',
          '5': 'Sales',
          '6': 'Support',
          '7': 'HR',
          '8': 'Finance',
          '9': 'Operations',
          '10': 'Quality Assurance',
          '11': 'Product',
          '12': 'Customer Success'
        };
        
        // Create a map for quick lookup by email
        const map = new Map();
        const teamSet = new Set();
        
        staffArray.forEach((staff, index) => {
          const email = staff.email;
          
          // Get team name from job_position ID
          let team = 'No Department';
          if (staff.job_position) {
            team = jobPositionMap[staff.job_position] || `Department ${staff.job_position}`;
          }
          
          if (email) {
            map.set(email.toLowerCase(), {
              fullName: staff.name || 'Unknown',
              team: team,
              designation: team, // Use team as designation
              staffId: staff.staff_id,
              isAdmin: false // We don't have admin info in this API
            });
          }
          
          // Collect unique teams
          if (team && team !== 'No Department') {
            teamSet.add(team);
          }
        });
        
        const teamArray = Array.from(teamSet).sort();
        setStaffMap(map);
        setTeams(teamArray);
      }
    } catch (error) {
      // Error handling without logging
    }
  };

  // Get employee info from staff data by email
  const getEmployeeInfo = (email) => {
    if (!email) return { team: 'Unknown Team', fullName: 'Unknown User' };
    
    const cleanEmail = formatUserEmail(email).toLowerCase();
    const staffInfo = staffMap.get(cleanEmail);
    
    if (staffInfo) {
      return {
        team: staffInfo.team,
        fullName: staffInfo.fullName,
        designation: staffInfo.designation,
        staffId: staffInfo.staffId,
        isAdmin: staffInfo.isAdmin
      };
    }
    
    // Fallback to email username if not found in staff data
    return {
      team: 'Unknown Team',
      fullName: cleanEmail.split('@')[0],
      designation: 'Staff',
      staffId: 'N/A',
      isAdmin: false
    };
  };

  return (
    <DashboardLayout>
      <div className="live-tracking-page" style={{ display: 'flex', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Unified Header - Outside of card */}
          <div className="unified-header">
            {/* Left: Title with Help Icon */}
            <div className="header-left-section">
              <h1 className="page-title">{t('liveTrackingTitle')}</h1>
              <span className="help-icon-circle" ref={helpRef}>
                <button
                  className="help-button"
                  onClick={(e) => { e.stopPropagation(); setShowHelp(prev => !prev); }}
                  aria-expanded={showHelp}
                  aria-label={t('liveTracking')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                </button>
                {showHelp && (
                  <div className="help-popover" role="dialog" aria-label={t('liveTracking')}>
                    <p><strong>{t('liveTracking')}</strong></p>
                    <p>{t('liveTrackingHelp')}</p>
                    <ul>
                      <li>{t('chooseTeam')}</li>
                      <li>{t('viewReport')}</li>
                    </ul>
                  </div>
                )}
              </span>
            </div>

            {/* Center: Team Filter */}

            {/* Right: Date and Time */}
            <div className="header-right-section">
              <div className="date-time-display">
                <div className="date-display">
                  <span className="icon">📅</span>
                  <span>Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
                <div className="time-display">
                  <span className="icon">�</span>
                  <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Tracking Card - Content Area */}
          <div className="live-tracking-card">
          <div className="content-area">
            {loading && (
              <div className="loader-wrap">
                    <div className="loader" style={{width:"30px" , height:"30px"}}></div>
                  </div>
            )}

            {error && (
              <div className="error-container">
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                  <button onClick={fetchLiveTrackingData} className="retry-button">
                    {t('retry')}
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && totalScreenshots === 0 && (
              <div className="no-data-container">
                <div className="no-data-icon">
                  <div className="document-icon">
                    <div className="colored-squares">
                      <div className="square red"></div>
                      <div className="square yellow"></div>
                      <div className="square green"></div>
                      <div className="square blue"></div>
                    </div>
                  </div>
                </div>
                <p className="no-data-text">{t('noUsersDataAvailable')}</p>
              </div>
            )}

            {/* Screenshots Grid */}
            {!loading && !error && currentScreenshots.length > 0 && (
              <>
                {/* Screenshots Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                  padding: '20px 0'
                }}>
                  {currentScreenshots.map((screenshot, index) => {
                    const employeeInfo = getEmployeeInfo(screenshot.user_email);
                    // robust dark-mode detection: supports data-theme="dark" or a dark-theme class on <html> or <body>
                    const isDark = (
                      document.documentElement.getAttribute('data-theme') === 'dark' ||
                      document.documentElement.classList.contains('dark-theme') ||
                      document.body.classList.contains('dark-theme')
                    );
                    
                    return (
                    <div
                      key={`${screenshot.user_email}-${screenshot.filename}-${index}`}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e1e5e9',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                      className="screenshot-card"
                      onClick={() => {
                        // Open image modal with all current screenshots
                        const actualIndex = startIndex + index;
                        openImageModal(filteredScreenshots, actualIndex);
                      }}
                    >
                      {/* CSS-driven dark-mode styling applies from LiveTracking.css;
                          removed inline style block to avoid !important overrides */}
                      
                      {/* Card Header with User Info and Time */}
                      <div style={{
                        padding: '12px 16px',
                        borderBottom: isDark ? '1px solid #6b7280' : '1px solid #e1e5e9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: isDark ? '#1d232c' : '#f8f9fa',
                        transition: 'all 0.3s ease'
                      }}
                      className="card-top-header"
                      >
                        {/* Left: User Avatar and Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: employeeInfo.isAdmin ? '#f59e0b' : (isDark ? '#4f46e5' : '#4285f4'),
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {employeeInfo.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="user-email" style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              marginRight: '10px'
                            }}
                            title={`${employeeInfo.fullName} - ${employeeInfo.designation}`}
                            >
                              {employeeInfo.fullName}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: isDark ? '#ffffff' : '#5f6368'
                            }}>
                              {employeeInfo.team}
                            </div>
                          </div>
                        </div>
                        {/* Right: Time */}
                        <div style={{
                          fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }} className="time-badge">
                          <span>⏱️</span>
                          <span>{new Date(screenshot.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                        </div>
                      </div>

                      {/* Screenshot Display Area */}
                      <div style={{
                        width: '100%',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: '#10b981'
                      }}>
                        <img
                          src={screenshot.screenshot_url}
                          alt="Employee screenshot"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            position: 'absolute',
                            top: 0,
                            left: 0
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '20px 0',
                    borderTop: isDarkMode ? '1px solid #6b7280' : '1px solid #e1e5e9',
                    marginTop: '20px'
                  }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === 1 ? (isDarkMode ? '#374151' : '#f8f9fa') : '#4285f4',
                        color: currentPage === 1 ? '#9ca3af' : 'white',
                        border: isDarkMode ? '1px solid #6b7280' : '1px solid #e1e5e9',
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
                              backgroundColor: currentPage === pageNumber ? '#4285f4' : (isDarkMode ? '#1d232c' : 'white'),
                              color: currentPage === pageNumber ? 'white' : (isDarkMode ? '#fff' : '#202124'),
                              border: isDarkMode ? '1px solid #6b7280' : '1px solid #e1e5e9',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: currentPage === pageNumber ? '600' : '400',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== pageNumber) {
                                const isDark = isDarkMode;
                                e.target.style.backgroundColor = isDark ? '#374151' : '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== pageNumber) { 
                                const isDark = isDarkMode;
                                e.target.style.backgroundColor = isDark ? '#1d232c' : 'white';
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
                        backgroundColor: currentPage === totalPages ? (isDarkMode ? '#374151' : '#f8f9fa') : '#4285f4',
                        color: currentPage === totalPages ? '#9ca3af' : 'white',
                        border: isDarkMode ? '1px solid #6b7280' : '1px solid #e1e5e9',
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
              </>
            )}
          </div>

          {/* Bottom Pagination */}
          <div className="pagination-footer">
            <div className="pagination-left">
              <div className="screens-per-page">
                <span>Items per page:</span>
                <select 
                  className="screens-selector" 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={8}>8</option>
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                </select>
              </div>
              <span className="page-info">
                {totalScreenshots > 0 ? `${startIndex + 1}-${Math.min(endIndex, totalScreenshots)} of ${totalScreenshots}` : '0 of 0'}
              </span>
            </div>
            <div className="pagination-right">
              <div className="pagination-nav">
                <button 
                  className="nav-button" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  title="First page"
                >
                  ‹‹
                </button>
                <button 
                  className="nav-button" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  title="Previous page"
                >
                  ‹
                </button>
                <button 
                  className="nav-button" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  title="Next page"
                >
                  ›
                </button>
                <button 
                  className="nav-button" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev))}
                  title="Last page"
                >
                  ››
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
        
        {/* Image Modal */}
        <ImageModal
          isOpen={isModalOpen}
          images={modalImages}
          currentIndex={currentImageIndex}
          onClose={closeImageModal}
          onIndexChange={(newIndex) => setCurrentImageIndex(newIndex)}
          theme="dark"
          isDarkMode={true}
        />
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
