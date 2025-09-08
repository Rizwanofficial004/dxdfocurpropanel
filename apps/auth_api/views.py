"""
Authentication API Views for Login/Registration/User Management
Provides JWT token-based authentication with MySQL database integration
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import connection
import json
import logging
import hashlib
from datetime import datetime, timedelta
import jwt
from django.conf import settings

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    """
    Login API - Authenticate users and return JWT token
    
    POST /api/auth/login/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        POST /api/auth/login/
        
        Authenticate user with username/email and password
        
        Request Body:
        {
            "username": "user@example.com",
            "password": "password123"
        }
        
        Response:
        {
            "status": "success",
            "token": "jwt_token_here",
            "user": {
                "id": 1,
                "username": "user@example.com",
                "email": "user@example.com",
                "first_name": "John",
                "last_name": "Doe"
            }
        }
        """
        try:
            data = request.data
            username = data.get('username', '').strip()
            password = data.get('password', '')
            
            if not username or not password:
                return Response({
                    'status': 'error',
                    'message': 'Username and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Authenticate user
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                if user.is_active:
                    # Generate or get token (without session login to avoid cache issues)
                    token, created = Token.objects.get_or_create(user=user)
                    
                    # Generate JWT token
                    jwt_payload = {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'exp': datetime.utcnow() + timedelta(days=7),  # 7 days expiry
                        'iat': datetime.utcnow()
                    }
                    
                    jwt_token = jwt.encode(jwt_payload, settings.SECRET_KEY, algorithm='HS256')
                    
                    # Update last login time
                    user.last_login = datetime.now()
                    user.save(update_fields=['last_login'])
                    
                    # Log login activity
                    self._log_login_activity(user, request, 'success')
                    
                    return Response({
                        'status': 'success',
                        'message': 'Login successful',
                        'token': jwt_token,
                        'drf_token': token.key,  # Django REST Framework token
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'is_staff': user.is_staff,
                            'is_superuser': user.is_superuser,
                            'last_login': user.last_login.isoformat() if user.last_login else None,
                            'date_joined': user.date_joined.isoformat()
                        },
                        'login_time': datetime.now().isoformat()
                    }, status=status.HTTP_200_OK)
                else:
                    # User account is disabled
                    self._log_login_activity(user, request, 'disabled_account')
                    return Response({
                        'status': 'error',
                        'message': 'User account is disabled'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                # Invalid credentials
                self._log_login_activity(None, request, 'invalid_credentials', username)
                return Response({
                    'status': 'error',
                    'message': 'Invalid username or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            logger.error(f"Login API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Login failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _log_login_activity(self, user, request, result, attempted_username=None):
        """Log login activity to database"""
        try:
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            # Get user agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Log to database (you can customize this)
            logger.info(f"Login attempt: User={user.username if user else attempted_username}, "
                       f"Result={result}, IP={ip_address}, UA={user_agent[:100]}")
        except Exception as e:
            logger.error(f"Error logging login activity: {str(e)}")


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    """
    Logout API - Invalidate user token
    
    POST /api/auth/logout/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        POST /api/auth/logout/
        
        Logout user and invalidate token
        """
        try:
            # Delete user token
            Token.objects.filter(user=request.user).delete()
            
            # Note: Not calling Django logout() to avoid session issues with DummyCache
            
            logger.info(f"User {request.user.username} logged out successfully")
            
            return Response({
                'status': 'success',
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Logout API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Logout failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    """
    Registration API - Create new user accounts
    
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        POST /api/auth/register/
        
        Create new user account
        
        Request Body:
        {
            "username": "newuser@example.com",
            "email": "newuser@example.com",
            "password": "password123",
            "first_name": "John",
            "last_name": "Doe"
        }
        """
        try:
            data = request.data
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            
            # Validation
            if not username or not email or not password:
                return Response({
                    'status': 'error',
                    'message': 'Username, email, and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    'status': 'error',
                    'message': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                return Response({
                    'status': 'error',
                    'message': 'Email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Generate token
            token, created = Token.objects.get_or_create(user=user)
            
            logger.info(f"New user registered: {username}")
            
            return Response({
                'status': 'success',
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                },
                'token': token.key
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileAPIView(APIView):
    """
    User Profile API - Get/Update user profile
    
    GET /api/auth/profile/ - Get user profile
    PUT /api/auth/profile/ - Update user profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        GET /api/auth/profile/
        
        Get current user profile
        """
        try:
            user = request.user
            
            return Response({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'date_joined': user.date_joined.isoformat()
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile API GET error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to get profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """
        PUT /api/auth/profile/
        
        Update user profile
        """
        try:
            user = request.user
            data = request.data
            
            # Update allowed fields
            if 'first_name' in data:
                user.first_name = data['first_name']
            if 'last_name' in data:
                user.last_name = data['last_name']
            if 'email' in data:
                user.email = data['email']
            
            user.save()
            
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile API PUT error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to update profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class DatabaseTestAPIView(APIView):
    """
    Database Test API - Test MySQL connection and user tables
    
    GET /api/auth/database-test/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        GET /api/auth/database-test/
        
        Test MySQL database connection and show user statistics
        """
        try:
            # Test database connection
            with connection.cursor() as cursor:
                # Test basic connection
                cursor.execute("SELECT VERSION()")
                mysql_version = cursor.fetchone()[0]
                
                # Get user count
                cursor.execute("SELECT COUNT(*) FROM auth_user")
                user_count = cursor.fetchone()[0]
                
                # Get recent users
                cursor.execute("""
                    SELECT id, username, email, first_name, last_name, 
                           is_active, date_joined, last_login 
                    FROM auth_user 
                    ORDER BY date_joined DESC 
                    LIMIT 5
                """)
                recent_users = cursor.fetchall()
                
                recent_users_data = []
                for user in recent_users:
                    recent_users_data.append({
                        'id': user[0],
                        'username': user[1],
                        'email': user[2],
                        'first_name': user[3],
                        'last_name': user[4],
                        'is_active': bool(user[5]),
                        'date_joined': user[6].isoformat() if user[6] else None,
                        'last_login': user[7].isoformat() if user[7] else None
                    })
                
                # Test table structure
                cursor.execute("SHOW TABLES LIKE 'auth_%'")
                auth_tables = [table[0] for table in cursor.fetchall()]
                
                return Response({
                    'status': 'success',
                    'message': 'MySQL database connection successful',
                    'database_info': {
                        'mysql_version': mysql_version,
                        'connection_status': 'Connected',
                        'host': settings.DATABASES['default']['HOST'],
                        'database': settings.DATABASES['default']['NAME']
                    },
                    'user_statistics': {
                        'total_users': user_count,
                        'auth_tables': auth_tables,
                        'recent_users': recent_users_data
                    },
                    'test_time': datetime.now().isoformat()
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Database test error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Database connection failed: {str(e)}',
                'database_info': {
                    'connection_status': 'Failed',
                    'error': str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
