# Employee Task Folders API Documentation (Level 2)

## Overview

The Employee Task Folders API provides detailed folder information for a specific employee's screenshots stored in AWS S3. This is Level 2 of the employee management system, allowing users to drill down into a selected employee's task organization.

## 🚀 API Endpoint

```
GET /api/screenshots/employee/{employee_email}/folders/
```

## 📋 Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `employee_email` | string | Yes | Employee's email address (URL parameter) |

## 📤 Request Examples

### Get Task Folders for Employee
```
GET /api/screenshots/employee/haseepcodejourney@gmail.com/folders/
```

### URL Encoding for Special Characters
```
GET /api/screenshots/employee/user%40company.com/folders/
```

## 📥 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Found 5 task folders for haseepcodejourney@gmail.com",
  "data": {
    "employee_email": "haseepcodejourney@gmail.com",
    "task_folders": [
      {
        "folder_name": "2025-01-15",
        "folder_path": "screenshots/haseepcodejourney_at_gmail_com/2025-01-15/",
        "is_date_folder": true,
        "date": "2025-01-15T00:00:00",
        "display_name": "Tuesday, January 15, 2025",
        "screenshot_count": 45,
        "total_size_mb": 12.5,
        "last_modified": "2025-01-15T18:30:00.000Z",
        "has_recent_activity": true,
        "file_types": ["png", "jpg"],
        "first_screenshot": "screenshot_001.png",
        "last_screenshot": "screenshot_045.png"
      }
    ],
    "direct_files": [
      {
        "file_name": "profile_image.png",
        "size_mb": 0.5,
        "last_modified": "2025-01-10T12:00:00.000Z"
      }
    ],
    "summary": {
      "total_folders": 5,
      "total_screenshots": 234,
      "total_size_mb": 89.7,
      "active_folders": 3,
      "date_range": {
        "start": "2025-01-01T00:00:00",
        "end": "2025-01-15T00:00:00"
      },
      "has_direct_files": true
    },
    "folder_types": {
      "date_folders": 4,
      "task_folders": 1
    }
  },
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": {},
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

## 🔍 Response Fields Explanation

### Top Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the request was successful |
| `message` | string | Human-readable status message |
| `data` | object | Response data (only present if successful) |
| `timestamp` | string | ISO timestamp of the response |

### Data Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `employee_email` | string | Email of the employee |
| `task_folders` | array | Array of task folder objects |
| `direct_files` | array | Files not in subfolders |
| `summary` | object | Summary statistics |
| `folder_types` | object | Breakdown by folder type |

### Task Folder Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `folder_name` | string | Raw folder name (e.g., "2025-01-15") |
| `folder_path` | string | Full S3 path to the folder |
| `is_date_folder` | boolean | Whether this is a date-based folder |
| `date` | string\|null | ISO date if it's a date folder |
| `display_name` | string | Formatted name for display |
| `screenshot_count` | integer | Number of screenshots in folder |
| `total_size_mb` | number | Total size in megabytes |
| `last_modified` | string\|null | Last modification timestamp |
| `has_recent_activity` | boolean | Activity in last 7 days |
| `file_types` | array | Array of file extensions found |
| `first_screenshot` | string\|null | Name of first screenshot |
| `last_screenshot` | string\|null | Name of latest screenshot |

### Summary Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_folders` | integer | Total number of folders |
| `total_screenshots` | integer | Total screenshots across all folders |
| `total_size_mb` | number | Total size in megabytes |
| `active_folders` | integer | Folders with recent activity |
| `date_range` | object | Date range of folders |
| `has_direct_files` | boolean | Whether direct files exist |

### Folder Types Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `date_folders` | integer | Number of date-based folders |
| `task_folders` | integer | Number of task-based folders |

## ⚡ Features

### 📁 Folder Analysis
- **Date vs Task Folders**: Distinguishes between date-based and task-based organization
- **Activity Detection**: Identifies folders with recent activity (last 7 days)
- **File Type Analysis**: Categorizes files by extension
- **Size Calculations**: Provides storage usage statistics

