# 📬 Postman API Testing Guide

## 🚀 Quick Setup

### 1. Import Collection
- Download: `Django_API_Postman_Collection.json`
- Open Postman → Import → Select the JSON file
- Collection will appear in your Postman workspace

### 2. Set Environment Variables (Optional)
- `base_url`: `http://localhost:8000`
- `employee_email`: `admin@example.com`

---

## ✅ **WORKING APIs** (Ready to Test)

### 🔧 Basic Health Check
```
GET http://localhost:8000/api/test/
```
**Status**: ✅ Working  
**Description**: API health check and endpoint discovery

### 👥 Employee Folders
```
GET http://localhost:8000/api/screenshots/employee/admin@example.com/folders/
GET http://localhost:8000/api/screenshots/employee/haseeb@deluxebilisim.com/folders/
```
**Status**: ✅ Working  
**Description**: Get employee task folders

### 🔗 Presigned URLs (FIXED!)
```
GET http://localhost:8000/api/screenshots/presigned-url/test_screenshot.jpg
GET http://localhost:8000/api/screenshots/presigned-url/screenshots/user@domain.com/task/file.jpg
```
**Status**: ✅ Working  
**Description**: Generate secure S3 access URLs

---

## ⚠️ **APIs with Errors** (Need Data)

### 🔍 S3 User Suggestions
```
GET http://localhost:8000/api/users/s3-suggestions/?q=admin&limit=10
GET http://localhost:8000/api/users/s3-suggestions/?q=haseeb&limit=5
```
**Status**: ⚠️ Returns error (needs S3 data)

### 📸 Screenshot Search
```
GET http://localhost:8000/api/screenshots/search/?search=test&limit=20
GET http://localhost:8000/api/screenshots/search/?search=haseeb&limit=10
```
**Status**: ⚠️ Returns error (needs screenshot data)

---

## 🔍 **Additional Available APIs**

### 📊 Dashboard & Analytics
```
GET http://localhost:8000/api/dashboard/data/
GET http://localhost:8000/api/dashboard/analytics/summary/
GET http://localhost:8000/api/dashboard/employees/enhanced/?include_profiles=true&format=detailed
```

### 👥 User Management
```
GET http://localhost:8000/api/users/suggestions/?q=admin&limit=10
```

### 📱 Live Tracking
```
GET http://localhost:8000/api/live-tracking/
```

### 📋 Projects
```
GET http://localhost:8000/api/projects/
```

---

## 🔐 **Authentication APIs**

### Login
```
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}
```

### Session Status
```
GET http://localhost:8000/api/auth/session/
```

### Logout
```
POST http://localhost:8000/api/auth/logout/
```

---

## 🎯 **Testing Priority**

### **Start Here** (Guaranteed to Work):
1. ✅ `GET /api/test/` - Basic health check
2. ✅ `GET /api/screenshots/employee/{email}/folders/` - Employee folders
3. ✅ `GET /api/screenshots/presigned-url/{s3_path}` - Presigned URLs

### **Test These** (May work with data):
4. `GET /api/dashboard/employees/enhanced/` - Enhanced employees
5. `GET /api/dashboard/data/` - Dashboard data
6. `GET /api/projects/` - Projects data

### **Debug These** (Need investigation):
7. `GET /api/users/s3-suggestions/` - S3 suggestions
8. `GET /api/screenshots/search/` - Screenshot search

---

## 📝 **Postman Collection Features**

### ✨ What's Included:
- **25+ API endpoints** organized by status
- **Environment variables** for easy URL management
- **Multiple test variants** for different scenarios
- **Detailed descriptions** for each endpoint
- **Working examples** with real data

### 📁 Collection Structure:
- **✅ Working APIs** - Confirmed working endpoints
- **⚠️ APIs with Errors** - Endpoints that need data/fixes
- **🔍 Additional Available APIs** - Discovered from URL patterns
- **🔐 Authentication APIs** - Login/session management

---

## 🔧 **Quick Test Commands**

### Test Working APIs (Copy & Paste):
```bash
# Health Check
curl "http://localhost:8000/api/test/"

# Employee Folders
curl "http://localhost:8000/api/screenshots/employee/admin%40example.com/folders/"

# Presigned URL
curl "http://localhost:8000/api/screenshots/presigned-url/test_screenshot.jpg"
```

---

## 🎉 **Success Indicators**

### ✅ Good Response:
- Status: `200 OK`
- JSON with `"success": true`
- Contains actual data

### ⚠️ Error Response:
- Status: `200 OK` or `500 Error`
- JSON with `"success": false`
- Error message explaining issue

### ❌ Not Found:
- Status: `404 Not Found`
- HTML error page (not JSON)

---

**Happy Testing! 🚀**
