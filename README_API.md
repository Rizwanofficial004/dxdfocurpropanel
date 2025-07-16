# DDS Focus Time - Professional APIs

## 🚀 Overview

This project provides professional, clean, and well-documented REST APIs for the DDS Focus Time application. The APIs cover three main functionalities:

1. **Authentication/Login** - Secure user authentication
2. **Screenshots Management** - Retrieve and manage employee screenshots
3. **Logs Management** - Create and retrieve activity logs

## 📋 Features

- **Professional API Design**: RESTful endpoints with consistent response format
- **Comprehensive Validation**: Input validation using custom serializers
- **Proper Error Handling**: Standardized error responses with appropriate HTTP status codes
- **Security**: Session-based authentication with permission controls
- **Pagination**: Built-in pagination for large datasets
- **Documentation**: Complete API documentation and examples
- **Testing Tools**: Test scripts and Postman collection included
- **Frontend Integration**: JavaScript client library and demo page

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login

### Screenshots
- `GET /api/screenshots/` - Get screenshots with query parameters
- `POST /api/screenshots/` - Get screenshots with advanced filtering
- `GET /api/screenshots/user/` - Get screenshots by username, email, or name (Enhanced)
- `GET /api/screenshots/date-range/` - Get screenshots by date range (NEW!)

### User Search & Management
- `GET /api/users/search/` - Search users by name, email, or username
- `GET /api/users/suggestions/` - Get Google-like user suggestions for autocomplete

### Logs
- `GET /api/logs/` - Get logs with filtering and pagination
- `POST /api/logs/` - Create new log entries

### Dashboard
- `GET /api/dashboard/user-data/` - Get comprehensive user dashboard data

### Legacy (Backward Compatibility)
- `POST /api/update-log-info/` - Legacy update logs endpoint

## 📁 Project Structure

```
dashboard/
├── api_views.py           # Main API view functions
├── serializers.py         # Data validation and serialization
├── api_urls.py           # API URL routing
├── aws_utils.py          # AWS S3 utilities
├── models.py             # Database models
└── get_employee_screenshots.py  # Screenshot handling

static/js/
└── api-client.js         # JavaScript client library

Files:
├── API_DOCUMENTATION.md   # Complete API documentation
├── test_api.py           # Python test script
├── api_demo.html         # HTML demo page
└── DDS_Focus_Time_APIs.postman_collection.json  # Postman collection
```

## 🔧 Installation & Setup

### 1. Update Django Settings

Add the API URLs to your main URL configuration:

```python
# DDS/urls.py
from django.urls import path, include

urlpatterns = [
    # ... existing patterns
    path('api/', include('dashboard.api_urls')),
]
```

### 2. Database Migration

Ensure your database is up to date:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Test Users

Create some test users for API testing:

```bash
python manage.py createsuperuser
```

## 🚦 Quick Start

### 1. Start the Development Server

```bash
python manage.py runserver
```

### 2. Test with Python Script

```bash
python test_api.py
```

### 3. Test with Browser Demo

Open `api_demo.html` in your browser and navigate to:
```
http://localhost:8000/api_demo.html
```

### 4. Test with Postman

Import the `DDS_Focus_Time_APIs.postman_collection.json` file into Postman.

## 📖 API Usage Examples

### Login Example

```bash
curl -X POST https://dxdtime.ddsolutions.io/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user@example.com", "password": "password123"}'
```

### Get Screenshots Example

```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/?limit=10&page=1" \
  -H "Cookie: sessionid=your-session-id"
```

### Enhanced Screenshots by User (NEW!)

The enhanced screenshots endpoint supports multiple search methods:

#### Search by Email
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=john@company.com&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### Search by Username
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=johnsmith&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### Search by First Name
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=John&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### Search by Last Name
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Smith&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### Search by Full Name
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=John Smith&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### With Additional Filters
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/user/?user=John&status=Online&date=2025-01-15&limit=10" \
  -H "Cookie: sessionid=your-session-id"
```

### Enhanced Screenshots by Date Range (NEW!)

#### One Week Range
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/date-range/?user=john@company.com&start_date=2025-06-22&end_date=2025-06-28&limit=20" \
  -H "Cookie: sessionid=your-session-id"
```

#### Monthly Range
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/date-range/?user=John Smith&start_date=2025-06-01&end_date=2025-06-30&limit=50" \
  -H "Cookie: sessionid=your-session-id"
```

#### Custom Date Range with Status Filter
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/screenshots/date-range/?user=john@company.com&start_date=2024-06-06&end_date=2025-01-01&status=Online&limit=100" \
  -H "Cookie: sessionid=your-session-id"
```

### User Search & Suggestions

#### Search Users
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/users/search/?q=john&limit=10" \
  -H "Cookie: sessionid=your-session-id"
```

#### Get User Suggestions (Google-like autocomplete)
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/users/suggestions/?q=jo&limit=5" \
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
    "jsonlog": {"activity": "screenshot_taken", "duration": 3600},
    "date": "2025-01-15"
  }'
```

## 🆕 Enhanced Features (Version 2.0)

### Multi-Method User Search

The screenshots by user API now supports sophisticated search capabilities:

1. **Email Search**: Direct email lookup (exact match)
2. **Username Search**: Username lookup (exact match)
3. **Name Search**: 
   - First name (partial match, case-insensitive)
   - Last name (partial match, case-insensitive)
   - Full name (partial match, case-insensitive)
   - Mixed name patterns

### Smart Search Strategy

