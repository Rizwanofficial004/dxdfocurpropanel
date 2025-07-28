// API Configuration - Centralized environment management
// Automatically switches between production and development environments

/**
 * Get the appropriate API base URL based on environment
 * @returns {string} The base API URL
 */
export const getApiBaseURL = () => {
  // Check for custom environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if running in production
  if (import.meta.env.PROD || 
      window.location.hostname !== 'localhost') {
    return 'http://dxdtime.ddsolutions.io/api';
  }
  
  // Default to local development
  return 'http://localhost:8000/api';
};

/**
 * Get the base URL without /api suffix
 * @returns {string} The base URL
 */
export const getBaseURL = () => {
  const apiUrl = getApiBaseURL();
  return apiUrl.replace('/api', '');
};

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    VERIFY_EMAIL: '/auth/verify-email/',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/user/profile/',
    CHANGE_PASSWORD: '/user/change-password/',
  },
  
  // Dashboard endpoints
  DASHBOARD: {
    EMPLOYEES: '/dashboard/employees/enhanced/',
    ANALYTICS: '/dashboard/analytics/employees/',
  },
  
  // Live tracking endpoints
  LIVE_TRACKING: {
    SCREENSHOTS: '/live-tracking/fast-screenshots/',
  },
  
  // Database endpoints
  DATABASE: {
    COMPREHENSIVE: '/database/comprehensive/',
  },
  
  // Logs endpoints
  LOGS: {
    SEARCH: '/logs/search/',
    FILES: '/logs/files/',
    FILE_CONTENT: '/logs/file-content/',
    ACTIVITY: '/logs/activity/',
  },
  
  // Settings endpoints
  SETTINGS: {
    BASE: '/settings',
  }
};

/**
 * Build complete API URL
 * @param {string} endpoint - Endpoint path
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseURL();
  return `${baseUrl}${endpoint}`;
};

/**
 * Environment information
 */
export const ENV_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: getApiBaseURL(),
};

// Log configuration on startup
console.log('🌐 API Configuration:', {
  environment: ENV_INFO.mode,
  baseURL: ENV_INFO.baseUrl,
  hostname: window.location.hostname,
  isProduction: ENV_INFO.isProduction,
  isDevelopment: ENV_INFO.isDevelopment
});

export default {
  getApiBaseURL,
  getBaseURL,
  buildApiUrl,
  API_ENDPOINTS,
  ENV_INFO
};
