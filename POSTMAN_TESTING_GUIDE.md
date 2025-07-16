# Postman API Testing Guide

## 🚀 Quick Setup

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select the file: `Settings_Management_APIs.postman_collection.json`
4. Collection will be imported with all endpoints

### 2. Set Base URL
- **Variable:** `{{base_url}}`
- **Value:** `http://127.0.0.1:8000`
- (Already configured in the collection)

---

## 📋 Complete API Endpoints for Testing

### 🎨 **UI Settings Endpoints**

#### **POST** - Create/Update UI Settings
```
URL: http://127.0.0.1:8000/api/settings/ui/
Method: POST
Content-Type: application/json

Body:
{
  "setting_name": "dashboard_theme",
  "font_family": "Roboto, sans-serif",
  "font_size": "16px",
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

#### **GET** - Get All UI Settings
```
URL: http://127.0.0.1:8000/api/settings/ui/
Method: GET
```

#### **GET** - Get Specific UI Setting
```
URL: http://127.0.0.1:8000/api/settings/ui/?setting_name=dashboard_theme
Method: GET
```

#### **GET** - Get User-Specific Settings
```
URL: http://127.0.0.1:8000/api/settings/ui/?user_id=1
Method: GET
```

---

### 🔐 **Credentials Endpoints**

#### **POST** - Create OpenAI Credentials
```
URL: http://127.0.0.1:8000/api/settings/credentials/
Method: POST
Content-Type: application/json

Body:
{
  "name": "openai_production",
  "credential_type": "openai",
  "description": "Main OpenAI API for dashboard",
  "api_key": "sk-1234567890abcdef1234567890abcdef",
  "is_active": true,
  "is_production": false,
  "additional_config": {
    "model": "gpt-4",
    "max_tokens": 4000,
    "temperature": 0.7
  }
}
```

#### **POST** - Create AWS Credentials
```
URL: http://127.0.0.1:8000/api/settings/credentials/
Method: POST
Content-Type: application/json

Body:
{
  "name": "aws_s3_production",
  "credential_type": "aws",
  "description": "AWS S3 for file storage",
  "access_key": "AKIAIOSFODNN7EXAMPLE",
  "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "is_active": true,
  "is_production": true,
  "additional_config": {
    "region": "us-east-1",
    "bucket_name": "my-app-storage"
  }
}
```

#### **POST** - Create Database Credentials
```
URL: http://127.0.0.1:8000/api/settings/credentials/
Method: POST
Content-Type: application/json

Body:
{
  "name": "postgres_main",
  "credential_type": "database",
  "description": "Main PostgreSQL database connection",
  "username": "db_user",
  "password": "super_secure_password_123",
  "host": "localhost",
  "port": 5432,
  "database_name": "production_db",
  "is_active": true,
  "is_production": true,
  "additional_config": {
    "ssl_mode": "require",
    "pool_size": 20
  }
}
```

#### **POST** - Create SMTP Credentials
```
URL: http://127.0.0.1:8000/api/settings/credentials/
Method: POST
Content-Type: application/json

Body:
{
  "name": "smtp_gmail",
  "credential_type": "smtp",
  "description": "Gmail SMTP for sending emails",
  "username": "admin@dds.com",
  "password": "app_specific_password_123",
  "host": "smtp.gmail.com",
  "port": 587,
  "is_active": true,
  "is_production": false,
  "additional_config": {
    "use_tls": true,
    "use_ssl": false
  }
}
```

#### **GET** - Get All Credentials
```
URL: http://127.0.0.1:8000/api/settings/credentials/
Method: GET
```

#### **GET** - Get Specific Credential
```
URL: http://127.0.0.1:8000/api/settings/credentials/?name=openai_production
Method: GET
```

#### **GET** - Get Credentials by Type
```
URL: http://127.0.0.1:8000/api/settings/credentials/?type=openai
Method: GET
```

---

### ⚙️ **Application Settings Endpoints**

#### **POST** - Create String Setting
```
URL: http://127.0.0.1:8000/api/settings/app/
Method: POST
Content-Type: application/json

Body:
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

