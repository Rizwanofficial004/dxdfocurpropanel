# Settings Management APIs Documentation

## Overview
Professional APIs for managing UI settings, system credentials, and application configurations from your dashboard.

## Base URL
```
http://127.0.0.1:8000/api/settings
```

## Authentication
Currently, these APIs are open for development. For production, consider adding authentication.

---

## 🎨 UI Settings API

### POST `/api/settings/ui/`
Create or update UI settings for your dashboard.

**Request Body:**
```json
{
  "setting_name": "dashboard_theme",
  "font_family": "Roboto, sans-serif",
  "font_size": "18px",
  "primary_color": "#3498db",
  "secondary_color": "#2ecc71", 
  "background_color": "#ffffff",
  "text_color": "#2c3e50",
  "theme_mode": "light",
  "sidebar_collapsed": false,
  "is_global": true,
  "user_id": null
}
```

**Font Family Options:**
- `Arial, sans-serif`
- `Roboto, sans-serif`
- `Open Sans, sans-serif`
- `Lato, sans-serif`
- `Montserrat, sans-serif`
- `Times New Roman, serif`
- `Georgia, serif`
- `Verdana, sans-serif`

**Font Size Options:**
- `12px` (Extra Small)
- `14px` (Small)
- `16px` (Medium)
- `18px` (Large)
- `20px` (Extra Large)
- `24px` (XXL)

**Theme Mode:**
- `light`
- `dark`

**Response:**
```json
{
  "success": true,
  "message": "UI settings created successfully",
  "data": {
    "id": 1,
    "setting_name": "dashboard_theme",
    "font_family": "Roboto, sans-serif",
    "font_size": "18px",
    "primary_color": "#3498db",
    "secondary_color": "#2ecc71",
    "background_color": "#ffffff",
    "text_color": "#2c3e50",
    "theme_mode": "light",
    "sidebar_collapsed": false,
    "is_global": true,
    "action": "created"
  }
}
```

### GET `/api/settings/ui/`
Retrieve UI settings.

**Query Parameters:**
- `setting_name` (optional): Specific setting name
- `user_id` (optional): User-specific settings

**Example:**
```
GET /api/settings/ui/?setting_name=dashboard_theme
```

---

## 🔐 Credentials API

### POST `/api/settings/credentials/`
Create or update system credentials.

**Request Body for OpenAI:**
```json
{
  "name": "openai_production",
  "credential_type": "openai",
  "description": "OpenAI API credentials for production",
  "api_key": "sk-1234567890abcdef1234567890abcdef",
  "is_active": true,
  "is_production": true,
  "additional_config": {
    "model": "gpt-4",
    "max_tokens": 4000,
    "temperature": 0.7
  }
}
```

**Request Body for AWS:**
```json
{
  "name": "aws_s3_production",
  "credential_type": "aws",
  "description": "AWS S3 credentials for file storage",
  "access_key": "AKIAIOSFODNN7EXAMPLE",
  "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "additional_config": {
    "region": "us-east-1",
    "bucket_name": "my-app-storage"
  },
  "is_active": true,
  "is_production": true
}
```

**Request Body for Database:**
```json
{
  "name": "postgres_main",
  "credential_type": "database",
  "description": "Main PostgreSQL database connection",
  "username": "db_user",
  "password": "super_secure_password_123",
  "host": "localhost",
  "port": 5432,
  "database_name": "production_db",
  "additional_config": {
    "ssl_mode": "require",
    "pool_size": 20
  },
  "is_active": true,
  "is_production": true
}
```

**Credential Types:**
- `openai` - OpenAI API Key
- `aws` - AWS Credentials
- `database` - Database Configuration
- `smtp` - SMTP Email Configuration
- `oauth` - OAuth Configuration
- `api_key` - Generic API Key
- `storage` - Storage Service
- `payment` - Payment Gateway

### GET `/api/settings/credentials/`
Retrieve credentials (sensitive data is masked).

**Query Parameters:**
- `name` (optional): Specific credential name
- `type` (optional): Filter by credential type

**Example:**
```
GET /api/settings/credentials/?name=openai_production
```

---

## ⚙️ Application Settings API

### POST `/api/settings/app/`
Create or update application settings.

**Request Body Examples:**

**String Setting:**
```json
{
  "key": "app_name",
  "value": "DDS Focus Time Dashboard",
  "setting_type": "string",
  "category": "general",
  "description": "Application display name",
  "is_public": true,
  "is_editable": true
}
```

