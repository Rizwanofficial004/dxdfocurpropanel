# Live Tracking API Documentation

## Overview
The Live Tracking API provides real-time user activity and status tracking functionality, similar to modern team collaboration tools. It allows you to monitor user status, current activities, productivity metrics, and more.

## Base URL
```
http://127.0.0.1:8000/api/live-tracking/
```

## Authentication
Most endpoints require user authentication. Make sure to login first using the `/api/auth/login/` endpoint.

---

## Endpoints

### 1. Live Tracking Dashboard
**GET** `/api/live-tracking/`

Get real-time data for all employees currently working, including live screenshots, current status, task information, and time tracking.

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 50 | Number of employees to return |
| `status` | string | No | all | Filter by status: "Online", "Idle", "Offline" |
| `refresh` | boolean | No | false | Force refresh data from source |

#### Example Request
```bash
GET /api/live-tracking/?limit=20&status=Online&refresh=true
```

#### Response Format
```json
{
  "success": true,
  "message": "Live tracking data retrieved for 15 employees",
  "data": {
    "live_tracking": {
      "employees": [
        {
          "employee_id": "EMP001",
          "name": "John Doe",
          "email": "john.doe@company.com",
          "profile_image": "/media/profile_images/john.jpg",
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
            "current_time": "02:30 PM",
            "start_time": "09:00 AM",
            "total_working_minutes": 330,
            "total_working_time": "5h 30m",
            "last_activity_minutes": 2,
            "last_activity_text": "2 minutes ago"
          },
          "screenshot": {
            "url": "https://s3.amazonaws.com/screenshots/john_doe_latest.png",
            "thumbnail_url": "https://s3.amazonaws.com/screenshots/john_doe_latest_thumb.png",
            "filename": "john_doe_2025_01_15_14_30.png",
            "captured_at": "2025-01-15T14:30:00Z",
            "file_size": 1024000,
            "has_preview": true
          },
          "productivity": {
            "screenshots_today": 45,
            "activity_score": 95,
            "efficiency": "92%"
          },
          "location": {
            "office": "Main Office",
            "desk": "Desk 1"
          }
        }
      ],
      "summary": {
        "total_employees": 15,
        "active_employees": 12,
        "status_breakdown": {
          "online": 10,
          "idle": 3,
          "offline": 2
        },
        "total_working_hours": "67h 30m",
        "average_working_time": "4h 30m"
      },
      "timestamp": "2025-01-15T14:30:00Z",
      "refresh_interval": 30,
      "last_updated": "02:30:00 PM"
    },
    "filters_applied": {
      "status": "Online",
      "limit": 20,
      "refresh": true
    },
    "ui_config": {
      "grid_columns": 3,
      "auto_refresh": true,
      "refresh_interval": 30,
      "show_screenshots": true,
      "show_productivity": true
    }
  },
  "timestamp": "2025-01-15T14:30:00Z"
}
```

#### Status Codes
- `200` - Success
- `401` - Authentication required
- `500` - Server error

---

### 2. Employee Details
**GET** `/api/live-tracking/employee/{employee_id}/`

