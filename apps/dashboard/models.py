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
    region = models.CharField(max_length=50, default='eu-north-1')
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
    
    # Basic Color configurations
    primary_color = models.CharField(max_length=50, default="#1E90FF", help_text="HEX or RGB format (e.g., #1E90FF or rgb(30,144,255))")
    secondary_color = models.CharField(max_length=50, default="#32CD32", help_text="HEX or RGB format")
    background_color = models.CharField(max_length=50, default="#FFFFFF", help_text="HEX or RGB format")
    button_color = models.CharField(max_length=50, default="#007BFF", help_text="HEX or RGB format")
    text_color = models.CharField(max_length=50, default="#333333", help_text="HEX or RGB format")
    
    # Extended Color configurations - New Fields
    submit_button_bg_color = models.CharField(max_length=50, default="#28a745", help_text="Submit button background color")
    submit_button_text_color = models.CharField(max_length=50, default="#ffffff", help_text="Submit button text color")
    primary_button_bg_color = models.CharField(max_length=50, default="#007bff", help_text="Primary button background color")
    primary_button_text_color = models.CharField(max_length=50, default="#ffffff", help_text="Primary button text color")
    secondary_button_bg_color = models.CharField(max_length=50, default="#6c757d", help_text="Secondary button background color")
    secondary_button_text_color = models.CharField(max_length=50, default="#ffffff", help_text="Secondary button text color")
    drawer_background_color = models.CharField(max_length=50, default="#f8f9fa", help_text="Drawer/sidebar background color")
    drawer_text_color = models.CharField(max_length=50, default="#212529", help_text="Drawer/sidebar text color")
    icon_color = models.CharField(max_length=50, default="#6c757d", help_text="Default icon color")
    top_color = models.CharField(max_length=50, default="#007bff", help_text="Top navigation/header color")
    
    # DDS Focus Pro Complete Color Palette
    header_color = models.CharField(max_length=50, default="#003366", help_text="Header color")
    footer_color = models.CharField(max_length=50, default="#003366", help_text="Footer color")
    button_text_color = models.CharField(max_length=50, default="#ffffff", help_text="Button text color")
    
    # Primary color variants
    primary_dark = models.CharField(max_length=50, default="#004d2e", help_text="Primary dark variant")
    primary_darker = models.CharField(max_length=50, default="#003d24", help_text="Primary darker variant")
    primary_light = models.CharField(max_length=50, default="#00804d", help_text="Primary light variant")
    primary_hover = models.CharField(max_length=50, default="#005530", help_text="Primary hover state")
    primary_active = models.CharField(max_length=50, default="#004426", help_text="Primary active state")
    
    # Secondary color variants
    secondary_dark = models.CharField(max_length=50, default="#5a6268", help_text="Secondary dark variant")
    secondary_light = models.CharField(max_length=50, default="#adb5bd", help_text="Secondary light variant")
    
    # Status colors
    success_color = models.CharField(max_length=50, default="#28a745", help_text="Success state color")
    warning_color = models.CharField(max_length=50, default="#ffc107", help_text="Warning state color")
    danger_color = models.CharField(max_length=50, default="#dc3545", help_text="Danger state color")
    danger_dark = models.CharField(max_length=50, default="#c82333", help_text="Danger dark variant")
    info_color = models.CharField(max_length=50, default="#17a2b8", help_text="Info state color")
    
    # Text and background variants
    text_light = models.CharField(max_length=50, default="#6c757d", help_text="Light text color")
    text_dark = models.CharField(max_length=50, default="#212529", help_text="Dark text color")
    background_light = models.CharField(max_length=50, default="#f8f9fa", help_text="Light background color")
    background_dark = models.CharField(max_length=50, default="#343a40", help_text="Dark background color")
    border_color = models.CharField(max_length=50, default="#dee2e6", help_text="Border color")
    
    # Button variants
    button_hover = models.CharField(max_length=50, default="#0056b3", help_text="Button hover state")
    button_dark = models.CharField(max_length=50, default="#004085", help_text="Dark button variant")
    button_light = models.CharField(max_length=50, default="#66b3ff", help_text="Light button variant")
    
    # Timer state colors
    state_idle = models.CharField(max_length=50, default="#6c757d", help_text="Timer idle state color")
    state_work = models.CharField(max_length=50, default="#006039", help_text="Timer work state color")
    state_break = models.CharField(max_length=50, default="#ffc107", help_text="Timer break state color")
    state_meeting = models.CharField(max_length=50, default="#17a2b8", help_text="Timer meeting state color")
    
    # Drawer specific colors
    drawer_overlay = models.CharField(max_length=50, default="rgba(0, 0, 0, 0.6)", help_text="Drawer overlay color")
    drawer_border = models.CharField(max_length=50, default="rgba(0, 96, 57, 0.1)", help_text="Drawer border color")
    drawer_shadow = models.CharField(max_length=50, default="rgba(0, 96, 57, 0.15)", help_text="Drawer shadow color")
    
    # Modal colors
    modal_background = models.CharField(max_length=50, default="#ffffff", help_text="Modal background color")
    modal_overlay = models.CharField(max_length=50, default="rgba(0, 0, 0, 0.6)", help_text="Modal overlay color")
    modal_border = models.CharField(max_length=50, default="#dee2e6", help_text="Modal border color")
    
    # Form elements
    input_background = models.CharField(max_length=50, default="#ffffff", help_text="Input background color")
    input_border = models.CharField(max_length=50, default="#ced4da", help_text="Input border color")
    input_focus = models.CharField(max_length=50, default="#80bdff", help_text="Input focus color")
    input_text = models.CharField(max_length=50, default="#495057", help_text="Input text color")
    
    # Navigation colors
    nav_background = models.CharField(max_length=50, default="#003366", help_text="Navigation background color")
    nav_text = models.CharField(max_length=50, default="#ffffff", help_text="Navigation text color")
    nav_hover = models.CharField(max_length=50, default="rgba(255, 255, 255, 0.1)", help_text="Navigation hover color")
    nav_active = models.CharField(max_length=50, default="#0056b3", help_text="Navigation active color")
    
    # Utility colors
    white = models.CharField(max_length=50, default="#ffffff", help_text="White color")
    black = models.CharField(max_length=50, default="#000000", help_text="Black color")
    gray_100 = models.CharField(max_length=50, default="#f8f9fa", help_text="Gray 100")
    gray_200 = models.CharField(max_length=50, default="#e9ecef", help_text="Gray 200")
    gray_300 = models.CharField(max_length=50, default="#dee2e6", help_text="Gray 300")
    gray_400 = models.CharField(max_length=50, default="#ced4da", help_text="Gray 400")
    gray_500 = models.CharField(max_length=50, default="#adb5bd", help_text="Gray 500")
    gray_600 = models.CharField(max_length=50, default="#6c757d", help_text="Gray 600")
    gray_700 = models.CharField(max_length=50, default="#495057", help_text="Gray 700")
    gray_800 = models.CharField(max_length=50, default="#343a40", help_text="Gray 800")
    gray_900 = models.CharField(max_length=50, default="#212529", help_text="Gray 900")
    
    # Login page colors
    login_background = models.CharField(max_length=50, default="#E8EDF2", help_text="Login page background color")
    login_header_bg = models.CharField(max_length=50, default="#1E88E5", help_text="Login header background color")
    login_card_bg = models.CharField(max_length=50, default="#FFFFFF", help_text="Login card background color")
    login_input_bg = models.CharField(max_length=50, default="#FFFFFF", help_text="Login input background color")
    login_input_border = models.CharField(max_length=50, default="#E0E0E0", help_text="Login input border color")
    login_input_focus = models.CharField(max_length=50, default="#1E88E5", help_text="Login input focus color")
    login_button_bg = models.CharField(max_length=50, default="#FF7043", help_text="Login button background color")
    login_button_text = models.CharField(max_length=50, default="#FFFFFF", help_text="Login button text color")
    login_button_hover = models.CharField(max_length=50, default="#FF5722", help_text="Login button hover color")
    login_text_primary = models.CharField(max_length=50, default="#333333", help_text="Login primary text color")
    login_text_secondary = models.CharField(max_length=50, default="#666666", help_text="Login secondary text color")
    login_link_color = models.CharField(max_length=50, default="#1E88E5", help_text="Login link color")
    login_error_color = models.CharField(max_length=50, default="#F44336", help_text="Login error color")
    login_success_color = models.CharField(max_length=50, default="#4CAF50", help_text="Login success color")
    
    # Enhanced modal colors
    modal_overlay_bg = models.CharField(max_length=50, default="rgba(0, 0, 0, 0.6)", help_text="Modal overlay background color")
    modal_content_bg = models.CharField(max_length=50, default="#FFFFFF", help_text="Modal content background color")
    modal_header_bg = models.CharField(max_length=50, default="#F5F5F5", help_text="Modal header background color")
    modal_border_color = models.CharField(max_length=50, default="#E0E0E0", help_text="Modal border color")
    modal_shadow = models.CharField(max_length=50, default="rgba(0, 0, 0, 0.25)", help_text="Modal shadow color")
    modal_close_bg = models.CharField(max_length=50, default="#FF5722", help_text="Modal close button background color")
    modal_close_hover = models.CharField(max_length=50, default="#FF3D00", help_text="Modal close button hover color")
    
    # Form validation colors
    input_valid_border = models.CharField(max_length=50, default="#4CAF50", help_text="Valid input border color")
    input_invalid_border = models.CharField(max_length=50, default="#F44336", help_text="Invalid input border color")
    input_placeholder = models.CharField(max_length=50, default="#999999", help_text="Input placeholder text color")
    checkbox_bg = models.CharField(max_length=50, default="#FFFFFF", help_text="Checkbox background color")
    checkbox_checked = models.CharField(max_length=50, default="#1E88E5", help_text="Checkbox checked color")
    
    # Language selector colors
    language_dropdown_bg = models.CharField(max_length=50, default="#FFFFFF", help_text="Language dropdown background color")
    language_option_hover = models.CharField(max_length=50, default="#F5F5F5", help_text="Language option hover color")
    language_border = models.CharField(max_length=50, default="#E0E0E0", help_text="Language selector border color")
    
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
            # Existing basic colors
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
            'background_color': self.background_color,
            'button_color': self.button_color,
            'text_color': self.text_color,
            
            # Header and footer
            'header_color': self.header_color,
            'footer_color': self.footer_color,
            'button_text_color': self.button_text_color,
            
            # Button variants
            'submit_button_bg_color': self.submit_button_bg_color,
            'submit_button_text_color': self.submit_button_text_color,
            'primary_button_bg_color': self.primary_button_bg_color,
            'primary_button_text_color': self.primary_button_text_color,
            'secondary_button_bg_color': self.secondary_button_bg_color,
            'secondary_button_text_color': self.secondary_button_text_color,
            
            # Drawer colors
            'drawer_background_color': self.drawer_background_color,
            'drawer_text_color': self.drawer_text_color,
            'icon_color': self.icon_color,
            'top_color': self.top_color,
            
            # Primary variants
            'primary_dark': self.primary_dark,
            'primary_darker': self.primary_darker,
            'primary_light': self.primary_light,
            'primary_hover': self.primary_hover,
            'primary_active': self.primary_active,
            
            # Secondary variants
            'secondary_dark': self.secondary_dark,
            'secondary_light': self.secondary_light,
            
            # Status colors
            'success_color': self.success_color,
            'warning_color': self.warning_color,
            'danger_color': self.danger_color,
            'danger_dark': self.danger_dark,
            'info_color': self.info_color,
            
            # Text and background variants
            'text_light': self.text_light,
            'text_dark': self.text_dark,
            'background_light': self.background_light,
            'background_dark': self.background_dark,
            'border_color': self.border_color,
            
            # Button variants
            'button_hover': self.button_hover,
            'button_dark': self.button_dark,
            'button_light': self.button_light,
            
            # Timer states
            'state_idle': self.state_idle,
            'state_work': self.state_work,
            'state_break': self.state_break,
            'state_meeting': self.state_meeting,
            
            # Drawer specific
            'drawer_overlay': self.drawer_overlay,
            'drawer_border': self.drawer_border,
            'drawer_shadow': self.drawer_shadow,
            
            # Modal colors
            'modal_background': self.modal_background,
            'modal_overlay': self.modal_overlay,
            'modal_border': self.modal_border,
            
            # Form elements
            'input_background': self.input_background,
            'input_border': self.input_border,
            'input_focus': self.input_focus,
            'input_text': self.input_text,
            
            # Navigation
            'nav_background': self.nav_background,
            'nav_text': self.nav_text,
            'nav_hover': self.nav_hover,
            'nav_active': self.nav_active,
            
            # Utility colors
            'white': self.white,
            'black': self.black,
            'gray_100': self.gray_100,
            'gray_200': self.gray_200,
            'gray_300': self.gray_300,
            'gray_400': self.gray_400,
            'gray_500': self.gray_500,
            'gray_600': self.gray_600,
            'gray_700': self.gray_700,
            'gray_800': self.gray_800,
            'gray_900': self.gray_900,
            
            # Login page colors
            'login_background': self.login_background,
            'login_header_bg': self.login_header_bg,
            'login_card_bg': self.login_card_bg,
            'login_input_bg': self.login_input_bg,
            'login_input_border': self.login_input_border,
            'login_input_focus': self.login_input_focus,
            'login_button_bg': self.login_button_bg,
            'login_button_text': self.login_button_text,
            'login_button_hover': self.login_button_hover,
            'login_text_primary': self.login_text_primary,
            'login_text_secondary': self.login_text_secondary,
            'login_link_color': self.login_link_color,
            'login_error_color': self.login_error_color,
            'login_success_color': self.login_success_color,
            
            # Modal colors
            'modal_overlay_bg': self.modal_overlay_bg,
            'modal_content_bg': self.modal_content_bg,
            'modal_header_bg': self.modal_header_bg,
            'modal_border_color': self.modal_border_color,
            'modal_shadow': self.modal_shadow,
            'modal_close_bg': self.modal_close_bg,
            'modal_close_hover': self.modal_close_hover,
            
            # Form validation colors
            'input_valid_border': self.input_valid_border,
            'input_invalid_border': self.input_invalid_border,
            'input_placeholder': self.input_placeholder,
            'checkbox_bg': self.checkbox_bg,
            'checkbox_checked': self.checkbox_checked,
            
            # Language selector colors
            'language_dropdown_bg': self.language_dropdown_bg,
            'language_option_hover': self.language_option_hover,
            'language_border': self.language_border,
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
            # Basic colors
            '--primary-color': self.primary_color,
            '--secondary-color': self.secondary_color,
            '--background-color': self.background_color,
            '--button-color': self.button_color,
            '--text-color': self.text_color,
            
            # Header and footer
            '--header-color': self.header_color,
            '--footer-color': self.footer_color,
            '--button-text-color': self.button_text_color,
            
            # Button variants
            '--submit-button-bg-color': self.submit_button_bg_color,
            '--submit-button-text-color': self.submit_button_text_color,
            '--primary-button-bg-color': self.primary_button_bg_color,
            '--primary-button-text-color': self.primary_button_text_color,
            '--secondary-button-bg-color': self.secondary_button_bg_color,
            '--secondary-button-text-color': self.secondary_button_text_color,
            
            # Drawer colors
            '--drawer-background-color': self.drawer_background_color,
            '--drawer-text-color': self.drawer_text_color,
            '--icon-color': self.icon_color,
            '--top-color': self.top_color,
            
            # Primary variants
            '--primary-dark': self.primary_dark,
            '--primary-darker': self.primary_darker,
            '--primary-light': self.primary_light,
            '--primary-hover': self.primary_hover,
            '--primary-active': self.primary_active,
            
            # Secondary variants
            '--secondary-dark': self.secondary_dark,
            '--secondary-light': self.secondary_light,
            
            # Status colors
            '--success-color': self.success_color,
            '--warning-color': self.warning_color,
            '--danger-color': self.danger_color,
            '--danger-dark': self.danger_dark,
            '--info-color': self.info_color,
            
            # Text and background variants
            '--text-light': self.text_light,
            '--text-dark': self.text_dark,
            '--background-light': self.background_light,
            '--background-dark': self.background_dark,
            '--border-color': self.border_color,
            
            # Button variants
            '--button-hover': self.button_hover,
            '--button-dark': self.button_dark,
            '--button-light': self.button_light,
            
            # Timer states
            '--state-idle': self.state_idle,
            '--state-work': self.state_work,
            '--state-break': self.state_break,
            '--state-meeting': self.state_meeting,
            
            # Drawer specific
            '--drawer-overlay': self.drawer_overlay,
            '--drawer-border': self.drawer_border,
            '--drawer-shadow': self.drawer_shadow,
            
            # Modal colors
            '--modal-background': self.modal_background,
            '--modal-overlay': self.modal_overlay,
            '--modal-border': self.modal_border,
            
            # Form elements
            '--input-background': self.input_background,
            '--input-border': self.input_border,
            '--input-focus': self.input_focus,
            '--input-text': self.input_text,
            
            # Navigation
            '--nav-background': self.nav_background,
            '--nav-text': self.nav_text,
            '--nav-hover': self.nav_hover,
            '--nav-active': self.nav_active,
            
            # Utility colors
            '--white': self.white,
            '--black': self.black,
            '--gray-100': self.gray_100,
            '--gray-200': self.gray_200,
            '--gray-300': self.gray_300,
            '--gray-400': self.gray_400,
            '--gray-500': self.gray_500,
            '--gray-600': self.gray_600,
            '--gray-700': self.gray_700,
            '--gray-800': self.gray_800,
            '--gray-900': self.gray_900,
            
            # Login page CSS variables
            '--login-background': self.login_background,
            '--login-header-bg': self.login_header_bg,
            '--login-card-bg': self.login_card_bg,
            '--login-input-bg': self.login_input_bg,
            '--login-input-border': self.login_input_border,
            '--login-input-focus': self.login_input_focus,
            '--login-button-bg': self.login_button_bg,
            '--login-button-text': self.login_button_text,
            '--login-button-hover': self.login_button_hover,
            '--login-text-primary': self.login_text_primary,
            '--login-text-secondary': self.login_text_secondary,
            '--login-link-color': self.login_link_color,
            '--login-error-color': self.login_error_color,
            '--login-success-color': self.login_success_color,
            
            # Modal CSS variables
            '--modal-overlay-bg': self.modal_overlay_bg,
            '--modal-content-bg': self.modal_content_bg,
            '--modal-header-bg': self.modal_header_bg,
            '--modal-border-color': self.modal_border_color,
            '--modal-shadow': self.modal_shadow,
            '--modal-close-bg': self.modal_close_bg,
            '--modal-close-hover': self.modal_close_hover,
            
            # Form validation CSS variables
            '--input-valid-border': self.input_valid_border,
            '--input-invalid-border': self.input_invalid_border,
            '--input-placeholder': self.input_placeholder,
            '--checkbox-bg': self.checkbox_bg,
            '--checkbox-checked': self.checkbox_checked,
            
            # Language selector CSS variables
            '--language-dropdown-bg': self.language_dropdown_bg,
            '--language-option-hover': self.language_option_hover,
            '--language-border': self.language_border,
            
            # Typography and layout
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
    aws_region = models.CharField(max_length=50, blank=True, default='eu-north-1', help_text="AWS Region")
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
