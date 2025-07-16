# API Endpoints for React Dashboard Integration

## 🚀 Base Configuration

```javascript
// API Configuration for your React project
const API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000/api/settings',
  headers: {
    'Content-Type': 'application/json',
    // Add authentication if needed
    // 'Authorization': 'Bearer your-token-here'
  }
};
```

---

## 📋 Complete API Endpoints List

### 🎨 UI Settings Endpoints

| Method | Endpoint | Description | Usage in React |
|--------|----------|-------------|----------------|
| `POST` | `/api/settings/ui/` | Save/Update UI Settings | Theme configuration form |
| `GET` | `/api/settings/ui/` | Get all UI settings | Load existing themes |
| `GET` | `/api/settings/ui/?setting_name=theme_name` | Get specific theme | Load particular theme |
| `GET` | `/api/settings/ui/?user_id=123` | Get user-specific settings | Personal themes |

### 🔐 Credentials Endpoints

| Method | Endpoint | Description | Usage in React |
|--------|----------|-------------|----------------|
| `POST` | `/api/settings/credentials/` | Save/Update Credentials | OpenAI, AWS, DB forms |
| `GET` | `/api/settings/credentials/` | Get all credentials (masked) | List all configurations |
| `GET` | `/api/settings/credentials/?name=openai_prod` | Get specific credential | Load specific config |
| `GET` | `/api/settings/credentials/?type=openai` | Filter by type | Get all OpenAI configs |

### ⚙️ Application Settings Endpoints

| Method | Endpoint | Description | Usage in React |
|--------|----------|-------------|----------------|
| `POST` | `/api/settings/app/` | Save/Update App Settings | Application configurations |
| `GET` | `/api/settings/app/` | Get all app settings | Load app configurations |
| `GET` | `/api/settings/app/?key=max_users` | Get specific setting | Load specific setting |
| `GET` | `/api/settings/app/?category=security` | Filter by category | Get category settings |

### 🔄 Bulk Operations Endpoint

| Method | Endpoint | Description | Usage in React |
|--------|----------|-------------|----------------|
| `POST` | `/api/settings/bulk/` | Bulk save multiple settings | Initial setup, imports |

---

## 💻 React Integration Code

### 1. API Service Class

