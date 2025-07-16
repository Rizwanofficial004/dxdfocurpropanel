# 🚀 DDS Focus Time - Complete API Endpoints Guide

## 📊 **Base URL**
```
http://localhost:8000
```

## 🔐 **Authentication Required**
Most endpoints require session-based authentication. Login first to get session cookies.

---

## 📋 **Complete API Endpoints List**

### **1. Authentication**
```
POST /api/auth/login/
```
**Body (JSON):**
```json
{
  "username": "admin@example.com",
  "password": "admin123"
}
```

---

### **2. Screenshots by User (Enhanced)**
```
GET /api/screenshots/user/
```

### **3. Screenshots by Date Range**
```
GET /api/screenshots/date-range/
```

### **4. Screenshots by Month (NEW!)**
```
GET /api/screenshots/monthly/
```

**Query Parameters:**
- `user` (required): Email, username, or name
- `month` (required): 'current', 'previous', or 'YYYY-MM'
- `limit` (optional): Number of results (default: 100)
- `page` (optional): Page number (default: 1)
- `status` (optional): Online, Idle, Offline
- `task_type` (optional): Task type filter

**Examples:**
```
# Current Month
GET /api/screenshots/monthly/?user=haseebcodejourney@gmail.com&month=current

# Previous Month  
GET /api/screenshots/monthly/?user=haseebcodejourney@gmail.com&month=previous

# Specific Month (June 2025)
GET /api/screenshots/monthly/?user=haseebcodejourney@gmail.com&month=2025-06
```

### **5. Screenshots by Date Range**
```
GET /api/screenshots/date-range/
```

**Query Parameters:**
- `user` (required): Email, username, or name
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `limit` (optional): Number of results (default: 50)
- `page` (optional): Page number (default: 1)
- `status` (optional): Online, Idle, Offline
- `task_type` (optional): Task type filter

**Examples:**
```
# One Week Range
GET /api/screenshots/date-range/?user=haseebcodejourney@gmail.com&start_date=2025-06-22&end_date=2025-06-28&limit=20

# Monthly Range
GET /api/screenshots/date-range/?user=Haseeb&start_date=2025-06-01&end_date=2025-06-30&limit=50

# Custom Range with Status Filter
GET /api/screenshots/date-range/?user=haseebcodejourney@gmail.com&start_date=2024-06-06&end_date=2025-01-01&status=Online&limit=100

# Recent 30 Days
GET /api/screenshots/date-range/?user=haseebcodejourney@gmail.com&start_date=2025-06-05&end_date=2025-07-05&limit=50
```

**Query Parameters:**
- `user` (required): Email, username, or name
- `date` (optional): YYYY-MM-DD format
- `limit` (optional): Number of results (default: 20)
- `page` (optional): Page number (default: 1)
- `status` (optional): Online, Idle, Offline
- `task_type` (optional): Task type filter

**Examples:**
```
# By Email
GET /api/screenshots/user/?user=haseebcodejourney@gmail.com&limit=5

# By Email with Date
GET /api/screenshots/user/?user=haseebcodejourney@gmail.com&date=2025-06-22&limit=3

# By Name
GET /api/screenshots/user/?user=Haseeb&limit=10

# By Name with Date
GET /api/screenshots/user/?user=Haseeb&date=2025-06-23&limit=5

# With Status Filter
GET /api/screenshots/user/?user=haseebcodejourney@gmail.com&status=Online&limit=5

# With Date and Status
GET /api/screenshots/user/?user=Haseeb&date=2025-06-22&status=Online&limit=3

# Partial Name Search
GET /api/screenshots/user/?user=Has&limit=5

# Full Name Search
GET /api/screenshots/user/?user=Haseeb Developer&limit=5
```

---

### **3. User Search & Suggestions**

#### **User Search**
```
GET /api/users/search/
```
**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results

**Examples:**
```
GET /api/users/search/?q=Haseeb&limit=10
GET /api/users/search/?q=haseeb@gmail.com&limit=5
```

#### **User Suggestions (Google-like)**
```
GET /api/users/suggestions/
```
**Query Parameters:**
- `q` (required): Search query for autocomplete
- `limit` (optional): Number of suggestions

**Examples:**
```
GET /api/users/suggestions/?q=Has&limit=5
GET /api/users/suggestions/?q=john&limit=10
```

---

### **4. General Screenshots**

#### **Get Screenshots**
```
GET /api/screenshots/
```
**Query Parameters:**
- `email` (optional): User email
- `date` (optional): Date filter
- `limit` (optional): Number of results
- `page` (optional): Page number

#### **Post Screenshots (Advanced)**
```
POST /api/screenshots/
```
**Body (JSON):**
```json
{
  "email": "user@example.com",
  "date": "2025-06-22",
  "limit": 10,
  "page": 1,
  "date_range": {
    "start": "2025-06-01",
    "end": "2025-06-30"
  },
  "task_filter": "development"
}
```

