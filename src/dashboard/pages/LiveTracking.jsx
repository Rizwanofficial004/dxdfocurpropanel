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
      console.log('🔍 Testing S3 connection...');
      const result = await liveTrackingService.testS3Connection();
      console.log('✅ S3 Test Response:', result);
      return result;
    } catch (error) {
      console.error('❌ S3 Connection Test Failed:', error);
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
      
      console.log('Live tracking API response:', response);
      console.log('📊 API response structure:', {
        hasData: !!response?.data,
        hasUsers: !!response?.data?.s3_users_sample,
        userCount: response?.data?.s3_users_sample?.length || 0,
        totalSize: response?.data?.total_size_mb || 0
      });
      setApiData(response);
      
      // Parse screenshots using the service
      const screenshots = liveTrackingService.parseScreenshots(response);
      
      // Log summary statistics
      const summary = liveTrackingService.getSummary(response);
      console.log('� Live Tracking Summary:', summary);
      
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
      console.error('❌ Error fetching live tracking data:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      
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
      
      // Log performance metrics for debugging
      console.log('📊 Performance metrics:', {
        retryCount,
        error: err.message,
        duration: Date.now() - startTime + 'ms'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter screenshots based on search query
  useEffect(() => {
    if (!allScreenshots.length) {
      setFilteredScreenshots([]);
      return;
    }

    let filtered = allScreenshots;
    
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(screenshot => 
        screenshot.user_email?.toLowerCase().includes(searchLower) ||
        screenshot.filename?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredScreenshots(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, allScreenshots]);

  // Load data on component mount
  useEffect(() => {
    fetchLiveTrackingData();
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
    
    console.log('🚀 Opening modal with live tracking images:', modalImageData);
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

  // Get random status for demo (you can replace with actual data from API)
  const getEmployeeStatus = (index) => {
    const statuses = ['BREAK', 'MEETING', 'IDLE', 'ACTIVE'];
    return statuses[index % 4];
  };

  // Get employee team (you can replace with actual data from API)
  const getEmployeeTeam = (index) => {
    const teams = ['Marketing', 'IT Team,Promotion', 'Auditing Team,Sales & Marketing', 'Auditing Team,Sales'];
    return teams[index % 4];
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
              <h1 className="page-title">LIVE TRACKING</h1>
              <span className="help-icon-circle" ref={helpRef}>
                <button
                  className="help-button"
                  onClick={(e) => { e.stopPropagation(); setShowHelp(prev => !prev); }}
                  aria-expanded={showHelp}
                  aria-label="Live Tracking Help"
                >
                  ?
                </button>
                {showHelp && (
                  <div className="help-popover" role="dialog" aria-label="Live Tracking Help">
                    <p><strong>Live Tracking</strong></p>
                    <p>Access real-time employee status updates and instant insights through easy screenshot viewing.</p>
                    <ul>
                      <li>Select "A specific team or all teams" from the dropdown menu</li>
                      <li>View current date and timer for real-time viewing</li>
                      <li>FocusRO indicates Meeting, Break, or Idle status</li>
                      <li>Click employee name for detailed report</li>
                      <li>Click screenshot to enlarge</li>
                    </ul>
                  </div>
                )}
              </span>
            </div>

            {/* Center: Team Filter */}
            <div className="header-center-section">
              <div className="team-filter">
                <label htmlFor="team-select">Choose a team</label>
                <select 
                  id="team-select" 
                  className="team-dropdown"
                  defaultValue="all"
                >
                  <option value="all">All Teams</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales & Marketing</option>
                  <option value="auditing">Auditing Team</option>
                  <option value="it">IT Team</option>
                </select>
              </div>
            </div>

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
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading screenshots data...</p>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  Processing {apiData?.data?.summary?.s3_files || '11,000+'} files across {apiData?.data?.summary?.s3_users || '5'} users...
                  <br />
                  This may take 30-60 seconds for large datasets.
                </div>
              </div>
            )}

            {error && (
              <div className="error-container">
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <p>{error}</p>
                  <button onClick={fetchLiveTrackingData} className="retry-button">
                    Retry
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
                <p className="no-data-text">No users data available</p>
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
                    const status = getEmployeeStatus(index);
                    const team = getEmployeeTeam(index);
                    
                    return (
                    <div
                      key={`${screenshot.user_email}-${screenshot.filename}-${index}`}
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
                        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                        e.currentTarget.style.boxShadow = isDark ? '0 8px 24px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                        e.currentTarget.style.boxShadow = isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }}
                      onClick={() => {
                        // Open image modal with all current screenshots
                        const actualIndex = startIndex + index;
                        openImageModal(filteredScreenshots, actualIndex);
                      }}
                    >
                      <style jsx>{`
                        [data-theme="dark"] .screenshot-card {
                          background-color: #1d232c !important;
                          border-color: #6b7280 !important;
                          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                        }
                      `}</style>
                      
                      {/* Card Header with User Info and Time */}
                      <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e1e5e9',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#f8f9fa',
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
                            backgroundColor: '#4285f4',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {formatUserEmail(screenshot.user_email).charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#202124',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer'
                            }}
                            title="Click for detailed employee report"
                            >
                              {formatUserEmail(screenshot.user_email).split('@')[0]}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#9ca3af' : '#5f6368'
                            }}>
                              {team}
                            </div>
                          </div>
                        </div>
                        {/* Right: Time */}
                        <div style={{
                          fontSize: '11px',
                          color: '#5f6368',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #e1e5e9',
                          fontWeight: '500'
                        }}>
                          <span>⏱️</span>
                          <span>{new Date(screenshot.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                        </div>
                      </div>

                      {/* Status Display Area - replaces screenshot */}
                      <div style={{
                        width: '100%',
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: status === 'BREAK' ? '#fbbf24' : 
                                       status === 'MEETING' ? '#3b82f6' : 
                                       status === 'IDLE' ? '#6b7280' : '#10b981'
                      }}>
                        {/* Status Icon and Text */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          textAlign: 'center'
                        }}>
                          {status === 'BREAK' && (
                            <>
                              <div style={{ fontSize: '64px', marginBottom: '16px' }}>☕</div>
                              <div style={{ fontSize: '24px', fontWeight: '700' }}>Break</div>
                            </>
                          )}
                          {status === 'MEETING' && (
                            <>
                              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
                              <div style={{ fontSize: '24px', fontWeight: '700' }}>Meeting</div>
                            </>
                          )}
                          {status === 'IDLE' && (
                            <>
                              <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>Idle</div>
                            </>
                          )}
                          {status === 'ACTIVE' && (
                            <>
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
                            </>
                          )}
                        </div>
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
                    borderTop: document.documentElement.getAttribute('data-theme') === 'dark' ? '1px solid #6b7280' : '1px solid #e1e5e9',
                    marginTop: '20px'
                  }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === 1 ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#374151' : '#f8f9fa') : '#4285f4',
                        color: currentPage === 1 ? '#9ca3af' : 'white',
                        border: document.documentElement.getAttribute('data-theme') === 'dark' ? '1px solid #6b7280' : '1px solid #e1e5e9',
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
                              backgroundColor: currentPage === pageNumber ? '#4285f4' : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#1d232c' : 'white'),
                              color: currentPage === pageNumber ? 'white' : (document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#202124'),
                              border: document.documentElement.getAttribute('data-theme') === 'dark' ? '1px solid #6b7280' : '1px solid #e1e5e9',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: currentPage === pageNumber ? '600' : '400',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (currentPage !== pageNumber) {
                                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                                e.target.style.backgroundColor = isDark ? '#374151' : '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (currentPage !== pageNumber) { 
                                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
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
                        backgroundColor: currentPage === totalPages ? (document.documentElement.getAttribute('data-theme') === 'dark' ? '#374151' : '#f8f9fa') : '#4285f4',
                        color: currentPage === totalPages ? '#9ca3af' : 'white',
                        border: document.documentElement.getAttribute('data-theme') === 'dark' ? '1px solid #6b7280' : '1px solid #e1e5e9',
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
          theme="light"
          isDarkMode={false}
        />
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
