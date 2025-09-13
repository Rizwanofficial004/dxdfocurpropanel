# Enhanced Monthly Screenshots API Documentation

## Overview
This API provides month-wise screenshot data for users with advanced features including pagination, fast performance, accurate S3 data retrieval, and support for all users.

## API Endpoint
```
GET /api/users/monthly-screenshots/
```

## Supported URL Formats

### 1. Date Range Format (Your Preferred Format)
```
http://127.0.0.1:8004/api/users/monthly-screenshots/?2025-08-01/2025-08-31&user=kadircagtas_at_gmail.com&page=1
```

### 2. Traditional Parameter Format
```
http://127.0.0.1:8004/api/users/monthly-screenshots/?year=2025&month=8&user=kadircagtas_at_gmail.com&page=1
```

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| Date Range | String | Optional | Format: YYYY-MM-DD/YYYY-MM-DD | `2025-08-01/2025-08-31` |
| year | Integer | Optional | Year (if not using date range) | `2025` |
| month | Integer | Optional | Month 1-12 (if not using date range) | `8` |
| user | String | Optional | Filter by specific user (email format) | `kadircagtas_at_gmail.com` |
| page | Integer | Optional | Page number for pagination (default: 1) | `1` |

## Features Implemented

### ✅ 1. Month-wise Data Filtering
- Supports both date range and traditional month/year parameters
- Validates date ranges to ensure they're within the same month
- Handles Turkish month names in S3 folder structure

### ✅ 2. Pagination
- Fixed page size of 50 users per page
- Provides next/previous page URLs
- Total pages calculation
- Navigation metadata

### ✅ 3. Fast API Performance
- Multi-threading with ThreadPoolExecutor (up to 20 concurrent workers)
- Performance optimization limits (max 200 users per request)
- Optimized S3 operations with pagination
- Smart caching and batch processing

### ✅ 4. Accurate S3 Data
- Direct integration with S3 bucket `ddsfocustime`
- Enhanced image file filtering (PNG, JPG, JPEG, GIF, BMP, WEBP, TIFF)
- Excludes system files and thumbnails
- Accurate screenshot counting with file validation

### ✅ 5. Support for All Users
- Scans all user folders in the screenshots directory
- Enhanced user search with multiple email formats
- Handles both `user@domain.com` and `user_at_domain.com` formats
- Exact match prioritization

## Response Format

```json
{
    "status": "success",
    "message": "Found X active users with screenshots for August 2025 (Page 1 of Y)",
    "api_info": {
        "endpoint": "/api/users/monthly-screenshots/",
        "supported_formats": [...],
        "version": "2.0",
        "performance_optimized": true
    },
    "data": {
        "month_info": {
            "year": 2025,
            "month": 8,
            "month_name": "August",
            "days_in_month": 31,
            "date_range_queried": "2025-08-01 to 2025-08-31"
        },
        "pagination": {
            "page": 1,
            "page_size": 50,
            "total_pages": 5,
            "total_users": 250,
            "has_next": true,
            "has_previous": false,
            "next_page": 2,
            "previous_page": null,
            "next_url": "...",
            "previous_url": null
        },
        "summary": {
            "total_users_scanned": 500,
            "active_users": 250,
            "inactive_users": 250,
            "total_screenshots": 15000,
            "avg_screenshots_per_active_user": 60.0,
            "users_on_this_page": 50,
            "processing_errors": 0,
            "search_filter": "kadircagtas_at_gmail.com"
        },
        "users": [
            {
                "user": "kadircagtas_at_gmail.com",
                "user_display": "kadircagtas@gmail.com",
                "screenshots_count": 120,
                "active_days": 3,
                "daily_data": [...],
                "avg_screenshots_per_day": 40.0,
                "matching_folders": [...]
            }
        ],
        "generated_at": "2025-09-13T22:57:00",
        "s3_bucket": "ddsfocustime",
        "processing_time_optimized": true
    }
}
```

## Example Usage

### Get all users for August 2025
```bash
curl "http://127.0.0.1:8004/api/users/monthly-screenshots/?2025-08-01/2025-08-31&page=1"
```

### Search for specific user
```bash
curl "http://127.0.0.1:8004/api/users/monthly-screenshots/?2025-08-01/2025-08-31&user=kadircagtas_at_gmail.com&page=1"
```

### Navigate to next page
```bash
curl "http://127.0.0.1:8004/api/users/monthly-screenshots/?2025-08-01/2025-08-31&page=2"
```

## Performance Characteristics

- **Response Time**: Typically 2-10 seconds depending on data volume
- **Concurrent Processing**: Up to 20 threads for user data processing
- **Memory Optimization**: Paginated S3 operations to prevent memory issues
- **Error Handling**: Graceful handling of S3 timeouts and user processing errors

## Error Responses

### Invalid Date Range
```json
{
    "status": "error",
    "message": "Date range must be within the same month"
}
```

### Invalid Month
```json
{
    "status": "error",
    "message": "Month must be between 1 and 12"
}
```

### Invalid Page
```json
{
    "status": "error",
    "message": "Page must be 1 or greater"
}
```

## Technical Implementation

### S3 Structure Support
The API works with the actual S3 folder structure:
```
screenshots/
├── user1_at_domain.com/
│   ├── _DDS_Ağustos_2025_Sanal_Asistanlik_Süreci/
│   ├── _DDS_Haziran_2025_Meeting_Notes/
│   └── ...
└── user2_at_domain.com/
    └── ...
```

### Turkish Month Mapping
```python
turkish_months = {
    1: 'Ocak', 2: 'Şubat', 3: 'Mart', 4: 'Nisan', 
    5: 'Mayıs', 6: 'Haziran', 7: 'Temmuz', 8: 'Ağustos', 
    9: 'Eylül', 10: 'Ekim', 11: 'Kasım', 12: 'Aralık'
}
```

### File Location
- **Main API**: `apps/users/user_monthly_api.py`
- **URL Configuration**: `apps/users/urls.py`
- **Main URL Include**: `config/urls.py`

## Security
- Uses `AllowAny` permission class (can be configured based on requirements)
- Environment variables for AWS credentials
- Input validation for all parameters
- Error handling to prevent information leakage
