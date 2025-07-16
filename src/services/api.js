import axios from 'axios';

// Base API configuration
// Use relative URL to leverage Vite's proxy configuration
const API_BASE_URL = '/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('authToken', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => {
    console.log('API: Making login request to /auth/login/ with:', {
      ...credentials,
      password: '***' // Hide password in logs
    });
    return apiClient.post('/auth/login/', credentials);
  },
  logout: () => apiClient.post('/auth/logout/'),
  refresh: (refreshToken) => apiClient.post('/auth/refresh/', { refresh: refreshToken }),
  forgotPassword: (usernameOrEmail) => apiClient.post('/auth/forgot-password/', { 
    username: usernameOrEmail.includes('@') ? undefined : usernameOrEmail,
    email: usernameOrEmail.includes('@') ? usernameOrEmail : undefined 
  }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password/', { token, password }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email/', { token }),
};

// User API endpoints
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile/'),
  updateProfile: (data) => apiClient.put('/user/profile/', data),
  changePassword: (data) => apiClient.post('/user/change-password/', data),
};

// Generic API methods
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export default apiClient;
