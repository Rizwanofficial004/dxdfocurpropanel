# DDS Focus Pro - Authentication API Documentation

## 📋 Overview
This document provides complete API endpoints for Registration and Login functionality in the DDS Focus Pro Panel.

## 🌐 Base URLs

### Production
```
https://dxdtime.ddsolutions.io/api
```

### Development (with Vite Proxy)
```
http://localhost:5173/api
```

## 🔐 Authentication Endpoints

### 1. Login

The system attempts login through multiple endpoints in order of preference:

#### Primary Login Endpoint
```http
POST /auth/login/
```

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Request Body:**
```json
{
  "email": "testapi@example.com",
  "password": "testpassword123"
}
```

**⚠️ Current Status:** The login endpoint has a backend bug. It accepts the request but returns a 500 error with message: `"Login failed: 'email_or_username'"`. This indicates the backend code expects a field named `email_or_username` but the API validation requires `email`.

**Success Response (200):** *(Expected format when backend is fixed)*
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "id": 11,
    "username": "testapi@example.com",
    "email": "testapi@example.com",
    "first_name": "API",
    "last_name": "Test",
    "date_joined": "2025-09-12T20:38:19.485025+00:00"
  },
  "token": "5d3669efef36ef2a838d1af5d110426b5568a0a2"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "non_field_errors": ["No account found with this email address. Please check your email or register a new account."]
  }
}
```

**Current Error Response (500):** *(Backend bug)*
```json
{
  "status": "error",
  "message": "Login failed: 'email_or_username'"
}
```

#### ⚠️ Note on Alternative Endpoints

**IMPORTANT:** The following alternative endpoints are currently **NOT AVAILABLE** (return 404):

- ❌ `/auth/token/` - Not Found
- ❌ `/api-token-auth/` - Not Found  
- ❌ `/login/` - Not Found
- ❌ `/token/` - Not Found

**Only use the primary endpoint:** `/auth/login/`

### 2. Registration

```http
POST /auth/register/
```

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

**Request Body:**
```json
{
  "username": "newuser@example.com",
  "email": "newuser@example.com",
  "password": "newpassword123",
  "password_confirm": "newpassword123",
  "first_name": "John",
  "last_name": "Doe",
  "organization_name": "Test Organization",
  "country": "USA"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully with unique email",
  "user": {
    "id": 15,
    "username": "newuser@example.com",
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_joined": "2025-09-12T20:38:19.485025+00:00"
  },
  "token": "5d3669efef36ef2a838d1af5d110426b5568a0a2"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": ["This email is already registered"],
    "password": ["Password must be at least 8 characters"],
    "password_confirm": ["This field is required."]
  }
}
```

### 3. Logout

```http
POST /auth/logout/
```

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": "Token your_auth_token_here"
}
```

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### 4. Token Refresh

```http
POST /auth/refresh/
```

**Request Body:**
```json
{
  "refresh": "your_refresh_token_here"
}
```

**Success Response (200):**
```json
{
  "access": "new_access_token",
  "refresh": "new_refresh_token"
}
```

### 5. Password Reset

#### Forgot Password
```http
POST /auth/forgot-password/
```

**Request Body:**
```json
{
  "email": "testuser@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password/
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_password_123"
}
```

### 6. Email Verification

```http
POST /auth/verify-email/
```

**Request Body:**
```json
{
  "token": "verification_token_from_email"
}
```

## 🧪 Test Credentials

Use these credentials for testing (registered during API testing):

- **Email:** `testapi@example.com`
- **Password:** `testpassword123`

**Note:** The original test user `testuser@example.com` does not exist in the database.

## 📝 Authentication Flow

1. **Login:** Send credentials to `/auth/login/`
2. **Store Token:** Save the returned token
3. **Authenticated Requests:** Include token in Authorization header:
   ```
   Authorization: Token your_token_here
   ```

## 🚨 Common Error Codes

- **400:** Bad Request (validation errors)
- **401:** Unauthorized (invalid credentials)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found (endpoint doesn't exist)
- **500:** Internal Server Error

## 🔧 Postman Setup

1. Import the collection file: `DDS_Focus_Pro_Auth_API.postman_collection.json`
2. Set environment variables:
   - `base_url`: `https://dxdtime.ddsolutions.io/api`
   - `dev_url`: `http://localhost:5173/api`
3. Use test credentials for initial testing
4. Save authentication tokens for subsequent requests

## 📊 Request/Response Examples

### Successful Login Example

**Request:**
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testapi@example.com",
    "password": "testpassword123"
  }'
```

**Current Response (500 - Backend Bug):**
```json
{
  "status": "error",
  "message": "Login failed: 'email_or_username'"
}
```

### Failed Login Example

**Request:**
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpass"
  }'
```

**Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "non_field_errors": ["No account found with this email address. Please check your email or register a new account."]
  }
}
```

## 🔍 Debugging Tips

1. **Check Console Logs:** Enable browser dev tools to see detailed request/response logs
2. **Verify Endpoints:** Only use `/auth/login/` as alternatives don't exist  
3. **Check Request Format:** Ensure JSON format and headers are correct
4. **Test with Postman:** Use the provided collection for systematic testing
5. **Use Test Credentials:** Start with the provided test user credentials

## � **Known Backend Issues**

### 1. Login Endpoint Bug
- **Issue:** Returns HTTP 500 with message `"Login failed: 'email_or_username'"`
- **Cause:** Backend code expects `email_or_username` field but API validation requires `email`
- **Status:** Needs backend fix
- **Workaround:** Currently none - login is not functional

### 2. Alternative Endpoints Missing
- **Issue:** Endpoints `/auth/token/`, `/api-token-auth/`, `/login/`, `/token/` return 404
- **Status:** Remove from AuthService or implement in backend
- **Current Solution:** Removed from frontend code

### 3. Test User Missing
- **Issue:** Original test user `testuser@example.com` doesn't exist
- **Solution:** Updated to use `testapi@example.com` (created during testing)

## �📞 API Health Check

To verify the API is accessible:

```http
GET /
```

**Current Status:** Returns 404 (endpoint not implemented)
