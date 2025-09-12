# S3 User Logs API Documentation

## Overview
The S3 User Logs API provides endpoints to retrieve and analyze user activity logs stored in Amazon S3. This API allows you to fetch logs, get log content, generate activity summaries, and analyze log statistics.

## Base URL
```
https://dxdtime.ddsolutions.io/api/
```

## Authentication
Currently, these endpoints do not require authentication. If needed, you can enable authentication by modifying the view classes.

---

## API Endpoints

### 1. Get User Logs
**GET** `/user-logs/`

Retrieve user logs from S3 with filtering options.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `user_email` | string | Filter by specific user email | None |
| `log_type` | string | Filter by log type (activity, timer, error, etc.) | None |
| `start_date` | string | Start date filter (YYYY-MM-DD) | None |
| `end_date` | string | End date filter (YYYY-MM-DD) | None |
| `limit` | integer | Maximum number of log files to return | 100 |
| `search` | string | Search term for filtering logs | None |

#### Example Request
```bash
GET /user-logs/?user_email=john@example.com&start_date=2024-09-01&end_date=2024-09-12&limit=50
```

#### Example Response
```json
{
  "status": "success",
  "message": "Retrieved 25 log files",
  "data": {
    "logs": [
      {
        "key": "logs/user_logs/2024/09/11/john@example.com/activity.log",
        "filename": "activity.log",
        "size_bytes": 2048,
        "size_mb": 0.002,
        "last_modified": "2024-09-11T14:30:00Z",
        "file_extension": "log",
        "user_email": "john@example.com",
        "year": "2024",
        "month": "09",
        "day": "11",
        "download_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/logs/..."
      }
    ],
    "total_count": 25,
    "filters_applied": {
      "user_email": "john@example.com",
      "start_date": "2024-09-01",
      "end_date": "2024-09-12",
      "limit": 50
    },
    "retrieved_at": "2024-09-12T10:15:30Z"
  }
}
```

---

### 2. Get Log Content
**GET** `/user-logs/content/<log_key>/`

Download and return the content of a specific log file.

#### URL Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `log_key` | string | The S3 key of the log file (URL encoded) |

#### Example Request
```bash
GET /user-logs/content/logs%2Fuser_logs%2F2024%2F09%2F11%2Fjohn@example.com%2Factivity.log/
```

#### Example Response
```json
{
  "status": "success",
  "message": "Retrieved content for log file: logs/user_logs/2024/09/11/john@example.com/activity.log",
  "data": {
    "key": "logs/user_logs/2024/09/11/john@example.com/activity.log",
    "content_type": "text",
    "raw_content": "2024-09-11 14:30:00 - User logged in\n2024-09-11 14:31:00 - Started timer...",
    "parsed_content": null,
    "size_bytes": 2048,
    "last_modified": "2024-09-11T14:30:00Z"
  }
}
```

---

### 3. Get User Activity Summary
**GET** `/user-logs/summary/`

Get activity summary for a specific user over a specified time period.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `user_email` | string | User email (required) | None |
| `days` | integer | Number of days to look back | 7 |

#### Example Request
```bash
GET /user-logs/summary/?user_email=john@example.com&days=14
```

#### Example Response
```json
{
  "status": "success",
  "message": "Retrieved activity summary for john@example.com",
  "data": {
    "user_email": "john@example.com",
    "period_days": 14,
    "start_date": "2024-08-29",
    "end_date": "2024-09-12",
    "total_log_files": 42,
    "log_types": {
      "log": 25,
      "json": 12,
      "csv": 5
    },
    "daily_activity": {
      "2024-09-11": {
        "files": 8,
        "size_mb": 0.156
      },
      "2024-09-10": {
        "files": 6,
        "size_mb": 0.089
      }
    },
    "total_size_mb": 2.456
  }
}
```

---

### 4. Get Log Types
**GET** `/user-logs/types/`

Get available log types and basic statistics.

#### Example Request
```bash
GET /user-logs/types/
```

#### Example Response
```json
{
  "status": "success",
  "message": "Analyzed 500 log files",
  "data": {
    "log_types": {
      "activity_logs": 150,
      "timer_logs": 200,
      "error_logs": 50,
      "user_logs": 100
    },
    "file_extensions": {
      "log": 300,
      "json": 150,
      "csv": 30,
      "txt": 20
    },
    "total_users": 25,
    "users": ["john@example.com", "jane@example.com", "..."],
    "sample_size": 500,
    "analysis_date": "2024-09-12T10:15:30Z"
  }
}
```

---

### 5. Get Logs Statistics
**GET** `/user-logs/statistics/`

Get comprehensive statistics about user logs in S3.

#### Query Parameters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `detailed` | boolean | Include detailed breakdown | false |

#### Example Request
```bash
GET /user-logs/statistics/?detailed=true
```

#### Example Response
```json
{
  "status": "success",
  "message": "Generated statistics for 1000 log files",
  "data": {
    "statistics": {
      "total_log_files": 1000,
      "total_size_mb": 45.67,
      "file_types": {
        "log": 600,
        "json": 300,
        "csv": 100
      },
      "unique_users": 50,
      "users_list": ["user1@example.com", "user2@example.com"],
      "date_range": {
        "earliest": "2024-08-01T00:00:00Z",
        "latest": "2024-09-12T14:30:00Z"
      },
      "size_distribution": {
        "small_files_under_1mb": 800,
        "medium_files_1_10mb": 180,
        "large_files_over_10mb": 20
      },
      "daily_counts": {
        "2024-09-11": 45,
        "2024-09-10": 38,
        "2024-09-09": 42
      }
    },
    "generated_at": "2024-09-12T10:15:30Z",
    "sample_size": 1000
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (missing required parameters)
- `404` - Not Found (log file or user not found)
- `500` - Internal Server Error

---

## Usage Examples

### Get logs for a specific user in the last 7 days
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/user-logs/?user_email=john@example.com&days=7"
```

### Search for error logs
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/user-logs/?log_type=error&limit=20"
```

### Get activity summary for a user
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/user-logs/summary/?user_email=john@example.com&days=30"
```

### Download specific log file content
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/user-logs/content/logs%2Factivity%2F2024-09-11.log/"
```

### Get overall statistics
```bash
curl -X GET "https://dxdtime.ddsolutions.io/api/user-logs/statistics/?detailed=true"
```

---

## Notes

1. **S3 Storage Structure**: The API assumes logs are stored in S3 with a structure like:
   - `logs/user_logs/YYYY/MM/DD/user@email.com/filename.log`
   - `logs/activity_logs/user@email.com/YYYY-MM-DD.json`
   - `logs/timer_logs/YYYY-MM-DD/user@email.com/data.csv`

2. **Signed URLs**: All log files include signed URLs for secure downloading that expire in 1 hour.

3. **Performance**: The API is optimized for performance with configurable limits and pagination.

4. **File Formats**: Supports various log formats including `.log`, `.json`, `.csv`, and `.txt` files.

5. **Date Filtering**: Flexible date filtering supports both S3 path-based dates and file modification dates.
