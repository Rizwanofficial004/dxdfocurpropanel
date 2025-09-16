"""
User Screenshots API - Dedicated endpoint for /api/users/screenshots/

This module provides a dedicated API endpoint that matches the functionality
of the live server for fetching user screenshots with pagination and filtering.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime, timedelta
import logging
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import re
from urllib.parse import unquote
from collections import defaultdict
import math

logger = logging.getLogger(__name__)

# AWS S3 Credentials
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


class UserScreenshotsAPI(APIView):
    """
    User Screenshots API endpoint
    
    GET /api/users/screenshots/?q=user_email&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&page_size=250
    
    Returns screenshots for a specific user with pagination and date filtering
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = AWS_CREDENTIALS["additional_config"]["bucket_name"]
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_CREDENTIALS["access_key"],
                aws_secret_access_key=AWS_CREDENTIALS["secret_key"],
                region_name=AWS_CREDENTIALS["additional_config"]["region"]
            )
            logger.info("S3 client initialized successfully for user screenshots API")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
    
    def get(self, request):
        """
        GET /api/users/screenshots/?q=user_email&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&page_size=250
        
        Fetch screenshots for a specific user with pagination and date filtering
        """
        try:
            # Parse parameters
            user_query = request.GET.get('q', '').strip()
            start_date = request.GET.get('start_date', '').strip()
            end_date = request.GET.get('end_date', '').strip()
            
            try:
                page = int(request.GET.get('page', 1))
                if page < 1:
                    page = 1
            except (ValueError, TypeError):
                page = 1
                
            try:
                page_size = int(request.GET.get('page_size', 250))
                if page_size < 1:
                    page_size = 250
                elif page_size > 1000:  # Limit max page size
                    page_size = 1000
            except (ValueError, TypeError):
                page_size = 250
            
            logger.info(f"UserScreenshots API - Query: {user_query}, Date range: {start_date} to {end_date}, Page: {page}, Page size: {page_size}")
            
            if not user_query:
                return Response({
                    "status": "error",
                    "message": "User email parameter 'q' is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Normalize user email format (handle @ vs _at_ conversion)
            normalized_user = user_query.replace('@', '_at_').lower()
            
            # Validate and parse date range
            date_filter = self._parse_date_range(start_date, end_date)
            
            # Search for user screenshots
            screenshots_data = self._search_user_screenshots(normalized_user, date_filter, page, page_size)
            
            return Response(screenshots_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in UserScreenshots API: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to retrieve screenshots: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _parse_date_range(self, start_date, end_date):
        """Parse and validate date range parameters"""
        date_filter = {
            'start_date': None,
            'end_date': None,
            'start_datetime': None,
            'end_datetime': None
        }
        
        # Parse start date
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                date_filter['start_date'] = start_date
                date_filter['start_datetime'] = start_dt
            except ValueError:
                logger.warning(f"Invalid start_date format: {start_date}")
        
        # Parse end date
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                # Add 23:59:59 to include the entire end date
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                date_filter['end_date'] = end_date
                date_filter['end_datetime'] = end_dt
            except ValueError:
                logger.warning(f"Invalid end_date format: {end_date}")
        
        return date_filter
    
    def _search_user_screenshots(self, normalized_user, date_filter, page, page_size):
        """Search for screenshots for a specific user"""
        try:
            screenshots = []
            total_screenshots = 0
            
            # Search in users_screenshots folder (newer structure)
            users_screenshots = self._search_users_screenshots_folder(normalized_user, date_filter)
            screenshots.extend(users_screenshots)
            
            # Search in screenshots folder (older structure)  
            legacy_screenshots = self._search_screenshots_folder(normalized_user, date_filter)
            screenshots.extend(legacy_screenshots)
            
            # Sort by date (newest first)
            screenshots.sort(key=lambda x: x.get('last_modified', ''), reverse=True)
            
            total_screenshots = len(screenshots)
            
            # Apply pagination
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_screenshots = screenshots[start_index:end_index]
            
            # Calculate pagination info
            total_pages = math.ceil(total_screenshots / page_size)
            has_next = page < total_pages
            has_previous = page > 1
            
            return {
                "status": "success",
                "message": f"Found {total_screenshots} screenshots for user {normalized_user}",
                "data": {
                    "user": {
                        "email": normalized_user.replace('_at_', '@'),
                        "normalized_email": normalized_user
                    },
                    "date_range": {
                        "start_date": date_filter['start_date'],
                        "end_date": date_filter['end_date']
                    },
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_screenshots": total_screenshots,
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None,
                        "showing": f"{start_index + 1}-{min(end_index, total_screenshots)} of {total_screenshots}"
                    },
                    "screenshots": paginated_screenshots
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching user screenshots: {str(e)}")
            return {
                "status": "error",
                "message": f"Error searching screenshots: {str(e)}",
                "data": {
                    "screenshots": [],
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": 0,
                        "total_screenshots": 0,
                        "has_next": False,
                        "has_previous": False
                    }
                }
            }
    
    def _search_users_screenshots_folder(self, normalized_user, date_filter):
        """Search in users_screenshots folder structure"""
        screenshots = []
        
        try:
            # List objects in users_screenshots folder with user filter
            paginator = self.s3_client.get_paginator('list_objects_v2')
            
            # Search for the user in users_screenshots folder
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=f'users_screenshots/',
                PaginationConfig={'MaxItems': 10000}
            )
            
            for page in pages:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith('.webp'):
                            # Parse key: users_screenshots/2025-09-01/user_at_domain.com/filename.webp
                            key_parts = obj['Key'].split('/')
                            
                            if len(key_parts) >= 4:
                                folder = key_parts[0]  # users_screenshots
                                date_part = key_parts[1]  # 2025-09-01
                                user_email = key_parts[2]  # user_at_domain.com
                                filename = key_parts[-1]  # filename.webp
                                
                                # Check if this matches our user
                                if normalized_user.lower() in user_email.lower():
                                    # Check date filter
                                    if self._is_date_in_range(date_part, date_filter):
                                        screenshot_info = {
                                            'filename': filename,
                                            'date': date_part,
                                            'user_email': user_email,
                                            'folder_structure': 'users_screenshots',
                                            'file_key': obj['Key'],
                                            'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                            'last_modified': obj['LastModified'].isoformat(),
                                            'file_url': self._generate_signed_url(obj['Key'])
                                        }
                                        screenshots.append(screenshot_info)
            
        except Exception as e:
            logger.error(f"Error searching users_screenshots folder: {str(e)}")
        
        return screenshots
    
    def _search_screenshots_folder(self, normalized_user, date_filter):
        """Search in legacy screenshots folder structure"""
        screenshots = []
        
        try:
            # Search for user folder in screenshots directory
            user_prefix = f'screenshots/{normalized_user}/'
            
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                PaginationConfig={'MaxItems': 10000}
            )
            
            for page in pages:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith('.webp'):
                            # Parse key: screenshots/user_at_domain.com/2025-08/2025-08-15/filename.webp
                            key_parts = obj['Key'].split('/')
                            
                            if len(key_parts) >= 4:
                                folder = key_parts[0]  # screenshots
                                user_email = key_parts[1]  # user_at_domain.com
                                month_folder = key_parts[2]  # 2025-08
                                date_folder = key_parts[3] if len(key_parts) > 4 else month_folder  # 2025-08-15
                                filename = key_parts[-1]  # filename.webp
                                
                                # Extract date for filtering
                                screenshot_date = self._extract_date_from_path(key_parts)
                                
                                # Check date filter
                                if self._is_date_in_range(screenshot_date, date_filter):
                                    screenshot_info = {
                                        'filename': filename,
                                        'date': screenshot_date,
                                        'user_email': user_email,
                                        'folder_structure': 'screenshots',
                                        'file_key': obj['Key'],
                                        'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                        'last_modified': obj['LastModified'].isoformat(),
                                        'file_url': self._generate_signed_url(obj['Key'])
                                    }
                                    screenshots.append(screenshot_info)
            
        except Exception as e:
            logger.error(f"Error searching screenshots folder: {str(e)}")
        
        return screenshots
    
    def _extract_date_from_path(self, key_parts):
        """Extract date from S3 key path"""
        # Try to find date in various formats
        for part in key_parts:
            # Look for YYYY-MM-DD format
            if re.match(r'\d{4}-\d{2}-\d{2}', part):
                return part
            # Look for YYYY-MM format and convert to first day of month
            elif re.match(r'\d{4}-\d{2}$', part):
                return f"{part}-01"
        
        # Fallback to current date
        return datetime.now().strftime('%Y-%m-%d')
    
    def _is_date_in_range(self, screenshot_date, date_filter):
        """Check if screenshot date is within the specified range"""
        if not date_filter['start_datetime'] and not date_filter['end_datetime']:
            return True
        
        try:
            # Parse screenshot date
            if len(screenshot_date) == 10:  # YYYY-MM-DD
                screenshot_dt = datetime.strptime(screenshot_date, '%Y-%m-%d')
            elif len(screenshot_date) == 7:  # YYYY-MM
                screenshot_dt = datetime.strptime(f"{screenshot_date}-01", '%Y-%m-%d')
            else:
                return True  # Can't parse, include it
            
            # Check range
            if date_filter['start_datetime'] and screenshot_dt < date_filter['start_datetime']:
                return False
            if date_filter['end_datetime'] and screenshot_dt > date_filter['end_datetime']:
                return False
            
            return True
            
        except ValueError:
            return True  # Can't parse, include it
    
    def _generate_signed_url(self, key, expires_in=3600):
        """Generate a signed URL for accessing the S3 object"""
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Error generating signed URL for {key}: {str(e)}")
            return None
