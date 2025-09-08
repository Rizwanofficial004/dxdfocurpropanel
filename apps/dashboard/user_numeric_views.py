from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserNumericValue
from .serializers import UserNumericValueSerializer, UserNumericValueCreateSerializer


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
    API View to set numeric value using user_id (automatically gets token)
    POST: Set value for user by user_id (no token required in header)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Set numeric value for user using user_id (auto-token retrieval)"""
        try:
            # Get data from request
            user_id = request.data.get('user_id')
            value = request.data.get('value')
            description = request.data.get('description', '')
            
            # Validate required fields
            if not user_id:
                return Response({
                    "status": "error",
                    "message": "user_id is required"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            if value is None:
                return Response({
                    "status": "error",
                    "message": "value is required"
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
            
            # Validate value is numeric
            try:
                value = int(value)
            except (ValueError, TypeError):
                return Response({
                    "status": "error",
                    "message": "value must be a numeric integer"
                }, status=status.HTTP_400_BAD_REQUEST)
            
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
            
            # Prepare response data
            response_data = {
                "id": user_value.id,
                "user_id": user.id,
                "username": user.username,
                "value": user_value.value,
                "description": user_value.description,
                "last_updated": user_value.last_updated,
                "created_at": user_value.created_at,
                "auto_token": token.key  # Return the token for reference
            }
            
            action = "created" if created else "updated"
            
            return Response({
                "status": "success",
                "message": f"Value {action} successfully for {user.username}",
                "data": response_data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error setting value: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
