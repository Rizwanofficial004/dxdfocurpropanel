from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db import transaction
import logging
import json
from .models import UserNumericValue
from .serializers import UserNumericValueSerializer, UserNumericValueCreateSerializer

# Set up logging
logger = logging.getLogger(__name__)


class UserNumericValueAPIView(APIView):
    """
    API View for managing user numeric values
    GET: Get numeric value for authenticated user
    POST: Set numeric value for authenticated user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get numeric value for the authenticated user"""
        try:
            user_value = UserNumericValue.objects.get(user=request.user)
            serializer = UserNumericValueSerializer(user_value)
            return Response({
                "status": "success",
                "message": "User numeric value retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except UserNumericValue.DoesNotExist:
            # Return default value if not set
            return Response({
                "status": "success",
                "message": "No numeric value set for user",
                "data": {
                    "username": request.user.username,
                    "user_id": request.user.id,
                    "value": 0,
                    "description": "",
                    "last_updated": None,
                    "created_at": None
                }
            }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Set numeric value for the authenticated user"""
        serializer = UserNumericValueCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get or create user numeric value
            user_value, created = UserNumericValue.objects.get_or_create(
                user=request.user,
                defaults={
                    'value': serializer.validated_data['value'],
                    'description': serializer.validated_data.get('description', '')
                }
            )
            
            # Update if exists
            if not created:
                user_value.value = serializer.validated_data['value']
                user_value.description = serializer.validated_data.get('description', user_value.description)
                user_value.save()
            
            response_serializer = UserNumericValueSerializer(user_value)
            action = "created" if created else "updated"
            
            return Response({
                "status": "success",
                "message": f"User numeric value {action} successfully",
                "data": response_serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AllUsersNumericValuesAPIView(APIView):
    """
    API View to get all users' numeric values (for admin purposes)
    GET: Get all users with their numeric values
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all users with their numeric values"""
        try:
            # Get all users
            users = User.objects.all().order_by('username')
            result = []
            
            for user in users:
                try:
                    user_value = UserNumericValue.objects.get(user=user)
                    value_data = UserNumericValueSerializer(user_value).data
                except UserNumericValue.DoesNotExist:
                    value_data = {
                        "id": None,
                        "user_id": user.id,
                        "username": user.username,
                        "value": 0,
                        "description": "",
                        "last_updated": None,
                        "created_at": None
                    }
                
                result.append(value_data)
            
            return Response({
                "status": "success",
                "message": f"Retrieved numeric values for {len(result)} users",
                "data": result,
                "count": len(result)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving user values: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserNumericValueByUserAPIView(APIView):
    """
    API View to get/set numeric value for specific user (admin only)
    GET: Get numeric value for specific user
    POST: Set numeric value for specific user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get numeric value for specific user"""
        try:
            user = User.objects.get(id=user_id)
            try:
                user_value = UserNumericValue.objects.get(user=user)
                serializer = UserNumericValueSerializer(user_value)
                return Response({
                    "status": "success",
                    "message": f"Numeric value for {user.username} retrieved successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            except UserNumericValue.DoesNotExist:
                return Response({
                    "status": "success",
                    "message": f"No numeric value set for {user.username}",
                    "data": {
                        "username": user.username,
                        "user_id": user.id,
                        "value": 0,
                        "description": "",
                        "last_updated": None,
                        "created_at": None
                    }
                }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, user_id):
        """Set numeric value for specific user"""
        try:
            user = User.objects.get(id=user_id)
            serializer = UserNumericValueCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                # Get or create user numeric value
                user_value, created = UserNumericValue.objects.get_or_create(
                    user=user,
                    defaults={
                        'value': serializer.validated_data['value'],
                        'description': serializer.validated_data.get('description', '')
                    }
                )
                
                # Update if exists
                if not created:
                    user_value.value = serializer.validated_data['value']
                    user_value.description = serializer.validated_data.get('description', user_value.description)
                    user_value.save()
                
                response_serializer = UserNumericValueSerializer(user_value)
                action = "created" if created else "updated"
                
                return Response({
                    "status": "success",
                    "message": f"Numeric value for {user.username} {action} successfully",
                    "data": response_serializer.data
                }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
            return Response({
                "status": "error",
                "message": "Invalid data provided",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)


class UserSetupValueAPIView(APIView):
    """
    API View to get setup/configuration value for users
    GET: Get setup value for authenticated user or specific user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get setup value for user"""
        try:
            # If user_id provided, get that user's value, otherwise get authenticated user's value
            if user_id:
                try:
                    target_user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": "User not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                target_user = request.user
            
            try:
                user_value = UserNumericValue.objects.get(user=target_user)
                return Response({
                    "status": "success",
                    "message": f"Setup value retrieved for {target_user.username}",
                    "data": {
                        "user_id": target_user.id,
                        "username": target_user.username,
                        "setup_value": user_value.value,
                        "description": user_value.description,
                        "last_updated": user_value.last_updated,
                        "is_configured": True
                    }
                }, status=status.HTTP_200_OK)
                
            except UserNumericValue.DoesNotExist:
                return Response({
                    "status": "success",
                    "message": f"No setup value configured for {target_user.username}",
                    "data": {
                        "user_id": target_user.id,
                        "username": target_user.username,
                        "setup_value": 0,
                        "description": "",
                        "last_updated": None,
                        "is_configured": False
                    }
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving setup value: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllUsersSetupValuesAPIView(APIView):
    """
    API View to get all users' setup values with configuration status
    GET: Get setup values for all users with filtering options
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get setup values for all users"""
        try:
            # Query parameters for filtering
            configured_only = request.GET.get('configured_only', 'false').lower() == 'true'
            min_value = request.GET.get('min_value')
            max_value = request.GET.get('max_value')
            
            users = User.objects.all().order_by('username')
            result = []
            
            for user in users:
                try:
                    user_value = UserNumericValue.objects.get(user=user)
                    setup_data = {
                        "user_id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "setup_value": user_value.value,
                        "description": user_value.description,
                        "last_updated": user_value.last_updated,
                        "created_at": user_value.created_at,
                        "is_configured": True
                    }
                    
                    # Apply value filters if provided
                    if min_value and user_value.value < int(min_value):
                        continue
                    if max_value and user_value.value > int(max_value):
                        continue
                        
                except UserNumericValue.DoesNotExist:
                    setup_data = {
                        "user_id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "setup_value": 0,
                        "description": "",
                        "last_updated": None,
                        "created_at": None,
                        "is_configured": False
                    }
                    
                    # Skip unconfigured users if configured_only is true
                    if configured_only:
                        continue
                
                result.append(setup_data)
            
            return Response({
                "status": "success",
                "message": f"Retrieved setup values for {len(result)} users",
                "data": result,
                "count": len(result),
                "filters": {
                    "configured_only": configured_only,
                    "min_value": min_value,
                    "max_value": max_value
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving setup values: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AutoTokenSetValueAPIView(APIView):
    """
    Enhanced API View to set numeric value using user_id (automatically gets token)
    POST: Set value for user by user_id (no token required in header)
    GET: Get value for user by user_id (no token required in header)
    
    Features:
    - Enhanced validation with detailed error messages
    - Support for both positive and negative values
    - Bulk operations support
    - Detailed logging for debugging
    - Transaction safety
    - Value history tracking
    - GET support for retrieving values
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def get(self, request):
        """Get numeric value for user using user_id (query parameter)"""
        
        # Log the incoming request
        logger.info(f"AutoTokenSetValue GET API called from IP: {self.get_client_ip(request)}")
        
        try:
            user_id = request.GET.get('user_id')
            
            if not user_id:
                return Response({
                    "status": "error",
                    "message": "user_id query parameter is required",
                    "error_code": "MISSING_USER_ID",
                    "example": "?user_id=123",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate user_id
            try:
                user_id = int(user_id)
                if user_id <= 0:
                    return Response({
                        "status": "error",
                        "message": "user_id must be a positive integer",
                        "error_code": "INVALID_USER_ID",
                        "timestamp": timezone.now().isoformat()
                    }, status=status.HTTP_400_BAD_REQUEST)
            except (ValueError, TypeError):
                return Response({
                    "status": "error",
                    "message": "user_id must be a valid integer",
                    "error_code": "INVALID_USER_ID_FORMAT",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User with ID {user_id} not found",
                    "error_code": "USER_NOT_FOUND",
                    "timestamp": timezone.now().isoformat()
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get or create token
            token, token_created = Token.objects.get_or_create(user=user)
            
            # Get user numeric value
            try:
                user_value = UserNumericValue.objects.get(user=user)
                response_data = {
                    "id": user_value.id,
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "value": user_value.value,
                    "description": user_value.description,
                    "last_updated": user_value.last_updated.isoformat() if user_value.last_updated else None,
                    "created_at": user_value.created_at.isoformat() if user_value.created_at else None,
                    "auto_token": token.key,
                    "is_configured": True,
                    "user_status": {
                        "is_active": user.is_active,
                        "date_joined": user.date_joined.isoformat() if user.date_joined else None,
                        "last_login": user.last_login.isoformat() if user.last_login else None
                    }
                }
                
                return Response({
                    "status": "success",
                    "message": f"Value retrieved successfully for {user.username}",
                    "data": response_data,
                    "metadata": {
                        "timestamp": timezone.now().isoformat(),
                        "api_version": "2.0.0"
                    }
                }, status=status.HTTP_200_OK)
                
            except UserNumericValue.DoesNotExist:
                response_data = {
                    "id": None,
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "value": 0,
                    "description": "",
                    "last_updated": None,
                    "created_at": None,
                    "auto_token": token.key,
                    "is_configured": False,
                    "user_status": {
                        "is_active": user.is_active,
                        "date_joined": user.date_joined.isoformat() if user.date_joined else None,
                        "last_login": user.last_login.isoformat() if user.last_login else None
                    }
                }
                
                return Response({
                    "status": "success",
                    "message": f"No value set for {user.username} (returning default)",
                    "data": response_data,
                    "metadata": {
                        "timestamp": timezone.now().isoformat(),
                        "api_version": "2.0.0"
                    }
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Unexpected error in AutoTokenSetValue GET: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An unexpected error occurred while retrieving the value",
                "error_code": "INTERNAL_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Set numeric value for user using user_id (auto-token retrieval)"""
        
        # Log the incoming request
        logger.info(f"AutoTokenSetValue API called from IP: {self.get_client_ip(request)}")
        logger.debug(f"Request data: {json.dumps(request.data, default=str)}")
        
        try:
            # Handle bulk operations
            if isinstance(request.data, list):
                return self._handle_bulk_operation(request.data)
            
            # Single operation validation
            validation_result = self._validate_single_request(request.data)
            if validation_result['error']:
                return Response({
                    "status": "error",
                    "message": validation_result['message'],
                    "error_code": validation_result['error_code'],
                    "timestamp": timezone.now().isoformat()
                }, status=validation_result['status_code'])
            
            user_data = validation_result['data']
            
            # Perform the operation with transaction safety
            with transaction.atomic():
                result = self._set_user_value(
                    user_data['user'],
                    user_data['value'],
                    user_data['description'],
                    user_data['metadata']
                )
            
            # Log successful operation
            logger.info(f"Value {result['action']} for user {result['data']['username']} (ID: {result['data']['user_id']})")
            
            return Response({
                "status": "success",
                "message": result['message'],
                "data": result['data'],
                "metadata": {
                    "action": result['action'],
                    "timestamp": timezone.now().isoformat(),
                    "api_version": "2.0.0"
                }
            }, status=result['status_code'])
            
        except ValidationError as e:
            logger.warning(f"Validation error in AutoTokenSetValue: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Validation error: {str(e)}",
                "error_code": "VALIDATION_ERROR",
                "timestamp": timezone.now().isoformat()
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Unexpected error in AutoTokenSetValue: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An unexpected error occurred while setting the value",
                "error_code": "INTERNAL_ERROR",
                "timestamp": timezone.now().isoformat(),
                "debug_message": str(e) if logger.level <= logging.DEBUG else None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_single_request(self, data):
        """Validate single request data with detailed error messages"""
        
        # Extract data
        user_id = data.get('user_id')
        value = data.get('value')
        description = data.get('description', '')
        metadata = data.get('metadata', {})
        
        # Enhanced validation
        if not user_id:
            return {
                'error': True,
                'message': 'user_id is required and cannot be empty',
                'error_code': 'MISSING_USER_ID',
                'status_code': status.HTTP_400_BAD_REQUEST
            }
        
        # Validate user_id is numeric
        try:
            user_id = int(user_id)
            if user_id <= 0:
                return {
                    'error': True,
                    'message': 'user_id must be a positive integer',
                    'error_code': 'INVALID_USER_ID',
                    'status_code': status.HTTP_400_BAD_REQUEST
                }
        except (ValueError, TypeError):
            return {
                'error': True,
                'message': 'user_id must be a valid integer',
                'error_code': 'INVALID_USER_ID_FORMAT',
                'status_code': status.HTTP_400_BAD_REQUEST
            }
        
        if value is None:
            return {
                'error': True,
                'message': 'value is required and cannot be null',
                'error_code': 'MISSING_VALUE',
                'status_code': status.HTTP_400_BAD_REQUEST
            }
        
        # Enhanced value validation (support for negative values and decimals)
        try:
            # Support both int and float, but convert to int for storage
            if isinstance(value, str):
                if '.' in value:
                    value = float(value)
                else:
                    value = int(value)
            elif isinstance(value, float):
                value = int(value)  # Truncate decimal part
            elif not isinstance(value, int):
                raise ValueError("Invalid value type")
            
            # Range validation (prevent extremely large values)
            if value < -2147483648 or value > 2147483647:
                return {
                    'error': True,
                    'message': 'value must be between -2,147,483,648 and 2,147,483,647',
                    'error_code': 'VALUE_OUT_OF_RANGE',
                    'status_code': status.HTTP_400_BAD_REQUEST
                }
                
        except (ValueError, TypeError):
            return {
                'error': True,
                'message': 'value must be a valid number (integer or decimal)',
                'error_code': 'INVALID_VALUE_FORMAT',
                'status_code': status.HTTP_400_BAD_REQUEST
            }
        
        # Validate description length
        if len(description) > 200:
            return {
                'error': True,
                'message': 'description cannot exceed 200 characters',
                'error_code': 'DESCRIPTION_TOO_LONG',
                'status_code': status.HTTP_400_BAD_REQUEST
            }
        
        # Get user
        try:
            user = User.objects.get(id=user_id)
            if not user.is_active:
                return {
                    'error': True,
                    'message': f'User with ID {user_id} is inactive',
                    'error_code': 'USER_INACTIVE',
                    'status_code': status.HTTP_403_FORBIDDEN
                }
        except User.DoesNotExist:
            return {
                'error': True,
                'message': f'User with ID {user_id} not found',
                'error_code': 'USER_NOT_FOUND',
                'status_code': status.HTTP_404_NOT_FOUND
            }
        
        return {
            'error': False,
            'data': {
                'user': user,
                'value': value,
                'description': description,
                'metadata': metadata
            }
        }
    
    def _set_user_value(self, user, value, description, metadata):
        """Set or update user value with transaction safety"""
        
        # Get or create token for user
        token, token_created = Token.objects.get_or_create(user=user)
        
        # Store previous value for history
        previous_value = None
        try:
            existing_value = UserNumericValue.objects.get(user=user)
            previous_value = existing_value.value
        except UserNumericValue.DoesNotExist:
            pass
        
        # Get or create user numeric value
        user_value, created = UserNumericValue.objects.get_or_create(
            user=user,
            defaults={
                'value': value,
                'description': description
            }
        )
        
        # Update if exists
        if not created:
            user_value.value = value
            user_value.description = description
            user_value.save()
        
        # Prepare response data with enhanced information
        response_data = {
            "id": user_value.id,
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "value": user_value.value,
            "previous_value": previous_value,
            "description": user_value.description,
            "last_updated": user_value.last_updated.isoformat() if user_value.last_updated else None,
            "created_at": user_value.created_at.isoformat() if user_value.created_at else None,
            "auto_token": token.key,
            "token_created": token_created,
            "metadata": metadata,
            "user_status": {
                "is_active": user.is_active,
                "date_joined": user.date_joined.isoformat() if user.date_joined else None,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        }
        
        action = "created" if created else "updated"
        action_message = f"Value {action} successfully for {user.username}"
        
        return {
            'action': action,
            'message': action_message,
            'data': response_data,
            'status_code': status.HTTP_201_CREATED if created else status.HTTP_200_OK
        }
    
    def _handle_bulk_operation(self, data_list):
        """Handle bulk operations for multiple users"""
        
        if not isinstance(data_list, list):
            return Response({
                "status": "error",
                "message": "Bulk data must be an array",
                "error_code": "INVALID_BULK_FORMAT"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(data_list) > 100:  # Limit bulk operations
            return Response({
                "status": "error",
                "message": "Bulk operations limited to 100 items maximum",
                "error_code": "BULK_LIMIT_EXCEEDED"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        errors = []
        
        with transaction.atomic():
            for index, item in enumerate(data_list):
                try:
                    validation_result = self._validate_single_request(item)
                    if validation_result['error']:
                        errors.append({
                            'index': index,
                            'data': item,
                            'error': validation_result['message'],
                            'error_code': validation_result['error_code']
                        })
                        continue
                    
                    user_data = validation_result['data']
                    result = self._set_user_value(
                        user_data['user'],
                        user_data['value'],
                        user_data['description'],
                        user_data['metadata']
                    )
                    
                    results.append({
                        'index': index,
                        'status': 'success',
                        'action': result['action'],
                        'data': result['data']
                    })
                    
                except Exception as e:
                    errors.append({
                        'index': index,
                        'data': item,
                        'error': str(e),
                        'error_code': 'PROCESSING_ERROR'
                    })
        
        return Response({
            "status": "completed",
            "message": f"Bulk operation completed: {len(results)} successful, {len(errors)} errors",
            "summary": {
                "total_items": len(data_list),
                "successful": len(results),
                "errors": len(errors)
            },
            "results": results,
            "errors": errors,
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK if len(errors) == 0 else status.HTTP_207_MULTI_STATUS)
    
    def get_client_ip(self, request):
        """Get client IP address for logging"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AutoTokenGetValueAPIView(APIView):
    """
    API View to get numeric value using user_id (automatically gets token)
    POST: Get value for user by user_id (no token required in header)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Get numeric value for user using user_id (auto-token retrieval)"""
        try:
            # Get data from request
            user_id = request.data.get('user_id')
            
            # Validate required fields
            if not user_id:
                return Response({
                    "status": "error",
                    "message": "user_id is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user by ID
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({
                    "status": "error",
                    "message": f"User with ID {user_id} not found"
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Get or create token for user
            token, created = Token.objects.get_or_create(user=user)
            
            # Get user numeric value
            try:
                user_value = UserNumericValue.objects.get(user=user)
                response_data = {
                    "id": user_value.id,
                    "user_id": user.id,
                    "username": user.username,
                    "value": user_value.value,
                    "description": user_value.description,
                    "last_updated": user_value.last_updated,
                    "created_at": user_value.created_at,
                    "auto_token": token.key,
                    "is_configured": True
                }
                
                return Response({
                    "status": "success",
                    "message": f"Value retrieved successfully for {user.username}",
                    "data": response_data
                }, status=status.HTTP_200_OK)
                
            except UserNumericValue.DoesNotExist:
                response_data = {
                    "id": None,
                    "user_id": user.id,
                    "username": user.username,
                    "value": 0,
                    "description": "",
                    "last_updated": None,
                    "created_at": None,
                    "auto_token": token.key,
                    "is_configured": False
                }
                
                return Response({
                    "status": "success",
                    "message": f"No value set for {user.username}",
                    "data": response_data
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting value: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FlexibleGetValueAPIView(APIView):
    """
    API View to get numeric value using either user_id or username
    POST: Get value for user by user_id OR username (no token required in header)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Get numeric value for user using user_id or username"""
        try:
            # Get data from request
            user_id = request.data.get('user_id')
            username = request.data.get('username')
            
            # Validate that at least one identifier is provided
            if not user_id and not username:
                return Response({
                    "status": "error",
                    "message": "Either user_id or username is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user by ID or username
            user = None
            search_method = ""
            
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    search_method = f"user_id: {user_id}"
                except User.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"User with ID {user_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            
            elif username:
                try:
                    user = User.objects.get(username=username)
                    search_method = f"username: {username}"
                except User.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"User with username '{username}' not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            
            # Get or create token for user
            token, created = Token.objects.get_or_create(user=user)
            
            # Get user numeric value
            try:
                user_value = UserNumericValue.objects.get(user=user)
                response_data = {
                    "id": user_value.id,
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "value": user_value.value,
                    "description": user_value.description,
                    "last_updated": user_value.last_updated,
                    "created_at": user_value.created_at,
                    "auto_token": token.key,
                    "is_configured": True,
                    "search_method": search_method
                }
                
                return Response({
                    "status": "success",
                    "message": f"Value retrieved successfully for {user.username} using {search_method}",
                    "data": response_data
                }, status=status.HTTP_200_OK)
                
            except UserNumericValue.DoesNotExist:
                response_data = {
                    "id": None,
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "value": 0,
                    "description": "",
                    "last_updated": None,
                    "created_at": None,
                    "auto_token": token.key,
                    "is_configured": False,
                    "search_method": search_method
                }
                
                return Response({
                    "status": "success",
                    "message": f"No value set for {user.username} using {search_method}",
                    "data": response_data
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting value: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
