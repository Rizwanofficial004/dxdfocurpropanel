# 📸 Screenshots Timeline API Documentation

## Overview
The Screenshots Timeline API provides screenshots data ordered from latest to oldest, similar to the live tracking dashboard format. It supports filtering by user, date, and includes comprehensive pagination and metadata.

## Endpoint
**GET** `/api/screenshots/timeline/`

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `email` | string | - | User email (optional, if not provided shows all users) |
| `date` | string | today | Specific date (YYYY-MM-DD format) |
| `limit` | integer | 20 | Number of screenshots per page (max: 100) |
| `page` | integer | 1 | Page number |
| `sort_order` | string | `desc` | Sort order: `desc` (latest first) or `asc` (oldest first) |
| `include_details` | boolean | true | Include detailed file info and activity estimation |

## Example Requests

### Get All Screenshots for Today (Latest First)
```bash
GET /api/screenshots/timeline/?limit=10
```

### Get Screenshots for Specific User
```bash
GET /api/screenshots/timeline/?email=haseebcodejourney@gmail.com&limit=5
```

### Get Screenshots for Specific Date
```bash
GET /api/screenshots/timeline/?date=2025-07-08&limit=20
```

### Get Oldest Screenshots First
```bash
GET /api/screenshots/timeline/?sort_order=asc&limit=10
```

## Response Format

```json
{
    "success": true,
    "message": "Found 15 screenshots across 3 users on 2025-07-09 (showing 10)",
    "data": {
        "screenshots": [
            {
                "file_name": "screenshot_2025-07-09_14-30-25.png",
                "file_key": "screenshots/haseebcodejourney_at_gmail.com/2025-07-09/screenshot_2025-07-09_14-30-25.png",
                "user_email": "haseebcodejourney@gmail.com",
                "user_folder": "haseebcodejourney_at_gmail.com",
                "date_folder": "2025-07-09",
                "size_bytes": 245760,
                "size_mb": 0.234,
                "last_modified": "2025-07-09T14:30:25.123456",
                "timestamp_from_name": "2025-07-09T14:30:25",
                "download_url": "https://s3.amazonaws.com/bucket/presigned-url...",
                "thumbnail_url": "https://s3.amazonaws.com/bucket/presigned-url...",
                "is_recent": true,
                "time_ago": "5 minutes ago",
                "file_type": "screenshot",
                "file_extension": "png",
                "estimated_activity": "Coding",
                "hour_of_day": 14,
                "is_work_hours": true
            }
        ],
        "pagination": {
            "current_page": 1,
            "total_pages": 2,
            "total_screenshots": 15,
            "screenshots_per_page": 10,
            "showing_screenshots": 10,
            "has_next": true,
            "has_previous": false
        },
        "filters_applied": {
            "email": "All users",
            "date": "2025-07-09",
            "sort_order": "desc",
            "include_details": true
        },
        "summary": {
            "total_screenshots_found": 15,
            "users_with_screenshots": 3,
            "screenshots_by_user": {
                "haseebcodejourney@gmail.com": 8,
                "amirishaque67@gmail.com": 4,
                "deniz@dxdglobal.com": 3
            },
            "date_scanned": "2025-07-09",
            "latest_screenshot": "2025-07-09T14:30:25.123456",
            "oldest_screenshot": "2025-07-09T09:15:10.654321"
        },
        "api_info": {
            "endpoint": "/api/screenshots/timeline/",
            "timestamp": "2025-07-09T14:35:00.123456",
            "sort_order": "Latest to Oldest",
            "bucket_scanned": "ddsfocustime"
        }
    },
    "timestamp": "2025-07-09T14:35:00.123500"
}
```

## Screenshot Data Fields

### Basic Information
- `file_name`: Screenshot filename
- `file_key`: Full S3 object key
- `user_email`: User's email address
- `user_folder`: S3 folder name (email with @ replaced by _at_)
- `date_folder`: Date folder (YYYY-MM-DD)

### File Details
- `size_bytes`: File size in bytes
- `size_mb`: File size in megabytes (rounded to 3 decimals)
- `file_extension`: File extension (png, jpg, etc.)
- `file_type`: Always "screenshot"

### Timestamps
- `last_modified`: S3 last modified timestamp (ISO format)
- `timestamp_from_name`: Extracted timestamp from filename
- `time_ago`: Human-readable time ago ("5 minutes ago")
- `is_recent`: Boolean indicating if screenshot is within 1 hour

### URLs
- `download_url`: Presigned S3 URL for downloading
- `thumbnail_url`: Presigned S3 URL for thumbnail (currently same as download)

### Activity Analysis (when include_details=true)
- `estimated_activity`: Estimated activity type based on filename patterns
- `hour_of_day`: Hour extracted from timestamp (0-23)
- `is_work_hours`: Boolean indicating if screenshot was taken during work hours (9 AM - 6 PM)

## Activity Estimation

The API attempts to estimate activity types based on filename patterns:

| Pattern Found | Estimated Activity |
|---------------|-------------------|
| desktop, screen, capture | Screen Capture |
| browser, chrome, firefox, edge | Web Browsing |
| code, vscode, ide, editor | Coding |
| meeting, zoom, teams, call | Meeting |
| email, outlook, gmail | Email |
| Default | General Activity |

## PowerShell Examples

