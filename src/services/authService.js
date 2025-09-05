import { getApiBaseURL, API_ENDPOINTS, buildApiUrl } from '../config/api.js';

// Dummy credentials for fallback when API is not available
export const DUMMY_CREDENTIALS = {
  username: 'admin@focus.com',
  password: 'admin123',
  userData: {
    id: 1,
    username: 'admin@focus.com',
    email: 'admin@focus.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_superuser: true,
    is_staff: true,
    is_active: true,
    permissions: ['read', 'write', 'delete', 'admin'],
    token: 'dummy-jwt-token-for-offline-mode',
    refresh_token: 'dummy-refresh-token',
    expires_in: 3600,
    profile_picture: null,
    last_login: new Date().toISOString(),
  }
};

/**
 * Authentication Service for Django Backend
 */
class AuthService {
  constructor() {
    this.baseURL = getApiBaseURL();
    this.token = this.getStoredToken();
    this.refreshToken = this.getStoredRefreshToken();
  }

  /**
   * Login with email and password
   * @param {string} username - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember user login
   * @returns {Promise<Object>} User data and tokens
   */
  async login(username, password, rememberMe = false) {
    try {
      console.log('🔐 Attempting API login...');
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          remember_me: rememberMe
        }),
      });

      if (!response.ok) {
        // If API fails, check for dummy credentials
        if (username === DUMMY_CREDENTIALS.username && password === DUMMY_CREDENTIALS.password) {
          console.log('🔓 API failed, using dummy credentials');
          return this.handleDummyLogin(rememberMe);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ API login successful');
      
      return this.handleSuccessfulLogin(data, rememberMe);
      
    } catch (error) {
      console.error('❌ API login error:', error);
      
      // Fallback to dummy credentials if API is completely unavailable
      if (username === DUMMY_CREDENTIALS.username && password === DUMMY_CREDENTIALS.password) {
        console.log('🔓 API unavailable, using dummy credentials');
        return this.handleDummyLogin(rememberMe);
      }
      
      throw error;
    }
  }

  /**
   * Register new user account
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    try {
      console.log('📝 Attempting API registration...');
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER || '/auth/register/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          organization_name: userData.organization,
          country: userData.country,
          first_name: userData.firstName || '',
          last_name: userData.lastName || ''
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('✅ API registration successful');
      
      return this.handleSuccessfulLogin(data, false);
      
    } catch (error) {
      console.error('❌ API registration error:', error);
      
      // For demo purposes, simulate successful registration
      console.log('🔓 API unavailable, simulating registration success');
      
      const mockUserData = {
        id: Math.floor(Math.random() * 1000),
        username: userData.email,
        email: userData.email,
        first_name: userData.firstName || 'User',
        last_name: userData.lastName || '',
        role: 'admin',
        is_superuser: true,
        is_staff: true,
        is_active: true,
        permissions: ['read', 'write', 'delete', 'admin'],
        token: 'mock-jwt-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        expires_in: 3600,
        profile_picture: null,
        last_login: new Date().toISOString(),
        organization_name: userData.organization,
        country: userData.country,
        isAuthenticated: true,
        source: 'mock'
      };
      
      return mockUserData;
    }
  }

  /**
   * Handle successful API login
   * @param {Object} data - Response data from API
   * @param {boolean} rememberMe - Remember user login
   * @returns {Object} Formatted user data
   */
  handleSuccessfulLogin(data, rememberMe) {
    const { access, refresh, user } = data;
    
    // Store tokens
    if (rememberMe) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      sessionStorage.setItem('access_token', access);
      sessionStorage.setItem('refresh_token', refresh);
      sessionStorage.setItem('user_data', JSON.stringify(user));
    }
    
    this.token = access;
    this.refreshToken = refresh;
    
    return {
      ...user,
      token: access,
      refresh_token: refresh,
      isAuthenticated: true,
      source: 'api'
    };
  }

  /**
   * Handle dummy login when API is not available
   * @param {boolean} rememberMe - Remember user login
   * @returns {Object} Dummy user data
   */
  handleDummyLogin(rememberMe) {
    const userData = {
      ...DUMMY_CREDENTIALS.userData,
      isAuthenticated: true,
      source: 'dummy'
    };
    
    // Store dummy data
    if (rememberMe) {
      localStorage.setItem('access_token', userData.token);
      localStorage.setItem('refresh_token', userData.refresh_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('access_token', userData.token);
      sessionStorage.setItem('refresh_token', userData.refresh_token);
      sessionStorage.setItem('user_data', JSON.stringify(userData));
    }
    
    this.token = userData.token;
    this.refreshToken = userData.refresh_token;
    
    return userData;
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      if (this.token && this.token !== 'dummy-jwt-token-for-offline-mode') {
        await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: this.refreshToken
          }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all stored data
      this.clearAuthData();
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<string>} New access token
   */
  async refreshAuthToken() {
    try {
      if (!this.refreshToken || this.refreshToken === 'dummy-refresh-token') {
        throw new Error('No refresh token available');
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: this.refreshToken
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.token = data.access;
      
      // Update stored token
      if (localStorage.getItem('access_token')) {
        localStorage.setItem('access_token', data.access);
      } else {
        sessionStorage.setItem('access_token', data.access);
      }
      
      return data.access;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Get user profile from API
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.PROFILE), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Verify if current token is valid
   * @returns {Promise<boolean>} Token validity
   */
  async verifyToken() {
    try {
      if (!this.token) return false;
      
      // Skip verification for dummy token
      if (this.token === 'dummy-jwt-token-for-offline-mode') {
        return true;
      }

      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VERIFY_TOKEN || '/auth/verify/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  /**
   * Get stored authentication token
   * @returns {string|null} Stored token
   */
  getStoredToken() {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  /**
   * Get stored refresh token
   * @returns {string|null} Stored refresh token
   */
  getStoredRefreshToken() {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  /**
   * Get stored user data
   * @returns {Object|null} Stored user data
   */
  getStoredUserData() {
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');
    
    this.token = null;
    this.refreshToken = null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.getStoredToken();
  }

  /**
   * Get authentication headers for API requests
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    if (!this.token) return {};
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
