"""
All Registered Users API - GET all registered users with full profile data
Endpoint: /api/auth/register/users
"""

import logging
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Count, Q
from django.db import transaction
from apps.users.models import UserProfile

logger = logging.getLogger(__name__)


class AllRegisteredUsersAPIView(APIView):
    """
    API View to get all registered users with their profile information
    GET /api/auth/register/users - Get all users
    POST /api/auth/register/users - Register a new user
    """
    
    permission_classes = [AllowAny]  # No authentication required
    
    def get(self, request):
        """
        GET all registered users with profile data including numeric_value
        
        Query Parameters:
        - include_inactive: Include inactive users (default: false)
        - with_profiles_only: Only users with extended profiles (default: false)
        - limit: Limit number of results (default: all)
        - search: Search in username, email, first_name, last_name
        """
        
        try:
            # Get query parameters
            include_inactive = request.GET.get('include_inactive', 'false').lower() == 'true'
            with_profiles_only = request.GET.get('with_profiles_only', 'false').lower() == 'true'
            limit = request.GET.get('limit')
            search = request.GET.get('search', '').strip()
            
            # Base queryset
            users = User.objects.all()
            
            # Filter active users only (unless specified)
            if not include_inactive:
                users = users.filter(is_active=True)
            
            # Filter users with profiles only
            if with_profiles_only:
                users = users.filter(profile__isnull=False)
            
            # Search functionality
            if search:
                users = users.filter(
                    Q(username__icontains=search) |
                    Q(email__icontains=search) |
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search)
                )
            
            # Order by date joined (newest first)
            users = users.order_by('-date_joined')
            
            # Apply limit
            if limit:
                try:
                    limit = int(limit)
                    if limit > 0:
                        users = users[:limit]
                except ValueError:
                    pass
            
            # Serialize user data
            users_data = []
            for user in users:
                user_data = {
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}".strip() or None,
                    "date_joined": user.date_joined.isoformat(),
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "is_active": user.is_active,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                    "profile": None
                }
                
                # Add profile information if available
                try:
                    if hasattr(user, 'profile'):
                        profile = user.profile
                        user_data["profile"] = {
                            "organization_name": profile.organization_name,
                            "country": profile.country,
                            "phone_number": profile.phone_number,
                            "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                            "bio": profile.bio,
                            "job_title": profile.job_title,
                            "industry": profile.industry,
                            "experience_level": profile.experience_level,
                            "numeric_value": profile.numeric_value,  # NEW FIELD
                            "profile_completed": profile.profile_completed,
                            "email_notifications": profile.email_notifications,
                            "privacy_level": profile.privacy_level,
                            "created_at": profile.created_at.isoformat() if profile.created_at else None,
                            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
                            "completion_percentage": profile.get_completion_percentage() if hasattr(profile, 'get_completion_percentage') else None
                        }
                except Exception as e:
                    logger.warning(f"Error accessing profile for user {user.id}: {e}")
                    user_data["profile"] = {"error": "Profile data unavailable"}
                
                users_data.append(user_data)
            
            # Calculate statistics
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            users_with_profiles = User.objects.filter(profile__isnull=False).count()
            users_with_numeric_values = UserProfile.objects.exclude(numeric_value=0).count()
            
            # Numeric value statistics
            numeric_stats = None
            if users_with_profiles > 0:
                from django.db.models import Min, Max, Avg, Sum
                numeric_stats = UserProfile.objects.aggregate(
                    min_value=Min('numeric_value'),
                    max_value=Max('numeric_value'),
                    avg_value=Avg('numeric_value'),
                    sum_value=Sum('numeric_value'),
                    count_non_zero=Count('id', filter=Q(numeric_value__gt=0))
                )
            
            return Response({
                "status": "success",
                "message": f"Retrieved {len(users_data)} registered users",
                "data": {
                    "users": users_data,
                    "statistics": {
                        "total_users": total_users,
                        "active_users": active_users,
                        "inactive_users": total_users - active_users,
                        "users_with_profiles": users_with_profiles,
                        "users_with_numeric_values": users_with_numeric_values,
                        "returned_count": len(users_data),
                        "numeric_value_stats": numeric_stats
                    },
                    "filters_applied": {
                        "include_inactive": include_inactive,
                        "with_profiles_only": with_profiles_only,
                        "search": search if search else None,
                        "limit": limit
                    }
                },
                "metadata": {
                    "timestamp": timezone.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": "/api/auth/register/users",
                    "total_registered_users": total_users
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving registered users: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An error occurred while retrieving registered users",
                "error_code": "RETRIEVAL_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        POST method to register a new user with profile information
        
        Required fields:
        - username: Unique username
        - email: Unique email address
        - password: User password
        
        Optional fields:
        - first_name: User's first name
        - last_name: User's last name
        - organization_name: User's organization
        - country: User's country
        - phone_number: User's phone number
        - job_title: User's job title
        - industry: User's industry
        - numeric_value: Numeric value parameter (default: 0)
        """
        
        try:
            # Get data from request
            data = request.data
            
            # Required fields
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '').strip()
            
            # Optional fields
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            organization_name = data.get('organization_name', '').strip()
            country = data.get('country', '').strip()
            phone_number = data.get('phone_number', '').strip()
            job_title = data.get('job_title', '').strip()
            industry = data.get('industry', '').strip()
            numeric_value = data.get('numeric_value', 0)
            
            # Validation
            if not username:
                return Response({
                    "status": "error",
                    "message": "Username is required",
                    "error_code": "MISSING_USERNAME",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not email:
                return Response({
                    "status": "error",
                    "message": "Email is required",
                    "error_code": "MISSING_EMAIL",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not password:
                return Response({
                    "status": "error",
                    "message": "Password is required",
                    "error_code": "MISSING_PASSWORD",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return Response({
                    "status": "error",
                    "message": f"Username '{username}' already exists",
                    "error_code": "USERNAME_EXISTS",
                    "existing_user": {
                        "username": username,
                        "status": "already_registered"
                    },
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=email).exists():
                existing_user = User.objects.get(email=email)
                return Response({
                    "status": "error",
                    "message": f"Email '{email}' already exists",
                    "error_code": "EMAIL_EXISTS",
                    "existing_user": {
                        "username": existing_user.username,
                        "email": email,
                        "status": "already_registered"
                    },
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate numeric_value
            try:
                numeric_value = int(numeric_value) if numeric_value else 0
            except (ValueError, TypeError):
                numeric_value = 0
            
            # Create user with transaction for data integrity
            with transaction.atomic():
                # Create the user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )
                
                # Create or update the user profile
                profile, created = UserProfile.objects.get_or_create(user=user)
                
                # Update profile fields
                profile.organization_name = organization_name if organization_name else None
                profile.country = country if country else None
                profile.phone_number = phone_number if phone_number else None
                profile.job_title = job_title if job_title else None
                profile.industry = industry if industry else None
                profile.numeric_value = numeric_value
                
                # Mark profile as completed if essential fields are filled
                if first_name and last_name and organization_name and country:
                    profile.profile_completed = True
                
                profile.save()
                
                logger.info(f"New user registered: {username} ({email}) with numeric_value: {numeric_value}")
                
                # Prepare response data
                user_data = {
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}".strip() or None,
                    "date_joined": user.date_joined.isoformat(),
                    "is_active": user.is_active,
                    "profile": {
                        "organization_name": profile.organization_name,
                        "country": profile.country,
                        "phone_number": profile.phone_number,
                        "job_title": profile.job_title,
                        "industry": profile.industry,
                        "numeric_value": profile.numeric_value,
                        "profile_completed": profile.profile_completed,
                        "email_notifications": profile.email_notifications,
                        "privacy_level": profile.privacy_level
                    }
                }
                
                return Response({
                    "status": "success",
                    "message": "User registered successfully",
                    "data": {
                        "user": user_data,
                        "registration_details": {
                            "profile_created": created,
                            "profile_completed": profile.profile_completed,
                            "numeric_value_set": numeric_value
                        }
                    },
                    "metadata": {
                        "timestamp": timezone.now().isoformat(),
                        "api_version": "1.0.0",
                        "endpoint": "/api/auth/register/users"
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error registering user: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An error occurred while registering the user",
                "error_code": "REGISTRATION_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)