# 📸 User Screenshots Feature - Usage Guide

## Overview
The Activity Stream now includes a complete user search and screenshot viewing system that integrates with your backend API at `http://127.0.0.1:8000/api/users/search/`

## Features

### ✅ What's Already Implemented

1. **User Search API Integration**
   - Endpoint: `http://127.0.0.1:8000/api/users/search/`
   - Parameters: `start_date`, `end_date`, `q` (search query)
   - Smart query handling: only adds `q` parameter when non-empty

2. **Load All Users Button**
   - Blue button next to search box: "📋 Load All Users"
   - Click to fetch all available users
   - Shows loading state while fetching
   - Displays results in dropdown

3. **Search Functionality**
   - Type in search box to find users
   - Real-time search with autocomplete
   - Fuzzy matching and partial search
   - Shows user count and screenshot count for each user

4. **Screenshot Viewing**
   - Click any user from the search results
   - Automatically fetches their screenshots
   - Grid view with 300px cards
   - Click any screenshot to open full size in new tab

5. **Screenshot Details**
   - Timestamp (date & time)
   - File size
   - Activity type
   - Project folder
   - S3 bucket path

## How to Use

### Step 1: Load Users
```
Option A: Click "📋 Load All Users" button
Option B: Type a search query (e.g., "nawaz", "haseeb", "dxd")
```

### Step 2: Select a User
```
- Dropdown shows matching users
- Each user displays:
  • Name/Email
  • Screenshot count (e.g., "📷 5 screenshots")
  • Avatar with initial
- Click on any user to view their screenshots
```

### Step 3: View Screenshots
```
- Screenshots appear in a grid below
- Each card shows:
  • Screenshot thumbnail
  • Date & Time
  • File size
  • Folder path
- Click any screenshot to open full size
```

### Step 4: Navigate Screenshots
```
- Pagination controls at bottom
- Filter by date using calendar
- Filter by specific date range
- View screenshots by project folder
```

## API Endpoints

### 1. Search Users
```bash
GET /api/users/search/
Parameters:
  - start_date: YYYY-MM-DD (required)
  - end_date: YYYY-MM-DD (required)
  - q: search query (optional)
  - page: page number (default: 1)
  - page_size: results per page (default: 50)
```

Example:
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-09-01&q=nawaz"
```

### 2. Get User Screenshots
```bash
GET /api/users/screenshots/
Parameters:
  - q: user email or name (required)
  - start_date: YYYY-MM-DD (required)
  - end_date: YYYY-MM-DD (required)
  - page: page number (default: 1)
  - page_size: results per page (default: 20)
```

Example:
```bash
curl "http://127.0.0.1:8000/api/users/screenshots/?q=nawaz@dxdglobal.com&start_date=2025-10-01&end_date=2025-10-31"
```

## UI Components

### Search Box
- **Location**: Top of Activity Stream
- **Placeholder**: "Search users: try 'haseeb', 'nawaz', or 'dxd'"
- **Features**: 
  - Auto-suggest as you type
  - Highlight matching text
  - Show helpful tips when empty

### Load All Users Button
- **Location**: Right of search box
- **Color**: Blue (#4285f4)
- **States**:
  - Normal: "📋 Load All Users"
  - Loading: "⏳ Loading..."
  - Hover: Darker blue (#3367d6)

### Search Results Dropdown
- **Position**: Below search box
- **Max Height**: 300px with scroll
- **Features**:
  - User avatar (first letter)
  - User name/email
  - Screenshot count
  - Hover highlighting

### Screenshot Grid
- **Layout**: Auto-fill grid (min 300px)
- **Gap**: 20px between cards
- **Features**:
  - Responsive columns
  - Hover animations
  - Click to open full size

## Date Filtering

### Current Month (Default)
```javascript
// Automatically uses selected month/year
const startDate = `2025-10-01`;
const endDate = `2025-10-31`;
```

### Specific Date
```javascript
// Click on calendar date
const specificDate = `2025-10-15`;
```

### Custom Range
```javascript
// Use month/year dropdowns
Year: 2025
Month: October (10)
```

## Error Handling

### No Users Found
- Shows helpful message
- Suggests trying: 'haseeb', 'nawaz', 'dxd', or 'global'
- Explains partial search and fuzzy matching

### API Errors
- Displays error message from backend
- Shows retry button
- Logs details to console

### Image Loading Errors
- Shows placeholder icon
- Logs error to console
- Allows clicking to retry

## Debugging

### Console Logs
```javascript
🔍 Search input focused
📋 Loading all users...
🎯 User selected from search: {user}
📸 Fetching screenshots for specific date: 2025-10-15
✅ Image loaded successfully: {url}
❌ Image failed to load: {url}
```

### API Status Indicator
- **Green**: Connected to API
- **Yellow**: Using fallback
- **Position**: Top right of search box

## Performance

### Optimizations
- **Debounced search**: 300ms delay
- **Memoized results**: Prevents re-renders
- **Lazy loading**: Images load on demand
- **Pagination**: 20 screenshots per page
- **Smart caching**: Reuses API responses

### Loading States
- Search: Shows spinner in dropdown
- Screenshots: Shows loading animation
- Images: Fade in when loaded

## Customization

### Change Screenshots Per Page
```javascript
const screenshotsPerPage = 20; // Change this value
```

### Change Grid Columns
```css
gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
// Change 300px to adjust min card width
```

### Change Search Delay
```javascript
const debouncedSearchValue = useMemo(() => {
  return debounce(searchValue, 300); // Change 300ms delay
}, [searchValue]);
```

## Backend Integration

### Expected Response Format

#### Users Search
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "user123",
        "email": "nawaz@dxdglobal.com",
        "display_name": "Nawaz",
        "total_screenshots": 42,
        "recent_screenshots": [...],
        "grouped_screenshots": {...}
      }
    ],
    "pagination": {
      "total_users": 10,
      "page": 1,
      "page_size": 50,
      "total_pages": 1
    }
  }
}
```