The API uses a fallback strategy for user identification:
1. **Email Detection**: If '@' is found, search by email
2. **Username Search**: Try exact username match
3. **Name Search**: Search first name, last name, and combinations
4. **Multi-Model Search**: Search both User and Staff models

### Search Response Format

Enhanced response includes search metadata:

```json
{
  "success": true,
  "message": "Screenshots retrieved successfully for John Smith",
  "data": {
    "user_info": {
      "username": "johnsmith",
      "email": "john@company.com", 
      "display_name": "John Smith",
      "is_staff": false
    },
    "search_info": {
      "search_term": "John",
      "search_method": "name",
      "found_by": "name"
    },
    "screenshots": [...],
    "pagination": {...},
    "summary": {
      "total_screenshots": 45,
      "status_breakdown": {
        "online": 30,
        "idle": 10,
        "offline": 5
      }
    }
  }
}
```

## 🔒 Security Features

- **Session Authentication**: All APIs (except login) require valid session authentication
- **Permission Control**: Users can only access their own data unless they have staff privileges
- **Input Validation**: All inputs are validated and sanitized using custom serializers
- **CSRF Protection**: CSRF tokens are handled appropriately for API endpoints
- **Error Handling**: Secure error messages that don't expose sensitive information

## 📊 Response Format

All APIs return responses in this standardized format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {...},
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## 🔍 Error Handling

The APIs provide comprehensive error handling with appropriate HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - HTTP method not supported
- `500 Internal Server Error` - Server error

## 📄 Pagination

APIs that return lists support pagination:

```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100,
    "limit": 20,
    "has_next": true,
    "has_previous": false
  }
}
```

## 🧪 Testing

### Python Test Script
Run the comprehensive test script:
```bash
python test_api.py
```

### HTML Demo Page
Open `api_demo.html` in a browser for interactive testing.

### Postman Collection
Import the provided Postman collection for API testing.

## 🔧 Frontend Integration

Use the provided JavaScript client library:

```html
<script src="/static/js/api-client.js"></script>
<script>
const api = new DDSFocusTimeAPI();

// Login
await api.login('user@example.com', 'password');

// Get screenshots
const screenshots = await api.getScreenshots({limit: 10});

// Create log
await api.createLog(123, 'user@example.com', {activity: 'test'}, '2025-01-15');
</script>
```

## 📈 Performance Considerations

- **Pagination**: Large datasets are automatically paginated
- **Efficient Queries**: Database queries are optimized with proper filtering
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Rate Limiting**: Implement rate limiting for production environments

## 🚀 Production Deployment

### 1. Environment Variables

Set up environment variables for production:

```bash
export SECRET_KEY="your-production-secret-key"
export DEBUG=False
export DB_NAME="production_db"
export DB_USER="production_user"
export DB_PASSWORD="production_password"
export AWS_ACCESS_KEY_ID="your-aws-key"
export AWS_SECRET_ACCESS_KEY="your-aws-secret"
```

### 2. Security Settings

Update Django settings for production:

```python
# settings.py
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Session security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True

# HTTPS settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
```

### 3. Rate Limiting (Recommended)

Install django-ratelimit and add rate limiting:

```bash
pip install django-ratelimit
```

```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', method='POST')
def login_api(request):
    # ... existing code
```

## 🐛 Troubleshooting

### Common Issues

1. **CSRF Token Errors**
   - Ensure `@csrf_exempt` is applied to API views
   - Check that Content-Type is set to `application/json`

2. **Authentication Failures**
   - Verify user credentials are correct
   - Check that sessions are properly configured
   - Ensure cookies are being sent with requests

3. **Permission Denied**
   - Users can only access their own data unless they're staff
   - Check user permissions and staff status

4. **S3 Access Issues**
   - Verify AWS credentials are correctly configured
   - Check S3 bucket permissions
   - Ensure region settings are correct

## 📞 Support

For questions or issues:

1. Check the API documentation in `API_DOCUMENTATION.md`
2. Run the test scripts to verify functionality
3. Review the error messages in the standardized response format
4. Check the Django logs for detailed error information

## 🔄 Updates and Maintenance

### Adding New Features

1. Create new views in `api_views.py`
2. Add validation in `serializers.py`
3. Update URL routing in `api_urls.py`
4. Update documentation and tests

### Version Control

The APIs maintain backward compatibility through:
- Legacy endpoint support
- Versioned API responses
- Graceful deprecation warnings

## 📝 Changelog

### Version 2.0 (Current - Enhanced)
- ✅ **Enhanced Screenshots by User API** - Multi-method search (email, username, name)
- ✅ **Smart User Search** - Google-like user search and suggestions
- ✅ **Name-Based Queries** - Search by first name, last name, or full name
- ✅ **Case-Insensitive Search** - Flexible partial matching
- ✅ **Multi-Model Search** - Search across User and Staff models
- ✅ **Search Metadata** - Response includes search method information
- ✅ **Relevance Ranking** - Results ranked by relevance and activity

### Version 1.0 (Foundation)
- ✅ Professional Login API
- ✅ Screenshots Management API
- ✅ Logs Management API
- ✅ Comprehensive validation and error handling
- ✅ Pagination support
- ✅ JavaScript client library
- ✅ Test scripts and documentation
- ✅ Postman collection

### Future Enhancements
- [ ] JWT token authentication option
- [ ] Advanced screenshot filtering by date ranges
- [ ] File upload APIs
- [ ] Real-time notifications
- [ ] API versioning
- [ ] OpenAPI/Swagger documentation
- [ ] Machine learning-based user recommendations
