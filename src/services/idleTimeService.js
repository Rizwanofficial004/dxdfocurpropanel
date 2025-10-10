import axios from 'axios';
import { getApiBaseURL } from '../config/api';
import { AP      console.log('🕐 Real API Response:', response.data);
      
      // Handle the specific API response format you provided
      if (response.data && response.data.status === 'success' && response.data.data) {
        const apiData = response.data.data;
        
        // Extract users array and convert to expected format
        if (apiData.users && Array.isArray(apiData.users)) {
          const processedUsers = apiData.users.map(user => ({
            email: `${user.staff_name?.toLowerCase().replace(/\s+/g, '.')}@company.com`, // Generate email from name
            display_name: user.staff_name,
            staff_id: user.staff_id,
            idle_time_minutes: user.total_idle_minutes || 0,
            idle_time_seconds: user.total_idle_seconds || 0,
            total_sessions: user.total_sessions || 0,
            idle_session_count: user.idle_session_count || 0,
            auto_pause_count: user.auto_pause_count || 0,
            average_idle_per_day: user.average_idle_per_day || 0,
            first_activity: user.first_activity,
            last_activity: user.last_activity,
            total_days_active: user.total_days_active || 0,
            raw_data: user // Keep original data for reference
          }));
          
          // Add summary data to the service for access
          this.lastSummary = apiData.summary;
          console.log('🕐 Processed users:', processedUsers.length);
          console.log('🕐 Total idle time from API:', apiData.summary?.total_idle_minutes_all_users, 'minutes');
          
          return processedUsers;
        }
        
        return [];
      }
      
      // Handle different response formats (fallback for other APIs)
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', response.data);
        return response.data || [];
      }om '../config/apiConfig';

// Mock data for testing when API is not available
const MOCK_IDLE_TIME_DATA = [
  {
    email: 'haseebcodejourney@gmail.com',
    display_name: 'Haseeb Ahmed',
    idle_time_minutes: 45,
    last_activity: '2025-10-10T14:30:00Z'
  },
  {
    email: 'kiranaiza4@gmail.com',
    display_name: 'Kiran Aiza',
    idle_time_minutes: 23,
    last_activity: '2025-10-10T15:15:00Z'
  },
  {
    email: 'nawaz@dxdglobal.com',
    display_name: 'Nawaz Ahmed',
    idle_time_minutes: 67,
    last_activity: '2025-10-10T13:45:00Z'
  },
  {
    email: 'admin@dxdglobal.com',
    display_name: 'Admin User',
    idle_time_minutes: 12,
    last_activity: '2025-10-10T15:50:00Z'
  },
  {
    email: 'test@dxdglobal.com',
    display_name: 'Test User',
    idle_time_minutes: 89,
    last_activity: '2025-10-10T12:20:00Z'
  },
  {
    email: 'john.doe@company.com',
    display_name: 'John Doe',
    idle_time_minutes: 156,
    last_activity: '2025-10-10T11:30:00Z'
  },
  {
    email: 'jane.smith@company.com',
    display_name: 'Jane Smith',
    idle_time_minutes: 3,
    last_activity: '2025-10-10T15:58:00Z'
  }
];

/**
 * Idle Time API Service
 * Handles all API calls related to idle time tracking
 */
class IdleTimeService {
  constructor() {
    this.baseURL = getApiBaseURL();
    this.timeout = 15000;
    this.useMockData = false; // Set to true to use mock data for testing
  }

  /**
   * Enable or disable mock data mode
   * @param {boolean} useMock - Whether to use mock data
   */
  setMockMode(useMock) {
    this.useMockData = useMock;
  }

