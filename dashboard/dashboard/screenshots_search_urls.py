"""
URL Configuration for Screenshots Search APIs
Supports the three main search patterns
"""

from django.urls import path
from . import screenshots_search_api

app_name = 'screenshots_search'

urlpatterns = [
    # ==================== UNIFIED SEARCH API ====================
    # Main endpoint that auto-detects search pattern
    path('search/', screenshots_search_api.screenshots_search_api, name='screenshots_search'),
    
    # ==================== PATTERN-SPECIFIC ENDPOINTS ====================
    
    # Pattern 1: Quick Name Search
    # Usage: /api/screenshots/quick-search/?search=Haseeb&limit=100
    path('quick-search/', screenshots_search_api.quick_name_search_api, name='quick_name_search'),
    
    # Pattern 2: Name + Date Filter
    # Usage: /api/screenshots/date-search/?search=Haseeb&date=2025-06-10&limit=100
    path('date-search/', screenshots_search_api.name_date_filter_api, name='name_date_filter'),
    
    # Pattern 3: Name + ALL Screenshots (S3 Comprehensive)
    # Usage: /api/screenshots/comprehensive-search/?search=Haseeb&scan_s3=true&limit=5000
    path('comprehensive-search/', screenshots_search_api.name_all_screenshots_api, name='name_all_screenshots'),
]

"""
API Documentation:

1. UNIFIED SEARCH ENDPOINT:
   GET /api/screenshots/search/
   - Automatically detects which pattern to use based on parameters
   - Parameters: search, date (optional), scan_s3 (optional), limit (optional)

2. PATTERN 1 - QUICK NAME SEARCH:
   GET /api/screenshots/quick-search/
   - Fast search by name/email
   - Parameters: search (required), limit (default: 100)
   - Example: curl "http://127.0.0.1:8000/api/screenshots/quick-search/?search=Haseeb&limit=100"

3. PATTERN 2 - NAME + DATE FILTER:
   GET /api/screenshots/date-search/
   - Search by name with specific date
   - Parameters: search (required), date (required, YYYY-MM-DD), limit (default: 100)
   - Example: curl "http://127.0.0.1:8000/api/screenshots/date-search/?search=Haseeb&date=2025-06-10&limit=100"

4. PATTERN 3 - NAME + ALL SCREENSHOTS:
   GET /api/screenshots/comprehensive-search/
   - Comprehensive S3 scan for all screenshots
   - Parameters: search (required), scan_s3=true (required), limit (default: 5000, max: 10000)
   - Example: curl "http://127.0.0.1:8000/api/screenshots/comprehensive-search/?search=Haseeb&scan_s3=true&limit=5000"

Response Format:
{
    "success": true,
    "message": "Found X employees with Y screenshots",
    "data": {
        "search_pattern": "pattern_name",
        "employees": [
            {
                "staff_id": "HAS001",
                "name": "Haseeb Code Journey",
                "email": "haseebcodejourney@gmail.com",
                "profile_image": "/media/profile.jpg",
                "total_screenshots": 150,
                "screenshots_shown": 100,
                "screenshots": [...],
                "source": "Quick_Search"
            }
        ],
        "summary": {
            "total_employees_found": 1,
            "total_screenshots": 100,
            "search_query": "Haseeb",
            "limit_per_employee": 100
        },
        "metadata": {
            "timestamp": "2025-01-15T10:30:00",
            "api_endpoint": "/api/screenshots/search/",
            "pattern": "Pattern 1: Quick Name Search"
        }
    },
    "timestamp": "2025-01-15T10:30:00"
}
"""
