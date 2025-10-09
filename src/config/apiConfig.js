// API Configuration for DDS Focus Time Dashboard
// Centralized configuration for all API endpoints

import { getApiBaseURL } from './api';

// Get dynamic API base URL
const getBaseURL = () => {
  const apiBaseURL = getApiBaseURL();
  // Remove '/api' suffix since we'll add specific endpoints
  return apiBaseURL.replace('/api', '');
};

export const API_CONFIG = {
  // Base API URL - now dynamic
  get BASE_URL() {
    return getBaseURL();
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Live Tracking
    LIVE_TRACKING: '/api/live-tracking/fast-screenshots/',
    
    // Screenshots
    SCREENSHOTS: '/api/screenshots/',
    SCREENSHOT_PROXY: '/api/proxy/screenshot/',
    
    // Users
    USERS: '/api/users/',
    USER_SUGGESTIONS: '/api/users/s3-suggestions/',
    
    // Employee data
    EMPLOYEE_FOLDERS: '/api/screenshots/employee/',
    
    // Idle Time
    IDLE_TIME: '/api/idle_time/',
    
    // Other endpoints
    FOLDERS: '/api/folders/',
    REPORTS: '/api/reports/',
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    timeout: 30000, // Reduced to 30 seconds for faster feedback
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if authentication is needed
  },
  
  // Extended timeout for heavy operations
  EXTENDED_REQUEST_CONFIG: {
    timeout: 120000, // 2 minutes for heavy S3 operations
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  },
  
  // Light request config for quick operations
  LIGHT_REQUEST_CONFIG: {
    timeout: 10000, // 10 seconds for quick operations
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  },

  // Extreme timeout for S3 scanning operations that can take 30-40 minutes
  EXTREME_REQUEST_CONFIG: {
    timeout: 2400000, // 40 minutes for complete S3 folder scanning
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  },
  
  // Image handling
  IMAGE_CONFIG: {
    // Maximum retries for failed image loads
    MAX_RETRIES: 2,
    
    // Supported image formats
    SUPPORTED_FORMATS: ['.webp', '.jpg', '.jpeg', '.png', '.gif'],
    
    // Default fallback for broken images
    FALLBACK_IMAGE: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+',
  },
};

// Helper functions for building URLs
export const buildApiUrl = (endpoint, params = {}) => {
  const baseURL = API_CONFIG.BASE_URL;
  const url = new URL(endpoint, baseURL);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
};

// Build screenshot proxy URL
export const buildScreenshotProxyUrl = (imagePath) => {
  if (!imagePath) return null;
  
  const baseURL = API_CONFIG.BASE_URL;
  
  // Replace localhost URLs with current base URL
  if (imagePath.includes('127.0.0.1:8000') || imagePath.includes('localhost:8000') || imagePath.includes('127.0.0.1') || imagePath.includes('localhost')) {
    imagePath = imagePath.replace(/https?:\/\/(127\.0\.0\.1:?8000?|localhost:?8000?)/, baseURL);
    console.log('🔄 Replaced localhost URL with base URL:', imagePath);
    console.log('🔄 Original URL contained localhost/127.0.0.1, new URL:', imagePath);
    return imagePath;
  }
  
  // If it's already a full URL to our domain, return as-is
  if (imagePath.startsWith(baseURL)) {
    return imagePath;
  }
  
  // If it's a relative proxy URL, make it absolute
  if (imagePath.startsWith('/api/proxy/')) {
    return `${baseURL}${imagePath}`;
  }
  
  // If it's an S3 URL, convert to proxy format
  if (imagePath.includes('ddsfocustime.s3.amazonaws.com/')) {
    // Remove AWS signature parameters and extract just the S3 path
    const s3BaseUrl = imagePath.split('?')[0]; // Remove query parameters
    const s3Path = s3BaseUrl.split('ddsfocustime.s3.amazonaws.com/')[1];
    return `${baseURL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}${s3Path}`;
  }
  
  // If it's already a path without domain, add proxy prefix
  if (!imagePath.startsWith('http')) {
    return `${baseURL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}${imagePath}`;
  }
  
  return imagePath;
};

// Build employee folder URL
export const buildEmployeeFolderUrl = (employeeEmail, folderName, page = 1, limit = 20) => {
  const endpoint = `${API_CONFIG.ENDPOINTS.EMPLOYEE_FOLDERS}${encodeURIComponent(employeeEmail)}/folder/${encodeURIComponent(folderName)}/enhanced/`;
  return buildApiUrl(endpoint, { page, limit });
};

