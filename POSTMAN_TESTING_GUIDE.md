# 🚀 **S3 User Logs API - Postman Testing Guide**

## 📋 **Setup Instructions**

### 1. **Import the Collection**
1. Open Postman
2. Click **Import** 
3. Select the file: `S3_User_Logs_API_Postman_Collection.json`
4. The collection will appear in your Postman workspace

### 2. **Start Your Django Server**
Make sure your Django server is running:
```bash
cd C:\Users\USER\Desktop\GitHub-Projects\dxdfocurpropanel
python manage.py runserver 0.0.0.0:8000
```

### 3. **Environment Variable**
The collection uses a variable `{{base_url}}` set to `http://localhost:8000`

---

## 🧪 **Test Sequence**

### **Test 1: Basic Functionality**
```
GET {{base_url}}/api/user-logs/
```
**Expected Response:**
```json
{
    "status": "success",
    "message": "User logs retrieved successfully",
    "data": {
        "total_count": 12,
        "logs": [
            {
                "key": "users_logs/2025-09-11/nawaz_at_dxdglobal.com/...",
                "file_name": "session_complete_2025-09-11_15-19-30.json",
                "user_email": "nawaz@dxdglobal.com",
                "project_name": "_Island_Green_EYLÜL_2025_Genel_Grafik_Tasarım&İçerik_Üretimi",
                "date": "2025-09-11",
                "file_size": 2048,
                "download_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/..."
            }
        ]
    }
}
```

### **Test 2: User Filtering**
```
GET {{base_url}}/api/user-logs/?user_email=nawaz@dxdglobal.com
```
**Expected:** Only logs for nawaz@dxdglobal.com

### **Test 3: Date Filtering**
```
GET {{base_url}}/api/user-logs/?date_from=2025-09-10&date_to=2025-09-11
```
**Expected:** Only logs from September 10-11, 2025

### **Test 4: Limit Control**
```
GET {{base_url}}/api/user-logs/?limit=3
```
**Expected:** Maximum 3 logs returned

### **Test 5: Activity Summary**
```
GET {{base_url}}/api/user-activity-summary/?user_email=nawaz@dxdglobal.com
```
**Expected Response:**
```json
{
    "status": "success",
    "message": "User activity summary retrieved successfully",
    "data": {
        "activity_summary": {
            "user_email": "nawaz@dxdglobal.com",
            "total_logs": 5,
            "date_range": {
                "start_date": "2025-09-10",
                "end_date": "2025-09-11"
            },
            "projects": [...],
            "daily_activity": {...}
        }
    }
}
```

### **Test 6: Log Types**
```
GET {{base_url}}/api/log-types/
```
**Expected:** List of available log types

### **Test 7: Statistics**
```
GET {{base_url}}/api/user-logs-stats/
```
**Expected:** Overall system statistics

### **Test 8: File Content**
```
GET {{base_url}}/api/user-log-content/?log_key=users_logs/2025-09-10/nawaz_at_dxdglobal.com/DSSFocus_Pro_Admin_Panel_Task/session_complete_2025-09-10_10-13-36.json
```
**Expected:** Actual log file content

---

## 🔍 **What to Test**

### ✅ **Success Cases**
- [ ] All endpoints return 200 status
- [ ] Data structure matches expected format
- [ ] Filtering works correctly
- [ ] Pagination with limit parameter
- [ ] Download URLs are generated
- [ ] User email conversion works (@ ↔ _at_)

### ❌ **Error Cases**
- [ ] Invalid user email format
- [ ] Invalid date format
- [ ] Non-existent log key
- [ ] Invalid limit values

---

## 📊 **Expected Data from Your S3 Bucket**

Based on your S3 structure, you should see:

**Users:**
- `nawaz@dxdglobal.com` (5 logs)
- `haseebcodejourney@gmail.com` (1 log)
- `kiranaiza4@gmail.com` (1 log)

**Projects:**
- `DSSFocus_Pro_Admin_Panel_Task`
- `Research_work_on_N8N`
- `DDSFocusPro_v1.4`
- `_Island_Green_EYLÜL_2025_Genel_Grafik_Tasarım&İçerik_Üretimi`

**Date Range:**
- `2025-09-10` to `2025-09-11`

---

## 🚨 **Troubleshooting**

### **Connection Refused Error**
```bash
# Make sure Django server is running
python manage.py runserver 0.0.0.0:8000
```

### **500 Internal Server Error**
- Check Django console for error details
- Verify AWS credentials are configured
- Check logs in Django admin

### **Empty Results**
- Verify S3 bucket contains data
- Check AWS credentials
- Try without filters first

---

## 🎯 **Quick Test Commands**

### **Test All Endpoints Quickly:**
1. **Basic logs**: `GET /api/user-logs/`
2. **User filter**: `GET /api/user-logs/?user_email=nawaz@dxdglobal.com`
3. **Date filter**: `GET /api/user-logs/?date_from=2025-09-10`
4. **Activity**: `GET /api/user-activity-summary/?user_email=nawaz@dxdglobal.com`
5. **Types**: `GET /api/log-types/`
6. **Stats**: `GET /api/user-logs-stats/`

---

## ✅ **Success Criteria**

Your API is working correctly if:
- ✅ All endpoints return valid JSON responses
- ✅ User filtering returns correct subset
- ✅ Date filtering works properly
- ✅ File download URLs are generated
- ✅ Activity summaries contain meaningful data
- ✅ No 500 errors occur

**Happy Testing! 🚀**
