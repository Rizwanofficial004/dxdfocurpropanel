# Professional APIs Documentation

## Overview
This document describes the professional REST APIs for the DDS Focus Time application.

### Base URL
- Development: `https://dxdtime.ddsolutions.io/api/`
- Production: `https://dxdtime.ddsolutions.io/api/`

### Authentication
All APIs (except login) require user authentication via Django session authentication.

### Response Format
All APIs return JSON responses in the following standardized format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {...},
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 1. Login API

### Endpoint
`POST /api/auth/login/`

### Description
Authenticates a user and creates a session.

### Request Body
```json
{
  "username": "user@example.com",
  "password": "userpassword"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_staff": false,
      "is_superuser": false,
      "last_login": "2025-01-15T09:30:00Z",
      "date_joined": "2025-01-01T00:00:00Z"
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Responses
- `400 Bad Request`: Invalid JSON or missing fields
- `401 Unauthorized`: Invalid credentials or deactivated account

---

## 2. Screenshots API

### Endpoint
- `GET /api/screenshots/` - Retrieve screenshots
- `POST /api/screenshots/` - Retrieve screenshots with advanced filtering

### Description
Retrieves employee screenshots from S3 storage with pagination and filtering options.

### Authentication Required
Yes - Users can only access their own screenshots unless they are staff members.

### GET Request Parameters
- `email` (optional): Employee email (defaults to authenticated user's email)
- `date` (optional): Specific date in YYYY-MM-DD format
- `limit` (optional): Number of screenshots per page (default: 50)
- `page` (optional): Page number (default: 1)

### POST Request Body
```json
{
  "email": "employee@example.com",
  "date": "2025-01-15",
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "task_filter": "specific_task",
  "limit": 100,
  "page": 1
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Screenshots retrieved successfully",
  "data": {
    "screenshots": [
      {
        "url": "/media/screenshots/user_at_example.com/task1/screenshot1.jpg",
        "folder": "user_at_example.com/task1",
        "timestamp": "2025-01-15T10:30:00Z",
        "presigned_url": "https://ddsfocustime.s3.amazonaws.com/..."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 250,
      "limit": 50,
      "has_next": true,
      "has_previous": false
    },
    "email": "user@example.com",
    "date_filter": "2025-01-15"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Responses
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied (trying to access other user's screenshots)
- `400 Bad Request`: Invalid email format or parameters

---

## 3. Logs API

### Endpoint
- `GET /api/logs/` - Retrieve logs
- `POST /api/logs/` - Create new logs

### Description
Manages user activity logs with filtering, pagination, and creation capabilities.

### Authentication Required
Yes - Users can only access their own logs unless they are staff members.

### GET Request Parameters
- `email` (optional): Filter by email
- `staffid` (optional): Filter by staff ID
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `limit` (optional): Number of logs per page (default: 20)
- `page` (optional): Page number (default: 1)
- `search` (optional): Search term for log content

### POST Request Body (Create Log)
```json
{
  "staffid": 123,
  "email": "user@example.com",
  "jsonlog": {
    "activity": "screenshot_taken",
    "task": "Project XYZ",
    "duration": 3600,
    "details": {...}
  },
  "date": "2025-01-15"
}
```

### Success Response - GET (200)
```json
{
  "success": true,
  "message": "Logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": 1,
        "staffid": 123,
        "email": "user@example.com",
        "jsonlog": {
          "activity": "screenshot_taken",
          "task": "Project XYZ",
          "duration": 3600
        },
        "date": "2025-01-15",
        "created_at": "2025-01-15"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 60,
      "limit": 20,
      "has_next": true,
      "has_previous": false
    },
    "filters": {
      "email": "",
      "staffid": "",
      "date": "",
      "search": ""
    }
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Success Response - POST (201)
```json
{
  "success": true,
  "message": "Log created successfully",
  "data": {
    "log_id": 1,
    "staffid": 123,
    "email": "user@example.com",
    "date": "2025-01-15"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Responses
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `400 Bad Request`: Missing required fields or invalid data
- `500 Internal Server Error`: Server error

---

## Error Handling

All APIs use consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "data": {},
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: HTTP method not supported
- `500 Internal Server Error`: Server error

---

## Usage Examples

### Login Example
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'
```

### Get Screenshots Example
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/?email=user@example.com&date=2025-01-15&limit=10" \
  -H "Cookie: sessionid=your-session-id"
```

### Create Log Example
```bash
curl -X POST https://dxdtime.ddsolutions.io/api/logs/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=your-session-id" \
  -d '{
    "staffid": 123,
    "email": "user@example.com",
    "jsonlog": {"activity": "task_completed", "duration": 7200},
    "date": "2025-01-15"
  }'
```

---

## Security Considerations

1. **Authentication**: All APIs (except login) require valid Django session authentication
2. **Authorization**: Users can only access their own data unless they have staff privileges
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for production use
5. **HTTPS**: Always use HTTPS in production
6. **Session Security**: Configure secure session settings in Django

---

## Rate Limiting (Recommended for Production)

Consider implementing rate limiting:
- Login API: 5 requests per minute per IP
- Screenshots API: 100 requests per hour per user
- Logs API: 200 requests per hour per user