```javascript
// services/settingsApi.js
class SettingsAPI {
  constructor() {
    this.baseURL = 'http://127.0.0.1:8000/api/settings';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // UI Settings Methods
  async saveUISettings(data) {
    return this.request('/ui/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getUISettings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/ui/?${queryString}` : '/ui/';
    return this.request(endpoint);
  }

  // Credentials Methods
  async saveCredentials(data) {
    return this.request('/credentials/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getCredentials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/credentials/?${queryString}` : '/credentials/';
    return this.request(endpoint);
  }

  // App Settings Methods
  async saveAppSettings(data) {
    return this.request('/app/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAppSettings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/app/?${queryString}` : '/app/';
    return this.request(endpoint);
  }

  // Bulk Operations
  async saveBulkSettings(data) {
    return this.request('/bulk/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export default new SettingsAPI();
```

### 2. Custom React Hook

```javascript
// hooks/useSettingsAPI.js
import { useState, useCallback } from 'react';
import settingsAPI from '../services/settingsApi';

export const useSettingsAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const clearMessage = useCallback(() => {
    setMessage('');
    setError(null);
  }, []);

  const handleRequest = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const result = await apiCall();
      
      if (result.success) {
        setMessage('✅ Settings saved successfully!');
        return result.data;
      } else {
        setError(result.message);
        setMessage(`❌ Error: ${result.message}`);
        return null;
      }
    } catch (err) {
      setError(err.message);
      setMessage(`❌ Network error: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // UI Settings
  const saveUISettings = useCallback((data) => {
    return handleRequest(() => settingsAPI.saveUISettings(data));
  }, [handleRequest]);

  const loadUISettings = useCallback((params) => {
    return handleRequest(() => settingsAPI.getUISettings(params));
  }, [handleRequest]);

  // Credentials
  const saveCredentials = useCallback((data) => {
    return handleRequest(() => settingsAPI.saveCredentials(data));
  }, [handleRequest]);

  const loadCredentials = useCallback((params) => {
    return handleRequest(() => settingsAPI.getCredentials(params));
  }, [handleRequest]);

  // App Settings
  const saveAppSettings = useCallback((data) => {
    return handleRequest(() => settingsAPI.saveAppSettings(data));
  }, [handleRequest]);

  const loadAppSettings = useCallback((params) => {
    return handleRequest(() => settingsAPI.getAppSettings(params));
  }, [handleRequest]);

  return {
    loading,
    error,
    message,
    clearMessage,
    saveUISettings,
    loadUISettings,
    saveCredentials,
    loadCredentials,
    saveAppSettings,
    loadAppSettings
  };
};
```

### 3. Updated Settings Component

```javascript
// Update your Settings component to use the API hook
import React, { useState, useEffect } from 'react';
import { useSettingsAPI } from '../hooks/useSettingsAPI';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('ui');
  const {
    loading,
    message,
    clearMessage,
    saveUISettings,
    loadUISettings,
    saveCredentials,
    loadCredentials
  } = useSettingsAPI();

  // Load existing settings on component mount
  useEffect(() => {
    loadUISettings();
    loadCredentials();
  }, [loadUISettings, loadCredentials]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  // Theme form handler - updated
  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const themeData = {
      setting_name: formData.get('settingName'),
      font_family: formData.get('fontFamily'),
      font_size: formData.get('fontSize'),
      primary_color: formData.get('primaryColor'),
      secondary_color: formData.get('secondaryColor'),
      background_color: formData.get('backgroundColor'),
      text_color: formData.get('textColor'),
      theme_mode: formData.get('themeMode'),
      sidebar_collapsed: formData.has('sidebarCollapsed'),
      is_global: formData.has('isGlobal'),
      user_id: null
    };
    
    await saveUISettings(themeData);
  };

  // OpenAI form handler - updated
  const handleOpenAISubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const credentialData = {
      name: formData.get('credentialName'),
      credential_type: 'openai',
      description: formData.get('credentialDescription'),
      api_key: formData.get('apiKey'),
      is_active: formData.has('isActive'),
      is_production: formData.has('isProduction'),
      additional_config: {
        model: formData.get('aiModel'),
        max_tokens: parseInt(formData.get('maxTokens')),
        temperature: parseFloat(formData.get('temperature'))
      }
    };
    
    const result = await saveCredentials(credentialData);
    if (result) {
      e.target.reset(); // Clear form on success
    }
  };

  // Database form handler - updated
  const handleDatabaseSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const credentialData = {
      name: formData.get('dbName'),
      credential_type: 'database',
      description: formData.get('dbDescription'),
      username: formData.get('dbUsername'),
      password: formData.get('dbPassword'),
      host: formData.get('dbHost'),
      port: parseInt(formData.get('dbPort')),
      database_name: formData.get('dbDatabase'),
      is_active: formData.has('dbIsActive'),
      is_production: formData.has('dbIsProduction'),
      additional_config: {
        ssl_mode: formData.get('dbSslMode'),
        connection_timeout: parseInt(formData.get('dbTimeout'))
      }
    };
    
    const result = await saveCredentials(credentialData);
    if (result) {
      e.target.reset();
    }
  };

  // AWS form handler - updated
  const handleAWSSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const credentialData = {
      name: formData.get('awsName'),
      credential_type: 'aws',
      description: formData.get('awsDescription'),
      access_key: formData.get('awsAccessKey'),
      secret_key: formData.get('awsSecretKey'),
      is_active: formData.has('awsIsActive'),
      is_production: formData.has('awsIsProduction'),
      additional_config: {
        region: formData.get('awsRegion'),
        bucket_name: formData.get('awsBucket'),
        default_acl: formData.get('awsAcl'),
        custom_domain: formData.get('awsCustomDomain')
      }
    };
    
    const result = await saveCredentials(credentialData);
    if (result) {
      e.target.reset();
    }
  };

  // Update your form onSubmit handlers
  // For theme form: onSubmit={handleThemeSubmit}
  // For OpenAI form: onSubmit={handleOpenAISubmit}
  // For Database form: onSubmit={handleDatabaseSubmit}
  // For AWS form: onSubmit={handleAWSSubmit}

  // Rest of your component remains the same...
};
```

---

## 🔗 API Request Examples

### UI Settings Request
```javascript
// POST /api/settings/ui/
const themeData = {
  setting_name: "dashboard_theme",
  font_family: "Roboto, sans-serif",
  font_size: "16px",
  primary_color: "#3498db",
  secondary_color: "#2ecc71",
  background_color: "#ffffff",
  text_color: "#2c3e50",
  theme_mode: "light",
  sidebar_collapsed: false,
  is_global: true,
  user_id: null
};

fetch('http://127.0.0.1:8000/api/settings/ui/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(themeData)
});
```

### OpenAI Credentials Request
```javascript
// POST /api/settings/credentials/
const openaiData = {
  name: "openai_production",
  credential_type: "openai",
  description: "Main OpenAI API for dashboard",
  api_key: "sk-...",
  is_active: true,
  is_production: false,
  additional_config: {
    model: "gpt-4",
    max_tokens: 4000,
    temperature: 0.7
  }
};

fetch('http://127.0.0.1:8000/api/settings/credentials/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(openaiData)
});
```

### Database Credentials Request
```javascript
// POST /api/settings/credentials/
const databaseData = {
  name: "main_database",
  credential_type: "database",
  description: "Main application database",
  username: "db_user",
  password: "secure_password",
  host: "localhost",
  port: 5432,
  database_name: "myapp_db",
  is_active: true,
  is_production: true,
  additional_config: {
    ssl_mode: "require",
    connection_timeout: 30
  }
};
```

### AWS Credentials Request
```javascript
// POST /api/settings/credentials/
const awsData = {
  name: "aws_storage",
  credential_type: "aws",
  description: "AWS S3 storage configuration",
  access_key: "AKIA...",
  secret_key: "...",
  is_active: true,
  is_production: true,
  additional_config: {
    region: "eu-north-1",
    bucket_name: "ddsfocustime",
    default_acl: "private",
    custom_domain: "https://cdn.yourdomain.com"
  }
};
```

---

## 📥 API Response Format

### Success Response
```javascript
{
  "success": true,
  "message": "Settings saved successfully",
  "data": {
    "id": 1,
    "setting_name": "dashboard_theme",
    "font_family": "Roboto, sans-serif",
    // ... other fields
    "created_at": "2025-07-12T10:30:00Z",
    "updated_at": "2025-07-12T10:30:00Z"
  },
  "timestamp": "2025-07-12T10:30:00.123456"
}
```

### Error Response
```javascript
{
  "success": false,
  "message": "Validation error: Invalid color format",
  "data": {},
  "timestamp": "2025-07-12T10:30:00.123456"
}
```

---

## 🚀 Quick Setup Steps

### 1. Install in your React project:
```bash
# No additional packages needed - uses fetch API
```

### 2. Add API service:
```bash
# Create services/settingsApi.js (copy code above)
```

### 3. Add custom hook:
```bash
# Create hooks/useSettingsAPI.js (copy code above)
```

### 4. Update your Settings component:
```bash
# Replace your sendSettingsData function with the new hooks
```

### 5. Test the integration:
```bash
# Start your Django server: python manage.py runserver
# Start your React app: npm start
# Test form submissions
```

---

## 🎯 Ready to Use!

Your React application now has complete integration with the settings management APIs. All forms will:

✅ **Save data to backend APIs**  
✅ **Show loading states**  
✅ **Display success/error messages**  
✅ **Handle network errors gracefully**  
✅ **Clear forms on successful submission**  

**All endpoints are live and ready for your React dashboard!** 🚀
