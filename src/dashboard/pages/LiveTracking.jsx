import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { API_CONFIG, buildScreenshotProxyUrl } from '../../config/apiConfig';
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
  const [filteredUsers, setFilteredUsers] = useState([]);
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
        setFilteredUsers(response.data.data.s3_users_sample);
        // Reset image errors when getting fresh data
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

  // Filter users based on search query
  useEffect(() => {
    if (!apiData || !apiData.data || !apiData.data.s3_users_sample) {
      setFilteredUsers([]);
      return;
    }

    let filtered = apiData.data.s3_users_sample;
    
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.user_email?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, apiData]);

  // Load data on component mount
  useEffect(() => {
    fetchLiveTrackingData();
  }, []);

  // Calculate pagination
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

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

            {!loading && !error && totalUsers === 0 && (
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

            {/* Users Screenshots Grid */}
            {!loading && !error && currentUsers.length > 0 && (
              <div className="screenshots-grid">
                {currentUsers.map((user, index) => {
                  const userIndex = startIndex + index;
                  const hasImageError = imageErrors.has(userIndex);
                  
                  return (
                    <div key={userIndex} className="screenshot-card">
                      <div className="screenshot-header">
                        <div className="user-info">
                          <h4 className="user-email">{formatUserEmail(user.user_email)}</h4>
                          <div className="user-stats">
                            <span className="file-count">{user.file_count} files</span>
                            <span className="storage-size">{formatFileSize(user.total_size_mb)}</span>
                            <span className="days-active">{user.days_active} days active</span>
                          </div>
                        </div>
                        <div className="latest-date">
                          {user.latest_date}
                        </div>
                      </div>
                      
                      {user.latest_file_url && (
                        <div className="screenshot-preview">
                          <img 
                            src={getImageUrl(user.latest_file_url)}
                            alt={`Latest screenshot for ${formatUserEmail(user.user_email)}`}
                            className="screenshot-image"
                            crossOrigin="anonymous"
                            onLoad={(e) => handleImageLoad(e, userIndex)}
                            onError={(e) => handleImageError(e, user.latest_file_url, formatUserEmail(user.user_email), userIndex)}
                          />
                          {hasImageError && (
                            <div className="placeholder-image">
                              <svg width="100%" height="100%" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)"/>
                                <rect x="10" y="10" width="280" height="180" fill="#f8f9fa" stroke="#dadce0" strokeWidth="2" rx="8"/>
                                <circle cx="150" cy="80" r="25" fill="#e8eaed"/>
                                <path d="M135 75 L165 75 L155 65 Z" fill="#5f6368"/>
                                <rect x="125" y="85" width="50" height="30" fill="#e8eaed" rx="4"/>
                                <text x="150" y="140" textAnchor="middle" fill="#5f6368" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="500">
                                  Real Screenshot
                                </text>
                                <text x="150" y="160" textAnchor="middle" fill="#9aa0a6" fontFamily="Arial, sans-serif" fontSize="10">
                                  Loading from S3...
                                </text>
                              </svg>
                            </div>
                          )}
                          <div className={`image-error ${hasImageError ? 'show' : ''}`}>
                            <span>📷</span>
                            <p>Screenshot loading failed</p>
                            <small>Unable to load real screenshot from S3 - checking proxy connection</small>
                            <div className="url-display">
                              <strong>Proxy URL:</strong>
                              <small className="localhost-url">{getImageUrl(user.latest_file_url)}</small>
                              <strong>Original S3 URL:</strong>
                              <small className="s3-url">{user.latest_file_url}</small>
                            </div>
                            <button 
                              className="retry-image-button"
                              onClick={() => retryImageLoad(userIndex)}
                              disabled={loading}
                            >
                              {loading ? '🔄' : '↻'} Retry Loading
                            </button>
                            <button 
                              className="view-s3-button"
                              onClick={() => window.open(user.latest_file_url, '_blank')}
                              style={{marginTop: '8px'}}
                            >
                              🔗 View Original S3
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="screenshot-footer">
                        <span className="filename">{user.latest_file}</span>
                        <div className="footer-actions">
                          <a 
                            href={getImageUrl(user.latest_file_url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-button"
                          >
                            View Full
                          </a>
                          {hasImageError && (
                            <button 
                              className="retry-button-small"
                              onClick={() => retryImageLoad(userIndex)}
                              disabled={loading}
                              title="Get fresh URL from API"
                            >
                              ↻
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                {totalUsers > 0 ? `${startIndex + 1}-${Math.min(endIndex, totalUsers)} of ${totalUsers}` : '0 of 0'}
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
