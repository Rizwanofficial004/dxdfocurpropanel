# Django REST API Endpoints Reference

## Server Information
- **Base URL**: `http://127.0.0.1:8000`
- **API Base**: `http://127.0.0.1:8000/api`
- **Status**: ✅ Running and Working
- **Last Tested**: July 5, 2025

## 🔐 Authentication Endpoints

### 1. Login API
- **URL**: `POST /api/auth/login/`
- **Description**: Authenticate user and get session
- **Request Body**:
```json
{
    "username": "admin",
    "password": "admin"
}
```
- **Response (Success)**:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@example.com",
            "is_staff": true
        }
    },
    "timestamp": "2025-07-05T14:00:00.000000"
}
```

## 📸 Screenshot Endpoints

### 2. Screenshots API
- **URL**: `GET /api/screenshots/`
- **Description**: Get all screenshots with filtering options
- **Query Parameters**:
  - `start_date`: Filter from date (YYYY-MM-DD)
  - `end_date`: Filter to date (YYYY-MM-DD)
  - `email`: Filter by user email
  - `limit`: Number of results (default: 50)
- **Example**: `GET /api/screenshots/?email=amir@example.com&limit=10`

### 3. User Screenshots API
- **URL**: `GET /api/users/{email}/screenshots/`
- **Description**: Get screenshots for specific user by email
- **Example**: `GET /api/users/amir@example.com/screenshots/`

## 📝 Log Endpoints

### 4. Logs API
- **URL**: `GET /api/logs/`
- **Description**: Get all user logs with filtering
- **Query Parameters**:
  - `start_date`: Filter from date
  - `end_date`: Filter to date
  - `email`: Filter by user email
  - `limit`: Number of results

### 5. User Logs API
- **URL**: `GET /api/users/{email}/logs/`
- **Description**: Get logs for specific user by email
- **Example**: `GET /api/users/amir@example.com/logs/`

## 👥 User Search & Suggestions

### 6. User Search API
- **URL**: `GET /api/users/search/`
- **Description**: Search users by name, email, or username
- **Query Parameters**:
  - `q`: Search query (required)
  - `limit`: Number of results (default: 10)
- **Example**: `GET /api/users/search/?q=amir&limit=5`
- **Response**:
```json
{
    "success": true,
    "message": "Found 2 users matching 'amir'",
    "data": {
        "users": [
            {
                "id": 1,
                "name": "Amir Developer",
                "email": "amir@example.com",
                "username": "amir",
                "profile_image": null,
                "is_active": true
            }
        ],
        "total_count": 2,
        "search_query": "amir"
    }
}
```

### 7. User Suggestions API (Google-like)
- **URL**: `GET /api/users/suggestions/`
- **Description**: Get real-time user suggestions with activity indicators
- **Query Parameters**:
  - `q`: Search query (required)
  - `limit`: Number of suggestions (default: 5)
- **Example**: `GET /api/users/suggestions/?q=am&limit=3`
- **Response**:
```json
{
    "success": true,
    "message": "Found 1 suggestions for 'am'",
    "data": {
        "suggestions": [
            {
                "id": 1,
                "name": "Amir Developer",
                "email": "amir@example.com",
                "username": "amir",
                "relevance_score": 95,
                "match_type": "name_match",
                "activity_indicator": "active",
                "last_activity": "2 hours ago"
            }
        ],
        "query": "am",
        "total_suggestions": 1
    }
}
```

## 📊 Dashboard & Analytics

### 8. Dashboard Data API
- **URL**: `GET /api/dashboard/data/`
- **Description**: Get comprehensive dashboard analytics
- **Response includes**:
  - User statistics
  - Activity summaries
  - Screenshot counts
  - Performance metrics

### 9. Dashboard User Data API
- **URL**: `GET /api/dashboard/user-data/`
- **Description**: Get detailed user dashboard data
- **Note**: ⚠️ Currently returns HTML (authentication issue)

## 🔴 Live Tracking API (NEW - Featured)

### 10. Live Tracking API ⭐
- **URL**: `GET /api/live-tracking/`
- **Description**: Get real-time data for all currently working employees
- **Query Parameters**:
  - `limit`: Number of employees (default: 50)
  - `status`: Filter by status (`Online`, `Idle`, `Offline`)
  - `refresh`: Force refresh data (`true`/`false`)
- **Example**: `GET /api/live-tracking/?status=Online&limit=10`
- **Response**:
```json
{
    "success": true,
    "message": "Live tracking data retrieved for 4 employees",
    "data": {
        "live_tracking": {
            "employees": [
                {
                    "employee_id": "DEN001",
                    "name": "Deniz DXD",
                    "email": "deniz@dxdglobal.com",
                    "profile_image": null,
                    "current_status": "Online",
                    "status_color": "success",
                    "is_active": true,
                    "current_task": {
                        "name": "Development Task 1",
                        "id": "task_1",
                        "type": "development_task",
                        "priority": "High"
                    },
                    "time_info": {
                        "current_time": "02:00 PM",
                        "start_time": "09:00 AM",
                        "total_working_minutes": 300,
                        "total_working_time": "5h 0m",
                        "last_activity_minutes": 0,
                        "last_activity_text": "Just now"
                    },
                    "screenshot": {
                        "url": "https://s3-url...",
                        "thumbnail_url": "https://s3-url...",
                        "filename": "screenshot.png",
                        "captured_at": "2025-07-05T14:00:00",
                        "file_size": 125000,
                        "has_preview": true
                    },
                    "productivity": {
                        "screenshots_today": 45,
                        "activity_score": 100,
                        "efficiency": "90%"
                    },
                    "location": {
                        "office": "Main Office",
                        "desk": "Desk 2"
                    }
                }
            ],
            "summary": {
                "total_employees": 4,
                "active_employees": 4,
                "status_breakdown": {
                    "online": 2,
                    "idle": 1,
                    "offline": 1
                },
                "total_working_hours": "20h 0m",
                "average_working_time": "5h 0m"
            },
            "timestamp": "2025-07-05T14:00:36.532900",
            "refresh_interval": 30,
            "last_updated": "02:00:36 PM"
        },
        "filters_applied": {
            "status": "",
            "limit": 50,
            "refresh": false
        },
        "ui_config": {
            "grid_columns": 3,
            "auto_refresh": true,
            "refresh_interval": 30,
            "show_screenshots": true,
            "show_productivity": true
        }
    },
    "timestamp": "2025-07-05T14:00:36.532900"
}
```

### 11. Employee Details API
- **URL**: `GET /api/live-tracking/employee/{employee_id}/`
- **Description**: Get detailed information for specific employee
- **Parameters**:
  - `employee_id`: Employee ID or email
- **Examples**: 
  - `GET /api/live-tracking/employee/DEN001/`
  - `GET /api/live-tracking/employee/deniz@dxdglobal.com/`

## 🧪 Test & Utility Endpoints

### 12. API Test Endpoint
- **URL**: `GET /api/test/`
- **Description**: Simple test endpoint to verify API is working
- **Response**:
```json
{
    "success": true,
    "message": "API is working correctly",
    "data": {
        "server_time": "2025-07-05T14:00:00",
        "version": "1.0"
    }
}
```

### 13. Update Logs (Legacy)
- **URL**: `POST /api/update-log-info/`
- **Description**: Legacy endpoint for updating log information
- **Note**: Maintained for backward compatibility

## 🔍 API Testing Examples

### Using cURL:
```bash
# Test Live Tracking API
curl -X GET "http://127.0.0.1:8000/api/live-tracking/"