### 📊 S3 Integration
- **Real-time Data**: Fetches live data from AWS S3
- **Folder Statistics**: Detailed metrics for each folder
- **File Metadata**: Last modified dates and file information
- **Hierarchical Structure**: Handles nested folder organization

### 🎯 Data Organization
- **Smart Sorting**: Folders sorted by activity and date
- **Display Formatting**: Human-readable folder names
- **Direct Files**: Handles files not in subfolders
- **Comprehensive Statistics**: Summary data across all folders

## 🔧 Technical Implementation

### S3 Folder Structure Expected
```
s3-bucket/
└── screenshots/
    └── {email_prefix}/          # email with @ → _at_ and . → _
        ├── 2025-01-01/         # Date folders
        ├── 2025-01-02/
        ├── project_alpha/      # Task folders
        ├── meeting_notes/
        └── direct_file.png     # Direct files
```

### Email Format Conversion
- `user@company.com` → `user_at_company_com`
- Special characters are replaced for S3 compatibility

### Performance Optimizations
- **Efficient S3 Queries**: Uses list_objects_v2 with prefixes
- **Parallel Processing**: Folder statistics calculated concurrently
- **Result Caching**: S3 responses cached where possible
- **Pagination Support**: Handles large folder structures

## 🧪 Testing

### Test Scripts Provided

1. **Python Test Script**: `test_employee_folders_api.py`
   ```bash
   python test_employee_folders_api.py
   ```

2. **HTML Demo Page**: `employee_task_folders_demo.html`
   - Interactive interface for testing
   - Visual folder representation
   - Real-time statistics
   - Employee selection with quick buttons

### Test Cases Covered
- ✅ Valid employee with folders
- ✅ Valid employee without folders
- ✅ Non-existent employee
- ✅ Invalid email format
- ✅ Empty email parameter
- ✅ Response format validation
- ✅ Performance testing
- ✅ S3 error handling

## 🚨 Error Handling

### Common Errors

| Status Code | Error | Description | Solution |
|-------------|--------|-------------|----------|
| 400 | Invalid email format | Email parameter is malformed | Provide valid email format |
| 404 | Employee not found | No data for specified employee | Verify employee exists |
| 500 | S3 configuration error | AWS S3 access issues | Check S3 credentials |
| 500 | Internal server error | Unexpected server error | Check logs |

### Error Response Examples

