# Enhanced Live Tracking Screenshots API - Day-Based Grouping

## Overview
The Live Tracking Screenshots API has been enhanced to organize users by **days since their last activity**, making it easier to track user engagement patterns over time.

## Endpoint
```
GET /api/live-tracking/screenshots/
```

## New Features

### 🗓️ Day-Based User Grouping
Users are now automatically grouped by their last activity:
- **Today** - Users active today
- **1 day ago** - Users last active yesterday  
- **2 days ago** - Users last active 2 days ago
- **3 days ago** - Users last active 3 days ago
- And so on...

### 📊 Enhanced Response Structure

#### New Response Fields:
```json
{
  "data": {
    "users": [...],  // Flat list of all users (sorted by days since activity)
    "user_groups": {  // NEW: Users organized by activity groups
      "today": {
        "group_label": "Today",
        "days_ago": 0,
        "user_count": 2,
        "users": [...]
      },
      "2_days_ago": {
        "group_label": "2 days ago", 
        "days_ago": 2,
        "user_count": 1,
        "users": [...]
      }
    },
    "group_statistics": {  // NEW: Quick stats per group
      "today": {"label": "Today", "days_ago": 0, "count": 2},
      "2_days_ago": {"label": "2 days ago", "days_ago": 2, "count": 1}
    },
    "summary": {
      "total_users": 10,
      "groups_count": 5,  // NEW: Number of activity groups
      // ...existing fields
    }
  }
}
```

## Query Parameters

All existing parameters are supported, plus enhanced sorting:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `limit_users` | 10 | Max users to return |
| `limit_screenshots` | 3 | Screenshots per user |
| `sort_by` | `status` | Sort method: `status`, `name`, `last_activity` |
| `status` | `all` | Filter: `all`, `active`, `idle`, `offline` |
| `include_screenshots` | `true` | Include screenshot URLs |

## Example Usage

### Get All Users Grouped by Activity Days
```bash
GET /api/live-tracking/screenshots/?limit_users=20&sort_by=last_activity
```

### Sample Response Structure
```json
{
  "success": true,
  "message": "Found 10 users with 4330 total screenshots",
  "data": {
    "user_groups": {
      "today": {
        "group_label": "Today",
        "days_ago": 0,
        "user_count": 3,
        "users": [
          {
            "user_email": "john@example.com",
            "display_name": "John Doe",
            "status": "active",
            "last_activity": "2 hours ago",
            "screenshot_count": 45,
            "days_since_activity": 0
          }
        ]
      },
      "3_days_ago": {
        "group_label": "3 days ago",
        "days_ago": 3,  
        "user_count": 2,
        "users": [...]
      }
    },
    "group_statistics": {
      "today": {"label": "Today", "count": 3},
      "3_days_ago": {"label": "3 days ago", "count": 2}
    }
  }
}
```

## Benefits

✅ **Better Organization** - Users grouped by recency of activity  
✅ **Easy Dashboard Integration** - Clear time-based sections  
✅ **Performance Optimized** - Efficient grouping algorithm  
✅ **Backward Compatible** - All existing functionality preserved  
✅ **Flexible Sorting** - Sort within each day group by status/name/activity  

## Dashboard Integration

Perfect for creating time-based sections in your dashboard:

```javascript
// Process grouped user data
const groups = response.data.user_groups;

Object.entries(groups).forEach(([groupKey, groupData]) => {
  console.log(`${groupData.group_label}: ${groupData.user_count} users`);
  
  groupData.users.forEach(user => {
    console.log(`  - ${user.display_name} (${user.status})`);
  });
});
```

## Implementation Notes

- Users are sorted **first by days since activity** (ascending), then by your chosen sort method within each group
- Groups are created dynamically based on actual user activity patterns
- Empty groups (days with no user activity) are not included in the response
- The `days_since_activity` field is added to each user object for reference

This enhancement makes it easy to see at a glance:
- Who worked today
- Who was active recently (1-3 days ago)
- Who hasn't been active for longer periods

Perfect for team management and productivity tracking!
