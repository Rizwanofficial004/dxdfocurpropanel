"""
Comprehensive credentials management views for handling system configurations
Supports AWS, Database, OpenAI, and Auth credentials
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import os
import logging
import requests
try:
    import boto3
except ImportError:
    boto3 = None
try:
    import mysql.connector
except ImportError:
    mysql = None
from .models import SystemCredentials
from .credentials_serializers import (
    SystemCredentialsSerializer, 
    SystemCredentialsCreateSerializer, 
    SystemCredentialsSummarySerializer
)

logger = logging.getLogger(__name__)


class SetAllCredentialsAPIView(APIView):
    """
    API View to SET all credential values in one comprehensive request
    POST: Set AWS, Database, OpenAI, and Auth credentials at once
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def post(self, request):
        """Set all credential values in one request"""
        try:
            # Get all data from request
            data = request.data.copy()
            
            # Set default credential name if not provided
            if 'credential_name' not in data or not data['credential_name']:
                data['credential_name'] = f"Credentials Config {SystemCredentials.objects.count() + 1}"
            
            # Set default credential type if not provided
            if 'credential_type' not in data:
                # Auto-detect type based on provided fields
                if data.get('aws_access_key_id') or data.get('aws_secret_access_key'):
                    data['credential_type'] = 'aws'
                elif data.get('db_host') or data.get('db_name'):
                    data['credential_type'] = 'database'
                elif data.get('openai_api_key'):
                    data['credential_type'] = 'openai'
                elif data.get('auth_token'):
                    data['credential_type'] = 'auth'
                else:
                    data['credential_type'] = 'general'
            
            # Ensure this credential becomes active
            data['is_active'] = True
            
            # Validate data using serializer
            serializer = SystemCredentialsCreateSerializer(data=data)
            
            if serializer.is_valid():
                # Deactivate other credentials of the same type if this is set as default
                credential_type = serializer.validated_data.get('credential_type')
                if serializer.validated_data.get('is_default', False):
                    SystemCredentials.objects.filter(
                        credential_type=credential_type
                    ).update(is_default=False)
                
                # Create the new credentials
                credentials = SystemCredentials.objects.create(**serializer.validated_data)
                
                # Prepare detailed response
                response_serializer = SystemCredentialsSerializer(credentials)
                credentials_data = response_serializer.data
                
                return Response({
                    "status": "success",
                    "message": f"All credential values set successfully for '{credentials.credential_name}'",
                    "data": {
                        "credentials": credentials_data,
                        "summary": {
                            "credential_name": credentials.credential_name,
                            "credential_type": credentials.credential_type,
                            "environment": credentials.environment,
                            "is_active": credentials.is_active,
                            "is_default": credentials.is_default,
                            "total_fields_set": len([k for k in credentials_data.keys() if credentials_data[k] not in [None, '', {}]]),
                            "created_at": credentials_data['created_at']
                        }
                    }
                }, status=status.HTTP_201_CREATED)
            
            else:
                # Return validation errors with field details
                error_details = {}
                for field, errors in serializer.errors.items():
                    error_details[field] = errors
                
                return Response({
                    "status": "error",
                    "message": "Invalid credential data provided",
                    "errors": error_details,
                    "help": {
                        "aws": "AWS credentials need: aws_access_key_id, aws_secret_access_key",
                        "database": "Database credentials need: db_host, db_name, db_username",
                        "openai": "OpenAI credentials need: openai_api_key (starts with 'sk-')",
                        "auth": "Auth credentials need: auth_token",
                        "credential_name": "Credential name is required and should be unique"
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error setting credential values: {str(e)}",
                "debug_info": {
                    "received_data": request.data,
                    "error_type": type(e).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get template/example for setting all credential values"""
        try:
            # Return comprehensive templates for all credential types
            templates = {
                "aws_credentials": {
                    "credential_name": "My AWS Config",
                    "credential_type": "aws",
                    "description": "AWS S3 and services configuration",
                    "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",
                    "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
                    "aws_region": "us-west-2",
                    "aws_bucket_name": "my-app-bucket",
                    "environment": "production"
                },
                "database_credentials": {
                    "credential_name": "My Database Config",
                    "credential_type": "database",
                    "description": "Production database connection",
                    "db_host": "localhost",
                    "db_port": "5432",
                    "db_name": "myapp_db",
                    "db_username": "db_user",
                    "db_password": "secure_password",
                    "db_type": "postgresql",
                    "environment": "production"
                },
                "openai_credentials": {
                    "credential_name": "My OpenAI Config",
                    "credential_type": "openai",
                    "description": "OpenAI API configuration",
                    "openai_api_key": "sk-1234567890abcdef1234567890abcdef",
                    "openai_model": "gpt-4",
                    "openai_organization": "org-123456789",
                    "environment": "production"
                },
                "auth_credentials": {
                    "credential_name": "My Auth Config",
                    "credential_type": "auth",
                    "description": "Authentication tokens",
                    "auth_token": "your-auth-token-here",
                    "auth_refresh_token": "your-refresh-token-here",
                    "auth_token_expires_at": "2025-12-31T23:59:59Z",
                    "environment": "production"
                },
                "general_credentials": {
                    "credential_name": "My General Config",
                    "credential_type": "general",
                    "description": "General API configuration",
                    "api_base_url": "https://api.example.com",
                    "api_timeout": 30,
                    "debug_mode": False,
                    "environment": "production"
                }
            }
            
            return Response({
                "status": "success",
                "message": "Templates for setting all credential values",
                "data": {
                    "templates": templates,
                    "usage": {
                        "method": "POST",
                        "endpoint": "/api/set-all-credentials/",
                        "description": "Send JSON data with credentials for any type",
                        "note": "credential_name is required, credential_type is auto-detected"
                    },
                    "credential_types": {
                        "aws": "AWS S3 and services credentials",
                        "database": "Database connection credentials", 
                        "openai": "OpenAI API key and configuration",
                        "auth": "Authentication tokens",
                        "general": "General API configuration"
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error getting templates: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetAllCredentialsAPIView(APIView):
    """
    API View to GET all credential values that have been set
    GET: Retrieve all credential configurations with detailed information
    """
    authentication_classes = []  # No authentication required
    permission_classes = []       # No permissions required
    
    def get(self, request):
        """Get all credential values/configurations"""
        try:
            # Query parameters for filtering
            active_only = request.GET.get('active_only', 'false').lower() == 'true'
            credential_type = request.GET.get('credential_type')
            credential_id = request.GET.get('credential_id')
            credential_name = request.GET.get('credential_name')
            environment = request.GET.get('environment')
            
            # Filter credentials based on parameters
            credentials = SystemCredentials.objects.all()
            
            if active_only:
                credentials = credentials.filter(is_active=True)
            
            if credential_type:
                credentials = credentials.filter(credential_type=credential_type)
            
            if credential_id:
                credentials = credentials.filter(id=credential_id)
            
            if credential_name:
                credentials = credentials.filter(credential_name__icontains=credential_name)
            
            if environment:
                credentials = credentials.filter(environment=environment)
            
            # Order by most recently updated and active first
            credentials = credentials.order_by('-is_active', '-is_default', '-updated_at')
            
            # Prepare response data
            result = []
            for credential in credentials:
                serializer = SystemCredentialsSerializer(credential)
                credential_data = serializer.data
                
                # Add summary information
                credential_data['credential_summary'] = {
                    "is_currently_active": credential.is_active,
                    "is_default": credential.is_default,
                    "total_fields": len([k for k in credential_data.keys() if credential_data[k] is not None]),
                    "has_aws": bool(credential.aws_access_key_id),
                    "has_database": bool(credential.db_host and credential.db_name),
                    "has_openai": bool(credential.openai_api_key),
                    "has_auth": bool(credential.auth_token),
                    "created_days_ago": (timezone.now() - credential.created_at).days if credential.created_at else None
                }
                
                result.append(credential_data)
            
            # Get active credentials by type for quick reference
            active_credentials_by_type = {}
            for cred_type in ['aws', 'database', 'openai', 'auth', 'general']:
                active_cred = SystemCredentials.get_default_credentials(cred_type)
                if active_cred:
                    active_credentials_by_type[cred_type] = {
                        "id": active_cred.id,
                        "credential_name": active_cred.credential_name,
                        "environment": active_cred.environment,
                        "is_default": active_cred.is_default
                    }
            
            return Response({
                "status": "success",
                "message": f"Retrieved {len(result)} credential configuration(s)",
                "data": {
                    "credential_configurations": result,
                    "active_credentials_by_type": active_credentials_by_type,
                    "total_count": len(result),
                    "filters_applied": {
                        "active_only": active_only,
                        "credential_type": credential_type,
                        "credential_id": credential_id,
                        "credential_name": credential_name,
                        "environment": environment
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Error retrieving credential values: {str(e)}",
                "debug_info": {
                    "query_params": dict(request.GET),
                    "error_type": type(e).__name__
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class CredentialsStatusView(APIView):
    """
    API endpoint to check the status of all service credentials
    """
    # Removed authentication requirement for development
    permission_classes = []
    
    def get(self, request):
        """
        GET /api/credentials/status/
        
        Returns the configuration status of all services
        """
        try:
            # Simple status check without core.credentials dependency
            credentials_status = {
                'aws': {
                    'configured': bool(os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY')),
                    'region': os.getenv('AWS_REGION'),
                    'bucket': os.getenv('AWS_STORAGE_BUCKET_NAME')
                },
                'openai': {
                    'configured': bool(os.getenv('OPENAI_API_KEY')),
                    'key_length': len(os.getenv('OPENAI_API_KEY', ''))
                },
                'crm': {
                    'configured': bool(os.getenv('CRM_AUTH_TOKEN') and os.getenv('CRM_BASE_URL')),
                    'base_url': os.getenv('CRM_BASE_URL')
                },
                'mysql': {
                    'configured': bool(os.getenv('MYSQL_HOST') and os.getenv('MYSQL_USER')),
                    'host': os.getenv('MYSQL_HOST'),
                    'database': os.getenv('MYSQL_DATABASE')
                }
            }
            
            response_data = {
                "status": "success",
                "message": "Credentials status retrieved successfully",
                "data": {
                    "services": credentials_status,
                    "summary": {
                        "total_services": len(credentials_status),
                        "configured_services": sum(1 for s in credentials_status.values() if s['configured']),
                    }
                }
            }
            
            logger.info("Credentials status checked")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error checking credentials status: {e}")
            return Response({
                "status": "error",
                "message": "Failed to retrieve credentials status",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class CredentialsAPIView(APIView):
    """
    Comprehensive API for managing service credentials
    """
    permission_classes = []
    
    def get(self, request):
        """
        GET /api/credentials/
        Get all service credentials (masked sensitive data)
        """
        try:
            action = request.GET.get('action', 'list')
            service = request.GET.get('service', None)
            
            if action == 'list':
                # Get all credentials (masked)
                credentials = self.get_all_credentials_masked()
                
                return Response({
                    'success': True,
                    'message': 'Retrieved all service credentials',
                    'data': {
                        'credentials': credentials,
                        'services_count': len(credentials),
                        'last_updated': os.getenv('LAST_CONFIG_UPDATE', 'Unknown')
                    }
                }, status=status.HTTP_200_OK)
            
            elif action == 'test':
                # Test specific service or all services
                if service:
                    test_result = self.test_service_connection(service)
                    return Response({
                        'success': test_result['success'],
                        'message': test_result['message'],
                        'data': test_result['details']
                    }, status=status.HTTP_200_OK if test_result['success'] else status.HTTP_400_BAD_REQUEST)
                else:
                    # Test all services
                    test_results = self.test_all_services()
                    return Response({
                        'success': True,
                        'message': 'Tested all service connections',
                        'data': test_results
                    }, status=status.HTTP_200_OK)
            
            elif action == 'validate':
                # Validate credentials format
                validation_results = self.validate_all_credentials()
                return Response({
                    'success': True,
                    'message': 'Validated all credentials',
                    'data': validation_results
                }, status=status.HTTP_200_OK)
            
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid action parameter',
                    'data': {
                        'valid_actions': ['list', 'test', 'validate'],
                        'optional_params': {
                            'service': ['aws', 'openai', 'crm', 'mysql']
                        }
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error in CredentialsAPIView GET: {e}")
            return Response({
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """
        POST /api/credentials/
        Update or add service credentials
        """
        try:
            action = request.data.get('action', 'update')
            service = request.data.get('service')
            credentials = request.data.get('credentials', {})
            
            if not service:
                return Response({
                    'success': False,
                    'message': 'Service parameter is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if action == 'update':
                # Update credentials for specific service
                result = self.update_service_credentials(service, credentials)
                
                return Response({
                    'success': result['success'],
                    'message': result['message'],
                    'data': result.get('data', {})
                }, status=status.HTTP_200_OK if result['success'] else status.HTTP_400_BAD_REQUEST)
            
            elif action == 'test_new':
                # Test new credentials without saving
                result = self.test_service_with_credentials(service, credentials)
                
                return Response({
                    'success': result['success'],
                    'message': result['message'],
                    'data': result.get('data', {})
                }, status=status.HTTP_200_OK if result['success'] else status.HTTP_400_BAD_REQUEST)
            
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid action parameter',
                    'data': {
                        'valid_actions': ['update', 'test_new']
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error in CredentialsAPIView POST: {e}")
            return Response({
                'success': False,
                'message': 'Internal server error',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_all_credentials_masked(self):
        """
        Get all credentials with sensitive data masked
        """
        credentials = {
            'aws': {
                'access_key_id': self.mask_credential(os.getenv('AWS_ACCESS_KEY_ID')),
                'secret_access_key': self.mask_credential(os.getenv('AWS_SECRET_ACCESS_KEY')),
                'region': os.getenv('AWS_REGION'),
                'bucket_name': os.getenv('AWS_STORAGE_BUCKET_NAME'),
                'configured': bool(os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY'))
            },
            'openai': {
                'api_key': self.mask_credential(os.getenv('OPENAI_API_KEY')),
                'configured': bool(os.getenv('OPENAI_API_KEY'))
            },
            'crm': {
                'auth_token': self.mask_credential(os.getenv('CRM_AUTH_TOKEN')),
                'base_url': os.getenv('CRM_BASE_URL'),
                'configured': bool(os.getenv('CRM_AUTH_TOKEN') and os.getenv('CRM_BASE_URL'))
            },
            'mysql': {
                'host': os.getenv('MYSQL_HOST'),
                'user': os.getenv('MYSQL_USER'),
                'password': self.mask_credential(os.getenv('MYSQL_PASSWORD')),
                'database': os.getenv('MYSQL_DATABASE'),
                'configured': bool(os.getenv('MYSQL_HOST') and os.getenv('MYSQL_USER') and os.getenv('MYSQL_PASSWORD'))
            }
        }
        
        return credentials
    
    def mask_credential(self, credential):
        """
        Mask sensitive credential data
        """
        if not credential:
            return None
        
        if len(credential) <= 8:
            return f"***{credential[-2:]}"
        else:
            return f"{credential[:4]}***{credential[-4:]}"
    
    def test_service_connection(self, service):
        """
        Test connection to specific service
        """
        try:
            if service == 'aws':
                return self.test_aws_connection()
            elif service == 'openai':
                return self.test_openai_connection()
            elif service == 'crm':
                return self.test_crm_connection()
            elif service == 'mysql':
                return self.test_mysql_connection()
            else:
                return {
                    'success': False,
                    'message': f'Unknown service: {service}',
                    'details': {}
                }
        except Exception as e:
            return {
                'success': False,
                'message': f'Error testing {service} connection',
                'details': {'error': str(e)}
            }
    
    def test_aws_connection(self):
        """Test AWS S3 connection"""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_REGION')
            )
            
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
            response = s3_client.head_bucket(Bucket=bucket_name)
            
            return {
                'success': True,
                'message': 'AWS S3 connection successful',
                'details': {
                    'bucket': bucket_name,
                    'region': os.getenv('AWS_REGION'),
                    'status': 'accessible'
                }
            }
        except Exception as e:
            return {
                'success': False,
                'message': 'AWS S3 connection failed',
                'details': {'error': str(e)}
            }
    
    def test_openai_connection(self):
        """Test OpenAI API connection"""
        try:
            import openai
            openai.api_key = os.getenv('OPENAI_API_KEY')
            
            # Test with a simple request
            response = openai.models.list()
            
            return {
                'success': True,
                'message': 'OpenAI API connection successful',
                'details': {
                    'models_available': len(response.data) if hasattr(response, 'data') else 'Unknown',
                    'status': 'accessible'
                }
            }
        except Exception as e:
            return {
                'success': False,
                'message': 'OpenAI API connection failed',
                'details': {'error': str(e)}
            }
    
    def test_crm_connection(self):
        """Test CRM API connection"""
        try:
            base_url = os.getenv('CRM_BASE_URL')
            auth_token = os.getenv('CRM_AUTH_TOKEN')
            
            headers = {
                'Authorization': f'Bearer {auth_token}',
                'Content-Type': 'application/json'
            }
            
            # Test with employees endpoint
            response = requests.get(f'{base_url}/employees', headers=headers, timeout=10)
            
            return {
                'success': response.status_code == 200,
                'message': f'CRM API connection {"successful" if response.status_code == 200 else "failed"}',
                'details': {
                    'status_code': response.status_code,
                    'base_url': base_url,
                    'response_size': len(response.content) if response.content else 0
                }
            }
        except Exception as e:
            return {
                'success': False,
                'message': 'CRM API connection failed',
                'details': {'error': str(e)}
            }
    
    def test_mysql_connection(self):
        """Test MySQL database connection"""
        try:
            connection = mysql.connector.connect(
                host=os.getenv('MYSQL_HOST'),
                user=os.getenv('MYSQL_USER'),
                password=os.getenv('MYSQL_PASSWORD'),
                database=os.getenv('MYSQL_DATABASE'),
                connect_timeout=10
            )
            
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()[0]
            
            cursor.close()
            connection.close()
            
            return {
                'success': True,
                'message': 'MySQL connection successful',
                'details': {
                    'host': os.getenv('MYSQL_HOST'),
                    'database': os.getenv('MYSQL_DATABASE'),
                    'version': version,
                    'status': 'accessible'
                }
            }
        except Exception as e:
            return {
                'success': False,
                'message': 'MySQL connection failed',
                'details': {'error': str(e)}
            }
    
    def test_all_services(self):
        """Test all service connections"""
        services = ['aws', 'openai', 'crm', 'mysql']
        results = {}
        
        for service in services:
            results[service] = self.test_service_connection(service)
        
        # Calculate summary
        successful_services = sum(1 for result in results.values() if result['success'])
        
        results['summary'] = {
            'total_services': len(services),
            'successful_connections': successful_services,
            'failed_connections': len(services) - successful_services,
            'overall_status': 'healthy' if successful_services == len(services) else 'partial' if successful_services > 0 else 'unhealthy'
        }
        
        return results
    
    def validate_all_credentials(self):
        """Validate all credentials format"""
        validation = {
            'aws': {
                'access_key_valid': bool(os.getenv('AWS_ACCESS_KEY_ID') and len(os.getenv('AWS_ACCESS_KEY_ID', '')) == 20),
                'secret_key_valid': bool(os.getenv('AWS_SECRET_ACCESS_KEY') and len(os.getenv('AWS_SECRET_ACCESS_KEY', '')) == 40),
                'region_valid': bool(os.getenv('AWS_REGION')),
                'bucket_valid': bool(os.getenv('AWS_STORAGE_BUCKET_NAME'))
            },
            'openai': {
                'api_key_valid': bool(os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY', '').startswith('sk-'))
            },
            'crm': {
                'token_valid': bool(os.getenv('CRM_AUTH_TOKEN')),
                'url_valid': bool(os.getenv('CRM_BASE_URL') and os.getenv('CRM_BASE_URL', '').startswith('http'))
            },
            'mysql': {
                'host_valid': bool(os.getenv('MYSQL_HOST')),
                'user_valid': bool(os.getenv('MYSQL_USER')),
                'password_valid': bool(os.getenv('MYSQL_PASSWORD')),
                'database_valid': bool(os.getenv('MYSQL_DATABASE'))
            }
        }
        
        return validation
    
    def update_service_credentials(self, service, credentials):
        """Update credentials for a specific service"""
        try:
            # This would typically update environment variables or a config file
            # For this implementation, we'll just validate the format
            if service == 'aws':
                required_fields = ['access_key_id', 'secret_access_key', 'region', 'bucket_name']
            elif service == 'openai':
                required_fields = ['api_key']
            elif service == 'crm':
                required_fields = ['auth_token', 'base_url']
            elif service == 'mysql':
                required_fields = ['host', 'user', 'password', 'database']
            else:
                return {
                    'success': False,
                    'message': f'Unknown service: {service}'
                }
            
            # Validate required fields
            missing_fields = [field for field in required_fields if field not in credentials]
            if missing_fields:
                return {
                    'success': False,
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }
            
            # In a real implementation, you would update the .env file or environment variables
            return {
                'success': True,
                'message': f'{service.upper()} credentials validated successfully',
                'data': {
                    'service': service,
                    'fields_updated': required_fields,
                    'note': 'Credentials validated but not persisted in this demo'
                }
            }
        
        except Exception as e:
            return {
                'success': False,
                'message': f'Error updating {service} credentials',
                'error': str(e)
            }
    
    def test_service_with_credentials(self, service, credentials):
        """Test service connection with new credentials"""
        try:
            # Temporarily use new credentials for testing
            if service == 'aws':
                s3_client = boto3.client(
                    's3',
                    aws_access_key_id=credentials.get('access_key_id'),
                    aws_secret_access_key=credentials.get('secret_access_key'),
                    region_name=credentials.get('region')
                )
                
                bucket_name = credentials.get('bucket_name')
                response = s3_client.head_bucket(Bucket=bucket_name)
                
                return {
                    'success': True,
                    'message': 'New AWS credentials work correctly',
                    'data': {'bucket': bucket_name, 'region': credentials.get('region')}
                }
            
            elif service == 'openai':
                # Test OpenAI with new API key
                import openai
                temp_client = openai.OpenAI(api_key=credentials.get('api_key'))
                response = temp_client.models.list()
                
                return {
                    'success': True,
                    'message': 'New OpenAI API key works correctly',
                    'data': {'models_count': len(response.data)}
                }
            
            elif service == 'crm':
                # Test CRM with new credentials
                headers = {
                    'Authorization': f'Bearer {credentials.get("auth_token")}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(
                    f'{credentials.get("base_url")}/employees',
                    headers=headers,
                    timeout=10
                )
                
                return {
                    'success': response.status_code == 200,
                    'message': f'New CRM credentials {"work correctly" if response.status_code == 200 else "failed"}',
                    'data': {'status_code': response.status_code}
                }
            
            elif service == 'mysql':
                # Test MySQL with new credentials
                connection = mysql.connector.connect(
                    host=credentials.get('host'),
                    user=credentials.get('user'),
                    password=credentials.get('password'),
                    database=credentials.get('database'),
                    connect_timeout=10
                )
                
                cursor = connection.cursor()
                cursor.execute("SELECT VERSION()")
                version = cursor.fetchone()[0]
                
                cursor.close()
                connection.close()
                
                return {
                    'success': True,
                    'message': 'New MySQL credentials work correctly',
                    'data': {'version': version, 'database': credentials.get('database')}
                }
            
            else:
                return {
                    'success': False,
                    'message': f'Unknown service: {service}'
                }
        
        except Exception as e:
            return {
                'success': False,
                'message': f'New {service} credentials failed to connect',
                'error': str(e)
            }
        except Exception as e:
            logger.error(f"Error retrieving credentials status: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to retrieve credentials status: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
