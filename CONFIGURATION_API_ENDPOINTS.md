# Configuration Settings API Endpoints Documentation

## Base URL
```
http://127.0.0.1:8000/api/
```

## Configuration API Endpoints

### 1. GET All Configurations
**Endpoint:** `GET /api/configurations/`
**Description:** Retrieve all configuration settings from the database
**Authentication:** Required (temporarily disabled for testing)

**Response Format:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Default Upload Settings",
            "type": "upload",
            "description": "Default configuration for file uploads including size limits, file types, and image processing settings",
            "config_data": {
                "max_file_size": "10MB",
                "allowed_file_types": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
                "upload_path": "/uploads/",
                "auto_resize_images": true,
                "max_image_width": 1920,
                "max_image_height": 1080,
                "compression_quality": 85,
                "virus_scan_enabled": true,
                "overwrite_existing": false,
                "create_thumbnails": true,
                "thumbnail_sizes": [
                    {"width": 150, "height": 150, "suffix": "_thumb"},
                    {"width": 300, "height": 300, "suffix": "_medium"}
                ]
            },
            "created_at": "2025-07-18T16:39:31.123456",
            "updated_at": "2025-07-18T16:39:31.123456"
        }
    ]
}
```

### 2. GET Specific Configuration by ID
**Endpoint:** `GET /api/configurations/{id}/`
**Description:** Retrieve a specific configuration by its ID
**Parameters:**
- `id` (integer): Configuration ID

**Example:** `GET /api/configurations/1/`

**Response Format:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Default Upload Settings",
        "type": "upload",
        "description": "Default configuration for file uploads",
        "config_data": { /* configuration object */ },
        "created_at": "2025-07-18T16:39:31.123456",
        "updated_at": "2025-07-18T16:39:31.123456"
    }
}
```

### 3. GET Configurations by Type
**Endpoint:** `GET /api/configurations/type/{config_type}/`
**Description:** Retrieve all configurations of a specific type
**Parameters:**
- `config_type` (string): One of "upload", "database", "aws"

**Examples:**
- `GET /api/configurations/type/upload/`
- `GET /api/configurations/type/database/`
- `GET /api/configurations/type/aws/`

**Response Format:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Default Upload Settings",
            "type": "upload",
            "description": "Default upload configuration",
            "config_data": { /* configuration object */ },
            "created_at": "2025-07-18T16:39:31.123456",
            "updated_at": "2025-07-18T16:39:31.123456"
        },
        {
            "id": 4,
            "name": "Development Upload Settings",
            "type": "upload",
            "description": "Development environment upload configuration",
            "config_data": { /* configuration object */ },
            "created_at": "2025-07-18T16:39:31.123456",
            "updated_at": "2025-07-18T16:39:31.123456"
        }
    ]
}
```

### 4. GET Configuration by Name
**Endpoint:** `GET /api/configurations/name/{config_name}/`
**Description:** Retrieve a specific configuration by its name
**Parameters:**
- `config_name` (string): Configuration name (URL encoded)

**Example:** `GET /api/configurations/name/Default%20Upload%20Settings/`

**Response Format:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Default Upload Settings",
        "type": "upload",
        "description": "Default upload configuration",
        "config_data": { /* configuration object */ },
        "created_at": "2025-07-18T16:39:31.123456",
        "updated_at": "2025-07-18T16:39:31.123456"
    }
}
```

### 5. POST Create New Configuration
**Endpoint:** `POST /api/configurations/`
**Description:** Create a new configuration setting
**Content-Type:** `application/json`

**Request Body:**
```json
{
    "name": "My Custom Upload Config",
    "type": "upload",
    "description": "Custom upload configuration for my application",
    "config_data": {
        "max_file_size": "5MB",
        "allowed_file_types": ["jpg", "png"],
        "upload_path": "/custom/uploads/"
    }
}
```

**Response Format:**
```json
{
    "success": true,
    "message": "Configuration created successfully",
    "data": {
        "id": 7,
        "name": "My Custom Upload Config",
        "type": "upload",
        "description": "Custom upload configuration for my application",
        "config_data": {
            "max_file_size": "5MB",
            "allowed_file_types": ["jpg", "png"],
            "upload_path": "/custom/uploads/"
        }
    }
}
```

### 6. PUT Update Configuration
**Endpoint:** `PUT /api/configurations/{id}/`
**Description:** Update an existing configuration
**Parameters:**
- `id` (integer): Configuration ID to update
**Content-Type:** `application/json`

