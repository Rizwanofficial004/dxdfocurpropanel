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
import os
from django.conf import settings

logger = logging.getLogger(__name__)

# AWS S3 Configuration from environment variables
def get_aws_config():
    """Get AWS configuration from environment variables"""
    return {
        "access_key": os.getenv('AWS_ACCESS_KEY_ID'),
        "secret_key": os.getenv('AWS_SECRET_ACCESS_KEY'),
        "region": os.getenv('AWS_REGION', 'eu-north-1'),
        "bucket_name": os.getenv('AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
    }


class UserScreenshotsAPI(APIView):
    """
    User Screenshots API endpoint
    
    GET /api/users/screenshots/?q=user_email&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&page_size=50
    
    Returns screenshots for a specific user with pagination and date filtering
    Default page size: 50, Maximum: 1000
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.aws_config = get_aws_config()
        self.bucket_name = self.aws_config["bucket_name"]
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials from environment variables"""
        try:
            if not self.aws_config["access_key"] or not self.aws_config["secret_key"]:
                raise ValueError("AWS credentials not found in environment variables")
                
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.aws_config["access_key"],
                aws_secret_access_key=self.aws_config["secret_key"],
                region_name=self.aws_config["region"]
            )
            logger.info(f"S3 client initialized successfully for bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            raise
    
    def get(self, request):
        """
        GET /api/users/screenshots/?q=user_email&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=1&page_size=50
        
        Fetch screenshots for a specific user with pagination and date filtering
        Default page size: 50, Maximum: 1000
        Enhanced to handle .webp files and multiple date formats
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
                page_size = int(request.GET.get('page_size', 50))
                if page_size < 1:
                    page_size = 50
                elif page_size > 1000:  # Limit max page size
                    page_size = 1000
            except (ValueError, TypeError):
                page_size = 50
            
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
            
            logger.info(f"Searching screenshots for user: {normalized_user}")
            logger.info(f"Date filter: {date_filter['start_date']} to {date_filter['end_date']}")
            
            # Search in users_screenshots folder (newer structure)
            users_screenshots = self._search_users_screenshots_folder(normalized_user, date_filter)
            screenshots.extend(users_screenshots)
            logger.info(f"Found {len(users_screenshots)} screenshots in users_screenshots folder")
            
            # Search in screenshots folder (older structure)  
            legacy_screenshots = self._search_screenshots_folder(normalized_user, date_filter)
            screenshots.extend(legacy_screenshots)
            logger.info(f"Found {len(legacy_screenshots)} screenshots in screenshots folder")
            
            # Remove duplicates based on filename, date, and project folder
            unique_screenshots = []
            seen = set()
            for screenshot in screenshots:
                # Include project folder in deduplication key to avoid removing different files
                # from different projects that happen to have the same filename and date
                key = (
                    screenshot.get('filename'), 
                    screenshot.get('date'), 
                    screenshot.get('project_folder', 'unknown')
                )
                if key not in seen:
                    seen.add(key)
                    unique_screenshots.append(screenshot)
            
            screenshots = unique_screenshots
            logger.info(f"Total unique screenshots after deduplication: {len(screenshots)}")
            
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
            
            logger.info(f"Returning page {page}/{total_pages} with {len(paginated_screenshots)} screenshots")
            
            # Generate project folder statistics
            project_stats = self._generate_project_stats(screenshots)
            
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
                    "project_folders": project_stats,
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
                    "screenshots": paginated_screenshots,
                    "data_source": "S3 (users_screenshots + screenshots folders)"
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
            # If we have a date filter, search more efficiently by date
            if date_filter['start_date'] and date_filter['end_date']:
                # Generate date range to search
                start_date = date_filter['start_datetime']
                end_date = date_filter['end_datetime']
                
                # Search by specific date folders for better performance
                current_date = start_date
                search_prefixes = []
                
                while current_date <= end_date:
                    date_str = current_date.strftime('%Y-%m-%d')
                    search_prefixes.append(f'users_screenshots/{date_str}/')
                    current_date += timedelta(days=1)
                
                # Limit to avoid too many searches
                if len(search_prefixes) > 31:  # More than a month
                    search_prefixes = ['users_screenshots/']
            else:
                search_prefixes = ['users_screenshots/']
            
            for prefix in search_prefixes:
                logger.info(f"Searching in users_screenshots prefix: {prefix}")
                
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    PaginationConfig={
                        'PageSize': 1000,  # Process in smaller chunks
                        'MaxItems': None   # Remove item limit entirely
                    }
                )
                
                for page in page_iterator:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith('.webp'):
                                # Parse key: users_screenshots/2025-09-01/user_at_domain.com/project_folder/filename.webp
                                key_parts = obj['Key'].split('/')
                                
                                if len(key_parts) >= 4:
                                    folder = key_parts[0]  # users_screenshots
                                    date_part = key_parts[1]  # 2025-09-01
                                    user_email = key_parts[2]  # user_at_domain.com
                                    filename = key_parts[-1]  # filename.webp
                                    
                                    # Check if this matches our user (handle both @ and _at_ formats)
                                    user_matches = (
                                        normalized_user.lower() == user_email.lower() or
                                        normalized_user.lower() in user_email.lower() or
                                        user_email.lower() in normalized_user.lower()
                                    )
                                    
                                    if user_matches:
                                        # Check date filter
                                        if self._is_date_in_range(date_part, date_filter):
                                            # Extract project folder from path
                                            project_folder = self._extract_project_folder(obj['Key'])
                                            
                                            screenshot_info = {
                                                'filename': filename,
                                                'date': date_part,
                                                'user_email': user_email,
                                                'folder_structure': 'users_screenshots',
                                                'project_folder': project_folder,
                                                'file_key': obj['Key'],
                                                'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                                'last_modified': obj['LastModified'].isoformat(),
                                                'screenshot_url': self._generate_signed_url(obj['Key'])
                                            }
                                            screenshots.append(screenshot_info)
            
        except Exception as e:
            logger.error(f"Error searching users_screenshots folder: {str(e)}")
        
        return screenshots
    
    def _search_screenshots_folder(self, normalized_user, date_filter):
        """Search in legacy screenshots folder structure - Optimized for large datasets"""
        screenshots = []
        
        try:
            # Search for user folder in screenshots directory
            user_prefix = f'screenshots/{normalized_user}/'
            
            logger.info(f"Searching in screenshots folder with prefix: {user_prefix}")
            
            # Use streaming approach to handle large datasets
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                PaginationConfig={
                    'PageSize': 1000,  # Process in smaller chunks
                    'MaxItems': None   # Remove item limit entirely
                }
            )
            
            processed_count = 0
            for page in page_iterator:
                if 'Contents' in page:
                    batch_screenshots = []  # Process in batches to manage memory
                    
                    for obj in page['Contents']:
                        processed_count += 1
                        
                        if obj['Key'].endswith(('.webp', '.png', '.jpg', '.jpeg')):
                            # Parse key: screenshots/user_at_domain.com/project_folder/filename.webp
                            key_parts = obj['Key'].split('/')
                            
                            if len(key_parts) >= 3:
                                folder = key_parts[0]  # screenshots
                                user_email = key_parts[1]  # user_at_domain.com
                                filename = key_parts[-1]  # filename.webp
                                
                                # Extract date from filename (which contains the actual date)
                                screenshot_date = self._extract_date_from_path(key_parts)
                                
                                # Check if this matches our user (handle both @ and _at_ formats)
                                user_matches = (
                                    normalized_user.lower() == user_email.lower() or
                                    normalized_user.lower() in user_email.lower() or
                                    user_email.lower() in normalized_user.lower()
                                )
                                
                                if user_matches:
                                    # Check date filter
                                    if self._is_date_in_range(screenshot_date, date_filter):
                                        # Extract project folder from path
                                        project_folder = self._extract_project_folder(obj['Key'])
                                        
                                        screenshot_info = {
                                            'filename': filename,
                                            'date': screenshot_date,
                                            'user_email': user_email,
                                            'folder_structure': 'screenshots',
                                            'project_folder': project_folder,
                                            'file_key': obj['Key'],
                                            'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                            'last_modified': obj['LastModified'].isoformat(),
                                            'screenshot_url': self._generate_signed_url(obj['Key'])
                                        }
                                        batch_screenshots.append(screenshot_info)
                    
                    # Add batch to main list
                    screenshots.extend(batch_screenshots)
                    
                    # Log progress every 10k processed files
                    if processed_count % 10000 == 0:
                        logger.info(f"Processed {processed_count} files, found {len(screenshots)} matching screenshots")
                        
        except Exception as e:
            logger.error(f"Error searching screenshots folder: {str(e)}")
        
        logger.info(f"Final screenshots folder scan completed: {len(screenshots)} screenshots found")
        return screenshots
    
    def _extract_project_folder(self, key):
        """Extract project folder from S3 key path"""
        try:
            key_parts = key.split('/')
            # For screenshots structure: screenshots/user/project_folder/filename
            if len(key_parts) >= 4 and key_parts[0] == 'screenshots':
                return key_parts[2]  # project folder
            # For users_screenshots structure: users_screenshots/date/user/project_folder/filename
            elif len(key_parts) >= 5 and key_parts[0] == 'users_screenshots':
                return key_parts[3]  # project folder
            return 'unknown'
        except:
            return 'unknown'
    
    def _generate_project_stats(self, screenshots):
        """Generate statistics about project folders"""
        project_stats = {}
        total_by_folder = {}
        
        for screenshot in screenshots:
            project_folder = screenshot.get('project_folder', 'unknown')
            folder_structure = screenshot.get('folder_structure', 'unknown')
            
            if project_folder not in project_stats:
                project_stats[project_folder] = {
                    'name': project_folder,
                    'total_screenshots': 0,
                    'folder_structures': set(),
                    'date_range': {'earliest': None, 'latest': None}
                }
            
            project_stats[project_folder]['total_screenshots'] += 1
            project_stats[project_folder]['folder_structures'].add(folder_structure)
            
            # Track date range
            screenshot_date = screenshot.get('date')
            if screenshot_date:
                if not project_stats[project_folder]['date_range']['earliest']:
                    project_stats[project_folder]['date_range']['earliest'] = screenshot_date
                    project_stats[project_folder]['date_range']['latest'] = screenshot_date
                else:
                    if screenshot_date < project_stats[project_folder]['date_range']['earliest']:
                        project_stats[project_folder]['date_range']['earliest'] = screenshot_date
                    if screenshot_date > project_stats[project_folder]['date_range']['latest']:
                        project_stats[project_folder]['date_range']['latest'] = screenshot_date
        
        # Convert sets to lists for JSON serialization
        for folder in project_stats:
            project_stats[folder]['folder_structures'] = list(project_stats[folder]['folder_structures'])
        
        return {
            'total_projects': len(project_stats),
            'projects': list(project_stats.values())
        }
    
    def _extract_date_from_path(self, key_parts):
        """Extract date from S3 key path - Enhanced for multiple formats"""
        # First, try to find date in path components (for folder-based dates)
        for part in key_parts[:-1]:  # Exclude filename for now
            # Look for YYYY-MM-DD format
            if re.match(r'^\d{4}-\d{2}-\d{2}$', part):
                return part
            # Look for YYYY-MM format and convert to first day of month
            elif re.match(r'^\d{4}-\d{2}$', part):
                return f"{part}-01"
        
        # Try to extract date from filename
        filename = key_parts[-1] if key_parts else ""
        
        # Handle .webp files with format: 2025-08-30_12-06-12_2025-08-30_12-06-12.webp
        if filename.endswith('.webp'):
            # Extract the first date part before underscore
            webp_match = re.match(r'^(\d{4}-\d{2}-\d{2})_', filename)
            if webp_match:
                return webp_match.group(1)
        
        # Handle screenshot files with format: screenshot_2025-08-30_14-45-23.png
        if 'screenshot_' in filename:
            screenshot_match = re.search(r'screenshot_(\d{4}-\d{2}-\d{2})', filename)
            if screenshot_match:
                return screenshot_match.group(1)
        
        # Look for date patterns in filename: YYYY-MM-DD (first occurrence)
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
        if date_match:
            return date_match.group(1)
        
        # Look for date patterns in filename: YYYY_MM_DD
        date_match = re.search(r'(\d{4})_(\d{2})_(\d{2})', filename)
        if date_match:
            return f"{date_match.group(1)}-{date_match.group(2)}-{date_match.group(3)}"
        
        # Return None if no date found - this will help with filtering
        return None
    
    def _is_date_in_range(self, screenshot_date, date_filter):
        """Check if screenshot date is within the specified range"""
        if not date_filter['start_datetime'] and not date_filter['end_datetime']:
            return True
        
        # If no date could be extracted, skip this file
        if screenshot_date is None:
            return False
        
        try:
            # Parse screenshot date
            if len(screenshot_date) == 10:  # YYYY-MM-DD
                screenshot_dt = datetime.strptime(screenshot_date, '%Y-%m-%d')
            elif len(screenshot_date) == 7:  # YYYY-MM
                screenshot_dt = datetime.strptime(f"{screenshot_date}-01", '%Y-%m-%d')
            else:
                return False  # Can't parse, exclude it
            
            # Check range
            if date_filter['start_datetime'] and screenshot_dt < date_filter['start_datetime']:
                return False
            if date_filter['end_datetime'] and screenshot_dt > date_filter['end_datetime']:
                return False
            
            return True
            
        except ValueError:
            return False  # Can't parse, exclude it
    
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