#### Screenshots Search
```json
{
  "status": "success",
  "data": {
    "screenshots": [
      {
        "filename": "screenshot_2025-10-15_14-30-00.png",
        "screenshot_url": "https://ddsfocustime.s3.eu-north-1.amazonaws.com/nawaz_at_dxdglobal.com/2025/10/15/screenshot_2025-10-15_14-30-00.png",
        "thumbnail_url": "...",
        "last_modified": "2025-10-15T14:30:00Z",
        "date": "2025-10-15",
        "file_size_mb": "2.5",
        "user_email": "nawaz@dxdglobal.com",
        "project_folder": "ProjectX"
      }
    ],
    "pagination": {
      "total_screenshots": 42,
      "page": 1,
      "page_size": 20,
      "total_pages": 3
    }
  }
}
```

## S3 Image Proxy

### Configuration
The app uses a local proxy server to serve S3 images:
```
S3 URL: https://ddsfocustime.s3.eu-north-1.amazonaws.com/path/to/image.png
Local Proxy: http://localhost:3001/s3-images/path/to/image.png
```

### Image URL Transformation
```javascript
const localUrl = screenshot.screenshot_url.replace(
  'https://ddsfocustime.s3.eu-north-1.amazonaws.com',
  'http://localhost:3001/s3-images'
);
```

## Troubleshooting

### Issue: "No users found"
**Solution**: 
- Try searching for 'a', 'h', 'n', or 'd'
- Click "Load All Users" button
- Check console for API errors

### Issue: Screenshots not loading
**Solution**:
- Check S3 proxy server is running
- Verify image URLs in console
- Check CORS settings
- Retry with refresh button

### Issue: 400 Bad Request
**Solution**:
- Ensure date range is valid
- Don't send empty query parameter
- Check API is running on localhost:8000

### Issue: Images show placeholder
**Solution**:
- Verify S3 bucket permissions
- Check image URLs in console
- Ensure proxy server is configured
- Check network tab in DevTools

## Next Steps

### Suggested Enhancements
1. ✅ Add bulk download button
2. ✅ Add screenshot comparison view
3. ✅ Add date range picker
4. ✅ Add project folder filter
5. ✅ Add activity timeline
6. ✅ Add export to PDF
7. ✅ Add screenshot annotations

### Feature Requests
- Email folder name normalization (nawaz vs nawaz_at_dxdglobal.com)
- Better fuzzy matching
- Advanced filters (time of day, file size, etc.)
- Screenshot gallery mode
- Slideshow view

## Support

For issues or questions:
1. Check console logs for errors
2. Verify API endpoints are accessible
3. Test with cURL commands
4. Check S3 proxy configuration
5. Review backend error messages

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Fully Implemented
