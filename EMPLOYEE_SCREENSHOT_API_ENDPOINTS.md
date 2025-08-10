# Employee Screenshot Search API Endpoints

## 🚀 NEW Comprehensive Employee Screenshot Search APIs

These APIs allow you to search and retrieve all screenshots for employees from S3 with advanced filtering, pagination, and task folder management.

---

## 📋 API Endpoints Summary

### 1. **Employee Screenshots Search API**
```
GET /api/employees/screenshots/search/
```

**Description**: Search all screenshots for employees with advanced filtering and pagination

**Query Parameters**:
- `email` (optional): Employee email - if not provided, returns all employees overview
- `task_folder` (optional): Specific task folder name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 200)
- `date_from` (optional): Filter screenshots from date (YYYY-MM-DD)
- `date_to` (optional): Filter screenshots to date (YYYY-MM-DD)
- `continuation_token` (optional): S3 continuation token for true pagination

**Example URLs**:
```bash
# Get all employees overview
GET http://localhost:8000/api/employees/screenshots/search/

# Get specific employee screenshots
GET http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com

# Search by task folder
GET http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com&task_folder=Create_UI_for_YouTube_AI_Automation_

# Date range filter
GET http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com&date_from=2025-07-01&date_to=2025-08-01

# Pagination
GET http://localhost:8000/api/employees/screenshots/search/?page=2&limit=10
```

---

### 2. **Employee Task Folders API**
```
GET /api/employees/task-folders/
```

**Description**: Get all task folders for all employees or a specific employee

**Query Parameters**:
- `email` (optional): Employee email - if not provided, returns all employees' task folders

**Example URLs**:
```bash
# Get all employees task folders
GET http://localhost:8000/api/employees/task-folders/

# Get specific employee task folders
GET http://localhost:8000/api/employees/task-folders/?email=haseebcodejourney@gmail.com
```

---

## 📊 Response Examples

### All Employees Overview Response
```json
{
  "success": true,
  "message": "All employees screenshots overview retrieved",
  "data": {
    "employees": [
      {
        "employee": {
          "email": "haseebcodejourney@gmail.com",
          "name": "Haseebcodejourney User",
          "staff_id": "S3_HASEEBCODEJOURNEY"
        },
        "screenshot_count": 150,
        "recent_screenshots": [
          {
            "key": "screenshots/haseebcodejourney@gmail.com/task1/screenshot1.jpg",
            "filename": "screenshot1.jpg",
            "task_folder": "task1",
            "url": "https://presigned-url...",
            "last_modified": "2025-08-01T10:30:00",
            "size": 245760,
            "size_mb": 0.23
          }
        ],
        "has_more": true
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 7,
      "total_employees": 31,
      "employees_per_page": 5,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

### Specific Employee Screenshots Response
```json
{
  "success": true,
  "message": "Screenshots retrieved for haseebcodejourney@gmail.com",
  "data": {
    "employee": {
      "email": "haseebcodejourney@gmail.com",
      "name": "Haseebcodejourney User",
      "staff_id": "S3_HASEEBCODEJOURNEY"
    },
    "screenshots": [
      {
        "key": "screenshots/haseebcodejourney@gmail.com/Create_UI_for_YouTube_AI_Automation_/2025-08-01_10-30-15.jpg",
        "filename": "2025-08-01_10-30-15.jpg",
        "task_folder": "Create_UI_for_YouTube_AI_Automation_",
        "url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/...",
        "last_modified": "2025-08-01T10:30:15.000Z",
        "size": 245760,
        "size_mb": 0.23
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_screenshots": 50,
      "screenshots_per_page": 10,
      "has_next": true,
      "continuation_token": "...",
      "task_folder": "Create_UI_for_YouTube_AI_Automation_"
    },
    "filters": {
      "date_from": "2025-07-01",
      "date_to": "2025-08-01",
      "task_folder": "Create_UI_for_YouTube_AI_Automation_"
    }
  }
}
```

### Task Folders Response
```json
{
  "success": true,
  "message": "Task folders retrieved for haseebcodejourney@gmail.com",
  "data": {
    "employee": {
      "email": "haseebcodejourney@gmail.com",
      "name": "Haseebcodejourney User",
      "staff_id": "S3_HASEEBCODEJOURNEY"
    },
    "task_folders": [
      {
        "folder_name": "Create_UI_for_YouTube_AI_Automation_",
        "folder_path": "screenshots/haseebcodejourney@gmail.com/Create_UI_for_YouTube_AI_Automation_/",
        "screenshot_count": 45,
        "total_size_mb": 12.5
      },
      {
        "folder_name": "Another_Task_Folder",
        "folder_path": "screenshots/haseebcodejourney@gmail.com/Another_Task_Folder/",
        "screenshot_count": 23,
        "total_size_mb": 8.2
      }
    ],
    "total_folders": 2
  }
}
```

---

## 🔧 Usage Examples with curl

### 1. Get All Employees Overview
```bash
curl -X GET "http://localhost:8000/api/employees/screenshots/search/" \
  -H "Content-Type: application/json"
```

### 2. Get Specific Employee Screenshots
```bash
curl -X GET "http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com&limit=10" \
  -H "Content-Type: application/json"
```

### 3. Search by Task Folder
```bash
curl -X GET "http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com&task_folder=Create_UI_for_YouTube_AI_Automation_" \
  -H "Content-Type: application/json"
```

### 4. Date Range Search
```bash
curl -X GET "http://localhost:8000/api/employees/screenshots/search/?email=haseebcodejourney@gmail.com&date_from=2025-07-01&date_to=2025-08-01" \
  -H "Content-Type: application/json"
```

### 5. Get Employee Task Folders
```bash
curl -X GET "http://localhost:8000/api/employees/task-folders/?email=haseebcodejourney@gmail.com" \
  -H "Content-Type: application/json"
```

---

## 🌐 Available Employees (from S3 data)

Based on your current S3 data, here are some employee emails you can test with:

- `haseebcodejourney@gmail.com`
- `deniz@deluxebilisim.com`
- `nawaz@dxdglobal.com`
- `danish.ali9801@gmail.com`
- `fatih.onk@deluxebilisim.com`
- `m.balkilic@deluxebilisim.com`
- `cagla.shr@gmail.com`
- `eliff.ugrl@gmail.com`
- `ilahe.avci2004@gmail.com`
- `mahboub.sad@gmail.com`

---

## 🚀 Test the APIs

Run the comprehensive test script:
```bash
python test_employee_screenshot_search.py
```

This will test all endpoints with various scenarios and show you exactly how to use each API.

---

## 📝 Key Features

✅ **Real S3 Data**: Uses actual employee data from your S3 bucket
✅ **Advanced Pagination**: Both Django and S3 native pagination
✅ **Task Folder Search**: Search within specific task folders
✅ **Date Filtering**: Filter screenshots by date range
✅ **Presigned URLs**: Secure S3 access with temporary URLs
✅ **Error Handling**: Comprehensive error responses
✅ **Performance Optimized**: Efficient S3 queries with proper indexing
✅ **Flexible Search**: Search all employees or specific employee
✅ **Real-time Data**: No caching, always fresh from S3
