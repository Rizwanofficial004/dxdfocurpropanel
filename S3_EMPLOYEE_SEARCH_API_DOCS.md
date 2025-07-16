# S3 Employee Search & Suggestions API Documentation

## Overview

The S3 Employee Search & Suggestions API provides a powerful employee search functionality with integrated AWS S3 data, specifically designed for Level 1 employee search requirements.

## 🚀 API Endpoint

```
GET /api/users/s3-suggestions/
```

## 📋 Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (name, email, username, or staff ID) |
| `limit` | integer | No | 10 | Maximum number of results to return |

## 📤 Request Examples

### Basic Search
```
GET /api/users/s3-suggestions/?q=haseeb&limit=10
```

### Search by Email
```
GET /api/users/s3-suggestions/?q=haseepcodejourney@gmail.com&limit=5
```

### Search by Staff ID
```
GET /api/users/s3-suggestions/?q=HA5001&limit=15
```

## 📥 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Found 1 suggestions",
  "data": {
    "suggestions": [
      {
        "display_name": "Haseeb Developer",
        "email": "haseepcodejourney@gmail.com",
        "username": "haseeb",
        "staff_id": "HA5001",
        "screenshot_count": 150,
        "suggestion_text": "Haseeb Developer (haseepcodejourney@gmail.com)",
        "search_value": "haseepcodejourney@gmail.com",
        "has_recent_activity": true
      }
    ]
  },
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error getting suggestions",
  "data": {},
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

## 🔍 Response Fields Explanation

### Suggestion Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `display_name` | string | Full name of the employee (formatted) |
| `email` | string | Employee's email address |
| `username` | string | Username (usually email prefix) |
| `staff_id` | string | Employee's staff identification number |
| `screenshot_count` | integer | Number of screenshots stored in S3 for this user |
| `suggestion_text` | string | Formatted text for display in dropdowns |
| `search_value` | string | Value to use when user selects this suggestion |
| `has_recent_activity` | boolean | Whether user has activity in the last 7 days |

## ⚡ Features

### 🔍 Search Capabilities
- **Multi-field Search**: Searches across first name, last name, email, username, and staff ID
- **Partial Matching**: Supports partial word matching
- **Case Insensitive**: Search is not case-sensitive
- **Real-time Results**: Optimized for autocomplete/typeahead functionality

### 📊 S3 Integration
- **Screenshot Count**: Real-time count of screenshots stored in AWS S3
- **Recent Activity Detection**: Checks for activity in the last 7 days
- **S3 Folder Structure**: Handles S3 folder naming conventions automatically

### 🎯 Data Sources
- **Staff Model**: Primary source for employee data
- **Django User Model**: Secondary source for additional users
- **AWS S3**: Screenshot counts and activity data

## 🔧 Technical Implementation

### Data Flow
1. **Search Query Processing**: Query is processed against multiple database fields
2. **S3 Data Retrieval**: Screenshot counts and activity are fetched from AWS S3
3. **Data Merging**: Database and S3 data are combined
4. **Sorting**: Results sorted by activity and screenshot count
5. **Response Formatting**: Data formatted according to API specification

### Performance Optimizations
- **Efficient Queries**: Optimized database queries with proper indexing
- **S3 Caching**: S3 responses cached to reduce API calls
- **Result Limiting**: Built-in result limiting to prevent large responses
- **Async Processing**: S3 operations handled asynchronously where possible

## 🧪 Testing

### Test Scripts Provided

1. **Python Test Script**: `test_s3_suggestions_api.py`
   ```bash
   python test_s3_suggestions_api.py
   ```

2. **PowerShell Test Script**: `test_s3_suggestions_api.ps1`
   ```powershell
   .\test_s3_suggestions_api.ps1 -BaseUrl "http://localhost:8000" -Query "haseeb"
   ```

3. **HTML Demo Page**: `s3_employee_search_demo.html`
   - Interactive web interface for testing
   - Real-time search as you type
   - Responsive design
   - Error handling and loading states

### Test Cases Covered
- ✅ Basic name search
- ✅ Email search
- ✅ Partial matching
- ✅ Staff ID search
- ✅ Empty query handling
- ✅ Response format validation
- ✅ Error handling
- ✅ Performance testing

