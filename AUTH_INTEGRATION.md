# Authentication System Integration

## Overview
This authentication system integrates with backend API endpoints and supports both username and email login. It automatically switches between:
- **Production**: `http://dxdtime.ddsolutions.io/api/auth/login/`
- **Local Development**: `http://localhost:8000/api/auth/login/`

## Features

### ✅ Login Authentication
- **Flexible Login**: Supports both username and email authentication
- **Real-time Validation**: Client-side validation with immediate feedback
- **API Integration**: Connects to production (`http://dxdtime.ddsolutions.io/api/auth/login/`) or local (`http://localhost:8000/api/auth/login/`) automatically
- **Error Handling**: Comprehensive error handling for various scenarios
- **Remember Me**: Option to save login credentials locally
- **Loading States**: Visual feedback during authentication process

### ✅ Security Features
- **Token Management**: Automatic JWT token handling and storage
- **Token Refresh**: Automatic token refresh when expired
- **Protected Routes**: Routes are protected and redirect to login if unauthenticated
- **Session Persistence**: Authentication state persists across browser sessions
- **Secure Storage**: Tokens stored in localStorage with proper cleanup

### ✅ User Experience
- **Multi-language Support**: English and Turkish translations
- **Responsive Design**: Works on all device sizes
- **Visual Feedback**: Loading spinners, success/error messages
- **Theme Support**: Integrates with existing theme system
- **Accessibility**: Proper form labels and validation messages

## Environment Configuration

### API Endpoints
The system automatically detects the environment and uses the appropriate API endpoint:

#### Production Environment
- **Base URL**: `http://dxdtime.ddsolutions.io`
- **Login Endpoint**: `http://dxdtime.ddsolutions.io/api/auth/login/`
- **Used when**: Running on production server or when `NODE_ENV=production`

#### Local Development Environment  
- **Base URL**: `http://localhost:8000`
- **Login Endpoint**: `http://localhost:8000/api/auth/login/`
- **Used when**: Running on localhost or when `NODE_ENV=development`

### Environment Detection
```javascript
const getBaseURL = () => {
  // Check if running in production
  if (process.env.NODE_ENV === 'production' || 
      window.location.hostname !== 'localhost') {
    return 'http://dxdtime.ddsolutions.io';
  }
  // Default to local development
  return 'http://localhost:8000';
};
```

## API Integration

### Login Request Format
```json
{
  "username": "Admin",           // Can be username or email
  "password": "admin123",
  "remember_me": true           // Optional
}
```

### Expected Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "Admin",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",  // or "access"
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  // or "refresh"
  }
}
```

## Files Created/Modified

### New Files
1. **`src/services/api.js`** - Centralized API service with axios configuration
2. **`src/contexts/AuthContext.jsx`** - Global authentication state management
3. **`src/components/ProtectedRoute.jsx`** - Route protection component

### Modified Files
1. **`src/auth/pages/Login.jsx`** - Updated to use username/email and API integration
2. **`src/App.jsx`** - Added AuthProvider and protected routes
3. **`src/dashboard/context/LanguageContext.jsx`** - Added username-related translations

## Error Handling

The system handles various error scenarios:

- **400 Bad Request**: Invalid input format
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Account blocked/verification required
- **429 Too Many Requests**: Rate limiting
- **500 Server Error**: Backend issues
- **Network Errors**: Connection issues
- **Timeout Errors**: Request timeouts

## Validation

### Client-side Validation
- **Username/Email**: Required, minimum 3 characters, email format validation if contains @
- **Password**: Required, minimum 6 characters
- **Real-time Feedback**: Validation messages appear as user types

### Server-side Integration
- Handles server validation errors
- Displays field-specific error messages
- Graceful fallback for unexpected errors

## Usage Examples

### Login with Username
```javascript
await login({
  username: "Admin",
  password: "admin123",
  remember_me: true
});
```

### Login with Email
```javascript
await login({
  username: "admin@example.com",
  password: "admin123",
  remember_me: false
});
```

### Using Auth Context
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user.first_name}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes
```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Environment Setup

### Dependencies Added
- `axios` - HTTP client for API requests

### Development Server
The application runs on `http://localhost:5174/` and automatically connects to:
- **Local API**: `http://localhost:8000/api/auth/login/` (development)
- **Production API**: `http://dxdtime.ddsolutions.io/api/auth/login/` (production)

### Environment Variables (Optional)
You can override the default behavior using environment variables:

```bash
# For production
NODE_ENV=production

# For local development
NODE_ENV=development

# Custom API URL (optional)
REACT_APP_API_URL=http://custom-api-url.com
```

## Testing Credentials

Based on your Postman example:
- **Username**: `Admin`
- **Password**: `admin123`

## Next Steps

1. **Backend APIs**: Ensure both APIs are running:
   - **Production**: `http://dxdtime.ddsolutions.io/api/auth/login/`
   - **Local**: `http://localhost:8000/api/auth/login/`
2. **CORS Configuration**: Configure CORS on both servers to allow requests from `http://localhost:5174`
3. **Environment Variables**: Set up proper environment detection
4. **SSL/HTTPS**: Consider implementing HTTPS for production
5. **Rate Limiting**: Implement proper rate limiting on both backends
6. **Password Strength**: Add password strength requirements
7. **Two-Factor Authentication**: Consider adding 2FA for enhanced security

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS settings allow the frontend origin
2. **Network Errors**: Check if backend API is running
3. **Token Issues**: Clear localStorage if experiencing authentication problems
4. **Validation Errors**: Check console for detailed error messages

### Debug Commands
```bash
# Check if production API is running
curl http://dxdtime.ddsolutions.io/api/auth/login/

# Check if local API is running  
curl http://localhost:8000/api/auth/login/

# Clear authentication data
localStorage.clear()

# Check current auth state
console.log(localStorage.getItem('authToken'))

# Check current environment
console.log('Environment:', process.env.NODE_ENV)
console.log('API Base URL:', getBaseURL())
```

The authentication system is now fully integrated and ready for use with your backend API!
