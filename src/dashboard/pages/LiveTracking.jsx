import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import './LiveTracking.css';

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

  // API URL configuration (same as QuickView)
  const getApiUrl = () => {
    // In development, use localhost with the proxy
    if (import.meta.env.DEV) {
      return 'http://localhost:5174/api';
    }
    // In production, use full URL
    return 'https://dxdtime.ddsolutions.io/api';
  };

  // Fetch data from live tracking API
  const fetchLiveTrackingData = async (showRetryMessage = false) => {
    try {
      setLoading(true);
      setError('');
      if (showRetryMessage) {
        setRetryCount(prev => prev + 1);
      }
      
      // Use the same API configuration as QuickView
      const apiBaseUrl = getApiUrl();
      const apiUrl = `${apiBaseUrl}/live-tracking/fast-screenshots/`;
      console.log('🔄 Fetching live tracking data from:', apiUrl);
      console.log('🌐 Environment:', import.meta.env.DEV ? 'Development (using proxy)' : 'Production (direct)');
      
      const response = await axios.get(apiUrl, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: false
      });
      
      console.log('Live tracking API response:', response.data);
      setApiData(response.data);
      
      if (response.data && response.data.data && response.data.data.s3_users_sample) {
        // Create one screenshot entry per user using their latest screenshot
        const screenshots = [];
        console.log('🔍 Raw API data:', response.data.data.s3_users_sample);
        
        response.data.data.s3_users_sample.forEach(user => {
          // Get the direct_url from the screenshots array
          let screenshotUrl = null;
          let fallbackUrl = null;
          let latestScreenshot = null;
          
          // Find the most recent screenshot with direct_url
          if (user.screenshots && Array.isArray(user.screenshots) && user.screenshots.length > 0) {
            // Sort screenshots by last_modified (newest first)
            const sortedScreenshots = user.screenshots.sort((a, b) => 
              new Date(b.last_modified) - new Date(a.last_modified)
            );
            
            latestScreenshot = sortedScreenshots[0];
            screenshotUrl = latestScreenshot.direct_url;
            fallbackUrl = latestScreenshot.file_url;
          }
          
          // Fallback to user-level URLs if no screenshots found
          if (!screenshotUrl) {
            screenshotUrl = user.direct_file_url || user.latest_file_url;
            fallbackUrl = user.latest_file_url || user.direct_file_url;
          }
          
          console.log('📸 Processing user:', user.user_email);
          console.log('📋 Screenshot direct_url:', latestScreenshot?.direct_url);
          console.log('📋 Using URL:', screenshotUrl);
          
          // Test if the URL looks correct
          if (screenshotUrl && screenshotUrl.includes('ddsfocustime.s3.eu-north-1.amazonaws.com')) {
            console.log('✅ URL format looks correct for:', user.user_email);
          } else {
            console.warn('⚠️ Unexpected URL format for:', user.user_email, screenshotUrl);
          }
          
          screenshots.push({
            user_email: user.user_email,
            screenshot_url: screenshotUrl,
            fallback_url: fallbackUrl,
            filename: latestScreenshot?.filename || user.latest_file,
            timestamp: new Date(latestScreenshot?.last_modified || user.latest_date).toISOString(),
            activity_type: 'ACTIVE',
            size_mb: latestScreenshot?.file_size_mb || user.total_size_mb,
            file_count: user.file_count,
            days_active: user.days_active,
            latest_date: user.latest_date
          });
        });
        
        // Sort screenshots by timestamp (newest first)
        screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAllScreenshots(screenshots);
        setFilteredScreenshots(screenshots);
        setImageErrors(new Set());
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
        setError('⏰ Request timeout. The API might be taking longer than expected.');
      } else if (err.response) {
        setError(`🚫 Server error: ${err.response.status} - ${err.response.data?.message || 'Failed to fetch data'}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('🌐 Network error: Unable to connect to the API. Please check your internet connection.');
      } else if (err.code === 'ERR_BLOCKED_BY_CLIENT') {
        setError('🛡️ Request blocked by ad blocker or browser security. Please disable ad blockers for this site.');
      } else {
        setError(`❌ Network error: Unable to connect to the API. ${err.message}`);
      }
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

  return (
    <DashboardLayout>
      <div className="live-tracking-page">
        {/* Live Tracking Card */}
        <div className="live-tracking-card">
          {/* Top Notification Banner */}
          <div className="notification-banner">
            <div className="notification-content">
              <span>Your user profile has been successfully created.</span>
              <span>
                You can now download the client app from{' '}
                <a href="https://focusro.com/download" className="download-link">
                  https://focusro.com/download
                </a>{' '}
                and log in with your password to explore the features.
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="card-header">
            <div className="header-left">
              <h1 className="live-tracking-title">
                LIVE TRACKING - SCREENSHOTS {apiData?.data?.total_employees?.icon}
                <span className="help-icon" ref={helpRef}>
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
                      <p>{t('liveTrackingHelpShort')}</p>
                    </div>
                  )}
                </span>
              </h1>
            </div>
            <div className="header-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search user or filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="user-search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <button 
                onClick={() => fetchLiveTrackingData(true)}
                disabled={loading}
                className="refresh-button"
                title="Refresh data to get new image URLs"
              >
                {loading ? '🔄' : '↻'} Refresh URLs {retryCount > 0 ? `(${retryCount})` : ''}
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {apiData && apiData.data && (
            <div className="stats-section">
              <div className="stats-grid">
                {/* Metrics Cards (exclude 'S3 Users' label) */}
                {Array.isArray(apiData.data.metrics) && apiData.data.metrics
                  .filter(metric => metric.label !== 'S3 Users')
                  .map((metric, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-content">
                        <h3>{metric.value}</h3>
                        <p>{metric.label}</p>
                      </div>
                    </div>
                ))}
              </div>

              {/* Data Sources Info */}
              <div className="data-sources">
                <div className="source-item">
                  <span className="source-label">S3 Status:</span>
                  <span className={`source-status ${apiData.data.data_sources.s3_status === 'Connected' ? 'connected' : 'disconnected'}`}>
                    {apiData.data.data_sources.s3_status}
                  </span>
                </div>
                <div className="source-item">
                  <span className="source-label">CRM Status:</span>
                  <span className={`source-status ${apiData.data.data_sources.crm_status === 'Connected' ? 'connected' : 'disconnected'}`}>
                    {apiData.data.data_sources.crm_status}
                  </span>
                </div>
                <div className="source-item">
                  <span className="source-label">Last Updated:</span>
                  <span className="source-value">{apiData.data.summary.last_updated}</span>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="content-area">
            {loading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading screenshots data...</p>
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
                {/* Screenshots Header */}
                <div className="screenshots-header">
                  <h3>Live Users ({totalScreenshots} users)</h3>
                  <div className="pagination-info">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalScreenshots)} of {totalScreenshots}
                  </div>
                </div>

                {/* Screenshots Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px',
                  padding: '20px 0'
                }}>
                  {currentScreenshots.map((screenshot, index) => (
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
                        // Open screenshot in new tab
                        if (screenshot.screenshot_url) {
                          window.open(screenshot.screenshot_url, '_blank');
                        }
                      }}
                    >
                      <style jsx>{`
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
                            src={screenshot.screenshot_url}
                            alt={`Screenshot ${screenshot.filename}`}
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
                              console.log('✅ Image loaded successfully for:', screenshot.user_email);
                              console.log('📋 URL:', e.target.src);
                              e.target.style.opacity = '1';
                              // Hide the placeholder when image loads
                              const placeholder = e.target.parentElement.querySelector('div:not([style*="position: absolute"])');
                              if (placeholder && placeholder.querySelector('span')) {
                                placeholder.style.display = 'none';
                              }
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load for:', screenshot.user_email);
                              console.error('📋 Failed URL:', e.target.src);
                              
                              // Try the fallback URL if available and different
                              if (screenshot.fallback_url && e.target.src !== screenshot.fallback_url) {
                                console.log('🔄 Trying fallback URL for:', screenshot.user_email);
                                console.log('📋 Fallback URL:', screenshot.fallback_url);
                                e.target.src = screenshot.fallback_url;
                                return;
                              }
                              
                              // Show error placeholder if all attempts fail
                              console.log('❌ All image loading attempts failed for:', screenshot.user_email);
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('div:not([style*="position: absolute"])');
                              if (placeholder && placeholder.querySelector('span')) {
                                placeholder.style.display = 'flex';
                                placeholder.querySelector('span').textContent = 'Image unavailable';
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
                          display: screenshot.screenshot_url ? 'flex' : 'flex',
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
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                            {screenshot.screenshot_url ? '📸' : '❌'}
                          </div>
                          <span>{screenshot.screenshot_url ? 'Loading...' : 'No Image'}</span>
                          {screenshot.screenshot_url && (
                            <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center', padding: '0 8px' }}>
                              {screenshot.user_email?.split('_at_')[0]}
                            </div>
                          )}
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
                          Latest: {new Date(screenshot.latest_date).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Screenshot Info */}
                      <div style={{ padding: '16px' }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#202124',
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
                          👤 {formatUserEmail(screenshot.user_email)}
                        </div>
                        
                        <div style={{
                          fontSize: '12px',
                          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#9ca3af' : '#5f6368',
                          marginBottom: '8px'
                        }}>
                          📁 {screenshot.file_count} files • 📅 {screenshot.days_active} days active
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#9ca3af' : '#5f6368',
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
                            Latest: {new Date(screenshot.latest_date).toLocaleDateString()}
                          </span>
                          <span style={{ fontWeight: '500' }}>
                            {formatFileSize(screenshot.size_mb || 0)} total
                          </span>
                        </div>
                        
                        {screenshot.filename && (
                          <div style={{
                            fontSize: '10px',
                            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#9ca3af' : '#9ca3af',
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
                <span>Users per page:</span>
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
            </div>
            <div className="pagination-right">
              <span className="page-info">
                {totalScreenshots > 0 ? `${startIndex + 1}-${Math.min(endIndex, totalScreenshots)} of ${totalScreenshots}` : '0 of 0'}
              </span>
              <div className="pagination-nav">
                <button 
                  className="nav-button" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  ‹
                </button>
                <span className="page-number">{currentPage} / {totalPages || 1}</span>
                <button 
                  className="nav-button" 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
