"""
Authentication API Views for Login/Registration/User Management
Provides comprehensive authentication with unique email validation
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
from django.db import connection, IntegrityError
import json
import logging
import hashlib
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserProfileSerializer,
    PasswordChangeSerializer
)

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
        
        Authenticate user with email/username and password
        Uses UserLoginSerializer for validation
        """
        try:
            serializer = UserLoginSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'status': 'error',
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            validated_data = serializer.validated_data
            email_or_username = validated_data['email_or_username']
            password = validated_data['password']
            
            # Try to find user by email first, then username
            user = None
            try:
                user = User.objects.get(email=email_or_username)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(username=email_or_username)
                except User.DoesNotExist:
                    pass
            
            if user and user.check_password(password):
                if user.is_active:
                    # Generate or get token
                    token, created = Token.objects.get_or_create(user=user)
                    
                    # Generate JWT token
                    jwt_payload = {
                        'user_id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'exp': datetime.utcnow() + timedelta(days=7),
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
                        'drf_token': token.key,
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
                    self._log_login_activity(user, request, 'disabled_account')
                    return Response({
                        'status': 'error',
                        'message': 'User account is disabled'
                    }, status=status.HTTP_401_UNAUTHORIZED)
            else:
                self._log_login_activity(None, request, 'invalid_credentials', email_or_username)
                return Response({
                    'status': 'error',
                    'message': 'Invalid email/username or password'
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
    Registration API - Create new user accounts with unique email validation
    
    POST /api/auth/register/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        POST /api/auth/register/
        
        Create new user account with comprehensive validation
        Uses UserRegistrationSerializer for unique email validation
        """
        try:
            serializer = UserRegistrationSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response({
                    'status': 'error',
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get validated data
            validated_data = serializer.validated_data
            
            try:
                # Create user (serializer already validates uniqueness)
                user = User.objects.create_user(
                    username=validated_data['username'],
                    email=validated_data['email'],
                    password=validated_data['password'],
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', '')
                )
                
                # Generate authentication token
                token, created = Token.objects.get_or_create(user=user)
                
                logger.info(f"New user registered with unique email: {validated_data['email']}")
                
                return Response({
                    'status': 'success',
                    'message': 'User registered successfully with unique email',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'date_joined': user.date_joined.isoformat()
                    },
                    'token': token.key
                }, status=status.HTTP_201_CREATED)
                
            except IntegrityError as e:
                # Handle database-level unique constraint violations
                logger.error(f"Registration IntegrityError: {str(e)}")
                if 'email' in str(e).lower():
                    return Response({
                        'status': 'error',
                        'message': 'Email address already exists',
                        'errors': {'email': ['This email is already registered']}
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif 'username' in str(e).lower():
                    return Response({
                        'status': 'error',
                        'message': 'Username already exists',
                        'errors': {'username': ['This username is already taken']}
                    }, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({
                        'status': 'error',
                        'message': 'Registration failed due to duplicate data',
                        'errors': {'non_field_errors': ['User with this information already exists']}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Registration API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileAPIView(APIView):
    """
    User Profile API - Get/Update user profile with validation
    
    GET /api/auth/profile/ - Get user profile
    PUT /api/auth/profile/ - Update user profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        GET /api/auth/profile/
        
        Get current user profile using UserProfileSerializer
        """
        try:
            serializer = UserProfileSerializer(request.user)
            
            return Response({
                'status': 'success',
                'user': serializer.data
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
        
        Update user profile using UserProfileSerializer for validation
        """
        try:
            serializer = UserProfileSerializer(
                request.user, 
                data=request.data, 
                partial=True  # Allow partial updates
            )
            
            if not serializer.is_valid():
                return Response({
                    'status': 'error',
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the updated user
            updated_user = serializer.save()
            
            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': UserProfileSerializer(updated_user).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Profile API PUT error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to update profile: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordChangeAPIView(APIView):
    """
    Password Change API - Change user password with validation
    
    POST /api/auth/change-password/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        POST /api/auth/change-password/
        
        Change user password using PasswordChangeSerializer
        """
        try:
            serializer = PasswordChangeSerializer(
                data=request.data,
                context={'user': request.user}
            )
            
            if not serializer.is_valid():
                return Response({
                    'status': 'error',
                    'message': 'Password change validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Change password
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            # Regenerate token for security
            Token.objects.filter(user=request.user).delete()
            new_token = Token.objects.create(user=request.user)
            
            logger.info(f"Password changed for user: {request.user.username}")
            
            return Response({
                'status': 'success',
                'message': 'Password changed successfully',
                'new_token': new_token.key  # Provide new token
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Password change API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Password change failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class CheckEmailAPIView(APIView):
    """
    Check Email Uniqueness API - Verify if email is already registered
    
    POST /api/auth/check-email/
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        POST /api/auth/check-email/
        
        Check if email address is already registered
        
        Request Body:
        {
            "email": "user@example.com"
        }
        
        Response:
        {
            "status": "success",
            "email_available": true/false,
            "message": "Email is available/already registered"
        }
        """
        try:
            email = request.data.get('email', '').strip().lower()
            
            if not email:
                return Response({
                    'status': 'error',
                    'message': 'Email is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate email format
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                return Response({
                    'status': 'error',
                    'message': 'Invalid email format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email exists
            email_exists = User.objects.filter(email=email).exists()
            
            return Response({
                'status': 'success',
                'email': email,
                'email_available': not email_exists,
                'message': 'Email is already registered' if email_exists else 'Email is available'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Check email API error: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Email check failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class DatabaseTestAPIView(APIView):
    """
    Database Test API - Test database connection and show user statistics
    
    GET /api/auth/database-test/
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        GET /api/auth/database-test/
        
        Test database connection and show user statistics with email uniqueness info
        """
        try:
            # Test database connection
            with connection.cursor() as cursor:
                # Test basic connection
                cursor.execute("SELECT 1")
                connection_test = cursor.fetchone()[0]
                
                # Get user count
                cursor.execute("SELECT COUNT(*) FROM auth_user")
                user_count = cursor.fetchone()[0]
                
                # Check for duplicate emails
                cursor.execute("""
                    SELECT email, COUNT(*) as count 
                    FROM auth_user 
                    WHERE email != '' 
                    GROUP BY email 
                    HAVING COUNT(*) > 1
                """)
                duplicate_emails = cursor.fetchall()
                
                # Get recent users with email info
                cursor.execute("""
                    SELECT id, username, email, first_name, last_name, 
                           is_active, date_joined, last_login 
                    FROM auth_user 
                    ORDER BY date_joined DESC 
                    LIMIT 10
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
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'auth_%'")
                auth_tables = [table[0] for table in cursor.fetchall()]
                
                return Response({
                    'status': 'success',
                    'message': 'Database connection successful',
                    'database_info': {
                        'connection_status': 'Connected',
                        'database_type': 'SQLite',
                        'database_file': settings.DATABASES['default']['NAME']
                    },
                    'user_statistics': {
                        'total_users': user_count,
                        'duplicate_emails': len(duplicate_emails),
                        'duplicate_email_details': [
                            {'email': email[0], 'count': email[1]} 
                            for email in duplicate_emails
                        ] if duplicate_emails else [],
                        'auth_tables': auth_tables,
                        'recent_users': recent_users_data
                    },
                    'authentication_features': {
                        'unique_email_validation': True,
                        'password_strength_validation': True,
                        'jwt_token_support': True,
                        'drf_token_support': True
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
