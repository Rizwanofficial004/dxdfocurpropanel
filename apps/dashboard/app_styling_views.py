from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.utils import timezone
from .models import AppStyling
from .serializers import AppStylingSerializer, AppStylingCreateSerializer


class AppStylingAPIView(APIView):
    """
    API View for managing general application styling configurations
    GET: Get current active styling configuration  
    POST: Create/Update styling configuration (supports custom field mapping)
    """
    authentication_classes = []  # No authentication required for getting styles
    permission_classes = []       # No permissions required for getting styles
    
    def get(self, request):
        """Get current active styling configuration"""
        try:
            # Get active theme
            active_styling = AppStyling.get_active_theme()
            
            if active_styling:
                # Return the color palette directly from the model
                response_data = active_styling.color_palette
                response_data.update({
                    'theme_name': active_styling.theme_name,
                    'description': active_styling.description or "DDS Focus Pro Complete Theme",
                    'heading_font_size': active_styling.heading_font_size,
                    'body_font_size': active_styling.body_font_size,
                    'font_family': active_styling.font_family,
                    'border_radius': active_styling.border_radius
                })
                
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                # Return default DDS Focus Pro theme
                default_theme = {
                    "theme_name": "DDS Focus Pro Default",
                    "description": "Default DDS Focus Pro color configuration",
                    "primary_color": "#006039",
                    "secondary_color": "#6c757d",
                    "background_color": "#ECF0F1",
                    "button_color": "#007bff",
                    "text_color": "#2C3E50",
                    "header_color": "#003366",
                    "footer_color": "#003366",
                    "button_text_color": "#ffffff",
                    "heading_font_size": "36px",
                    "body_font_size": "18px",
                    "font_family": "Segoe UI, sans-serif",
                    "border_radius": "10px"
                }
                
                return Response(default_theme, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                "error": f"Error retrieving styling: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create or update styling configuration"""
        try:
            data = request.data.copy()
            
            # Set default theme name if not provided
            if 'theme_name' not in data or not data['theme_name']:
                data['theme_name'] = "DDS Focus Pro Complete Theme"
            
            # Ensure this theme becomes active
            data['is_active'] = True
            
            # Use the serializer to validate the data
            serializer = AppStylingCreateSerializer(data=data)
            
            if serializer.is_valid():
                # Deactivate all existing themes
                AppStyling.objects.all().update(is_active=False)
                
                # Create new styling configuration
                app_styling = AppStyling.objects.create(**serializer.validated_data)
                
                # Return the color palette
                response_data = app_styling.color_palette
                response_data.update({
                    'theme_name': app_styling.theme_name,
                    'description': app_styling.description or "DDS Focus Pro Complete Theme",
                    'heading_font_size': app_styling.heading_font_size,
                    'body_font_size': app_styling.body_font_size,
                    'font_family': app_styling.font_family,
                    'border_radius': app_styling.border_radius
                })
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    "error": "Invalid data provided",
                    "details": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                "error": f"Error creating styling: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppStylingUpdateAPIView(APIView):
    """
    API View for updating specific styling configuration
    PUT: Update styling configuration by ID
    DELETE: Delete styling configuration by ID
    """
    authentication_classes = []  # Optional: Add authentication if needed
    permission_classes = []       # Optional: Add permissions if needed
    
    def put(self, request, styling_id):
        """Update styling configuration by ID"""
        try:
            app_styling = AppStyling.objects.get(id=styling_id)
            serializer = AppStylingCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                # Update the styling
                for field, value in serializer.validated_data.items():
                    setattr(app_styling, field, value)
                app_styling.save()
                
                response_serializer = AppStylingSerializer(app_styling)
                
                return Response({
                    "status": "success",
                    "message": f"Styling configuration '{app_styling.theme_name}' updated successfully",
                    "data": response_serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                "status": "error",
                "message": "Invalid data provided",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except AppStyling.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Styling configuration not found"
            }, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, styling_id):
        """Delete styling configuration by ID"""
        try:
            app_styling = AppStyling.objects.get(id=styling_id)
            theme_name = app_styling.theme_name
            app_styling.delete()
            
            return Response({
                "status": "success",
                "message": f"Styling configuration '{theme_name}' deleted successfully"
            }, status=status.HTTP_200_OK)
            
        except AppStyling.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Styling configuration not found"
            }, status=status.HTTP_404_NOT_FOUND)


