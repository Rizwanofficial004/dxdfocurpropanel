# Notification System Implementation

## Overview
The notification system has been implemented to replace static notifications with dynamic ones triggered by the `folder-message` API endpoint.

## API Endpoint
- **URL**: `https://dxdtime.ddsolutions.io/api/folder-message/`
- **Method**: POST
- **Body**: `{}` (empty JSON object)
- **Response**: Array of user data objects


## Files Modified/Created

### 1. `src/services/notificationService.js` (NEW)
This service handles:
- API calls to the folder-message endpoint
- Event subscription/notification system
- Automatic polling (every 60 seconds by default)
- Listener management for multiple subscribers

**Key Methods:**
- `checkForNotifications()` - Calls the API and triggers notifications
- `subscribe(callback)` - Register a listener for notifications
- `startPolling(intervalMs)` - Start automatic polling
- `stopPolling()` - Stop polling
- `manualCheck()` - Manually trigger a check

### 2. `src/dashboard/components/layout/Header.jsx` (MODIFIED)
Updated to:
- Remove static notification data
- Import and use `notificationService`
- Subscribe to notification events
- Display dynamic notifications from the API
- Auto-start polling when component mounts
- Clean up on component unmount

**Key Changes:**
```javascript
// Import notification service
import notificationService from '../../../services/notificationService';

// Use state for dynamic notifications
const [notifications, setNotifications] = useState([]);

// Subscribe to notification service
useEffect(() => {
  const handleNotification = (data) => {
    // Convert API response to notification objects
    if (data && Array.isArray(data) && data.length > 0) {
      const newNotifications = data.map((userData, index) => ({
        id: `folder-msg-${Date.now()}-${index}`,
        type: 'info',
        icon: '📁',
        text: `New folder message from ${userData.name || userData.email}`,
        detail: userData.email,
        time: 'Just now',
        isRead: false,
        timestamp: Date.now(),
        userData: userData
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  const unsubscribe = notificationService.subscribe(handleNotification);
  notificationService.startPolling(60000); // Poll every 60 seconds
  
  return () => {
    unsubscribe();
    notificationService.stopPolling();
  };
}, []);
```

## How It Works

1. **Initialization**: When the Header component mounts, it subscribes to the notification service
2. **Polling**: The service automatically polls the folder-message API every 60 seconds
3. **Event Trigger**: When the API is called, the backend triggers an event
4. **Notification Creation**: The response data is converted into notification objects
5. **Display**: New notifications appear at the top of the notification dropdown
6. **User Interaction**: 
   - Users can click on a notification to mark it as read
   - Users can clear all notifications with the "Clear All" button

## Integration with Existing Code

The notification service is also used in the RealTime Activity section where profile URLs are fetched from the `sync-staffs` API. The same pattern is followed:

```javascript
// Example from ActivityStream.jsx
const getProfilePhotoUrl = (user) => {
  if (!user || !user.profile_url || !user.staff_id) {
    return null;
  }
  
  return `https://crm.deluxebilisim.com/uploads/staff_profile_images/${user.staff_id}/small_${encodeURIComponent(user.profile_url)}`;
};
```

## Configuration

### Polling Interval
Default: 60 seconds (60000 ms)

To change the polling interval, modify the parameter in Header.jsx:
```javascript
notificationService.startPolling(30000); // 30 seconds
```

### Manual Trigger
You can manually trigger a notification check:
```javascript
notificationService.manualCheck();
```

## Features

✅ Dynamic notifications from API events
✅ Automatic polling every 60 seconds
✅ Mark notifications as read
✅ Clear all notifications
✅ Unread notification counter badge
✅ No static notifications
✅ Event-driven architecture
✅ Singleton service pattern
✅ Clean subscription/unsubscription
✅ Memory leak prevention

## Future Enhancements

Potential improvements:
- Add notification preferences (enable/disable)
- Implement notification history persistence
- Add sound/desktop notifications
- Filter notifications by type
- Add notification action buttons
- Implement real-time WebSocket connection instead of polling

## Testing

To test the notification system:

1. Open the application
2. The notification service will automatically start polling
3. Check browser console for logs:
   - `🔔 Setting up notification listener`
   - `🔄 Starting notification polling every X seconds`
   - `📬 Folder-message API response: ...`
4. When the API triggers, a new notification will appear
5. Click the bell icon to view notifications
6. Click on a notification to mark it as read
7. Click "Clear All" to remove all notifications

## Debug Commands

Open browser console and run:
```javascript
// Check if service is polling
notificationService.isPollinging()

// Get last check time
notificationService.getLastCheck()

// Manually trigger check
notificationService.manualCheck()

// Stop polling
notificationService.stopPolling()

// Start polling
notificationService.startPolling(60000)
```
