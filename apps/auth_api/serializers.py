from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with unique email validation and extended profile fields
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    # Extended profile fields
    organization_name = serializers.CharField(required=False, allow_blank=True, max_length=100)
    country = serializers.CharField(required=False, allow_blank=True, max_length=50)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)
    job_title = serializers.CharField(required=False, allow_blank=True, max_length=100)
    industry = serializers.CharField(required=False, allow_blank=True, max_length=100)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm', 
            'first_name', 'last_name', 'organization_name', 'country',
            'phone_number', 'job_title', 'industry'
        ]

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
        Validate username with comprehensive rules
        """
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        
        if len(value) > 30:
            raise serializers.ValidationError("Username must not exceed 30 characters.")
        
        if not re.match(r'^[a-zA-Z0-9@.+_-]+$', value):
            raise serializers.ValidationError(
                "Username may only contain letters, numbers, and @/./+/-/_ characters."
            )
        
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists. Please choose a different username."
            )
        return value

    def validate_password(self, value):
        """
        Validate password strength with comprehensive rules
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if len(value) > 128:
            raise serializers.ValidationError("Password must not exceed 128 characters.")
        
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '12345678', 'qwerty123', 'abc123456', 
            'password123', '123456789', 'welcome123'
        ]
        if value.lower() in weak_passwords:
            raise serializers.ValidationError("This password is too common. Please choose a stronger password.")
        
        return value

    def validate_first_name(self, value):
        """
        Validate first name
        """
        if value and len(value) > 30:
            raise serializers.ValidationError("First name must not exceed 30 characters.")
        
        if value and not re.match(r'^[a-zA-Z\s\-\']+$', value):
            raise serializers.ValidationError(
                "First name may only contain letters, spaces, hyphens, and apostrophes."
            )
        return value

    def validate_last_name(self, value):
        """
        Validate last name
        """
        if value and len(value) > 30:
            raise serializers.ValidationError("Last name must not exceed 30 characters.")
        
        if value and not re.match(r'^[a-zA-Z\s\-\']+$', value):
            raise serializers.ValidationError(
                "Last name may only contain letters, spaces, hyphens, and apostrophes."
            )
        return value

    def validate_organization_name(self, value):
        """
        Validate organization name
        """
        if value and len(value) > 100:
            raise serializers.ValidationError("Organization name must not exceed 100 characters.")
        return value

    def validate_country(self, value):
        """
        Validate country name
        """
        if value and len(value) > 50:
            raise serializers.ValidationError("Country name must not exceed 50 characters.")
        
        if value and not re.match(r'^[a-zA-Z\s\-\']+$', value):
            raise serializers.ValidationError(
                "Country name may only contain letters, spaces, hyphens, and apostrophes."
            )
        return value

    def validate_phone_number(self, value):
        """
        Validate phone number
        """
        if value and len(value) > 20:
            raise serializers.ValidationError("Phone number must not exceed 20 characters.")
        
        if value and not re.match(r'^[\d\+\-\(\)\s]+$', value):
            raise serializers.ValidationError(
                "Phone number may only contain digits, spaces, hyphens, parentheses, and plus sign."
            )
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
        Create new user with validated data and extended profile
        """
        # Extract profile fields
        profile_fields = {
            'organization_name': validated_data.pop('organization_name', ''),
            'country': validated_data.pop('country', ''),
            'phone_number': validated_data.pop('phone_number', ''),
            'job_title': validated_data.pop('job_title', ''),
            'industry': validated_data.pop('industry', '')
        }
        
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
        
        # Force refresh from database to ensure profile exists
        user.refresh_from_db()
        
        # Update user profile with additional fields
        try:
            # Try to import and use UserProfile (migration-safe)
            from apps.users.models import UserProfile
            from django.db import connection
            
            # Check if the table exists before trying to use it
            table_names = connection.introspection.table_names()
            if 'users_userprofile' in table_names:
                # Table exists, proceed with profile creation
                profile, created = UserProfile.objects.get_or_create(user=user)
                
                # Update profile fields
                updated = False
                for field, value in profile_fields.items():
                    if value:  # Only set non-empty values
                        setattr(profile, field, value)
                        updated = True
                
                if updated:
                    profile.mark_profile_completed()  # Check if profile is complete
                    profile.save()
                    
                    # Log for debugging
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f"Updated profile for {user.username}: org={profile.organization_name}, country={profile.country}")
            else:
                # Table doesn't exist yet, log the profile data for later migration
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"UserProfile table not found. Profile data for {user.username}: {profile_fields}")
                
        except Exception as e:
            # Log the error but don't fail registration
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating user profile (table may not exist): {str(e)}")
            # Registration continues successfully even if profile creation fails
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login - supports both email and username
    """
    email_or_username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validate login credentials - supports both email and username
        """
        email_or_username = attrs.get('email_or_username')
        password = attrs.get('password')

        if email_or_username and password:
            # Try to find user by email first, then by username
            user = None
            
            # Check if input looks like an email
            if '@' in email_or_username:
                try:
                    user = User.objects.get(email=email_or_username.lower())
                except User.DoesNotExist:
                    pass
            
            # If not found by email, try by username
            if not user:
                try:
                    user = User.objects.get(username=email_or_username)
                except User.DoesNotExist:
                    pass
            
            # If still no user found
            if not user:
                if '@' in email_or_username:
                    raise serializers.ValidationError(
                        "No account found with this email address. Please check your email or register a new account."
                    )
                else:
                    raise serializers.ValidationError(
                        "No account found with this username. Please check your username or register a new account."
                    )

            # Authenticate user
            authenticated_user = authenticate(username=user.username, password=password)
            
            if not authenticated_user:
                raise serializers.ValidationError(
                    "Invalid password. Please try again."
                )
            
            if not authenticated_user.is_active:
                raise serializers.ValidationError(
                    "This account has been deactivated. Please contact support."
                )
            
            attrs['user'] = authenticated_user
            return attrs
        else:
            raise serializers.ValidationError(
                "Both email/username and password are required."
            )


class UserLoginEmailSerializer(serializers.Serializer):
    """
    Serializer for user login with email only (for compatibility)
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """
        Validate login credentials using email
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Find user by email
            try:
                user = User.objects.get(email=email.lower())
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    "No account found with this email address. Please check your email or register a new account."
                )

            # Authenticate user
            authenticated_user = authenticate(username=user.username, password=password)
            
            if not authenticated_user:
                raise serializers.ValidationError(
                    "Invalid email or password. Please try again."
                )
            
            if not authenticated_user.is_active:
                raise serializers.ValidationError(
                    "This account has been deactivated. Please contact support."
                )
            
            attrs['user'] = authenticated_user
            return attrs
        else:
            raise serializers.ValidationError(
                "Both email and password are required."
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information including extended profile fields
    """
    # Extended profile fields from UserProfile model
    organization_name = serializers.CharField(source='profile.organization_name', required=False, allow_blank=True)
    country = serializers.CharField(source='profile.country', required=False, allow_blank=True)
    phone_number = serializers.CharField(source='profile.phone_number', required=False, allow_blank=True)
    job_title = serializers.CharField(source='profile.job_title', required=False, allow_blank=True)
    industry = serializers.CharField(source='profile.industry', required=False, allow_blank=True)
    bio = serializers.CharField(source='profile.bio', required=False, allow_blank=True)
    
    # Profile metadata
    profile_completed = serializers.BooleanField(source='profile.profile_completed', read_only=True)
    profile_completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'date_joined', 'last_login', 'organization_name', 'country',
            'phone_number', 'job_title', 'industry', 'bio',
            'profile_completed', 'profile_completion_percentage'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login', 'profile_completed', 'profile_completion_percentage']

    def get_profile_completion_percentage(self, obj):
        """Get profile completion percentage"""
        if hasattr(obj, 'profile'):
            return obj.profile.get_completion_percentage()
        return 0

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

    def update(self, instance, validated_data):
        """
        Update user and profile information
        """
        # Extract profile data
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        if profile_data and hasattr(instance, 'profile'):
            for attr, value in profile_data.items():
                setattr(instance.profile, attr, value)
            instance.profile.mark_profile_completed()  # Check completion
            instance.profile.save()
        
        return instance


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
