from django.contrib import admin
from .models import EmployeeAnalytics, AWSCredential


@admin.register(EmployeeAnalytics)
class EmployeeAnalyticsAdmin(admin.ModelAdmin):
    """
    Admin configuration for Employee Analytics
    """
    list_display = [
        'total_employees',
        'growth_rate_percentage', 
        'active_users',
        'inactive_users',
        'source_bucket',
        'last_s3_sync',
        'updated_at'
    ]
    
    list_filter = [
        'source_bucket',
        'last_s3_sync',
        'created_at',
        'updated_at'
    ]
    
    search_fields = ['source_bucket']
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'last_s3_sync'
    ]
    
    fieldsets = (
        ('Employee Metrics', {
            'fields': (
                'total_employees',
                'growth_rate',
                'active_users',
                'inactive_users',
                'pending_users'
            )
        }),
        ('S3 Integration', {
            'fields': (
                'source_bucket',
                'last_s3_sync'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def growth_rate_percentage(self, obj):
        """Display growth rate as percentage"""
        return obj.growth_rate_percentage
    growth_rate_percentage.short_description = 'Growth Rate'


@admin.register(AWSCredential)
class AWSCredentialAdmin(admin.ModelAdmin):
    """
    Admin configuration for AWS Credentials
    """
    list_display = [
        'name',
        'credential_type',
        'masked_access_key',
        'region',
        'bucket_name',
        'is_active',
        'is_production',
        'updated_at'
    ]
    
    list_filter = [
        'credential_type',
        'is_active',
        'is_production',
        'region',
        'created_at'
    ]
    
    search_fields = [
        'name',
        'description',
        'bucket_name'
    ]
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'masked_access_key',
        'masked_secret_key'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                'credential_type',
                'description'
            )
        }),
        ('AWS Configuration', {
            'fields': (
                'access_key',
                'secret_key',
                'region',
                'bucket_name'
            )
        }),
        ('Security Info', {
            'fields': (
                'masked_access_key',
                'masked_secret_key'
            ),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': (
                'is_active',
                'is_production'
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def masked_access_key(self, obj):
        """Display masked access key"""
        return obj.masked_access_key
    masked_access_key.short_description = 'Access Key (Masked)'
    
    def save_model(self, request, obj, form, change):
        """Custom save to handle credential encryption in production"""
        # In production, you might want to encrypt the credentials
        # For now, we'll save them as-is
        super().save_model(request, obj, form, change)
