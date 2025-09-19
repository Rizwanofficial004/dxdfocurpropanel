"""
Single User API - GET user by ID
Endpoint: /api/auth/register/users/{user_id}/
"""

import logging
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404
from apps.users.models import UserProfile

logger = logging.getLogger(__name__)


class SingleUserAPIView(APIView):
    """
    API View to get a single registered user by ID
    GET /api/auth/register/users/{user_id}/
    """
    
    permission_classes = [AllowAny]  # No authentication required
    
    def get(self, request, user_id):
        """
        GET a single user by their ID with complete profile information
        
        URL Parameters:
        - user_id: The ID of the user to retrieve
        
        Query Parameters:
        - include_inactive: Include inactive users (default: false)
        """
        
        try:
            # Get query parameters
            include_inactive = request.GET.get('include_inactive', 'false').lower() == 'true'
            
            # Base queryset
            users = User.objects.all()
            
            # Filter active users only (unless specified)
            if not include_inactive:
                users = users.filter(is_active=True)
            
            # Get the specific user by ID
            try:
                user = users.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User with ID {user_id} not found",
                    "error_code": "USER_NOT_FOUND",
                    "requested_user_id": user_id,
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Serialize user data
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
                profile = UserProfile.objects.get(user=user)
                user_data["profile"] = {
                    "organization_name": profile.organization_name,
                    "country": profile.country,
                    "phone_number": profile.phone_number,
                    "date_of_birth": profile.date_of_birth.isoformat() if profile.date_of_birth else None,
                    "bio": profile.bio,
                    "job_title": profile.job_title,
                    "industry": profile.industry,
                    "experience_level": profile.experience_level,
                    "numeric_value": profile.numeric_value,
                    "profile_completed": profile.profile_completed,
                    "email_notifications": profile.email_notifications,
                    "privacy_level": profile.privacy_level,
                    "created_at": profile.created_at.isoformat() if hasattr(profile, 'created_at') and profile.created_at else None,
                    "updated_at": profile.updated_at.isoformat() if hasattr(profile, 'updated_at') and profile.updated_at else None,
                    "completion_percentage": profile.get_completion_percentage() if hasattr(profile, 'get_completion_percentage') else None
                }
            except UserProfile.DoesNotExist:
                logger.info(f"No profile found for user {user.id}")
                user_data["profile"] = {
                    "message": "No profile created yet",
                    "numeric_value": 0,
                    "profile_completed": False
                }
            except Exception as e:
                logger.warning(f"Error accessing profile for user {user.id}: {e}")
                user_data["profile"] = {"error": "Profile data unavailable"}
            
            return Response({
                "status": "success",
                "message": f"Retrieved user {user.username} (ID: {user.id})",
                "data": {
                    "user": user_data
                },
                "metadata": {
                    "timestamp": timezone.now().isoformat(),
                    "api_version": "1.0.0",
                    "endpoint": f"/api/auth/register/users/{user_id}/",
                    "requested_user_id": user_id
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An error occurred while retrieving the user",
                "error_code": "RETRIEVAL_ERROR",
                "requested_user_id": user_id,
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)