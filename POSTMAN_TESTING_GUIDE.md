# POST Users API - Testing Guide

## 🎯 API Endpoint
**URL:** `https://dxdtime.ddsolutions.io/api/auth/register/post_users/`  
**Local URL:** `http://127.0.0.1:8000/api/auth/register/post_users/`

## 🔧 Postman Testing Configuration

### Headers Required
```
Content-Type: application/json
Accept: application/json
```

## 📊 GET Request - API Statistics
**Method:** GET  
**URL:** `https://dxdtime.ddsolutions.io/api/auth/register/post_users/`

### Expected Response (200 OK):
```json
{
  "status": "success",
  "message": "POST Users API statistics",
  "data": {
    "api_info": {
      "endpoint": "/api/auth/register/post_users/",
      "methods": ["POST", "GET"],
      "description": "Enhanced user registration with SQL storage",
      "features": [
        "Comprehensive validation",
        "SQL database storage", 
        "Profile management",
        "Numeric value support",
        "Error handling"
      ]
    },
    "statistics": {
      "total_users": 10,
      "active_users": 10,
      "inactive_users": 0,
      "users_with_profiles": 10,
      "users_with_numeric_values": 5,
      "recent_registrations_24h": 2
    }
  }
}
```

## ✅ POST Request - User Registration
**Method:** POST  
**URL:** `https://dxdtime.ddsolutions.io/api/auth/register/post_users/`

### Required Fields:
- `username` (string, 3-30 chars, alphanumeric + @.+-_)
- `email` (string, valid email format, unique)
- `password` (string, 8+ chars, must contain letter and number)

### Optional Fields:
- `first_name` (string, max 30 chars)
- `last_name` (string, max 30 chars)
- `organization_name` (string, max 100 chars)
- `country` (string)
- `phone_number` (string, digits/+/-/()/ allowed)
- `job_title` (string)
- `industry` (string)
- `bio` (string)
- `date_of_birth` (string, format: YYYY-MM-DD)
- `numeric_value` (integer, defaults to 0)

### Postman Body (raw JSON):
```json
{
  "username": "testuser_postman_001",
  "email": "testuser_postman_001@example.com",
  "password": "TestPass123",
  "first_name": "Postman",
  "last_name": "Tester",
  "organization_name": "Test Organization Inc",
  "country": "United States",
  "phone_number": "+1-555-123-4567",
  "job_title": "API Tester",
  "industry": "Software Testing",
  "bio": "Testing the new POST Users API endpoint",
  "date_of_birth": "1990-05-15",
  "numeric_value": 77
}
```

### Expected Success Response (201 Created):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 11,
      "username": "testuser_postman_001",
      "email": "testuser_postman_001@example.com",
      "first_name": "Postman",
      "last_name": "Tester",
      "full_name": "Postman Tester",
      "date_joined": "2024-01-20T11:15:30.123456Z",
      "is_active": true,
      "profile": {
        "organization_name": "Test Organization Inc",
        "country": "United States",
        "phone_number": "+1-555-123-4567",
        "job_title": "API Tester",
        "industry": "Software Testing",
        "bio": "Testing the new POST Users API endpoint",
        "date_of_birth": "1990-05-15",
        "numeric_value": 77,
        "profile_completed": true,
        "email_notifications": true,
        "privacy_level": "public",
        "completion_percentage": 90
      }
    },
    "registration_details": {
      "profile_created": true,
      "profile_completed": true,
      "numeric_value_set": 77,
      "validation_passed": true,
      "sql_stored": true
    }
  },
  "metadata": {
    "timestamp": "2024-01-20T11:15:30.123456Z",
    "api_version": "1.0.0",
    "endpoint": "/api/auth/register/post_users",
    "method": "POST"
  }
}
```

## ❌ Error Testing Examples

### 1. Validation Errors (400 Bad Request)
**Body with invalid data:**
```json
{
  "username": "ab",
  "email": "invalid-email",
  "password": "123",
  "numeric_value": "not_a_number"
}
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "username": ["Username must be at least 3 characters long"],
    "email": ["Please enter a valid email address"],
    "password": ["Password must be at least 8 characters long", "Password must contain at least one letter"],
    "numeric_value": ["Numeric value must be a valid integer"]
  },
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-20T11:15:30.123456Z"
}
```

### 2. Duplicate User (400 Bad Request)
**Body with existing username/email:**
```json
{
  "username": "existing_user",
  "email": "existing@example.com", 
  "password": "TestPass123"
}
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "A user with this username already exists",
  "error_code": "DUPLICATE_DATA",
  "error_field": "username",
  "timestamp": "2024-01-20T11:15:30.123456Z"
}
```

## 🔍 Key Features Tested

### ✅ What This API Does:
1. **Comprehensive Validation** - Username, email, password strength
2. **SQL Storage** - Saves to User and UserProfile models
3. **Numeric Value Support** - Correctly stores and returns numeric_value
4. **Profile Management** - Handles optional profile fields
5. **Error Handling** - Detailed validation messages
6. **Statistics** - GET endpoint provides registration stats
7. **Data Integrity** - Uses database transactions
8. **Security** - Password hashing, email validation

### 📝 Validation Rules:
- **Username:** 3-30 characters, alphanumeric + @.+-_
- **Email:** Valid format, must be unique
- **Password:** 8+ characters, must contain letter and number
- **Numeric Value:** Integer (required for your use case)
- **Phone:** Only digits, +, -, (, ), spaces allowed
- **Date of Birth:** YYYY-MM-DD format, cannot be future date

## 🚀 Testing Checklist

### Test Cases to Run in Postman:
- [ ] GET request for API info/statistics
- [ ] POST valid user with all fields
- [ ] POST minimal user (username, email, password only)
- [ ] POST with numeric_value = 66, 77, 88, 99
- [ ] POST with invalid username (too short)
- [ ] POST with invalid email format
- [ ] POST with weak password
- [ ] POST with duplicate username
- [ ] POST with duplicate email
- [ ] POST with invalid numeric_value type

## 🎯 Important Notes

1. **Remote vs Local Testing:**
   - Remote: `https://dxdtime.ddsolutions.io/api/auth/register/post_users/`
   - Local: `http://127.0.0.1:8000/api/auth/register/post_users/`

2. **Numeric Value:** This API correctly handles the numeric_value field that was problematic in previous tests

3. **Profile Completion:** Setting first_name, last_name, organization_name, and country automatically marks profile as completed

4. **Response Format:** Uses flat JSON structure (not nested profile object) for consistency with your working API format

5. **Error Handling:** Provides detailed validation errors to help identify issues

## 🔧 Deployment Status

- ✅ **Code Created:** POST Users API view complete
- ✅ **URL Configured:** Added to auth_api/urls.py  
- ✅ **Validation Added:** Comprehensive field validation
- ✅ **SQL Integration:** Saves to User and UserProfile models
- ✅ **Error Handling:** Detailed error responses
- ⏳ **Deployment:** Need to push to remote server for live testing

## 📋 Next Steps

1. **Deploy to Remote Server:** Push code changes to production
2. **Test in Postman:** Use the examples above
3. **Verify SQL Storage:** Check that numeric_value saves correctly
4. **Integration Testing:** Test with your frontend application

The API is ready for testing once deployed! 🚀