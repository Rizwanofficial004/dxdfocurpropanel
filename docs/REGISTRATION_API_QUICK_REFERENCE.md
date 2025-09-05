# Quick Registration API Summary

## 📋 Current Frontend Request

### API Endpoint
```
POST /auth/register/
```

### Request Body (JSON)
```json
{
  "email": "user@company.com",
  "password": "userPassword123",
  "organization_name": "Company Name",
  "country": "Cyprus",
  "first_name": "",
  "last_name": ""
}
```

### Frontend Form Data Mapping
```javascript
// From Registration Form:
{
  email: formData.email,           // Email input field
  password: formData.password,     // Password input field  
  organization: formData.organization, // Organization name input
  country: formData.country        // Country dropdown selection
}

// Sent to API as:
{
  email: userData.email,
  password: userData.password,
  organization_name: userData.organization,  // Note: mapped to organization_name
  country: userData.country,
  first_name: userData.firstName || '',
  last_name: userData.lastName || ''
}
```

## 🎯 Expected Response Format

### Success (201 Created)
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...", 
  "user": {
    "id": 123,
    "username": "user@company.com",
    "email": "user@company.com",
    "first_name": "",
    "last_name": "",
    "role": "admin",
    "is_superuser": true,
    "is_staff": true,
    "is_active": true,
    "permissions": ["read", "write", "delete", "admin"]
  }
}
```

### Error (400 Bad Request)
```json
{
  "detail": "Error message here",
  "message": "Registration failed"
}
```

## 🔧 Quick Django Implementation

```python
# views.py
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    
    # Create user
    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        is_staff=True
    )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': 'admin',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
            'permissions': ['read', 'write', 'delete', 'admin']
        }
    }, status=201)
```

## 📝 Test with cURL
```bash
curl -X POST http://your-api-url/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "testpass123",
    "organization_name": "Test Company",
    "country": "Cyprus"
  }'
```
