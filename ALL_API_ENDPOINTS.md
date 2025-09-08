# Complete API Endpoints Documentation

## Base URL: `http://127.0.0.1:8000`

---

## 🔥 **MAIN API ENDPOINTS**

### 1. **Health Check**
- **GET** `/health/`
- **Description**: Check if the API is running
- **Response**: `{"status": "healthy", "message": "API is running"}`

---

### 2. **Users Search API** (Original)
- **GET** `/api/users/search/`
- **Description**: Search users with basic filtering
- **Query Parameters**:
  - `q` - search query
  - `page` - page number
  - `page_size` - results per page
- **Example**: `GET /api/users/search/?q=naw&page=1&page_size=50`

---

### 3. **Enhanced Users Search API** (With Month/Year Filters)
- **GET** `/api/users/search/`
- **Description**: Enhanced search with month and year filtering
- **Query Parameters**:
  - `q` - search query
  - `start_date` - start date (YYYY-MM-DD)
  - `end_date` - end date (YYYY-MM-DD)
  - `month` - month filter (YYYY-MM)
  - `year` - year filter (YYYY)
  - `page` - page number
  - `page_size` - results per page
- **Examples**:
  - `GET /api/users/search/?q=naw&month=2025-09`
  - `GET /api/users/search/?q=naw&year=2025`
  - `GET /api/users/search/?q=naw&start_date=2025-09-01&end_date=2025-09-02`

---

### 4. **🆕 Employees Details API** (S3 + CRM Combined)
- **GET** `/api/Employees/Details/`
- **Description**: Comprehensive employee data combining S3 activity and CRM information
- **Features**:
  - S3 bucket screenshot data
  - CRM employee information
  - Activity summaries (file sizes, dates, activity counts)
  - Recent screenshots (latest 5 per employee)
  - Data source availability status
- **Response Structure**:
```json
{
  "status": "success",
  "data": {
    "employees": [
      {
        "email": "employee@example.com",
        "name": "Employee Name",
        "crm_data": {...},
        "s3_data": {
          "activity_summary": {
            "total_size_mb": 88.28,
            "first_activity": "2025-09-01T12:45:26+00:00",
            "last_activity": "2025-09-01T14:21:57+00:00",
            "active_days_count": 1,
            "active_months_count": 1
          },
          "recent_screenshots": [...]
        },
        "data_sources": {
          "in_crm": true,
          "in_s3": true,
          "complete_profile": true
        }
      }
    ]
  }
}
```

---

### 5. **🆕 Timer API** (Employee Timer Management)

#### 5.1 **Get Timer Status**
- **GET** `/api/Timer/`
- **Description**: Get timer status for all employees or specific employee
- **Query Parameters**:
  - `email` (optional) - specific employee email
  - `action` (optional) - status, history, settings
- **Examples**:
  - `GET /api/Timer/` - All timers
  - `GET /api/Timer/?email=nawaz@dxdglobal.com` - Specific employee

#### 5.2 **Timer Actions**
- **POST** `/api/Timer/`
- **Description**: Perform timer actions
- **Request Body**:
```json
{
  "action": "action_type",
  "email": "employee@example.com",
  "minutes": 25,
  "seconds": 30
}
```

**Available Actions**:
- `apply_settings` - Apply timer settings (Button functionality)
- `start_timer` - Start a new timer
- `stop_timer` - Stop current timer
- `pause_timer` - Pause running timer
- `resume_timer` - Resume paused timer
- `reset_timer` - Reset timer

**Apply Settings Example**:
```json
{
  "action": "apply_settings",
  "email": "nawaz@dxdglobal.com",
  "minutes": 25,
  "seconds": 30,
  "auto_start": false,
  "notifications_enabled": true
}
```

#### 5.3 **Timer History**
- **GET** `/api/Timer/History/`
- **Description**: Get timer history and statistics
- **Query Parameters**:
  - `email` (optional) - specific employee
  - `limit` (optional) - number of records (default: 10)
- **Example**: `GET /api/Timer/History/?email=nawaz@dxdglobal.com&limit=5`

---

### 6. **Dashboard Analytics**
- **GET** `/api/dashboard/analytics/employees/`
- **Description**: Employee analytics data

---

### 7. **Dashboard Employees**
- **GET** `/api/dashboard/employees/`
- **Description**: Dashboard employee screenshots view

---

### 8. **CRM Comprehensive Endpoints**

#### 8.1 **CRM Dashboard**
- **GET** `/api/dashboard/crm-comprehensive/`
- **Description**: Comprehensive CRM dashboard data

#### 8.2 **CRM Connection Test**
- **GET** `/api/dashboard/crm-test/`
- **Description**: Test CRM API connection

#### 8.3 **Database Test**
- **GET** `/api/dashboard/database-test/`
- **Description**: Test database connection

---

### 9. **AI Endpoints**

#### 9.1 **AI Status**
- **GET** `/api/ai/status/`
- **Description**: Check AI service status

#### 9.2 **AI Chat**
- **POST** `/api/ai/chat/`
- **Description**: AI chat functionality

#### 9.3 **AI Employee Analysis**
- **POST** `/api/ai/analyze/employees/`
- **Description**: AI-powered employee analysis

#### 9.4 **AI Report Generator**
- **POST** `/api/ai/generate/report/`
- **Description**: Generate AI reports

---

### 10. **System Endpoints**

