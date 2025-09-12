import React, { useState, useEffect } from 'react';
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

  // Fetch data from live tracking API
  const fetchLiveTrackingData = async (showRetryMessage = false) => {
    try {
      setLoading(true);
      setError('');
      if (showRetryMessage) {
        setRetryCount(prev => prev + 1);
      }
      
      // Use production API directly for real S3 data
      const apiUrl = 'https://dxdtime.ddsolutions.io/api/live-tracking/fast-screenshots/';
      console.log('Fetching live tracking data from production API:', apiUrl);
      
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
        // Flatten all screenshots from all users into a single array
        const screenshots = [];
        response.data.data.s3_users_sample.forEach(user => {
          if (user.screenshots && Array.isArray(user.screenshots)) {
            user.screenshots.forEach(screenshot => {
              screenshots.push({
                ...screenshot,
                user_email: user.user_email,
                screenshot_url: screenshot.file_url || screenshot.direct_url,
                timestamp: new Date(screenshot.last_modified).toISOString(),
                activity_type: 'ACTIVE',
                size_mb: screenshot.file_size_mb
              });
            });
          }
        });
        
        // Sort screenshots by timestamp (newest first)
        screenshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAllScreenshots(screenshots);
        setFilteredScreenshots(screenshots);
        setImageErrors(new Set());
      }
      
    } catch (err) {
      console.error('Error fetching live tracking data:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. The API might be taking longer than expected.');
      } else if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Failed to fetch data'}`);
      } else {
        setError('Network error: Unable to connect to the API.');
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
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  // Format user email for display
  const formatUserEmail = (email) => {
    return email?.replace('_at_', '@') || 'Unknown User';
  };

  // Get image URL - try direct S3 access first, fallback to local proxy
  const getImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    console.log('🔍 Processing image URL:', originalUrl);
    
    // For S3 URLs, try direct access first
    if (originalUrl.includes('ddsfocustime.s3') && originalUrl.includes('amazonaws.com')) {
      console.log('✅ Using direct S3 URL:', originalUrl);
      // Return the original S3 URL directly - many S3 buckets allow public read access
      return originalUrl;
    }
    
    // For non-S3 URLs, use as-is
    console.log('✅ Using original URL:', originalUrl);
    return originalUrl;
  };

  // Handle image loading with CORS fallback and local proxy
  const handleImageError = (e, originalUrl, userEmail, userIndex) => {
    console.warn(`Failed to load screenshot for ${userEmail}:`, originalUrl);
    
    // Try loading with crossOrigin set to anonymous
    if (e.target.crossOrigin !== 'anonymous') {
      console.log('Retrying with CORS anonymous...');
      e.target.crossOrigin = 'anonymous';
      e.target.src = originalUrl;
      return;
    }
    
    // If CORS failed, try without crossOrigin
    if (e.target.crossOrigin === 'anonymous') {
      console.log('Retrying without CORS...');
      e.target.crossOrigin = '';
      e.target.src = originalUrl;
      return;
    }
    
    // If direct access failed, try local proxy
    if (!e.target.src.includes('127.0.0.1:8001')) {
      console.log('Trying local proxy...');
      const proxyUrl = `http://127.0.0.1:8001/api/proxy/s3-image?url=${encodeURIComponent(originalUrl)}`;
      e.target.crossOrigin = '';
      e.target.src = proxyUrl;
      return;
    }
    
    // All attempts failed, add to error set
    console.error('All image loading attempts failed for:', originalUrl);
    setImageErrors(prev => new Set(prev).add(userIndex));
  };

  // Handle successful image load
  const handleImageLoad = (e, userIndex) => {
    // Image loaded successfully, remove from error set and ensure error state is hidden
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(userIndex);
      return newSet;
    });
    
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'none';
    }
  };

  // Retry loading image with fresh URL
  const retryImageLoad = async (userIndex) => {
    console.log(`Retrying image load for user ${userIndex}`);
    await fetchLiveTrackingData(true);
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
                <span className="help-icon">?</span>
              </h1>
            </div>
            <div className="header-controls">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search user..."
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
                {/* Total Users Card */}
                <div className="stat-card">
                  <div className="stat-icon">{apiData.data.total_employees.icon}</div>
                  <div className="stat-content">
                    <h3>{apiData.data.total_employees.count}</h3>
                    <p>{apiData.data.total_employees.title}</p>
                    <span className="growth-rate">{apiData.data.total_employees.growth_rate}</span>
                  </div>
                </div>

                {/* Metrics Cards */}
                {apiData.data.metrics.map((metric, index) => (
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
                <p className="no-data-text">No screenshots data available</p>
              </div>
            )}

            {/* Screenshots Grid */}
            {!loading && !error && currentScreenshots.length > 0 && (
              <>
                {/* Screenshots Header */}
                <div className="screenshots-header">
                  <h3>Live Screenshots ({totalScreenshots} total)</h3>
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
                              
                              // Show placeholder if loading fails
                              console.log('❌ Loading failed, showing placeholder');
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.querySelector('div:not([style*="position: absolute"])');
                              if (placeholder && placeholder.querySelector('span')) {
                                placeholder.style.display = 'flex';
                                placeholder.querySelector('span').textContent = 'Failed to load';
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
                          {new Date(screenshot.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#5f6368',
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
                            {formatFileSize(screenshot.size_mb || 0)}
                          </span>
                        </div>
                        
                        <div style={{
                          fontSize: '11px',
                          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#5f6368',
                          marginBottom: '8px'
                        }}>
                          👤 {formatUserEmail(screenshot.user_email)}
                        </div>
                        
                        {screenshot.filename && (
                          <div style={{
                            fontSize: '10px',
                            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#9ca3af',
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
                <span>Screens per page:</span>
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
