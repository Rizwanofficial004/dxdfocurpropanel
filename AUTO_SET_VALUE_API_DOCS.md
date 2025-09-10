# Enhanced Auto Set Value API Documentation

## API Endpoint
**URL:** `https://dxdtime.ddsolutions.io/api/auto-set-value/`  
**Method:** `POST`  
**Authentication:** Not required  
**Content-Type:** `application/json`

---

## ✨ **New Features in Version 2.0.0**

### 🚀 **Enhanced Validation**
- Support for both positive and negative values
- Decimal value support (converted to integer)
- Range validation (-2,147,483,648 to 2,147,483,647)
- User status validation (active/inactive)
- Description length validation (max 200 characters)

### 📊 **Bulk Operations**
- Set values for multiple users in a single request
- Transaction safety for bulk operations
- Detailed error reporting per item
- Limit of 100 items per bulk request

### 🔍 **Enhanced Logging & Monitoring**
- Detailed request logging with IP tracking
- Debug information for troubleshooting
- Operation history tracking
- Performance monitoring

### 📈 **Improved Response Data**
- Previous value tracking
- Enhanced user information
- Metadata support
- Timestamp standardization (ISO format)

---

## 📝 **Request Format**

### **Single User Operation**
```json
{
  "user_id": 123,
  "value": 50,
  "description": "Monthly target score",
  "metadata": {
    "source": "frontend_dashboard",
    "category": "performance_metric"
  }
}
```

### **Bulk Operation (Multiple Users)**
```json
[
  {
    "user_id": 123,
    "value": 50,
    "description": "Q4 Target"
  },
  {
    "user_id": 456,
    "value": -10,
    "description": "Penalty points"
  },
  {
    "user_id": 789,
    "value": 75.5,
    "description": "Performance score (will be converted to 75)"
  }
]
```

---

## 📊 **Request Parameters**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `user_id` | integer | ✅ | User ID (must be positive) | `123` |
| `value` | number | ✅ | Numeric value (int/float, supports negative) | `50`, `-10`, `75.5` |
| `description` | string | ❌ | Description (max 200 chars) | `"Monthly target"` |
| `metadata` | object | ❌ | Additional data for tracking | `{"source": "app"}` |

---

## ✅ **Response Format**

### **Successful Single Operation**
```json
{
  "status": "success",
  "message": "Value updated successfully for john_doe",
  "data": {
    "id": 456,
    "user_id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "value": 50,
    "previous_value": 30,
    "description": "Monthly target score",
    "last_updated": "2025-09-10T15:30:45.123456Z",
    "created_at": "2025-09-01T10:15:30.789012Z",
    "auto_token": "abc123def456ghi789",
    "token_created": false,
    "metadata": {
      "source": "frontend_dashboard",
      "category": "performance_metric"
    },
    "user_status": {
      "is_active": true,
      "date_joined": "2025-08-15T09:00:00Z",
      "last_login": "2025-09-10T14:45:20Z"
    }
  },
  "metadata": {
    "action": "updated",
    "timestamp": "2025-09-10T15:30:45.123456Z",
    "api_version": "2.0.0"
  }
}
```

### **Successful Bulk Operation**
```json
{
  "status": "completed",
  "message": "Bulk operation completed: 2 successful, 1 errors",
  "summary": {
    "total_items": 3,
    "successful": 2,
    "errors": 1
  },
  "results": [
    {
      "index": 0,
      "status": "success",
      "action": "updated",
      "data": {
        "user_id": 123,
        "username": "john_doe",
        "value": 50,
        "previous_value": 30
      }
    },
    {
      "index": 2,
      "status": "success",
      "action": "created",
      "data": {
        "user_id": 789,
        "username": "jane_smith",
        "value": 75,
        "previous_value": null
      }
    }
  ],
  "errors": [
    {
      "index": 1,
      "data": {
        "user_id": 999,
        "value": 25
      },
      "error": "User with ID 999 not found",
      "error_code": "USER_NOT_FOUND"
    }
  ],
  "timestamp": "2025-09-10T15:30:45.123456Z"
}
```

---

## ❌ **Error Responses**

### **Validation Errors**
```json
{
  "status": "error",
  "message": "user_id is required and cannot be empty",
  "error_code": "MISSING_USER_ID",
  "timestamp": "2025-09-10T15:30:45.123456Z"
}
```

### **Common Error Codes**
| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `MISSING_USER_ID` | user_id is required | 400 |
| `INVALID_USER_ID` | user_id must be positive integer | 400 |
| `INVALID_USER_ID_FORMAT` | user_id must be valid integer | 400 |
| `MISSING_VALUE` | value is required | 400 |
| `INVALID_VALUE_FORMAT` | value must be valid number | 400 |
| `VALUE_OUT_OF_RANGE` | value exceeds allowed range | 400 |
| `DESCRIPTION_TOO_LONG` | description max 200 characters | 400 |
| `USER_NOT_FOUND` | User does not exist | 404 |
| `USER_INACTIVE` | User account is inactive | 403 |
| `BULK_LIMIT_EXCEEDED` | Bulk operations max 100 items | 400 |
| `VALIDATION_ERROR` | General validation error | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

---

## 🔧 **Testing Examples**

### **PowerShell Examples**

