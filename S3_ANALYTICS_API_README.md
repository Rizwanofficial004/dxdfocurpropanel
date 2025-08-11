# S3 User Analytics API

A comprehensive API server that analyzes S3 bucket data to provide detailed insights about users, their tasks, and screenshot counts.

## 🎯 Features

- **Real S3 Data**: Scans actual S3 bucket for current data
- **User Task Lists**: Shows all folders/tasks for each user
- **Screenshot Counts**: Accurate counts per user and per folder
- **Size Analytics**: File sizes in bytes and MB
- **Activity Tracking**: Last activity timestamps with human-readable format
- **Performance Optimized**: 5-minute caching system to improve response times
- **CORS Enabled**: Can be called from frontend applications
- **Multiple Endpoints**: Overview, user analytics, and detailed user information

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- boto3 library
- S3 access credentials

### Installation
```bash
# Install required packages
pip install boto3 requests

# Make the PowerShell script executable (Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Running the Server

#### Option 1: PowerShell Launcher (Recommended for Windows)
```powershell
.\start_s3_analytics.ps1
```

#### Option 2: Batch File Launcher (Alternative for Windows)
```batch
start_s3_analytics.bat
```

#### Option 3: Direct Python Command
```bash
# Start on default port 9000
python s3_user_analytics_api.py

# Start on custom port
python s3_user_analytics_api.py 8080
```

#### Option 4: Run Tests
```bash
python test_s3_analytics_api.py
```

#### Option 5: Quick Verification
```bash
python verify_s3_api.py
```

## 📡 API Endpoints

### 1. Bucket Overview
**GET** `/api/s3/bucket-overview/`

High-level bucket statistics and insights.

**Example:**
```bash
curl http://localhost:9000/api/s3/bucket-overview/
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_users": 15,
    "total_screenshots": 25000,
    "total_folders": 180,
    "total_size_mb": 6250.5
  },
  "insights": {
    "top_users_by_screenshots": [...],
    "most_recent_activity": [...]
  }
}
```

### 2. User Analytics
**GET** `/api/s3/user-analytics/`

Complete user analytics with tasks and screenshot counts.

**Query Parameters:**
- `user` - Filter by email (optional)
- `min_screenshots` - Minimum screenshot count (optional, default: 0)
- `limit` - Limit number of users returned (optional, default: 100)

**Examples:**
```bash
# All users
curl http://localhost:9000/api/s3/user-analytics/

# Filter users with at least 100 screenshots
curl http://localhost:9000/api/s3/user-analytics/?min_screenshots=100&limit=10

# Search for specific user
curl http://localhost:9000/api/s3/user-analytics/?user=haseeb
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "email": "haseebcodejourney@gmail.com",
      "total_screenshots": 5000,
      "total_folders": 12,
      "total_size_mb": 1250.5,
      "last_activity_humanized": "20 minutes ago",
      "folders_list": [
        {
          "folder_name": "2025-01-27",
          "screenshot_count": 45,
          "total_size_bytes": 15728640
        }
      ]
    }
  ]
}
```

### 3. User Details
**GET** `/api/s3/user-details/`

Detailed information for a specific user.

**Query Parameters:**
- `email` - User email (required)

**Example:**
```bash
curl "http://localhost:9000/api/s3/user-details/?email=haseebcodejourney@gmail.com"
```

**Response:**
```json
{
  "success": true,
  "user": {
    "email": "haseebcodejourney@gmail.com",
    "total_screenshots": 5000,
    "total_folders": 12,
    "folders_list": [...]
  },
  "insights": {
    "most_active_folder": "2025-01-27",
    "avg_screenshots_per_folder": 416.7,
    "avg_size_per_screenshot_kb": 250.1
  }
}
```

## 🎨 Demo Interface

Open `s3_analytics_demo.html` in your browser for a beautiful web interface to interact with the API.

**Features:**
- Real-time data visualization
- Interactive user cards
- Summary statistics
- Raw JSON view toggle
- Responsive design

## 🔧 Configuration

### S3 Credentials
The API uses hardcoded AWS credentials for the `ddsfocustime` bucket. For production use, consider:

1. Environment variables
2. AWS IAM roles
3. AWS credential files

### Cache Settings
- **Cache Duration**: 5 minutes (configurable)
- **Cache Location**: In-memory
- **Cache Key**: Complete S3 scan results

### Performance Notes
- Initial scan may take 30-60 seconds for large buckets
- Subsequent requests use cached data for faster response
- Cache automatically refreshes every 5 minutes

## 📊 Data Structure

The API analyzes S3 keys with this structure:
```
screenshots/{user_email_encoded}/{folder_name}/{filename}
```

**Example:**
```
screenshots/haseebcodejourney_at_gmail.com/2025-01-27/screenshot_001.webp
```

## 🧪 Testing

### Automated Tests
```bash
python test_s3_analytics_api.py
```

### Quick Verification
```bash
python verify_s3_api.py
```

### Manual Testing
1. Start the server: `python s3_user_analytics_api.py`
2. Open browser: `http://localhost:9000/`
3. Test endpoints using the web interface