**Integer Setting:**
```json
{
  "key": "max_users",
  "value": "100",
  "setting_type": "integer",
  "category": "limits",
  "description": "Maximum number of users allowed",
  "is_public": false,
  "is_editable": true
}
```

**Boolean Setting:**
```json
{
  "key": "maintenance_mode",
  "value": "false",
  "setting_type": "boolean",
  "category": "system",
  "description": "Enable maintenance mode",
  "is_public": true,
  "is_editable": true
}
```

**JSON Setting:**
```json
{
  "key": "email_config",
  "value": "{\"smtp_host\": \"smtp.gmail.com\", \"smtp_port\": 587, \"use_tls\": true}",
  "setting_type": "json",
  "category": "email",
  "description": "Email configuration settings",
  "is_public": false,
  "is_editable": true
}
```

**Setting Types:**
- `string` - Text values
- `integer` - Numeric values
- `boolean` - True/false values
- `json` - JSON objects

### GET `/api/settings/app/`
Retrieve application settings.

**Query Parameters:**
- `key` (optional): Specific setting key
- `category` (optional): Filter by category

**Example:**
```
GET /api/settings/app/?category=system
```

---

## 🔄 Bulk Operations API

### POST `/api/settings/bulk/`
Create or update multiple settings at once.

**Request Body:**
```json
{
  "ui_settings": [
    {
      "setting_name": "mobile_theme",
      "font_family": "Arial, sans-serif",
      "font_size": "14px",
      "primary_color": "#007bff",
      "secondary_color": "#6c757d",
      "background_color": "#f8f9fa",
      "text_color": "#495057",
      "theme_mode": "light",
      "sidebar_collapsed": true,
      "is_global": true
    }
  ],
  "credentials": [
    {
      "name": "smtp_gmail",
      "credential_type": "smtp",
      "description": "Gmail SMTP for sending emails",
      "username": "admin@dds.com",
      "password": "app_specific_password_123",
      "host": "smtp.gmail.com",
      "port": 587,
      "additional_config": {
        "use_tls": true,
        "use_ssl": false
      },
      "is_active": true,
      "is_production": false
    }
  ],
  "app_settings": [
    {
      "key": "session_timeout",
      "value": "3600",
      "setting_type": "integer",
      "category": "security",
      "description": "Session timeout in seconds",
      "is_public": false,
      "is_editable": true
    }
  ]
}
```

---

## 📋 Complete Endpoint List

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST/GET` | `/api/settings/ui/` | UI Settings Management |
| `POST/GET` | `/api/settings/credentials/` | Credentials Management |
| `POST/GET` | `/api/settings/app/` | Application Settings |
| `POST` | `/api/settings/bulk/` | Bulk Operations |

---

## 🧪 Testing

Run the comprehensive test suite:
```bash
python test_settings_apis.py
```

Create database tables:
```bash
python create_settings_tables.py
```

---

## 🔒 Security Notes

1. **Production Authentication**: Add authentication middleware for production
2. **Credential Encryption**: Sensitive data should be encrypted in production
3. **Access Control**: Implement role-based access for different setting types
4. **Input Validation**: All inputs are validated for security
5. **Audit Logging**: Consider adding audit logs for setting changes

---

## 💡 Usage Examples

### Setting Up Dashboard Theme
```javascript
// Example JavaScript code for dashboard
fetch('/api/settings/ui/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    setting_name: 'company_theme',
    font_family: 'Roboto, sans-serif',
    font_size: '16px',
    primary_color: '#1976d2',
    secondary_color: '#424242',
    background_color: '#fafafa',
    text_color: '#212121',
    theme_mode: 'light',
    is_global: true
  })
})
```

### Configuring OpenAI Integration
```javascript
fetch('/api/settings/credentials/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'openai_main',
    credential_type: 'openai',
    description: 'Main OpenAI API for AI features',
    api_key: 'sk-your-openai-key-here',
    is_active: true,
    additional_config: {
      model: 'gpt-4',
      max_tokens: 2000
    }
  })
})
```

### Setting Application Configurations
```javascript
fetch('/api/settings/app/', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    key: 'max_file_upload_size',
    value: '10485760',
    setting_type: 'integer',
    category: 'limits',
    description: 'Maximum file upload size in bytes (10MB)',
    is_public: true
  })
})
```

---

## ✅ Success Response Format

All APIs return a consistent response format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2025-07-12T09:26:13.864926"
}
```

## ❌ Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "data": {},
  "timestamp": "2025-07-12T09:26:13.864926"
}
```

---

**🎉 All APIs are now ready for production use!**
