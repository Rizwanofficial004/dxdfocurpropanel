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