### Expected Test Results
- ✅ Bucket overview loads successfully
- ✅ User analytics returns user list
- ✅ User details work for valid emails
- ✅ Filtering and search functions work
- ✅ Error handling for invalid requests
- ✅ CORS headers work correctly
- ✅ JSON responses are properly formatted

## 📈 Performance Metrics

- **Typical Scan Time**: 15-45 seconds (depending on bucket size)
- **Memory Usage**: ~50-100MB (varies with data size)
- **Concurrent Requests**: Supported (cached data)
- **Response Time**: <1s (cached), 15-45s (fresh scan)

## 🔍 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check Python version (3.7+ required)
   - Install missing packages: `pip install boto3 requests`
   - Verify port 9000 is available
   - **Fixed**: Removed handler instantiation error during startup
   - **Fixed**: Corrected CORS header ordering

2. **S3 connection errors**
   - Verify AWS credentials
   - Check bucket name and region
   - Ensure network connectivity
   - **Fixed**: Improved error handling for S3 timeouts

3. **Empty or missing data**
   - Verify S3 bucket structure matches expected format
   - Check if screenshots folder exists in bucket
   - Review console logs for detailed error messages
   - **Fixed**: Better timezone handling for datetime comparisons

4. **Slow performance**
   - Large buckets may take longer to scan initially
   - Cached responses should be much faster
   - Consider increasing cache duration for very large buckets
   - **Fixed**: Optimized cache validation logic

5. **PowerShell execution errors**
   - Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Or use the batch file alternative: `start_s3_analytics.bat`
   - **Fixed**: Added execution policy bypass to PowerShell script

### Debug Mode
Add console logging by checking the server terminal output for detailed scan information.

## 🚀 Production Deployment

For production use, consider:

1. **Security**: Use proper AWS IAM roles instead of hardcoded credentials
2. **Scalability**: Implement Redis or database caching for multiple server instances
3. **Monitoring**: Add logging and health check endpoints
4. **Load Balancing**: Use reverse proxy for multiple instances
5. **HTTPS**: Enable SSL/TLS encryption

## 📝 API Response Examples

### Successful Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "timestamp": "2025-01-28T12:34:56.789Z",
  "execution_time_seconds": 2.5,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "User not found: invalid@email.com",
  "available_users": ["user1@example.com", "user2@example.com"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is provided as-is for educational and development purposes.

---

**🎯 Key Benefits:**
- ✅ **Real Data**: Direct S3 bucket analysis
- ✅ **Fast Performance**: Smart caching system
- ✅ **User Friendly**: Beautiful web interface
- ✅ **Comprehensive**: All user tasks and screenshot counts
- ✅ **Production Ready**: CORS enabled, error handling
- ✅ **Easy Setup**: PowerShell launcher and documentation
