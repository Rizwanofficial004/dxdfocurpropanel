# 🚀 **Django API Endpoints Documentation**

## 🏠 **Base URL**
```
http://127.0.0.1:8000/
```

---

## 🔍 **Health Check**
### **GET** `/health/`
- **Description:** Check if API is running
- **Response:** `{"status": "healthy", "message": "API is running"}`
- **Authentication:** None

---

## 🔐 **Authentication API** (`/api/auth/`)

### **User Authentication**
- **POST** `/api/auth/login/` - User login
- **POST** `/api/auth/logout/` - User logout  
- **POST** `/api/auth/register/` - User registration
- **GET** `/api/auth/profile/` - Get user profile
- **POST** `/api/auth/change-password/` - Change password
- **POST** `/api/auth/check-email/` - Check if email exists

### **Simple Authentication**
- **POST** `/api/auth/simple-login/` - Simple login endpoint
- **GET** `/api/auth/users/` - List all users

### **User Management**
- **GET** `/api/auth/register/users/` - Get all registered users
- **POST** `/api/auth/register/post_users/` - Register new users
- **GET** `/api/auth/register/users/<user_id>/` - Get single user by ID
- **PUT** `/api/auth/update/user/<user_id>/` - Update single user
- **PUT** `/api/auth/update/users/bulk/` - Bulk update users

### **Database Testing**
- **GET** `/api/auth/database-test/` - Test database connection

---

## 👥 **Users API** (`/api/`)

### **User Search & Data**
- **GET** `/api/users/search/` - Search users
- **GET** `/api/users/` - Get users (alternative endpoint)
- **GET** `/api/users/screenshots/` - Get user screenshots with pagination
- **GET** `/api/users/monthly-screenshots/` - Get monthly user screenshots

---

## 🎛️ **Dashboard API** (`/api/`)

### **🔑 Credentials Management**
- **GET** `/api/credentials/` - Get all credentials
- **POST** `/api/credentials/` - Create/update credentials
- **GET** `/api/credentials/status/` - Get credentials status
- **POST** `/api/set-all-credentials/` - **✅ ENHANCED** Set all credentials (OpenAI, AWS, Database)
- **GET** `/api/get-all-credentials/` - **✅ ENHANCED** Get all credentials with metadata

### **📸 Screenshots & Live Tracking**
- **GET** `/api/api/live-tracking/fast-screenshots/` - Fast screenshots
- **GET** `/api/api/simple-screenshot-proxy/` - Screenshot proxy (handle CORS)
- **GET** `/api/api/simple-screenshot-proxy/status/` - Proxy status

### **🔍 Enhanced Search & Employee APIs**
- **GET** `/api/users/search/` - Enhanced users search with month filter
- **GET** `/api/Employees/Details/` - Employee details (combines S3 + CRM)
- **GET** `/api/employees/comprehensive/` - **🆕 NEW** Comprehensive employee data (CRM + Database + S3)
- **GET** `/api/employees/quick-stats/` - **🆕 NEW** Quick employee statistics for dashboard

### **⏱️ User Timer API**
- **GET/POST** `/api/user-timer/` - User timer operations
- **GET/PUT/DELETE** `/api/user-timer/<timer_id>/` - Specific timer operations
- **GET** `/api/user-timer/stats/` - Timer statistics
- **POST** `/api/user-timer/quick/` - Quick timer actions

### **🔢 User Values API**
- **GET/POST** `/api/user-value/` - User numeric values
- **GET** `/api/user-value/all/` - All users numeric values
- **GET** `/api/user-value/<user_id>/` - User values by ID
- **GET/POST** `/api/setup-value/` - User setup values
- **GET/POST** `/api/setup-value/<user_id>/` - Setup values by user ID
- **GET** `/api/setup-value/all/` - All users setup values

### **🎨 User Styling API**
- **GET/POST** `/api/user-styling/` - User styling configurations
- **GET** `/api/user-styling/all/` - All users styling
- **GET** `/api/user-styling/<user_id>/` - User styling by ID
- **GET** `/api/styling-css/` - Get CSS variables
- **GET** `/api/styling-css/<user_id>/` - CSS by user ID

