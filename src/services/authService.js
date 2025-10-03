import { getApiBaseURL } from '../config/api.js';

// Test credentials
export const DUMMY_CREDENTIALS = {
  username: 'hb@example.com',
  password: 'password123',
  userData: {
    id: 1,
    username: 'hb@example.com',
    email: 'hb@example.com',
    first_name: 'Haseeb',
    last_name: 'User',
    token: 'demo_token_for_testing',
    refresh_token: 'demo_refresh_token'
  }
};

// Live API working credentials
export const LIVE_TEST_CREDENTIALS = [
  {
    username: 'test.bhambhro@example.com',
    password: 'muhammad11223344',
    name: 'Bhambhro Test (Live API)'
  },
  {
    username: 'bhambhro.working1759244410488@gmail.com',
    password: 'muhammad11223344', 
    name: 'Bhambhro Working (Live API)'
  },
  {
    username: 'nawaz.test@dxdglobal.com',
    password: 'muhammad12345',
    name: 'Nawaz Test (Live API)'
  },
  {
    username: 'testuserwvo7lh@example.com', 
    password: 'testpass123',
    name: 'Test User (Live API)'
  }
];

class AuthService {
  constructor() {
    this.baseURL = getApiBaseURL();
    this.token = this.getStoredToken();
  }

  async login(username, password, rememberMe = false) {
    try {
      console.log('🔄 Attempting login with:', { username });

      const response = await fetch('https://dxdtime.ddsolutions.io/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });

      console.log('📡 API Response Status:', response.status);
      const responseText = await response.text();
      console.log('📡 API Response:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('✅ Login successful with live API');
        return this.handleSuccessfulLogin(data, rememberMe);
      } else {
        // Parse error response for better error handling
        const errorData = JSON.parse(responseText);
        console.log('❌ API Login failed:', errorData);
        
        // Check for specific error types
        if (errorData.errors?.non_field_errors) {
          const errorMessage = errorData.errors.non_field_errors[0];
          if (errorMessage.includes('No account found')) {
            throw new Error('No account found with this email address. Please check your email or register a new account.');
          } else if (errorMessage.includes('Invalid password')) {
            throw new Error('Invalid password. Please try again.');
          }
        }
        
        // Generic API error
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

    } catch (error) {
      console.error('❌ Login error:', error);
      
      // If API fails completely, check dummy credentials as fallback
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.log('🔄 Network error, checking dummy credentials...');
        if (username === DUMMY_CREDENTIALS.username && password === DUMMY_CREDENTIALS.password) {
          console.log('🔓 Using dummy credentials due to network error');
          return this.handleDummyLogin(rememberMe);
        }
      }
      
      // Final fallback to dummy credentials only for specific test accounts
      if (username === DUMMY_CREDENTIALS.username && password === DUMMY_CREDENTIALS.password) {
        console.log('🔓 API authentication failed, using dummy credentials');
        return this.handleDummyLogin(rememberMe);
      }
      
      // Check if credentials match known live test users but API failed
      const liveTestUser = LIVE_TEST_CREDENTIALS.find(user => 
        user.username === username && user.password === password
      );

      if (liveTestUser) {
        console.log('⚠️ Credentials match live test user, but API failed:', liveTestUser.name);
        throw new Error(`API Error: Your credentials for ${liveTestUser.name} are correct, but the server is currently unavailable. Please try again later.`);
      }
      
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('🔄 Attempting registration with:', { email: userData.email });

      const response = await fetch('https://dxdtime.ddsolutions.io/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          username: userData.username || userData.email,
          password: userData.password,
          password_confirm: userData.confirmPassword || userData.password,  // API expects password_confirm
          first_name: userData.firstName || '',
          last_name: userData.lastName || ''
        })
      });

      console.log('📡 Registration Response Status:', response.status);
      const responseText = await response.text();
      console.log('📡 Registration Response:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('✅ Registration successful with live API');
        
        // If registration includes tokens, handle login
        if (data.token || data.access) {
          return this.handleSuccessfulLogin(data, false);
        }
        
        return { 
          success: true, 
          message: 'Registration successful. Please login.',
          data 
        };
      } else {
        // Parse error response
        const errorData = JSON.parse(responseText);
        return {
          success: false,
          message: errorData.message || `Registration failed: ${response.status}`,
          errors: errorData.errors || {},
          status: response.status
        };
      }

    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: 'Registration failed due to network error',
        error: error.message
      };
    }
  }

  handleSuccessfulLogin(data, rememberMe) {
    const token = data.access || data.token;
    const storage = rememberMe ? localStorage : sessionStorage;
    
    if (token) {
      this.token = token;
      storage.setItem('token', token);
      storage.setItem('user_data', JSON.stringify(data.user || data));
      
      return {
        success: true,
        token,
        user: data.user || data,
        message: 'Login successful'
      };
    }
    
    throw new Error('No token received');
  }

  handleDummyLogin(rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    const userData = DUMMY_CREDENTIALS.userData;

    storage.setItem('token', userData.token);
    storage.setItem('user_data', JSON.stringify(userData));
    
    this.token = userData.token;
    
    return {
      success: true,
      token: userData.token,
      user: userData,
      message: 'Demo login successful'
    };
  }

  async logout() {
    this.clearAuthData();
    console.log('✅ Logout completed');
  }

  getStoredToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  clearAuthData() {
    ['token', 'user_data'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    this.token = null;
  }

  isAuthenticated() {
    return !!this.getStoredToken();
  }

  getAuthHeaders() {
    const token = this.getStoredToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
}

export default new AuthService();