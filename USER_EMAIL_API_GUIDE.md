# 📧 User Email API Endpoints Guide

## 🚀 **User-Specific API Endpoints**

### **Screenshots by User Email**
```
GET /api/users/{email}/screenshots/
```

**Examples:**
```
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?limit=10&page=1
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?date=2025-01-15
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?date=2025-01-15&limit=5
```

### **Logs by User Email**
```
GET /api/users/{email}/logs/
```

**Examples:**
```
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?limit=10&page=1
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?search=activity
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?date=2025-01-15&search=login
```

## 🧪 **PowerShell Testing Commands**

### **Test User Screenshots:**
```powershell
# Basic user screenshots
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/" -b cookies.txt

# With pagination
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?limit=5&page=1" -b cookies.txt

# With date filter
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?date=2025-01-15" -b cookies.txt
```

### **Test User Logs:**
```powershell
# Basic user logs
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/" -b cookies.txt

# With search
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?search=activity" -b cookies.txt

# With date filter
curl -X GET "https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?date=2025-01-15" -b cookies.txt
```

## 📋 **All Available API Endpoints**

| Endpoint | Method | Description | User Email Support |
|----------|--------|-------------|-------------------|
| `/api/test/` | GET | Test endpoint | ❌ |
| `/api/auth/login/` | POST | User login | ❌ |
| `/api/screenshots/` | GET/POST | All screenshots | ✅ Via ?email= parameter |
| `/api/logs/` | GET/POST | All logs | ✅ Via ?email= parameter |
| `/api/users/{email}/screenshots/` | GET | User screenshots | ✅ Built-in |
| `/api/users/{email}/logs/` | GET | User logs | ✅ Built-in |
| `/api/update-log-info/` | POST | Legacy logs | ❌ |

## 🔧 **Query Parameters**

### **Screenshots Parameters:**
- `limit` - Number of results (1-100, default: 20)
- `page` - Page number (default: 1)
- `date` - Date filter (YYYY-MM-DD format)

### **Logs Parameters:**
- `limit` - Number of results (1-100, default: 20)
- `page` - Page number (default: 1)
- `date` - Date filter (YYYY-MM-DD format)
- `search` - Search in log content

## 🎯 **Quick Test URLs (Copy & Paste)**

**Replace `admin@example.com` with actual user email:**

```
# User Screenshots
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/
https://dxdtime.ddsolutions.io/api/users/admin@example.com/screenshots/?limit=5
https://dxdtime.ddsolutions.io/api/users/john.doe@company.com/screenshots/?date=2025-01-15

# User Logs  
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/
https://dxdtime.ddsolutions.io/api/users/admin@example.com/logs/?search=login
https://dxdtime.ddsolutions.io/api/users/jane.smith@company.com/logs/?date=2025-01-15&limit=10
```

## 📝 **Example Response Format**

```json
{
  "success": true,
  "message": "Screenshots retrieved successfully for admin@example.com",
  "data": {
    "screenshots": [
      {
        "url": "/media/screenshots/admin_at_example.com/task1/screenshot1.jpg",
        "folder": "admin_at_example.com/task1",
        "timestamp": "2025-01-15T10:30:00Z",
        "presigned_url": "https://ddsfocustime.s3.amazonaws.com/..."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 45,
      "limit": 20,
      "has_next": true,
      "has_previous": false
    },
    "user_email": "admin@example.com",
    "date_filter": "",
    "filters_applied": {
      "email": "admin@example.com",
      "date": "",
      "limit": 20,
      "page": 1
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🔒 **Security Notes**

- **Authentication Required:** All endpoints require login
- **Permission Control:** Users can only access their own data unless they're staff
- **Email Validation:** Email format is validated
- **Rate Limiting:** Consider implementing for production

## 🧪 **Testing Steps**

1. **Start Django server:**
   ```bash
   python manage.py runserver
   ```

2. **Test with PowerShell script:**
   ```bash
   .\quick_test.ps1
   ```

3. **Test comprehensive script:**
   ```bash
   python test_all_apis.py
   ```

4. **Test in browser (GET endpoints only):**
   - Open: `api_status.html`
   - Or paste URLs directly in browser

5. **Test with Postman:**
   - Import: `DDS_Focus_Time_APIs.postman_collection.json`
