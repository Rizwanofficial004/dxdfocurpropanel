# dashboard/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
import json

# from .models.user_logs import UserLogs

class Staff(models.Model):
    staffid = models.CharField(max_length=100, unique=True)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    email = models.EmailField()
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)

    # def __str__(self):
    #     return f'{self.firstname} {self.lastname}'

class User_Logs(models.Model):
    staffid = models.IntegerField()
    email =  models.EmailField()
    jsonlog = models.TextField()  # Long JSON / text store karne ke liye
    date = models.CharField(max_length=100)
    # def __str__(self):
    #     return self.email


# ==================== SETTINGS MODELS ====================

class UISettings(models.Model):
    """
    UI Settings Model for managing dashboard appearance and behavior
    """
    FONT_FAMILY_CHOICES = [
        ('Arial, sans-serif', 'Arial'),
        ('Helvetica, sans-serif', 'Helvetica'),
        ('Times New Roman, serif', 'Times New Roman'),
        ('Georgia, serif', 'Georgia'),
        ('Verdana, sans-serif', 'Verdana'),
        ('Roboto, sans-serif', 'Roboto'),
        ('Open Sans, sans-serif', 'Open Sans'),
        ('Lato, sans-serif', 'Lato'),
        ('Montserrat, sans-serif', 'Montserrat'),
        ('Source Sans Pro, sans-serif', 'Source Sans Pro'),
    ]

    FONT_SIZE_CHOICES = [
        ('12px', 'Extra Small (12px)'),
        ('14px', 'Small (14px)'),
        ('16px', 'Medium (16px)'),
        ('18px', 'Large (18px)'),
        ('20px', 'Extra Large (20px)'),
        ('24px', 'XXL (24px)'),
    ]

    # Basic identification
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    setting_name = models.CharField(max_length=100, default='default')
    is_global = models.BooleanField(default=False, help_text="Apply to all users globally")
    
    # Font Settings
    font_family = models.CharField(
        max_length=100, 
        choices=FONT_FAMILY_CHOICES, 
        default='Arial, sans-serif'
    )
    font_size = models.CharField(
        max_length=10, 
        choices=FONT_SIZE_CHOICES, 
        default='16px'
    )
    
    # Color Settings - Primary and Secondary
    primary_color = models.CharField(
        max_length=7, 
        default='#007bff',
        validators=[RegexValidator(r'^#[0-9A-Fa-f]{6}$', 'Enter a valid hex color code')]
    )
    secondary_color = models.CharField(
        max_length=7, 
        default='#6c757d',
        validators=[RegexValidator(r'^#[0-9A-Fa-f]{6}$', 'Enter a valid hex color code')]
    )
    background_color = models.CharField(
        max_length=7, 
        default='#ffffff',
        validators=[RegexValidator(r'^#[0-9A-Fa-f]{6}$', 'Enter a valid hex color code')]
    )
    text_color = models.CharField(
        max_length=7, 
        default='#333333',
        validators=[RegexValidator(r'^#[0-9A-Fa-f]{6}$', 'Enter a valid hex color code')]
    )
    
    # Additional UI Settings
    theme_mode = models.CharField(
        max_length=10,
        choices=[('light', 'Light'), ('dark', 'Dark')],
        default='light'
    )
    sidebar_collapsed = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'ui_settings'
        verbose_name = 'UI Setting'
        verbose_name_plural = 'UI Settings'
    
    def __str__(self):
        return f"UI Settings - {self.setting_name}"


class SystemCredentials(models.Model):
    """
    System Credentials Model for managing API keys and service configurations
    """
    CREDENTIAL_TYPES = [
        ('openai', 'OpenAI API Key'),
        ('aws', 'AWS Credentials'),
        ('database', 'Database Configuration'),
        ('smtp', 'SMTP Email Configuration'),
        ('oauth', 'OAuth Configuration'),
        ('api_key', 'Generic API Key'),
        ('storage', 'Storage Service'),
        ('payment', 'Payment Gateway'),
    ]

    # Basic identification
    name = models.CharField(max_length=100, unique=True)
    credential_type = models.CharField(max_length=20, choices=CREDENTIAL_TYPES)
    description = models.TextField(blank=True)
    
    # Credential fields (specific common ones)
    api_key = models.TextField(blank=True)
    secret_key = models.TextField(blank=True)
    access_key = models.TextField(blank=True)
    username = models.CharField(max_length=255, blank=True)
    password = models.TextField(blank=True)
    host = models.CharField(max_length=255, blank=True)
    port = models.IntegerField(null=True, blank=True)
    database_name = models.CharField(max_length=255, blank=True)
    
    # Additional JSON field for flexible data
    additional_config = models.JSONField(default=dict, blank=True)
    
    # Configuration settings
    is_active = models.BooleanField(default=True)
    is_production = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'system_credentials'
        verbose_name = 'System Credential'
        verbose_name_plural = 'System Credentials'
    
    def __str__(self):
        return f"{self.name} ({self.get_credential_type_display()})"


