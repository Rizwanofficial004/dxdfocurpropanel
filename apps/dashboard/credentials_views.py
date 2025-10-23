from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import SystemCredentials
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def get_default_credential_data(credential_type, credential_name):
    """Get default data for creating credentials"""
    return {
        'credential_name': credential_name,
        'credential_type': credential_type,
        'description': f'{credential_name} configuration',
        'environment': 'production',
        'is_active': True,
        'is_default': False,
        'debug_mode': False,
        'api_timeout': 30,
        'api_base_url': 'https://api.example.com',
        'created_by': 'system',
        'auth_token': '',
        'auth_refresh_token': '',
        'openai_api_key': '',
        'openai_model': 'gpt-3.5-turbo',
        'openai_organization': '',
        'aws_access_key_id': '',
        'aws_secret_access_key': '',
        'aws_bucket_name': '',
        'aws_region': '',
        'db_host': '',
        'db_port': '5432',
        'db_name': '',
        'db_username': '',
        'db_password': '',
        'db_type': 'postgresql'
    }

@method_decorator(csrf_exempt, name='dispatch')
class CredentialsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            credentials = SystemCredentials.objects.all()
            data = []
            for cred in credentials:
                data.append({
                    'id': cred.id,
                    'credential_name': cred.credential_name,
                    'credential_type': cred.credential_type,
                    'openai_api_key': cred.openai_api_key,
                    'openai_organization': cred.openai_organization,
                    'aws_access_key_id': cred.aws_access_key_id,
                    'aws_secret_access_key': cred.aws_secret_access_key,
                    'aws_region': cred.aws_region,
                    'aws_bucket_name': cred.aws_bucket_name,
                    'db_host': cred.db_host,
                    'db_port': cred.db_port,
                    'db_name': cred.db_name,
                    'db_username': cred.db_username,
                    'db_password': cred.db_password,
                    'created_at': cred.created_at,
                    'updated_at': cred.updated_at
                })
            return Response({'success': True, 'data': data}, status=200)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)
    
    def post(self, request):
        try:
            data = request.data
            updated_services = []
            
            if data.get('openai_api_key') or data.get('openai_organization'):
                openai_cred = SystemCredentials.objects.filter(credential_type='openai').first()
                if not openai_cred:
                    defaults = get_default_credential_data('openai', 'OpenAI Configuration')
                    openai_cred = SystemCredentials.objects.create(**defaults)
                
                if data.get('openai_api_key'):
                    openai_cred.openai_api_key = data['openai_api_key']
                if data.get('openai_organization'):
                    openai_cred.openai_organization = data['openai_organization']
                openai_cred.save()
                updated_services.append('OpenAI')
            
            if any([data.get('aws_access_key_id'), data.get('aws_secret_access_key'), data.get('aws_region'), data.get('aws_bucket_name')]):
                aws_cred = SystemCredentials.objects.filter(credential_type='aws').first()
                if not aws_cred:
                    defaults = get_default_credential_data('aws', 'AWS Configuration')
                    aws_cred = SystemCredentials.objects.create(**defaults)
                
                if data.get('aws_access_key_id'):
                    aws_cred.aws_access_key_id = data['aws_access_key_id']
                if data.get('aws_secret_access_key'):
                    aws_cred.aws_secret_access_key = data['aws_secret_access_key']
                if data.get('aws_region'):
                    aws_cred.aws_region = data['aws_region']
                if data.get('aws_bucket_name'):
                    aws_cred.aws_bucket_name = data['aws_bucket_name']
                aws_cred.save()
                updated_services.append('AWS')
            
            if any([data.get('db_host'), data.get('db_port'), data.get('db_name'), data.get('db_username'), data.get('db_password')]):
                db_cred = SystemCredentials.objects.filter(credential_type='database').first()
                if not db_cred:
                    defaults = get_default_credential_data('database', 'Database Configuration')
                    db_cred = SystemCredentials.objects.create(**defaults)
                
                if data.get('db_host'):
                    db_cred.db_host = data['db_host']
                if data.get('db_port'):
                    db_cred.db_port = str(data['db_port'])
                if data.get('db_name'):
                    db_cred.db_name = data['db_name']
                if data.get('db_username'):
                    db_cred.db_username = data['db_username']
                if data.get('db_password'):
                    db_cred.db_password = data['db_password']
                db_cred.save()
                updated_services.append('Database')
            
            return Response({
                'success': True,
                'message': 'Credentials saved successfully to SQL database',
                'data': {'updated_services': updated_services, 'total_updated': len(updated_services)}
            }, status=200)
            
        except Exception as e:
            logger.error(f"Error in post: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class CredentialsStatusView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            status_data = {'openai': {'configured': False}, 'aws': {'configured': False}, 'database': {'configured': False}}
            
            try:
                openai_cred = SystemCredentials.objects.filter(credential_type='openai').first()
                if openai_cred and openai_cred.openai_api_key:
                    status_data['openai']['configured'] = True
            except:
                pass
                
            try:
                aws_cred = SystemCredentials.objects.filter(credential_type='aws').first()
                if aws_cred and aws_cred.aws_access_key_id:
                    status_data['aws']['configured'] = True
            except:
                pass
                
            try:
                db_cred = SystemCredentials.objects.filter(credential_type='database').first()
                if db_cred and db_cred.db_host:
                    status_data['database']['configured'] = True
            except:
                pass
            
            return Response({'success': True, 'data': status_data}, status=200)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class SetAllCredentialsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            
            # Extract common fields
            configuration_name = data.get('configuration_name', 'Default Configuration')
            environment = data.get('environment', 'development')
            description = data.get('description', 'API credentials configuration')
            
            # OpenAI - Use first existing or create new
            openai_cred = SystemCredentials.objects.filter(credential_type='openai').first()
            if not openai_cred:
                defaults = get_default_credential_data('openai', f'OpenAI-{configuration_name}')
                openai_cred = SystemCredentials.objects.create(**defaults)
            
            # Update OpenAI fields
            if 'openai_api_key' in data:
                openai_cred.openai_api_key = data['openai_api_key']
            if 'openai_organization' in data:
                openai_cred.openai_organization = data['openai_organization']
            
            # Update common fields for OpenAI
            openai_cred.credential_name = f'OpenAI-{configuration_name}'
            openai_cred.environment = environment
            openai_cred.description = description
            openai_cred.save()
            
            # AWS - Use first existing or create new
            aws_cred = SystemCredentials.objects.filter(credential_type='aws').first()
            if not aws_cred:
                defaults = get_default_credential_data('aws', f'AWS-{configuration_name}')
                aws_cred = SystemCredentials.objects.create(**defaults)
            
            # Update AWS fields
            if 'aws_access_key_id' in data:
                aws_cred.aws_access_key_id = data['aws_access_key_id']
            if 'aws_secret_access_key' in data:
                aws_cred.aws_secret_access_key = data['aws_secret_access_key']
            if 'aws_region' in data:
                aws_cred.aws_region = data['aws_region']
            if 'aws_bucket_name' in data:
                aws_cred.aws_bucket_name = data['aws_bucket_name']
            
            # Update common fields for AWS
            aws_cred.credential_name = f'AWS-{configuration_name}'
            aws_cred.environment = environment
            aws_cred.description = description
            aws_cred.save()
            
            # Database - Use first existing or create new
            db_cred = SystemCredentials.objects.filter(credential_type='database').first()
            if not db_cred:
                defaults = get_default_credential_data('database', f'Database-{configuration_name}')
                db_cred = SystemCredentials.objects.create(**defaults)
            
            # Update Database fields
            if 'db_host' in data:
                db_cred.db_host = data['db_host']
            if 'db_port' in data:
                db_cred.db_port = str(data['db_port'])
            if 'db_name' in data:
                db_cred.db_name = data['db_name']
            if 'db_username' in data:
                db_cred.db_username = data['db_username']
            if 'db_password' in data:
                db_cred.db_password = data['db_password']
            
            # Update common fields for Database
            db_cred.credential_name = f'Database-{configuration_name}'
            db_cred.environment = environment
            db_cred.description = description
            db_cred.save()
            
            return Response({
                'success': True, 
                'message': 'All credentials updated successfully',
                'data': {
                    'configuration_name': configuration_name,
                    'environment': environment,
                    'description': description
                }
            }, status=200)
        except Exception as e:
            logger.error(f"Error setting credentials: {str(e)}")
            return Response({'success': False, 'message': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GetAllCredentialsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            result = {'openai': {}, 'aws': {}, 'database': {}}
            
            try:
                openai_cred = SystemCredentials.objects.filter(credential_type='openai').first()
                if openai_cred:
                    result['openai'] = {
                        'api_key': openai_cred.openai_api_key,
                        'organization': openai_cred.openai_organization,
                        'configuration_name': openai_cred.credential_name,
                        'environment': openai_cred.environment,
                        'description': openai_cred.description,
                        'created_at': str(openai_cred.created_at),
                        'updated_at': str(openai_cred.updated_at)
                    }
            except:
                pass
            
            try:
                aws_cred = SystemCredentials.objects.filter(credential_type='aws').first()
                if aws_cred:
                    result['aws'] = {
                        'access_key_id': aws_cred.aws_access_key_id,
                        'secret_access_key': aws_cred.aws_secret_access_key,
                        'region': aws_cred.aws_region,
                        'bucket_name': aws_cred.aws_bucket_name,
                        'configuration_name': aws_cred.credential_name,
                        'environment': aws_cred.environment,
                        'description': aws_cred.description,
                        'created_at': str(aws_cred.created_at),
                        'updated_at': str(aws_cred.updated_at)
                    }
            except:
                pass
            
            try:
                db_cred = SystemCredentials.objects.filter(credential_type='database').first()
                if db_cred:
                    result['database'] = {
                        'host': db_cred.db_host,
                        'port': db_cred.db_port,
                        'name': db_cred.db_name,
                        'username': db_cred.db_username,
                        'password': db_cred.db_password,
                        'configuration_name': db_cred.credential_name,
                        'environment': db_cred.environment,
                        'description': db_cred.description,
                        'created_at': str(db_cred.created_at),
                        'updated_at': str(db_cred.updated_at)
                    }
            except:
                pass
            
            return Response({'success': True, 'data': result}, status=200)
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=500)