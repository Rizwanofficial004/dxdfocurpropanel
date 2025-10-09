# Idle Time Tracking Feature

## Overview
The Idle Time Tracking feature has been added to the DXD Focus Pro Panel dashboard to monitor and display user idle time data from the `/api/idle_time/` endpoint.

## Features Added

### 1. API Configuration
- Added `IDLE_TIME: '/api/idle_time/'` endpoint to `src/config/apiConfig.js`

### 2. Idle Time Service
- Created `src/services/idleTimeService.js` for centralized idle time API management
- Includes mock data for development/testing when API is unavailable
- Provides utility functions for formatting and calculating idle time

### 3. Enhanced Current Status Component
- Updated `src/dashboard/components/CurrentStatus/CurrentStatus.jsx`
- Now fetches and displays total idle time for all users
- Shows idle time summary below the "Idle" status count

### 4. New IdleTimeTracker Component
- Created `src/dashboard/components/IdleTimeTracker/IdleTimeTracker.jsx`
- Displays detailed idle time for each user
- Shows user names, emails, and individual idle times
- Includes refresh functionality and error handling
- Responsive design with dark mode support

### 5. Live Tracking Integration
- Added IdleTimeTracker as a sidebar component in `src/dashboard/pages/LiveTracking.jsx`
- Provides real-time idle time monitoring alongside screenshot tracking

### 6. Translations
- Added idle time related translations in `src/dashboard/context/LanguageContext.jsx`
- Supports both English and Turkish languages

## API Endpoint Expected Format

The `/api/idle_time/` endpoint should return data in the following format:

```json
{
  "status": "success",
  "data": [
    {
      "email": "user@example.com",
      "display_name": "User Name",
      "idle_time_minutes": 45,
      "last_activity": "2025-10-10T14:30:00Z"
    }
  ]
}
```

## Mock Data for Testing

When the API is not available, the system automatically falls back to mock data with sample users:
- Haseeb Ahmed (haseebcodejourney@gmail.com)
- Kiran Aiza (kiranaiza4@gmail.com)
- Nawaz Ahmed (nawaz@dxdglobal.com)
- Admin User (admin@dxdglobal.com)
- Test User (test@dxdglobal.com)

## Usage

### Viewing Idle Time Data

1. **Dashboard Current Status**: 
   - Go to the main dashboard
   - Look at the "Current Status" card
   - The "Idle" status now shows total idle time below the count

2. **Live Tracking with Idle Time Sidebar**:
   - Navigate to Live Tracking page
   - The right sidebar shows detailed idle time for each user
   - Users are sorted by idle time (highest first)
   - Click "Refresh" to update data

### API Integration

To integrate with your actual API:

1. Ensure your `/api/idle_time/` endpoint returns data in the expected format
2. The system will automatically use real API data when available
3. Mock data is used as fallback during development or when API is unavailable

### Service Methods

The `idleTimeService` provides these methods:

```javascript
import { idleTimeService } from './services/idleTimeService';

// Fetch all users idle time
const idleData = await idleTimeService.fetchAllUsersIdleTime();

// Format idle time (minutes to human readable)
const formatted = idleTimeService.formatIdleTime(minutes);

// Calculate total idle time from user array
const total = idleTimeService.calculateTotalIdleTime(users);

// Get top idle users
const topUsers = idleTimeService.getTopIdleUsers(users, 5);
```

## Customization

### Styling
- The IdleTimeTracker component uses styled-components
- Automatically adapts to light/dark theme
- Responsive design for different screen sizes

### Mock Data
- Edit `MOCK_IDLE_TIME_DATA` in `src/services/idleTimeService.js`
- Toggle mock mode with `idleTimeService.setMockMode(true)`

### Refresh Interval
- Currently manual refresh only
- Can be enhanced with auto-refresh by adding `setInterval` in components

## File Structure

```
src/
├── config/
│   └── apiConfig.js                    # Added IDLE_TIME endpoint
├── services/
│   └── idleTimeService.js              # New idle time API service
├── dashboard/
│   ├── components/
│   │   ├── index.js                    # Added IdleTimeTracker export
│   │   ├── CurrentStatus/
│   │   │   └── CurrentStatus.jsx       # Enhanced with idle time
│   │   └── IdleTimeTracker/
│   │       └── IdleTimeTracker.jsx     # New idle time component
│   ├── context/
│   │   └── LanguageContext.jsx         # Added idle time translations
│   └── pages/
│       └── LiveTracking.jsx            # Integrated IdleTimeTracker
```

## Performance Considerations

- API calls have 15-second timeout
- Mock data is used as fallback to ensure functionality
- Efficient rendering with proper React hooks
- Minimal re-renders with proper state management

## Future Enhancements

1. **Auto-refresh**: Add automatic data refresh every 30-60 seconds
2. **Filtering**: Add filters by idle time ranges or users
3. **Alerts**: Add notifications for users with excessive idle time
4. **History**: Track idle time trends over time
5. **Export**: Add ability to export idle time reports
6. **Real-time**: WebSocket integration for real-time updates

## Troubleshooting

1. **No idle time data showing**: 
   - Check browser console for API errors
   - Ensure `/api/idle_time/` endpoint is accessible
   - Verify API response format matches expected structure

2. **Mock data not showing**:
   - Check if `import.meta.env.DEV` is true
   - Verify mock data in `idleTimeService.js`

3. **Component not rendering**:
   - Check console for import/export errors
   - Verify component is properly exported in `index.js`
   - Ensure translations are available in LanguageContext