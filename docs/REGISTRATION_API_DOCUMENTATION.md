# Registration API Documentation

## 📝 Frontend Registration Request

### API Endpoint
```
POST /auth/register/
```

### Request Headers
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### Request Body Structure
```json
{
  "email": "admin@company.com",
  "password": "securePassword123",
  "organization_name": "Company Name Ltd",
  "country": "Cyprus",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Field Validations
- **email**: Required, valid email format
- **password**: Required, minimum 6 characters
- **organization_name**: Required, company/organization name
- **country**: Required, selected from dropdown
- **first_name**: Optional, user's first name
- **last_name**: Optional, user's last name

---

## 🎯 Expected API Response

### Success Response (Status: 201 Created)
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": 123,
      "email": "admin@company.com",
      "username": "admin@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "is_staff": true,
      "is_superuser": true,
      "role": "admin",
      "permissions": ["read", "write", "delete", "admin"],
      "organization": {
        "id": 456,
        "name": "Company Name Ltd",
        "country": "Cyprus",
        "subscription_plan": "free",
        "max_users": 3,
        "created_at": "2025-09-05T10:30:00Z"
      },
      "profile_picture": null,
      "last_login": null,
      "date_joined": "2025-09-05T10:30:00Z"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}
```

### Error Response (Status: 400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["This email is already registered"],
    "password": ["Password must be at least 6 characters"],
    "organization_name": ["This field is required"]
  }
}
```

### Error Response (Status: 422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Email already exists",
  "detail": "An account with this email address already exists"
}
```

---

## 🐍 Django Backend Implementation

### 1. **Django Serializer (serializers.py)**
```python
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Organization, UserProfile

class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        min_length=6
    )
    organization_name = serializers.CharField(max_length=255, required=True)
    country = serializers.CharField(max_length=100, required=True)
    first_name = serializers.CharField(max_length=30, required=False, default='')
    last_name = serializers.CharField(max_length=30, required=False, default='')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value

    def create(self, validated_data):
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_staff=True,
            is_active=True
        )
        
        # Create organization
        organization = Organization.objects.create(
            name=validated_data['organization_name'],
            country=validated_data['country'],
            owner=user,
            subscription_plan='free',
            max_users=3
        )
        
        # Create user profile
        UserProfile.objects.create(
            user=user,
            organization=organization,
            role='admin'
        )
        
        return user
```

### 2. **Django Models (models.py)**
```python
from django.db import models
from django.contrib.auth.models import User

class Organization(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_organizations')
    subscription_plan = models.CharField(max_length=50, default='free')
    max_users = models.IntegerField(default=3)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.organization.name}"
```

### 3. **Django View (views.py)**
```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import RegistrationSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        serializer = RegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            # Create user and organization
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Prepare response data
            user_data = {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'role': 'admin',
                'permissions': ['read', 'write', 'delete', 'admin'],
                'organization': {
                    'id': user.userprofile.organization.id,
                    'name': user.userprofile.organization.name,
                    'country': user.userprofile.organization.country,
                    'subscription_plan': user.userprofile.organization.subscription_plan,
                    'max_users': user.userprofile.organization.max_users,
                    'created_at': user.userprofile.organization.created_at.isoformat()
                },
                'profile_picture': None,
                'last_login': None,
                'date_joined': user.date_joined.isoformat()
            }
            
            return Response({
                'success': True,
                'message': 'Account created successfully',
                'data': {
                    'user': user_data,
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                        'expires_in': 3600
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        else:
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Registration failed',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### 4. **Django URLs (urls.py)**
```python
from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.register_user, name='register_user'),
    path('auth/login/', views.login_user, name='login_user'),
    path('auth/logout/', views.logout_user, name='logout_user'),
    path('auth/refresh/', views.refresh_token, name='refresh_token'),
]
```

---

## 🔧 Frontend Integration

### Current Frontend Implementation
The registration form automatically:
1. Validates all required fields
2. Sends POST request to `/auth/register/`
3. Handles success/error responses
4. Stores JWT tokens in localStorage/sessionStorage
5. Redirects to dashboard on success

### Frontend Error Handling
```javascript
// Success Handler
if (response.ok) {
  const userData = await response.json();
  login(userData.data.user); // Update auth context
  navigate('/dashboard/overview');
}

// Error Handler
const errorData = await response.json();
setErrors({
  general: errorData.message || 'Registration failed'
});
```

---

## 🧪 API Testing

### cURL Example
```bash
curl -X POST http://localhost:8000/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "securepass123",
    "organization_name": "Test Company",
    "country": "Cyprus",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Postman Collection
```json
{
  "name": "User Registration",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"email\": \"admin@testcompany.com\",\n  \"password\": \"securePassword123\",\n  \"organization_name\": \"Test Company Ltd\",\n  \"country\": \"Cyprus\",\n  \"first_name\": \"John\",\n  \"last_name\": \"Doe\"\n}"
    },
    "url": {
      "raw": "{{API_BASE_URL}}/auth/register/",
      "host": ["{{API_BASE_URL}}"],
      "path": ["auth", "register", ""]
    }
  }
}
```

---

## 📊 Database Schema

### Required Tables
1. **auth_user** (Django default)
2. **organizations** (Custom)
3. **user_profiles** (Custom)

### Migration Command
```bash
python manage.py makemigrations
python manage.py migrate
```

This documentation provides everything you need to implement the registration API on your Django backend. The frontend is already configured to work with this API structure.