---

### **5. Logs Management**

#### **Get Logs**
```
GET /api/logs/
```
**Query Parameters:**
- `email` (optional): User email
- `date` (optional): Date filter
- `limit` (optional): Number of results
- `page` (optional): Page number

#### **Create Log**
```
POST /api/logs/
```
**Body (JSON):**
```json
{
  "staffid": 123,
  "email": "user@example.com",
  "jsonlog": {
    "activity": "screenshot_taken",
    "duration": 3600,
    "task": "Development work"
  },
  "date": "2025-07-05"
}
```

---

### **6. Dashboard Data**
```
GET /api/dashboard/user-data/
```
**Query Parameters:**
- `email` (optional): User email

---

### **7. Legacy Endpoints**
```
POST /api/update-log-info/
```

---

## 🧪 **Postman Collection Setup**

### **Collection Variables**
Create these variables in your Postman collection:
- `baseUrl`: `http://localhost:8000`
- `testEmail`: `haseebcodejourney@gmail.com`
- `testName`: `Haseeb`

### **Pre-request Script for Authentication**
```javascript
// Login and get session cookies
pm.sendRequest({
    url: pm.variables.get("baseUrl") + "/api/auth/login/",
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            username: "admin@example.com",
            password: "admin123"
        })
    }
}, function (err, response) {
    if (response.code === 200) {
        console.log("Login successful");
        // Session cookies will be automatically handled by Postman
    }
});
```

---

## 📅 **Date Format Examples**

All date parameters should use `YYYY-MM-DD` format:
- `2025-06-22` (June 22, 2025)
- `2025-06-23` (June 23, 2025)
- `2025-07-05` (July 5, 2025)

---

## 🎯 **Testing Scenarios**

### **Scenario 1: Basic User Search**
```
GET /api/screenshots/user/?user=haseebcodejourney@gmail.com&limit=5
```

### **Scenario 2: Date-Specific Search**
```
GET /api/screenshots/user/?user=Haseeb&date=2025-06-22&limit=10
```

### **Scenario 3: Name-Based Search**
```
GET /api/screenshots/user/?user=Haseeb Developer&limit=5
```

### **Scenario 4: Filtered Search**
```
GET /api/screenshots/user/?user=haseebcodejourney@gmail.com&date=2025-06-22&status=Online&limit=3
```

---

## 📊 **Response Format**

All APIs return standardized JSON responses:

```json
{
  "success": true,
  "message": "Screenshots retrieved successfully for Haseeb Developer",
  "data": {
    "user_info": {
      "username": "haseebcodejourney",
      "email": "haseebcodejourney@gmail.com",
      "display_name": "Haseeb Developer",
      "is_staff": false
    },
    "search_info": {
      "search_term": "haseebcodejourney@gmail.com",
      "search_method": "email",
      "found_by": "email"
    },
    "screenshots": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 100,
      "limit": 20,
      "has_next": true,
      "has_previous": false
    },
    "filters_applied": {
      "user": "haseebcodejourney@gmail.com",
      "date": "2025-06-22",
      "status": "",
      "limit": 20,
      "page": 1
    },
    "summary": {
      "total_screenshots": 45,
      "status_breakdown": {
        "online": 30,
        "idle": 10,
        "offline": 5
      },
      "date_range": {
        "earliest": "2025-06-01",
        "latest": "2025-06-30"
      }
    }
  },
  "timestamp": "2025-07-05T11:30:00Z"
}
```

---

## 🎉 **Key Features**

✅ **Multi-Method User Search**: Email, username, first name, last name, full name  
✅ **Date Filtering**: Specific date filtering with YYYY-MM-DD format  
✅ **Status Filtering**: Online, Idle, Offline status filters  
✅ **Pagination**: Built-in pagination for large datasets  
✅ **Case-Insensitive**: Flexible partial matching  
✅ **Multi-Model Search**: Searches both User and Staff models  
✅ **Search Metadata**: Response includes search method information  
✅ **Error Handling**: Comprehensive error responses  

---

## 🔗 **Quick Test URLs**

Copy and paste these URLs directly into Postman or your browser:

```
https://dxdtime.ddsolutions.io/api/screenshots/user/?user=haseebcodejourney@gmail.com&limit=3

https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Haseeb&limit=5

https://dxdtime.ddsolutions.io/api/screenshots/user/?user=haseebcodejourney@gmail.com&date=2025-06-22&limit=3

https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Haseeb&date=2025-06-23&limit=5

https://dxdtime.ddsolutions.io/api/screenshots/user/?user=haseebcodejourney@gmail.com&status=Online&limit=5

https://dxdtime.ddsolutions.io/api/users/suggestions/?q=Has&limit=5

https://dxdtime.ddsolutions.io/api/users/search/?q=Haseeb&limit=10
```
