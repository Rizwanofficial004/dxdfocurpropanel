#!/usr/bin/env python
"""
Sample script to populate the database with initial configuration settings
Based on the Settings Management interface with three configuration types:
1. Upload Configuration
2. Database Configuration  
3. AWS Configuration
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dxdfocurpropanel.settings')
django.setup()

from dashboard.models import ConfigurationSettings

def create_sample_configurations():
    """Create sample configuration data for the three types"""
    
    # 1. Upload Configuration
    upload_config_data = {
        "max_file_size": "10MB",
        "allowed_file_types": ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
        "upload_path": "/uploads/",
        "auto_resize_images": True,
        "max_image_width": 1920,
        "max_image_height": 1080,
        "compression_quality": 85,
        "virus_scan_enabled": True,
        "overwrite_existing": False,
        "create_thumbnails": True,
        "thumbnail_sizes": [
            {"width": 150, "height": 150, "suffix": "_thumb"},
            {"width": 300, "height": 300, "suffix": "_medium"}
        ]
    }
    
    upload_config, created = ConfigurationSettings.objects.get_or_create(
        name="Default Upload Settings",
        type="upload",
        defaults={
            "description": "Default configuration for file uploads including size limits, file types, and image processing settings",
            "config_data": upload_config_data
        }
    )
    print(f"✅ Upload Configuration: {'Created' if created else 'Already exists'}")
    
    # 2. Database Configuration
    database_config_data = {
        "connection_pool_size": 20,
        "connection_timeout": 30,
        "query_timeout": 60,
        "retry_attempts": 3,
        "backup_enabled": True,
        "backup_schedule": "daily",
        "backup_retention_days": 30,
        "encryption_enabled": True,
        "ssl_required": True,
        "maintenance_window": {
            "day": "Sunday",
            "start_time": "02:00",
            "duration_hours": 2
        },
        "performance_monitoring": {
            "slow_query_threshold": 5000,
            "log_slow_queries": True,
            "performance_insights": True
        },
        "auto_vacuum": True,
        "checkpoint_segments": 32
    }
    
    database_config, created = ConfigurationSettings.objects.get_or_create(
        name="Production Database Settings",
        type="database",
        defaults={
            "description": "Production database configuration including connection settings, backup, and performance optimization",
            "config_data": database_config_data
        }
    )
    print(f"✅ Database Configuration: {'Created' if created else 'Already exists'}")
    
    # 3. AWS Configuration
    aws_config_data = {
        "region": "us-east-1",
        "s3_bucket_name": "dxd-screenshots-bucket",
        "s3_storage_class": "STANDARD",
        "s3_encryption": "AES256",
        "s3_versioning_enabled": True,
        "s3_lifecycle_rules": {
            "transition_to_ia": 30,
            "transition_to_glacier": 90,
            "delete_after": 2555
        },
        "cloudfront_enabled": True,
        "cloudfront_distribution_id": "E1234EXAMPLE",
        "lambda_functions": {
            "image_processing": "arn:aws:lambda:us-east-1:123456789012:function:image-processor",
            "notification_handler": "arn:aws:lambda:us-east-1:123456789012:function:notification-handler"
        },
        "iam_roles": {
            "s3_access_role": "arn:aws:iam::123456789012:role/S3AccessRole",
            "lambda_execution_role": "arn:aws:iam::123456789012:role/LambdaExecutionRole"
        },
        "monitoring": {
            "cloudwatch_enabled": True,
            "sns_notifications": True,
            "sns_topic_arn": "arn:aws:sns:us-east-1:123456789012:notifications"
        },
        "cost_optimization": {
            "reserved_capacity": True,
            "spot_instances": False,
            "auto_scaling": True
        }
    }
    
    aws_config, created = ConfigurationSettings.objects.get_or_create(
        name="AWS Production Environment",
        type="aws",
        defaults={
            "description": "AWS cloud infrastructure configuration including S3, CloudFront, Lambda, and monitoring services",
            "config_data": aws_config_data
        }
    )
    print(f"✅ AWS Configuration: {'Created' if created else 'Already exists'}")
    
    # Create additional configurations for testing
    
    # Development Upload Configuration
    dev_upload_config_data = {
        "max_file_size": "5MB",
        "allowed_file_types": ["jpg", "jpeg", "png", "gif"],
        "upload_path": "/dev/uploads/",
        "auto_resize_images": False,
        "virus_scan_enabled": False,
        "overwrite_existing": True,
        "create_thumbnails": False
    }
    
    dev_upload_config, created = ConfigurationSettings.objects.get_or_create(
        name="Development Upload Settings",
        type="upload",
        defaults={
            "description": "Development environment upload configuration with relaxed settings for testing",
            "config_data": dev_upload_config_data
        }
    )
    print(f"✅ Development Upload Configuration: {'Created' if created else 'Already exists'}")
    
    # Test Database Configuration
    test_db_config_data = {
        "connection_pool_size": 5,
        "connection_timeout": 10,
        "query_timeout": 30,
        "retry_attempts": 1,
        "backup_enabled": False,
        "encryption_enabled": False,
        "ssl_required": False,
        "performance_monitoring": {
            "slow_query_threshold": 10000,
            "log_slow_queries": True,
            "performance_insights": False
        }
    }
    
    test_db_config, created = ConfigurationSettings.objects.get_or_create(
        name="Test Database Settings",
        type="database",
        defaults={
            "description": "Test database configuration with minimal settings for development and testing",
            "config_data": test_db_config_data
        }
    )
    print(f"✅ Test Database Configuration: {'Created' if created else 'Already exists'}")
    
    # Development AWS Configuration
    dev_aws_config_data = {
        "region": "us-west-2",
        "s3_bucket_name": "dxd-dev-screenshots",
        "s3_storage_class": "STANDARD",
        "s3_encryption": "none",
        "s3_versioning_enabled": False,
        "cloudfront_enabled": False,
        "monitoring": {
            "cloudwatch_enabled": False,
            "sns_notifications": False
        },
        "cost_optimization": {
            "reserved_capacity": False,
            "spot_instances": True,
            "auto_scaling": False
        }
    }
    
    dev_aws_config, created = ConfigurationSettings.objects.get_or_create(
        name="AWS Development Environment",
        type="aws",
        defaults={
            "description": "AWS development environment configuration with cost-optimized settings",
            "config_data": dev_aws_config_data
        }
    )
    print(f"✅ Development AWS Configuration: {'Created' if created else 'Already exists'}")
    
    print("\n🎉 Sample configuration data creation completed!")
    print("\n📋 Summary:")
    print(f"   • Upload Configurations: {ConfigurationSettings.objects.filter(type='upload').count()}")
    print(f"   • Database Configurations: {ConfigurationSettings.objects.filter(type='database').count()}")
    print(f"   • AWS Configurations: {ConfigurationSettings.objects.filter(type='aws').count()}")
    print(f"   • Total Configurations: {ConfigurationSettings.objects.count()}")

if __name__ == "__main__":
    create_sample_configurations()