Get detailed information for a specific employee including recent screenshots, detailed time tracking, task history, and productivity metrics.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_id` | string | Yes | Employee ID or email address |

#### Example Requests
```bash
GET /api/live-tracking/employee/EMP001/
GET /api/live-tracking/employee/john.doe@company.com/
```

#### Response Format
```json
{
  "success": true,
  "message": "Employee details retrieved successfully",
  "data": {
    "employee_details": {
      "basic_info": {
        "employee_id": "EMP001",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "profile_image": "/media/profile_images/john.jpg",
        "current_status": "Online",
        "is_active": true
      },
      "current_session": {
        "start_time": "09:00 AM",
        "current_time": "02:30 PM",
        "total_working_minutes": 330,
        "total_working_time": "5h 30m",
        "break_time": "30m",
        "active_time": "5h 0m"
      },
      "current_task": {
        "name": "API Development",
        "id": "task_123",
        "type": "development",
        "priority": "High",
        "started_at": "01:00 PM",
        "duration": "1h 30m"
      },
      "recent_screenshots": [
        {
          "url": "https://s3.amazonaws.com/screenshots/john_doe_14_30.png",
          "thumbnail_url": "https://s3.amazonaws.com/screenshots/john_doe_14_30_thumb.png",
          "filename": "john_doe_2025_01_15_14_30.png",
          "captured_at": "2025-01-15T14:30:00Z",
          "file_size": 1024000
        }
      ],
      "productivity": {
        "today": {
          "screenshots_count": 45,
          "activity_score": 95,
          "efficiency": "92%",
          "tasks_completed": 3,
          "code_commits": 7
        },
        "this_week": {
          "total_hours": "37h 30m",
          "average_daily": "7h 30m",
          "productivity_trend": "increasing"
        }
      },
      "recent_logs": [
        {
          "id": 1,
          "timestamp": "2025-01-15T14:25:00Z",
          "activity": "Code commit",
          "details": "Fixed API endpoint bug"
        }
      ],
      "location": {
        "office": "Main Office",
        "desk": "Desk 1",
        "floor": "2nd Floor"
      }
    }
  },
  "timestamp": "2025-01-15T14:30:00Z"
}
```

#### Status Codes
- `200` - Success
- `401` - Authentication required
- `404` - Employee not found
- `500` - Server error

---

## Error Responses

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "data": {},
  "timestamp": "2025-01-15T14:30:00Z"
}
```

### Common Error Messages
- `"Authentication required"` - User not logged in
- `"Employee not found: {employee_id}"` - Invalid employee ID
- `"Error retrieving live tracking data"` - Server error
- `"Content-Type must be application/json"` - Invalid request format

---

## Integration Examples

### JavaScript/React Example
```javascript
// Fetch live tracking data
const fetchLiveData = async () => {
  try {
    const response = await fetch('/api/live-tracking/?limit=20&status=Online');
    const data = await response.json();
    
    if (data.success) {
      setEmployees(data.data.live_tracking.employees);
      setSummary(data.data.live_tracking.summary);
    } else {
      console.error('API Error:', data.message);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};

// Auto-refresh every 30 seconds
useEffect(() => {
  fetchLiveData();
  const interval = setInterval(fetchLiveData, 30000);
  return () => clearInterval(interval);
}, []);
```

### Python Example
```python
import requests

# Login first
login_data = {
    'username': 'your_username',
    'password': 'your_password'
}
session = requests.Session()
login_response = session.post('http://your-domain.com/api/auth/login/', json=login_data)

# Fetch live tracking data
response = session.get('http://your-domain.com/api/live-tracking/', params={
    'limit': 20,
    'status': 'Online'
})

if response.status_code == 200:
    data = response.json()
    employees = data['data']['live_tracking']['employees']
    print(f"Found {len(employees)} active employees")
else:
    print(f"Error: {response.status_code}")
```

### cURL Example
```bash
# Get live tracking data
curl -X GET "http://your-domain.com/api/live-tracking/?limit=10&status=Online" \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Get specific employee details
curl -X GET "http://your-domain.com/api/live-tracking/employee/EMP001/" \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

---

## Rate Limiting

- **Live Tracking API**: Recommended refresh interval is 30 seconds
- **Employee Details API**: No specific limits, but avoid excessive requests

## Data Freshness

- Screenshot data is typically updated every 1-5 minutes
- Status information is updated in real-time
- Activity scores are calculated based on recent activity

## Security Considerations

1. All endpoints require authentication
2. Employee data is filtered based on user permissions
3. Screenshot URLs are pre-signed and expire after a set time
4. Sensitive information is filtered from API responses

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Make sure to login first using `/api/auth/login/`
2. **Empty employee list**: Check if there are employees in the database and if they have recent activity
3. **Missing screenshots**: Verify S3 configuration and screenshot capture system
4. **Slow responses**: Consider using pagination with the `limit` parameter

### Debug Mode

Add `?debug=true` to any endpoint to get additional debug information in the response.

---

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