class AllAppStylingsAPIView(APIView):
    """
    API View to get all styling configurations
    GET: Get all styling themes
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def get(self, request):
        """Get all styling configurations"""
        try:
            # Query parameters for filtering
            active_only = request.GET.get('active_only', 'false').lower() == 'true'
            
            if active_only:
                stylings = AppStyling.objects.filter(is_active=True).order_by('-updated_at')
            else:
                stylings = AppStyling.objects.all().order_by('-is_active', '-is_default', '-updated_at')
            
            result = []
            for styling in stylings:
                serializer = AppStylingSerializer(styling)
                result.append(serializer.data)
            
            return Response({
                "status": "success",
                "message": f"Retrieved {len(result)} styling configurations",
                "data": result,
                "count": len(result),
                "filters": {
                    "active_only": active_only
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving styling configurations: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AppStylingActivateAPIView(APIView):
    """
    API View to activate a specific styling configuration
    POST: Activate styling by ID
    """
    authentication_classes = []  # Optional: Add authentication if needed
    permission_classes = []       # Optional: Add permissions if needed
    
    def post(self, request, styling_id):
        """Activate styling configuration by ID"""
        try:
            app_styling = AppStyling.objects.get(id=styling_id)
            
            # Deactivate all other stylings and activate this one
            AppStyling.objects.all().update(is_active=False)
            app_styling.is_active = True
            app_styling.save()
            
            response_serializer = AppStylingSerializer(app_styling)
            
            return Response({
                "status": "success",
                "message": f"Styling configuration '{app_styling.theme_name}' activated successfully",
                "data": response_serializer.data
            }, status=status.HTTP_200_OK)
            
        except AppStyling.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Styling configuration not found"
            }, status=status.HTTP_404_NOT_FOUND)


class AppStylingCSSAPIView(APIView):
    """
    API View to get CSS variables for application styling
    GET: Get CSS variables for current active styling
    """
    authentication_classes = []  # No authentication required for CSS
    permission_classes = []       # No permissions required
    
    def get(self, request, styling_id=None):
        """Get CSS variables for styling"""
        try:
            if styling_id:
                try:
                    app_styling = AppStyling.objects.get(id=styling_id)
                except AppStyling.DoesNotExist:
                    return Response({
                        "status": "error",
                        "message": f"Styling configuration with ID {styling_id} not found"
                    }, status=status.HTTP_404_NOT_FOUND)
            else:
                # Get active styling
                app_styling = AppStyling.get_active_theme()
            
            if app_styling:
                css_string = app_styling.to_css_string()
                css_variables = app_styling.css_variables
                theme_name = app_styling.theme_name
            else:
                # Return default CSS
                default_styling = AppStyling()  # Create temporary instance with defaults
                css_string = default_styling.to_css_string()
                css_variables = default_styling.css_variables
                theme_name = "Default Theme"
            
            return Response({
                "status": "success",
                "message": "CSS variables retrieved successfully",
                "data": {
                    "css_string": css_string,
                    "css_variables": css_variables,
                    "theme_name": theme_name,
                    "styling_id": app_styling.id if app_styling else None
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting CSS: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QuickSetStylingAPIView(APIView):
    """
    API View for quick styling setup (no authentication required)
    POST: Quickly set styling values and make them active
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Quickly set and activate styling configuration"""
        try:
            serializer = AppStylingCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                # Set this as active by default
                styling_data = serializer.validated_data
                styling_data['is_active'] = True
                
                # Create the new styling
                app_styling = AppStyling.objects.create(**styling_data)
                
                response_serializer = AppStylingSerializer(app_styling)
                
                return Response({
                    "status": "success",
                    "message": f"Styling configuration '{app_styling.theme_name}' created and activated successfully",
                    "data": response_serializer.data
                }, status=status.HTTP_201_CREATED)
            
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


class SetAllStylingValuesAPIView(APIView):
    """
    API View to set ALL styling values in one comprehensive request
    POST: Set all styling properties at once (colors, fonts, borders, etc.)
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Set all styling values in one request"""
        try:
            # Get all data from request
            data = request.data.copy()
            
            # Set default theme name if not provided
            if 'theme_name' not in data or not data['theme_name']:
                data['theme_name'] = f"Custom Theme {AppStyling.objects.count() + 1}"
            
            # Ensure this theme becomes active
            data['is_active'] = True
            
            # Validate data using serializer
            serializer = AppStylingCreateSerializer(data=data)
            
            if serializer.is_valid():
                # Deactivate all existing themes first
                AppStyling.objects.all().update(is_active=False)
                
                # Create the new styling with all values
                app_styling = AppStyling.objects.create(**serializer.validated_data)
                
                # Prepare detailed response
                response_serializer = AppStylingSerializer(app_styling)
                styling_data = response_serializer.data
                
                # Add CSS information for immediate use
                css_string = app_styling.to_css_string()
                css_variables = app_styling.css_variables
                
                return Response({
                    "status": "success",
                    "message": f"All styling values set successfully for '{app_styling.theme_name}'",
                    "data": {
                        "styling": styling_data,
                        "css": {
                            "css_string": css_string,
                            "css_variables": css_variables
                        },
                        "summary": {
                            "theme_name": app_styling.theme_name,
                            "total_properties_set": len([k for k in styling_data.keys() if styling_data[k] is not None]),
                            "is_active": app_styling.is_active,
                            "created_at": styling_data['created_at']
                        }
                    }
                }, status=status.HTTP_201_CREATED)
            
            else:
                # Return validation errors with field details
                error_details = {}
                for field, errors in serializer.errors.items():
                    error_details[field] = errors
                
                return Response({
                    "status": "error",
                    "message": "Invalid styling data provided",
                    "errors": error_details,
                    "help": {
                        "colors": "Colors should be in HEX (#FFFFFF), RGB (rgb(255,255,255)), or RGBA format",
                        "fonts": "Font sizes should include units: px, rem, em, %, or pt",
                        "theme_name": "Theme name is required and should be unique"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error setting all styling values: {str(e)}",
                "debug_info": {
                    "received_data": request.data,
                    "error_type": type(e).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get template/example for setting all values"""
        try:
            # Return a comprehensive template showing all available fields
            template = {
                "theme_name": "My Custom Theme",
                "description": "Custom styling for my application",
                "primary_color": "#3498db",
                "secondary_color": "#e74c3c",
                "background_color": "#ffffff",
                "button_color": "#2ecc71",
                "text_color": "#2c3e50",
                "heading_font_size": "28px",
                "body_font_size": "16px",
                "font_family": "Arial, sans-serif",
                "border_radius": "8px"
            }
            
            return Response({
                "status": "success",
                "message": "Template for setting all styling values",
                "data": {
                    "template": template,
                    "usage": {
                        "method": "POST",
                        "endpoint": "/api/set-all-styling/",
                        "description": "Send JSON data with all or some of the template fields",
                        "note": "All fields are optional except theme_name"
                    },
                    "field_descriptions": {
                        "theme_name": "Name for your custom theme (required)",
                        "description": "Optional description of the theme",
                        "primary_color": "Main brand color (HEX, RGB, or RGBA)",
                        "secondary_color": "Secondary accent color",
                        "background_color": "Main background color",
                        "button_color": "Default button color",
                        "text_color": "Main text color",
                        "heading_font_size": "Size for headings (px, rem, em, %, pt)",
                        "body_font_size": "Size for body text",
                        "font_family": "Font family name",
                        "border_radius": "Border radius for elements"
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting template: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAllStylingValuesAPIView(APIView):
    """
    API View to GET all styling values that have been set
    GET: Retrieve all styling configurations with detailed information
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def get(self, request):
        """Get all styling values/configurations"""
        try:
            # Query parameters for filtering
            active_only = request.GET.get('active_only', 'false').lower() == 'true'
            include_css = request.GET.get('include_css', 'true').lower() == 'true'
            theme_id = request.GET.get('theme_id')
            theme_name = request.GET.get('theme_name')
            
            # Filter stylings based on parameters
            stylings = AppStyling.objects.all()
            
            if active_only:
                stylings = stylings.filter(is_active=True)
            
            if theme_id:
                stylings = stylings.filter(id=theme_id)
            
            if theme_name:
                stylings = stylings.filter(theme_name__icontains=theme_name)
            
            # Order by most recently updated and active first
            stylings = stylings.order_by('-is_active', '-updated_at')
            
            # Prepare response data
            result = []
            for styling in stylings:
                serializer = AppStylingSerializer(styling)
                styling_data = serializer.data
                
                # Add CSS information if requested
                if include_css:
                    styling_data['css_output'] = {
                        "css_string": styling.to_css_string(),
                        "css_variables": styling.css_variables
                    }
                
                # Add summary information
                styling_data['summary'] = {
                    "is_currently_active": styling.is_active,
                    "total_properties": len([k for k in styling_data.keys() if styling_data[k] is not None]),
                    "has_custom_colors": bool(styling.primary_color and styling.secondary_color),
                    "has_custom_fonts": bool(styling.font_family and styling.heading_font_size),
                    "created_days_ago": (timezone.now() - styling.created_at).days if styling.created_at else None
                }
                
                result.append(styling_data)
            
            # Get active theme for quick reference
            active_theme = AppStyling.get_active_theme()
            active_theme_info = None
            if active_theme:
                active_theme_serializer = AppStylingSerializer(active_theme)
                active_theme_info = {
                    "id": active_theme.id,
                    "theme_name": active_theme.theme_name,
                    "primary_color": active_theme.primary_color,
                    "background_color": active_theme.background_color,
                    "font_family": active_theme.font_family
                }
            
            return Response({
                "status": "success",
                "message": f"Retrieved {len(result)} styling configuration(s)",
                "data": {
                    "styling_configurations": result,
                    "active_theme": active_theme_info,
                    "total_count": len(result),
                    "filters_applied": {
                        "active_only": active_only,
                        "include_css": include_css,
                        "theme_id": theme_id,
                        "theme_name": theme_name
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving styling values: {str(e)}",
                "debug_info": {
                    "query_params": dict(request.GET),
                    "error_type": type(e).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
