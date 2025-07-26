# Dashboard Analytics APIs Documentation

This document describes the new Dashboard Analytics APIs created for the admin dashboard metrics.

## Overview

These APIs provide key metrics for the admin dashboard based on the requirements:

1. **Total Employees** - Count from S3 bucket employee folders
2. **Total Projects** - Get from CRM API
3. **Completed Projects** - Get from CRM API  
4. **Total Tasks** - Get from CRM API
5. **Dashboard Summary** - All metrics in one API call

## API Endpoints

### Base URL
```
http://localhost:8000/api/dashboard/analytics/
```

### 1. Total Employees API

**Endpoint:** `GET /api/dashboard/analytics/employees/`

**Description:** Counts the total number of employees by analyzing S3 bucket folders.

**Response:**
```json
{
  "success": true,
  "message": "Total employees retrieved successfully",
  "data": {
    "total_employees": 313,
    "growth_percentage": 10.5,
    "last_updated": "2025-01-25T10:30:00.000Z",
    "source": "S3 Bucket Analysis"
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

**Query Parameters:**
- `include_list=true` - Include list of employee folder names

### 2. Total Projects API

**Endpoint:** `GET /api/dashboard/analytics/projects/`

**Description:** Gets total project count from CRM API.

**Response:**
```json
{
  "success": true,
  "message": "Total projects retrieved successfully",
  "data": {
    "total_projects": 313,
    "growth_percentage": 5.15,
    "last_updated": "2025-01-25T10:30:00.000Z",
    "source": "CRM API",
    "crm_response_status": 200
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

### 3. Completed Projects API

**Endpoint:** `GET /api/dashboard/analytics/completed-projects/`

**Description:** Gets completed project count from CRM API.

**Response:**
```json
{
  "success": true,
  "message": "Completed projects retrieved successfully",
  "data": {
    "completed_projects": 150,
    "growth_percentage": -5.5,
    "last_updated": "2025-01-25T10:30:00.000Z",
    "source": "CRM API",
    "crm_response_status": 200
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

### 4. Total Tasks API

**Endpoint:** `GET /api/dashboard/analytics/tasks/`

**Description:** Gets total task count and breakdown from CRM API.

**Response:**
```json
{
  "success": true,
  "message": "Total tasks retrieved successfully",
  "data": {
    "total_tasks": 1250,
    "task_breakdown": {
      "pending": 320,
      "in_progress": 180,
      "completed": 750
    },
    "last_updated": "2025-01-25T10:30:00.000Z",
    "source": "CRM API",
    "crm_response_status": 200
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

### 5. Dashboard Summary API

**Endpoint:** `GET /api/dashboard/analytics/summary/`

**Description:** Gets all dashboard metrics in a single API call for efficiency.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "summary": {
      "total_employees": {
        "count": 313,
        "growth_percentage": 10.5,
        "source": "S3 Bucket"
      },
      "total_projects": {
        "count": 313,
        "growth_percentage": 5.15,
        "source": "CRM API"
      },
      "completed_projects": {
        "count": 150,
        "growth_percentage": -5.5,
        "source": "CRM API"
      },
      "total_tasks": {
        "count": 1250,
        "breakdown": {
          "pending": 320,
          "in_progress": 180,
          "completed": 750
        },
        "source": "CRM API"
      }
    },
    "errors": [],
    "last_updated": "2025-01-25T10:30:00.000Z"
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

## Configuration

### CRM API Settings

The APIs require CRM configuration in the database. Add a `ConfigurationSettings` record:

```python
# Example configuration
{
    "config_type": "crm_api",
    "config_name": "CRM API Settings",
    "config_value": {
        "base_url": "https://api.your-crm.com",
        "api_key": "your_api_key_here",
        "endpoints": {
            "projects": "/api/v1/projects",
            "completed_projects": "/api/v1/projects?status=completed",
            "tasks": "/api/v1/tasks"
        }
    }
}
```

### Environment Variables

Alternative configuration via environment variables:

```env
CRM_BASE_URL=https://api.your-crm.com
CRM_API_KEY=your_api_key_here
AWS_STORAGE_BUCKET_NAME=dds-focus-time
```

## Error Handling

### Common Error Responses

**S3 Connection Error:**
```json
{
  "success": false,
  "message": "S3 client not available",
  "data": {},
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

**CRM API Error:**
```json
{
  "success": false,
  "message": "CRM API error: 401",
  "data": {
    "crm_status_code": 401,
    "crm_error": "Unauthorized"
  },
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

**Configuration Error:**
```json
{
  "success": false,
  "message": "CRM settings not configured",
  "data": {},
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

## Testing

### Using the Test Script

Run the included test script:

```bash
cd /path/to/dxdfocurpropanel
python test_dashboard_analytics_apis.py
```

### Manual Testing with curl

```bash
# Test total employees
curl -X GET "http://localhost:8000/api/dashboard/analytics/employees/"

# Test total projects
curl -X GET "http://localhost:8000/api/dashboard/analytics/projects/"

# Test completed projects
curl -X GET "http://localhost:8000/api/dashboard/analytics/completed-projects/"

# Test total tasks
curl -X GET "http://localhost:8000/api/dashboard/analytics/tasks/"

# Test dashboard summary
curl -X GET "http://localhost:8000/api/dashboard/analytics/summary/"
```

### Frontend Integration Example

```javascript
// Fetch dashboard metrics
async function fetchDashboardMetrics() {
    try {
        const response = await fetch('/api/dashboard/analytics/summary/');
        const data = await response.json();
        
        if (data.success) {
            const summary = data.data.summary;
            
            // Update UI with metrics
            document.getElementById('total-employees').textContent = summary.total_employees.count;
            document.getElementById('total-projects').textContent = summary.total_projects.count;
            document.getElementById('completed-projects').textContent = summary.completed_projects.count;
            document.getElementById('total-tasks').textContent = summary.total_tasks.count;
            
            // Update growth indicators
            updateGrowthIndicator('employees-growth', summary.total_employees.growth_percentage);
            updateGrowthIndicator('projects-growth', summary.total_projects.growth_percentage);
            updateGrowthIndicator('completed-growth', summary.completed_projects.growth_percentage);
        }
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
    }
}

function updateGrowthIndicator(elementId, percentage) {
    const element = document.getElementById(elementId);
    element.textContent = `${percentage > 0 ? '+' : ''}${percentage}%`;
    element.className = percentage > 0 ? 'growth-positive' : 'growth-negative';
}

// Call on page load
fetchDashboardMetrics();
```

## Performance Considerations

1. **Caching**: Consider implementing Redis caching for frequently accessed metrics
2. **Timeouts**: CRM API calls have 30-second timeouts
3. **Pagination**: S3 listing uses pagination to handle large datasets
4. **Error Handling**: Graceful degradation when services are unavailable
5. **Summary API**: Use the summary endpoint to reduce multiple API calls

## Security

1. **Authentication**: Currently no authentication required - add as needed
2. **Rate Limiting**: Consider implementing rate limiting for production
3. **API Keys**: Store CRM API keys securely in configuration
4. **CORS**: Configure CORS settings for frontend access

## File Structure

```
dashboard/
├── dashboard_analytics_apis.py    # Main API implementations
├── api_urls.py                   # URL routing (updated)
├── models.py                     # Database models
└── aws_utils.py                  # S3 utilities
```

## Next Steps

1. **Configure CRM API settings** in the database
2. **Test the APIs** using the provided test script
3. **Integrate with frontend** dashboard
4. **Add authentication** if required
5. **Implement caching** for better performance
6. **Monitor API performance** and errors