### Get Latest Screenshots
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?limit=5" -Method GET
$data = ($response.Content | ConvertFrom-Json)
$data.data.screenshots | Format-Table file_name, user_email, time_ago
```

### Get Screenshots for Specific User
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?email=user@example.com" -Method GET
$data = ($response.Content | ConvertFrom-Json)
Write-Host "Total Screenshots: $($data.data.summary.total_screenshots_found)"
```

### Get Screenshots by Date Range
```powershell
$dates = @("2025-07-09", "2025-07-08", "2025-07-07")
foreach ($date in $dates) {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?date=$date&limit=5" -Method GET
    $data = ($response.Content | ConvertFrom-Json)
    Write-Host "Date: $date - Screenshots: $($data.data.summary.total_screenshots_found)"
}
```

### Display Screenshot Timeline
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?limit=10" -Method GET
$data = ($response.Content | ConvertFrom-Json)

Write-Host "📸 SCREENSHOTS TIMELINE - Latest to Oldest" -ForegroundColor Yellow
Write-Host "=" * 50

foreach ($screenshot in $data.data.screenshots) {
    $user = $screenshot.user_email.Split('@')[0]
    Write-Host "`n🖼️  $($screenshot.file_name)" -ForegroundColor White
    Write-Host "   👤 User: $user" -ForegroundColor Cyan
    Write-Host "   📅 Time: $($screenshot.time_ago)" -ForegroundColor Green
    Write-Host "   📊 Size: $($screenshot.size_mb) MB" -ForegroundColor Magenta
    Write-Host "   💼 Activity: $($screenshot.estimated_activity)" -ForegroundColor Yellow
    Write-Host "   🔗 Download: $($screenshot.download_url)" -ForegroundColor Gray
}
```

## JavaScript Integration

```javascript
// Get latest screenshots
async function getLatestScreenshots(limit = 10) {
    const response = await fetch(`/api/screenshots/timeline/?limit=${limit}`);
    const data = await response.json();
    return data;
}

// Get screenshots for specific user
async function getUserScreenshots(email, date = null) {
    let url = `/api/screenshots/timeline/?email=${email}`;
    if (date) url += `&date=${date}`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Display screenshots in timeline format
function displayScreenshotsTimeline(screenshots) {
    const container = document.getElementById('screenshots-timeline');
    
    container.innerHTML = screenshots.map(screenshot => `
        <div class="screenshot-card">
            <img src="${screenshot.thumbnail_url}" alt="${screenshot.file_name}" 
                 style="max-width: 200px; border-radius: 8px;">
            <div class="screenshot-info">
                <h4>${screenshot.user_email.split('@')[0]}</h4>
                <p>${screenshot.time_ago}</p>
                <p>${screenshot.estimated_activity}</p>
                <a href="${screenshot.download_url}" target="_blank">Download</a>
            </div>
        </div>
    `).join('');
}
```

## Error Responses

### No Screenshots Found
```json
{
    "success": true,
    "message": "No screenshots found for any users on 2025-07-09",
    "data": {
        "screenshots": [],
        "pagination": {
            "current_page": 1,
            "total_pages": 1,
            "total_screenshots": 0,
            "screenshots_per_page": 20,
            "showing_screenshots": 0,
            "has_next": false,
            "has_previous": false
        },
        "summary": {
            "total_screenshots_found": 0,
            "users_with_screenshots": 0,
            "screenshots_by_user": {}
        }
    }
}
```

### Invalid Date Format
```json
{
    "success": false,
    "message": "Invalid date format. Use YYYY-MM-DD",
    "status_code": 400
}
```

### S3 Connection Error
```json
{
    "success": false,
    "message": "S3 connection failed: Connection timeout",
    "status_code": 500
}
```

## Integration with Live Tracking Dashboard

This API can be easily integrated with your live tracking dashboard to show recent screenshots for each user:

```javascript
// Add to your live tracking dashboard
async function addScreenshotsToUserCard(userEmail, userCardElement) {
    try {
        const response = await fetch(`/api/screenshots/timeline/?email=${userEmail}&limit=3`);
        const data = await response.json();
        
        if (data.success && data.data.screenshots.length > 0) {
            const latestScreenshot = data.data.screenshots[0];
            
            // Add screenshot thumbnail to user card
            const screenshotElement = document.createElement('div');
            screenshotElement.innerHTML = `
                <div class="latest-screenshot">
                    <img src="${latestScreenshot.thumbnail_url}" 
                         style="width: 40px; height: 30px; border-radius: 4px;">
                    <span>${latestScreenshot.time_ago}</span>
                </div>
            `;
            
            userCardElement.appendChild(screenshotElement);
        }
    } catch (error) {
        console.error('Error loading screenshots:', error);
    }
}
```

## Performance Notes

- API responses include S3 presigned URLs with default expiration
- Large date ranges may take longer to process
- Pagination is recommended for better performance
- Screenshots are sorted by S3 LastModified timestamp for accuracy

## Next Steps

1. **Thumbnail Generation**: Implement actual thumbnail generation for faster loading
2. **Caching**: Add Redis caching for frequently accessed screenshot lists
3. **Real-time Updates**: WebSocket integration for live screenshot notifications
4. **Image Analysis**: AI-powered activity detection from screenshot content
5. **Privacy Controls**: User permissions and screenshot visibility settings
