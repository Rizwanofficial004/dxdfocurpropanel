from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import json


class EmployeeAnalytics(models.Model):
    """
    Model to store employee analytics data for caching and historical tracking
    """
    total_employees = models.IntegerField(default=0)
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    active_users = models.IntegerField(default=0)
    inactive_users = models.IntegerField(default=0)
    pending_users = models.IntegerField(default=0)
    
    # S3 metadata
    source_bucket = models.CharField(max_length=255, default='')
    last_s3_sync = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Employee Analytics"
        verbose_name_plural = "Employee Analytics"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Employee Analytics - {self.total_employees} employees ({self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def growth_rate_percentage(self):
        """Return growth rate as percentage string"""
        return f"{self.growth_rate}%"
    
    @classmethod
    def get_latest(cls):
        """Get the most recent analytics record"""
        return cls.objects.first()
    
    @classmethod
    def create_from_s3_data(cls, s3_data):
        """Create analytics record from S3 data"""
        return cls.objects.create(
            total_employees=s3_data.get('total_employees', 0),
            growth_rate=s3_data.get('growth_rate', 0.0),
            active_users=s3_data.get('active_users', 0),
            source_bucket=s3_data.get('bucket', ''),
            last_s3_sync=timezone.now()
        )


class AWSCredential(models.Model):
    """
    Model to store AWS credentials for the CRM system
    """
    CREDENTIAL_TYPES = [
        ('aws', 'AWS'),
        ('s3', 'S3'),
        ('ec2', 'EC2'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    credential_type = models.CharField(max_length=20, choices=CREDENTIAL_TYPES)
    description = models.TextField(blank=True)
    
    # AWS credentials (encrypted in production)
    access_key = models.CharField(max_length=255)
    secret_key = models.CharField(max_length=255)
    
    # Additional configuration
    region = models.CharField(max_length=50, default='us-east-1')
    bucket_name = models.CharField(max_length=255, blank=True)
    
    # Status flags
    is_active = models.BooleanField(default=True)
    is_production = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "AWS Credential"
        verbose_name_plural = "AWS Credentials"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.credential_type})"
    
    @property
    def masked_access_key(self):
        """Return masked access key for security"""
        if len(self.access_key) > 8:
            return f"{self.access_key[:4]}...{self.access_key[-4:]}"
        return "****"
    
    @property
    def masked_secret_key(self):
        """Return masked secret key for security"""
        return "****" + self.secret_key[-4:] if len(self.secret_key) > 4 else "****"


class Employee(models.Model):
    """
    Model to store employee information fetched from CRM API
    """
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    employee_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    
    # CRM Data (stored as JSON)
    crm_data = models.JSONField(default=dict, blank=True)
    s3_data = models.JSONField(default=dict, blank=True)
    
    # Status flags
    is_active = models.BooleanField(default=True)
    in_crm = models.BooleanField(default=False)
    in_s3 = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_sync = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['name']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    
    @property
    def complete_profile(self):
        """Check if employee has both CRM and S3 data"""
        return self.in_crm and self.in_s3


class TimerSession(models.Model):
    """
    Model to track employee timer sessions
    """
    TIMER_STATUS_CHOICES = [
        ('stopped', 'Stopped'),
        ('running', 'Running'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='timer_sessions')
    
    # Timer configuration
    duration_minutes = models.IntegerField(default=25)  # Default Pomodoro time
    duration_seconds = models.IntegerField(default=0)
    
    # Session tracking
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    pause_time = models.DateTimeField(null=True, blank=True)
    total_paused_duration = models.DurationField(default=timezone.timedelta)
    
    # Status and settings
    status = models.CharField(max_length=20, choices=TIMER_STATUS_CHOICES, default='stopped')
    auto_start = models.BooleanField(default=False)
    notifications_enabled = models.BooleanField(default=True)
    
    # Screenshot settings
    screenshot_interval = models.IntegerField(default=10)  # seconds between screenshots
    last_screenshot_time = models.DateTimeField(null=True, blank=True)
    total_screenshots = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Timer Session"
        verbose_name_plural = "Timer Sessions"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_time']),
        ]
    
    def __str__(self):
        return f"{self.employee.name} - {self.status} ({self.duration_minutes}:{self.duration_seconds:02d})"
    
    @property
    def total_duration_seconds(self):
        """Get total timer duration in seconds"""
        return (self.duration_minutes * 60) + self.duration_seconds
    
    @property
    def elapsed_time(self):
        """Calculate elapsed time since start"""
        if not self.start_time:
            return timezone.timedelta(0)
        
        end_time = self.end_time or timezone.now()
        elapsed = end_time - self.start_time
        
        # Subtract paused time
        elapsed -= self.total_paused_duration
        
        return elapsed
    
    @property
    def remaining_time(self):
        """Calculate remaining time"""
        total_duration = timezone.timedelta(seconds=self.total_duration_seconds)
        elapsed = self.elapsed_time
        remaining = total_duration - elapsed
        
        return remaining if remaining > timezone.timedelta(0) else timezone.timedelta(0)
    
    @property
    def is_completed(self):
        """Check if timer has completed"""
        return self.remaining_time == timezone.timedelta(0) and self.status != 'stopped'
    
    def start_timer(self):
        """Start the timer"""
        if self.status == 'stopped':
            self.start_time = timezone.now()
            self.status = 'running'
            self.save()
            return True
        elif self.status == 'paused':
            # Resume from pause
            if self.pause_time:
                pause_duration = timezone.now() - self.pause_time
                self.total_paused_duration += pause_duration
                self.pause_time = None
            self.status = 'running'
            self.save()
            return True
        return False
    
    def pause_timer(self):
        """Pause the timer"""
        if self.status == 'running':
            self.pause_time = timezone.now()
            self.status = 'paused'
            self.save()
            return True
        return False
    
    def stop_timer(self):
        """Stop the timer"""
        if self.status in ['running', 'paused']:
            self.end_time = timezone.now()
            self.status = 'stopped'
            if self.pause_time:
                pause_duration = self.end_time - self.pause_time
                self.total_paused_duration += pause_duration
                self.pause_time = None
            self.save()
            return True
        return False
    
    def reset_timer(self):
        """Reset the timer to initial state"""
        self.start_time = None
        self.end_time = None
        self.pause_time = None
        self.total_paused_duration = timezone.timedelta()
        self.status = 'stopped'
        self.total_screenshots = 0
        self.last_screenshot_time = None
        self.save()
        return True


class ScreenshotLog(models.Model):
    """
    Model to log screenshot activity for timer sessions
    """
    timer_session = models.ForeignKey(TimerSession, on_delete=models.CASCADE, related_name='screenshots')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='screenshots')
    
    # Screenshot details
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(default=0)  # bytes
    
    # Timing
    timestamp = models.DateTimeField(auto_now_add=True)
    session_elapsed_time = models.DurationField()  # Time elapsed in session when screenshot was taken
    
    # Status
    uploaded_to_s3 = models.BooleanField(default=False)
    s3_key = models.CharField(max_length=500, blank=True)
    
    class Meta:
        verbose_name = "Screenshot Log"
        verbose_name_plural = "Screenshot Logs"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timer_session', 'timestamp']),
            models.Index(fields=['employee', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.employee.name} - {self.filename} ({self.timestamp})"
    
    @property
    def file_size_mb(self):
        """Get file size in MB"""
        return round(self.file_size / (1024 * 1024), 2)


class UserTimer(models.Model):
    """
    Simple timer model for tracking user timer sessions
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timer_sessions')
    
    # Timer data
    duration_seconds = models.IntegerField(help_text="Timer duration in seconds")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Optional metadata
    timer_name = models.CharField(max_length=100, blank=True, default="Timer Session")
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "User Timer"
        verbose_name_plural = "User Timers"
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.duration_seconds}s ({self.start_time.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def duration_formatted(self):
        """Return duration in HH:MM:SS format"""
        hours = self.duration_seconds // 3600
        minutes = (self.duration_seconds % 3600) // 60
        seconds = self.duration_seconds % 60
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
    
    def save(self, *args, **kwargs):
        if not self.end_time:
            self.end_time = timezone.now()
        super().save(*args, **kwargs)


class AppStyling(models.Model):
    """
    Model to store global application styling/theme configurations
    This is for general app styling, not user-specific
    """
    # Styling identification
    theme_name = models.CharField(max_length=100, default="Default Theme", help_text="Name of the theme")
    description = models.CharField(max_length=200, blank=True, help_text="Description of the styling theme")
    
    # Color configurations
    primary_color = models.CharField(max_length=50, default="#1E90FF", help_text="HEX or RGB format (e.g., #1E90FF or rgb(30,144,255))")
    secondary_color = models.CharField(max_length=50, default="#32CD32", help_text="HEX or RGB format")
    background_color = models.CharField(max_length=50, default="#FFFFFF", help_text="HEX or RGB format")
    button_color = models.CharField(max_length=50, default="#007BFF", help_text="HEX or RGB format")
    text_color = models.CharField(max_length=50, default="#333333", help_text="HEX or RGB format")
    
    # Font configurations
    heading_font_size = models.CharField(max_length=20, default="24px", help_text="Font size in px or rem (e.g., '24px', '1.5rem')")
    body_font_size = models.CharField(max_length=20, default="16px", help_text="Font size in px or rem")
    font_family = models.CharField(max_length=100, default="Arial", help_text="Font family name (e.g., 'Roboto', 'Arial')")
    
    # Border configurations
    border_radius = models.CharField(max_length=20, default="5px", blank=True, help_text="Border radius (e.g., '5px')")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Whether this styling is currently active for the application")
    is_default = models.BooleanField(default=False, help_text="Whether this is the default theme")
    
    # Metadata
    created_by = models.CharField(max_length=100, blank=True, help_text="Who created this theme")
    version = models.CharField(max_length=20, default="1.0", help_text="Theme version")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "App Styling"
        verbose_name_plural = "App Stylings"
        ordering = ['-is_active', '-is_default', '-updated_at']
    
    def __str__(self):
        status = " (Active)" if self.is_active else ""
        default = " (Default)" if self.is_default else ""
        return f"{self.theme_name}{status}{default}"
    
    @property
    def color_palette(self):
        """Return all colors as a dictionary"""
        return {
            'primary': self.primary_color,
            'secondary': self.secondary_color,
            'background': self.background_color,
            'button': self.button_color,
            'text': self.text_color
        }
    
    @property
    def font_settings(self):
        """Return all font settings as a dictionary"""
        return {
            'heading_size': self.heading_font_size,
            'body_size': self.body_font_size,
            'family': self.font_family
        }
    
    @property
    def css_variables(self):
        """Generate CSS custom properties for this styling"""
        return {
            '--primary-color': self.primary_color,
            '--secondary-color': self.secondary_color,
            '--background-color': self.background_color,
            '--button-color': self.button_color,
            '--text-color': self.text_color,
            '--heading-font-size': self.heading_font_size,
            '--body-font-size': self.body_font_size,
            '--font-family': self.font_family,
            '--border-radius': self.border_radius,
        }
    
    def to_css_string(self):
        """Generate CSS string with custom properties"""
        css_vars = self.css_variables
        css_lines = [f"  {key}: {value};" for key, value in css_vars.items()]
        return ":root {\n" + "\n".join(css_lines) + "\n}"
    
    @classmethod
    def get_active_theme(cls):
        """Get the currently active theme"""
        try:
            return cls.objects.filter(is_active=True).first()
        except cls.DoesNotExist:
            return None
    
    @classmethod
    def get_default_theme(cls):
        """Get the default theme"""
        try:
            return cls.objects.filter(is_default=True).first()
        except cls.DoesNotExist:
            return None
    
    def save(self, *args, **kwargs):
        # If this is set as active, deactivate all others
        if self.is_active:
            AppStyling.objects.filter(is_active=True).update(is_active=False)
        
        # If this is set as default, remove default from all others
        if self.is_default:
            AppStyling.objects.filter(is_default=True).update(is_default=False)
        
        super().save(*args, **kwargs)


class UserStyling(models.Model):
    """
    Model to store user-specific styling/theme configurations
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='styling')
    
    # Color configurations
    primary_color = models.CharField(max_length=50, default="#1E90FF", help_text="HEX or RGB format (e.g., #1E90FF or rgb(30,144,255))")
    secondary_color = models.CharField(max_length=50, default="#32CD32", help_text="HEX or RGB format")
    background_color = models.CharField(max_length=50, default="#FFFFFF", help_text="HEX or RGB format")
    button_color = models.CharField(max_length=50, default="#007BFF", help_text="HEX or RGB format")
    text_color = models.CharField(max_length=50, default="#333333", help_text="HEX or RGB format")
    
    # Font configurations
    heading_font_size = models.CharField(max_length=20, default="24px", help_text="Font size in px or rem (e.g., '24px', '1.5rem')")
    body_font_size = models.CharField(max_length=20, default="16px", help_text="Font size in px or rem")
    font_family = models.CharField(max_length=100, default="Arial", help_text="Font family name (e.g., 'Roboto', 'Arial')")
    
    # Border configurations
    border_radius = models.CharField(max_length=20, default="5px", blank=True, help_text="Border radius (e.g., '5px')")
    
    # Metadata
    theme_name = models.CharField(max_length=100, blank=True, help_text="Optional theme name")
    description = models.CharField(max_length=200, blank=True, help_text="Optional description of the styling")
    is_active = models.BooleanField(default=True, help_text="Whether this styling is currently active")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Styling"
        verbose_name_plural = "User Stylings"
        ordering = ['-updated_at']
    
    def __str__(self):
        theme_display = f" ({self.theme_name})" if self.theme_name else ""
        return f"{self.user.username} - Styling{theme_display}"
    
    @property
    def color_palette(self):
        """Return all colors as a dictionary"""
        return {
            'primary': self.primary_color,
            'secondary': self.secondary_color,
            'background': self.background_color,
            'button': self.button_color,
            'text': self.text_color
        }
    
    @property
    def font_settings(self):
        """Return all font settings as a dictionary"""
        return {
            'heading_size': self.heading_font_size,
            'body_size': self.body_font_size,
            'family': self.font_family
        }
    
    @property
    def css_variables(self):
        """Generate CSS custom properties for this styling"""
        return {
            '--primary-color': self.primary_color,
            '--secondary-color': self.secondary_color,
            '--background-color': self.background_color,
            '--button-color': self.button_color,
            '--text-color': self.text_color,
            '--heading-font-size': self.heading_font_size,
            '--body-font-size': self.body_font_size,
            '--font-family': self.font_family,
            '--border-radius': self.border_radius,
        }
    
    def to_css_string(self):
        """Generate CSS string with custom properties"""
        css_vars = self.css_variables
        css_lines = [f"  {key}: {value};" for key, value in css_vars.items()]
        return ":root {\n" + "\n".join(css_lines) + "\n}"


class UserNumericValue(models.Model):
    """
    Simple model to store numeric values for each user
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='numeric_value')
    value = models.IntegerField(default=0, help_text="Numeric value for the user")
    
    # Metadata
    description = models.CharField(max_length=200, blank=True, help_text="Optional description of what this value represents")
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "User Numeric Value"
        verbose_name_plural = "User Numeric Values"
        ordering = ['-value']
    
    def __str__(self):
        return f"{self.user.username}: {self.value}"


class SystemCredentials(models.Model):
    """
    Model to store system credentials and configuration values
    Includes AWS, Database, OpenAI, and Auth tokens
    """
    # Credential categories
    CREDENTIAL_TYPES = [
        ('aws', 'AWS Credentials'),
        ('database', 'Database Credentials'),
        ('openai', 'OpenAI API Key'),
        ('auth', 'Auth Token'),
        ('general', 'General Configuration'),
    ]
    
    # Basic information
    credential_name = models.CharField(max_length=200, unique=True, help_text="Unique name for this credential set")
    credential_type = models.CharField(max_length=50, choices=CREDENTIAL_TYPES, default='general')
    description = models.TextField(blank=True, help_text="Description of this credential configuration")
    
    # AWS Credentials
    aws_access_key_id = models.CharField(max_length=500, blank=True, help_text="AWS Access Key ID")
    aws_secret_access_key = models.CharField(max_length=500, blank=True, help_text="AWS Secret Access Key")
    aws_region = models.CharField(max_length=50, blank=True, default='us-east-1', help_text="AWS Region")
    aws_bucket_name = models.CharField(max_length=200, blank=True, help_text="S3 Bucket Name")
    
    # Database Credentials
    db_host = models.CharField(max_length=200, blank=True, help_text="Database Host")
    db_port = models.CharField(max_length=10, blank=True, default='5432', help_text="Database Port")
    db_name = models.CharField(max_length=200, blank=True, help_text="Database Name")
    db_username = models.CharField(max_length=200, blank=True, help_text="Database Username")
    db_password = models.CharField(max_length=500, blank=True, help_text="Database Password")
    db_type = models.CharField(max_length=50, blank=True, default='postgresql', help_text="Database Type (postgresql, mysql, etc.)")
    
    # OpenAI Configuration
    openai_api_key = models.CharField(max_length=500, blank=True, help_text="OpenAI API Key")
    openai_model = models.CharField(max_length=100, blank=True, default='gpt-3.5-turbo', help_text="OpenAI Model")
    openai_organization = models.CharField(max_length=200, blank=True, help_text="OpenAI Organization ID")
    
    # Auth Tokens
    auth_token = models.CharField(max_length=500, blank=True, help_text="Authentication Token")
    auth_refresh_token = models.CharField(max_length=500, blank=True, help_text="Refresh Token")
    auth_token_expires_at = models.DateTimeField(null=True, blank=True, help_text="Token Expiration Time")
    
    # General Configuration
    api_base_url = models.URLField(blank=True, help_text="Base API URL")
    api_timeout = models.IntegerField(default=30, help_text="API Timeout in seconds")
    debug_mode = models.BooleanField(default=False, help_text="Enable debug mode")
    
    # Status and metadata
    is_active = models.BooleanField(default=True, help_text="Is this credential set currently active?")
    is_default = models.BooleanField(default=False, help_text="Is this the default credential set?")
    environment = models.CharField(max_length=50, default='development', help_text="Environment (development, staging, production)")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=200, blank=True, help_text="Who created this configuration")
    
    class Meta:
        verbose_name = "System Credential"
        verbose_name_plural = "System Credentials"
        ordering = ['-is_active', '-is_default', '-updated_at']
    
    def __str__(self):
        return f"{self.credential_name} ({self.credential_type}) - {'Active' if self.is_active else 'Inactive'}"
    
    def save(self, *args, **kwargs):
        # Auto-activate if this is the first credential of its type
        if self.is_active and not self.pk:
            existing = SystemCredentials.objects.filter(
                credential_type=self.credential_type, 
                is_active=True
            ).exclude(pk=self.pk)
            if not existing.exists():
                self.is_default = True
        
        # If this is set as default, deactivate others of the same type
        if self.is_default:
            SystemCredentials.objects.filter(
                credential_type=self.credential_type
            ).exclude(pk=self.pk).update(is_default=False)
        
        super().save(*args, **kwargs)
    
    @classmethod
    def get_active_credentials(cls, credential_type=None):
        """Get active credentials, optionally filtered by type"""
        queryset = cls.objects.filter(is_active=True)
        if credential_type:
            queryset = queryset.filter(credential_type=credential_type)
        return queryset.order_by('-is_default', '-updated_at')
    
    @classmethod
    def get_default_credentials(cls, credential_type):
        """Get the default credentials for a specific type"""
        try:
            return cls.objects.get(credential_type=credential_type, is_default=True, is_active=True)
        except cls.DoesNotExist:
            # Return the most recently active one if no default
            return cls.objects.filter(credential_type=credential_type, is_active=True).first()
    
    @property
    def aws_credentials_dict(self):
        """Return AWS credentials as a dictionary"""
        return {
            'aws_access_key_id': self.aws_access_key_id,
            'aws_secret_access_key': self.aws_secret_access_key,
            'region': self.aws_region,
            'bucket_name': self.aws_bucket_name
        }
    
    @property
    def database_credentials_dict(self):
        """Return database credentials as a dictionary"""
        return {
            'host': self.db_host,
            'port': self.db_port,
            'database': self.db_name,
            'username': self.db_username,
            'password': self.db_password,
            'type': self.db_type
        }
    
    @property
    def openai_credentials_dict(self):
        """Return OpenAI credentials as a dictionary"""
        return {
            'api_key': self.openai_api_key,
            'model': self.openai_model,
            'organization': self.openai_organization
        }
    
    @property
    def auth_credentials_dict(self):
        """Return auth credentials as a dictionary"""
        return {
            'token': self.auth_token,
            'refresh_token': self.auth_refresh_token,
            'expires_at': self.auth_token_expires_at.isoformat() if self.auth_token_expires_at else None
        }
    
    @property
    def credentials_summary(self):
        """Return a summary of all configured credentials"""
        summary = {
            'credential_name': self.credential_name,
            'type': self.credential_type,
            'environment': self.environment,
            'is_active': self.is_active,
            'is_default': self.is_default,
            'has_aws': bool(self.aws_access_key_id),
            'has_database': bool(self.db_host and self.db_name),
            'has_openai': bool(self.openai_api_key),
            'has_auth': bool(self.auth_token),
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        return summary
