# Screenshots Search API Documentation

## Overview

The Screenshots Search API has been separated into a dedicated module that supports three main search patterns. Each pattern is optimized for different use cases and provides different levels of data access.

## File Structure

```
dashboard/
├── screenshots_search_api.py       # Main API implementation
├── screenshots_search_urls.py      # URL routing for search APIs
├── api_urls.py                     # Updated to include new search module
└── api_views.py                    # Original file (screenshots search moved out)
```

## API Endpoints

### 1. Unified Search Endpoint (Auto-Detection)
**URL:** `/api/screenshots/search/`  
**Method:** GET  
**Description:** Automatically detects which search pattern to use based on parameters

### 2. Pattern-Specific Endpoints

#### Pattern 1: Quick Name Search
**URL:** `/api/screenshots/quick-search/`  
**Method:** GET  
**Description:** Fast search by name/email with basic filtering

#### Pattern 2: Name + Date Filter  
**URL:** `/api/screenshots/date-search/`  
**Method:** GET  
**Description:** Search by name with specific date filtering

#### Pattern 3: Name + ALL Screenshots (S3 Comprehensive)
**URL:** `/api/screenshots/comprehensive-search/`  
**Method:** GET  
**Description:** Comprehensive S3 scan for all screenshots

## Search Patterns

### Pattern 1: Quick Name Search
```bash
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&limit=100"
```

**Parameters:**
- `search` (required): Name, email, or username to search for
- `limit` (optional): Number of screenshots per employee (default: 100, max: 1000)
- `page` (optional): Page number for pagination (default: 1)

**Use Case:** Fast lookup of screenshots for a specific user  
**Performance:** ⚡ Fast (searches database first, limited S3 access)  
**Data Scope:** Recent/cached screenshots  

**Response Example:**
```json
{
    "success": true,
    "message": "Found 1 employees with 85 screenshots matching 'Haseeb'",
    "data": {
        "search_pattern": "quick_name_search",
        "employees": [
            {
                "staff_id": "HAS001",
                "name": "Haseeb Code Journey",
                "email": "haseebcodejourney@gmail.com",
                "profile_image": "/media/profile.jpg",
                "total_screenshots": 150,
                "screenshots_shown": 85,
                "screenshots": [...],
                "source": "Quick_Search"
            }
        ],
        "summary": {
            "total_employees_found": 1,
            "total_screenshots": 85,
            "search_query": "Haseeb",
            "limit_per_employee": 100
        }
    }
}
```

### Pattern 2: Name + Date Filter
```bash
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&date=2025-06-10&limit=100"
```

**Parameters:**
- `search` (required): Name, email, or username to search for
- `date` (required): Specific date in YYYY-MM-DD format
- `limit` (optional): Number of screenshots per employee (default: 100, max: 1000)

**Use Case:** Find screenshots from a specific date  
**Performance:** ⚡ Fast (targeted S3 folder access)  
**Data Scope:** Specific date only  

**Response Example:**
```json
{
    "success": true,
    "message": "Found 1 employees with 23 screenshots matching 'Haseeb' on 2025-06-10",
    "data": {
        "search_pattern": "name_date_filter",
        "employees": [...],
        "summary": {
            "total_employees_found": 1,
            "total_screenshots": 23,
            "search_query": "Haseeb",
            "date_filter": "2025-06-10",
            "limit_per_employee": 100
        }
    }
}
```

### Pattern 3: Name + ALL Screenshots (S3 Comprehensive)
```bash
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&scan_s3=true&limit=5000"
```

**Parameters:**
- `search` (required): Name, email, or username to search for
- `scan_s3` (required): Must be `true` to enable S3 comprehensive scan
- `limit` (optional): Number of screenshots per employee (default: 5000, max: 10000)

**Use Case:** Complete historical data analysis, bulk exports  
**Performance:** 🐌 Slower (full S3 bucket scan)  
**Data Scope:** All available screenshots across all dates  

