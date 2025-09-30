// User Logs API Service
// Handles API calls to the Enhanced Date Range Logs API

import { getBaseURL } from '../config/api.js';

class UserLogsAPIService {
  constructor() {
    this.baseUrl = getBaseURL();
  }

  // Get logs with date range and filtering
  async getLogs(options = {}) {
    const {
      timeRange,
      startDate,
      endDate,
      userEmail,
      fileType,
      project,
      minSize,
      maxSize,
      sortBy = 'date',
      sortOrder = 'desc',
      groupBy,
      includeContent = false,
      limit = 50
    } = options;

    try {
      const apiUrl = `${this.baseUrl}/api/logs/date-range/`;
      const params = new URLSearchParams();

      // Date range handling
      if (timeRange && !startDate && !endDate) {
        params.append('time_range', timeRange);
      } else if (startDate && endDate) {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else {
        params.append('time_range', 'last_7_days'); // Default
      }

      // Optional filters
      if (userEmail) params.append('user_email', userEmail);
      if (fileType) params.append('file_type', fileType);
      if (project) params.append('project', project);
      if (minSize) params.append('min_size', minSize.toString());
      if (maxSize) params.append('max_size', maxSize.toString());
      if (groupBy) params.append('group_by', groupBy);
      if (includeContent) params.append('include_content', 'true');

      // Display options
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
      params.append('limit', limit.toString());

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  // Get calendar view of logs
  async getCalendar(options = {}) {
    const {
      month = new Date().getMonth() + 1,
      year = new Date().getFullYear(),
      userEmail
    } = options;

    try {
      const apiUrl = `${this.baseUrl}/api/logs/calendar/`;
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString()
      });

      if (userEmail) {
        params.append('user_email', userEmail);
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching calendar:', error);
      throw error;
    }
  }

  // Get specific log file content
  async getLogContent(logKey) {
    try {
      const apiUrl = `${this.baseUrl}/api/user-logs/content/${encodeURIComponent(logKey)}/`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching log content:', error);
      throw error;
    }
  }

  // Get user activity summary
  async getUserActivitySummary(userEmail, days = 7) {
    try {
      const apiUrl = `${this.baseUrl}/api/user-logs/summary/`;
      const params = new URLSearchParams({
        user_email: userEmail,
        days: days.toString()
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching user activity summary:', error);
      throw error;
    }
  }

  // Get logs statistics
  async getLogsStatistics(detailed = false) {
    try {
      const apiUrl = `${this.baseUrl}/api/user-logs/statistics/`;
      const params = new URLSearchParams();
      
      if (detailed) {
        params.append('detailed', 'true');
      }

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching logs statistics:', error);
      throw error;
    }
  }

  // Get available log types
  async getLogTypes() {
    try {
      const apiUrl = `${this.baseUrl}/api/user-logs/types/`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'API returned error status');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching log types:', error);
      throw error;
    }
  }

  // Utility method to format file sizes
  formatFileSize(sizeInMB) {
    if (sizeInMB < 0.001) return '< 1KB';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(1)}KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(2)}MB`;
    return `${(sizeInMB / 1024).toFixed(2)}GB`;
  }

  // Utility method to format dates
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return {
        full: date.toLocaleString(),
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relative: this.getRelativeTime(date)
      };
    } catch {
      return {
        full: dateString,
        date: dateString,
        time: '',
        relative: dateString
      };
    }
  }

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const userLogsAPI = new UserLogsAPIService();
export default UserLogsAPIService;