  /**
   * Fetch idle time data for all users
   * @returns {Promise<Array>} Array of user idle time data
   */
  async fetchAllUsersIdleTime() {
    try {
      // First try the real API endpoint
      const realApiUrl = 'http://127.0.0.1:8000/api/idle_time/';
      console.log('🕐 Fetching idle time data from real API:', realApiUrl);
      
      const response = await axios.get(realApiUrl, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      console.log('� Real API Response:', response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else {
        console.warn('⚠️ Unexpected API response format:', response.data);
        return response.data || [];
      }
    } catch (error) {
      console.error('❌ Error fetching from real API:', error);
      
      // Fallback to configured API endpoint
      try {
        const apiUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.IDLE_TIME}`;
        console.log('� Trying configured API endpoint:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && response.data.status === 'success') {
          return response.data.data || [];
        }
      } catch (configError) {
        console.error('❌ Error with configured endpoint:', configError);
      }
      
      // Final fallback to mock data for development
      if (import.meta.env.DEV || error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        console.log('🔧 Using mock data as fallback');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return MOCK_IDLE_TIME_DATA;
      }
      
      throw new Error(`Failed to fetch idle time data: ${error.message}`);
    }
  }

  /**
   * Get the total idle time from the last API response summary
   * @returns {number} Total idle time in minutes from API summary
   */
  getTotalIdleTimeFromSummary() {
    return this.lastSummary?.total_idle_minutes_all_users || 0;
  }

  /**
   * Get the summary data from the last API response
   * @returns {Object|null} Summary object from API
   */
  getLastSummary() {
    return this.lastSummary || null;
  }

  /**
   * Fetch idle time data for a specific user
   * @param {string} userEmail - User email address
   * @returns {Promise<Object>} User idle time data
   */
  async fetchUserIdleTime(userEmail) {
    try {
      const apiUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.IDLE_TIME}?user=${encodeURIComponent(userEmail)}`;
      console.log('🕐 Fetching idle time for user:', userEmail, 'from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && response.data.status === 'success') {
        return response.data.data || {};
      } else {
        console.warn('⚠️ User idle time API returned unexpected format:', response.data);
        return {};
      }
    } catch (error) {
      console.error('❌ Error fetching user idle time:', error);
      throw new Error(`Failed to fetch idle time for user ${userEmail}: ${error.message}`);
    }
  }

  /**
   * Fetch idle time data with date range filter
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of user idle time data for the date range
   */
  async fetchIdleTimeByDateRange(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const apiUrl = `${this.baseURL}${API_CONFIG.ENDPOINTS.IDLE_TIME}?${params.toString()}`;
      console.log('🕐 Fetching idle time for date range:', { startDate, endDate }, 'from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: this.timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && response.data.status === 'success') {
        return response.data.data || [];
      } else {
        console.warn('⚠️ Date range idle time API returned unexpected format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching idle time by date range:', error);
      throw new Error(`Failed to fetch idle time for date range: ${error.message}`);
    }
  }

  /**
   * Format idle time minutes to human readable format
   * @param {number} minutes - Minutes of idle time
   * @returns {string} Formatted idle time string
   */
  formatIdleTime(minutes) {
    if (!minutes || minutes < 1) return '0m';
    
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  }

  /**
   * Calculate total idle time from user array
   * @param {Array} users - Array of user objects with idle_time_minutes property
   * @returns {number} Total idle time in minutes
   */
  calculateTotalIdleTime(users) {
    if (!Array.isArray(users)) return 0;
    return users.reduce((total, user) => total + (user.idle_time_minutes || 0), 0);
  }

  /**
   * Calculate average idle time from user array
   * @param {Array} users - Array of user objects with idle_time_minutes property
   * @returns {number} Average idle time in minutes
   */
  calculateAverageIdleTime(users) {
    if (!Array.isArray(users) || users.length === 0) return 0;
    const total = this.calculateTotalIdleTime(users);
    return Math.round(total / users.length);
  }

  /**
   * Get users sorted by idle time (highest first)
   * @param {Array} users - Array of user objects with idle_time_minutes property
   * @returns {Array} Sorted array of users
   */
  sortUsersByIdleTime(users) {
    if (!Array.isArray(users)) return [];
    return [...users].sort((a, b) => (b.idle_time_minutes || 0) - (a.idle_time_minutes || 0));
  }

  /**
   * Get top N users with highest idle time
   * @param {Array} users - Array of user objects with idle_time_minutes property
   * @param {number} limit - Number of top users to return (default: 10)
   * @returns {Array} Top users with highest idle time
   */
  getTopIdleUsers(users, limit = 10) {
    const sortedUsers = this.sortUsersByIdleTime(users);
    return sortedUsers.slice(0, limit);
  }
}

// Export singleton instance
export const idleTimeService = new IdleTimeService();
export default idleTimeService;