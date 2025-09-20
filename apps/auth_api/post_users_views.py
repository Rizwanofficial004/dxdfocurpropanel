"""
POST Users API - Enhanced user registration with SQL database integration
Endpoint: /api/auth/register/post_users/
"""

import logging
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import transaction, IntegrityError, models
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from apps.users.models import UserProfile
import re
import hashlib
from datetime import datetime

logger = logging.getLogger(__name__)


class PostUsersAPIView(APIView):
    """
    Enhanced API View for POST user registration with comprehensive validation
    POST /api/auth/register/post_users/ - Register a new user with full profile
    GET /api/auth/register/post_users/ - Get registration statistics
    """
    
    permission_classes = [AllowAny]  # No authentication required for registration
    
    def post(self, request):
        """
        POST method to register a new user with enhanced validation and SQL storage
        
        Required fields:
        - username: Unique username (3-30 characters)
        - email: Unique email address
        - password: Strong password (min 8 characters)
        
        Optional fields:
        - first_name: User's first name
        - last_name: User's last name
        - organization_name: User's organization
        - country: User's country
        - phone_number: User's phone number
        - job_title: User's job title
        - industry: User's industry
        - numeric_value: Numeric value parameter (default: 0)
        - bio: User's biography
        - date_of_birth: User's date of birth (YYYY-MM-DD)
        """
        
        try:
            # Get data from request
            data = request.data
            
            # Required fields validation
            username = data.get('username', '').strip()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '').strip()
            
            # Optional fields
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            organization_name = data.get('organization_name', '').strip()
            country = data.get('country', '').strip()
            phone_number = data.get('phone_number', '').strip()
            job_title = data.get('job_title', '').strip()
            industry = data.get('industry', '').strip()
            bio = data.get('bio', '').strip()
            date_of_birth = data.get('date_of_birth', None)
            numeric_value = data.get('numeric_value', 0)
            
            # Comprehensive validation
            validation_errors = {}
            
            # Username validation
            if not username:
                validation_errors['username'] = ['Username is required']
            elif len(username) < 3:
                validation_errors['username'] = ['Username must be at least 3 characters long']
            elif len(username) > 30:
                validation_errors['username'] = ['Username must not exceed 30 characters']
            elif not re.match(r'^[a-zA-Z0-9@.+_-]+$', username):
                validation_errors['username'] = ['Username may only contain letters, numbers, and @/./+/-/_ characters']
            elif User.objects.filter(username=username).exists():
                validation_errors['username'] = ['A user with this username already exists']
            
            # Email validation
            if not email:
                validation_errors['email'] = ['Email is required']
            else:
                try:
                    validate_email(email)
                except ValidationError:
                    validation_errors['email'] = ['Please enter a valid email address']
                
                if User.objects.filter(email=email).exists():
                    validation_errors['email'] = ['A user with this email address already exists']
            
            # Password validation
            if not password:
                validation_errors['password'] = ['Password is required']
            elif len(password) < 8:
                validation_errors['password'] = ['Password must be at least 8 characters long']
            elif len(password) > 128:
                validation_errors['password'] = ['Password must not exceed 128 characters']
            elif not re.search(r'[A-Za-z]', password):
                validation_errors['password'] = ['Password must contain at least one letter']
            elif not re.search(r'\d', password):
                validation_errors['password'] = ['Password must contain at least one number']
            
            # Optional field validation
            if first_name and len(first_name) > 30:
                validation_errors['first_name'] = ['First name must not exceed 30 characters']
            
            if last_name and len(last_name) > 30:
                validation_errors['last_name'] = ['Last name must not exceed 30 characters']
            
            if organization_name and len(organization_name) > 100:
                validation_errors['organization_name'] = ['Organization name must not exceed 100 characters']
            
            if phone_number and not re.match(r'^[\d\+\-\(\)\s]+$', phone_number):
                validation_errors['phone_number'] = ['Phone number contains invalid characters']
            
            # Numeric value validation
            try:
                numeric_value = int(numeric_value) if numeric_value else 0
            except (ValueError, TypeError):
                validation_errors['numeric_value'] = ['Numeric value must be a valid integer']
            
            # Date of birth validation
            parsed_dob = None
            if date_of_birth:
                try:
                    parsed_dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
                    if parsed_dob > datetime.now().date():
                        validation_errors['date_of_birth'] = ['Date of birth cannot be in the future']
                except ValueError:
                    validation_errors['date_of_birth'] = ['Invalid date format. Use YYYY-MM-DD']
            
            # Return validation errors if any
            if validation_errors:
                return Response({
                    "status": "error",
                    "message": "Validation failed",
                    "errors": validation_errors,
                    "error_code": "VALIDATION_ERROR",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user with transaction for data integrity
            with transaction.atomic():
                try:
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
                    profile.bio = bio if bio else None
                    profile.date_of_birth = parsed_dob
                    profile.numeric_value = numeric_value
                    
                    # Mark profile as completed if essential fields are filled
                    if first_name and last_name and organization_name and country:
                        profile.profile_completed = True
                    
                    profile.save()
                    
                    # Generate response data
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
                            "bio": profile.bio,
                            "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                            "numeric_value": profile.numeric_value,
                            "profile_completed": profile.profile_completed,
                            "email_notifications": profile.email_notifications,
                            "privacy_level": profile.privacy_level,
                            "completion_percentage": profile.get_completion_percentage()
                        }
                    }
                    
                    logger.info(f"New user registered via POST API: {username} ({email}) with numeric_value: {numeric_value}")
                    
                    return Response({
                        "status": "success",
                        "message": "User registered successfully",
                        "data": {
                            "user": user_data,
                            "registration_details": {
                                "profile_created": created,
                                "profile_completed": profile.profile_completed,
                                "numeric_value_set": numeric_value,
                                "validation_passed": True,
                                "sql_stored": True
                            }
                        },
                        "metadata": {
                            "timestamp": timezone.now().isoformat(),
                            "api_version": "1.0.0",
                            "endpoint": "/api/auth/register/post_users",
                            "method": "POST"
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except IntegrityError as e:
                    # Handle database-level unique constraint violations
                    logger.error(f"Registration IntegrityError: {str(e)}")
                    if 'email' in str(e).lower():
                        error_message = "Email address already exists"
                        error_field = "email"
                    elif 'username' in str(e).lower():
                        error_message = "Username already exists"
                        error_field = "username"
                    else:
                        error_message = "User with this information already exists"
                        error_field = "general"
                    
                    return Response({
                        "status": "error",
                        "message": error_message,
                        "error_code": "DUPLICATE_DATA",
                        "error_field": error_field,
                        "timestamp": timezone.now().isoformat()
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            logger.error(f"POST Users API error: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An unexpected error occurred during registration",
                "error_code": "INTERNAL_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """
        GET method to retrieve registration statistics and API info
        """
        try:
            # Get statistics
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count()
            users_with_profiles = UserProfile.objects.count()
            users_with_numeric_values = UserProfile.objects.exclude(numeric_value=0).count()
            
            # Recent registrations (last 24 hours)
            yesterday = timezone.now() - timezone.timedelta(days=1)
            recent_registrations = User.objects.filter(date_joined__gte=yesterday).count()
            
            # Numeric value statistics
            from django.db.models import Min, Max, Avg, Sum, Count
            numeric_stats = UserProfile.objects.aggregate(
                min_value=Min('numeric_value'),
                max_value=Max('numeric_value'),
                avg_value=Avg('numeric_value'),
                sum_value=Sum('numeric_value'),
                count_non_zero=Count('id', filter=models.Q(numeric_value__gt=0))
            )
            
            return Response({
                "status": "success",
                "message": "POST Users API statistics",
                "data": {
                    "api_info": {
                        "endpoint": "/api/auth/register/post_users/",
                        "methods": ["POST", "GET"],
                        "description": "Enhanced user registration with SQL storage",
                        "features": [
                            "Comprehensive validation",
                            "SQL database storage",
                            "Profile management",
                            "Numeric value support",
                            "Error handling"
                        ]
                    },
                    "statistics": {
                        "total_users": total_users,
                        "active_users": active_users,
                        "inactive_users": total_users - active_users,
                        "users_with_profiles": users_with_profiles,
                        "users_with_numeric_values": users_with_numeric_values,
                        "recent_registrations_24h": recent_registrations,
                        "numeric_value_stats": numeric_stats
                    },
                    "validation_rules": {
                        "username": "3-30 characters, alphanumeric + @.+-_",
                        "email": "Valid email format, must be unique",
                        "password": "8+ characters, must contain letter and number",
                        "numeric_value": "Integer value, defaults to 0"
                    }
                },
                "metadata": {
                    "timestamp": timezone.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": "/api/auth/register/post_users",
                    "method": "GET"
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"POST Users API GET error: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "Error retrieving API statistics",
                "error_code": "STATS_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)