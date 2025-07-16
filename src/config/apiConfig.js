// API Configuration for DDS Focus Time Dashboard
// Centralized configuration for all API endpoints

export const API_CONFIG = {
  // Base API URL
  BASE_URL: 'https://dxdtime.ddsolutions.io',
  
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
    
    // Other endpoints
    FOLDERS: '/api/folders/',
    REPORTS: '/api/reports/',
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    timeout: 180000, // 3 minutes for slow S3 operations
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    withCredentials: false, // Set to true if authentication is needed
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
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  
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
  
  // Replace localhost URLs with production domain
  if (imagePath.includes('127.0.0.1:8000') || imagePath.includes('localhost:8000') || imagePath.includes('127.0.0.1') || imagePath.includes('localhost')) {
    imagePath = imagePath.replace(/https?:\/\/(127\.0\.0\.1:?8000?|localhost:?8000?)/, API_CONFIG.BASE_URL);
    console.log('🔄 Replaced localhost URL with production domain:', imagePath);
    console.log('🔄 Original URL contained localhost/127.0.0.1, new URL:', imagePath);
    return imagePath;
  }
  
  // If it's already a full URL to our domain, return as-is
  if (imagePath.startsWith(API_CONFIG.BASE_URL)) {
    return imagePath;
  }
  
  // If it's a relative proxy URL, make it absolute
  if (imagePath.startsWith('/api/proxy/')) {
    return `${API_CONFIG.BASE_URL}${imagePath}`;
  }
  
  // If it's an S3 URL, convert to proxy format
  if (imagePath.includes('ddsfocustime.s3.amazonaws.com/')) {
    const s3Path = imagePath.split('ddsfocustime.s3.amazonaws.com/')[1];
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}${s3Path}`;
  }
  
  // If it's already a path without domain, add proxy prefix
  if (!imagePath.startsWith('http')) {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}${imagePath}`;
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

// Export individual URLs for backwards compatibility
export const API_URLS = {
  LIVE_TRACKING: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LIVE_TRACKING}`,
  SCREENSHOT_PROXY: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCREENSHOT_PROXY}`,
  USER_SUGGESTIONS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_SUGGESTIONS}`,
  EMPLOYEE_FOLDERS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLOYEE_FOLDERS}`,
};

export default API_CONFIG;
