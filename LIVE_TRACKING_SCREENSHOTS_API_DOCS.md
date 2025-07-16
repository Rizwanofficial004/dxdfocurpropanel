# Live Tracking Screenshots API Documentation

## Overview
The Live Tracking Screenshots API provides real-time employee monitoring with screenshot previews, designed to integrate seamlessly with your live tracking dashboard interface.

## Endpoint
```
GET /api/live-tracking/screenshots/
```

## Features
- ✅ Real-time user status (active, idle, offline)
- ✅ Screenshot previews with presigned S3 URLs
- ✅ Fast mode for performance optimization
- ✅ Status filtering and sorting
- ✅ User-specific or all-users data
- ✅ Format matches your live tracking UI
- ✅ Auto-refresh capability

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `email` | string | - | User email (optional, shows all users if not provided) |
| `limit` | integer | 10 | Number of users to return (max: 50) |
| `fast_mode` | boolean | true | Quick scan mode for better performance |
| `status` | string | all | Filter by status (all, active, idle, offline) |
| `include_screenshots` | boolean | true | Include screenshot URLs in response |
| `screenshots_per_user` | integer | 3 | Number of screenshots per user (max: 10) |
| `sort_by` | string | status | Sort by (status, name, activity) |

## Example Requests

### Get All Users (Fast Mode)
```bash
GET /api/live-tracking/screenshots/?fast_mode=true&limit=10
```

### Get Active Users Only
```bash
GET /api/live-tracking/screenshots/?status=active&limit=20
```

### Get Specific User's Screenshots
```bash
GET /api/live-tracking/screenshots/?email=user@example.com&screenshots_per_user=5
```

### Get Users with More Screenshots
```bash
GET /api/live-tracking/screenshots/?screenshots_per_user=5&limit=15
```

### Full Mode with Complete Data
```bash
GET /api/live-tracking/screenshots/?fast_mode=false&screenshots_per_user=10
```

## Response Format

```json
{
    "success": true,
    "message": "Found 8 users with 45 total screenshots",
    "data": {
        "users": [
            {
                "user_email": "user@example.com",
                "user_name": "John Doe",
                "display_name": "John Doe",
                "status": "active",
                "status_color": "#10B981",
                "last_activity": "2 minutes ago",
                "screenshot_count": 15,
                "screenshots": [
                    {
                        "key": "screenshots/user_at_example.com/2025-07-09/screenshot_001.png",
                        "filename": "screenshot_001.png",
                        "date_folder": "2025-07-09",
                        "url": "https://s3.amazonaws.com/...",
                        "last_modified": "2025-07-09T14:30:00",
                        "size": 245760
                    }
                ],
                "latest_screenshot": {...},
                "is_online": true,
                "last_screenshot_time": "2025-07-09T14:30:00"
            }
        ],
        "summary": {
            "total_users": 8,
            "total_screenshots": 45,
            "online_users": 6,
            "active_users": 4,
            "idle_users": 2,
            "offline_users": 2
        },
        "status_statistics": {
            "active": 4,
            "idle": 2,
            "offline": 2,
            "total": 8
        },
        "filters_applied": {
            "email": "",
            "status": "all",
            "limit": 10,
            "fast_mode": true,
            "include_screenshots": true,
            "screenshots_per_user": 3
        },
        "api_info": {
            "endpoint": "/api/live-tracking/screenshots/",
            "timestamp": "2025-07-09T14:35:00",
            "total_users_found": 8,
            "response_time_optimized": true
        }
    }
}
```

## Status Definitions

| Status | Color | Description |
|--------|-------|-------------|
| `active` | #10B981 (Green) | User was active within last 10 minutes |
| `idle` | #6B7280 (Gray) | User was active within last hour |
| `offline` | #374151 (Dark Gray) | User was inactive for more than 1 hour |

## Performance Modes

### Fast Mode (`fast_mode=true`)
- ✅ Optimized for speed
- ✅ Limited S3 queries per user
- ✅ Best for live dashboards
- ⚠️ May not show complete screenshot count