class ApplicationSettings(models.Model):
    """
    Application Settings Model for general system configurations
    """
    SETTING_TYPES = [
        ('string', 'String'),
        ('integer', 'Integer'),
        ('boolean', 'Boolean'),
        ('json', 'JSON Object'),
    ]

    # Setting identification
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='string')
    
    # Setting metadata
    category = models.CharField(max_length=50, default='general')
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    is_editable = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'application_settings'
        verbose_name = 'Application Setting'
        verbose_name_plural = 'Application Settings'
    
    def __str__(self):
        return f"{self.key} ({self.category})"
    
    def get_typed_value(self):
        """Return the value cast to the appropriate Python type"""
        if self.setting_type == 'integer':
            try:
                return int(self.value)
            except (ValueError, TypeError):
                return 0
        elif self.setting_type == 'boolean':
            return self.value.lower() in ['true', '1', 'yes', 'on']
        elif self.setting_type == 'json':
            try:
                return json.loads(self.value)
            except json.JSONDecodeError:
                return {}
        else:  # string
            return self.value


# ==================== SCREENSHOT TRACKING MODELS ====================

class ScreenshotTracker(models.Model):
    """
    Smart tracking model for screenshots with auto-update capabilities
    - Stores per-user screenshot counts and metadata
    - Tracks last update times for incremental updates
    - Optimized for fast API responses
    """
    user_email = models.EmailField(unique=True, db_index=True)
    screenshot_count = models.PositiveIntegerField(default=0)
    total_size_bytes = models.BigIntegerField(default=0)
    project_count = models.PositiveIntegerField(default=0)
    latest_screenshot_date = models.DateTimeField(null=True, blank=True)
    
    # Tracking fields
    last_updated = models.DateTimeField(auto_now=True)
    last_s3_scan = models.DateTimeField(null=True, blank=True)
    needs_update = models.BooleanField(default=True)
    
    # Metadata
    projects_json = models.TextField(default='{}')  # JSON of project counts
    sample_files_json = models.TextField(default='[]')  # JSON of sample file info
    
    class Meta:
        db_table = 'dashboard_screenshot_tracker'
        ordering = ['-screenshot_count']
    
    def __str__(self):
        return f"{self.user_email}: {self.screenshot_count:,} screenshots"
    
    def get_projects(self):
        """Get projects as dictionary"""
        try:
            return json.loads(self.projects_json)
        except json.JSONDecodeError:
            return {}
    
    def set_projects(self, projects_dict):
        """Set projects from dictionary"""
        self.projects_json = json.dumps(projects_dict)
        self.project_count = len(projects_dict)
    
    def get_sample_files(self):
        """Get sample files as list"""
        try:
            return json.loads(self.sample_files_json)
        except json.JSONDecodeError:
            return []
    
    def set_sample_files(self, files_list):
        """Set sample files from list"""
        self.sample_files_json = json.dumps(files_list[:50])  # Limit to 50 samples
    
    def get_size_mb(self):
        """Get size in megabytes"""
        return round(self.total_size_bytes / (1024*1024), 2)
    
    def get_size_gb(self):
        """Get size in gigabytes"""
        return round(self.total_size_bytes / (1024*1024*1024), 2)


class UpdateLog(models.Model):
    """
    Log of screenshot update operations
    """
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    update_type = models.CharField(max_length=50)  # 'full', 'incremental', 'user'
    users_processed = models.PositiveIntegerField(default=0)
    users_updated = models.PositiveIntegerField(default=0)
    total_screenshots = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default='running')  # 'running', 'completed', 'failed'
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'dashboard_update_log'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.update_type} update on {self.started_at.strftime('%Y-%m-%d %H:%M')}"