#### 10.1 **Credentials Status**
- **GET** `/api/credentials/status/`
- **Description**: Check system credentials status

---

## 🎯 **FEATURED APIs SUMMARY**

### **Most Important Endpoints:**

1. **🔥 Enhanced Users Search**: `/api/users/search/`
   - Full search with month/year filtering
   - Date range filtering
   - Advanced query capabilities

2. **🆕 Employees Details**: `/api/Employees/Details/`
   - Combined S3 and CRM data
   - Complete employee profiles
   - Activity analytics

3. **🆕 Timer Management**: `/api/Timer/`
   - Full timer functionality
   - Settings application (button feature)
   - Timer history and statistics

---

## 📋 **API VERSIONS & STATUS**

- **Enhanced Users Search**: ✅ Version 2.2.0 (Fully functional)
- **Employees Details**: ✅ Version 1.0.0 (Fully functional - no total_screenshots)
- **Timer API**: ⚠️ Version 1.0.0 (GET works, POST needs debugging)
- **Health Check**: ✅ Working
- **AI Endpoints**: ✅ Available
- **CRM Endpoints**: ✅ Available

---

## 🔧 **CURRENT SERVER STATUS**

- **Server**: Running on `http://127.0.0.1:8000`
- **Django Version**: 5.2.5
- **Python Version**: 3.13.4
- **Environment**: Development

---

## 📝 **TESTING EXAMPLES**

### PowerShell Testing:
```powershell
# Test Health
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health/"

# Test Enhanced Search
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/users/search/?q=naw&month=2025-09"

# Test Employees Details
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/Employees/Details/"

# Test Timer Status
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/Timer/"

# Test Timer Settings (Button)
$body = '{"action":"apply_settings","email":"nawaz@dxdglobal.com","minutes":25,"seconds":30}'
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/Timer/" -Method POST -Body $body -ContentType "application/json"
```

---

# 8. Logs API - Activity Tracking & System Logs

## Logs Search API

**Endpoint:** `/api/logs/search/`  
**Method:** GET  
**Purpose:** Search system logs and activity data with filtering

### Query Parameters:
- `q` (string, optional): Search query string
- `start_date` (string, optional): Start date filter (YYYY-MM-DD format)
- `end_date` (string, optional): End date filter (YYYY-MM-DD format) 
- `user_email` (string, optional): Filter by specific user email
- `activity_type` (string, optional): Filter by activity type (screenshot, api_call, authentication, error)
- `limit` (integer, optional): Number of results to return (default: 100)

### Example Request:
```bash
curl -X GET "http://127.0.0.1:8000/api/logs/search/?q=screenshot&user_email=haseebcodejourney@gmail.com&start_date=2025-01-09&limit=50"
```

### Response:
```json
{
    "status": "success",
    "count": 15,
    "logs": [
        {
            "timestamp": "2025-01-09T10:30:00Z",
            "activity_type": "screenshot",
            "user_email": "haseebcodejourney@gmail.com",
            "source": "s3",
            "details": {
                "file_path": "users_screenshots/2025-01-09/haseebcodejourney@gmail.com/screenshot_1234567890.png",
                "file_size": 245760,
                "bucket": "ddsfocustime"
            },
            "message": "Screenshot captured for haseebcodejourney@gmail.com"
        }
    ],
    "search_params": {
        "query": "screenshot",
        "start_date": "2025-01-09",
        "user_email": "haseebcodejourney@gmail.com",
        "limit": 50
    }
}
```

## Logs System Info API

**Endpoint:** `/api/logs/system/`  
**Method:** GET  
**Purpose:** Get system logging configuration and status

### Example Request:
```bash
curl -X GET "http://127.0.0.1:8000/api/logs/system/"
```

### Response:
```json
{
    "status": "success",
    "logging_config": {
        "level": "INFO",
        "handlers": ["console", "file"],
        "formatters": ["standard"]
    },
    "system_status": {
        "django_logging": true,
        "s3_access": true,
        "database_logging": true
    }
}
```

## Logs Statistics API

**Endpoint:** `/api/logs/stats/`  
**Method:** GET  
**Purpose:** Get logs analytics and statistics

### Example Request:
```bash
curl -X GET "http://127.0.0.1:8000/api/logs/stats/"
```

### Response:
```json
{
    "status": "success",
    "stats": {
        "last_24_hours": {
            "total_logs": 150,
            "by_type": {
                "screenshot": 85,
                "api_call": 40,
                "authentication": 15,
                "error": 10
            },
            "by_user": {
                "haseebcodejourney@gmail.com": 35,
                "kiranaiza4@gmail.com": 30,
                "nawaz@dxdglobal.com": 20
            }
        },
        "system_health": {
            "error_rate": 6.7,
            "avg_response_time": 245,
            "active_users": 3
        }
    },
    "generated_at": "2025-01-09T12:00:00Z"
}
```

---

## 🚀 **RECENT DEVELOPMENTS**

1. ✅ Enhanced users search with month/year filtering
2. ✅ Employees details API combining S3 and CRM
3. ✅ Removed `total_screenshots` field as requested
4. 🔧 Timer API created (GET working, POST debugging in progress)
5. ✅ Logs API implemented with search, system info, and statistics endpoints
6. ✅ CORS configuration updated for frontend integration

**All APIs are located in the dashboard folder as requested and use the `/api/` prefix.**
