# Screenshot Timer Functionality - Backend Integration

## Overview
The enhanced timer functionality now captures screenshots at specified intervals for each user.

## How It Works

1. **Set Timer**: Enter seconds (1-3600) for screenshot interval
2. **Start Timer**: Click START to begin automatic screenshot capture
3. **Live Countdown**: Shows time until next screenshot
4. **Screenshot Counter**: Displays total screenshots taken
5. **Stop Timer**: Click STOP to end screenshot capture

## Frontend Features

- ⏱️ **Interval Timer**: Set custom intervals in seconds
- 📸 **Auto Screenshot**: Captures screenshots automatically
- 🔄 **Live Countdown**: Shows remaining time until next capture
- 📊 **Screenshot Counter**: Tracks total screenshots per user
- ⏹️ **Start/Stop Control**: Easy timer management
- 🎯 **User-Specific**: Each user has independent timer

## API Endpoint Required

The frontend calls this endpoint to trigger screenshots:

### POST `/api/dashboard/capture-screenshot/`

**Request Body:**
```json
{
  "user_id": 24,
  "username": "sample_user",
  "timestamp": "2025-09-19T10:30:00.000Z"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Screenshot captured successfully",
  "data": {
    "user_id": 24,
    "screenshot_id": "12345",
    "timestamp": "2025-09-19T10:30:00.000Z",
    "filename": "screenshot_24_20250919103000.png"
  }
}
```

## Django Backend Implementation

Add this to your Django views:

```python
# In apps/dashboard/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import datetime

@csrf_exempt
@require_http_methods(["POST"])
def capture_screenshot(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        username = data.get('username')
        timestamp = data.get('timestamp')
        
        # TODO: Implement actual screenshot capture logic here
        # This could involve:
        # 1. Sending command to user's client application
        # 2. Saving screenshot to S3/local storage
        # 3. Recording screenshot metadata in database
        
        # For now, return success response
        screenshot_id = f"ss_{user_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return JsonResponse({
            "status": "success",
            "message": "Screenshot captured successfully",
            "data": {
                "user_id": user_id,
                "screenshot_id": screenshot_id,
                "timestamp": timestamp,
                "filename": f"screenshot_{user_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            }
        })
        
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Screenshot capture failed: {str(e)}"
        }, status=500)
```

Add to your `apps/dashboard/urls.py`:

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... your existing URLs
    path('capture-screenshot/', views.capture_screenshot, name='capture_screenshot'),
]
```

## Usage Instructions

1. **Start the timer**: 
   - Enter desired interval in seconds (e.g., 5 for every 5 seconds)
   - Click "START" button
   - First screenshot is taken immediately
   - Subsequent screenshots taken at specified intervals

2. **Monitor progress**:
   - "Next: Xs" shows countdown to next screenshot
   - "📸 X shots" shows total screenshots taken

3. **Stop the timer**:
   - Click "STOP" button to end screenshot capture
   - Timer can be restarted with new interval

## Current Status

✅ **Frontend Implementation**: Complete with fallback simulation
✅ **Timer Management**: Start/stop functionality working
✅ **Countdown Display**: Live countdown until next screenshot  
✅ **Screenshot Counter**: Tracks screenshots per user
⏳ **Backend Endpoint**: Needs implementation (see above)

## Demo Mode

Currently runs in demo mode with simulated screenshot capture when backend endpoint is not available. Real screenshots will be captured once the Django endpoint is implemented.