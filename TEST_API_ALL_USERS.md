# 🧪 Test Your Users Search API

## Quick Test Commands

### Test 1: Get ALL users (no search query)
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-10-14"
```

**Expected Result:** Should return all 10 users from S3:
- atakankahranam35@outlook.com
- begumdamlasen@gmail.com
- cagla.shr@gmail.com
- drivedeluxe1@gmail.com
- ertugrul.desing@gmail.com
- gulaysencer95@gmail.com
- gulsummelisa.23@gmail.com
- mohsinabbass688630@gmail.com
- nawaz@dxdglobal.com
- umutgny160@gmail.com

### Test 2: Search for "nawaz"
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-10-14&q=nawaz"
```

**Expected Result:** Should return users matching "nawaz":
- nawaz@dxdglobal.com (from nawaz_at_dxdglobal.com folder)
- Possibly others if they have "nawaz" in their name

### Test 3: Search for "begum"
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-10-14&q=begum"
```

**Expected Result:** Should return:
- begumdamlasen@gmail.com

### Test 4: Search for "gmail"
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-10-14&q=gmail"
```

**Expected Result:** Should return all users with @gmail.com

## Expected API Response Format

Your backend API should return this JSON structure:

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "1",
        "email": "nawaz@dxdglobal.com",
        "display_name": "nawaz",
        "original_name": "nawaz_at_dxdglobal.com",
        "total_screenshots": 150,
        "total_size_mb": 450.5,
        "active_days_count": 10,
        "active_months_count": 2,
        "first_activity": "2025-09-15T08:00:00Z",
        "last_activity": "2025-10-14T16:30:00Z",
        "status": "active",
        "folders": [
          "nawaz_at_dxdglobal.com/2025/09/15",
          "nawaz_at_dxdglobal.com/2025/10/14"
        ],
        "grouped_screenshots": {
          "2025-10-14": [
            {
              "filename": "screenshot_2025-10-14_14-30-00.png",
              "screenshot_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/nawaz_at_dxdglobal.com/2025/10/14/screenshot_2025-10-14_14-30-00.png",
              "timestamp": "2025-10-14T14:30:00Z",
              "size_mb": "2.5"
            }
          ]
        },
        "recent_screenshots": [
          {
            "filename": "screenshot_2025-10-14_14-30-00.png",
            "screenshot_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/nawaz_at_dxdglobal.com/2025/10/14/screenshot_2025-10-14_14-30-00.png",
            "thumbnail_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/nawaz_at_dxdglobal.com/2025/10/14/thumb_screenshot_2025-10-14_14-30-00.png",
            "datetime": "2025-10-14T14:30:00Z",
            "date": "2025-10-14",
            "time": "14:30:00",
            "size_mb": "2.5",
            "size_bytes": 2621440,
            "subfolder_path": "2025/10/14",
            "full_key": "nawaz_at_dxdglobal.com/2025/10/14/screenshot_2025-10-14_14-30-00.png"
          }
        ]
      },
      {
        "id": "2",
        "email": "begumdamlasen@gmail.com",
        "display_name": "begumdamlasen",
        "original_name": "begumdamlasen_at_gmail.com",
        "total_screenshots": 45,
        "total_size_mb": 120.3,
        "active_days_count": 5,
        "active_months_count": 1,
        "first_activity": "2025-10-10T09:00:00Z",
        "last_activity": "2025-10-14T15:00:00Z",
        "status": "active"
      }
    ],
    "pagination": {
      "total_users": 10,
      "page": 1,
      "page_size": 50,
      "total_pages": 1
    },
    "summary": {
      "total_users": 10,
      "total_screenshots": 567,
      "total_size_mb": 1845.5
    }
  }
}
```

## S3 Bucket Folder Structure

Your S3 bucket should have this structure:
```
ddsfocustime/
└── users_screenshots/
    └── 2025-10-14/
        ├── atakankahranam35_at_outlook.com/
        │   └── (screenshots)
        ├── begumdamlasen_at_gmail.com/
        │   └── (screenshots)
        ├── cagla.shr_at_gmail.com/
        │   └── (screenshots)
        ├── drivedeluxe1_at_gmail.com/
        │   └── (screenshots)
        ├── ertugrul.desing_at_gmail.com/
        │   └── (screenshots)
        ├── gulaysencer95_at_gmail.com/
        │   └── (screenshots)
        ├── gulsummelisa.23_at_gmail.com/
        │   └── (screenshots)
        ├── mohsinabbass688630_at_gmail.com/
        │   └── (screenshots)
        ├── nawaz_at_dxdglobal.com/
        │   └── (screenshots)
        └── umutgny160_at_gmail.com/
            └── (screenshots)
