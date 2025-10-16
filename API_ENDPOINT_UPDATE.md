# API Endpoint Update Summary

## Changes Made

Updated the application to use the new API endpoint format:
```
http://dxdtime.ddsolutions.io/api/users/search/?q=beg&start_date=2025-09-01&end_date=2025-09-01&screenshots_per_page=3000&screenshots_page=1
```

## Files Modified

### 1. `/src/dashboard/components/activity/ActivityStream.jsx`

#### Changed Parameters:
- ✅ Changed `limit` → `screenshots_per_page`
- ✅ Changed `offset` → removed (not needed)
- ✅ Changed `page` → `screenshots_page`
- ✅ Changed `page_size` → `screenshots_per_page`
- ✅ Increased default `screenshotsPerPage` from `50` to `3000`

#### Updated Sections:
1. **Initial State** (Line ~249):
   - Changed default value from `50` to `3000`

2. **Search Users Function** (Line ~515):
   - Updated parameters to use `screenshots_per_page` and `screenshots_page`

3. **Fetch User Screenshots** (Line ~1295):
   - Updated parameters to use `screenshots_per_page` and `screenshots_page`

4. **Handle Date Select** (Line ~2410):
   - Updated parameters to use `screenshots_per_page` and `screenshots_page`

### 2. `/src/services/usersAPI.js`

#### Changed Parameters:
- ✅ Changed `page` → `screenshots_page`
- ✅ Changed `page_size` → `screenshots_per_page`
- ✅ Changed default from `50` to `3000`

#### Updated Sections:
1. **searchUsers function** (Line ~60):
   - Added `screenshots_page` and `screenshots_per_page` parameters
   - Kept backward compatibility with old `page` and `page_size` parameters

2. **getAllUsers function** (Line ~90):
   - Updated to use `screenshots_per_page` with default of `3000`

## API Endpoint Format

### New Format (Current):
```javascript
const searchParams = new URLSearchParams({
  q: query,
  start_date: startDate,
  end_date: endDate,
  screenshots_per_page: screenshotsPerPage.toString(),
  screenshots_page: '1'
});
```

### Old Format (Deprecated):
```javascript
// ❌ Old format - no longer used
const searchParams = new URLSearchParams({
  q: query,
  start_date: startDate,
  end_date: endDate,
  limit: screenshotsPerPage.toString(),
  offset: '0',
  page: page.toString(),
  page_size: screenshotsPerPage.toString()
});
```

## Configuration Files (Already Correct)

### `/src/config/api.js`
- ✅ Already configured to use `https://dxdtime.ddsolutions.io/api` for production
- ✅ Uses Vite proxy `/api` for development

### `/vite.config.js`
- ✅ Proxy configured for `/api/users` endpoint
- ✅ Points to `https://dxdtime.ddsolutions.io`

## Example API Calls

### Search Users with Date Range:
```
GET /api/users/search/?q=beg&start_date=2025-09-01&end_date=2025-09-01&screenshots_per_page=3000&screenshots_page=1
```

### Search Users with Specific Date:
```
GET /api/users/search/?q=john@example.com&start_date=2025-10-16&end_date=2025-10-16&screenshots_per_page=3000&screenshots_page=1
```

### Pagination (Next Page):
```
GET /api/users/search/?q=beg&start_date=2025-09-01&end_date=2025-09-01&screenshots_per_page=3000&screenshots_page=2
```

## Testing

To test the changes:

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   - API calls will go through Vite proxy to production server

2. **Production Mode**:
   ```bash
   npm run build
   npm run preview
   ```
   - API calls will go directly to `https://dxdtime.ddsolutions.io`

3. **Verify API Calls**:
   - Open browser DevTools → Network tab
   - Search for a user
   - Check the request URL contains `screenshots_per_page=3000&screenshots_page=1`

## Backward Compatibility

The `usersAPI.js` service maintains backward compatibility:
- New parameters: `screenshots_page`, `screenshots_per_page`
- Falls back to old parameters if new ones not provided: `page`, `page_size`

## Default Values

| Parameter | Old Default | New Default |
|-----------|-------------|-------------|
| screenshots_per_page | 50 | 3000 |
| screenshots_page | 1 | 1 |

## Notes

- The API now loads 3000 screenshots per page by default (increased from 50)
- This matches the production API endpoint structure
- All date filtering still works the same way
- The proxy configuration ensures seamless development experience