// Build user suggestions URL
export const buildUserSuggestionsUrl = (query) => {
  return buildApiUrl(API_CONFIG.ENDPOINTS.USER_SUGGESTIONS, { q: query });
};

// Build live tracking URL with filters
export const buildLiveTrackingUrl = (filters = {}) => {
  const params = {
    limit: filters.limit || 100,
    start_date: filters.start_date,
    end_date: filters.end_date,
    employee: filters.employee !== 'all' ? filters.employee : undefined,
    department: filters.department !== 'all' ? filters.department : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  };
  
  return buildApiUrl(API_CONFIG.ENDPOINTS.LIVE_TRACKING, params);
};

/**
 * Retry API call with progressive timeout strategy
 * @param {Function} apiCall - Function that returns a promise (axios call)
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with the API response
 */
export const retryApiCall = async (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    timeouts = [15000, 30000, 60000], // 15s, 30s, 60s
    retryDelay = 1000,
    onRetry = () => {}
  } = options;

  let lastError;
  
  for (let i = 0; i < Math.min(maxRetries, timeouts.length); i++) {
    try {
      const timeout = timeouts[i];
      console.log(`🔄 API Retry attempt ${i + 1}/${maxRetries} with ${timeout/1000}s timeout`);
      
      const response = await apiCall(timeout);
      console.log(`✅ API call succeeded on attempt ${i + 1}`);
      return response;
      
    } catch (error) {
      console.warn(`❌ API attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Call retry callback
      onRetry(i + 1, error, timeouts[i]);
      
      // If it's a timeout error and we have more attempts, continue
      if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && i < maxRetries - 1) {
        console.log(`⏳ Waiting ${retryDelay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // For non-timeout errors, don't retry
      if (!error.code?.includes('ECONNABORTED') && !error.message?.includes('timeout')) {
        throw error;
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error('All retry attempts failed');
};

/**
 * Special retry function for extremely long S3 scanning operations (up to 40 minutes)
 * @param {Function} apiCall - Function that returns a promise (axios call)
 * @param {string} description - Description of the operation for logging
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with the API response
 */
export const retryExtremeApiCall = async (apiCall, description = 'API call', options = {}) => {
  const {
    maxRetries = 4,
    timeouts = [30000, 120000, 600000, 2400000], // 30s, 2min, 10min, 40min
    retryDelay = 2000,
    onRetry = () => {}
  } = options;

  let lastError;
  
  for (let i = 0; i < Math.min(maxRetries, timeouts.length); i++) {
    try {
      const timeout = timeouts[i];
      const timeoutLabel = timeout >= 60000 ? `${Math.round(timeout/60000)}min` : `${timeout/1000}s`;
      console.log(`🔄 ${description} - Extreme retry attempt ${i + 1}/${maxRetries} with ${timeoutLabel} timeout`);
      
      const response = await apiCall(timeout);
      console.log(`✅ ${description} succeeded on attempt ${i + 1}`);
      return response;
      
    } catch (error) {
      console.warn(`❌ ${description} attempt ${i + 1} failed:`, error.message);
      lastError = error;
      
      // Call retry callback
      onRetry(i + 1, error, timeouts[i]);
      
      // If it's a timeout error and we have more attempts, continue
      if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && i < maxRetries - 1) {
        const nextTimeoutLabel = timeouts[i + 1] >= 60000 ? `${Math.round(timeouts[i + 1]/60000)}min` : `${timeouts[i + 1]/1000}s`;
        console.log(`⏳ ${description} - Waiting ${retryDelay}ms before next extreme attempt (${nextTimeoutLabel} timeout)...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // For non-timeout errors, don't retry
      if (!error.code?.includes('ECONNABORTED') && !error.message?.includes('timeout')) {
        throw error;
      }
    }
  }
  
  // All attempts failed
  throw lastError || new Error(`All extreme retry attempts failed for ${description}`);
};

// Export individual URLs for backwards compatibility
export const API_URLS = {
  get LIVE_TRACKING() {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_TRACKING}`;
  },
  get SCREENSHOT_PROXY() {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}`;
  },
  get USER_SUGGESTIONS() {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_SUGGESTIONS}`;
  },
  get EMPLOYEE_FOLDERS() {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEE_FOLDERS}`;
  },
};

export default API_CONFIG;