**Request Body (partial update supported):**
```json
{
    "name": "Updated Upload Config",
    "config_data": {
        "max_file_size": "15MB",
        "allowed_file_types": ["jpg", "png", "gif", "webp"]
    }
}
```

**Response Format:**
```json
{
    "success": true,
    "message": "Configuration updated successfully",
    "data": {
        "id": 1,
        "name": "Updated Upload Config",
        "type": "upload",
        "description": "Default configuration for file uploads",
        "config_data": {
            "max_file_size": "15MB",
            "allowed_file_types": ["jpg", "png", "gif", "webp"],
            "upload_path": "/uploads/"
        }
    }
}
```

### 7. DELETE Configuration
**Endpoint:** `DELETE /api/configurations/{id}/`
**Description:** Delete a configuration
**Parameters:**
- `id` (integer): Configuration ID to delete

**Response Format:**
```json
{
    "success": true,
    "message": "Configuration deleted successfully"
}
```

## Error Responses

### Configuration Not Found (404)
```json
{
    "success": false,
    "message": "Configuration not found"
}
```

### Invalid Configuration Type (400)
```json
{
    "success": false,
    "message": "Invalid type. Must be one of: upload, database, aws"
}
```

### Missing Configuration ID (400)
```json
{
    "success": false,
    "message": "Configuration ID required"
}
```

### Server Error (500)
```json
{
    "success": false,
    "message": "Error: [specific error message]"
}
```

## Sample Configuration Data Types

### Upload Configuration Example
```json
{
    "max_file_size": "10MB",
    "allowed_file_types": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
    "upload_path": "/uploads/",
    "auto_resize_images": true,
    "max_image_width": 1920,
    "max_image_height": 1080,
    "compression_quality": 85,
    "virus_scan_enabled": true,
    "overwrite_existing": false,
    "create_thumbnails": true,
    "thumbnail_sizes": [
        {"width": 150, "height": 150, "suffix": "_thumb"},
        {"width": 300, "height": 300, "suffix": "_medium"}
    ]
}
```

### Database Configuration Example
```json
{
    "connection_pool_size": 20,
    "connection_timeout": 30,
    "query_timeout": 60,
    "retry_attempts": 3,
    "backup_enabled": true,
    "backup_schedule": "daily",
    "backup_retention_days": 30,
    "encryption_enabled": true,
    "ssl_required": true,
    "maintenance_window": {
        "day": "Sunday",
        "start_time": "02:00",
        "duration_hours": 2
    },
    "performance_monitoring": {
        "slow_query_threshold": 5000,
        "log_slow_queries": true,
        "performance_insights": true
    }
}
```

### AWS Configuration Example
```json
{
    "region": "us-east-1",
    "s3_bucket_name": "dxd-screenshots-bucket",
    "s3_storage_class": "STANDARD",
    "s3_encryption": "AES256",
    "s3_versioning_enabled": true,
    "s3_lifecycle_rules": {
        "transition_to_ia": 30,
        "transition_to_glacier": 90,
        "delete_after": 2555
    },
    "cloudfront_enabled": true,
    "cloudfront_distribution_id": "E1234EXAMPLE",
    "lambda_functions": {
        "image_processing": "arn:aws:lambda:us-east-1:123456789012:function:image-processor"
    },
    "monitoring": {
        "cloudwatch_enabled": true,
        "sns_notifications": true
    }
}
```

## Testing Examples (PowerShell)

### GET All Configurations
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/configurations/" | Select-Object -ExpandProperty Content
```

### GET Upload Configurations
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/configurations/type/upload/" | Select-Object -ExpandProperty Content
```

### POST Create Configuration
```powershell
$body = @{
    name = "Test Config"
    type = "upload"
    description = "Test configuration"
    config_data = @{
        max_file_size = "5MB"
        allowed_file_types = @("jpg", "png")
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/configurations/" -Method POST -Body $body -ContentType "application/json"
```

### PUT Update Configuration
```powershell
$body = @{
    name = "Updated Test Config"
    config_data = @{
        max_file_size = "10MB"
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/configurations/1/" -Method PUT -Body $body -ContentType "application/json"
```

### DELETE Configuration
```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/configurations/1/" -Method DELETE
```

## Current Database Contents
Based on the sample data created, you now have:
- 2 Upload Configurations (Default + Development)
- 2 Database Configurations (Production + Test)  
- 2 AWS Configurations (Production + Development)
- Total: 6 configurations ready for testing

## Authentication Note
Currently, these endpoints require authentication. For testing purposes, you can:
1. Use the existing login system to authenticate first
2. Temporarily disable authentication middleware for these specific endpoints
3. Use tools like Postman with authentication headers
