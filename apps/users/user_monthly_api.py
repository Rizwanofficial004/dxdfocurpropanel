"""
User-based Monthly Screenshots API with Pagination and Fast Performance
Works with actual S3 structure: screenshots/{user_email}/{_DDS_Month_Year_}/
"""
import logging
import calendar
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import boto3
import os

logger = logging.getLogger(__name__)

class UserMonthlyScreenshotsAPI(APIView):
    """
    API for accessing user-based monthly screenshots
    Structure: screenshots/{user_email}/{year}-{month}/{day}/
    """
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = 'ddsfocustime'
        self._initialize_s3_client()
    
    def _initialize_s3_client(self):
        """Initialize S3 client using environment variables"""
        try:
            aws_access_key = os.getenv('AWS_ACCESS_KEY_ID', 'AKIARSU6EUUWMQ5I2JWC')
            aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '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')
            aws_region = os.getenv('AWS_REGION', 'eu-north-1')
            self.bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
            
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
            logger.info(f"S3 client initialized for user monthly screenshots - bucket: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
            self.s3_client = None
    
    def get(self, request):
        """Get monthly screenshots for all users with pagination and fast performance
        Supports URL format: /api/users/monthly-screenshots/?2025-08-01/2025-08-31&user=kadircagtas_at_gmail.com&page=1
        """
        try:
            # Parse date range from query string (format: ?YYYY-MM-DD/YYYY-MM-DD)
            date_range = None
            year = None
            month = None
            
            # Check for date range in query string
            query_string = request.META.get('QUERY_STRING', '')
            if '/' in query_string and not query_string.startswith('user=') and not query_string.startswith('page='):
                # Extract date range from start of query string
                parts = query_string.split('&')
                for part in parts:
                    if '/' in part and '-' in part and not '=' in part:
                        date_range = part
                        break
            
            # Parse date range or use individual parameters
            if date_range:
                try:
                    start_date_str, end_date_str = date_range.split('/')
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
                    year = start_date.year
                    month = start_date.month
                    
                    # Validate that it's the same month
                    if start_date.month != end_date.month or start_date.year != end_date.year:
                        return Response({
                            "status": "error",
                            "message": "Date range must be within the same month"
                        }, status=status.HTTP_400_BAD_REQUEST)
                        
                except ValueError:
                    return Response({
                        "status": "error",
                        "message": "Invalid date format. Use YYYY-MM-DD/YYYY-MM-DD"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Fall back to individual parameters
                year = int(request.GET.get('year', 2025))
                month = int(request.GET.get('month', 8))  # Default to August
            
            # Get other parameters
            search_user = request.GET.get('user', '').strip()
            page = int(request.GET.get('page', 1))
            page_size = 50  # Fixed pagination size
            
            logger.info(f"Getting monthly screenshots for {calendar.month_name[month]} {year} - Page {page}")
            
            if not (1 <= month <= 12):
                return Response({
                    "status": "error",
                    "message": "Month must be between 1 and 12"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if page < 1:
                return Response({
                    "status": "error",
                    "message": "Page must be 1 or greater"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get all users from screenshots folder
            users = self._get_all_users()
            logger.info(f"Found {len(users)} total users in screenshots folder")
            
            # Filter users if search provided - enhanced filtering
            if search_user:
                # Handle both email formats: user@domain.com and user_at_domain.com
                search_normalized = search_user.replace('@', '_at_').lower()
                search_email = search_user.replace('_at_', '@').lower()
                
                users = [u for u in users if (
                    search_normalized in u.lower() or 
                    search_email in u.replace('_at_', '@').lower() or
                    search_user.lower() == u.lower() or
                    search_user.lower() == u.replace('_at_', '@').lower()
                )]
                logger.info(f"Filtered to {len(users)} users matching '{search_user}'")
                
                # If exact user match, prioritize that user
                exact_matches = [u for u in users if u.lower() == search_normalized or 
                                u.replace('_at_', '@').lower() == search_email]
                if exact_matches:
                    users = exact_matches + [u for u in users if u not in exact_matches]
            
            # Performance optimization: limit users per request for faster response
            max_users_per_request = 10 if not search_user else 200  # ULTRA small limit for speed
            if len(users) > max_users_per_request:
                users = users[:max_users_per_request]
                logger.info(f"ULTRA-SPEED: Limited to {max_users_per_request} users for maximum speed")
            
            # Get monthly data for each user (SPEED OPTIMIZED)
            users_data = []
            total_screenshots = 0
            total_active_users = 0
            processing_errors = 0
            
            # Process users in batches for better performance
            def process_user_fast(user):
                """ULTRA-FAST user processing with minimal overhead"""
                try:
                    user_data = self._get_user_monthly_data(user, year, month)
                    if user_data and user_data.get('screenshots_count', 0) > 0:
                        return {'success': True, 'data': user_data, 'user': user}
                    else:
                        return {'success': True, 'data': None, 'user': user}
                except Exception as e:
                    return {'success': False, 'error': str(e), 'user': user}
            
            # SPEED OPTIMIZATION: Reduce concurrent workers to prevent overwhelming S3
            max_workers = min(3, len(users)) if len(users) > 1 else 1  # ULTRA small for speed
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all user processing tasks
                future_to_user = {executor.submit(process_user_fast, user): user for user in users}
                
                # Collect results as they complete
                for future in as_completed(future_to_user):
                    user = future_to_user[future]
                    try:
                        result = future.result()
                        if result['success'] and result['data']:
                            users_data.append(result['data'])
                            total_screenshots += result['data']['screenshots_count']
                            total_active_users += 1
                        elif not result['success']:
                            processing_errors += 1
                    except Exception as e:
                        logger.error(f"Error processing user {user}: {str(e)}")
                        processing_errors += 1
            
            logger.info(f"Processed {len(users)} users, found {total_active_users} active users, {processing_errors} errors")
            
            # Sort by screenshot count (most active first)
            users_data.sort(key=lambda x: x['screenshots_count'], reverse=True)
            
            # Apply pagination
            total_users = len(users_data)
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_users = users_data[start_index:end_index]
            
            # Calculate pagination info
            total_pages = (total_users + page_size - 1) // page_size  # Ceiling division
            has_next = page < total_pages
            has_previous = page > 1
            
            return Response({
                "status": "success",
                "message": f"Found {total_active_users} active users with screenshots for {calendar.month_name[month]} {year} (Page {page} of {total_pages})",
                "api_info": {
                    "endpoint": "/api/users/monthly-screenshots/",
                    "supported_formats": [
                        "?year=2025&month=8&user=user_at_domain.com&page=1",
                        "?2025-08-01/2025-08-31&user=kadircagtas_at_gmail.com&page=1"
                    ],
                    "version": "2.0",
                    "performance_optimized": True
                },
                "data": {
                    "month_info": {
                        "year": year,
                        "month": month,
                        "month_name": calendar.month_name[month],
                        "days_in_month": calendar.monthrange(year, month)[1],
                        "date_range_queried": f"{year}-{month:02d}-01 to {year}-{month:02d}-{calendar.monthrange(year, month)[1]}"
                    },
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_users": total_users,
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None,
                        "next_url": f"/api/users/monthly-screenshots/?{year}-{month:02d}-01/{year}-{month:02d}-{calendar.monthrange(year, month)[1]}&user={search_user}&page={page + 1}" if has_next and search_user else None,
                        "previous_url": f"/api/users/monthly-screenshots/?{year}-{month:02d}-01/{year}-{month:02d}-{calendar.monthrange(year, month)[1]}&user={search_user}&page={page - 1}" if has_previous and search_user else None
                    },
                    "summary": {
                        "total_users_scanned": len(users),
                        "active_users": total_active_users,
                        "inactive_users": len(users) - total_active_users,
                        "total_screenshots": total_screenshots,
                        "avg_screenshots_per_active_user": round(total_screenshots / total_active_users, 2) if total_active_users > 0 else 0,
                        "users_on_this_page": len(paginated_users),
                        "processing_errors": processing_errors,
                        "search_filter": search_user if search_user else None
                    },
                    "users": paginated_users,
                    "generated_at": datetime.now().isoformat(),
                    "s3_bucket": self.bucket_name,
                    "processing_time_optimized": True
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in user monthly screenshots API: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Failed to get screenshots: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_all_users(self):
        """Get all user folders from screenshots directory"""
        users = []
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='screenshots/',
                Delimiter='/'
            )
            
            if 'CommonPrefixes' in response:
                for obj in response['CommonPrefixes']:
                    user_folder = obj['Prefix'].replace('screenshots/', '').rstrip('/')
                    if user_folder:  # Skip empty folders
                        users.append(user_folder)
            
            return users
            
        except Exception as e:
            logger.error(f"Error getting users: {str(e)}")
            return []
    
    def _get_user_monthly_data(self, user, year, month):
        """SPEED-OPTIMIZED: Get monthly screenshot data for a specific user"""
        try:
            user_prefix = f"screenshots/{user}/"
            
            # SPEED: Quick folder listing without verbose logging
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                Delimiter='/',
                MaxKeys=20  # Limit folders for speed
            )
            
            total_screenshots = 0
            matching_folders = []
            
            if 'CommonPrefixes' in response:
                # Process folders quickly - no duplicate counting
                for folder_obj in response['CommonPrefixes']:
                    folder_screenshots = self._count_folder_screenshots_by_filename(folder_obj['Prefix'], year, month)
                    
                    if folder_screenshots > 0:
                        matching_folders.append(folder_obj['Prefix'])
                        total_screenshots += folder_screenshots
                
                # SPEED: Minimal daily data processing
                daily_data = []
                for folder_prefix in matching_folders[:5]:  # Limit to first 5 for speed
                    folder_name = folder_prefix.replace(user_prefix, '').rstrip('/')
                    daily_data.append({
                        'folder': folder_name[:50],  # Truncate long names
                        'screenshots_count': 'calculated',  # Skip recalculation
                        'folder_path': folder_prefix
                    })
            
            # Only return data for users with screenshots
            if total_screenshots > 0:
                return {
                    'user': user,
                    'user_display': user.replace('_at_', '@'),
                    'screenshots_count': total_screenshots,
                    'active_days': len(matching_folders),
                    'daily_data': daily_data,
                    'avg_screenshots_per_day': round(total_screenshots / len(matching_folders), 2) if matching_folders else 0,
                    'matching_folders': [f.replace(user_prefix, '').rstrip('/') for f in matching_folders[:10]]  # Limit for speed
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting monthly data for user {user}: {str(e)}")
            return None
    
    def _count_folder_screenshots_by_filename(self, folder_prefix, year, month):
        """ULTRA-FAST screenshot counting - optimized for maximum speed"""
        try:
            # Use paginator with minimal settings for speed
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=folder_prefix,
                PaginationConfig={'PageSize': 500, 'MaxItems': 5000}  # Reduced for speed
            )
            
            screenshot_count = 0
            # Only check most common extensions for speed
            fast_extensions = ('.webp', '.png', '.jpg', '.jpeg')
            target_month = f"{year}-{month:02d}-"  # e.g., "2025-08-"
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        file_name = obj['Key'].split('/')[-1]
                        
                        # SPEED OPTIMIZATION: Single condition check
                        if (target_month in file_name and 
                            file_name.endswith(fast_extensions) and 
                            obj['Size'] > 5000):  # Screenshots are usually larger than 5KB
                            screenshot_count += 1
            
            return screenshot_count
            
        except Exception as e:
            logger.error(f"Fast count error in {folder_prefix}: {str(e)}")
            return 0

    def _count_folder_screenshots(self, folder_prefix, year, month):
        """Count screenshot files in a specific folder with optimized S3 operations and accurate filtering"""
        try:
            logger.info(f"Scanning folder: {folder_prefix}")
            
            # Use paginator for large folders to avoid memory issues
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=folder_prefix,
                PaginationConfig={'PageSize': 1000, 'MaxItems': 50000}  # Increased limit for accuracy
            )
            
            screenshot_count = 0
            # More comprehensive image extensions
            image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', 
                              '.PNG', '.JPG', '.JPEG', '.GIF', '.BMP', '.WEBP', '.TIFF')
            processed_files = 0
            valid_files = []  # For debugging
            
            for page in page_iterator:
                if 'Contents' in page:
                    # Batch process files for better performance
                    for obj in page['Contents']:
                        file_key = obj['Key']
                        file_name = file_key.split('/')[-1]
                        processed_files += 1
                        
                        # More lenient image file detection
                        if (file_name.endswith(image_extensions) and 
                            not file_name.startswith('.') and 
                            not file_name.lower().startswith('thumbs.db') and
                            len(file_name) > 4 and  # Ensure it's not just extension
                            obj['Size'] > 1024):  # Must be larger than 1KB (exclude empty files)
                            
                            screenshot_count += 1
                            valid_files.append(file_name)
                            
                            # Log first few files for debugging
                            if len(valid_files) <= 5:
                                logger.info(f"Valid screenshot found: {file_name} (size: {obj['Size']} bytes)")
            
            logger.info(f"Folder {folder_prefix}: Found {screenshot_count} screenshots from {processed_files} total files")
            if screenshot_count == 0 and processed_files > 0:
                logger.warning(f"No screenshots found in {folder_prefix} despite {processed_files} files present")
            
            return screenshot_count
            
        except Exception as e:
            logger.error(f"Error counting screenshots in {folder_prefix}: {str(e)}")
            return 0
