// Mock API for testing Settings functionality
// This simulates the backend API responses for development/testing

export const mockSettingsAPI = {
  // UI Settings Mock Data
  mockUISettings: {
    success: true,
    data: [
      {
        setting_name: 'dashboard_theme',
        font_family: 'Inter, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        font_size: '16px',
        primary_color: '#3498db',
        secondary_color: '#2ecc71',
        background_color: '#ffffff',
        text_color: '#2c3e50',
        theme_mode: 'light',
        sidebar_collapsed: false,
        is_global: true,
        user_id: null,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ],
    message: 'UI settings retrieved successfully'
  },

  // Credentials Mock Data
  mockCredentials: {
    success: true,
    data: [
      {
        name: 'openai_production',
        credential_type: 'openai',
        description: 'Main OpenAI API for dashboard',
        api_key: 'sk-***hidden***',
        is_active: true,
        is_production: true,
        additional_config: {
          model: 'gpt-4',
          max_tokens: 4000,
          temperature: 0.7
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        name: 'aws_storage',
        credential_type: 'aws',
        description: 'AWS S3 storage credentials',
        api_key: 'AKIA***hidden***',
        is_active: true,
        is_production: false,
        additional_config: {
          secret_key: '***hidden***',
          region: 'us-east-1',
          bucket: 'my-dashboard-storage'
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ],
    message: 'Credentials retrieved successfully'
  },

  // App Settings Mock Data
  mockAppSettings: {
    success: true,
    data: [
      {
        key: 'max_users',
        value: '1000',
        setting_type: 'integer',
        category: 'limits',
        description: 'Maximum number of users allowed in the system',
        is_public: false,
        is_editable: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        key: 'app_name',
        value: 'DDS Admin Dashboard',
        setting_type: 'string',
        category: 'general',
        description: 'Application display name',
        is_public: true,
        is_editable: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        setting_type: 'boolean',
        category: 'system',
        description: 'Enable maintenance mode to disable user access',
        is_public: false,
        is_editable: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        key: 'email_settings',
        value: '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "use_tls": true}',
        setting_type: 'json',
        category: 'email',
        description: 'Email server configuration',
        is_public: false,
        is_editable: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }
    ],
    message: 'App settings retrieved successfully'
  },

  // Mock API Methods
  async getUISettings(params = {}) {
    console.log('🔧 Mock API: Getting UI settings', params);
    await this.simulateDelay();
    return this.mockUISettings;
  },

  async saveUISettings(data) {
    console.log('🔧 Mock API: Saving UI settings', data);
    await this.simulateDelay();
    return {
      success: true,
      message: 'Theme settings saved successfully!',
      data: data
    };
  },

  async getCredentials(params = {}) {
    console.log('🔧 Mock API: Getting credentials', params);
    await this.simulateDelay();
    return this.mockCredentials;
  },

  async saveCredentials(data) {
    console.log('🔧 Mock API: Saving credentials', data);
    await this.simulateDelay();
    return {
      success: true,
      message: 'Credentials saved successfully!',
      data: data
    };
  },

  async getAppSettings(params = {}) {
    console.log('🔧 Mock API: Getting app settings', params);
    await this.simulateDelay();
    return this.mockAppSettings;
  },

  async saveAppSettings(data) {
    console.log('🔧 Mock API: Saving app settings', data);
    await this.simulateDelay();
    return {
      success: true,
      message: 'Application setting saved successfully!',
      data: data
    };
  },

  async testCredential(credentialName) {
    console.log('🔧 Mock API: Testing credential', credentialName);
    await this.simulateDelay();
    return {
      success: true,
      message: `Credential "${credentialName}" test successful!`
    };
  },

  // Utility function to simulate API delay
  async simulateDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Toggle between mock and real API
  useMockAPI: true
};

// Export for use in development
export default mockSettingsAPI;
