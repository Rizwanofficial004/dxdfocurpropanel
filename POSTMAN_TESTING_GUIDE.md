# 🚀 Credentials API - Postman Testing Guide

## Server Information
- **Base URL**: `http://127.0.0.1:8000`
- **API Base**: `http://127.0.0.1:8000/api`
- **Status**: ✅ Server Running

---

## 📁 **Postman Collection Setup**

### 1. Create New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it: `Credentials Management API`
4. Add description: `Comprehensive credentials management for AWS, Database, OpenAI, and Auth`

### 2. Set Collection Variables
- Right-click collection → "Edit" → "Variables" tab
- Add these variables:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `base_url` | `http://127.0.0.1:8000` | `http://127.0.0.1:8000` |
| `api_base` | `{{base_url}}/api` | `http://127.0.0.1:8000/api` |

---

## 🎯 **API Endpoints to Test**

### **1. SET ALL CREDENTIALS API** 
**✨ Main Feature - Set comprehensive credentials**

**Request Details:**
- **Method**: `POST`
- **URL**: `{{api_base}}/set-all-credentials/`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

**Body (JSON - Raw):**
```json
{
  "credential_name": "Production Config",
  "description": "Production environment credentials",
  "environment": "production",
  
  "aws_access_key_id": "AKIATEST123456789012",
  "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",
  "aws_region": "us-west-2",
  "aws_bucket_name": "my-production-bucket",
  
  "db_host": "prod-db.example.com",
  "db_port": 3306,
  "db_name": "production_db",
  "db_username": "prod_admin",
  "db_password": "super_secure_password_2024",
  "db_type": "mysql",
  
  "openai_api_key": "sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yzabc567def890",
  "openai_organization": "org-production123",
  "openai_model": "gpt-4",
  
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.production.token.signature",
  "auth_base_url": "https://api.myapp.com/v1",
  "auth_expires_at": "2024-12-31T23:59:59Z"
}
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "Credentials configuration created successfully",
  "data": {
    "credential": {
      "id": 1,
      "credential_name": "Production Config",
      "credential_type": "aws",
      "environment": "production",
      "is_active": true,
      "created_at": "2025-09-08T...",
      "aws_credentials": {
        "aws_access_key_id": "AKIATEST123456789012",
        "region": "us-west-2",
        "bucket_name": "my-production-bucket"
      }
    }
  }
}
```

---

### **2. GET ALL CREDENTIALS API**
**✨ Retrieve all credentials with filtering**

**Request Details:**
- **Method**: `GET`
- **URL**: `{{api_base}}/get-all-credentials/`
- **Headers**: None required

**Query Parameters (Optional):**
| Parameter | Description | Example |
|-----------|-------------|---------|
| `type` | Filter by credential type | `aws`, `database`, `openai`, `auth` |
| `environment` | Filter by environment | `development`, `production`, `staging` |
| `active_only` | Show only active credentials | `true`, `false` |
| `credential_name` | Filter by name | `Production Config` |

