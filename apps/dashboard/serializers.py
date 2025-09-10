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
            'id', 'theme_name', 'description', 'primary_color', 'secondary_color',
            'background_color', 'button_color', 'text_color', 
            'submit_button_bg_color', 'submit_button_text_color',
            'primary_button_bg_color', 'primary_button_text_color',
            'secondary_button_bg_color', 'secondary_button_text_color',
            'drawer_background_color', 'drawer_text_color',
            'icon_color', 'top_color',
            'heading_font_size', 'body_font_size', 'font_family', 'border_radius', 
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
    
    # Color fields
    primary_color = serializers.CharField(max_length=50, required=False, default="#1E90FF")
    secondary_color = serializers.CharField(max_length=50, required=False, default="#32CD32")
    background_color = serializers.CharField(max_length=50, required=False, default="#FFFFFF")
    button_color = serializers.CharField(max_length=50, required=False, default="#007BFF")
    text_color = serializers.CharField(max_length=50, required=False, default="#333333")
    
    # Extended color fields
    submit_button_bg_color = serializers.CharField(max_length=50, required=False, default="#28a745")
    submit_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    primary_button_bg_color = serializers.CharField(max_length=50, required=False, default="#007bff")
    primary_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    secondary_button_bg_color = serializers.CharField(max_length=50, required=False, default="#6c757d")
    secondary_button_text_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    drawer_background_color = serializers.CharField(max_length=50, required=False, default="#f8f9fa")
    drawer_text_color = serializers.CharField(max_length=50, required=False, default="#212529")
    icon_color = serializers.CharField(max_length=50, required=False, default="#6c757d")
    top_color = serializers.CharField(max_length=50, required=False, default="#ffffff")
    
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
