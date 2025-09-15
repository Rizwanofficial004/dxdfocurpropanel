"""
User Screenshots API - Individual Screenshots with Pagination

This API provides functionality to search for individual user screenshots
with pagination (50 per page by default) similar to the search_s3 API
but focused on individual screenshots rather than grouped data.

URL Format: /api/users/screenshots/?q=search_term&start_date=2025-09-01&end_date=2025-09-02&page=1
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
import math
import os
from django.conf import settings

logger = logging.getLogger(__name__)

# Get AWS credentials from environment variables
def get_aws_credentials():
    """Get AWS credentials from environment variables"""
    return {
        "access_key": os.getenv('AWS_ACCESS_KEY_ID', 'AKIARSU6EUUWMQ5I2JWC'),
        "secret_key": os.getenv('AWS_SECRET_ACCESS_KEY', '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'),
        "region": os.getenv('AWS_REGION', 'eu-north-1'),
        "bucket_name": os.getenv('AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
    }


class UserScreenshotsAPI(APIView):
    """
    User Screenshots API - Returns individual screenshots from ALL users with pagination
    
    GET /api/users/screenshots/?q=search_term&start_date=2025-09-01&end_date=2025-09-02&page=1
    
    Fetches screenshots from all users in the S3 screenshots folder with pagination (50 per page)
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials from environment variables"""
        try:
            aws_creds = get_aws_credentials()
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_creds['access_key'],
                aws_secret_access_key=aws_creds['secret_key'],
                region_name=aws_creds['region']
            )
            # Test connection
            self.s3_client.head_bucket(Bucket=aws_creds['bucket_name'])
            logger.info("S3 client initialized successfully with environment credentials")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            self.s3_client = None
    
    def _parse_screenshot_details(self, key, obj):
        """
        Parse detailed screenshot information from S3 key and object (for users_screenshots folder)
        """
        try:
            # Extract filename from key
            filename = key.split('/')[-1]
            
            # Parse date from filename (format: YYYY-MM-DD_HH-MM-SS.ext)
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
            if not date_match:
                return None
            
            date_str = date_match.group(1)
            time_str = date_match.group(2).replace('-', ':')
            
            # Parse date components
            year, month, day = date_str.split('-')
            
            # Extract user folder from key
            key_parts = key.split('/')
            user_folder = None
            folder = None
            
            if len(key_parts) >= 3:
                folder = key_parts[0]  # users_screenshots
                if len(key_parts) >= 4:
                    user_folder = key_parts[2]  # user folder name
            
            # Create screenshot URL
            screenshot_url = f"https://ddsfocustime.s3.eu-north-1.amazonaws.com/{key}"
            
            # Get file size
            size_bytes = obj.get('Size', 0)
            size_mb = round(size_bytes / (1024 * 1024), 3)
            
            # Get file extension
            file_extension = filename.split('.')[-1] if '.' in filename else 'unknown'
            
            screenshot_info = {
                "filename": filename,
                "full_key": key,
                "date": date_str,
                "year": year,
                "month": f"{year}-{month}",
                "day": day,
                "time": time_str,
                "datetime": f"{date_str} {time_str}",
                "size_bytes": size_bytes,
                "size_mb": size_mb,
                "last_modified": obj['LastModified'].isoformat(),
                "folder": folder,
                "user_folder": user_folder,
                "file_extension": file_extension,
                "screenshot_url": screenshot_url
            }
            
            return screenshot_info
            
        except Exception as e:
            logger.error(f"Error parsing screenshot details for key {key}: {str(e)}")
            return None

    def _parse_screenshot_details_for_screenshots_folder(self, key, obj, user_folder):
        """
        Parse detailed screenshot information from S3 key and object (for screenshots folder structure)
        """
        try:
            # Extract filename from key
            filename = key.split('/')[-1]
            
            # For screenshots folder, try to extract date from filename
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
            if date_match:
                date_str = date_match.group(1)
                time_str = date_match.group(2).replace('-', ':')
            else:
                # If no date in filename, try to extract from path or use last modified
                date_str = obj['LastModified'].strftime('%Y-%m-%d')
                time_str = obj['LastModified'].strftime('%H:%M:%S')
            
            # Parse date components
            year, month, day = date_str.split('-')
            
            # Create screenshot URL
            screenshot_url = f"https://ddsfocustime.s3.eu-north-1.amazonaws.com/{key}"
            
            # Get file size
            size_bytes = obj.get('Size', 0)
            size_mb = round(size_bytes / (1024 * 1024), 3)
            
            # Get file extension
            file_extension = filename.split('.')[-1] if '.' in filename else 'unknown'
            
            screenshot_info = {
                "filename": filename,
                "full_key": key,
                "date": date_str,
                "year": year,
                "month": f"{year}-{month}",
                "day": day,
                "time": time_str,
                "datetime": f"{date_str} {time_str}",
                "size_bytes": size_bytes,
                "size_mb": size_mb,
                "last_modified": obj['LastModified'].isoformat(),
                "folder": "screenshots",
                "user_folder": user_folder,
                "file_extension": file_extension,
                "screenshot_url": screenshot_url
            }
            
            return screenshot_info
            
        except Exception as e:
            logger.error(f"Error parsing screenshot details for key {key}: {str(e)}")
            return None
    
    def _extract_user_email_from_folder(self, user_folder):
        """Convert user folder name to email format"""
        if not user_folder:
            return None
        
        # Convert from "user_at_domain.com" to "user@domain.com"
        if '_at_' in user_folder:
            return user_folder.replace('_at_', '@')
        return user_folder
    
    def _should_include_screenshot(self, screenshot_info, search_query, start_date_obj, end_date_obj):
        """Check if screenshot should be included based on search criteria"""
        if not screenshot_info:
            return False
        
        # Date filtering
        if start_date_obj or end_date_obj:
            try:
                screenshot_date_obj = datetime.strptime(screenshot_info['date'], '%Y-%m-%d').date()
                
                if start_date_obj and screenshot_date_obj < start_date_obj:
                    return False
                
                if end_date_obj and screenshot_date_obj > end_date_obj:
                    return False
            except ValueError:
                return False
        
        # Search query filtering
        if search_query:
            search_lower = search_query.lower()
            user_email = self._extract_user_email_from_folder(screenshot_info.get('user_folder', ''))
            
            # Search in user email/folder and filename
            searchable_text = ' '.join([
                user_email or '',
                screenshot_info.get('user_folder', ''),
                screenshot_info.get('filename', ''),
                screenshot_info.get('date', '')
            ]).lower()
            
            if search_lower not in searchable_text:
                return False
        
        return True
    
    def _get_all_user_folders(self):
        """
        Get all user folders from the screenshots/ directory
        """
        user_folders = []
        
        try:
            aws_creds = get_aws_credentials()
            paginator = self.s3_client.get_paginator('list_objects_v2')
            bucket_name = aws_creds['bucket_name']
            
            # Get all folders in screenshots/ directory (similar to the S3 console view)
            for page_iterator in paginator.paginate(
                Bucket=bucket_name,
                Prefix='screenshots/',
                Delimiter='/',
                PaginationConfig={'PageSize': 1000}
            ):
                # Get common prefixes (folders)
                if 'CommonPrefixes' in page_iterator:
                    for prefix in page_iterator['CommonPrefixes']:
                        folder_name = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                        if folder_name:  # Skip empty folder names
                            user_folders.append(folder_name)
                            
            logger.info(f"Found {len(user_folders)} user folders in screenshots/")
            return user_folders
            
        except Exception as e:
            logger.error(f"Error getting user folders: {str(e)}")
            return []

    def _search_user_folder_optimized(self, bucket_name, user_folder, search_query, start_date_obj, end_date_obj):
        """
        OPTIMIZED: Search a specific user folder with optional date range prefix filtering
        FIXED: Handle subdirectory structures (e.g., screenshots/user/project_folder/files)
        """
        screenshots = []
        objects_scanned = 0
        
        try:
            prefix = f'screenshots/{user_folder}/'
            
            # Since we found that files can be in subdirectories, we need to scan the entire user folder
            # but still apply date filtering during processing (not as S3 prefix filter)
            logger.info(f"Scanning user folder: {prefix}")
            
            folder_screenshots = self._scan_s3_prefix(bucket_name, prefix, search_query, start_date_obj, end_date_obj, user_folder)
            screenshots.extend(folder_screenshots['screenshots'])
            objects_scanned += folder_screenshots['objects_scanned']
                
        except Exception as e:
            logger.error(f"Error searching user folder {user_folder}: {str(e)}")
        
        return {
            'screenshots': screenshots,
            'objects_scanned': objects_scanned
        }
    
    def _generate_date_prefixes_for_range(self, start_date, end_date):
        """
        Generate S3 prefixes for date range to optimize scanning
        For example: 2025-08-01 to 2025-08-31 -> ['2025-08']
        """
        prefixes = []
        current_date = start_date.replace(day=1)  # Start from first day of month
        
        while current_date <= end_date:
            # Add year-month prefix
            month_prefix = current_date.strftime('%Y-%m')
            if month_prefix not in prefixes:
                prefixes.append(month_prefix)
            
            # Move to next month
            if current_date.month == 12:
                current_date = current_date.replace(year=current_date.year + 1, month=1)
            else:
                current_date = current_date.replace(month=current_date.month + 1)
        
        return prefixes
    
    def _scan_s3_prefix(self, bucket_name, prefix, search_query, start_date_obj, end_date_obj, user_folder):
        """
        Scan a specific S3 prefix and return matching screenshots
        """
        screenshots = []
        objects_scanned = 0
        
        try:
            paginator = self.s3_client.get_paginator('list_objects_v2')
            
            for page_iterator in paginator.paginate(
                Bucket=bucket_name,
                Prefix=prefix,
                PaginationConfig={'PageSize': 1000}
            ):
                if 'Contents' not in page_iterator:
                    continue
                
                for obj in page_iterator['Contents']:
                    objects_scanned += 1
                    key = obj['Key']
                    
                    # Skip folders (keys ending with /)
                    if key.endswith('/'):
                        continue
                    
                    # Skip non-image files
                    if not any(key.lower().endswith(ext) for ext in ['.webp', '.jpg', '.jpeg', '.png']):
                        continue
                    
                    # Parse screenshot details
                    screenshot_info = self._parse_screenshot_details_for_screenshots_folder(key, obj, user_folder)
                    
                    # Check if screenshot should be included
                    if self._should_include_screenshot(screenshot_info, search_query, start_date_obj, end_date_obj):
                        # Add user email to screenshot info
                        screenshot_info['user_email'] = self._extract_user_email_from_folder(user_folder)
                        screenshots.append(screenshot_info)
                        
        except Exception as e:
            logger.error(f"Error scanning S3 prefix {prefix}: {str(e)}")
        
        return {
            'screenshots': screenshots,
            'objects_scanned': objects_scanned
        }

    def _search_screenshots(self, search_query, page, page_size, start_date='', end_date=''):
        """
        Search for individual screenshots from ALL users with pagination
        OPTIMIZED: Direct folder targeting for specific users and date-based prefix filtering
        """
        if not self.s3_client:
            return {
                'screenshots': [],
                'total_count': 0,
                'error': 'S3 connection not available'
            }

        aws_creds = get_aws_credentials()
        bucket_name = aws_creds['bucket_name']
        
        # Parse date filters
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        
        screenshots = []
        objects_scanned = 0
        
        # For specific user search with date range, search more efficiently  
        is_specific_user_search = search_query and search_query.strip()
        is_date_filtered = start_date_obj or end_date_obj
        
        try:
            # OPTIMIZATION 1: If specific user search, target that user directly
            if is_specific_user_search:
                search_lower = search_query.lower().strip()
                
                # Handle both email formats: user@domain.com and user_at_domain.com
                search_normalized = search_lower.replace('@', '_at_')
                search_email = search_lower.replace('_at_', '@')
                
                # Try direct folder access first (much faster)
                target_user_folders = [search_normalized]
                if search_normalized != search_email.replace('@', '_at_'):
                    target_user_folders.append(search_email.replace('@', '_at_'))
                
                logger.info(f"OPTIMIZED: Direct search for user folders: {target_user_folders}")
                
                # Search directly in target user folders
                for target_folder in target_user_folders:
                    folder_screenshots = self._search_user_folder_optimized(
                        bucket_name, target_folder, search_query, start_date_obj, end_date_obj
                    )
                    screenshots.extend(folder_screenshots['screenshots'])
                    objects_scanned += folder_screenshots['objects_scanned']
                    
                    # If we found screenshots, we found the right user
                    if folder_screenshots['screenshots']:
                        logger.info(f"Found {len(folder_screenshots['screenshots'])} screenshots for user {target_folder}")
                        break
                
                # If no direct match found, fallback to searching all folders (but limit scope)
                if not screenshots:
                    logger.info(f"No direct match found, searching in all user folders for '{search_query}'")
                    user_folders = self._get_all_user_folders()
                    
                    matching_folders = []
                    for folder in user_folders[:50]:  # Limit to first 50 folders for performance
                        folder_lower = folder.lower()
                        folder_email = folder.replace('_at_', '@').lower()
                        
                        if (search_normalized in folder_lower or 
                            search_email in folder_email or
                            search_lower == folder_lower or
                            search_lower == folder_email):
                            matching_folders.append(folder)
                    
                    # Search in matching folders
                    for folder in matching_folders[:5]:  # Limit to 5 best matches
                        folder_screenshots = self._search_user_folder_optimized(
                            bucket_name, folder, search_query, start_date_obj, end_date_obj
                        )
                        screenshots.extend(folder_screenshots['screenshots'])
                        objects_scanned += folder_screenshots['objects_scanned']
            else:
                # OPTIMIZATION 2: For general search, use pagination-aware approach
                logger.info("General search across all users with pagination optimization")
                user_folders = self._get_all_user_folders()
                
                # Calculate how many users to search based on pagination needs
                estimated_screenshots_per_user = 10  # Conservative estimate
                users_needed_for_page = max(10, (page * page_size) // estimated_screenshots_per_user)
                max_users_to_search = min(len(user_folders), users_needed_for_page + 20)
                
                logger.info(f"Searching first {max_users_to_search} users for page {page}")
                
                # Search in user folders with limit
                for i, user_folder in enumerate(user_folders[:max_users_to_search]):
                    if i % 10 == 0:
                        logger.info(f"Processing user {i+1}/{max_users_to_search}: {user_folder}")
                    
                    folder_screenshots = self._search_user_folder_optimized(
                        bucket_name, user_folder, search_query, start_date_obj, end_date_obj
                    )
                    screenshots.extend(folder_screenshots['screenshots'])
                    objects_scanned += folder_screenshots['objects_scanned']
                    
                    # Stop if we have enough screenshots for current page + next page
                    if len(screenshots) >= (page + 1) * page_size:
                        logger.info(f"Collected enough screenshots ({len(screenshots)}), stopping search")
                        break
            
        except Exception as e:
            logger.error(f"Error searching screenshots: {str(e)}")
            return {
                'screenshots': [],
                'total_count': 0,
                'error': f'Search error: {str(e)}'
            }
        
        logger.info(f"Search completed. Found {len(screenshots)} screenshots after scanning {objects_scanned} objects")
        
        # If this was a specific user search and we have date filters, provide more details
        if is_specific_user_search and is_date_filtered:
            logger.info(f"Specific user search for '{search_query}' from {start_date} to {end_date}: {len(screenshots)} screenshots found")
        
        # Sort screenshots by datetime (newest first)
        screenshots.sort(key=lambda x: x.get('datetime', ''), reverse=True)
        
        # Pagination
        total_count = len(screenshots)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_screenshots = screenshots[start_index:end_index]
        
        return {
            'screenshots': paginated_screenshots,
            'total_count': total_count,
            'objects_scanned': objects_scanned,
            'users_searched': len(user_folders) if 'user_folders' in locals() else 0
        }
    
    def get(self, request):
        """Handle GET requests for screenshot search"""
        start_time = datetime.now()
        
        try:
            # Get parameters
            search_query = request.GET.get('q', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 50))  # Default 50 as requested
            start_date = request.GET.get('start_date', '').strip()
            end_date = request.GET.get('end_date', '').strip()
            
            # Validate parameters
            if page < 1:
                page = 1
            if page_size < 1 or page_size > 500:
                page_size = 50
            
            # Search screenshots
            search_result = self._search_screenshots(
                search_query=search_query,
                page=page,
                page_size=page_size,
                start_date=start_date,
                end_date=end_date
            )
            
            # Handle errors
            if 'error' in search_result:
                return Response({
                    'status': 'error',
                    'message': search_result['error']
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            screenshots = search_result['screenshots']
            total_count = search_result['total_count']
            
            # Calculate pagination info
            total_pages = math.ceil(total_count / page_size)
            has_next = page < total_pages
            has_previous = page > 1
            
            # Calculate performance metrics
            end_time = datetime.now()
            search_time_ms = (end_time - start_time).total_seconds() * 1000
            
            # Format response similar to the search_s3 API
            response_data = {
                "status": "success",
                "message": f"Screenshots from all users retrieved for '{search_query}'" if search_query else "All user screenshots retrieved",
                "data": {
                    "screenshots": screenshots,
                    "total_count": total_count,
                    "search_query": search_query,
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_items": total_count,
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None
                    },
                    "search_performance": {
                        "search_time_ms": round(search_time_ms, 2),
                        "objects_scanned": search_result['objects_scanned'],
                        "screenshots_found": total_count
                    },
                    "data_source": "AWS S3 (ddsfocustime bucket - screenshots folder)",
                    "search_options": {
                        "max_page_size": 500,
                        "default_page_size": 50,
                        "date_filters": {
                            "start_date": start_date,
                            "end_date": end_date,
                            "date_range_applied": bool(start_date or end_date)
                        }
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "1.0.0",
                    "bucket": "ddsfocustime",
                    "search_type": "all_users_screenshots",
                    "features": [
                        "pagination",
                        "all_users_screenshots",
                        "date_range_filtering",
                        "user_search"
                    ]
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in UserScreenshotsAPI: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'API error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
