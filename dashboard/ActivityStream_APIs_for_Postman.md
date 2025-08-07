# ActivityStream Component - API Endpoints for Postman Testing

## Base URL Configuration
- **Primary Base URL**: `https://dxdtime.ddsolutions.io`
- **Local Development**: `localhost:8000` (for health checks)

---

## 1. Backend Health Check API

### Health Check Endpoint
```
GET /health
URL: http://localhost:8000/health
```
**Purpose**: Check if backend server is running  
**Timeout**: 2000ms  
**Headers**: 
- Content-Type: application/json
- Accept: application/json

### Fallback Health Check (S3 Suggestions)
```
GET https://dxdtime.ddsolutions.io/api/users/s3-suggestions/?q=test&limit=10
```
**Purpose**: Fallback health check using S3 suggestions endpoint  
**Timeout**: 10000ms

---

## 2. User Search & Suggestions API

### User Suggestions API
```
GET https://dxdtime.ddsolutions.io/api/users/s3-suggestions/
```
**Parameters**:
- `q` (required): Search query string
- `limit` (optional): Number of suggestions (default: 10)

**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/users/s3-suggestions/?q=admin&limit=10
GET https://dxdtime.ddsolutions.io/api/users/s3-suggestions/?q=haseeb&limit=5
GET https://dxdtime.ddsolutions.io/api/users/s3-suggestions/?q=john&limit=8
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "label": "John Doe (john@example.com)",
        "value": "john",
        "email": "john@example.com",
        "display_name": "John Doe",
        "username": "john",
        "screenshot_count": 150,
        "staff_id": "JDO001",
        "relevance_score": 95,
        "source": "s3_scan",
        "has_recent_activity": true
      }
    ],
    "metadata": {
      "search_term": "john",
      "total_found": 1
    }
  }
}
```

---

## 3. Screenshots Search API

### Main Screenshots Search Endpoint
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/
```

### Pattern 1: Quick Name Search
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search={searchTerm}&limit={limit}
```
**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&limit=20
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=haseeb&limit=50
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=john&limit=10
```

### Pattern 2: Name + Date Filter
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search={searchTerm}&date={YYYY-MM-DD}&limit={limit}
```
**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&date=2025-07-30&limit=20
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=haseeb&date=2025-07-31&limit=10
```

### Pattern 3: S3 Comprehensive Scan
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search={searchTerm}&scan_s3=true&limit=5000
```
**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&scan_s3=true&limit=5000
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=haseeb&scan_s3=true&limit=5000
```

### With Pagination (Pattern 1 & 2)
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search={searchTerm}&limit={limit}&offset={offset}
```
**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&limit=20&offset=0
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&limit=20&offset=20
GET https://dxdtime.ddsolutions.io/api/screenshots/search/?search=admin&limit=20&offset=40
```

**Response Structure**:
```json
{
  "success": true,
  "message": "Found 2 employees with 45 screenshots matching 'admin'",
  "data": {
    "search_pattern": "quick_name_search",
    "employees": [
      {
        "staff_id": "ADM001",
        "name": "Admin User",
        "email": "admin@dds.com",
        "total_screenshots": 25,
        "screenshots_shown": 20,
        "screenshots": [...]
      }
    ],
    "summary": {
      "total_employees_found": 2,
      "total_screenshots": 45,
      "search_query": "admin",
      "limit_per_employee": 20
    }
  }
}
```

---

## 4. Employee Folders API

### Get Employee Folders
```
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/{employeeEmail}/folders/
```
**Path Parameters**:
- `employeeEmail`: Employee's email address (URL encoded)

