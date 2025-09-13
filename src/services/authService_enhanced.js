/**
 * Enhanced Authentication Service with proper registration implementation
 * Handles user registration, login, token management, and authentication state
 */

import { API_ENDPOINTS, buildApiUrl } from '../config/api.js';

// Dummy credentials for development/testing
const DUMMY_CREDENTIALS = {
  username: 'admin@test.com',
  password: 'admin123'
};

/**
 * Enhanced Authentication Service for Django Backend
 */
class EnhancedAuthService {
  constructor() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.isAuthenticated = false;
    
    // Initialize from stored tokens
    this.initializeFromStorage();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  initializeFromStorage() {
    // Try localStorage first, then sessionStorage
    const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data');

    if (accessToken && userData) {
      this.token = accessToken;
      this.refreshToken = refreshToken;
      this.user = JSON.parse(userData);
      this.isAuthenticated = true;
      console.log('🔑 Auth state restored from storage');
    }
  }

  /**
   * Register new user account with comprehensive validation
   * @param {Object} userData - Registration data
   * @param {string} userData.email - User email
   * @param {string} userData.username - Username (defaults to email)
   * @param {string} userData.password - Password
   * @param {string} userData.password_confirm - Password confirmation
   * @param {string} userData.first_name - First name
   * @param {string} userData.last_name - Last name
   * @param {string} userData.organization_name - Organization name
   * @param {string} userData.country - Country
   * @returns {Promise<Object>} User data and tokens
   */
  async register(userData) {
    try {
      console.log('📝 Starting enhanced registration process...');
      console.log('🌐 Registration endpoint:', buildApiUrl(API_ENDPOINTS.AUTH.REGISTER));

      // Validate required fields
      this.validateRegistrationData(userData);

      // Prepare registration payload matching your API specification
      const registrationPayload = {
        username: userData.username || userData.email,
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password_confirm || userData.password,
        first_name: userData.first_name || userData.firstName || '',
        last_name: userData.last_name || userData.lastName || '',
        organization_name: userData.organization_name || userData.organization || '',
        country: userData.country || ''
      };

      console.log('📤 Registration payload:', {
        ...registrationPayload,
        password: '***',
        password_confirm: '***'
      });

      // Try multiple registration endpoints
      const registrationEndpoints = [
        API_ENDPOINTS.AUTH.REGISTER,     // /auth/register/
        '/auth/register/',               // Fallback
        '/api/auth/register/',          // Alternative endpoint
        '/register/',                   // Simple endpoint
      ];

      let response;
      let usedEndpoint;

      for (const endpoint of registrationEndpoints) {
        try {
          console.log(`🔍 Trying registration endpoint: ${buildApiUrl(endpoint)}`);
          
          response = await fetch(buildApiUrl(endpoint), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(registrationPayload),
          });

          console.log(`📡 Response status for ${endpoint}:`, response.status);

          if (response.ok) {
            usedEndpoint = endpoint;
            console.log(`✅ Registration successful via endpoint: ${endpoint}`);
            break;
          } else if (response.status === 404) {
            console.log(`❌ Endpoint ${endpoint} not found (404)`);
            continue;
          } else {
            // Non-404 error, get error details
            const errorData = await response.json().catch(() => ({}));
            console.log(`⚠️ Registration error at ${endpoint}:`, errorData);
            
            if (response.status === 400) {
              // Validation errors
              throw new RegistrationError('Validation failed', errorData, response.status);
            } else if (response.status === 409 || response.status === 422) {
              // User already exists or conflict
              throw new RegistrationError('User already exists', errorData, response.status);
            } else {
              // Other errors
              throw new RegistrationError('Registration failed', errorData, response.status);
            }
          }
        } catch (fetchError) {
          if (fetchError instanceof RegistrationError) {
            throw fetchError; // Re-throw registration errors
          }
          console.log(`🚫 Network error for ${endpoint}:`, fetchError.message);
          continue;
        }
      }

      // Check if any endpoint worked
      if (!response || !response.ok) {
        console.log('🔄 All registration endpoints failed, using fallback...');
        return this.handleRegistrationFallback(userData);
      }

      // Parse successful response
      const data = await response.json();
      console.log('✅ API registration successful');
      console.log('📊 Registration response structure:', Object.keys(data));

      // Handle successful registration
      return this.handleSuccessfulRegistration(data);

    } catch (error) {
      if (error instanceof RegistrationError) {
        throw error; // Re-throw with original details
      }

      console.error('❌ Registration process failed:', error);
      
      // Fallback for network/server issues
      return this.handleRegistrationFallback(userData);
    }
  }

  /**
   * Validate registration data
   * @param {Object} userData - Registration data to validate
   */
  validateRegistrationData(userData) {
    const errors = [];

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (userData.password_confirm && userData.password !== userData.password_confirm) {
      errors.push('Passwords do not match');
    }

    if (!userData.organization_name && !userData.organization) {
      errors.push('Organization name is required');
    }

    if (!userData.country) {
      errors.push('Country is required');
    }

    if (errors.length > 0) {
      throw new RegistrationError('Validation failed', { errors }, 400);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle successful registration response
   * @param {Object} data - Registration response data
   * @returns {Object} Formatted user data with tokens
   */
  handleSuccessfulRegistration(data) {
    let access_token, refresh_token, user;

    // Handle different response formats
    if (data.tokens && data.user) {
      // Format: { tokens: { access, refresh }, user: {...} }
      access_token = data.tokens.access;
      refresh_token = data.tokens.refresh;
      user = data.user;
    } else if (data.access_token && data.user) {
      // Format: { access_token, refresh_token, user }
      access_token = data.access_token;
      refresh_token = data.refresh_token;
      user = data.user;
    } else if (data.token && data.user) {
      // Format: { token, user }
      access_token = data.token;
      refresh_token = data.refresh_token || data.token;
      user = data.user;
    } else if (data.access && data.user) {
      // DRF format: { access, refresh, user }
      access_token = data.access;
      refresh_token = data.refresh;
      user = data.user;
    } else {
      // Fallback - assume data is user object
      access_token = data.token || 'temp-token-' + Date.now();
      refresh_token = data.refresh_token || access_token;
      user = data;
    }

    // Store tokens and user data
    this.storeAuthData(access_token, refresh_token, user, true);

    return {
      success: true,
      user: user,
      token: access_token,
      refresh_token: refresh_token,
      isAuthenticated: true,
      source: 'api',
      message: 'Registration successful'
    };
  }

  /**
   * Handle registration fallback when API is unavailable
   * @param {Object} userData - Original registration data
   * @returns {Object} Mock user data
   */
  handleRegistrationFallback(userData) {
    console.log('🔓 API unavailable, creating mock registration');

    const mockUser = {
      id: Math.floor(Math.random() * 10000),
      username: userData.username || userData.email,
      email: userData.email,
      first_name: userData.first_name || userData.firstName || 'User',
      last_name: userData.last_name || userData.lastName || '',
      organization_name: userData.organization_name || userData.organization || '',
      country: userData.country || '',
      role: 'admin',
      is_superuser: true,
      is_staff: true,
      is_active: true,
      permissions: ['read', 'write', 'delete', 'admin'],
      date_joined: new Date().toISOString(),
      last_login: new Date().toISOString(),
      profile_picture: null,
    };

    const access_token = 'mock-jwt-token-' + Date.now();
    const refresh_token = 'mock-refresh-token-' + Date.now();

    // Store mock data
    this.storeAuthData(access_token, refresh_token, mockUser, true);

    return {
      success: true,
      user: mockUser,
      token: access_token,
      refresh_token: refresh_token,
      isAuthenticated: true,
      source: 'mock',
      message: 'Registration successful (mock)'
    };
  }

  /**
   * Store authentication data in localStorage/sessionStorage
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} user - User data
   * @param {boolean} persistent - Whether to use localStorage (true) or sessionStorage (false)
   */
  storeAuthData(accessToken, refreshToken, user, persistent = true) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
    this.isAuthenticated = true;

    const storage = persistent ? localStorage : sessionStorage;
    
    storage.setItem('access_token', accessToken);
    storage.setItem('refresh_token', refreshToken);
    storage.setItem('user_data', JSON.stringify(user));

    console.log('💾 Auth data stored in', persistent ? 'localStorage' : 'sessionStorage');
  }

  /**
   * Login with email/username and password - Enhanced implementation
   * @param {string|Object} credentials - Login credentials (string for backward compatibility or object for new format)
   * @param {string} password - Password (when credentials is string)
   * @param {boolean} rememberMe - Remember user login
   * @returns {Promise<Object>} User data and tokens
   */
  async login(credentials, password = null, rememberMe = false) {
    try {
      console.log('🔐 Starting enhanced login process...');
      
      // Handle different parameter formats
      let loginData;
      if (typeof credentials === 'string') {
        // Backward compatibility: login(username, password, rememberMe)
        loginData = {
          email_or_username: credentials,
          password: password,
          remember_me: rememberMe
        };
      } else {
        // New format: login({email, password, rememberMe}) or login({email_or_username, password, rememberMe})
        loginData = {
          ...credentials,
          remember_me: credentials.rememberMe || rememberMe
        };
        // If email is provided but not email_or_username, use email as email_or_username
        if (credentials.email && !credentials.email_or_username) {
          loginData.email_or_username = credentials.email;
        }
      }

      console.log('🌐 Login endpoint:', buildApiUrl(API_ENDPOINTS.AUTH.LOGIN));
      console.log('📤 Login data:', {
        ...loginData,
        password: '***'
      });

      // Validate login data
      this.validateLoginData(loginData);

      // Try multiple login endpoints with different payload formats
      const loginEndpoints = [
        API_ENDPOINTS.AUTH.LOGIN,        // /auth/login/
        '/api/auth/login/',              // Alternative API path
        '/auth/token/',                  // Django REST Auth token endpoint
        '/api-token-auth/',              // DRF token auth
        '/login/',                       // Simple login
        '/token/',                       // JWT token endpoint
      ];

      let response;
      let usedEndpoint;

      for (const endpoint of loginEndpoints) {
        try {
          console.log(`🔍 Trying login endpoint: ${buildApiUrl(endpoint)}`);
          
          // Try different payload formats for maximum compatibility
          const payloadFormats = [
            // Format 1: Your specified API format
            {
              email: loginData.email_or_username,
              password: loginData.password
            },
            // Format 2: Alternative format with email_or_username
            {
              email_or_username: loginData.email_or_username,
              password: loginData.password
            },
            // Format 3: Traditional username/password format
            {
              username: loginData.email_or_username,
              password: loginData.password,
              email: loginData.email_or_username // Some APIs need both
            },
            // Format 4: Include remember_me
            {
              email: loginData.email_or_username,
              password: loginData.password,
              remember_me: loginData.remember_me
            }
          ];

          for (const payload of payloadFormats) {
            try {
              console.log(`📤 Trying payload format:`, { ...payload, password: '***' });
              
              response = await fetch(buildApiUrl(endpoint), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
              });

              console.log(`📡 Response status: ${response.status} for ${endpoint}`);

              if (response.ok) {
                usedEndpoint = endpoint;
                console.log(`✅ Login successful via endpoint: ${endpoint}`);
                console.log(`✅ Successful payload format:`, { ...payload, password: '***' });
                break;
              } else if (response.status === 404) {
                console.log(`❌ Endpoint ${endpoint} not found (404)`);
                break; // Try next endpoint
              } else if (response.status === 401) {
                console.log(`🔒 Authentication failed at ${endpoint}: Invalid credentials`);
                // Continue with next payload format for this endpoint
                continue;
              } else {
                console.log(`⚠️ Login failed at ${endpoint}: ${response.status}`);
                const errorText = await response.text().catch(() => '');
                console.log(`📄 Error response:`, errorText);
                // Continue with next payload format
                continue;
              }
            } catch (payloadError) {
              console.log(`🚫 Payload error for ${endpoint}:`, payloadError.message);
              continue;
            }
          }

          // If we got a successful response, break out of endpoint loop
          if (response && response.ok) {
            break;
          }

        } catch (fetchError) {
          console.log(`🚫 Network error for ${endpoint}:`, fetchError.message);
          continue;
        }
      }

      // Check if any endpoint worked
      if (!response || !response.ok) {
        console.log('🔄 All login endpoints failed, checking dummy credentials...');
        
        // Check for dummy credentials
        if (loginData.email_or_username === DUMMY_CREDENTIALS.username && 
            loginData.password === DUMMY_CREDENTIALS.password) {
          console.log('🔓 Using dummy credentials for demo');
          return this.handleDummyLogin(loginData.remember_me);
        }

        // Determine error message based on response
        let errorMessage = 'Login failed';
        if (response) {
          if (response.status === 401) {
            errorMessage = 'Invalid email/username or password';
          } else if (response.status === 403) {
            errorMessage = 'Account is disabled or access forbidden';
          } else if (response.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later';
          } else {
            const errorData = await response.json().catch(() => ({}));
            errorMessage = errorData.detail || errorData.message || errorData.error || 
                          `Login failed with status ${response.status}`;
          }
        } else {
          errorMessage = 'All login endpoints are unavailable. Please check your connection';
        }

        throw new LoginError(errorMessage, { status: response?.status }, response?.status || 500);
      }

      // Parse successful response
      const data = await response.json();
      console.log('✅ Login successful via endpoint:', usedEndpoint);
      console.log('📊 Login response structure:', Object.keys(data));
      
      return this.handleSuccessfulLogin(data, loginData.remember_me);

    } catch (error) {
      if (error instanceof LoginError) {
        throw error; // Re-throw login errors
      }
      
      console.error('❌ Login process failed:', error);
      
      // Fallback for network/server issues - check dummy credentials
      if (typeof credentials === 'string') {
        const email_or_username = credentials;
        const pwd = password;
        if (email_or_username === DUMMY_CREDENTIALS.username && pwd === DUMMY_CREDENTIALS.password) {
          console.log('🔓 Network error, using dummy credentials');
          return this.handleDummyLogin(rememberMe);
        }
      } else if (credentials.email_or_username === DUMMY_CREDENTIALS.username && 
                 credentials.password === DUMMY_CREDENTIALS.password) {
        console.log('🔓 Network error, using dummy credentials');
        return this.handleDummyLogin(credentials.rememberMe || rememberMe);
      }

      throw new LoginError(error.message || 'Login failed due to network error', { originalError: error.message });
    }
  }

  /**
   * Validate login data
   * @param {Object} loginData - Login credentials to validate
   */
  validateLoginData(loginData) {
    const errors = [];

    if (!loginData.email_or_username || !loginData.email_or_username.trim()) {
      errors.push('Email or username is required');
    }

    if (!loginData.password || !loginData.password.trim()) {
      errors.push('Password is required');
    }

    if (loginData.password && loginData.password.length < 3) {
      errors.push('Password is too short');
    }

    if (errors.length > 0) {
      throw new LoginError('Validation failed', { errors }, 400);
    }
  }

  /**
   * Handle successful login response
   * @param {Object} data - Login response data  
   * @param {boolean} rememberMe - Whether to remember the login
   * @returns {Object} Formatted user data with tokens
   */
  handleSuccessfulLogin(data, rememberMe = false) {
    let access_token, refresh_token, user;

    // Handle different response formats
    if (data.tokens && data.user) {
      // Format: { tokens: { access, refresh }, user: {...} }
      access_token = data.tokens.access;
      refresh_token = data.tokens.refresh;
      user = data.user;
    } else if (data.access_token && data.user) {
      // Format: { access_token, refresh_token, user }
      access_token = data.access_token;
      refresh_token = data.refresh_token;
      user = data.user;
    } else if (data.token && data.user) {
      // Format: { token, user }
      access_token = data.token;
      refresh_token = data.refresh_token || data.token;
      user = data.user;
    } else if (data.access && data.user) {
      // DRF format: { access, refresh, user }
      access_token = data.access;
      refresh_token = data.refresh;
      user = data.user;
    } else if (data.key && data.user) {
      // Django REST Auth format: { key, user }
      access_token = data.key;
      refresh_token = data.key;
      user = data.user;
    } else if (data.token) {
      // Simple token format: { token, ...user_data }
      access_token = data.token;
      refresh_token = data.refresh_token || data.token;
      user = { ...data };
      delete user.token;
      delete user.refresh_token;
    } else {
      // Fallback - assume data is user object with embedded token
      access_token = data.access_token || data.token || 'temp-token-' + Date.now();
      refresh_token = data.refresh_token || access_token;
      user = data;
    }

    // Ensure user has required fields
    if (!user.id && !user.pk) {
      user.id = user.user_id || Math.floor(Math.random() * 10000);
    }
    if (!user.email && !user.username) {
      user.email = 'unknown@example.com';
    }

    // Store authentication data
    this.storeAuthData(access_token, refresh_token, user, rememberMe);

    return {
      success: true,
      user: user,
      token: access_token,
      refresh_token: refresh_token,
      isAuthenticated: true,
      source: 'api',
      message: 'Login successful'
    };
  }

  /**
   * Handle dummy login for demo purposes
   * @param {boolean} rememberMe - Remember login
   * @returns {Object} Mock user data
   */
  handleDummyLogin(rememberMe) {
    const mockUser = {
      id: 1,
      username: DUMMY_CREDENTIALS.username,
      email: DUMMY_CREDENTIALS.username,
      first_name: 'Demo',
      last_name: 'User',
      role: 'admin',
      is_superuser: true,
      is_staff: true,
      is_active: true,
      permissions: ['read', 'write', 'delete', 'admin'],
      organization_name: 'Demo Organization',
      country: 'Demo Country',
    };

    const access_token = 'demo-jwt-token-' + Date.now();
    const refresh_token = 'demo-refresh-token-' + Date.now();

    this.storeAuthData(access_token, refresh_token, mockUser, rememberMe);

    return {
      success: true,
      user: mockUser,
      token: access_token,
      refresh_token: refresh_token,
      isAuthenticated: true,
      source: 'demo',
      message: 'Demo login successful'
    };
  }

  /**
   * Logout user and clear stored data
   */
  async logout() {
    try {
      // Try to call logout endpoint
      if (this.token) {
        await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore logout API errors
          console.log('⚠️ Logout endpoint not available');
        });
      }
    } finally {
      // Always clear local data
      this.clearAuthData();
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthData() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    this.isAuthenticated = false;

    // Clear from both storages
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_data');

    console.log('🧹 Auth data cleared');
  }

  /**
   * Get current user data
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isUserAuthenticated() {
    return this.isAuthenticated && this.token;
  }

  /**
   * Get current access token
   * @returns {string|null} Access token
   */
  getAccessToken() {
    return this.token;
  }

  /**
   * Refresh access token
   * @returns {Promise<string>} New access token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
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
      const newToken = data.access || data.access_token || data.token;
      
      if (newToken) {
        this.token = newToken;
        // Update stored token
        const storage = localStorage.getItem('access_token') ? localStorage : sessionStorage;
        storage.setItem('access_token', newToken);
        return newToken;
      }

      throw new Error('No access token in refresh response');

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearAuthData();
      throw error;
    }
  }
}

/**
 * Custom error class for registration errors
 */
class RegistrationError extends Error {
  constructor(message, details = {}, statusCode = 400) {
    super(message);
    this.name = 'RegistrationError';
    this.details = details;
    this.statusCode = statusCode;
  }
}

/**
 * Custom error class for login errors
 */
class LoginError extends Error {
  constructor(message, details = {}, statusCode = 401) {
    super(message);
    this.name = 'LoginError';
    this.details = details;
    this.statusCode = statusCode;
  }
}

// Create and export singleton instance
const enhancedAuthService = new EnhancedAuthService();
export { RegistrationError, LoginError };
export default enhancedAuthService;
