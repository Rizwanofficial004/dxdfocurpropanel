# 📱 POSTMAN API TESTING GUIDE
## Complete Guide to Test Your Screenshot APIs

### 🚀 QUICK START

1. **Start Django Server:**
```bash
python manage.py runserver 127.0.0.1:8010
```

2. **Import to Postman:**
   - Open Postman
   - Click "Import" → Select `Screenshot_APIs_Postman_Collection.json`
   - Set environment variable: `base_url` = `http://127.0.0.1:8010`

3. **Test APIs in this order:**

### 📋 API TEST CHECKLIST

#### ✅ **1. Health Check**
- **URL:** `GET {{base_url}}/api/test/`
- **Purpose:** Verify server is running
- **Expected:** `{"status": "API is working"}`

#### ⏰ **2. Scheduler Status** 
- **URL:** `GET {{base_url}}/api/scheduler/status/`
- **Purpose:** Check auto-scheduler (runs every 6 hours)
- **Expected:** Shows if scheduler is running and next update time

#### 📊 **3. User Screenshot Counts**
- **URL:** `GET {{base_url}}/api/users/screenshots-count/`
- **Purpose:** Get all users with screenshot counts
- **Expected:** List of users with email, count, last screenshot, projects

#### 🏆 **4. Top 5 Users**
- **URL:** `GET {{base_url}}/api/users/screenshots-count/?limit=5&sort_by=count&order=desc`
- **Purpose:** Top 5 users by screenshot count
- **Parameters:** limit=5, sort_by=count, order=desc

#### 🎯 **5. High Volume Users**
- **URL:** `GET {{base_url}}/api/users/screenshots-count/?min_count=1000`
- **Purpose:** Users with 1000+ screenshots
- **Parameters:** min_count=1000

#### 📈 **6. Quick Summary**
- **URL:** `GET {{base_url}}/api/users/screenshots-summary/`
- **Purpose:** Overall statistics
- **Expected:** Total users, screenshots, recent activity, top users

### 🔧 SCHEDULER CONTROL

#### ▶️ **Start Scheduler**
- **URL:** `POST {{base_url}}/api/scheduler/status/`
- **Body:** `{"action": "start"}`

#### ⏹️ **Stop Scheduler**
- **URL:** `POST {{base_url}}/api/scheduler/status/`
- **Body:** `{"action": "stop"}`

### 📊 PARAMETER OPTIONS

**For `/api/users/screenshots-count/`:**
- `limit=10` - Max users to return
- `sort_by=count` or `sort_by=email` - Sort field
- `order=desc` or `order=asc` - Sort direction  
- `min_count=1000` - Minimum screenshot count

**Examples:**
- Top 10: `?limit=10&sort_by=count&order=desc`
- Alphabetical: `?sort_by=email&order=asc`
- Heavy users: `?min_count=5000&sort_by=count&order=desc`

### 🎯 EXPECTED RESPONSES

**User Counts Response:**
```json
{
  "success": true,
  "total_users": 33,
  "total_screenshots": 1925635,
  "users": [
    {
      "email": "user@example.com",
      "screenshot_count": 125000,
      "last_screenshot": "2025-08-13T10:30:00",
      "projects": ["Project A", "Project B"]
    }
  ]
}
```

**Scheduler Status Response:**
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

### ❗ TROUBLESHOOTING

**Connection Failed:**
- Verify Django server is running on port 8010
- Check Postman environment variable: base_url = http://127.0.0.1:8010

**Empty Data:**
- Run: `python manage.py track_screenshots --update-now`
- Check S3 credentials in .env file

**404 Errors:**
- Verify API URLs are correct
- Make sure collection imported properly

### 🎉 YOU'RE READY!

Your Postman collection includes:
- ✅ 11 pre-configured API requests
- ✅ Automatic tests for response validation
- ✅ Environment variables for easy switching
- ✅ Complete parameter examples
- ✅ Scheduler control (start/stop)

**Import the collection and start testing your Screenshot APIs!** 🚀
