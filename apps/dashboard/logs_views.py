"""
Logs API Views for Activity Tracking and System Logs
Provides endpoints for searching and retrieving system activity logs.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.conf import settings
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from datetime import datetime, timedelta
import json
import logging
import os

logger = logging.getLogger(__name__)

class LogsSearchView(APIView):
    """
    API endpoint for searching system logs and activity data
    Provides filtering by date range, user, and activity type
    """
    permission_classes = [AllowAny]  # Allow unauthenticated access for testing
    
    def get(self, request):
        """
        Search logs based on query parameters
        
        Query Parameters:
        - q: Search query string
        - start_date: Start date filter (YYYY-MM-DD)
        - end_date: End date filter (YYYY-MM-DD)
        - user_email: Filter by specific user email
        - activity_type: Filter by activity type (login, screenshot, timer, etc.)
        - limit: Number of results to return (default: 100)
        """
        try:
            # Get query parameters
            query = request.GET.get('q', '')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            user_email = request.GET.get('user_email')
            activity_type = request.GET.get('activity_type')
            limit = int(request.GET.get('limit', 100))
            
            # Get logs from various sources
            logs = self._search_logs(
                query=query,
                start_date=start_date,
                end_date=end_date,
                user_email=user_email,
                activity_type=activity_type,
                limit=limit
            )
            
            return Response({
                'status': 'success',
                'count': len(logs),
                'logs': logs,
                'search_params': {
                    'query': query,
                    'start_date': start_date,
                    'end_date': end_date,
                    'user_email': user_email,
                    'activity_type': activity_type,
                    'limit': limit
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error searching logs: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to search logs: {str(e)}',
                'logs': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _search_logs(self, query='', start_date=None, end_date=None, user_email=None, activity_type=None, limit=100):
        """
        Search logs from multiple sources
        """
        logs = []
        
        # 1. Get S3 activity logs (screenshot timestamps)
        s3_logs = self._get_s3_activity_logs(start_date, end_date, user_email)
        logs.extend(s3_logs)
        
        # 2. Get Django application logs
        app_logs = self._get_application_logs(query, start_date, end_date, activity_type)
        logs.extend(app_logs)
        
        # 3. Filter by query if provided
        if query:
            logs = [log for log in logs if query.lower() in str(log).lower()]
        
        # 4. Sort by timestamp (most recent first)
        logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # 5. Apply limit
        return logs[:limit]
    
    def _get_s3_activity_logs(self, start_date=None, end_date=None, user_email=None):
        """
        Get activity logs from S3 screenshots
        """
        logs = []
        
        try:
            # Initialize S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
            )
            
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
            prefix = 'users_screenshots/2025-01-09/'  # Current date structure
            
            # List S3 objects
            response = s3_client.list_objects_v2(
                Bucket=bucket_name,
                Prefix=prefix,
                MaxKeys=1000
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    last_modified = obj['LastModified']
                    
                    # Extract user email from path
                    parts = key.split('/')
                    if len(parts) >= 3:
                        extracted_email = parts[2]
                        
                        # Filter by user email if specified
                        if user_email and extracted_email != user_email:
                            continue
                        
                        # Filter by date range if specified
                        if start_date or end_date:
                            log_date = last_modified.date()
                            if start_date and log_date < datetime.strptime(start_date, '%Y-%m-%d').date():
                                continue
                            if end_date and log_date > datetime.strptime(end_date, '%Y-%m-%d').date():
                                continue
                        
                        logs.append({
                            'timestamp': last_modified.isoformat(),
                            'activity_type': 'screenshot',
                            'user_email': extracted_email,
                            'source': 's3',
                            'details': {
                                'file_path': key,
                                'file_size': obj['Size'],
                                'bucket': bucket_name
                            },
                            'message': f'Screenshot captured for {extracted_email}'
                        })
        
        except Exception as e:
            logger.error(f"Error fetching S3 logs: {str(e)}")
            logs.append({
                'timestamp': datetime.now().isoformat(),
                'activity_type': 'error',
                'source': 's3',
                'message': f'Failed to fetch S3 logs: {str(e)}'
            })
        
        return logs
    
    def _get_application_logs(self, query='', start_date=None, end_date=None, activity_type=None):
        """
        Get application logs from Django logging
        """
        logs = []
        
        # Sample application logs (in a real system, these would come from log files or database)
        sample_logs = [
            {
                'timestamp': datetime.now().isoformat(),
                'activity_type': 'api_call',
                'source': 'django',
                'message': 'CRM Comprehensive API called',
                'details': {
                    'endpoint': '/api/dashboard/crm-comprehensive/',
                    'method': 'GET',
                    'status_code': 200
                }
            },
            {
                'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                'activity_type': 'authentication',
                'source': 'django',
                'message': 'User login attempt',
                'details': {
                    'endpoint': '/api/auth/login/',
                    'method': 'POST'
                }
            },
            {
                'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
                'activity_type': 'database',
                'source': 'django',
                'message': 'Database connection test',
                'details': {
                    'endpoint': '/api/dashboard/database-test/',
                    'method': 'GET',
                    'status_code': 200
                }
            }
        ]
        
        # Filter by activity type if specified
        if activity_type:
            sample_logs = [log for log in sample_logs if log.get('activity_type') == activity_type]
        
        # Filter by date range if specified
        if start_date or end_date:
            filtered_logs = []
            for log in sample_logs:
                log_date = datetime.fromisoformat(log['timestamp']).date()
                if start_date and log_date < datetime.strptime(start_date, '%Y-%m-%d').date():
                    continue
                if end_date and log_date > datetime.strptime(end_date, '%Y-%m-%d').date():
                    continue
                filtered_logs.append(log)
            sample_logs = filtered_logs
        
        logs.extend(sample_logs)
        
        return logs


class LogsSystemView(APIView):
    """
    API endpoint for system-level logging information
    """
    permission_classes = [AllowAny]  # Allow unauthenticated access for testing
    
    def get(self, request):
        """
        Get system logging status and configuration
        """
        try:
            return Response({
                'status': 'success',
                'logging_config': {
                    'level': 'INFO',
                    'handlers': ['console', 'file'],
                    'formatters': ['standard']
                },
                'system_status': {
                    'django_logging': True,
                    's3_access': self._test_s3_access(),
                    'database_logging': True
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Failed to get system logging info: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _test_s3_access(self):
        """
        Test S3 access for logging
        """
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                region_name=os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
            )
            
            bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
            s3_client.head_bucket(Bucket=bucket_name)
            return True
            
        except Exception:
            return False


class LogsStatsView(APIView):
    """
    API endpoint for logs statistics and analytics
    """
    permission_classes = [AllowAny]  # Allow unauthenticated access for testing
    
    def get(self, request):
        """
        Get logs statistics
        """
        try:
            # Get statistics for the last 24 hours
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=24)
            
            stats = {
                'last_24_hours': {
                    'total_logs': 150,  # Would be calculated from actual logs
                    'by_type': {
                        'screenshot': 85,
                        'api_call': 40,
                        'authentication': 15,
                        'error': 10
                    },
                    'by_user': {
                        'haseebcodejourney@gmail.com': 35,
                        'kiranaiza4@gmail.com': 30,
                        'nawaz@dxdglobal.com': 20
                    }
                },
                'system_health': {
                    'error_rate': 6.7,  # Percentage
                    'avg_response_time': 245,  # milliseconds
                    'active_users': 3
                }
            }
            
            return Response({
                'status': 'success',
                'stats': stats,
                'generated_at': datetime.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Failed to get logs statistics: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