**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/admin%40dds.com/folders/
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/haseeb%40example.com/folders/
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/john.doe%40company.com/folders/
```

**Response Structure**:
```json
{
  "success": true,
  "message": "Found 5 task folders for admin@dds.com",
  "data": {
    "employee_email": "admin@dds.com",
    "task_folders": [
      {
        "folder_name": "2025-07-30",
        "screenshot_count": 150,
        "folder_size_mb": 45.2,
        "last_modified": "2025-07-30T15:30:00Z",
        "is_date_folder": true
      }
    ],
    "summary": {
      "total_folders": 5,
      "total_screenshots": 500,
      "total_size_mb": 150.8
    }
  }
}
```

---

## 5. Folder Screenshots API

### Enhanced Folder Screenshots (Recommended)
```
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/{employeeEmail}/folder/{folderName}/enhanced/
```
**Path Parameters**:
- `employeeEmail`: Employee's email (URL encoded)
- `folderName`: Folder name (URL encoded)

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Screenshots per page (default: 20, max varies by folder size)

**Example URLs**:
```
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/admin%40dds.com/folder/2025-07-30/enhanced/?page=1&limit=20
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/haseeb%40example.com/folder/project_screenshots/enhanced/?page=1&limit=50
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/john%40company.com/folder/daily_work/enhanced/?page=2&limit=30
```

**Response Structure**:
```json
{
  "success": true,
  "message": "Found 150 screenshots in 2025-07-30 for admin@dds.com",
  "data": {
    "folder_info": {
      "folder_name": "2025-07-30",
      "employee_name": "Admin User",
      "employee_email": "admin@dds.com",
      "is_date_folder": true,
      "folder_date": "2025-07-30"
    },
    "screenshots": [
      {
        "filename": "screenshot_001.png",
        "url": "https://ddsfocustime.s3.amazonaws.com/...",
        "timestamp": "2025-07-30T09:15:00Z",
        "size_kb": 245
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 8,
      "total_screenshots": 150,
      "limit": 20,
      "has_next": true,
      "has_previous": false
    },
    "performance": {
      "total_processing_time_ms": 1205.3,
      "method_used": "enhanced_s3_optimized",
      "cache_enabled": true
    }
  }
}
```

### Regular Folder Screenshots
```
GET https://dxdtime.ddsolutions.io/api/screenshots/employee/{employeeEmail}/folder/{folderName}/
```
**Same parameters as enhanced version but without performance optimizations**

---

## 6. Presigned URL API (Dynamic)

### Get Presigned S3 URL
```
GET localhost:8000/api/screenshots/presigned-url/{s3_path}
```
**Path Parameters**:
- `s3_path`: S3 object path (URL encoded)

**Example URLs**:
```
GET localhost:8000/api/screenshots/presigned-url/logs/admin_at_dds.com/2025-07-30/screenshot_001.png
GET localhost:8000/api/screenshots/presigned-url/screenshots/user123/daily/image_001.jpg
```

**Response Structure**:
```json
{
  "success": true,
  "presigned_url": "https://ddsfocustime.s3.amazonaws.com/logs/admin_at_dds.com/2025-07-30/screenshot_001.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=...",
  "expires_in": 3600
}
```

---

## Testing Configuration for Postman

### Headers (Add to all requests)
```
Content-Type: application/json
Accept: application/json
User-Agent: PostmanRuntime/7.32.0
```

### Timeout Settings
- **User Suggestions**: 8 seconds
- **Screenshots Search**: 30 seconds  
- **Employee Folders**: 15 seconds
- **Folder Screenshots**: 10-15 minutes (for large folders)
- **Health Check**: 2-10 seconds

### Environment Variables (Postman)
```
base_url = https://dxdtime.ddsolutions.io
local_url = http://localhost:8000
test_email = admin@dds.com
test_email_encoded = admin%40dds.com
test_search_term = admin
test_folder = 2025-07-30
```

### Sample Test Collection Structure

#### Collection: ActivityStream APIs
1. **Health Checks**
   - GET {{local_url}}/health
   - GET {{base_url}}/api/users/s3-suggestions/?q=test&limit=10

2. **User Suggestions**
   - GET {{base_url}}/api/users/s3-suggestions/?q={{test_search_term}}&limit=10
   - GET {{base_url}}/api/users/s3-suggestions/?q=haseeb&limit=5
   - GET {{base_url}}/api/users/s3-suggestions/?q=john&limit=8

3. **Screenshots Search**
   - GET {{base_url}}/api/screenshots/search/?search={{test_search_term}}&limit=20
   - GET {{base_url}}/api/screenshots/search/?search={{test_search_term}}&date=2025-07-30&limit=10
   - GET {{base_url}}/api/screenshots/search/?search={{test_search_term}}&scan_s3=true&limit=5000

4. **Employee Folders**
   - GET {{base_url}}/api/screenshots/employee/{{test_email_encoded}}/folders/

5. **Folder Screenshots**
   - GET {{base_url}}/api/screenshots/employee/{{test_email_encoded}}/folder/{{test_folder}}/enhanced/?page=1&limit=20
   - GET {{base_url}}/api/screenshots/employee/{{test_email_encoded}}/folder/{{test_folder}}/enhanced/?page=2&limit=50

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "timestamp": "2025-07-31T00:00:00Z"
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (missing parameters)
- **404**: Not Found (endpoint or resource not found)
- **500**: Internal Server Error
- **503**: Service Unavailable (backend offline)

This comprehensive list covers all APIs used in the ActivityStream component with proper examples and structures for Postman testing.
