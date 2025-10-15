# 🎯 How to Search Users and View Screenshots

## Step-by-Step Guide

### Method 1: Using the Search Box

1. **Type a user's name or email**
   ```
   Example: Type "begum" or "dxd" or "nawaz"
   ```

2. **See the dropdown appear**
   - Users matching your search will appear
   - Each user shows:
     - Avatar with first letter
     - Name/Email
     - Screenshot count (📷 X screenshots)
     - Active days count

3. **Click on any user**
   - The dropdown closes
   - Search box shows green border with ✓ checkmark
   - Placeholder shows: "Selected: [username]"
   - Loading spinner appears
   - Page scrolls to screenshots section

4. **View screenshots**
   - Screenshots appear in a grid below
   - Click any screenshot to open full size

### Method 2: Using "Load All Users" Button

1. **Click the blue "📋 Load All Users" button**
   - Button shows "⏳ Loading..." while fetching
   - Dropdown appears with all users

2. **Click on any user from the list**
   - Same as Method 1 - screenshots load automatically

### Method 3: Direct Search

1. **Type in search box**: `begum`
2. **Wait 300ms** (automatic search)
3. **Dropdown shows**: "begumdamlasen" with 0 screenshots
4. **Click the user**
5. **Screenshots section appears** (even if 0 screenshots, shows "No screenshots" message)

## Visual Indicators

### ✅ User Selected
- **Green border** on search box
- **Green checkmark (✓)** on the right side
- **Placeholder changes** to show selected user

### ⏳ Loading Screenshots
- **Spinner animation** in screenshots section
- **"Loading screenshots..."** message

### ❌ No Screenshots
- **Warning icon (⚠️)**
- **Message**: "No screenshots found for this user"

### 📸 Screenshots Loaded
- **Grid view** with screenshot cards
- **Hover effect**: Cards lift up with shadow
- **Click**: Opens full-size in new tab

## Console Logs (Press F12 to see)

When you click a user, you'll see:
```
🎯 User selected from search: {user object}
📧 User email: begumdamlasen@gmail.com
👤 User display name: begumdamlasen
📸 Total screenshots: 0
📡 User has no existing data, fetching from API
🔍 Calling fetchUserScreenshots with user: {user}
📸 Fetching screenshots from: /api/users/screenshots/?q=...
```

## API Calls

### When you search:
```
GET /api/users/search/?start_date=2025-09-14&end_date=2025-10-14&q=begum
```

### When you click a user:
```
GET /api/users/screenshots/?q=begumdamlasen@gmail.com&start_date=2025-10-01&end_date=2025-10-31&page=1&page_size=20
```

## Troubleshooting

### Issue: Dropdown doesn't show
**Solution**: 
- Type at least 1 character
- Check console for API errors
- Click "Load All Users" button instead

### Issue: No users found
**Solution**:
- Try searching for 'a' (loads all users with 'a')
- Click "Load All Users" button
- Check that backend API is running on localhost:8000

### Issue: Screenshots don't load
**Solution**:
- Check console (F12) for error messages
- Verify S3 proxy is running on localhost:3001
- Check that user actually has screenshots in S3 bucket
- Look for API response in Network tab

### Issue: Search is slow
**Solution**:
- There's a 300ms debounce delay (this is intentional for better UX)
- Wait for the search to complete
- Don't type too fast

## Current Test Data

Based on your screenshot, you have:
- **1 user**: begumdamlasen@gmail.com
- **0 screenshots**: User has no screenshots yet
- **0 active days**: User has no activity recorded

## Expected Behavior

1. ✅ Search box works - Type "begum"
2. ✅ Dropdown appears - Shows "begumdamlasen"
3. ✅ Click user - Selects user and shows loading
4. ✅ Fetch API call - Calls `/api/users/screenshots/`
5. ⚠️ Shows "No screenshots" - Because user has 0 screenshots

## Adding Test Screenshots

To test with real screenshots, you need:

1. **Backend API** running on `localhost:8000`
2. **S3 bucket** with screenshots at:
   ```
   ddsfocustime.s3.eu-north-1.amazonaws.com/
   └── begumdamlasen_at_gmail.com/
       └── 2025/
           └── 10/
               └── 14/
                   └── screenshot_2025-10-14_14-30-00.png
   ```
3. **S3 Proxy** running on `localhost:3001`

## Quick Test Commands

### Test User Search
```bash
curl "http://127.0.0.1:8000/api/users/search/?start_date=2025-09-01&end_date=2025-10-14&q=begum"
```

### Test Screenshot Fetch
```bash
curl "http://127.0.0.1:8000/api/users/screenshots/?q=begumdamlasen@gmail.com&start_date=2025-10-01&end_date=2025-10-31"
```

## Success Criteria

✅ **Search works**: Type name, see dropdown  
✅ **Click works**: Click user, see loading  
✅ **API calls**: Check Network tab, see requests  
✅ **Screenshots appear**: See grid (if user has screenshots)  
✅ **Click screenshot**: Opens full size in new tab  

---

**Last Updated**: October 14, 2025  
**Status**: ✅ Fully Implemented  
**Your Current User**: begumdamlasen@gmail.com (0 screenshots)
