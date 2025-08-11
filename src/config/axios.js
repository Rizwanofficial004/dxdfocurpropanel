// Axios Configuration - Global timeout and error handling
import axios from 'axios';

// Set default timeout for all axios requests
axios.defaults.timeout = 30000; // 30 seconds for S3 operations

// Create different axios instances for different types of operations
export const fastAxios = axios.create({
  timeout: 5000, // 5 seconds for fast operations (health checks, etc.)
});

export const normalAxios = axios.create({
  timeout: 15000, // 15 seconds for normal operations
});

export const slowAxios = axios.create({
  timeout: 60000, // 60 seconds for slow operations (large S3 scans, file uploads)
});

// Add request interceptor for debugging
const addRequestInterceptor = (instance, name) => {
  instance.interceptors.request.use(
    (config) => {
      console.log(`🔍 ${name} Request:`, {
        url: config.url,
        method: config.method?.toUpperCase(),
        timeout: config.timeout,
        timestamp: new Date().toISOString()
      });
      return config;
    },
    (error) => {
      console.error(`❌ ${name} Request Error:`, error);
      return Promise.reject(error);
    }
  );
};

// Add response interceptor for debugging
const addResponseInterceptor = (instance, name) => {
  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ ${name} Response:`, {
        status: response.status,
        url: response.config.url,
        dataSize: JSON.stringify(response.data || {}).length,
        duration: Date.now() - (response.config.metadata?.startTime || 0)
      });
      return response;
    },
    (error) => {
      const isTimeout = error.code === 'ECONNABORTED';
      const isNetworkError = error.message === 'Network Error';
      
      console.error(`❌ ${name} Response Error:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        timeout: error.config?.timeout,
        isTimeout,
        isNetworkError,
        timestamp: new Date().toISOString()
      });

      // Enhance error with user-friendly messages
      if (isTimeout) {
        error.userMessage = `Request timed out after ${error.config?.timeout / 1000}s. The server may be processing large amounts of data or is slow to respond.`;
      } else if (isNetworkError) {
        error.userMessage = 'Network connection failed. Please check if the server is running and accessible.';
      } else if (error.response?.status === 404) {
        error.userMessage = 'API endpoint not found. Please check if the backend server has the required endpoints.';
      } else if (error.response?.status >= 500) {
        error.userMessage = 'Server error occurred. Please try again or contact support.';
      }

      return Promise.reject(error);
    }
  );
};

// Add interceptors to all instances
addRequestInterceptor(axios, 'Default');
addResponseInterceptor(axios, 'Default');

addRequestInterceptor(fastAxios, 'Fast');
addResponseInterceptor(fastAxios, 'Fast');

addRequestInterceptor(normalAxios, 'Normal');
addResponseInterceptor(normalAxios, 'Normal');

addRequestInterceptor(slowAxios, 'Slow');
addResponseInterceptor(slowAxios, 'Slow');

// Helper function to choose the right axios instance based on operation type
export const getAxiosInstance = (operationType = 'normal') => {
  switch (operationType) {
    case 'fast':
      return fastAxios;
    case 'slow':
      return slowAxios;
    case 'normal':
    default:
      return normalAxios;
  }
};

// Retry logic helper
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      const shouldRetry = error.code === 'ECONNABORTED' || error.message === 'Network Error';
      
      if (isLastAttempt || !shouldRetry) {
        throw error;
      }
      
      console.log(`🔄 Retry attempt ${i + 1}/${maxRetries} after ${delay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

export default {
  axios,
  fastAxios,
  normalAxios,
  slowAxios,
  getAxiosInstance,
  withRetry
};