**Example URLs:**
- All credentials: `{{api_base}}/get-all-credentials/`
- AWS only: `{{api_base}}/get-all-credentials/?type=aws`
- Production only: `{{api_base}}/get-all-credentials/?environment=production`
- Active only: `{{api_base}}/get-all-credentials/?active_only=true`

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Retrieved X credential configuration(s)",
  "data": {
    "credential_configurations": [
      {
        "id": 1,
        "credential_name": "Production Config",
        "aws_secret_access_key": "wJal*********************************EKEY",
        "db_password": "supe********************2024",
        "openai_api_key": "sk-p**************************************************************f890",
        "auth_token": "eyJh****************************************************ture",
        "credentials_summary": {
          "has_aws": true,
          "has_database": true,
          "has_openai": true,
          "has_auth": true
        }
      }
    ],
    "total_count": 1
  }
}
```

---

## 🧪 **Advanced Testing Scenarios**

### **Test Case 1: Minimal AWS Credentials**
```json
{
  "credential_name": "AWS Only Config",
  "aws_access_key_id": "AKIAMINIMAL123456789",
  "aws_secret_access_key": "minimalSecretKey/Example/12345678901234567890",
  "aws_region": "eu-west-1"
}
```

### **Test Case 2: Database Only**
```json
{
  "credential_name": "Database Only Config",
  "db_host": "localhost",
  "db_port": 5432,
  "db_name": "test_db",
  "db_username": "test_user",
  "db_password": "test_password_123",
  "db_type": "postgresql"
}
```

### **Test Case 3: OpenAI Only**
```json
{
  "credential_name": "OpenAI Only Config",
  "openai_api_key": "sk-test123456789012345678901234567890123456789012345678901234567890",
  "openai_organization": "org-test123",
  "openai_model": "gpt-3.5-turbo"
}
```

### **Test Case 4: Invalid Data (Should Return 400)**
```json
{
  "credential_name": "Invalid Config",
  "aws_access_key_id": "INVALID",
  "aws_secret_access_key": "too_short",
  "openai_api_key": "invalid_key_format"
}
```

---

## 🔍 **Testing Workflow**

### **Step 1: Set Up Postman**
1. Create collection: "Credentials Management API"
2. Add base URL variable: `http://127.0.0.1:8000`
3. Create folder: "SET Credentials API"
4. Create folder: "GET Credentials API"

### **Step 2: Test SET API**
1. **Request Name**: "SET - Complete Credentials"
   - Use the comprehensive JSON body above
   - Verify 201 status code
   - Check response contains all credential types

2. **Request Name**: "SET - AWS Only"
   - Use minimal AWS credentials
   - Verify 201 status code

3. **Request Name**: "SET - Invalid Data"
   - Use invalid credentials
   - Verify 400 status code with validation errors

### **Step 3: Test GET API**
1. **Request Name**: "GET - All Credentials"
   - No parameters
   - Verify 200 status code
   - Check credentials are masked

2. **Request Name**: "GET - Filter by Type (AWS)"
   - Add query parameter: `type=aws`
   - Verify filtered results

3. **Request Name**: "GET - Filter by Environment"
   - Add query parameter: `environment=production`
   - Verify environment filtering

### **Step 4: Verify Security**
1. Check that sensitive data is masked in GET responses
2. Verify AWS secret keys show as: `wJal*********************************EKEY`
3. Verify passwords show as: `supe********************2024`
4. Verify API keys show masked format

---

## 📊 **Expected Test Results**

### ✅ **Success Indicators:**
- SET API returns 201 status code
- GET API returns 200 status code
- Sensitive data is properly masked
- Validation errors for invalid data
- Filtering works correctly

### ❌ **Failure Indicators:**
- 500 server errors
- Unmasked sensitive data in responses
- Invalid JSON responses
- Missing validation

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Connection Refused**
   - Ensure Django server is running: `python manage.py runserver 127.0.0.1:8000`
   - Check URL is exactly: `http://127.0.0.1:8000/api/set-all-credentials/`

2. **400 Bad Request**
   - Verify JSON format is correct
   - Check Content-Type header: `application/json`
   - Ensure required fields are provided

3. **404 Not Found**
   - Verify URL path is correct
   - Check trailing slashes in URLs

4. **Validation Errors**
   - AWS Secret Access Key must be 40+ characters
   - OpenAI API key must start with 'sk-'
   - Database credentials require host, name, username

---

## 🎉 **Quick Test Commands**

Copy these into Postman to test quickly:

### SET Credentials:
```
POST {{api_base}}/set-all-credentials/
Content-Type: application/json

{
  "credential_name": "Quick Test Config",
  "aws_access_key_id": "AKIATEST123456789012",
  "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY",
  "aws_region": "us-east-1",
  "openai_api_key": "sk-test123456789012345678901234567890123456789012345678901234567890"
}
```

### GET Credentials:
```
GET {{api_base}}/get-all-credentials/
```

### GET with Filter:
```
GET {{api_base}}/get-all-credentials/?type=aws&environment=development
```

---

**🚀 Ready to test! The server is running and APIs are fully functional.**