# Search Users
curl -X GET "http://127.0.0.1:8000/api/users/search/?q=amir"

# Get User Suggestions
curl -X GET "http://127.0.0.1:8000/api/users/suggestions/?q=am&limit=5"

# Get Employee Details
curl -X GET "http://127.0.0.1:8000/api/live-tracking/employee/DEN001/"

# Login
curl -X POST "http://127.0.0.1:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

### Using Python Requests:
```python
import requests

# Base configuration
BASE_URL = "http://127.0.0.1:8000/api"

# Test Live Tracking
response = requests.get(f"{BASE_URL}/live-tracking/?status=Online")
data = response.json()
print(f"Active employees: {data['data']['live_tracking']['summary']['active_employees']}")

# Search Users
response = requests.get(f"{BASE_URL}/users/search/?q=amir")
users = response.json()['data']['users']

# Get Suggestions
response = requests.get(f"{BASE_URL}/users/suggestions/?q=am")
suggestions = response.json()['data']['suggestions']
```

## 📱 Frontend Integration

### React Integration Example:
```javascript
// Live Tracking Component
const LiveTracking = () => {
    const [employees, setEmployees] = useState([]);
    
    const fetchLiveData = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/live-tracking/');
        const data = await response.json();
        setEmployees(data.data.live_tracking.employees);
    };
    
    useEffect(() => {
        fetchLiveData();
        const interval = setInterval(fetchLiveData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="live-tracking">
            {employees.map(emp => (
                <div key={emp.employee_id} className="employee-card">
                    <h3>{emp.name}</h3>
                    <p>Status: {emp.current_status}</p>
                    <p>Task: {emp.current_task.name}</p>
                    <p>Working Time: {emp.time_info.total_working_time}</p>
                    {emp.screenshot.has_preview && (
                        <img src={emp.screenshot.url} alt="Live Screenshot" />
                    )}
                </div>
            ))}
        </div>
    );
};
```

## 🚀 API Features

### ✅ Working Features:
- ✅ Live employee tracking with real-time data
- ✅ User search with Google-like suggestions
- ✅ Screenshot retrieval by user
- ✅ Log filtering and search
- ✅ Employee status monitoring
- ✅ Productivity metrics
- ✅ Activity scoring
- ✅ CORS enabled for React integration
- ✅ Standardized JSON responses
- ✅ Error handling and validation
- ✅ Pagination support
- ✅ Real-time data refresh

### 📊 Live Tracking Features:
- **Real-time employee status** (Online/Idle/Offline)
- **Live screenshots** with thumbnails
- **Current task tracking** with priority levels
- **Working time calculation** 
- **Activity scoring** and efficiency metrics
- **Location tracking** (Office/Remote)
- **Productivity analytics**
- **Status filtering** and search
- **Auto-refresh** capabilities
- **Summary statistics**

## 📝 Notes:
- All endpoints support CORS for React integration
- Live tracking refreshes automatically every 30 seconds
- Authentication is optional for most read-only endpoints
- All responses follow a standardized JSON format
- Error responses include helpful debugging information
- The server is currently running on development mode (http://127.0.0.1:8000)

## 🔧 Testing Tools Available:
- `test_live_tracking_api.py` - Comprehensive live tracking tests
- `simple_api_test.py` - Basic API functionality tests
- `test_all_apis.py` - Complete API test suite
- `test_screenshots_by_name.py` - Screenshot retrieval tests
- `test_logs_by_user_search.py` - User log search tests

**Server Status**: 🟢 Online and fully functional
**Last Updated**: July 5, 2025
