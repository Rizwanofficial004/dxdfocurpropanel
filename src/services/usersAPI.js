// Users API Service
// Handles all user-related API calls including search functionality

import axios from 'axios';
import { getApiBaseURL } from '../config/api.js';

const API_BASE_URL = getApiBaseURL();

// Create axios instance for users API
const usersApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
usersApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
usersApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Users API Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Search users with various filters
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query (optional)
 * @param {string} params.start_date - Start date filter (YYYY-MM-DD format)
 * @param {string} params.end_date - End date filter (YYYY-MM-DD format)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 50)
 * @param {string} params.status - User status filter (active, inactive, all)
 * @param {boolean} params.include_stats - Include user statistics
 * @returns {Promise} API response
 */
export const searchUsers = async (params = {}) => {
  try {
    // Set default values
    const searchParams = {
      start_date: params.start_date || getDefaultStartDate(),
      end_date: params.end_date || getDefaultEndDate(),
      page: params.page || 1,
      page_size: params.page_size || 50,
      include_stats: params.include_stats !== false, // Default to true
      ...params
    };

    // Remove undefined/null values
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] === undefined || searchParams[key] === null) {
        delete searchParams[key];
      }
    });

    console.log('🔍 Searching users with params:', searchParams);
    
    const response = await usersApiClient.get('/users/search/', {
      params: searchParams
    });

    console.log('✅ Users search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error searching users:', error);
    throw error;
  }
};

/**
 * Get all users (convenience method)
 * @param {Object} options - Additional options
 * @returns {Promise} API response with all users
 */
export const getAllUsers = async (options = {}) => {
  return await searchUsers({
    q: '', // Empty query to get all users
    page_size: options.limit || 100,
    ...options
  });
};

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @param {Object} options - Additional options
 * @returns {Promise} API response
 */
export const searchUsersByQuery = async (query, options = {}) => {
  return await searchUsers({
    q: query,
    ...options
  });
};

/**
 * Get user suggestions for autocomplete
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise} API response
 */
export const getUserSuggestions = async (query, limit = 10) => {
  try {
    const response = await usersApiClient.get('/users/s3-suggestions/', {
      params: {
        q: query,
        limit
      }
    });

    console.log('✅ User suggestions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting user suggestions:', error);
    throw error;
  }
};

/**
 * Get user by specific identifier
 * @param {string} identifier - User email, username, or ID
 * @returns {Promise} API response
 */
export const getUserById = async (identifier) => {
  try {
    const response = await usersApiClient.get(`/users/${encodeURIComponent(identifier)}/`);
    console.log('✅ User details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting user details:', error);
    throw error;
  }
};

/**
 * Get users with activity in a specific date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} options - Additional options
 * @returns {Promise} API response
 */
export const getUsersByDateRange = async (startDate, endDate, options = {}) => {
  return await searchUsers({
    start_date: startDate,
    end_date: endDate,
    ...options
  });
};

// Helper functions
const getDefaultStartDate = () => {
  // Default to 30 days ago
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

const getDefaultEndDate = () => {
  // Default to today
  return new Date().toISOString().split('T')[0];
};

/**
 * Transform API user data to frontend format
 * @param {Object} apiUser - User data from API
 * @returns {Object} Transformed user data
 */
export const transformUserData = (apiUser) => {
  return {
    id: apiUser.email || apiUser.id,
    email: apiUser.email,
    display_name: apiUser.display_name || apiUser.email,
    username: apiUser.username,
    staff_id: apiUser.staff_id,
    original_name: apiUser.original_name || apiUser.email,
    total_screenshots: apiUser.total_screenshots || 0,
    total_size_mb: apiUser.total_size_mb || 0,
    active_days_count: apiUser.active_days_count || 0,
    active_months_count: apiUser.active_months_count || 0,
    first_activity: apiUser.first_activity,
    last_activity: apiUser.last_activity,
    status: apiUser.status || 'active',
    grouped_screenshots: apiUser.grouped_screenshots || {},
    recent_screenshots: apiUser.recent_screenshots || [],
    folders: apiUser.folders || [],
    activity_summary: apiUser.activity_summary || {},
    
    // For suggestions/autocomplete
    label: apiUser.suggestion_text || `${apiUser.display_name} (${apiUser.email})`,
    value: apiUser.search_value || apiUser.username || apiUser.email,
    search_value: apiUser.search_value || apiUser.email,
    screenshot_count: apiUser.screenshot_count || apiUser.total_screenshots || 0,
    profile_image: apiUser.profile_image,
    has_logs: apiUser.has_logs,
    source: apiUser.source
  };
};

/**
 * Filter out test/demo users
 * @param {Array} users - Array of users
 * @returns {Array} Filtered users
 */
export const filterTestUsers = (users) => {
  const testPatterns = [
    'test@',
    'demo@',
    'sample@',
    'placeholder@',
    'dummy@',
    'example@'
  ];

  return users.filter(user => {
    const email = (user.email || '').toLowerCase();
    const displayName = (user.display_name || '').toLowerCase();
    
    return !testPatterns.some(pattern => 
      email.includes(pattern) || displayName.includes(pattern)
    );
  });
};

// Export the axios instance for direct use if needed
export { usersApiClient };

// Default export
export default {
  searchUsers,
  getAllUsers,
  searchUsersByQuery,
  getUserSuggestions,
  getUserById,
  getUsersByDateRange,
  transformUserData,
  filterTestUsers
};