#### Invalid Email Format
```json
{
  "success": false,
  "message": "Invalid email format",
  "data": {},
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

#### S3 Access Error
```json
{
  "success": false,
  "message": "Error accessing screenshot data",
  "data": {},
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

## 🔐 Security & Authentication

### Current Implementation
- **CSRF Exempt**: API exempt from CSRF protection
- **Input Validation**: Email format validation
- **Error Sanitization**: Sensitive S3 errors not exposed
- **Path Security**: Prevents directory traversal

### Production Recommendations
- Add employee access control
- Implement rate limiting
- Add request logging
- Consider data privacy compliance

## 🌍 Environment Configuration

### Required Environment Variables

```bash
# AWS S3 Configuration
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION_NAME=your-region

# Django Configuration
DEBUG=True  # Set to False in production
```

### S3 Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## 📈 Performance Metrics

### Expected Response Times
- **Small Employee** (< 10 folders): < 300ms
- **Medium Employee** (10-50 folders): < 800ms
- **Large Employee** (50+ folders): < 1500ms
- **S3 Operations**: < 200ms per API call

### Optimization Strategies
- **S3 Query Optimization**: Use proper prefixes and delimiters
- **Concurrent Processing**: Process folder statistics in parallel
- **Response Caching**: Cache frequently accessed data
- **Pagination**: Implement for very large folder structures

## 🔄 Integration Examples

### Frontend Integration (JavaScript)
```javascript
async function loadEmployeeFolders(employeeEmail) {
    const response = await fetch(`/api/screenshots/employee/${encodeURIComponent(employeeEmail)}/folders/`);
    const data = await response.json();
    
    if (data.success) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
}

// Usage
loadEmployeeFolders('user@company.com')
    .then(data => {
        console.log(`Found ${data.summary.total_folders} folders`);
        console.log(`Total screenshots: ${data.summary.total_screenshots}`);
        
        data.task_folders.forEach(folder => {
            console.log(`${folder.display_name}: ${folder.screenshot_count} screenshots`);
        });
    })
    .catch(error => {
        console.error('Error loading folders:', error);
    });
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const EmployeeFolders = ({ employeeEmail }) => {
    const [folders, setFolders] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (employeeEmail) {
            setLoading(true);
            setError(null);
            
            fetch(`/api/screenshots/employee/${encodeURIComponent(employeeEmail)}/folders/`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        setFolders(data.data);
                    } else {
                        setError(data.message);
                    }
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [employeeEmail]);
    
    if (loading) return <div>Loading folders...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!folders) return <div>Select an employee to view folders</div>;
    
    return (
        <div>
            <h2>Folders for {folders.employee_email}</h2>
            <div>
                <p>Total Folders: {folders.summary.total_folders}</p>
                <p>Total Screenshots: {folders.summary.total_screenshots}</p>
                <p>Total Size: {folders.summary.total_size_mb} MB</p>
            </div>
            
            <div>
                {folders.task_folders.map((folder, index) => (
                    <div key={index} className="folder-card">
                        <h3>{folder.display_name}</h3>
                        <p>{folder.screenshot_count} screenshots</p>
                        <p>{folder.total_size_mb} MB</p>
                        {folder.has_recent_activity && <span>🟢 Active</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## 📊 API Workflow

### Typical Usage Pattern
1. **Level 1**: Search for employees using `/api/users/s3-suggestions/`
2. **Level 2**: Select employee and load folders using this API
3. **Level 3**: Select folder to view individual screenshots
4. **Level 4**: View/manage individual screenshot files

### Integration with Level 1
```javascript
// Combined workflow example
async function searchAndLoadFolders(query) {
    // Level 1: Search for employees
    const searchResponse = await fetch(`/api/users/s3-suggestions/?q=${encodeURIComponent(query)}&limit=5`);
    const searchData = await searchResponse.json();
    
    if (searchData.success && searchData.data.suggestions.length > 0) {
        const firstEmployee = searchData.data.suggestions[0];
        
        // Level 2: Load folders for first result
        const foldersResponse = await fetch(`/api/screenshots/employee/${encodeURIComponent(firstEmployee.email)}/folders/`);
        const foldersData = await foldersResponse.json();
        
        return {
            employee: firstEmployee,
            folders: foldersData.success ? foldersData.data : null
        };
    }
    
    return null;
}
```

## 📝 Changelog

### Version 1.0.0 (2025-07-14)
- ✅ Initial implementation
- ✅ S3 folder analysis and statistics
- ✅ Date vs task folder distinction
- ✅ Recent activity detection
- ✅ File type analysis
- ✅ Direct file handling
- ✅ Comprehensive test suite
- ✅ HTML demo page
- ✅ Performance optimization

## 🤝 Support

### Getting Help
- Use the HTML demo page for interactive testing
- Run the Python test script for automated validation
- Check Django logs for detailed error information
- Verify S3 bucket structure and permissions

### Common Issues & Solutions

#### Issue: No folders returned for valid employee
**Solution**: 
1. Check S3 bucket structure
2. Verify email format conversion (@ → _at_, . → _)
3. Ensure proper S3 permissions

#### Issue: Slow response times
**Solution**:
1. Check S3 region configuration
2. Verify network connectivity to S3
3. Consider implementing caching

#### Issue: Permission denied errors
**Solution**:
1. Verify AWS credentials
2. Check S3 bucket policies
3. Ensure proper IAM permissions

---

*This Level 2 API provides comprehensive folder management for employee screenshot data, building upon the Level 1 employee search functionality.*