#### Single User Update
```powershell
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    user_id = 123
    value = 50
    description = "Updated target score"
    metadata = @{
        source = "powershell_test"
        timestamp = (Get-Date).ToString("o")
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://dxdtime.ddsolutions.io/api/auto-set-value/" `
    -Method POST -Body $body -Headers $headers
```

#### Bulk Update
```powershell
$headers = @{ "Content-Type" = "application/json" }
$body = @(
    @{ user_id = 123; value = 50; description = "User 1" },
    @{ user_id = 456; value = 75; description = "User 2" },
    @{ user_id = 789; value = -25; description = "User 3 penalty" }
) | ConvertTo-Json

Invoke-RestMethod -Uri "https://dxdtime.ddsolutions.io/api/auto-set-value/" `
    -Method POST -Body $body -Headers $headers
```

### **JavaScript/Frontend Examples**

#### Single User Update
```javascript
const response = await fetch('https://dxdtime.ddsolutions.io/api/auto-set-value/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        user_id: 123,
        value: 50,
        description: "Updated from frontend",
        metadata: {
            source: "react_dashboard",
            component: "user_settings",
            timestamp: new Date().toISOString()
        }
    })
});

const result = await response.json();
console.log('Result:', result);
```

#### Bulk Update with Error Handling
```javascript
const bulkData = [
    { user_id: 123, value: 50, description: "User 1" },
    { user_id: 456, value: 75, description: "User 2" },
    { user_id: 789, value: -10, description: "User 3" }
];

try {
    const response = await fetch('https://dxdtime.ddsolutions.io/api/auto-set-value/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
    });
    
    const result = await response.json();
    
    if (result.status === 'completed') {
        console.log(`✅ ${result.summary.successful} users updated successfully`);
        if (result.summary.errors > 0) {
            console.log(`⚠️ ${result.summary.errors} errors occurred:`, result.errors);
        }
    }
} catch (error) {
    console.error('API call failed:', error);
}
```

### **cURL Examples**

#### Single User
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auto-set-value/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "value": 50,
    "description": "Updated via cURL",
    "metadata": {
      "source": "curl_test",
      "environment": "production"
    }
  }'
```

#### Bulk Operation
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auto-set-value/ \
  -H "Content-Type: application/json" \
  -d '[
    {"user_id": 123, "value": 50, "description": "User 1"},
    {"user_id": 456, "value": 75, "description": "User 2"},
    {"user_id": 789, "value": -25, "description": "User 3"}
  ]'
```

---

## 🎯 **Best Practices**

### **For Frontend Integration**
1. **Always handle errors gracefully**
   ```javascript
   if (response.status === 'error') {
       showErrorMessage(response.message, response.error_code);
   }
   ```

2. **Use bulk operations for multiple users**
   - More efficient than multiple single requests
   - Better transaction safety
   - Detailed error reporting per user

3. **Include metadata for tracking**
   ```javascript
   metadata: {
       source: "user_dashboard",
       feature: "bulk_update",
       user_action: "save_button_click",
       timestamp: new Date().toISOString()
   }
   ```

### **Value Validation**
- **Supported formats:** `50`, `"50"`, `75.5`, `"-10"`
- **Range:** -2,147,483,648 to 2,147,483,647
- **Decimals:** Automatically converted to integers (75.5 → 75)

### **Error Handling Strategy**
1. Check `status` field first
2. Use `error_code` for programmatic handling
3. Display `message` to users
4. Log `timestamp` and `debug_message` for troubleshooting

---

## 🔐 **Security Features**

- **No authentication required** - API is designed for easy integration
- **Input validation** - All inputs are sanitized and validated
- **SQL injection protection** - Django ORM provides built-in protection
- **Rate limiting ready** - Can be easily added via middleware
- **IP logging** - All requests are logged with source IP for monitoring

---

## 📈 **Performance & Monitoring**

### **Response Times**
- **Single operation:** ~50-100ms
- **Bulk operations (10 users):** ~200-300ms
- **Bulk operations (100 users):** ~1-2 seconds

### **Logging Levels**
- **INFO:** Successful operations, IP addresses
- **DEBUG:** Full request/response data
- **WARNING:** Validation errors
- **ERROR:** System errors with stack traces

### **Monitoring Endpoints**
- Health check: `GET /health/`
- API status: `GET /api/status/`
- Performance metrics: Available in server logs

---

## 🚀 **Migration from V1 to V2**

### **Backward Compatibility**
✅ **All V1 requests will continue to work**

### **New Features Available**
- Enhanced error messages with error codes
- Bulk operations support
- Metadata tracking
- Improved response format
- Better logging and monitoring

### **Recommended Updates**
1. Start using error codes for better error handling
2. Implement bulk operations for efficiency
3. Add metadata for better tracking
4. Update frontend to handle new response format

---

## 📞 **Support & Troubleshooting**

### **Common Issues**
1. **"User not found" errors**
   - Verify user_id exists in database
   - Check if user is active

2. **"Value out of range" errors**
   - Ensure values are within integer range
   - Consider using smaller numbers

3. **Bulk operation timeouts**
   - Reduce batch size (recommended: 50 users per request)
   - Implement retry logic for failed items

### **Debug Information**
- Set logging level to DEBUG for detailed request/response data
- Check server logs for IP addresses and timestamps
- Use metadata field to track request sources

---

**API Version:** 2.0.0  
**Last Updated:** September 10, 2025  
**Compatibility:** Django 5.2.5, Python 3.13+
