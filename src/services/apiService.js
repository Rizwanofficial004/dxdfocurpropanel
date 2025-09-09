import { buildApiUrl } from '../config/api.js';
import authService from './authService.js';

/**
 * Generic API Service for making authenticated requests
 */
class ApiService {
  constructor() {
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);

      // If token expired, try to refresh and retry
      if (response.status === 401 && authService.refreshToken) {
        try {
          await authService.refreshAuthToken();
          config.headers = {
            ...config.headers,
            ...authService.getAuthHeaders(),
          };
          response = await fetch(url, config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authService.clearAuthData();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<any>} Response data
   */
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Upload file
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @returns {Promise<any>} Response data
   */
  async upload(endpoint, formData) {
    const url = buildApiUrl(endpoint);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`File upload failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Fetch CRM comprehensive dashboard data
   * @returns {Promise<any>} CRM comprehensive data
   */
  async getCrmComprehensive() {
    try {
      return await this.get('/dashboard/crm-comprehensive/');
    } catch (error) {
      console.error('Failed to fetch CRM comprehensive data:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
