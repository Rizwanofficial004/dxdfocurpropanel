from rest_framework import serializers
from .models import SystemCredentials


class SystemCredentialsSerializer(serializers.ModelSerializer):
    """
    Serializer for reading system credentials with all credential types
    """
    credentials_summary = serializers.ReadOnlyField()
    aws_credentials = serializers.ReadOnlyField(source='aws_credentials_dict')
    database_credentials = serializers.ReadOnlyField(source='database_credentials_dict')
    openai_credentials = serializers.ReadOnlyField(source='openai_credentials_dict')
    auth_credentials = serializers.ReadOnlyField(source='auth_credentials_dict')
    
    class Meta:
        model = SystemCredentials
        fields = [
            'id', 'credential_name', 'credential_type', 'description',
            
            # AWS fields
            'aws_access_key_id', 'aws_secret_access_key', 'aws_region', 'aws_bucket_name',
            
            # Database fields  
            'db_host', 'db_port', 'db_name', 'db_username', 'db_password', 'db_type',
            
            # OpenAI fields
            'openai_api_key', 'openai_model', 'openai_organization',
            
            # Auth fields
            'auth_token', 'auth_refresh_token', 'auth_token_expires_at',
            
            # General fields
            'api_base_url', 'api_timeout', 'debug_mode',
            
            # Status fields
            'is_active', 'is_default', 'environment',
            
            # Timestamps
            'created_at', 'updated_at', 'created_by',
            
            # Computed fields
            'credentials_summary', 'aws_credentials', 'database_credentials', 
            'openai_credentials', 'auth_credentials'
        ]
        
    def to_representation(self, instance):
        """Custom representation to mask sensitive data in responses"""
        data = super().to_representation(instance)
        
        # Mask sensitive fields for security
        sensitive_fields = [
            'aws_secret_access_key', 'db_password', 'openai_api_key', 
            'auth_token', 'auth_refresh_token'
        ]
        
        for field in sensitive_fields:
            if data.get(field):
                # Show only first 4 and last 4 characters
                value = data[field]
                if len(value) > 8:
                    data[field] = f"{value[:4]}{'*' * (len(value) - 8)}{value[-4:]}"
                else:
                    data[field] = '*' * len(value)
        
        return data


class SystemCredentialsCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating system credentials
    Allows full access to all fields for setting values
    """
    
    class Meta:
        model = SystemCredentials
        fields = [
            'credential_name', 'credential_type', 'description',
            
            # AWS fields
            'aws_access_key_id', 'aws_secret_access_key', 'aws_region', 'aws_bucket_name',
            
            # Database fields
            'db_host', 'db_port', 'db_name', 'db_username', 'db_password', 'db_type',
            
            # OpenAI fields
            'openai_api_key', 'openai_model', 'openai_organization',
            
            # Auth fields
            'auth_token', 'auth_refresh_token', 'auth_token_expires_at',
            
            # General fields
            'api_base_url', 'api_timeout', 'debug_mode',
            
            # Status fields
            'is_active', 'is_default', 'environment', 'created_by'
        ]
        
    def validate_credential_name(self, value):
        """Ensure credential name is unique"""
        if self.instance and self.instance.credential_name == value:
            return value
            
        if SystemCredentials.objects.filter(credential_name=value).exists():
            raise serializers.ValidationError("A credential configuration with this name already exists.")
        return value
    
    def validate_aws_access_key_id(self, value):
        """Validate AWS Access Key ID format"""
        if value and len(value) < 16:
            raise serializers.ValidationError("AWS Access Key ID seems too short. Please check the format.")
        return value
    
    def validate_aws_secret_access_key(self, value):
        """Validate AWS Secret Access Key format"""
        if value and len(value) < 30:
            raise serializers.ValidationError("AWS Secret Access Key seems too short. Please check the format.")
        return value
    
    def validate_openai_api_key(self, value):
        """Validate OpenAI API Key format"""
        if value and not value.startswith('sk-'):
            raise serializers.ValidationError("OpenAI API Key should start with 'sk-'")
        return value
    
    def validate_db_port(self, value):
        """Validate database port"""
        if value:
            try:
                port = int(value)
                if port < 1 or port > 65535:
                    raise serializers.ValidationError("Port must be between 1 and 65535")
            except ValueError:
                raise serializers.ValidationError("Port must be a valid number")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        credential_type = data.get('credential_type', 'general')
        
        # Type-specific validation
        if credential_type == 'aws':
            if not data.get('aws_access_key_id') or not data.get('aws_secret_access_key'):
                raise serializers.ValidationError({
                    'aws_credentials': 'AWS credentials require both access_key_id and secret_access_key'
                })
        
        elif credential_type == 'database':
            required_db_fields = ['db_host', 'db_name', 'db_username']
            missing_fields = [field for field in required_db_fields if not data.get(field)]
            if missing_fields:
                raise serializers.ValidationError({
                    'database_credentials': f'Database credentials require: {", ".join(missing_fields)}'
                })
        
        elif credential_type == 'openai':
            if not data.get('openai_api_key'):
                raise serializers.ValidationError({
                    'openai_credentials': 'OpenAI credentials require api_key'
                })
        
        elif credential_type == 'auth':
            if not data.get('auth_token'):
                raise serializers.ValidationError({
                    'auth_credentials': 'Auth credentials require auth_token'
                })
        
        return data


class SystemCredentialsSummarySerializer(serializers.ModelSerializer):
    """
    Serializer for credentials summary - minimal data for listing
    """
    credentials_summary = serializers.ReadOnlyField()
    
    class Meta:
        model = SystemCredentials
        fields = [
            'id', 'credential_name', 'credential_type', 'description',
            'is_active', 'is_default', 'environment',
            'created_at', 'updated_at', 'created_by',
            'credentials_summary'
        ]