### **🎨 App Styling API**
- **GET/POST** `/api/app-styling/` - General app styling
- **GET** `/api/app-styling/all/` - All app stylings
- **PUT** `/api/app-styling/<styling_id>/` - Update specific styling
- **POST** `/api/app-styling/<styling_id>/activate/` - Activate styling
- **GET** `/api/app-styling-css/` - App CSS variables
- **POST** `/api/quick-set-styling/` - Quick styling setup
- **POST** `/api/set-all-styling/` - Set all styling values
- **GET** `/api/get-all-styling/` - Get all styling values

### **🤖 AI Endpoints**
- **GET** `/api/ai/status/` - AI service status
- **POST** `/api/ai/chat/` - AI chat functionality
- **POST** `/api/ai/analyze/employees/` - AI employee analysis
- **POST** `/api/ai/generate/report/` - AI report generation

### **📊 Analytics**
- **GET** `/api/dashboard/analytics/employees/` - Employee analytics

### **📋 Logs API**
- **GET** `/api/logs/search/` - Search logs
- **GET** `/api/logs/system/` - System logs
- **GET** `/api/logs/stats/` - Log statistics
- **GET** `/api/user-logs/` - User logs from S3
- **GET** `/api/user-logs/content/<log_key>/` - Specific log content
- **GET** `/api/user-logs/summary/` - User activity summary
- **GET** `/api/user-logs/types/` - Available log types
- **GET** `/api/user-logs/statistics/` - User logs stats

### **📅 Enhanced Logs**
- **GET** `/api/logs/date-range/` - Logs with date range filtering
- **GET** `/api/logs/calendar/` - Calendar view of logs
- **GET** `/api/logs/users-separated/` - **✅ NEW** Logs separated by user for better organization
- **GET** `/api/logs/{user_identifier}/date-range/` - **✅ NEW** Logs for specific user by identifier

### **🏢 CRM Endpoints**
- **GET** `/api/dashboard/crm-comprehensive/` - CRM comprehensive dashboard
- **GET** `/api/dashboard/crm-test/` - Test CRM connection
- **GET** `/api/dashboard/database-test/` - Test database connection

### **🔧 Auto Token APIs** (No Authentication Required)
- **POST** `/api/auto-set-value/` - Set values using user_id
- **GET** `/api/auto-get-value/` - Get values using user_id
- **POST** `/api/auto-set-styling/` - Set styling using user_id
- **GET** `/api/auto-get-styling/` - Get styling using user_id
- **GET** `/api/flexible-get-value/` - Get values using user_id OR username

---

## ✅ **Most Important Endpoints for Your Frontend**

### **🔑 Credentials API (Your Main Focus)**
```
POST http://127.0.0.1:8000/api/set-all-credentials/
GET  http://127.0.0.1:8000/api/get-all-credentials/
```

**Enhanced POST Payload:**
```json
{
    "configuration_name": "Development Config - 2025-09-25",
    "environment": "development",
    "description": "nawaz testing configuration",
    "openai_api_key": "sk-your-openai-key",
    "openai_organization": "org-your-organization",
    "aws_access_key_id": "AKIA...",
    "aws_secret_access_key": "your-secret",
    "aws_region": "us-east-1",
    "aws_bucket_name": "your-bucket",
    "db_host": "your-database-host",
    "db_port": 3306,
    "db_name": "your-database",
    "db_username": "your-username",
    "db_password": "your-password"
}
```

**Enhanced GET Response:**
```json
{
    "success": true,
    "data": {
        "openai": {
            "configuration_name": "Development Config - 2025-09-25",
            "environment": "development",
            "description": "nawaz testing configuration",
            "api_key": "sk-your-key",
            "organization": "org-your-org",
            "created_at": "2025-09-25T...",
            "updated_at": "2025-09-25T..."
        },
        "aws": { /* similar structure */ },
        "database": { /* similar structure */ }
    }
}
```

---

## � **NEW: User-Separated Logs API**

### **📅 GET** `/api/logs/users-separated/`
**✅ Enhanced endpoint that separates logs by user for better organization**