## 🚨 Error Handling

### Common Errors

| Status Code | Error | Description | Solution |
|-------------|--------|-------------|----------|
| 400 | Bad Request | Invalid parameters | Check query parameters |
| 500 | Internal Server Error | Server error | Check logs, verify S3 configuration |
| 503 | Service Unavailable | S3 connection issues | Verify AWS credentials and S3 access |

### Error Response Format
```json
{
  "success": false,
  "message": "Detailed error message",
  "data": {},
  "timestamp": "2025-07-14T10:30:00.000Z"
}
```

## 🔐 Security & Authentication

### Current Implementation
- **CSRF Exempt**: API is exempt from CSRF protection for easier integration
- **No Authentication Required**: Public endpoint (as per requirements)
- **Rate Limiting**: Consider implementing rate limiting for production

### Production Recommendations
- Add authentication for sensitive employee data
- Implement rate limiting to prevent abuse
- Add request logging for audit trails
- Consider data privacy compliance (GDPR, etc.)

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
SECRET_KEY=your-secret-key
```

### S3 Folder Structure Expected
```
s3-bucket/
├── screenshots/
│   ├── user1_at_company_com/
│   │   ├── 2025-01-01/
│   │   └── 2025-01-02/
│   └── user2_at_company_com/
│       ├── 2025-01-01/
│       └── 2025-01-02/
└── logs/
    ├── user1_at_company_com/
    └── user2_at_company_com/
```

## 📈 Performance Metrics

### Expected Response Times
- **Database Query**: < 50ms
- **S3 Operations**: < 200ms per user
- **Total Response**: < 500ms for 10 results
- **Concurrent Requests**: Supports 50+ concurrent requests

### Scalability Considerations
- **Database Indexing**: Ensure proper indexes on searchable fields
- **S3 Optimization**: Consider S3 inventory for large datasets
- **Caching**: Implement Redis/Memcached for frequently accessed data
- **Load Balancing**: Use load balancers for high-traffic scenarios

## 🔄 Integration Examples

### Frontend Integration (JavaScript)
```javascript
async function searchEmployees(query) {
    const response = await fetch(`/api/users/s3-suggestions/?q=${encodeURIComponent(query)}&limit=10`);
    const data = await response.json();
    
    if (data.success) {
        return data.data.suggestions;
    } else {
        throw new Error(data.message);
    }
}
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const EmployeeSearch = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    
    useEffect(() => {
        const searchEmployees = async () => {
            if (query.length >= 1) {
                try {
                    const response = await fetch(`/api/users/s3-suggestions/?q=${encodeURIComponent(query)}&limit=10`);
                    const data = await response.json();
                    
                    if (data.success) {
                        setSuggestions(data.data.suggestions);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setSuggestions([]);
            }
        };
        
        const timeoutId = setTimeout(searchEmployees, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);
    
    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees..."
            />
            <ul>
                {suggestions.map((suggestion, index) => (
                    <li key={index}>
                        <strong>{suggestion.display_name}</strong>
                        <br />
                        {suggestion.email} ({suggestion.screenshot_count} screenshots)
                        {suggestion.has_recent_activity && <span>🟢 Active</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
```

## 📝 Changelog

### Version 1.0.0 (2025-07-14)
- ✅ Initial implementation
- ✅ S3 integration for screenshot counting
- ✅ Recent activity detection
- ✅ Multi-source data merging (Staff + User models)
- ✅ Comprehensive test suite
- ✅ HTML demo page
- ✅ PowerShell and Python test scripts

## 🤝 Support

### Getting Help
- Check the test scripts for examples
- Review the HTML demo for UI integration
- Verify S3 configuration if screenshot counts are 0
- Check Django logs for detailed error information

### Common Issues & Solutions

#### Issue: Screenshot count always 0
**Solution**: Verify AWS S3 credentials and bucket access permissions

#### Issue: No suggestions returned
**Solution**: Check if employees exist in Staff or User models

#### Issue: Slow response times
**Solution**: Verify S3 region configuration and network connectivity

---

*This API is designed to provide fast, accurate employee search with integrated S3 data for the DDS Focus Time Admin Panel.*