#### **POST** - Create Integer Setting
```
URL: http://127.0.0.1:8000/api/settings/app/
Method: POST
Content-Type: application/json

Body:
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

#### **POST** - Create Boolean Setting
```
URL: http://127.0.0.1:8000/api/settings/app/
Method: POST
Content-Type: application/json

Body:
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

#### **POST** - Create JSON Setting
```
URL: http://127.0.0.1:8000/api/settings/app/
Method: POST
Content-Type: application/json

Body:
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

#### **GET** - Get All App Settings
```
URL: http://127.0.0.1:8000/api/settings/app/
Method: GET
```

#### **GET** - Get Specific App Setting
```
URL: http://127.0.0.1:8000/api/settings/app/?key=app_name
Method: GET
```

#### **GET** - Get Settings by Category
```
URL: http://127.0.0.1:8000/api/settings/app/?category=system
Method: GET
```

---

### 🔄 **Bulk Operations Endpoint**

#### **POST** - Bulk Create Settings
```
URL: http://127.0.0.1:8000/api/settings/bulk/
Method: POST
Content-Type: application/json

Body:
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
      "name": "smtp_office365",
      "credential_type": "smtp",
      "description": "Office 365 SMTP for emails",
      "username": "admin@company.com",
      "password": "app_password_456",
      "host": "smtp.office365.com",
      "port": 587,
      "is_active": true,
      "is_production": false,
      "additional_config": {
        "use_tls": true,
        "use_ssl": false
      }
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
    },
    {
      "key": "enable_notifications",
      "value": "true",
      "setting_type": "boolean",
      "category": "general",
      "description": "Enable push notifications",
      "is_public": true,
      "is_editable": true
    }
  ]
}
```

---

## 📊 **Expected Response Format**

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Settings saved successfully",
  "data": {
    "id": 1,
    "setting_name": "dashboard_theme",
    "font_family": "Roboto, sans-serif",
    "font_size": "16px",
    "primary_color": "#3498db",
    "secondary_color": "#2ecc71",
    "background_color": "#ffffff",
    "text_color": "#2c3e50",
    "theme_mode": "light",
    "sidebar_collapsed": false,
    "is_global": true,
    "user_id": null,
    "created_at": "2025-07-12T10:30:00.123456Z",
    "updated_at": "2025-07-12T10:30:00.123456Z"
  },
  "timestamp": "2025-07-12T10:30:00.123456"
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation error: Invalid color format for primary_color",
  "data": {},
  "timestamp": "2025-07-12T10:30:00.123456"
}
```

---

## 🧪 **Testing Workflow**

### 1. Start Django Server
```bash
cd c:\Users\DDS\Downloads\search-logs-school
python manage.py runserver 127.0.0.1:8000
```

### 2. Create Database Tables (if not done)
```bash
python create_settings_tables.py
```

### 3. Import Collection in Postman
- Use `Settings_Management_APIs.postman_collection.json`

### 4. Test in This Order:
1. **UI Settings** - Create theme
2. **Credentials** - Add OpenAI, AWS, Database configs
3. **App Settings** - Add application configurations
4. **Get Requests** - Verify data was saved
5. **Bulk Operations** - Test bulk creation

### 5. Verify Results
- Check database tables
- Verify sensitive data is masked in GET responses
- Test query parameters

---

## 🔧 **Troubleshooting**

### Common Issues:
1. **500 Error** - Database tables not created
   - Run: `python create_settings_tables.py`

2. **404 Error** - Django server not running
   - Run: `python manage.py runserver`

3. **CORS Error** - Add CORS headers if needed
   - Install: `pip install django-cors-headers`

### Debug Commands:
```bash
# Check if tables exist
python manage.py dbshell
SHOW TABLES;

# Test APIs directly
python test_settings_apis.py
```

---

## 🎯 **All Ready for Testing!**

✅ **Postman Collection** - Complete with all endpoints  
✅ **Sample Data** - Ready-to-use JSON payloads  
✅ **Query Parameters** - All filtering options  
✅ **Error Handling** - Expected responses  
✅ **Testing Workflow** - Step-by-step guide  

**Import the collection and start testing immediately!** 🚀
