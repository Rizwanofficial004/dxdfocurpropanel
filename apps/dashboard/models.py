from django.db import models
from django.utils import timezone


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