### Full Mode (`fast_mode=false`)
- ✅ Complete data accuracy
- ✅ Full screenshot counts
- ⚠️ Slower response time
- ✅ Best for detailed analysis

## Integration Examples

### JavaScript/AJAX
```javascript
// Fetch live tracking data
async function loadLiveTracking() {
    try {
        const response = await fetch('/api/live-tracking/screenshots/?fast_mode=true&limit=10');
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.data.users);
            updateSummary(data.data.summary);
        }
    } catch (error) {
        console.error('Error loading live tracking:', error);
    }
}

// Auto-refresh every 30 seconds
setInterval(loadLiveTracking, 30000);
```

### PowerShell
```powershell
$response = Invoke-RestMethod -Uri "https://dxdtime.ddsolutions.io/api/live-tracking/screenshots/" -Method GET
if ($response.success) {
    Write-Host "Found $($response.data.summary.total_users) users"
    Write-Host "Active: $($response.data.summary.active_users)"
}
```

### Python
```python
import requests

response = requests.get('https://dxdtime.ddsolutions.io/api/live-tracking/screenshots/')
data = response.json()

if data['success']:
    print(f"Found {data['data']['summary']['total_users']} users")
    for user in data['data']['users']:
        print(f"{user['user_name']}: {user['status']} ({user['screenshot_count']} screenshots)")
```

## Error Handling

The API returns standard error responses:

```json
{
    "success": false,
    "message": "Error description",
    "data": {
        "error_details": "Detailed error information",
        "api_endpoint": "/api/live-tracking/screenshots/"
    }
}
```

Common error codes:
- `400` - Invalid parameters
- `500` - Server or S3 connection error

## Live Dashboard Integration

### HTML Demo
The included `live_tracking_screenshots_demo.html` provides a complete example of:
- Real-time user cards display
- Status filtering and sorting
- Screenshot preview thumbnails
- Auto-refresh functionality
- Responsive design matching your dashboard

### Key Features for Dashboard
1. **User Cards Layout**: Matches your existing live tracking interface
2. **Status Indicators**: Color-coded status dots and badges
3. **Screenshot Previews**: Thumbnail grid with click-to-expand
4. **Real-time Updates**: Auto-refresh with 30-second intervals
5. **Filtering**: Status, user, and limit controls
6. **Performance**: Fast mode for real-time dashboard use

## S3 Integration

The API integrates with your existing S3 bucket structure:
```
ddsfocustime/
├── screenshots/
│   ├── user_at_example.com/
│   │   ├── 2025-07-09/
│   │   │   ├── screenshot_001.png
│   │   │   └── screenshot_002.png
│   │   └── 2025-07-08/
│   └── another_user_at_domain.com/
```

- Uses presigned URLs for secure image access
- Respects your existing folder structure
- Optimized S3 queries for performance

## Best Practices

1. **Use Fast Mode** for live dashboards
2. **Limit Results** to 10-20 users for optimal performance
3. **Auto-refresh** every 30-60 seconds
4. **Handle Errors** gracefully with fallback UI
5. **Cache Results** briefly to reduce API calls
6. **Progressive Loading** for large user lists

## Troubleshooting

### Common Issues

1. **No Users Returned**
   - Check S3 bucket access
   - Verify screenshot folder structure
   - Ensure email format conversion (@ -> _at_)

2. **Slow Performance**
   - Use `fast_mode=true`
   - Reduce `limit` parameter
   - Decrease `screenshots_per_user`

3. **Screenshots Not Loading**
   - Check S3 presigned URL generation
   - Verify image file extensions
   - Ensure proper CORS settings

### Debug Mode
Add debug logging by checking Django console output when making API calls.

## Related Endpoints

- `/api/live-tracking/` - Basic live tracking without screenshots
- `/api/screenshots/timeline/` - Timeline-based screenshot view
- `/api/live-tracking/update/` - Update user status

---

*For more information or support, refer to your existing API documentation or contact the development team.*
