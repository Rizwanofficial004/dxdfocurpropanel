# 📅 Date-Based Live Tracking Screenshots API

## Overview
I've created a new enhanced Live Tracking API that searches for users based on **actual screenshot dates** in their filenames, providing precise day-by-day activity tracking.

## 🆕 New API Endpoint

```
GET /api/live-tracking/screenshots-by-date/
```

## 🎯 Key Features

### ✅ **Accurate Date-Based Search**
- Searches for screenshots with **actual dates in filenames** (e.g., `2025-07-09_15-30-45_screenshot.webp`)
- Groups users by their **real activity dates**: Today, 1 day ago, 2 days ago, etc.
- No more guessing based on file modification times!

### ✅ **Smart Date Grouping**
- **Today** - Users with screenshots created today (`2025-07-09`)
- **1 day ago** - Users active yesterday (`2025-07-08`)
- **2 days ago** - Users active 2 days ago (`2025-07-07`)
- And so on...

### ✅ **Performance Optimized**
- Scans only specific date patterns in S3
- Configurable limits for users per day and screenshots per user
- Efficient S3 prefix searches

## 📋 Query Parameters

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `days_back` | 30 | 90 | Number of days to search backwards |
| `limit_users_per_day` | 50 | 100 | Max users per day group |
| `limit_screenshots` | 5 | 20 | Screenshots per user |
| `include_screenshots` | true | - | Include screenshot URLs |
| `sort_by` | activity | - | Sort: `name`, `activity`, `screenshot_count` |

## 💡 Example Usage

### Today's Activity Only
```bash
GET /api/live-tracking/screenshots-by-date/?days_back=1&limit_users_per_day=100
```

### Last 7 Days with More Screenshots
```bash
GET /api/live-tracking/screenshots-by-date/?days_back=7&limit_screenshots=10&sort_by=screenshot_count
```

### Quick Overview (Last 30 Days)
```bash
GET /api/live-tracking/screenshots-by-date/?days_back=30&limit_users_per_day=20&limit_screenshots=3
```

## 📊 Enhanced Response Structure

```json
{
  "success": true,
  "message": "Found 15 users with 245 screenshots across 5 days",
  "data": {
    "users": [...],  // Flat list of all users
    "date_groups": {  // 🆕 Users grouped by actual activity dates
      "today": {
        "group_label": "Today",
        "days_ago": 0,
        "activity_date": "2025-07-09",
        "user_count": 5,
        "users": [
          {
            "user_email": "user@example.com",
            "display_name": "User Name",
            "status": "active",
            "screenshot_count": 25,
            "activity_date": "2025-07-09",
            "days_since_activity": 0,
            "screenshots": [...]
          }
        ]
      },
      "2_days_ago": {
        "group_label": "2 days ago",
        "days_ago": 2,
        "activity_date": "2025-07-07",
        "user_count": 3,
        "users": [...]
      }
    },
    "summary": {
      "total_users": 15,
      "total_screenshots": 245,
      "groups_count": 5,
      "days_searched": 7,
      "search_date_range": "2025-07-02 to 2025-07-09"
    },
    "group_statistics": {  // 🆕 Quick stats per day
      "today": {
        "label": "Today",
        "days_ago": 0,
        "activity_date": "2025-07-09",
        "count": 5
      }
    }
  }
}
```

## 🔄 Comparison: Old vs New API

| Feature | Original API | New Date-Based API |
|---------|-------------|-------------------|
| **Search Method** | File modification time | Actual filename dates |
| **Accuracy** | Approximate | Precise |
| **Date Detection** | `LastModified` metadata | Screenshot filename parsing |
| **Grouping** | Days since last activity | Actual activity dates |
| **Performance** | Scans all files | Targeted date searches |

## 🎯 Perfect for Dashboard Integration

### Today's Team Activity
```javascript
// Get today's active users
fetch('/api/live-tracking/screenshots-by-date/?days_back=1')
  .then(response => response.json())
  .then(data => {
    const todayGroup = data.data.date_groups.today;
    if (todayGroup) {
      console.log(`${todayGroup.user_count} users active today`);
      todayGroup.users.forEach(user => {
        console.log(`${user.display_name}: ${user.screenshot_count} screenshots`);
      });
    }
  });
```

### Weekly Activity Overview
```javascript
// Get last 7 days breakdown
fetch('/api/live-tracking/screenshots-by-date/?days_back=7')
  .then(response => response.json())
  .then(data => {
    Object.entries(data.data.date_groups).forEach(([key, group]) => {
      console.log(`${group.group_label}: ${group.user_count} users`);
    });
  });
```

## 📁 File Structure
- `dashboard/date_based_live_tracking_api.py` - New API implementation
- `dashboard/api_urls.py` - Updated with new endpoint
- `test_date_based_api.py` - Comprehensive test script

## 🚀 Status
- ✅ **API Created** - New endpoint implemented
- ✅ **URL Configured** - Added to Django URL routing
- ✅ **Test Script** - Ready for testing
- 🔄 **Ready to Test** - Start Django server and test!

## 🧪 Testing Commands

Once Django server is running:

```bash
# Test in PowerShell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/live-tracking/screenshots-by-date/?days_back=5" -Method GET

# Test with Python
python test_date_based_api.py

# Test in Browser
http://127.0.0.1:8000/api/live-tracking/screenshots-by-date/?days_back=10&limit_screenshots=5
```

## 🎉 Expected Results

Based on your S3 structure showing July 9, 2025 screenshots, you should see:
- **Today** group with users who have `2025-07-09_` prefixed screenshots
- **Previous days** with users having screenshots from those specific dates
- Accurate counts and real activity patterns

This API will give you the **exact day-by-day user activity** you requested! 🎯