```

## Backend Implementation Checklist

Your Django backend should:

1. ✅ **List S3 folders** - Get all user folders from S3 bucket
2. ✅ **Parse folder names** - Convert `nawaz_at_dxdglobal.com` to `nawaz@dxdglobal.com`
3. ✅ **Count screenshots** - Count files in each user's folder
4. ✅ **Filter by date range** - Only include users with activity between `start_date` and `end_date`
5. ✅ **Search filter** - If `q` parameter provided, filter users by name/email
6. ✅ **Return JSON** - Format response as shown above

## Sample Backend Code (Django)

```python
import boto3
from datetime import datetime

def search_users(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    query = request.GET.get('q', '').lower()
    
    # Initialize S3 client
    s3 = boto3.client('s3')
    bucket_name = 'ddsfocustime'
    
    # List all user folders
    response = s3.list_objects_v2(
        Bucket=bucket_name,
        Prefix='users_screenshots/',
        Delimiter='/'
    )
    
    users = []
    
    for prefix in response.get('CommonPrefixes', []):
        folder = prefix['Prefix'].split('/')[-2]  # Get folder name
        
        # Parse email from folder name (e.g., nawaz_at_dxdglobal.com -> nawaz@dxdglobal.com)
        email = folder.replace('_at_', '@')
        display_name = email.split('@')[0]
        
        # If query provided, filter by name/email
        if query and query not in email.lower() and query not in display_name.lower():
            continue
        
        # Count screenshots for this user
        screenshots = s3.list_objects_v2(
            Bucket=bucket_name,
            Prefix=f'users_screenshots/{start_date}/{folder}/'
        )
        
        total_screenshots = screenshots.get('KeyCount', 0)
        
        users.append({
            'id': email,
            'email': email,
            'display_name': display_name,
            'original_name': folder,
            'total_screenshots': total_screenshots,
            'status': 'active'
        })
    
    return JsonResponse({
        'status': 'success',
        'data': {
            'users': users,
            'pagination': {
                'total_users': len(users),
                'page': 1,
                'page_size': 50
            }
        }
    })
```

## Frontend Changes Made

I updated the frontend to:

1. ✅ **Use date range 2025-09-01 to today** - Matches your S3 bucket structure
2. ✅ **Remove user filtering** - Show ALL users from backend response
3. ✅ **Better logging** - Console shows all users found
4. ✅ **Handle email formats** - Works with both `nawaz@dxdglobal.com` and `nawaz_at_dxdglobal.com`

## Testing in Browser

1. **Open browser console** (F12)
2. **Type "nawaz" in search box**
3. **Check console logs:**
   ```
   👥 Searching users from API: /api/users/search/?start_date=2025-09-01&end_date=2025-10-14&q=nawaz
   🔍 Search query: nawaz
   📅 Date range: 2025-09-01 to 2025-10-14 (covers all S3 activity)
   ✅ Users API Success - Raw response: {status: "success", data: {...}}
   📊 Total users in response: 10
   ✅ Found 10 users from S3:
     👤 nawaz - 150 screenshots - 10 active days
     👤 begumdamlasen - 45 screenshots - 5 active days
     ...
   ```

## Next Steps

1. ✅ **Test backend API** with cURL commands above
2. ✅ **Verify it returns all 10 users**
3. ✅ **Check email format** (should convert `_at_` to `@`)
4. ✅ **Test search filtering** with different queries
5. ✅ **Test in browser** - Type "nawaz" and see all matching users

## Success Criteria

✅ Typing "nawaz" shows: nawaz@dxdglobal.com  
✅ Typing "gmail" shows: all @gmail.com users (7 users)  
✅ Typing "outlook" shows: atakankahranam35@outlook.com  
✅ Typing "dxd" shows: nawaz@dxdglobal.com  
✅ Empty search shows: all 10 users  

---

**Your frontend is now ready!** Just make sure your backend API returns all users from S3. 🚀
