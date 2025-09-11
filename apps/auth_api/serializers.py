from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with unique email validation
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate_email(self, value):
        """
        Validate email is unique and properly formatted
        """
        # Check email format
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Please enter a valid email address.")
        
        # Check if email already exists
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists. Please use a different email or try logging in."
            )
        
        return value.lower()

    def validate_username(self, value):
        """
        Validate username is unique
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists. Please choose a different username."
            )
        return value

    def validate_password(self, value):
        """
        Validate password strength
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value

    def validate(self, attrs):
        """
        Validate that passwords match
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Passwords do not match."
            })
        
        return attrs

    def create(self, validated_data):
        """
        Create new user with validated data
        """
        # Remove password_confirm from validated_data
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validate login credentials
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Find user by email
            try:
                user = User.objects.get(email=email.lower())
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    "No account found with this email address. Please check your email or register a new account."
                )

            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    "Invalid email or password. Please try again."
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    "This account has been deactivated. Please contact support."
                )
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError(
                "Both email and password are required."
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login']
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']

    def validate_email(self, value):
        """
        Validate email is unique (excluding current user)
        """
        user = self.instance
        if User.objects.filter(email=value.lower()).exclude(id=user.id).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )
        return value.lower()


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        """
        Validate current password
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        """
        Validate new password strength
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value

    def validate(self, attrs):
        """
        Validate that new passwords match
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': "New passwords do not match."
            })
        
        return attrs

    def save(self):
        """
        Change user password
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
