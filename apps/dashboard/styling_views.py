from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import UserStyling
from .serializers import UserStylingSerializer, UserStylingCreateSerializer, AutoTokenStylingCreateSerializer


class UserStylingAPIView(APIView):
    """
    API View for managing user styling configurations
    GET: Get styling configuration for authenticated user
    POST: Set styling configuration for authenticated user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get styling configuration for the authenticated user"""
        try:
            user_styling = UserStyling.objects.get(user=request.user)
            serializer = UserStylingSerializer(user_styling)
            return Response({
                "status": "success",
                "message": "User styling configuration retrieved successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except UserStyling.DoesNotExist:
            # Return default styling if not set
            default_styling = {
                "user_id": request.user.id,
                "username": request.user.username,
                "primary_color": "#1E90FF",
                "secondary_color": "#32CD32",
                "background_color": "#FFFFFF",
                "button_color": "#007BFF",
                "text_color": "#333333",
                "heading_font_size": "24px",
                "body_font_size": "16px",
                "font_family": "Arial",
                "border_radius": "5px",
                "theme_name": "",
                "description": "",
                "is_active": True,
                "color_palette": {
                    "primary": "#1E90FF",
                    "secondary": "#32CD32",
                    "background": "#FFFFFF",
                    "button": "#007BFF",
                    "text": "#333333"
                },
                "font_settings": {
                    "heading_size": "24px",
                    "body_size": "16px",
                    "family": "Arial"
                },
                "css_variables": {
                    "--primary-color": "#1E90FF",
                    "--secondary-color": "#32CD32",
                    "--background-color": "#FFFFFF",
                    "--button-color": "#007BFF",
                    "--text-color": "#333333",
                    "--heading-font-size": "24px",
                    "--body-font-size": "16px",
                    "--font-family": "Arial",
                    "--border-radius": "5px"
                },
                "created_at": None,
                "updated_at": None
            }
            return Response({
                "status": "success",
                "message": "No styling configuration found, returning defaults",
                "data": default_styling
            }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Set styling configuration for the authenticated user"""
        serializer = UserStylingCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get or create user styling
            user_styling, created = UserStyling.objects.get_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            
            # Update if exists
            if not created:
                for field, value in serializer.validated_data.items():
                    setattr(user_styling, field, value)
                user_styling.save()
            
            response_serializer = UserStylingSerializer(user_styling)
            action = "created" if created else "updated"
            
            return Response({
                "status": "success",
                "message": f"User styling configuration {action} successfully",
                "data": response_serializer.data
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        return Response({
            "status": "error",
            "message": "Invalid data provided",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AllUsersStylingAPIView(APIView):
    """
    API View to get all users' styling configurations (for admin purposes)
    GET: Get all users with their styling configurations
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all users with their styling configurations"""
        try:
            # Get all users
            users = User.objects.all().order_by('username')
            result = []
            
            # Query parameters for filtering
            has_styling_only = request.GET.get('has_styling_only', 'false').lower() == 'true'
            active_only = request.GET.get('active_only', 'false').lower() == 'true'
            
            for user in users:
                try:
                    user_styling = UserStyling.objects.get(user=user)
                    styling_data = UserStylingSerializer(user_styling).data
                    
                    # Filter by active status if requested
                    if active_only and not user_styling.is_active:
                        continue
                        
                except UserStyling.DoesNotExist:
                    # Skip users without styling if filter is enabled
                    if has_styling_only:
                        continue
                        
                    styling_data = {
                        "id": None,
                        "user_id": user.id,
                        "username": user.username,
                        "primary_color": "#1E90FF",
                        "secondary_color": "#32CD32",
                        "background_color": "#FFFFFF",
                        "button_color": "#007BFF",
                        "text_color": "#333333",
                        "heading_font_size": "24px",
                        "body_font_size": "16px",
                        "font_family": "Arial",
                        "border_radius": "5px",
                        "theme_name": "",
                        "description": "",
                        "is_active": True,
                        "created_at": None,
                        "updated_at": None,
                        "has_custom_styling": False
                    }
                
                styling_data["has_custom_styling"] = styling_data.get("id") is not None
                result.append(styling_data)
            
            return Response({
                "status": "success",
                "message": f"Retrieved styling configurations for {len(result)} users",
                "data": result,
                "count": len(result),
                "filters": {
                    "has_styling_only": has_styling_only,
                    "active_only": active_only
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving styling configurations: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserStylingByUserAPIView(APIView):
    """
    API View to get/set styling configuration for specific user (admin only)
    GET: Get styling configuration for specific user
    POST: Set styling configuration for specific user
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """Get styling configuration for specific user"""
        try:
            user = User.objects.get(id=user_id)
            try:
                user_styling = UserStyling.objects.get(user=user)
                serializer = UserStylingSerializer(user_styling)
                return Response({
                    "status": "success",
                    "message": f"Styling configuration for {user.username} retrieved successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            except UserStyling.DoesNotExist:
                # Return default styling
                default_styling = {
                    "user_id": user.id,
                    "username": user.username,
                    "primary_color": "#1E90FF",
                    "secondary_color": "#32CD32",
                    "background_color": "#FFFFFF",
                    "button_color": "#007BFF",
                    "text_color": "#333333",
                    "heading_font_size": "24px",
                    "body_font_size": "16px",
                    "font_family": "Arial",
                    "border_radius": "5px",
                    "theme_name": "",
                    "description": "",
                    "is_active": True,
                    "has_custom_styling": False
                }
                return Response({
                    "status": "success",
                    "message": f"No styling configuration found for {user.username}, returning defaults",
                    "data": default_styling
                }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                "status": "error",
                "message": "User not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, user_id):
        """Set styling configuration for specific user"""
        try:
            user = User.objects.get(id=user_id)
            serializer = UserStylingCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                # Get or create user styling
                user_styling, created = UserStyling.objects.get_or_create(
                    user=user,
                    defaults=serializer.validated_data
                )
                
                # Update if exists
                if not created:
                    for field, value in serializer.validated_data.items():
                        setattr(user_styling, field, value)
                    user_styling.save()
                
                response_serializer = UserStylingSerializer(user_styling)
                action = "created" if created else "updated"
                
                return Response({
                    "status": "success",
                    "message": f"Styling configuration for {user.username} {action} successfully",
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


class AutoTokenStylingSetAPIView(APIView):
    """
    API View to set styling configuration using user_id (automatically gets token)
    POST: Set styling for user by user_id (no token required in header)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Set styling configuration for user using user_id (auto-token retrieval)"""
        try:
            # Get user_id from request
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
            
            # Extract styling data (exclude user_id from styling fields)
            styling_data = {k: v for k, v in request.data.items() if k != 'user_id'}
            
            # Validate styling data
            serializer = UserStylingCreateSerializer(data=styling_data)
            if serializer.is_valid():
                # Get or create user styling
                user_styling, created = UserStyling.objects.get_or_create(
                    user=user,
                    defaults=serializer.validated_data
                )
                
                # Update if exists
                if not created:
                    for field, value in serializer.validated_data.items():
                        setattr(user_styling, field, value)
                    user_styling.save()
                
                # Prepare response data
                response_serializer = UserStylingSerializer(user_styling)
                response_data = response_serializer.data
                response_data["auto_token"] = token.key  # Add the token for reference
                
                action = "created" if created else "updated"
                
                return Response({
                    "status": "success",
                    "message": f"Styling configuration {action} successfully for {user.username}",
                    "data": response_data
                }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
            return Response({
                "status": "error",
                "message": "Invalid styling data provided",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error setting styling: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AutoTokenStylingGetAPIView(APIView):
    """
    API View to get styling configuration using user_id (automatically gets token)
    POST: Get styling for user by user_id (no token required in header)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Get styling configuration for user using user_id (auto-token retrieval)"""
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
            
            # Get user styling configuration
            try:
                user_styling = UserStyling.objects.get(user=user)
                response_serializer = UserStylingSerializer(user_styling)
                response_data = response_serializer.data
                response_data["auto_token"] = token.key
                response_data["has_custom_styling"] = True
                
                return Response({
                    "status": "success",
                    "message": f"Styling configuration retrieved successfully for {user.username}",
                    "data": response_data
                }, status=status.HTTP_200_OK)
                
            except UserStyling.DoesNotExist:
                # Return default styling
                default_styling = {
                    "id": None,
                    "user_id": user.id,
                    "username": user.username,
                    "primary_color": "#1E90FF",
                    "secondary_color": "#32CD32",
                    "background_color": "#FFFFFF",
                    "button_color": "#007BFF",
                    "text_color": "#333333",
                    "heading_font_size": "24px",
                    "body_font_size": "16px",
                    "font_family": "Arial",
                    "border_radius": "5px",
                    "theme_name": "",
                    "description": "",
                    "is_active": True,
                    "color_palette": {
                        "primary": "#1E90FF",
                        "secondary": "#32CD32",
                        "background": "#FFFFFF",
                        "button": "#007BFF",
                        "text": "#333333"
                    },
                    "font_settings": {
                        "heading_size": "24px",
                        "body_size": "16px",
                        "family": "Arial"
                    },
                    "css_variables": {
                        "--primary-color": "#1E90FF",
                        "--secondary-color": "#32CD32",
                        "--background-color": "#FFFFFF",
                        "--button-color": "#007BFF",
                        "--text-color": "#333333",
                        "--heading-font-size": "24px",
                        "--body-font-size": "16px",
                        "--font-family": "Arial",
                        "--border-radius": "5px"
                    },
                    "auto_token": token.key,
                    "has_custom_styling": False,
                    "created_at": None,
                    "updated_at": None
                }
                
                return Response({
                    "status": "success",
                    "message": f"No custom styling found for {user.username}, returning defaults",
                    "data": default_styling
                }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting styling: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserStylingCSSAPIView(APIView):
    """
    API View to get CSS variables for user styling
    GET: Get CSS variables for authenticated user or specific user
    """
    authentication_classes = []  # No authentication required for CSS
    permission_classes = []       # No permissions required
    
    def get(self, request, user_id=None):
        """Get CSS variables for user styling"""
        try:
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"User with ID {user_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # If no user_id provided and no authentication, return default CSS
                user = None
            
            if user:
                try:
                    user_styling = UserStyling.objects.get(user=user)
                    css_string = user_styling.to_css_string()
                    css_variables = user_styling.css_variables
                except UserStyling.DoesNotExist:
                    # Return default CSS
                    default_styling = UserStyling()  # Create temporary instance with defaults
                    css_string = default_styling.to_css_string()
                    css_variables = default_styling.css_variables
            else:
                # Return default CSS
                default_styling = UserStyling()
                css_string = default_styling.to_css_string()
                css_variables = default_styling.css_variables
            
            return Response({
                "status": "success",
                "message": "CSS variables retrieved successfully",
                "data": {
                    "css_string": css_string,
                    "css_variables": css_variables,
                    "user_id": user.id if user else None,
                    "username": user.username if user else "default"
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting CSS: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
