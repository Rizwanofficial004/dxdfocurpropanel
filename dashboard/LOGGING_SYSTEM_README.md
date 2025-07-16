# Program Summary Logging System

## Overview

This system provides separate logging for different types of operations:

1. **Screenshot Operations** - Logged in `s3_log_extractor.log` (existing)
2. **Program Summaries & Analytics** - Logged in `log/program_summary.log` (new)

## File Structure

```
dashboard/
├── s3_log_extractor.py          # Main program summary extractor
├── program_summary_logger.py    # New logging module for program summaries
├── test_program_logging.py      # Test script for logging system
├── example_program_summary.py   # Example with user's specific JSON data
├── log/
│   └── program_summary.log      # Program summary and analytics logs
└── s3_log_extractor.log         # Screenshot extraction logs (existing)
```

## Logging Categories

### 📊 Program Summary Operations
- User program analysis
- Data processing
- Report generation
- Error handling

### 🔍 User Search Operations
- User queries
- Search results
- Email matching
- OpenAI-assisted searches

### 📈 Program Analysis
- Category extraction
- Program identification
- Data source tracking
- Analysis statistics

### 🤖 OpenAI Operations
- API calls for category extraction
- Program summarization
- Email matching assistance
- Success/failure tracking

### ☁️ S3 Operations
- Reading program summaries
- Writing cache files
- Bucket operations
- Error handling

### ✅ API Requests
- Endpoint calls
- Response status codes
- Response sizes
- User tracking

### 💾 Cache Operations
- Cache reads/writes
- File operations
- Performance tracking
- Error handling

### 📊 Detailed Program Summary (NEW)
- Complete program summary data logging
- Categories and programs breakdown
- Time calculations
- Top programs analysis
- JSON data logging for debugging

## Usage Examples

### Basic Program Summary Logging
```python
from program_summary_logger import log_program_summary_operation

# Log a successful operation
log_program_summary_operation("Starting analysis", "user@example.com")

# Log an error
log_program_summary_operation("Database connection failed", status="ERROR")
```

### User Search Logging
```python
from program_summary_logger import log_user_search

# Log successful search
log_user_search("john.doe", 1, "john.doe@company.com")

# Log failed search
log_user_search("jane", 0)
```

### Program Analysis Logging
```python
from program_summary_logger import log_program_analysis

log_program_analysis(
    user_email="developer@company.com",
    categories_count=5,
    programs_count=12,
    source_file="logs/developer_at_company.com/summary.json"
)
```

### OpenAI Operations Logging
```python
from program_summary_logger import log_openai_operation

# Success
log_openai_operation("Extract categories", "user@example.com", success=True)

# Failure
log_openai_operation("Generate summary", "user@example.com", success=False, error="API rate limit exceeded")
```

### S3 Operations Logging
```python
from program_summary_logger import log_s3_operation

# Success
log_s3_operation("Read program summary", "my-bucket", "logs/user/summary.json", success=True)

# Failure
log_s3_operation("Write cache", "my-bucket", "cache/data.json", success=False, error="Permission denied")
```

### API Request Logging
```python
from program_summary_logger import log_api_request

# Successful request
log_api_request("/api/program-summary", "GET", "user@example.com", 2048, 200)

# Failed request
log_api_request("/api/user-search", "POST", "admin@company.com", 512, 404)
```

### Cache Operations Logging
```python
from program_summary_logger import log_cache_operation

# Success
log_cache_operation("Write", "program_cache.json", success=True, details="Updated 15 records")

# Failure
log_cache_operation("Read", "user_cache.json", success=False, details="File not found")
```

### Detailed Program Summary Logging (NEW)
```python
from program_summary_logger import log_detailed_program_summary, log_program_summary_json

# Method 1: Using log_program_summary_json (recommended for JSON data)
user_data = {
    "categories": {
        "Unknown": "742.0 mins",
        "Browsers": "80.0 mins",
        "Development": "40.0 mins"
    },
    "programs": {
        "VSCode": "40.0 mins",
        "Chrome": "40.0 mins",
        "python.exe": "40.0 mins"
    }
}

log_program_summary_json(
    user_email="haseebcodejourney@gmail.com",
    json_data=user_data,
    source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
)

# Method 2: Using log_detailed_program_summary (for separate data)
log_detailed_program_summary(
    user_email="haseebcodejourney@gmail.com",
    categories_data=user_data["categories"],
    programs_data=user_data["programs"],
    source_file="logs/haseebcodejourney_at_gmail.com/program_summary.json"
)
```

## Log Format

Each log entry follows this format:
```
YYYY-MM-DD HH:MM:SS - LEVEL - EMOJI Operation Description | Additional Info
```

### Examples:
```
2025-06-30 20:59:57 - INFO - 📊 Detailed Program Summary | User: haseebcodejourney@gmail.com | Total Time: 942.0 mins | Categories: 5 | Programs: 31 | Source: logs/haseebcodejourney_at_gmail.com/program_summary.json
2025-06-30 20:59:57 - INFO - 📈 Categories Breakdown | User: haseebcodejourney@gmail.com | Unknown: 742.0 mins | Browsers: 80.0 mins | Development: 40.0 mins | Productivity: 40.0 mins | Communication: 40.0 mins
2025-06-30 20:59:57 - INFO - 💻 Top Programs | User: haseebcodejourney@gmail.com | Registry: 40.0 mins | powershell.exe: 40.0 mins | py.exe: 40.0 mins | VSCode: 40.0 mins | NVDisplay.Container.exe: 40.0 mins | Chrome: 40.0 mins | nvcontainer.exe: 40.0 mins | redis-server.exe: 40.0 mins | TeamViewer_Service.exe: 40.0 mins | crashpad_handler.exe: 40.0 mins | ... and 21 more programs
```

## Testing

Run the test scripts to see all logging functions in action:

```bash
cd dashboard

# Basic logging tests
python3 test_program_logging.py

# Example with user's specific JSON data
python3 example_program_summary.py
```

This will generate sample log entries in `log/program_summary.log`.

## Integration

The logging system is now integrated into `s3_log_extractor.py` and will automatically log:

- Program summary generation
- User searches
- S3 operations
- OpenAI API calls
- API requests
- Cache operations
- **Detailed program summary data** (NEW)

## Benefits

1. **Separation of Concerns**: Screenshot logs and program summary logs are separate
2. **Structured Logging**: Consistent format with emojis and clear categorization
3. **Debugging**: Easy to track program summary operations
4. **Monitoring**: Can monitor API usage, S3 operations, and user activity
5. **Performance**: Track cache hits/misses and response times
6. **Error Tracking**: Detailed error logging for troubleshooting
7. **Detailed Analysis**: Complete breakdown of categories and programs with time data
8. **JSON Support**: Direct logging of JSON program summary data

## Log Files

- **`s3_log_extractor.log`**: Screenshot extraction and S3 bucket scanning
- **`log/program_summary.log`**: Program summaries, user analytics, API calls, cache operations, and detailed program breakdowns

## New Features

### Detailed Program Summary Logging
- **Total time calculation** from categories
- **Categories breakdown** with individual time tracking
- **Top programs analysis** (shows top 10 programs by time)
- **Complete JSON logging** for debugging and audit purposes
- **Source file tracking** for data provenance
- **User-specific analysis** with email tracking 