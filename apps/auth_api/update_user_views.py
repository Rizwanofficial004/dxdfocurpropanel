"""
Update User API - API for updating existing user parameters
Endpoint: /api/auth/update/user/<user_id>/
"""

import logging
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from apps.users.models import UserProfile
import re
from datetime import datetime

logger = logging.getLogger(__name__)


class UpdateUserAPIView(APIView):
    """
    API View for updating existing user parameters
    PUT /api/auth/update/user/<user_id>/ - Update user parameters
    GET /api/auth/update/user/<user_id>/ - Get current user data
    """
    
    permission_classes = [AllowAny]  # You can add authentication later if needed
    
    def get(self, request, user_id=None):
        """
        GET method to retrieve current user data
        """
        try:
            if not user_id:
                return Response({
                    "status": "error",
                    "message": "User ID is required",
                    "error_code": "USER_ID_REQUIRED"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user by ID
            try:
                user = User.objects.get(id=user_id)
                user_profile = UserProfile.objects.get(user=user)
            except User.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User with ID {user_id} not found",
                    "error_code": "USER_NOT_FOUND"
                }, status=status.HTTP_404_NOT_FOUND)
            except UserProfile.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User profile for user ID {user_id} not found",
                    "error_code": "PROFILE_NOT_FOUND"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Prepare user data
            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "date_joined": user.date_joined.isoformat(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                
                # Profile data
                "organization_name": user_profile.organization_name,
                "country": user_profile.country,
                "phone_number": user_profile.phone_number,
                "job_title": user_profile.job_title,
                "industry": user_profile.industry,
                "bio": user_profile.bio,
                "date_of_birth": user_profile.date_of_birth.isoformat() if user_profile.date_of_birth else None,
                "numeric_value": user_profile.numeric_value,
                "profile_created_at": user_profile.created_at.isoformat(),
                "profile_updated_at": user_profile.updated_at.isoformat(),
            }
            
            return Response({
                "status": "success",
                "message": f"User data retrieved successfully",
                "data": user_data,
                "user_id": user_id,
                "retrieved_at": timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving user data for ID {user_id}: {str(e)}")
            return Response({
                "status": "error",
                "message": "An error occurred while retrieving user data",
                "error_code": "INTERNAL_ERROR",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, user_id=None):
        """
        PUT method to update user parameters
        
        Updatable fields:
        - first_name: User's first name
        - last_name: User's last name
        - email: User's email (must be unique)
        - organization_name: User's organization
        - country: User's country
        - phone_number: User's phone number
        - job_title: User's job title
        - industry: User's industry
        - bio: User's biography
        - date_of_birth: User's date of birth (YYYY-MM-DD)
        - numeric_value: Numeric value parameter
        - is_active: User's active status
        """
        
        try:
            if not user_id:
                return Response({
                    "status": "error",
                    "message": "User ID is required",
                    "error_code": "USER_ID_REQUIRED"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user by ID
            try:
                user = User.objects.get(id=user_id)
                user_profile = UserProfile.objects.get(user=user)
            except User.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User with ID {user_id} not found",
                    "error_code": "USER_NOT_FOUND"
                }, status=status.HTTP_404_NOT_FOUND)
            except UserProfile.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User profile for user ID {user_id} not found",
                    "error_code": "PROFILE_NOT_FOUND"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get data from request
            data = request.data
            
            # Track what's being updated
            updated_fields = []
            validation_errors = {}
            
            # Start transaction for data consistency
            with transaction.atomic():
                # Update User model fields
                if 'first_name' in data:
                    first_name = data.get('first_name', '').strip()
                    if len(first_name) > 30:
                        validation_errors['first_name'] = ['First name must not exceed 30 characters']
                    else:
                        user.first_name = first_name
                        updated_fields.append('first_name')
                
                if 'last_name' in data:
                    last_name = data.get('last_name', '').strip()
                    if len(last_name) > 30:
                        validation_errors['last_name'] = ['Last name must not exceed 30 characters']
                    else:
                        user.last_name = last_name
                        updated_fields.append('last_name')
                
                if 'email' in data:
                    email = data.get('email', '').strip().lower()
                    if not email:
                        validation_errors['email'] = ['Email cannot be empty']
                    else:
                        try:
                            validate_email(email)
                            # Check if email already exists for another user
                            if User.objects.filter(email=email).exclude(id=user_id).exists():
                                validation_errors['email'] = ['A user with this email address already exists']
                            else:
                                user.email = email
                                updated_fields.append('email')
                        except ValidationError:
                            validation_errors['email'] = ['Please enter a valid email address']
                
                if 'is_active' in data:
                    is_active = data.get('is_active')
                    if isinstance(is_active, bool):
                        user.is_active = is_active
                        updated_fields.append('is_active')
                    else:
                        validation_errors['is_active'] = ['is_active must be a boolean value']
                
                # Update UserProfile model fields
                if 'organization_name' in data:
                    organization_name = data.get('organization_name', '').strip()
                    if len(organization_name) > 100:
                        validation_errors['organization_name'] = ['Organization name must not exceed 100 characters']
                    else:
                        user_profile.organization_name = organization_name
                        updated_fields.append('organization_name')
                
                if 'country' in data:
                    country = data.get('country', '').strip()
                    if len(country) > 50:
                        validation_errors['country'] = ['Country must not exceed 50 characters']
                    else:
                        user_profile.country = country
                        updated_fields.append('country')
                
                if 'phone_number' in data:
                    phone_number = data.get('phone_number', '').strip()
                    if phone_number and not re.match(r'^[\d\+\-\(\)\s]+$', phone_number):
                        validation_errors['phone_number'] = ['Phone number contains invalid characters']
                    else:
                        user_profile.phone_number = phone_number
                        updated_fields.append('phone_number')
                
                if 'job_title' in data:
                    job_title = data.get('job_title', '').strip()
                    if len(job_title) > 100:
                        validation_errors['job_title'] = ['Job title must not exceed 100 characters']
                    else:
                        user_profile.job_title = job_title
                        updated_fields.append('job_title')
                
                if 'industry' in data:
                    industry = data.get('industry', '').strip()
                    if len(industry) > 100:
                        validation_errors['industry'] = ['Industry must not exceed 100 characters']
                    else:
                        user_profile.industry = industry
                        updated_fields.append('industry')
                
                if 'bio' in data:
                    bio = data.get('bio', '').strip()
                    if len(bio) > 500:
                        validation_errors['bio'] = ['Bio must not exceed 500 characters']
                    else:
                        user_profile.bio = bio
                        updated_fields.append('bio')
                
                if 'numeric_value' in data:
                    try:
                        numeric_value = int(data.get('numeric_value', 0))
                        user_profile.numeric_value = numeric_value
                        updated_fields.append('numeric_value')
                    except (ValueError, TypeError):
                        validation_errors['numeric_value'] = ['Numeric value must be a valid integer']
                
                if 'date_of_birth' in data:
                    date_of_birth = data.get('date_of_birth')
                    if date_of_birth:
                        try:
                            parsed_dob = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
                            if parsed_dob > datetime.now().date():
                                validation_errors['date_of_birth'] = ['Date of birth cannot be in the future']
                            else:
                                user_profile.date_of_birth = parsed_dob
                                updated_fields.append('date_of_birth')
                        except ValueError:
                            validation_errors['date_of_birth'] = ['Invalid date format. Use YYYY-MM-DD']
                    else:
                        user_profile.date_of_birth = None
                        updated_fields.append('date_of_birth')
                
                # Return validation errors if any
                if validation_errors:
                    return Response({
                        "status": "error",
                        "message": "Validation failed",
                        "errors": validation_errors,
                        "error_code": "VALIDATION_ERROR"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Save changes if no validation errors
                if updated_fields:
                    user.save()
                    user_profile.updated_at = timezone.now()
                    user_profile.save()
                    
                    logger.info(f"User {user_id} updated successfully. Fields: {', '.join(updated_fields)}")
                
                # Prepare response data
                updated_user_data = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_active": user.is_active,
                    "organization_name": user_profile.organization_name,
                    "country": user_profile.country,
                    "phone_number": user_profile.phone_number,
                    "job_title": user_profile.job_title,
                    "industry": user_profile.industry,
                    "bio": user_profile.bio,
                    "date_of_birth": user_profile.date_of_birth.isoformat() if user_profile.date_of_birth else None,
                    "numeric_value": user_profile.numeric_value,
                    "updated_at": user_profile.updated_at.isoformat()
                }
                
                return Response({
                    "status": "success",
                    "message": f"User updated successfully",
                    "data": updated_user_data,
                    "updated_fields": updated_fields,
                    "user_id": user_id,
                    "updated_at": timezone.now().isoformat(),
                    "total_updated_fields": len(updated_fields)
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {str(e)}")
            return Response({
                "status": "error",
                "message": "An error occurred while updating user",
                "error_code": "INTERNAL_ERROR",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BulkUpdateUsersAPIView(APIView):
    """
    API View for bulk updating multiple users
    PUT /api/auth/update/users/bulk/ - Update multiple users at once
    """
    
    permission_classes = [AllowAny]
    
    def put(self, request):
        """
        PUT method to update multiple users
        
        Expected format:
        {
            "updates": [
                {
                    "user_id": 1,
                    "first_name": "John",
                    "last_name": "Doe"
                },
                {
                    "user_id": 2,
                    "email": "jane@example.com"
                }
            ]
        }
        """
        
        try:
            data = request.data
            updates = data.get('updates', [])
            
            if not updates:
                return Response({
                    "status": "error",
                    "message": "No updates provided",
                    "error_code": "NO_UPDATES"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            results = []
            errors = []
            
            for update_data in updates:
                user_id = update_data.get('user_id')
                if not user_id:
                    errors.append({"error": "User ID is required", "data": update_data})
                    continue
                
                # Create a mock request object for the single update API
                mock_request = type('MockRequest', (), {'data': update_data})()
                
                # Use the single update logic
                update_view = UpdateUserAPIView()
                response = update_view.put(mock_request, user_id)
                
                if response.status_code == 200:
                    results.append({
                        "user_id": user_id,
                        "status": "success",
                        "updated_fields": response.data.get('updated_fields', [])
                    })
                else:
                    errors.append({
                        "user_id": user_id,
                        "status": "error",
                        "message": response.data.get('message', 'Unknown error'),
                        "errors": response.data.get('errors', {})
                    })
            
            return Response({
                "status": "completed",
                "message": f"Bulk update completed. {len(results)} successful, {len(errors)} failed",
                "results": results,
                "errors": errors,
                "total_processed": len(updates),
                "successful_updates": len(results),
                "failed_updates": len(errors),
                "processed_at": timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in bulk update: {str(e)}")
            return Response({
                "status": "error",
                "message": "An error occurred during bulk update",
                "error_code": "BULK_UPDATE_ERROR",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)