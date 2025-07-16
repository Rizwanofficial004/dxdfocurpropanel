import axios from 'axios';
import { mockSettingsAPI } from './mockSettingsAPI';

// Settings API configuration
const SETTINGS_API_BASE = 'https://dxdtime.ddsolutions.io/api/settings';

// Development mode - set to true to use mock API
const USE_MOCK_API = true; // Set to false when backend is ready

// Create axios instance for settings API
const settingsClient = axios.create({
  baseURL: SETTINGS_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
settingsClient.interceptors.request.use(
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
settingsClient.interceptors.response.use(
  (response) => {
    console.log('Settings API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Settings API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Standard function to send data to any settings endpoint
async function sendSettingsData(endpoint, data) {
  try {
    const response = await settingsClient.post(`/${endpoint}/`, data);
    const result = response.data;
    
    if (result.success) {
      console.log('✅ Settings saved successfully:', result.message);
      return result;
    } else {
      console.error('❌ Error saving settings:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    throw error;
  }
}

// Settings API methods
export const settingsAPI = {
  // UI Settings (Theme Configuration)
  async getUISettings(params = {}) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.getUISettings(params);
    }
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/ui/?${queryString}` : '/ui/';
      const response = await settingsClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch UI settings');
    }
  },

  async saveUISettings(data) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.saveUISettings(data);
    }
    
    return sendSettingsData('ui', data);
  },

  async getThemeByName(settingName) {
    return this.getUISettings({ setting_name: settingName });
  },

  async getUserTheme(userId) {
    return this.getUISettings({ user_id: userId });
  },

  // Credentials Management
  async getCredentials(params = {}) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.getCredentials(params);
    }
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/credentials/?${queryString}` : '/credentials/';
      const response = await settingsClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch credentials');
    }
  },

  async saveCredentials(data) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.saveCredentials(data);
    }
    
    return sendSettingsData('credentials', data);
  },

  async getCredentialByName(name) {
    return this.getCredentials({ name });
  },

  async getCredentialsByType(type) {
    return this.getCredentials({ type });
  },

  // Application Settings
  async getAppSettings(params = {}) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.getAppSettings(params);
    }
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/app/?${queryString}` : '/app/';
      const response = await settingsClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch app settings');
    }
  },

  async saveAppSettings(data) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.saveAppSettings(data);
    }
    
    return sendSettingsData('app', data);
  },

  async getAppSettingByKey(key) {
    return this.getAppSettings({ key });
  },

  async getAppSettingsByCategory(category) {
    return this.getAppSettings({ category });
  },

  // Bulk Operations
  async saveBulkSettings(data) {
    return sendSettingsData('bulk', data);
  },

  // Utility functions
  async testCredential(credentialName) {
    if (USE_MOCK_API) {
      return mockSettingsAPI.testCredential(credentialName);
    }
    
    try {
      const response = await settingsClient.post(`/credentials/test/`, {
        name: credentialName
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to test credential');
    }
  },

  async exportSettings() {
    try {
      const response = await settingsClient.get('/export/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to export settings');
    }
  },

  async importSettings(settingsData) {
    try {
      const response = await settingsClient.post('/import/', settingsData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to import settings');
    }
  },

  // Theme application functions
  applyThemeSettings(settings) {
    const root = document.documentElement;
    
    // Apply CSS variables
    if (settings.primary_color) {
      root.style.setProperty('--primary-color', settings.primary_color);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--secondary-color', settings.secondary_color);
    }
    if (settings.background_color) {
      root.style.setProperty('--background-color', settings.background_color);
    }
    if (settings.text_color) {
      root.style.setProperty('--text-color', settings.text_color);
    }
    if (settings.font_family) {
      root.style.setProperty('--font-family', settings.font_family);
    }
    if (settings.font_size) {
      root.style.setProperty('--font-size', settings.font_size);
    }
    
    // Apply theme mode
    if (settings.theme_mode) {
      document.body.className = `theme-${settings.theme_mode}`;
    }
    
    // Handle sidebar
    if (settings.sidebar_collapsed !== undefined) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('collapsed', settings.sidebar_collapsed);
      }
    }
  },

  // Auto-load settings on page load
  async loadAndApplyTheme(themeName = 'dashboard_theme') {
    try {
      const response = await this.getThemeByName(themeName);
      
      if (response.success && response.data.length > 0) {
        this.applyThemeSettings(response.data[0]);
        return response.data[0];
      }
    } catch (error) {
      console.error('Failed to load and apply theme settings:', error);
    }
    return null;
  }
};

// Export the sendSettingsData function for direct use
export { sendSettingsData };

// Default export
export default settingsAPI;