**Description:** Get logs separated by user with date range filtering. Each user's logs are grouped individually with statistics and metadata.

**Query Parameters:**
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)  
- `time_range`: Predefined ranges (`today`, `yesterday`, `last_7_days`, `last_30_days`, `this_month`, `last_month`)
- `log_type`: Filter by log type (`activity`, `timer`, `error`, etc.)
- `limit_per_user`: Max logs per user (default: 50, max: 500)
- `sort_by`: Sort field (`date`, `size`, `log_type`) - default: `date`
- `sort_order`: Sort direction (`asc`, `desc`) - default: `desc`
- `include_content`: Include content preview (`true`/`false`) - default: `false`
- `file_type`: Filter by file type (`json`, `csv`, `txt`, `log`)
- `project`: Filter by project name
- `min_size`: Minimum file size in MB
- `max_size`: Maximum file size in MB
- `exclude_empty_users`: Exclude users with no logs (`true`/`false`) - default: `false`

**Example Request:**
```
GET https://dxdtime.ddsolutions.io/api/logs/users-separated/?start_date=2025-09-25&end_date=2025-09-30&limit_per_user=10&sort_by=date&exclude_empty_users=true
```

**Example Response:**
```json
{
    "status": "success",
    "message": "Retrieved logs for 3 users with 25 total log files for date range 2025-09-25 to 2025-09-30",
    "data": {
        "users": {
            "user1@example.com": {
                "user_email": "user1@example.com",
                "total_logs": 10,
                "total_logs_available": 15,
                "total_size_mb": 12.5,
                "log_types_count": {
                    "activity": 8,
                    "timer": 2
                },
                "logs": [
                    {
                        "user_email": "user1@example.com",
                        "log_key": "logs/user1@example.com/2025-09-25/activity.json",
                        "file_size_mb": 2.1,
                        "last_modified": "2025-09-25T10:30:00Z",
                        "log_type": "activity"
                    }
                ],
                "is_limited": true
            },
            "user2@example.com": {
                "user_email": "user2@example.com",
                "total_logs": 8,
                "total_logs_available": 8,
                "total_size_mb": 6.2,
                "log_types_count": {
                    "activity": 6,
                    "error": 2
                },
                "logs": [...],
                "is_limited": false
            }
        },
        "statistics": {
            "total_users_with_logs": 3,
            "total_log_files": 25,
            "total_size_mb": 45.8,
            "date_range_days": 6,
            "average_logs_per_user": 8.33
        },
        "filters_applied": {
            "start_date": "2025-09-25",
            "end_date": "2025-09-30",
            "limit_per_user": 10,
            "exclude_empty_users": true
        }
    }
}
```

**Key Features:**
- ✅ **User Separation**: Each user's logs are grouped individually
- ✅ **Per-User Statistics**: Log counts, file sizes, and log type distribution
- ✅ **Flexible Limits**: Set different limits per user
- ✅ **Smart Filtering**: All standard filters plus user-specific options
- ✅ **Performance Optimized**: Efficient grouping and sorting algorithms

---

## �🔧 **Testing Your APIs**

### **Health Check:**
```bash
curl http://127.0.0.1:8000/health/
```

### **Credentials API:**
```bash
# GET all credentials
curl http://127.0.0.1:8000/api/get-all-credentials/

# POST new credentials
curl -X POST http://127.0.0.1:8000/api/set-all-credentials/ \
  -H "Content-Type: application/json" \
  -d '{"configuration_name": "Test Config", "openai_api_key": "sk-test"}'
```

### **User Authentication:**
```bash
# Register user
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass", "email": "test@example.com"}'

# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

---

## 📝 **Notes**

1. **🔓 No Auth Required:** Credentials, styling, auto-token, and some utility endpoints
2. **🔐 Auth Required:** User profile, timer, logs, and protected endpoints  
3. **🎯 Frontend Ready:** All endpoints support JSON and include CORS headers
4. **✅ Enhanced:** Credentials API now includes Configuration Name, Environment, and Description fields

**Your Django server is running on:** `http://127.0.0.1:8000/`