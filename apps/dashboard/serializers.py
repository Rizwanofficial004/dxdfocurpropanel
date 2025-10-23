from rest_framework import serializers
from .models import UserTimer, UserNumericValue, UserStyling, AppStyling, SystemCredentials


class EmployeeAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for employee analytics data
    """
    total_employees = serializers.IntegerField()
    growth_rate = serializers.CharField()
    active_users = serializers.IntegerField()
    last_updated = serializers.CharField()
    
    class Meta:
        fields = ['total_employees', 'growth_rate', 'active_users', 'last_updated']


class EmployeeBreakdownSerializer(serializers.Serializer):
    """
    Serializer for employee breakdown data
    """
    active = serializers.IntegerField()
    inactive = serializers.IntegerField()
    pending = serializers.IntegerField()


class EmployeeAnalyticsMetaSerializer(serializers.Serializer):
    """
    Serializer for employee analytics metadata
    """
    source = serializers.CharField()
    bucket = serializers.CharField()
    timestamp = serializers.CharField()


class EmployeeAnalyticsResponseSerializer(serializers.Serializer):
    """
    Complete serializer for employee analytics API response
    """
    status = serializers.CharField()
    message = serializers.CharField()
    data = serializers.DictField()
    
    def to_representation(self, instance):
        """
        Custom representation to structure the response properly
        """
        return {
            "status": instance.get("status", "success"),
            "message": instance.get("message", "Employee analytics retrieved successfully"),
            "data": {
                "total_employees": instance.get("data", {}).get("total_employees", 0),
                "growth_rate": instance.get("data", {}).get("growth_rate", "0.0%"),
                "active_users": instance.get("data", {}).get("active_users", 0),
                "last_updated": instance.get("data", {}).get("last_updated", ""),
                "breakdown": instance.get("data", {}).get("breakdown", {}),
                "meta": instance.get("data", {}).get("meta", {})
            }
        }


class UserTimerSerializer(serializers.ModelSerializer):
    """
    Serializer for UserTimer model
    """
    duration_formatted = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserTimer
        fields = [
            'id', 'user', 'username', 'duration_seconds', 
            'duration_formatted', 'start_time', 'end_time',
            'timer_name', 'notes'
        ]
        read_only_fields = ['user', 'start_time', 'end_time']


class TimerCreateSerializer(serializers.Serializer):
    """
    Serializer for creating timer sessions
    """
    duration_seconds = serializers.IntegerField(min_value=1, help_text="Timer duration in seconds")
    timer_name = serializers.CharField(max_length=100, required=False, default="Timer Session")
    notes = serializers.CharField(required=False, allow_blank=True)


class UserNumericValueSerializer(serializers.ModelSerializer):
    """
    Serializer for UserNumericValue model
    """
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = UserNumericValue
        fields = [
            'id', 'user_id', 'username', 'value', 
            'description', 'last_updated', 'created_at'
        ]
        read_only_fields = ['user', 'last_updated', 'created_at']


class UserNumericValueCreateSerializer(serializers.Serializer):
    """
    Serializer for creating/updating user numeric values
    """
    value = serializers.IntegerField(help_text="Numeric value for the user")
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)


class UserStylingSerializer(serializers.ModelSerializer):
    """
    Serializer for UserStyling model
    """
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    color_palette = serializers.ReadOnlyField()
    font_settings = serializers.ReadOnlyField()
    css_variables = serializers.ReadOnlyField()
    
    class Meta:
        model = UserStyling
        fields = [
            'id', 'user_id', 'username', 'primary_color', 'secondary_color',
            'background_color', 'button_color', 'text_color', 'heading_font_size',
            'body_font_size', 'font_family', 'border_radius', 'theme_name',
            'description', 'is_active', 'color_palette', 'font_settings',
            'css_variables', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class UserStylingCreateSerializer(serializers.Serializer):
    """
    Serializer for creating/updating user styling configurations
    """
    # Color fields
    primary_color = serializers.CharField(max_length=50, required=False, default="#1E90FF")
    secondary_color = serializers.CharField(max_length=50, required=False, default="#32CD32")
    background_color = serializers.CharField(max_length=50, required=False, default="#FFFFFF")
    button_color = serializers.CharField(max_length=50, required=False, default="#007BFF")
    text_color = serializers.CharField(max_length=50, required=False, default="#333333")
    
    # Font fields
    heading_font_size = serializers.CharField(max_length=20, required=False, default="24px")
    body_font_size = serializers.CharField(max_length=20, required=False, default="16px")
    font_family = serializers.CharField(max_length=100, required=False, default="Arial")
    
    # Border fields
    border_radius = serializers.CharField(max_length=20, required=False, default="5px")
    
    # Metadata fields
    theme_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)
    
    def validate_primary_color(self, value):
        """Validate primary color format"""
        return self._validate_color_format(value, 'primary_color')
    
    def validate_secondary_color(self, value):
        """Validate secondary color format"""
        return self._validate_color_format(value, 'secondary_color')
    
    def validate_background_color(self, value):
        """Validate background color format"""
        return self._validate_color_format(value, 'background_color')
    
    def validate_button_color(self, value):
        """Validate button color format"""
        return self._validate_color_format(value, 'button_color')
    
    def validate_text_color(self, value):
        """Validate text color format"""
        return self._validate_color_format(value, 'text_color')
    
    def _validate_color_format(self, value, field_name):
        """Helper method to validate color format (HEX or RGB)"""
        import re
        
        # Check HEX format
        hex_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if re.match(hex_pattern, value):
            return value
        
        # Check RGB format
        rgb_pattern = r'^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$'
        if re.match(rgb_pattern, value):
            # Validate RGB values are within 0-255 range
            rgb_values = re.findall(r'\d+', value)
            for rgb_val in rgb_values:
                if not (0 <= int(rgb_val) <= 255):
                    raise serializers.ValidationError(f"{field_name} RGB values must be between 0 and 255")
            return value
        
        # Check RGBA format
        rgba_pattern = r'^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[01]?(\.\d+)?\s*\)$'
        if re.match(rgba_pattern, value):
            # Validate RGB values and alpha
            values = re.findall(r'[\d.]+', value)
            for i, val in enumerate(values[:3]):  # RGB values
                if not (0 <= int(val) <= 255):
                    raise serializers.ValidationError(f"{field_name} RGB values must be between 0 and 255")
            # Alpha value
            if len(values) > 3 and not (0 <= float(values[3]) <= 1):
                raise serializers.ValidationError(f"{field_name} alpha value must be between 0 and 1")
            return value
        
        raise serializers.ValidationError(f"{field_name} must be in HEX (#RRGGBB), RGB (rgb(r,g,b)), or RGBA (rgba(r,g,b,a)) format")
    
    def validate_heading_font_size(self, value):
        """Validate heading font size format"""
        return self._validate_font_size(value, 'heading_font_size')
    
    def validate_body_font_size(self, value):
        """Validate body font size format"""
        return self._validate_font_size(value, 'body_font_size')
    
    def _validate_font_size(self, value, field_name):
        """Helper method to validate font size format"""
        import re
        
        # Check for px, rem, em, %, pt units
        size_pattern = r'^\d+(\.\d+)?(px|rem|em|%|pt)$'
        if re.match(size_pattern, value):
            return value
        
        raise serializers.ValidationError(f"{field_name} must be in valid CSS format (e.g., '16px', '1.2rem', '1.5em', '100%', '12pt')")


class AutoTokenStylingCreateSerializer(serializers.Serializer):
    """
    Serializer for creating styling configurations using auto-token (user_id)
    """
    user_id = serializers.IntegerField(help_text="User ID to set styling for")
    
    # All styling fields are optional
    primary_color = serializers.CharField(max_length=50, required=False)
    secondary_color = serializers.CharField(max_length=50, required=False)
    background_color = serializers.CharField(max_length=50, required=False)
    button_color = serializers.CharField(max_length=50, required=False)
    text_color = serializers.CharField(max_length=50, required=False)
    heading_font_size = serializers.CharField(max_length=20, required=False)
    body_font_size = serializers.CharField(max_length=20, required=False)
    font_family = serializers.CharField(max_length=100, required=False)
    border_radius = serializers.CharField(max_length=20, required=False)
    theme_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False, default=True)


class AppStylingSerializer(serializers.ModelSerializer):
    """
    Serializer for AppStyling model (general application styling)
    """
    color_palette = serializers.ReadOnlyField()
    font_settings = serializers.ReadOnlyField()
    css_variables = serializers.ReadOnlyField()
    
    class Meta:
        model = AppStyling
        fields = [
            'id', 'theme_name', 'description', 
            # Basic colors
            'primary_color', 'secondary_color', 'background_color', 'button_color', 'text_color',
            # Header/Footer
            'header_color', 'footer_color', 'button_text_color',
            # Button variants
            'submit_button_bg_color', 'submit_button_text_color',
            'primary_button_bg_color', 'primary_button_text_color',
            'secondary_button_bg_color', 'secondary_button_text_color',
            # Drawer
            'drawer_background_color', 'drawer_text_color', 'icon_color', 'top_color',
            # Primary variants
            'primary_dark', 'primary_darker', 'primary_light', 'primary_hover', 'primary_active',
            # Secondary variants
            'secondary_dark', 'secondary_light',
            # Status colors
            'success_color', 'warning_color', 'danger_color', 'danger_dark', 'info_color',
            # Text/Background variants
            'text_light', 'text_dark', 'background_light', 'background_dark', 'border_color',
            # Button variants
            'button_hover', 'button_dark', 'button_light',
            # Timer states
            'state_idle', 'state_work', 'state_break', 'state_meeting',
            # Drawer specific
            'drawer_overlay', 'drawer_border', 'drawer_shadow',
            # Modal
            'modal_background', 'modal_overlay', 'modal_border',
            # Form elements
            'input_background', 'input_border', 'input_focus', 'input_text',
            # Navigation
            'nav_background', 'nav_text', 'nav_hover', 'nav_active',
            # Utility colors
            'white', 'black', 'gray_100', 'gray_200', 'gray_300', 'gray_400', 'gray_500',
            'gray_600', 'gray_700', 'gray_800', 'gray_900',
            # Login page colors
            'login_background', 'login_header_bg', 'login_card_bg', 'login_input_bg',
            'login_input_border', 'login_input_focus', 'login_button_bg', 'login_button_text',
            'login_button_hover', 'login_text_primary', 'login_text_secondary', 'login_link_color',
            'login_error_color', 'login_success_color',
            # Modal colors
            'modal_overlay_bg', 'modal_content_bg', 'modal_header_bg', 'modal_border_color',
            'modal_shadow', 'modal_close_bg', 'modal_close_hover',
            # Form validation colors
            'input_valid_border', 'input_invalid_border', 'input_placeholder', 'checkbox_bg', 'checkbox_checked',
            # Language selector colors
            'language_dropdown_bg', 'language_option_hover', 'language_border',
            # Typography/Layout
            'heading_font_size', 'body_font_size', 'font_family', 'border_radius', 
            # Meta
            'is_active', 'is_default', 'created_by', 'version', 
            'color_palette', 'font_settings', 'css_variables',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AppStylingCreateSerializer(serializers.Serializer):
    """
    Serializer for creating/updating general application styling configurations
    """
    # Theme metadata
    theme_name = serializers.CharField(max_length=100, required=False, default="Custom Theme")
    description = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    # Basic color fields
    primary_color = serializers.CharField(max_length=50, required=False, default="#006039")
    secondary_color = serializers.CharField(max_length=50, required=False, default="#6c757d")
    background_color = serializers.CharField(max_length=50, required=False, default="#ECF0F1")
    button_color = serializers.CharField(max_length=50, required=False, default="#007bff")
    text_color = serializers.CharField(max_length=50, required=False, default="#2C3E50")
    
    # Header/Footer colors
    header_color = serializers.CharField(max_length=50, required=False, default="#003366")
    footer_color = serializers.CharField(max_length=50, required=False, default="#003366")
    button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    
    # Extended button color fields
    submit_button_bg_color = serializers.CharField(max_length=50, required=False, default="#28a745")
    submit_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    primary_button_bg_color = serializers.CharField(max_length=50, required=False, default="#007bff")
    primary_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    secondary_button_bg_color = serializers.CharField(max_length=50, required=False, default="#6c757d")
    secondary_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    drawer_background_color = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    drawer_text_color = serializers.CharField(max_length=50, required=False, default="#212529")
    icon_color = serializers.CharField(max_length=50, required=False, default="#6c757d")
    top_color = serializers.CharField(max_length=50, required=False, default="#006039")
    
    # Primary color variants
    primary_dark = serializers.CharField(max_length=50, required=False, default="#004d2e")
    primary_darker = serializers.CharField(max_length=50, required=False, default="#003d24")
    primary_light = serializers.CharField(max_length=50, required=False, default="#00804d")
    primary_hover = serializers.CharField(max_length=50, required=False, default="#005530")
    primary_active = serializers.CharField(max_length=50, required=False, default="#004426")
    
    # Secondary color variants
    secondary_dark = serializers.CharField(max_length=50, required=False, default="#5a6268")
    secondary_light = serializers.CharField(max_length=50, required=False, default="#adb5bd")
    
    # Status colors
    success_color = serializers.CharField(max_length=50, required=False, default="#28a745")
    warning_color = serializers.CharField(max_length=50, required=False, default="#ffc107")
    danger_color = serializers.CharField(max_length=50, required=False, default="#dc3545")
    danger_dark = serializers.CharField(max_length=50, required=False, default="#c82333")
    info_color = serializers.CharField(max_length=50, required=False, default="#17a2b8")
    
    # Text and background variants
    text_light = serializers.CharField(max_length=50, required=False, default="#6c757d")
    text_dark = serializers.CharField(max_length=50, required=False, default="#212529")
    background_light = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    background_dark = serializers.CharField(max_length=50, required=False, default="#343a40")
    border_color = serializers.CharField(max_length=50, required=False, default="#dee2e6")
    
    # Button variants
    button_hover = serializers.CharField(max_length=50, required=False, default="#0056b3")
    button_dark = serializers.CharField(max_length=50, required=False, default="#004085")
    button_light = serializers.CharField(max_length=50, required=False, default="#66b3ff")
    
    # Timer state colors
    state_idle = serializers.CharField(max_length=50, required=False, default="#6c757d")
    state_work = serializers.CharField(max_length=50, required=False, default="#006039")
    state_break = serializers.CharField(max_length=50, required=False, default="#ffc107")
    state_meeting = serializers.CharField(max_length=50, required=False, default="#17a2b8")
    
    # Drawer specific colors
    drawer_overlay = serializers.CharField(max_length=50, required=False, default="rgba(0, 0, 0, 0.6)")
    drawer_border = serializers.CharField(max_length=50, required=False, default="rgba(0, 96, 57, 0.1)")
    drawer_shadow = serializers.CharField(max_length=50, required=False, default="rgba(0, 96, 57, 0.15)")
    
    # Modal colors
    modal_background = serializers.CharField(max_length=50, required=False, default="#ffffff")
    modal_overlay = serializers.CharField(max_length=50, required=False, default="rgba(0, 0, 0, 0.6)")
    modal_border = serializers.CharField(max_length=50, required=False, default="#dee2e6")
    
    # Form elements
    input_background = serializers.CharField(max_length=50, required=False, default="#ffffff")
    input_border = serializers.CharField(max_length=50, required=False, default="#ced4da")
    input_focus = serializers.CharField(max_length=50, required=False, default="#80bdff")
    input_text = serializers.CharField(max_length=50, required=False, default="#495057")
    
    # Navigation colors
    nav_background = serializers.CharField(max_length=50, required=False, default="#003366")
    nav_text = serializers.CharField(max_length=50, required=False, default="#ffffff")
    nav_hover = serializers.CharField(max_length=50, required=False, default="rgba(255, 255, 255, 0.1)")
    nav_active = serializers.CharField(max_length=50, required=False, default="#0056b3")
    
    # Utility colors
    white = serializers.CharField(max_length=50, required=False, default="#ffffff")
    black = serializers.CharField(max_length=50, required=False, default="#000000")
    gray_100 = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    gray_200 = serializers.CharField(max_length=50, required=False, default="#e9ecef")
    gray_300 = serializers.CharField(max_length=50, required=False, default="#dee2e6")
    gray_400 = serializers.CharField(max_length=50, required=False, default="#ced4da")
    gray_500 = serializers.CharField(max_length=50, required=False, default="#adb5bd")
    gray_600 = serializers.CharField(max_length=50, required=False, default="#6c757d")
    gray_700 = serializers.CharField(max_length=50, required=False, default="#495057")
    gray_800 = serializers.CharField(max_length=50, required=False, default="#343a40")
    gray_900 = serializers.CharField(max_length=50, required=False, default="#212529")
    
    # Login page colors
    login_background = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    login_header_bg = serializers.CharField(max_length=50, required=False, default="#006039")
    login_card_bg = serializers.CharField(max_length=50, required=False, default="#ffffff")
    login_input_bg = serializers.CharField(max_length=50, required=False, default="#ffffff")
    login_input_border = serializers.CharField(max_length=50, required=False, default="#ced4da")
    login_input_focus = serializers.CharField(max_length=50, required=False, default="#80bdff")
    login_button_bg = serializers.CharField(max_length=50, required=False, default="#006039")
    login_button_text = serializers.CharField(max_length=50, required=False, default="#ffffff")
    login_button_hover = serializers.CharField(max_length=50, required=False, default="#005530")
    login_text_primary = serializers.CharField(max_length=50, required=False, default="#212529")
    login_text_secondary = serializers.CharField(max_length=50, required=False, default="#6c757d")
    login_link_color = serializers.CharField(max_length=50, required=False, default="#006039")
    login_error_color = serializers.CharField(max_length=50, required=False, default="#dc3545")
    login_success_color = serializers.CharField(max_length=50, required=False, default="#28a745")
    
    # Modal colors
    modal_overlay_bg = serializers.CharField(max_length=50, required=False, default="rgba(0, 0, 0, 0.6)")
    modal_content_bg = serializers.CharField(max_length=50, required=False, default="#ffffff")
    modal_header_bg = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    modal_border_color = serializers.CharField(max_length=50, required=False, default="#dee2e6")
    modal_shadow = serializers.CharField(max_length=50, required=False, default="rgba(0, 0, 0, 0.25)")
    modal_close_bg = serializers.CharField(max_length=50, required=False, default="transparent")
    modal_close_hover = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    
    # Form validation colors
    input_valid_border = serializers.CharField(max_length=50, required=False, default="#28a745")
    input_invalid_border = serializers.CharField(max_length=50, required=False, default="#dc3545")
    input_placeholder = serializers.CharField(max_length=50, required=False, default="#6c757d")
    checkbox_bg = serializers.CharField(max_length=50, required=False, default="#ffffff")
    checkbox_checked = serializers.CharField(max_length=50, required=False, default="#006039")
    
    # Language selector colors
    language_dropdown_bg = serializers.CharField(max_length=50, required=False, default="#ffffff")
    language_option_hover = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    language_border = serializers.CharField(max_length=50, required=False, default="#ced4da")
    
    # Font fields
    heading_font_size = serializers.CharField(max_length=20, required=False, default="24px")
    body_font_size = serializers.CharField(max_length=20, required=False, default="16px")
    font_family = serializers.CharField(max_length=100, required=False, default="Arial")
    
    # Border fields
    border_radius = serializers.CharField(max_length=20, required=False, default="5px")
    
    # Status fields
    is_active = serializers.BooleanField(required=False, default=True)
    is_default = serializers.BooleanField(required=False, default=False)
    created_by = serializers.CharField(max_length=100, required=False, allow_blank=True)
    version = serializers.CharField(max_length=20, required=False, default="1.0")
    
    def validate_primary_color(self, value):
        """Validate primary color format"""
        return self._validate_color_format(value, 'primary_color')
    
    def validate_secondary_color(self, value):
        """Validate secondary color format"""
        return self._validate_color_format(value, 'secondary_color')
    
    def validate_background_color(self, value):
        """Validate background color format"""
        return self._validate_color_format(value, 'background_color')
    
    def validate_button_color(self, value):
        """Validate button color format"""
        return self._validate_color_format(value, 'button_color')
    
    def validate_text_color(self, value):
        """Validate text color format"""
        return self._validate_color_format(value, 'text_color')
    
    def _validate_color_format(self, value, field_name):
        """Helper method to validate color format (HEX or RGB)"""
        import re
        
        # Check HEX format
        hex_pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
        if re.match(hex_pattern, value):
            return value
        
        # Check RGB format
        rgb_pattern = r'^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$'
        if re.match(rgb_pattern, value):
            # Validate RGB values are within 0-255 range
            rgb_values = re.findall(r'\d+', value)
            for rgb_val in rgb_values:
                if not (0 <= int(rgb_val) <= 255):
                    raise serializers.ValidationError(f"{field_name} RGB values must be between 0 and 255")
            return value
        
        # Check RGBA format
        rgba_pattern = r'^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*[01]?(\.\d+)?\s*\)$'
        if re.match(rgba_pattern, value):
            # Validate RGB values and alpha
            values = re.findall(r'[\d.]+', value)
            for i, val in enumerate(values[:3]):  # RGB values
                if not (0 <= int(val) <= 255):
                    raise serializers.ValidationError(f"{field_name} RGB values must be between 0 and 255")
            # Alpha value
            if len(values) > 3 and not (0 <= float(values[3]) <= 1):
                raise serializers.ValidationError(f"{field_name} alpha value must be between 0 and 1")
            return value
        
        raise serializers.ValidationError(f"{field_name} must be in HEX (#RRGGBB), RGB (rgb(r,g,b)), or RGBA (rgba(r,g,b,a)) format")
    
    def validate_heading_font_size(self, value):
        """Validate heading font size format"""
        return self._validate_font_size(value, 'heading_font_size')
    
    def validate_body_font_size(self, value):
        """Validate body font size format"""
        return self._validate_font_size(value, 'body_font_size')
    
    def _validate_font_size(self, value, field_name):
        """Helper method to validate font size format"""
        import re
        
        # Check for px, rem, em, %, pt units
        size_pattern = r'^\d+(\.\d+)?(px|rem|em|%|pt)$'
        if re.match(size_pattern, value):
            return value
        
        raise serializers.ValidationError(f"{field_name} must be in valid CSS format (e.g., '16px', '1.2rem', '1.5em', '100%', '12pt')")
