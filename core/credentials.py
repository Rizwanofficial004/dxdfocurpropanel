"""
Credentials Management Service

This module provides centralized credential management for the DDS Focus Pro Panel.
It handles AWS, Database, CRM, and OpenAI credentials securely.
"""

import os
from typing import Dict, Any, Optional
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class CredentialsManager:
    """
    Centralized credentials manager for all external services
    """
    
    @staticmethod
    def get_aws_credentials() -> Dict[str, Any]:
        """
        Get AWS S3 credentials for file storage
        
        Returns:
            Dict containing AWS credentials and configuration
        """
        return {
            "access_key": settings.AWS_ACCESS_KEY_ID,
            "secret_key": settings.AWS_SECRET_ACCESS_KEY,
            "region": settings.AWS_S3_REGION_NAME,
            "bucket_name": settings.AWS_STORAGE_BUCKET_NAME,
            "is_configured": bool(settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY)
        }
    
    @staticmethod
    def get_database_credentials() -> Dict[str, Any]:
        """
        Get database connection credentials
        
        Returns:
            Dict containing database configuration
        """
        db_config = settings.DATABASES.get('default', {})
        return {
            "engine": db_config.get('ENGINE', ''),
            "name": db_config.get('NAME', ''),
            "user": db_config.get('USER', ''),
            "host": db_config.get('HOST', 'localhost'),
            "port": db_config.get('PORT', 5432),
            "is_configured": bool(db_config.get('NAME'))
        }
    
    @staticmethod
    def get_crm_credentials() -> Dict[str, Any]:
        """
        Get CRM API credentials
        
        Returns:
            Dict containing CRM configuration
        """
        return {
            "base_url": settings.CRM_BASE_URL,
            "token": settings.CRM_TOKEN,
            "is_configured": bool(settings.CRM_BASE_URL and settings.CRM_TOKEN)
        }
    
    @staticmethod
    def get_openai_credentials() -> Dict[str, Any]:
        """
        Get OpenAI API credentials
        
        Returns:
            Dict containing OpenAI configuration
        """
        return {
            "api_key": settings.OPENAI_API_KEY,
            "is_configured": bool(settings.OPENAI_API_KEY)
        }
    
    @staticmethod
    def validate_all_credentials() -> Dict[str, bool]:
        """
        Validate all credential configurations
        
        Returns:
            Dict with validation status for each service
        """
        validation_results = {}
        
        try:
            # Validate AWS credentials
            aws_creds = CredentialsManager.get_aws_credentials()
            validation_results['aws'] = aws_creds['is_configured']
            
            # Validate Database credentials
            db_creds = CredentialsManager.get_database_credentials()
            validation_results['database'] = db_creds['is_configured']
            
            # Validate CRM credentials
            crm_creds = CredentialsManager.get_crm_credentials()
            validation_results['crm'] = crm_creds['is_configured']
            
            # Validate OpenAI credentials
            openai_creds = CredentialsManager.get_openai_credentials()
            validation_results['openai'] = openai_creds['is_configured']
            
            logger.info("Credential validation completed", extra=validation_results)
            
        except Exception as e:
            logger.error(f"Error validating credentials: {str(e)}")
            validation_results['error'] = str(e)
        
        return validation_results
    
    @staticmethod
    def get_service_status() -> Dict[str, Dict[str, Any]]:
        """
        Get comprehensive status of all services
        
        Returns:
            Dict containing detailed status for each service
        """
        return {
            "aws": {
                "name": "Amazon Web Services S3",
                "credentials": CredentialsManager.get_aws_credentials(),
                "status": "configured" if CredentialsManager.get_aws_credentials()['is_configured'] else "not_configured"
            },
            "database": {
                "name": "PostgreSQL Database",
                "credentials": CredentialsManager.get_database_credentials(),
                "status": "configured" if CredentialsManager.get_database_credentials()['is_configured'] else "not_configured"
            },
            "crm": {
                "name": "Deluxe Bilisim CRM",
                "credentials": CredentialsManager.get_crm_credentials(),
                "status": "configured" if CredentialsManager.get_crm_credentials()['is_configured'] else "not_configured"
            },
            "openai": {
                "name": "OpenAI API",
                "credentials": CredentialsManager.get_openai_credentials(),
                "status": "configured" if CredentialsManager.get_openai_credentials()['is_configured'] else "not_configured"
            }
        }

# Convenience functions for quick access
def get_aws_client_config():
    """Get AWS client configuration"""
    creds = CredentialsManager.get_aws_credentials()
    return {
        'aws_access_key_id': creds['access_key'],
        'aws_secret_access_key': creds['secret_key'],
        'region_name': creds['region']
    }

def get_crm_headers():
    """Get CRM API headers"""
    creds = CredentialsManager.get_crm_credentials()
    return {
        'Authorization': f'Bearer {creds["token"]}',
        'Content-Type': 'application/json'
    }
