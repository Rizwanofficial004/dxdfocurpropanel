import logging
import re
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import boto3

logger = logging.getLogger(__name__)

class EnhancedUsersSearchView(APIView):
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        self.bucket_name = 'ddsfocustime'
    
    def get(self, request):
        search_query = request.GET.get('q', '').strip()
        start_date = request.GET.get('start_date', '')
        end_date = request.GET.get('end_date', '')
        group_by = request.GET.get('group_by', 'date')
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        
        logger.info(f"Enhanced search: q='{search_query}', dates={start_date} to {end_date}")
        
        try:
            search_results = self._enhanced_search(
                search_query=search_query,
                start_date=start_date,
                end_date=end_date,
                group_by=group_by,
                page=page,
                page_size=page_size
            )
            
            response_data = {
                "status": "success",
                "message": f"Enhanced user search completed for '{search_query}'",
                "data": {
                    "users": search_results.get('users', []),
                    "total_count": search_results.get('total_count', 0),
                    "search_query": search_query,
                    "group_by": group_by,
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": max(1, (search_results.get('total_count', 0) + page_size - 1) // page_size),
                        "total_items": search_results.get('total_count', 0),
                        "has_next": page * page_size < search_results.get('total_count', 0),
                        "has_previous": page > 1,
                        "next_page": page + 1 if page * page_size < search_results.get('total_count', 0) else None,
                        "previous_page": page - 1 if page > 1 else None
                    },
                    "search_performance": {
                        "search_time_ms": search_results.get("search_time_ms", 0),
                        "objects_scanned": search_results.get("objects_scanned", 0),
                        "screenshots_found": search_results.get("total_screenshots", 0)
                    },
                    "data_source": f"AWS S3 ({self.bucket_name} bucket)",
                    "search_options": {
                        "available_grouping": ["date", "month", "year"],
                        "max_page_size": 500,
                        "current_grouping": group_by,
                        "date_filters": {
                            "start_date": start_date,
                            "end_date": end_date,
                            "date_range_applied": bool(start_date or end_date)
                        }
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "2.5.0",
                    "bucket": self.bucket_name,
                    "search_type": "enhanced_accurate_s3_data",
                    "features": ["pagination", "date_grouping", "screenshots", "s3_nested_folders", "accurate_user_counting"],
                    "accuracy_improvements": [
                        "Folder-based user detection",
                        "Efficient S3 scanning",
                        "Precise date filtering",
                        "Screenshot file validation"
                    ]
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in enhanced search: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"Search failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _enhanced_search(self, search_query, start_date, end_date, group_by, page, page_size):
        start_time = datetime.now()
        
        # Parse date filters
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                logger.warning(f"Invalid start_date format: {start_date}")
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                logger.warning(f"Invalid end_date format: {end_date}")
        
        # Search for users and their screenshots with improved accuracy
        users_data = {}
        total_screenshots = 0
        objects_scanned = 0
        
        try:
            # Build search prefixes based on date range
            prefixes = self._build_search_prefixes(start_date_obj, end_date_obj)
            
            for prefix in prefixes:
                logger.debug(f"Searching S3 with prefix: {prefix}")
                
                # First, get user folders for this date to be more accurate
                date_folders = self._get_user_folders_for_date(prefix)
                
                for user_folder in date_folders:
                    # Only process if user matches search query (or no query)
                    user_info = self._extract_user_from_folder_name(user_folder)
                    
                    if user_info and self._matches_search(user_info, search_query):
                        user_email = user_info['email']
                        logger.debug(f"Processing user: {user_email}")
                        
                        # Initialize user data if not exists
                        if user_email not in users_data:
                            users_data[user_email] = {
                                'email': user_email,
                                'display_name': user_info['display_name'],
                                'original_name': user_info['original_name'],
                                'screenshots': [],
                                'total_screenshots': 0,
                                'total_size': 0,
                                'date_range': {'first': None, 'last': None},
                                'active_days': set(),
                                'active_months': set(),
                                'folders': set()
                            }
                        
                        # Get all screenshots for this user on this date
                        user_prefix = f"{prefix}{user_folder}/"
                        screenshots = self._get_screenshots_for_user_date(user_prefix)
                        
                        for screenshot_obj in screenshots:
                            objects_scanned += 1
                            key = screenshot_obj['Key']
                            
                            # Parse screenshot details
                            screenshot_info = self._parse_screenshot_details(key, screenshot_obj)
                            
                            if screenshot_info:
                                # Verify date range filtering
                                try:
                                    screenshot_date_obj = datetime.strptime(screenshot_info['date'], '%Y-%m-%d').date()
                                except ValueError:
                                    continue
                                
                                # Check if screenshot falls within date range
                                if start_date_obj and screenshot_date_obj < start_date_obj:
                                    continue
                                
                                if end_date_obj and screenshot_date_obj > end_date_obj:
                                    continue
                                
                                # Add screenshot to user data
                                total_screenshots += 1
                                user_data = users_data[user_email]
                                
                                user_data['screenshots'].append(screenshot_info)
                                user_data['total_screenshots'] += 1
                                user_data['total_size'] += screenshot_obj['Size']
                                
                                # Track activity
                                user_data['active_days'].add(screenshot_info['date'])
                                user_data['active_months'].add(screenshot_info['month'])
                                user_data['folders'].add(screenshot_info.get('user_folder', ''))
                                
                                # Update date range
                                file_date = screenshot_obj['LastModified']
                                if user_data['date_range']['first'] is None or file_date < user_data['date_range']['first']:
                                    user_data['date_range']['first'] = file_date
                                if user_data['date_range']['last'] is None or file_date > user_data['date_range']['last']:
                                    user_data['date_range']['last'] = file_date
        
        except Exception as e:
            logger.error(f"Error scanning S3: {str(e)}", exc_info=True)
        
        # Format users data
        formatted_users = []
        for user_data in users_data.values():
            formatted_user = self._format_user_with_screenshots(user_data, group_by, page_size, page)
            formatted_users.append(formatted_user)
        
        # Sort users by total screenshots (most active first)
        formatted_users.sort(key=lambda x: x.get('total_screenshots', 0), reverse=True)
        
        # Calculate search time
        search_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            'users': formatted_users,
            'total_count': len(formatted_users),
            'total_screenshots': total_screenshots,
            'search_time_ms': round(search_time, 2),
            'objects_scanned': objects_scanned
        }
    
    def _build_search_prefixes(self, start_date_obj, end_date_obj):
        prefixes = []
        
        if start_date_obj and end_date_obj:
            current_date = start_date_obj
            while current_date <= end_date_obj:
                prefix = f"users_screenshots/{current_date.strftime('%Y-%m-%d')}/"
                prefixes.append(prefix)
                current_date += timedelta(days=1)
        else:
            # Default to broader range if no range specified (last 90 days to capture historical users)
            current_date = datetime.now().date() - timedelta(days=90)
            end_date = datetime.now().date()
            while current_date <= end_date:
                prefix = f"users_screenshots/{current_date.strftime('%Y-%m-%d')}/"
                prefixes.append(prefix)
                current_date += timedelta(days=1)
        
        logger.debug(f"Generated {len(prefixes)} search prefixes")
        return prefixes
    
    def _get_user_folders_for_date(self, date_prefix):
        """Get list of user folders for a specific date prefix"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=date_prefix,
                Delimiter='/',
                MaxKeys=100
            )
            
            user_folders = []
            if 'CommonPrefixes' in response:
                for prefix in response['CommonPrefixes']:
                    # Extract folder name: users_screenshots/2025-09-01/user_folder/
                    folder_path = prefix['Prefix']
                    user_folder = folder_path.split('/')[-2]  # Get folder name before last slash
                    if user_folder:
                        user_folders.append(user_folder)
                        # Debug: Check for ilahe specifically
                        if 'ilahe' in user_folder.lower():
                            logger.info(f"DEBUG: Found ilahe folder '{user_folder}' for date {date_prefix}")
            
            # Debug log for specific dates where ilahe should exist
            if '2025-09-01' in date_prefix or '2025-09-22' in date_prefix:
                logger.info(f"DEBUG: Date {date_prefix} found {len(user_folders)} user folders: {user_folders}")
            
            return user_folders
        except Exception as e:
            logger.error(f"Error getting user folders for {date_prefix}: {str(e)}")
            return []
    
    def _extract_user_from_folder_name(self, user_folder):
        """Extract user info from folder name"""
        try:
            if '_at_' in user_folder:
                email = user_folder.replace('_at_', '@')
                username = email.split('@')[0]
                display_name = username.replace('_', ' ').title()
            elif '@' in user_folder:
                email = user_folder
                username = email.split('@')[0]
                display_name = username.replace('_', ' ').title()
            else:
                email = f"{user_folder}@unknown.com"
                display_name = user_folder.replace('_', ' ').title()
                username = user_folder
            
            return {
                'email': email,
                'display_name': display_name,
                'original_name': user_folder,
                'username': username
            }
        except Exception as e:
            logger.debug(f"Error extracting user from folder {user_folder}: {str(e)}")
            return None
    
    def _get_screenshots_for_user_date(self, user_prefix):
        """Get all screenshot objects for a specific user and date"""
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                MaxKeys=1000
            )
            
            screenshots = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    # Only include actual screenshot files
                    if key.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                        screenshots.append(obj)
            
            return screenshots
        except Exception as e:
            logger.error(f"Error getting screenshots for {user_prefix}: {str(e)}")
            return []
    
    def _extract_user_from_key(self, key):
        try:
            parts = key.split('/')
            
            if len(parts) >= 3 and parts[0] == 'users_screenshots':
                user_folder = parts[2]  # nawaz_at_dxdglobal.com
                
                if '_at_' in user_folder:
                    email = user_folder.replace('_at_', '@')
                    username = email.split('@')[0]
                    display_name = username.replace('_', ' ').title()
                elif '@' in user_folder:
                    email = user_folder
                    username = email.split('@')[0]
                    display_name = username.replace('_', ' ').title()
                else:
                    email = f"{user_folder}@unknown.com"
                    display_name = user_folder.replace('_', ' ').title()
                
                return {
                    'email': email,
                    'display_name': display_name,
                    'original_name': user_folder,
                    'username': username if 'username' in locals() else user_folder
                }
        
        except Exception as e:
            logger.debug(f"Error extracting user from key {key}: {str(e)}")
        
        return None
    
    def _matches_search(self, user_info, search_query):
        if not search_query:
            return True
        
        search_lower = search_query.lower().strip()
        email_lower = user_info['email'].lower()
        display_name_lower = user_info['display_name'].lower()
        
        return search_lower in email_lower or search_lower in display_name_lower
    
    def _parse_screenshot_details(self, key, obj):
        try:
            parts = key.split('/')
            
            # Must be at least: users_screenshots/date/user/filename
            if len(parts) >= 4 and parts[0] == 'users_screenshots':
                date_folder = parts[1]  # 2025-10-03
                user_folder = parts[2]  # nawaz_at_dxdglobal.com
                filename = parts[-1]    # Always the last part (actual filename)
                
                # Check if this is actually a screenshot file
                if not filename.lower().endswith(('.webp', '.png', '.jpg', '.jpeg')):
                    return None
                
                # Validate date format
                try:
                    date_obj = datetime.strptime(date_folder, '%Y-%m-%d')
                    file_date = date_folder
                except ValueError:
                    # Try to extract date from filename
                    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
                    if date_match:
                        file_date = date_match.group(1)
                        date_obj = datetime.strptime(file_date, '%Y-%m-%d')
                    else:
                        logger.warning(f"Unable to parse date from key: {key}")
                        return None
                
                # Extract time from filename
                time_patterns = [
                    r'_(\d{2})-(\d{2})-(\d{2})\.webp$',  # _01-07-05.webp
                    r'_(\d{2}):(\d{2}):(\d{2})\.webp$',  # _01:07:05.webp
                    r'_(\d{2})(\d{2})(\d{2})\.webp$',    # _010705.webp
                ]
                
                file_time = "00:00:00"
                for pattern in time_patterns:
                    time_match = re.search(pattern, filename)
                    if time_match:
                        hour, minute, second = time_match.groups()
                        file_time = f"{hour}:{minute}:{second}"
                        break
                
                # Create S3 URL
                screenshot_url = f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"
                
                # Extract file extension
                file_extension = filename.split('.')[-1].lower()
                
                # Parse date components
                year = date_obj.strftime('%Y')
                month = date_obj.strftime('%Y-%m')
                day = date_obj.strftime('%d')
                
                # Extract subfolder path
                subfolder_path = ""
                if len(parts) > 4:
                    subfolder_path = "/".join(parts[3:-1])
                
                return {
                    'filename': filename,
                    'full_key': key,
                    'date': file_date,
                    'year': year,
                    'month': month,
                    'day': day,
                    'time': file_time,
                    'datetime': f"{file_date} {file_time}",
                    'size_bytes': obj['Size'],
                    'size_mb': round(obj['Size'] / (1024 * 1024), 3),
                    'last_modified': obj['LastModified'].isoformat(),
                    'folder': 'users_screenshots',
                    'date_folder': date_folder,
                    'user_folder': user_folder,
                    'subfolder_path': subfolder_path,
                    'file_extension': file_extension,
                    'screenshot_url': screenshot_url,
                    'thumbnail_url': screenshot_url,
                    'is_recent': (datetime.now() - obj['LastModified'].replace(tzinfo=None)).days <= 1
                }
        
        except Exception as e:
            logger.error(f"Error parsing screenshot details for {key}: {str(e)}")
        
        return None
    
    def _format_user_with_screenshots(self, user_data, group_by, page_size, page):
        try:
            # Get all screenshots sorted by date/time
            all_screenshots = sorted(user_data['screenshots'], key=lambda x: x['datetime'], reverse=True)
            
            # Calculate pagination
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_screenshots = all_screenshots[start_index:end_index]
            
            # Group screenshots by date
            grouped_screenshots = {}
            for screenshot in paginated_screenshots:
                date_key = screenshot['date']
                if date_key not in grouped_screenshots:
                    grouped_screenshots[date_key] = {
                        'date': date_key,
                        'count': 0,
                        'total_size_mb': 0,
                        'screenshots': []
                    }
                grouped_screenshots[date_key]['screenshots'].append(screenshot)
                grouped_screenshots[date_key]['count'] += 1
                grouped_screenshots[date_key]['total_size_mb'] += screenshot['size_mb']
            
            # Calculate activity summary
            active_days_count = len(user_data['active_days'])
            active_months_count = len(user_data['active_months'])
            
            # Time calculations
            first_activity = user_data['date_range']['first']
            last_activity = user_data['date_range']['last']
            
            return {
                'email': user_data['email'],
                'display_name': user_data['display_name'],
                'original_name': user_data['original_name'],
                'total_screenshots': user_data['total_screenshots'],
                'total_size_mb': round(user_data['total_size'] / (1024 * 1024), 2),
                'active_days_count': active_days_count,
                'active_months_count': active_months_count,
                'first_activity': first_activity.isoformat() if first_activity else None,
                'last_activity': last_activity.isoformat() if last_activity else None,
                'last_activity_ago': "Unknown",
                'folders': list(user_data['folders']),
                'grouped_screenshots': grouped_screenshots,
                'recent_screenshots': paginated_screenshots[:10],
                'status': 'active' if user_data['total_screenshots'] > 0 else 'inactive',
                'match_reason': f"Content match (grouped by {group_by})",
                'activity_summary': {
                    'total_days': active_days_count,
                    'total_months': active_months_count,
                    'avg_screenshots_per_day': round(user_data['total_screenshots'] / max(active_days_count, 1), 2),
                    'date_range_days': active_days_count
                },
                'search_score': 2000.0,
                'match_reasons': [
                    "Email match",
                    "S3 data found"
                ]
            }
        
        except Exception as e:
            logger.error(f"Error formatting user data: {str(e)}")
            return {
                'email': user_data['email'],
                'display_name': user_data['display_name'],
                'error': str(e)
            }