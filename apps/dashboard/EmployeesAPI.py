"""
Employees API Module

This module provides API endpoints for employee-related operations,
specifically for retrieving employee analytics from AWS S3 bucket.

The module integrates with the CRM system's AWS credentials to fetch
employee data and provide dashboard analytics.
"""

from .views import EmployeesAnalyticsView
from .services import S3EmployeeService, AWSCredentialsManager

__all__ = [
    'EmployeesAnalyticsView',
    'S3EmployeeService', 
    'AWSCredentialsManager'
]

# API Version
API_VERSION = "1.0.0"

# CRM AWS Credentials Configuration
AWS_CREDENTIALS = {
    "name": "aws_s3_production",
    "credential_type": "aws", 
    "description": "AWS S3 credentials for file storage",
    "access_key": "AKIARSU6EUUWMQ5I2JWC",
    "secret_key": "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",
    "additional_config": {
        "region": "eu-north-1",
        "bucket_name": "ddsfocustime"
    },
    "is_active": True,
    "is_production": True
}
