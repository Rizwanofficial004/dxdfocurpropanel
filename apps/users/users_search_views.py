import os
import re
from datetime import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import boto3
from botocore.exceptions import NoCredentialsError, ClientError


class EnhancedUsersSearchView(APIView):
    def __init__(self):
        super().__init__()
        # Initialize S3 client with credentials
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        self.bucket_name = 'ddsfocustime'
    
    def _extract_user_display_name(self, user_key):
        """Extract clean display name from user key"""
        if user_key.endswith('_at_dxdglobal.com'):
            return user_key.replace('_at_dxdglobal.com', '').replace('_', ' ').title()
        return user_key.replace('_', ' ').title()

    def _extract_email(self, user_key):
        """Extract email from user key"""
        if user_key.endswith('_at_dxdglobal.com'):
            base_name = user_key.replace('_at_dxdglobal.com', '')
            return f"{base_name}@dxdglobal.com"
        return f"{user_key}@dxdglobal.com"

    def _parse_screenshot_details(self, key, size):
        """Parse screenshot filename to extract details"""
        filename = key.split('/')[-1]
        
        # Enhanced time extraction for various formats
        time_patterns = [
            r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})',
            r'(\d{4}-\d{2}-\d{2})_(\d{2}:\d{2}:\d{2})',
            r'screenshot_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})',
            r'image_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})',
        ]
        
        parsed_time = None
        for pattern in time_patterns:
            match = re.search(pattern, filename)
            if match:
                date_part = match.group(1)
                time_part = match.group(2).replace('-', ':')
                datetime_str = f"{date_part} {time_part}"
                try:
                    parsed_time = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
                    break
                except ValueError:
                    continue
        
        return {
            'filename': filename,
            'full_key': key,
            'size_mb': round(size / (1024 * 1024), 3),
            'url': f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}",
            'timestamp': parsed_time.isoformat() if parsed_time else None,
            'date_taken': parsed_time.strftime('%Y-%m-%d') if parsed_time else None,
            'time_taken': parsed_time.strftime('%H:%M:%S') if parsed_time else None
        }

    def _search_screenshots_by_date_range(self, start_date, end_date):
        """Search for screenshots within date range"""
        all_users_data = {}
        
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            prefix = f"users_screenshots/{date_str}/"
            
            try:
                paginator = self.s3_client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=self.bucket_name, Prefix=prefix)
                
                for page in pages:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            key = obj['Key']
                            size = obj['Size']
                            
                            # Skip directories and non-image files
                            if key.endswith('/') or not any(key.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png']):
                                continue
                            
                            # Parse path: users_screenshots/date/user_folder/[subfolder]/filename
                            path_parts = key.split('/')
                            if len(path_parts) >= 4:  # date/user/filename or date/user/subfolder/filename
                                user_folder = path_parts[2]
                                
                                if user_folder not in all_users_data:
                                    all_users_data[user_folder] = {
                                        'email': self._extract_email(user_folder),
                                        'display_name': self._extract_user_display_name(user_folder),
                                        'original_name': user_folder,
                                        'screenshots': [],
                                        'total_size': 0
                                    }
                                
                                screenshot_details = self._parse_screenshot_details(key, size)
                                all_users_data[user_folder]['screenshots'].append(screenshot_details)
                                all_users_data[user_folder]['total_size'] += size
                            
            except ClientError as e:
                print(f"Error searching for date {date_str}: {e}")
            
            current_date = current_date.replace(day=current_date.day + 1)
        
        return all_users_data

    def get(self, request):
        """Handle GET request for enhanced user search"""
        try:
            # Get query parameters
            search_query = request.GET.get('q', '').lower().strip()
            start_date_str = request.GET.get('start_date', '')
            end_date_str = request.GET.get('end_date', '')
            
            # Validate date parameters
            if not start_date_str or not end_date_str:
                return Response({
                    'status': 'error',
                    'message': 'Both start_date and end_date are required (format: YYYY-MM-DD)'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
            except ValueError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Search for screenshots in the date range
            all_users_data = self._search_screenshots_by_date_range(start_date, end_date)
            
            # Filter users based on search query
            filtered_users = []
            for user_key, user_data in all_users_data.items():
                if not search_query or search_query in user_data['display_name'].lower() or search_query in user_data['email'].lower():
                    # Sort screenshots by timestamp
                    user_data['screenshots'].sort(
                        key=lambda x: x['timestamp'] if x['timestamp'] else '0000-00-00T00:00:00'
                    )
                    
                    user_summary = {
                        'email': user_data['email'],
                        'display_name': user_data['display_name'],
                        'original_name': user_data['original_name'],
                        'total_screenshots': len(user_data['screenshots']),
                        'total_size_mb': round(user_data['total_size'] / (1024 * 1024), 2),
                        'status': 'active' if user_data['screenshots'] else 'inactive',
                        'recent_screenshots': user_data['screenshots'][:10],  # First 10 screenshots
                        'all_screenshots': user_data['screenshots']  # All screenshots
                    }
                    filtered_users.append(user_summary)
            
            # Sort users by total screenshots (descending)
            filtered_users.sort(key=lambda x: x['total_screenshots'], reverse=True)
            
            return Response({
                'status': 'success',
                'message': f"Enhanced user search completed for '{search_query}'" if search_query else "All users fetched",
                'data': {
                    'users': filtered_users,
                    'total_users': len(filtered_users),
                    'search_query': search_query,
                    'date_range': f"{start_date_str} to {end_date_str}"
                }
            }, status=status.HTTP_200_OK)
            
        except NoCredentialsError:
            return Response({
                'status': 'error',
                'message': 'AWS credentials not configured'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Server error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)