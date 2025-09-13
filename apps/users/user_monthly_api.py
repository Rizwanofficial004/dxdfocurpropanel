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
        """Get monthly screenshots for all users with pagination and fast performance"""
        try:
            # Get parameters
            year = int(request.GET.get('year', 2025))
            month = int(request.GET.get('month', 8))  # Default to August
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
            
            # Filter users if search provided
            if search_user:
                # Handle both email formats: user@domain.com and user_at_domain.com
                search_normalized = search_user.replace('@', '_at_').lower()
                users = [u for u in users if (search_normalized in u.lower() or 
                                            search_user.lower() in u.replace('_at_', '@').lower())]
                logger.info(f"Filtered to {len(users)} users matching '{search_user}'")
            
            # Get monthly data for each user (optimized with threading)
            users_data = []
            total_screenshots = 0
            total_active_users = 0
            
            # Process users in batches for better performance
            def process_user(user):
                """Process a single user's data"""
                try:
                    user_data = self._get_user_monthly_data(user, year, month)
                    return user_data if user_data and user_data.get('screenshots_count', 0) > 0 else None
                except Exception as e:
                    logger.error(f"Error processing user {user}: {str(e)}")
                    return None
            
            # Use ThreadPoolExecutor for faster processing
            with ThreadPoolExecutor(max_workers=10) as executor:
                # Submit all user processing tasks
                future_to_user = {executor.submit(process_user, user): user for user in users}
                
                # Collect results as they complete
                for future in as_completed(future_to_user):
                    user = future_to_user[future]
                    try:
                        user_data = future.result()
                        if user_data:
                            users_data.append(user_data)
                            total_screenshots += user_data['screenshots_count']
                            total_active_users += 1
                    except Exception as e:
                        logger.error(f"Error processing user {user}: {str(e)}")
            
            logger.info(f"Processed {len(users)} users, found {total_active_users} active users")
            
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
                "data": {
                    "month_info": {
                        "year": year,
                        "month": month,
                        "month_name": calendar.month_name[month],
                        "days_in_month": calendar.monthrange(year, month)[1]
                    },
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_users": total_users,
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None
                    },
                    "summary": {
                        "total_users_scanned": len(users),
                        "active_users": total_active_users,
                        "inactive_users": len(users) - total_active_users,
                        "total_screenshots": total_screenshots,
                        "avg_screenshots_per_active_user": round(total_screenshots / total_active_users, 2) if total_active_users > 0 else 0,
                        "users_on_this_page": len(paginated_users)
                    },
                    "users": paginated_users,
                    "generated_at": datetime.now().isoformat()
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
        """Get monthly screenshot data for a specific user - handles real S3 structure"""
        try:
            # Turkish month names for matching folder names
            turkish_months = {
                1: 'Ocak', 2: 'Şubat', 3: 'Mart', 4: 'Nisan', 5: 'Mayıs', 6: 'Haziran',
                7: 'Temmuz', 8: 'Ağustos', 9: 'Eylül', 10: 'Ekim', 11: 'Kasım', 12: 'Aralık'
            }
            
            turkish_month = turkish_months.get(month, '')
            user_prefix = f"screenshots/{user}/"
            
            logger.info(f"Checking real structure for user {user} - looking for {turkish_month} {year}")
            
            # List all folders for this user
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                Delimiter='/'
            )
            
            total_screenshots = 0
            matching_folders = []
            
            if 'CommonPrefixes' in response:
                # Look for folders that match the target month and year
                for folder_obj in response['CommonPrefixes']:
                    folder_name = folder_obj['Prefix'].replace(user_prefix, '').rstrip('/')
                    folder_lower = folder_name.lower()
                    
                    # Check if folder contains the target month and year
                    # Handle patterns like: _DDS_Haziran_2025_Sanal_Asistanlik_Süreci
                    if (turkish_month.lower() in folder_lower and 
                        str(year) in folder_name):
                        matching_folders.append(folder_obj['Prefix'])
                        logger.info(f"Found matching folder for {user}: {folder_name}")
                
                # Count screenshots in matching folders
                daily_data = []
                for folder_prefix in matching_folders:
                    folder_screenshots = self._count_folder_screenshots(folder_prefix, year, month)
                    total_screenshots += folder_screenshots
                    
                    if folder_screenshots > 0:
                        # Extract day info from file names if possible
                        folder_name = folder_prefix.replace(user_prefix, '').rstrip('/')
                        daily_data.append({
                            'folder': folder_name,
                            'screenshots_count': folder_screenshots,
                            'folder_path': folder_prefix
                        })
            
            # Only return data for users with screenshots
            if total_screenshots > 0:
                return {
                    'user': user,
                    'user_display': user.replace('_at_', '@'),  # Convert back to email format
                    'screenshots_count': total_screenshots,
                    'active_days': len(matching_folders),
                    'daily_data': daily_data,
                    'avg_screenshots_per_day': round(total_screenshots / len(matching_folders), 2) if matching_folders else 0,
                    'matching_folders': [f.replace(user_prefix, '').rstrip('/') for f in matching_folders]
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting monthly data for user {user}: {str(e)}")
            return None
    
    def _count_folder_screenshots(self, folder_prefix, year, month):
        """Count screenshot files in a specific folder with optimized S3 operations"""
        try:
            # Use paginator for large folders to avoid memory issues
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=folder_prefix,
                PaginationConfig={'PageSize': 1000, 'MaxItems': 10000}  # Limit for performance
            )
            
            screenshot_count = 0
            image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff')
            
            for page in page_iterator:
                if 'Contents' in page:
                    # Batch process files for better performance
                    for obj in page['Contents']:
                        file_key = obj['Key']
                        file_name = file_key.split('/')[-1].lower()
                        
                        # Count image files (optimized check)
                        if file_name.endswith(image_extensions):
                            screenshot_count += 1
            
            logger.info(f"Found {screenshot_count} screenshots in folder: {folder_prefix}")
            return screenshot_count
            
        except Exception as e:
            logger.error(f"Error counting screenshots in {folder_prefix}: {str(e)}")
            return 0