**Response Example:**
```json
{
    "success": true,
    "message": "S3 Comprehensive Scan: Found 1 employees with 3247 screenshots matching 'Haseeb'",
    "data": {
        "search_pattern": "name_all_screenshots",
        "employees": [...],
        "summary": {
            "total_employees_found": 1,
            "total_screenshots": 3247,
            "search_query": "Haseeb",
            "s3_scan_enabled": true,
            "limit_per_employee": 5000,
            "max_limit_available": 10000
        },
        "s3_scan_info": {
            "total_s3_employees": 45,
            "matching_employees": 1,
            "processed_employees": 1
        }
    }
}
```

## Response Format

All APIs return a standardized response format:

```json
{
    "success": boolean,
    "message": "Description of the result",
    "data": {
        "search_pattern": "pattern_name",
        "employees": [...],
        "summary": {...},
        "metadata": {...}
    },
    "timestamp": "ISO datetime"
}
```

### Employee Object Structure
```json
{
    "staff_id": "HAS001",
    "name": "Haseeb Code Journey", 
    "email": "haseebcodejourney@gmail.com",
    "profile_image": "/media/profile.jpg",
    "total_screenshots": 150,
    "screenshots_shown": 100,
    "screenshots": [
        {
            "url": "https://s3.amazonaws.com/...",
            "filename": "screenshot_001.png",
            "last_modified": "2025-01-15T10:30:00Z",
            "size": 1024000,
            "date_folder": "2025-01-15",
            "s3_key": "user/2025-01-15/screenshot_001.png"
        }
    ],
    "source": "Quick_Search|Date_Filtered_Search|S3_Comprehensive_Scan"
}
```

## Performance Comparison

| Pattern | Speed | Data Scope | Use Case | Max Limit |
|---------|-------|------------|----------|-----------|
| Pattern 1 | ⚡ Fast | Recent/Cached | Quick lookup | 1,000 |
| Pattern 2 | ⚡ Fast | Specific date | Daily reports | 1,000 |
| Pattern 3 | 🐌 Slower | All historical | Complete analysis | 10,000 |

## Error Handling

### Common Error Responses

**Missing Search Parameter:**
```json
{
    "success": false,
    "message": "Search parameter is required",
    "data": {},
    "timestamp": "2025-01-15T10:30:00"
}
```

**Invalid Date Format:**
```json
{
    "success": false,
    "message": "Date must be in YYYY-MM-DD format",
    "data": {},
    "timestamp": "2025-01-15T10:30:00"
}
```

**S3 Access Error:**
```json
{
    "success": false,
    "message": "Error accessing S3 data",
    "data": {},
    "timestamp": "2025-01-15T10:30:00"
}
```

## Auto-Detection Logic

The unified endpoint `/api/screenshots/search/` automatically detects which pattern to use:

1. **If `scan_s3=true`** → Pattern 3 (Comprehensive S3 scan)
2. **If `date` parameter exists** → Pattern 2 (Name + Date filter)  
3. **If only `search` parameter** → Pattern 1 (Quick name search)
4. **If no parameters** → Returns pattern examples

## Testing

Use the provided test file to verify all patterns:

```bash
python test_screenshots_search_patterns.py
```

Or test manually with curl:

```bash
# Pattern 1: Quick Search
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&limit=100"

# Pattern 2: Date Filter
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&date=2025-06-10&limit=100"

# Pattern 3: S3 Comprehensive
curl "http://127.0.0.1:8000/api/screenshots/search/?search=Haseeb&scan_s3=true&limit=5000"
```

## Best Practices

1. **Use Pattern 1** for real-time user interfaces and quick lookups
2. **Use Pattern 2** for daily reports and specific date analysis
3. **Use Pattern 3** for data exports, analytics, and comprehensive reporting
4. **Always include pagination** for large result sets
5. **Set appropriate limits** based on your use case
6. **Handle errors gracefully** in your frontend applications

## Migration Notes

- The original `/api/screenshots/search/` endpoint is maintained for backward compatibility
- New dedicated endpoints provide clearer separation of concerns
- All existing API calls will continue to work without changes
- Consider migrating to pattern-specific endpoints for better performance optimization
