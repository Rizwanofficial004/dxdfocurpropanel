# 🔧 Configuration API Endpoints for Postman Testing

## Base Information
- **Base URL**: `http://127.0.0.1:8000`
- **Authentication**: Required (Username: admin, Password: admin123)

## Authentication Setup for Postman

### Step 1: Login to Get Session
**Endpoint**: `POST http://127.0.0.1:8000/api/auth/login/`
**Method**: POST
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
    "username": "admin",
    "password": "admin123"
}
```

### Alternative Login Method
**Endpoint**: `POST http://127.0.0.1:8000/`
**Method**: POST
**Headers**:
```
Content-Type: application/x-www-form-urlencoded
```
**Body** (form-data):
```
username: admin
password: admin123
```

---

## 📋 Configuration API Endpoints for Testing

### 1. GET All Configurations
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/`
**Method**: GET
**Headers**: None (no authentication required)
**Expected Response**:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Default Upload Settings",
            "type": "upload",
            "description": "Default configuration for file uploads",
            "config_data": { /* upload settings */ },
            "created_at": "2025-07-18T...",
            "updated_at": "2025-07-18T..."
        }
    ]
}
```

### 2. GET Upload Configurations
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/type/upload/`
**Method**: GET
**Headers**: None
**Expected Response**: Array of upload configurations

### 3. GET Database Configurations
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/type/database/`
**Method**: GET
**Headers**: None
**Expected Response**: Array of database configurations

### 4. GET AWS Configurations
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/type/aws/`
**Method**: GET
**Headers**: None
**Expected Response**: Array of AWS configurations

### 5. GET Configuration by ID
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/1/`
**Method**: GET
**Headers**: None
**Expected Response**: Single configuration object

### 6. GET Configuration by Name
**Endpoint**: `GET http://127.0.0.1:8000/api/configurations/name/Default%20Upload%20Settings/`
**Method**: GET
**Headers**: None
**Note**: URL encode the configuration name
**Expected Response**: Single configuration object

### 7. POST Create New Configuration
**Endpoint**: `POST http://127.0.0.1:8000/api/configurations/`
**Method**: POST
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON):
```json
{
    "name": "My Custom Configuration",
    "type": "upload",
    "description": "Custom configuration for testing",
    "config_data": {
        "max_file_size": "5MB",
        "allowed_file_types": ["jpg", "png", "gif"],
        "upload_path": "/custom/uploads/",
        "auto_resize_images": false
    }
}
```
**Expected Response**:
```json
{
    "success": true,
    "message": "Configuration created successfully",
    "data": {
        "id": 7,
        "name": "My Custom Configuration",
        "type": "upload",
        "description": "Custom configuration for testing",
        "config_data": { /* the config data you sent */ }
    }
}
```

### 8. PUT Update Configuration
**Endpoint**: `PUT http://127.0.0.1:8000/api/configurations/7/`
**Method**: PUT
**Headers**:
```
Content-Type: application/json
```
**Body** (raw JSON) - Partial update supported:
```json
{
    "name": "Updated Custom Configuration",
    "config_data": {
        "max_file_size": "10MB",
        "allowed_file_types": ["jpg", "png", "gif", "webp"]
    }
}
```
**Expected Response**:
```json
{
    "success": true,
    "message": "Configuration updated successfully",
    "data": {
        "id": 7,
        "name": "Updated Custom Configuration",
        /* ... updated configuration data ... */
    }
}
```

### 9. DELETE Configuration
**Endpoint**: `DELETE http://127.0.0.1:8000/api/configurations/7/`
**Method**: DELETE
**Headers**: None
**Expected Response**:
```json
{
    "success": true,
    "message": "Configuration deleted successfully"
}
```

---

## 🚀 Postman Collection Setup Instructions

### Option 1: Manual Setup
1. **Create New Collection** in Postman named "Configuration APIs"
2. **Add Environment** with variable `baseUrl = http://127.0.0.1:8000`
3. **Create each request** using the endpoints above
4. **Set up authentication** by first calling login endpoint
5. **Use session cookies** for subsequent requests

### Option 2: Import Collection
Save this as a JSON file and import into Postman:

```json
{
    "info": {
        "name": "Configuration Settings API",
        "description": "API endpoints for managing configuration settings",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "auth": {
        "type": "noauth"
    },
    "event": [
        {
            "listen": "prerequest",
            "script": {
                "type": "text/javascript",
                "exec": [""]
            }
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://127.0.0.1:8000",
            "type": "string"
        }
    ],
    "item": [
        {
            "name": "Authentication",
            "item": [
                {
                    "name": "Login",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"username\": \"admin\",\n    \"password\": \"admin123\"\n}"
                        },
                        "url": {
                            "raw": "{{baseUrl}}/api/auth/login/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "auth", "login", ""]
                        }
                    }
                }
            ]
        },
        {
            "name": "Configuration Management",
            "item": [
                {
                    "name": "Get All Configurations",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", ""]
                        }
                    }
                },
                {
                    "name": "Get Upload Configurations",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/type/upload/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "type", "upload", ""]
                        }
                    }
                },
                {
                    "name": "Get Database Configurations",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/type/database/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "type", "database", ""]
                        }
                    }
                },
                {
                    "name": "Get AWS Configurations",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/type/aws/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "type", "aws", ""]
                        }
                    }
                },
                {
                    "name": "Get Configuration by ID",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/1/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "1", ""]
                        }
                    }
                },
                {
                    "name": "Create New Configuration",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"name\": \"Test Configuration\",\n    \"type\": \"upload\",\n    \"description\": \"Test configuration for Postman\",\n    \"config_data\": {\n        \"max_file_size\": \"5MB\",\n        \"allowed_file_types\": [\"jpg\", \"png\"],\n        \"upload_path\": \"/test/uploads/\"\n    }\n}"
                        },
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", ""]
                        }
                    }
                },
                {
                    "name": "Update Configuration",
                    "request": {
                        "method": "PUT",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"name\": \"Updated Test Configuration\",\n    \"config_data\": {\n        \"max_file_size\": \"10MB\"\n    }\n}"
                        },
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/7/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "7", ""]
                        }
                    }
                },
                {
                    "name": "Delete Configuration",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{baseUrl}}/api/configurations/7/",
                            "host": ["{{baseUrl}}"],
                            "path": ["api", "configurations", "7", ""]
                        }
                    }
                }
            ]
        }
    ]
}
```

---

## 📝 Testing Steps in Postman

1. **Import the collection** above or create requests manually
2. **Set environment variable**: `baseUrl = http://127.0.0.1:8000`
3. **First, run the Login request** to authenticate
4. **Test each configuration endpoint** in order:
   - Start with GET requests to see existing data
   - Try POST to create a new configuration
   - Use PUT to update the created configuration
   - Finally DELETE to clean up

## 🎯 Expected Database Contents
After running the sample data creation, you should have:
- **Upload Configurations**: 2 items (Default + Development)
- **Database Configurations**: 2 items (Production + Test)
- **AWS Configurations**: 2 items (Production + Development)
- **Total**: 6 configurations

## ⚠️ Authentication Notes
- The API requires session-based authentication
- After login, Postman will automatically handle session cookies
- If requests return HTML instead of JSON, authentication failed
- Make sure Django server is running on port 8000

---

## 🔧 Quick Test Commands (Alternative)

If Postman doesn't work, try these curl commands in a terminal with authentication:

```bash
# Login first (this might not work directly due to CSRF)
curl -c cookies.txt -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Then use the cookies for API calls
curl -b cookies.txt http://127.0.0.1:8000/api/configurations/
```
