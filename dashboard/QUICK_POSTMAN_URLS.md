# 🚀 Quick Postman URLs - Ready to Copy & Paste

## ✅ **WORKING URLs** (Test These First)

### 1. Health Check API
```
GET http://localhost:8000/api/test/
```

### 2. Employee Folders API
```
GET http://localhost:8000/api/screenshots/employee/admin@example.com/folders/
```

### 3. Employee Folders API (Real Email)
```
GET http://localhost:8000/api/screenshots/employee/haseeb@deluxebilisim.com/folders/
```

### 4. Presigned URL API (FIXED!)
```
GET http://localhost:8000/api/screenshots/presigned-url/test_screenshot.jpg
```

### 5. Presigned URL API (Real Path)
```
GET http://localhost:8000/api/screenshots/presigned-url/screenshots/haseeb@deluxebilisim.com/task_folder/screenshot.jpg
```

---

## ⚠️ **URLs WITH ERRORS** (Need Data to Work)

### 6. S3 Suggestions API
```
GET http://localhost:8000/api/users/s3-suggestions/?q=admin&limit=10
```

### 7. S3 Suggestions API (Different Query)
```
GET http://localhost:8000/api/users/s3-suggestions/?q=haseeb&limit=5
```

### 8. Screenshots Search API
```
GET http://localhost:8000/api/screenshots/search/?search=test&limit=20
```

### 9. Screenshots Search API (Real Terms)
```
GET http://localhost:8000/api/screenshots/search/?search=haseeb&limit=10
```

---

## 🔍 **ADDITIONAL APIs TO EXPLORE**

### 10. Enhanced Employees API (Your Original CORS Issue)
```
GET http://localhost:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed
```

### 11. Dashboard Data API
```
GET http://localhost:8000/api/dashboard/data/
```

### 12. User Suggestions API
```
GET http://localhost:8000/api/users/suggestions/?q=admin&limit=10
```

### 13. Live Tracking API
```
GET http://localhost:8000/api/live-tracking/
```

### 14. Projects API
```
GET http://localhost:8000/api/projects/
```

### 15. Dashboard Analytics Summary
```
GET http://localhost:8000/api/dashboard/analytics/summary/
```

---

## 🔐 **AUTHENTICATION APIs**

### 16. Login API (POST)
```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

Body:
{
    "username": "admin",
    "password": "password"
}
```

### 17. Session Status API
```
GET http://localhost:8000/api/auth/session/
```

### 18. Logout API (POST)
```
POST http://localhost:8000/api/auth/logout/
```

---

## 📋 **Copy-Paste for Postman**

**Just copy any URL above and paste directly into Postman's address bar!**

### Quick Setup Steps:
1. Open Postman
2. Create new request
3. Copy any URL from above
4. Paste into address bar
5. Set method (GET/POST)
6. Click Send!

### For POST requests:
1. Set method to POST
2. Go to Body tab
3. Select "raw" and "JSON"
4. Paste the JSON body

---

## 🎯 **Priority Testing Order**

**Test in this order for best results:**

1. ✅ `http://localhost:8000/api/test/`
2. ✅ `http://localhost:8000/api/screenshots/employee/admin@example.com/folders/`
3. ✅ `http://localhost:8000/api/screenshots/presigned-url/test_screenshot.jpg`
4. 🔍 `http://localhost:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed`
5. 🔍 `http://localhost:8000/api/dashboard/data/`

**Happy Testing! 🚀**
