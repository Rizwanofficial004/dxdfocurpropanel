# 📸 Screenshots Timeline API - Updated Format

## Overview
The Screenshots Timeline API has been updated to match the Live Tracking dashboard format. Screenshots are now organized by users in cards, similar to how the live tracking displays user information.

## Endpoint
```
GET /api/screenshots/timeline/
```

## NEW Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `email` | string | All users | User email (optional, if not provided shows all users) |
| `date` | string | Today | Specific date (YYYY-MM-DD format) |
| `limit` | integer | 10 | Number of screenshots **per user** (max: 50) |
| `view` | string | cards | Display format ('cards' for user cards, 'list' for simple list) |
| `sort_order` | string | desc | Sort order (desc=latest first, asc=oldest first) |
| `include_thumbnails` | boolean | true | Include thumbnail URLs for screenshots |

## NEW Response Format - Cards View (Like Live Tracking)

```json
{
    "success": true,
    "message": "Found 25 screenshots across 3 users on 2025-06-21",
    "data": {
        "users": [
            {
                "user_email": "haseebcodejourney@gmail.com",
                "user_name": "Haseebcodejourney",
                "screenshot_count": 12,
                "screenshots": [
                    {
                        "file_name": "screenshot_2025-06-21_14-30-15.png",
                        "file_key": "screenshots/haseebcodejourney_at_gmail.com/2025-06-21/screenshot_2025-06-21_14-30-15.png",
                        "size_mb": 2.4,
                        "last_modified": "2025-06-21T14:30:15.000Z",
                        "timestamp": "2025-06-21T14:30:15.000Z",
                        "time_ago": "2 hours ago",
                        "is_recent": true,
                        "hour_of_day": 14,
                        "estimated_activity": "Development",
                        "thumbnail_url": "https://presigned-url...",
                        "download_url": "https://presigned-url..."
                    }
                    // ... more screenshots (up to limit per user)
                ],
                "latest_screenshot": "2025-06-21T14:30:15.000Z",
                "oldest_screenshot": "2025-06-21T09:15:30.000Z",
                "total_size_mb": 28.6,
                "date": "2025-06-21"
            }
            // ... more users
        ],
        "summary": {
            "total_users": 3,
            "total_screenshots": 25,
            "date": "2025-06-21",
            "users_with_screenshots": 3,
            "total_size_mb": 76.4
        },
        "filters": {
            "email": "All users",
            "date": "2025-06-21",
            "limit_per_user": 10,
            "sort_order": "desc",
            "view_format": "cards"
        },
        "api_info": {
            "endpoint": "/api/screenshots/timeline/",
            "timestamp": "2025-07-09T13:45:23.123456",
            "display_format": "User cards with screenshots (like live tracking)",
            "bucket_scanned": "ddsfocustime"
        }
    },
    "timestamp": "2025-07-09T13:45:23.123456"
}
```

## PowerShell Testing Examples

### Test Cards Format (Like Live Tracking)
```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?view=cards&limit=5" -Method GET
Write-Host "Display Format: $($response.data.api_info.display_format)"
Write-Host "Total Users: $($response.data.summary.total_users)"
Write-Host "Total Screenshots: $($response.data.summary.total_screenshots)"
```

### Test Specific User
```powershell
$email = "haseebcodejourney@gmail.com"
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?email=$email&view=cards&limit=3" -Method GET
$response.data.users | ConvertTo-Json -Depth 3
```

### Test List Format
```powershell
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/screenshots/timeline/?view=list&limit=5" -Method GET
Write-Host "View Format: $($response.data.filters.view_format)"
$response.data.screenshots | Select-Object file_name, user_email, time_ago
```

## Key Changes

### ✅ What's New
1. **User Cards Format**: Screenshots organized by users (like live tracking dashboard)
2. **Cards vs List View**: Choose between user cards or simple list
3. **Per-User Limits**: Limit screenshots per user, not total
4. **User Information**: Display name, avatar initials, totals per user
5. **Live Tracking Style**: Matches the existing dashboard design

### ❌ What's Removed
1. **Pagination**: No more page-based pagination (simplified to per-user limits)
2. **Detailed Metadata**: Reduced metadata for cleaner cards display
3. **Complex Filtering**: Simplified to focus on date and user

## Demo Page
A complete demo showing the new format is available at:
```
file:///c:/Users/DDS/Downloads/search-logs/screenshots_timeline_demo.html
```

## JavaScript Integration Example

```javascript
// Fetch screenshots in cards format
fetch('/api/screenshots/timeline/?view=cards&limit=5')
    .then(response => response.json())
    .then(data => {
        // Display user cards like live tracking
        data.data.users.forEach(user => {
            createUserCard(user);
        });
    });

function createUserCard(user) {
    const userInitials = user.user_name.split(' ').map(n => n[0]).join('');
    
    // Create card HTML similar to live tracking
    const cardHTML = `
        <div class="user-card">
            <div class="user-header">
                <div class="user-avatar">${userInitials}</div>
                <div class="user-info">
                    <h3>${user.user_name}</h3>
                    <div class="user-email">${user.user_email}</div>
                </div>
                <div class="screenshot-count">${user.screenshot_count} 📸</div>
            </div>
            <div class="screenshots-grid">
                ${user.screenshots.map(s => `
                    <img src="${s.thumbnail_url}" alt="${s.file_name}" title="${s.time_ago}">
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('users-container').innerHTML += cardHTML;
}
```

## Summary
The Screenshots Timeline API now perfectly matches the Live Tracking dashboard format, providing user cards with their screenshots organized from latest to oldest. This makes it easy to integrate with existing dashboard designs and provides a consistent user experience.
