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


# ==================== CONFIGURATION SETTINGS MODEL ====================

class ConfigurationSettings(models.Model):
    """
    Configuration Settings Model for storing Upload, Database, and AWS configurations
    """
    CONFIG_TYPE_CHOICES = [
        ('upload', 'Upload Configuration'),
        ('database', 'Database Configuration'),
        ('aws', 'AWS Configuration'),
    ]
    
    # Basic fields
    name = models.CharField(max_length=100, unique=True, help_text="Configuration name (e.g., admin_uploaded, http_database)")
    type = models.CharField(max_length=20, choices=CONFIG_TYPE_CHOICES, help_text="Type of configuration")
    description = models.TextField(blank=True, null=True, help_text="Description of this configuration")
    
    # Configuration data stored as JSON
    config_data = models.JSONField(default=dict, help_text="Configuration parameters as JSON")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'configuration_settings'
        ordering = ['-updated_at']
        verbose_name = 'Configuration Setting'
        verbose_name_plural = 'Configuration Settings'
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_config_value(self, key, default=None):
        """Get a specific configuration value by key"""
        return self.config_data.get(key, default)
    
    def set_config_value(self, key, value):
        """Set a specific configuration value"""
        self.config_data[key] = value
        self.save()
    
    def update_config_data(self, new_data):
        """Update multiple configuration values at once"""
        self.config_data.update(new_data)
        self.save()


# ==================== SCREENSHOT TRACKING MODELS ====================

class DailyScreenshotCount(models.Model):
    """
    Model to track daily screenshot counts per employee
    Updated via S3 inventory reports or cron jobs
    """
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='daily_screenshot_counts')
    date = models.DateField(help_text="Date for which the count is recorded")
    total_screenshots = models.IntegerField(default=0, help_text="Total screenshots for this employee on this date")
    
    # S3 inventory data
    s3_inventory_processed_at = models.DateTimeField(null=True, blank=True, help_text="When S3 inventory was last processed")
    s3_inventory_file = models.CharField(max_length=500, blank=True, help_text="S3 inventory file used for this count")
    
    # Task folder breakdown (JSON field for detailed analytics)
    task_folder_breakdown = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Breakdown of screenshots per task folder: {'folder_name': count}"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['staff', 'date']
        ordering = ['-date', 'staff__firstname']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['staff', 'date']),
            models.Index(fields=['-date']),
        ]
    
    def __str__(self):
        return f"{self.staff.email} - {self.date} ({self.total_screenshots} screenshots)"
    
    @classmethod
    def get_employee_total_screenshots(cls, staff, start_date=None, end_date=None):
        """Get total screenshots for an employee within date range"""
        queryset = cls.objects.filter(staff=staff)
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset.aggregate(
            total=models.Sum('total_screenshots')
        )['total'] or 0
    
    @classmethod
    def get_latest_counts_all_employees(cls):
        """Get latest screenshot count for all employees"""
        from django.db.models import Max
        
        latest_dates = cls.objects.values('staff').annotate(
            latest_date=Max('date')
        )
        
        latest_counts = []
        for item in latest_dates:
            try:
                count_record = cls.objects.get(
                    staff_id=item['staff'],
                    date=item['latest_date']
                )
                latest_counts.append(count_record)
            except cls.DoesNotExist:
                continue
                
        return latest_counts


class ScreenshotInventoryLog(models.Model):
    """
    Model to track S3 inventory processing logs
    """
    processed_at = models.DateTimeField(auto_now_add=True)
    inventory_file = models.CharField(max_length=500, help_text="S3 inventory file path")
    total_files_processed = models.IntegerField(default=0)
    total_employees_updated = models.IntegerField(default=0)
    processing_duration = models.FloatField(default=0.0, help_text="Processing time in seconds")
    
    # Status tracking
    status = models.CharField(max_length=20, choices=[
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='processing')
    
    error_message = models.TextField(blank=True, help_text="Error details if processing failed")
    
    # Summary data
    summary_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Summary statistics from processing"
    )
    
    class Meta:
        ordering = ['-processed_at']
    
    def __str__(self):
        return f"Inventory processed: {self.processed_at} - {self.status}"