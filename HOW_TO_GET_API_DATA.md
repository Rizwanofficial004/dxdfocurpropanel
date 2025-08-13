🔗 HOW TO GET DATA FROM YOUR APIs
=====================================

Your APIs are ready! Here are ALL the ways to get data:

## 📡 YOUR API ENDPOINTS:

1. **Health Check**: `/api/test/`
2. **Scheduler Status**: `/api/scheduler/status/`
3. **User Screenshot Counts**: `/api/users/screenshots-count/`
4. **Quick Summary**: `/api/users/screenshots-summary/`
5. **System Status**: `/api/screenshots/tracking-status/`

## 🚀 METHOD 1: BROWSER (Easiest)

Start your server:
```bash
python manage.py runserver 127.0.0.1:8010
```

Then open these URLs in your browser:
- http://127.0.0.1:8010/api/test/
- http://127.0.0.1:8010/api/scheduler/status/
- http://127.0.0.1:8010/api/users/screenshots-count/
- http://127.0.0.1:8010/api/users/screenshots-summary/

## 🐍 METHOD 2: PYTHON CODE

```python
import requests
import json

# Start your Django server first: python manage.py runserver 127.0.0.1:8010

base_url = "http://127.0.0.1:8010/api"

# Get all users with screenshot counts
response = requests.get(f"{base_url}/users/screenshots-count/")
data = response.json()
print(json.dumps(data, indent=2))

# Get top 5 users
response = requests.get(f"{base_url}/users/screenshots-count/?limit=5&sort_by=count&order=desc")
data = response.json()
print(f"Top 5 users: {data['users']}")

# Get summary statistics
response = requests.get(f"{base_url}/users/screenshots-summary/")
data = response.json()
print(f"Total users: {data['summary']['total_users']}")
print(f"Total screenshots: {data['summary']['total_screenshots']}")
```

## 🌐 METHOD 3: CURL/POWERSHELL

```powershell
# Start server first: python manage.py runserver 127.0.0.1:8010

# Health check
Invoke-WebRequest -Uri "http://127.0.0.1:8010/api/test/"

# Get user counts
Invoke-WebRequest -Uri "http://127.0.0.1:8010/api/users/screenshots-count/?limit=5"

# Get summary
Invoke-WebRequest -Uri "http://127.0.0.1:8010/api/users/screenshots-summary/"
```

## 📱 METHOD 4: POSTMAN

1. Install Postman
2. Create new GET request
3. URL: `http://127.0.0.1:8010/api/users/screenshots-count/`
4. Add parameters:
   - limit: 10
   - sort_by: count
   - order: desc
5. Send request
6. View JSON response

## 🔧 METHOD 5: JAVASCRIPT/FETCH

```javascript
// Make sure Django server is running on 127.0.0.1:8010

fetch('http://127.0.0.1:8010/api/users/screenshots-count/?limit=10')
  .then(response => response.json())
  .then(data => {
    console.log('Total users:', data.total_users);
    console.log('Total screenshots:', data.total_screenshots);
    data.users.forEach(user => {
      console.log(`${user.email}: ${user.screenshot_count} screenshots`);
    });
  });
```

## 📊 EXAMPLE RESPONSES:

### GET /api/users/screenshots-count/?limit=3
```json
{
  "success": true,
  "timestamp": "2025-08-13T11:30:00",
  "total_users": 33,
  "total_screenshots": 1925635,
  "users": [
    {
      "email": "user1@example.com",
      "screenshot_count": 125000,
      "last_screenshot": "2025-08-13T10:30:00",
      "projects": ["Project A", "Project B"]
    },
    {
      "email": "user2@example.com", 
      "screenshot_count": 98000,
      "last_screenshot": "2025-08-13T09:15:00",
      "projects": ["Project C"]
    }
  ]
}
```

### GET /api/scheduler/status/
```json
{
  "success": true,
  "scheduler": {
    "is_running": true,
    "next_run_time": "2025-08-13 17:29:33",
    "job_count": 1
  },
  "message": "Scheduler is running automatically every 6 hours"
}
```

## 🎯 PARAMETERS YOU CAN USE:

### /api/users/screenshots-count/
- `limit=10` - Maximum users to return
- `sort_by=count` or `sort_by=email` - Sort field
- `order=desc` or `order=asc` - Sort order
- `min_count=1000` - Minimum screenshot count

### Examples:
- Top 5 users: `?limit=5&sort_by=count&order=desc`
- Users with 1000+ screenshots: `?min_count=1000`
- All users sorted by email: `?sort_by=email&order=asc`

## 🛠️ QUICK START:

1. **Start Django server:**
   ```bash
   cd "your-project-folder"
   python manage.py runserver 127.0.0.1:8010
   ```

2. **Test in browser:**
   - Open: http://127.0.0.1:8010/api/test/
   - Should see: {"status": "API is working", "timestamp": "..."}

3. **Get user data:**
   - Open: http://127.0.0.1:8010/api/users/screenshots-count/?limit=5
   - See all user screenshot counts!

4. **Check scheduler:**
   - Open: http://127.0.0.1:8010/api/scheduler/status/
   - See if auto-updates are running every 6 hours!

🎉 **That's it! Your APIs are ready to use!**
