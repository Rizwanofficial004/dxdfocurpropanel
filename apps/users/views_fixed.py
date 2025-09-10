"""
Enhanced Users Search API Views with Screenshots, Pagination & Date Grouping

This module provides comprehensive user search functionality that searches through S3 bucket
to find users and returns their screenshots organized by date/month with pagination.
Now enhanced with ScreenshotParser for signed URLs.
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
import sys
import os

# Add the dashboard app to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'dashboard'))
from screenshot_parser import ScreenshotParser

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


class UsersSearchView(APIView):
    """
    Enhanced Users Search API with Screenshots, Date Grouping & Pagination
    
    GET /api/users/search/?q=search_term&page=1&page_size=10&group_by=date
    POST /api/users/search/ with pagination and grouping options
    
    Returns users with their screenshots organized by date/month with pagination
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = AWS_CREDENTIALS["additional_config"]["bucket_name"]
        self.screenshot_parser = ScreenshotParser(self.bucket_name)
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
            logger.info("S3 client initialized successfully for enhanced users search")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
    
    def get(self, request):
        """
        GET /api/users/search/?q=search_term&page=1&page_size=10&group_by=date&start_date=2025-09-01&end_date=2025-09-10
        
        Search for users with pagination, screenshot details, and date range filtering
        """
        search_query = request.GET.get('q', '').strip()
        
        # Enhanced parameter parsing with error handling
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
            elif page_size > 500:  # Limit max page size
                page_size = 500
        except (ValueError, TypeError):
            page_size = 50
            
        group_by = request.GET.get('group_by', 'date')  # date, month, year
        
        # Clean up date parameters (handle malformed URLs)
        start_date = request.GET.get('start_date', '').strip()
        end_date = request.GET.get('end_date', '').strip()
        
        # Fix malformed date parameters (like start_date=2025-09-01end_date=2025-09-03=02)
        if start_date and 'end_date' in start_date:
            logger.warning(f"Malformed start_date parameter: {start_date}")
            # Extract just the date part before 'end_date'
            start_date = start_date.split('end_date')[0]
            
        # Clean up any malformed end_date values
        if end_date and '=' in end_date and len(end_date.split('=')) > 2:
            logger.warning(f"Malformed end_date parameter: {end_date}")
            # Try to extract a valid date
            parts = end_date.split('=')
            for part in parts:
                if re.match(r'^\d{4}-\d{2}-\d{2}$', part):
                    end_date = part
                    break
            else:
                end_date = ''
        
        return self._perform_enhanced_search(search_query, page, page_size, group_by, start_date, end_date, request)
    
    def post(self, request):
        """
        POST /api/users/search/
        
        Search for users with JSON payload including pagination options and date range
        """
        search_query = request.data.get('query', '').strip()
        page = int(request.data.get('page', 1))
        page_size = int(request.data.get('page_size', 50))  # Changed default to 50
        group_by = request.data.get('group_by', 'date')
        start_date = request.data.get('start_date', '')
        end_date = request.data.get('end_date', '')
        
        return self._perform_enhanced_search(search_query, page, page_size, group_by, start_date, end_date, request)
    
    def _perform_enhanced_search(self, search_query, page, page_size, group_by, start_date, end_date, request):
        """
        Perform enhanced user search with screenshots, pagination, and date range filtering
        """
        try:
            if not search_query:
                return Response({
                    "status": "error",
                    "message": "Search query is required",
                    "data": {
                        "users": [],
                        "total_count": 0,
                        "search_query": "",
                        "pagination": {
                            "page": page,
                            "page_size": page_size,
                            "total_pages": 0,
                            "has_next": False,
                            "has_previous": False
                        },
                        "suggestions": [
                            "Try searching for: haseeb, nawaz, dxd, global",
                            "Use pagination: ?page=1&page_size=10",
                            "Group by: ?group_by=date (date, month, year)"
                        ]
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Enhanced search for '{search_query}' - Page: {page}, Size: {page_size}, Group: {group_by}")
            
            # Search for users with detailed screenshots
            search_results = self._search_users_with_screenshots(search_query, page, page_size, group_by, start_date, end_date)
            
            # Calculate pagination
            total_users = search_results["total_count"]
            total_pages = math.ceil(total_users / page_size) if total_users > 0 else 0
            has_next = page < total_pages
            has_previous = page > 1
            
            # Format enhanced response
            response_data = {
                "status": "success",
                "message": f"Enhanced user search completed for '{search_query}'",
                "data": {
                    "users": search_results["users"],
                    "total_count": total_users,
                    "search_query": search_query,
                    "group_by": group_by,
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_items": total_users,
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None
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
                            "start_date": search_results.get("validated_dates", {}).get("start_date"),
                            "end_date": search_results.get("validated_dates", {}).get("end_date"),
                            "original_start_date": search_results.get("validated_dates", {}).get("original_start_date"),
                            "original_end_date": search_results.get("validated_dates", {}).get("original_end_date"),
                            "date_range_applied": bool(start_date or end_date),
                            "future_date_adjusted": self._check_future_date_adjustment(
                                search_results.get("validated_dates", {}).get("original_start_date"),
                                search_results.get("validated_dates", {}).get("original_end_date"),
                                search_results.get("validated_dates", {}).get("start_date"),
                                search_results.get("validated_dates", {}).get("end_date")
                            )
                        }
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "2.0.0",
                    "bucket": self.bucket_name,
                    "search_type": "enhanced_with_screenshots",
                    "features": ["pagination", "date_grouping", "screenshots", "month_wise", "date_range_filtering"]
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in enhanced search: {str(e)}")
            return Response({
                "status": "error",
                "message": f"Search failed: {str(e)}",
                "data": {
                    "users": [],
                    "total_count": 0,
                    "search_query": search_query,
                    "error_details": str(e)
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_future_date_adjustment(self, original_start, original_end, validated_start, validated_end):
        """Check if any future date adjustments were made"""
        if not original_start and not original_end:
            return False
        
        today = datetime.now().date().strftime('%Y-%m-%d')
        
        # Check if any original date was in the future and got adjusted
        if original_start and validated_start and original_start != validated_start:
            return True
        if original_end and validated_end and original_end != validated_end:
            return True
            
        return False
    
    def _search_users_with_screenshots(self, search_query, page, page_size, group_by, start_date='', end_date=''):
        """
        Enhanced search with detailed screenshots, date grouping, pagination, and date range filtering
        """
        start_time = datetime.now()
        
        try:
            users_data = {}
            objects_scanned = 0
            total_screenshots = 0
            
            # Parse date filters with future date validation
            start_date_obj = None
            end_date_obj = None
            today = datetime.now().date()
            
            if start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                    # Validate start_date is not in the future
                    if start_date_obj > today:
                        logger.warning(f"Start date {start_date_obj} is in the future, limiting to today ({today})")
                        start_date_obj = today
                    logger.info(f"Start date filter: {start_date_obj}")
                except ValueError:
                    logger.warning(f"Invalid start_date format: {start_date}")
            
            if end_date:
                try:
                    end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                    # Validate end_date is not in the future
                    if end_date_obj > today:
                        logger.warning(f"End date {end_date_obj} is in the future, limiting to today ({today})")
                        end_date_obj = today
                    logger.info(f"End date filter: {end_date_obj}")
                except ValueError:
                    logger.warning(f"Invalid end_date format: {end_date}")
            
            # Search primarily in users_screenshots folder
            search_prefixes = [
                'users_screenshots/',
            ]
            
            search_lower = search_query.lower()
            
            for prefix in search_prefixes:
                logger.info(f"Searching screenshots in prefix: {prefix}")
                
                try:
                    # Use paginator for efficient searching
                    paginator = self.s3_client.get_paginator('list_objects_v2')
                    pages = paginator.paginate(
                        Bucket=self.bucket_name,
                        Prefix=prefix,
                        PaginationConfig={'MaxItems': 5000}  # Increased for more comprehensive search
                    )
                    
                    for page_data in pages:
                        if 'Contents' in page_data:
                            for obj in page_data['Contents']:
                                objects_scanned += 1
                                key = obj['Key']
                                
                                # Extract user info from key
                                user_info = self._extract_user_from_key(key, search_lower)
                                
                                if user_info and self._matches_search(user_info, search_lower):
                                    user_email = user_info['email']
                                    
                                    if user_email not in users_data:
                                        users_data[user_email] = {
                                            'email': user_email,
                                            'display_name': user_info['display_name'],
                                            'original_name': user_info['original_name'],
                                            'screenshots': [],
                                            'screenshots_by_date': defaultdict(list),
                                            'screenshots_by_month': defaultdict(list),
                                            'screenshots_by_year': defaultdict(list),
                                            'total_screenshots': 0,
                                            'total_size': 0,
                                            'date_range': {'first': None, 'last': None},
                                            'active_days': set(),
                                            'active_months': set(),
                                            'folders': set()
                                        }
                                    
                                    # Parse screenshot details
                                    screenshot_info = self._parse_screenshot_details(key, obj)
                                    
                                    if screenshot_info:
                                        # Apply date range filtering
                                        screenshot_date_obj = None
                                        try:
                                            screenshot_date_obj = datetime.strptime(screenshot_info['date'], '%Y-%m-%d').date()
                                        except ValueError:
                                            continue  # Skip invalid dates
                                        
                                        # Check if screenshot falls within date range
                                        if start_date_obj and screenshot_date_obj < start_date_obj:
                                            continue  # Skip screenshots before start_date
                                        
                                        if end_date_obj and screenshot_date_obj > end_date_obj:
                                            continue  # Skip screenshots after end_date
                                        
                                        # Count this screenshot as it passed date filtering
                                        total_screenshots += 1
                                        
                                        user_data = users_data[user_email]
                                        
                                        # Add to screenshots list
                                        user_data['screenshots'].append(screenshot_info)
                                        user_data['total_screenshots'] += 1
                                        user_data['total_size'] += obj['Size']
                                        
                                        # Group by date/month/year
                                        screenshot_date = screenshot_info['date']
                                        screenshot_month = screenshot_info['month']
                                        screenshot_year = screenshot_info['year']
                                        
                                        user_data['screenshots_by_date'][screenshot_date].append(screenshot_info)
                                        user_data['screenshots_by_month'][screenshot_month].append(screenshot_info)
                                        user_data['screenshots_by_year'][screenshot_year].append(screenshot_info)
                                        
                                        # Track activity
                                        user_data['active_days'].add(screenshot_date)
                                        user_data['active_months'].add(screenshot_month)
                                        user_data['folders'].add(screenshot_info['folder'])
                                        
                                        # Update date range
                                        file_date = obj['LastModified']
                                        if user_data['date_range']['first'] is None or file_date < user_data['date_range']['first']:
                                            user_data['date_range']['first'] = file_date
                                        if user_data['date_range']['last'] is None or file_date > user_data['date_range']['last']:
                                            user_data['date_range']['last'] = file_date
                
                except Exception as e:
                    logger.error(f"Error searching in prefix {prefix}: {str(e)}")
                    continue
            
            # Convert to list - for single user searches, don't paginate users
            all_users = list(users_data.values())
            total_users = len(all_users)
            
            # Don't paginate users for screenshot-focused searches
            # The pagination will be applied to screenshots within each user
            formatted_users = []
            for user_data in all_users:
                formatted_user = self._format_user_with_screenshots(user_data, group_by, page_size, page)
                formatted_users.append(formatted_user)
            
            # Sort by relevance (most recent activity first)
            formatted_users.sort(key=lambda x: x['last_activity'] or '1900-01-01', reverse=True)
            
            # Calculate search time
            search_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return {
                'users': formatted_users,
                'total_count': total_users,
                'total_screenshots': total_screenshots,
                'search_time_ms': round(search_time, 2),
                'objects_scanned': objects_scanned,
                'validated_dates': {
                    'start_date': start_date_obj.strftime('%Y-%m-%d') if start_date_obj else None,
                    'end_date': end_date_obj.strftime('%Y-%m-%d') if end_date_obj else None,
                    'original_start_date': start_date if start_date else None,
                    'original_end_date': end_date if end_date else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced search: {str(e)}")
            return {
                'users': [],
                'total_count': 0,
                'total_screenshots': 0,
                'search_time_ms': 0,
                'objects_scanned': 0,
                'error': str(e)
            }
    
    def _parse_screenshot_details(self, key, obj):
        """
        Parse detailed screenshot information from S3 key and object
        """
        try:
            # Key format: users_screenshots/2025-09-01/user_email/timestamp_screenshot.webp
            parts = key.split('/')
            
            if len(parts) >= 4:
                folder = parts[0]
                date_part = parts[1]  # 2025-09-01
                user_folder = parts[2]
                filename = parts[-1]
                
                # Extract time information from filename if available
                time_match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
                if time_match:
                    file_date = time_match.group(1)
                    file_time = time_match.group(2).replace('-', ':')
                else:
                    file_date = date_part
                    file_time = "00:00:00"
                
                # Create screenshot URLs
                screenshot_url = self.screenshot_parser._generate_signed_url(key)  # Signed URL for frontend
                direct_url = f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"  # Direct URL for reference
                
                # Extract file extension
                file_extension = filename.split('.')[-1] if '.' in filename else 'unknown'
                
                # Parse date components
                try:
                    date_obj = datetime.strptime(file_date, '%Y-%m-%d')
                    year = date_obj.strftime('%Y')
                    month = date_obj.strftime('%Y-%m')
                    day = date_obj.strftime('%d')
                except ValueError:
                    year = file_date[:4] if len(file_date) >= 4 else 'unknown'
                    month = file_date[:7] if len(file_date) >= 7 else 'unknown'
                    day = file_date[8:10] if len(file_date) >= 10 else 'unknown'
                
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
                    'folder': folder,
                    'user_folder': user_folder,
                    'file_extension': file_extension,
                    'screenshot_url': screenshot_url,  # Signed URL for frontend access
                    'direct_url': direct_url  # Direct URL for reference
                }
                
        except Exception as e:
            logger.error(f"Error parsing screenshot details for {key}: {str(e)}")
            return None
        
        return None
    
    def _format_user_with_screenshots(self, user_data, group_by, page_size, page):
        """
        Format user data with grouped screenshots based on group_by parameter.
        Apply page_size to total screenshots across all groups, not per group.
        """
        try:
            # Get all screenshots and sort them by date/time (most recent first)
            all_screenshots = sorted(user_data['screenshots'], key=lambda x: x['datetime'], reverse=True)
            
            # Apply pagination to the complete screenshot list
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_screenshots = all_screenshots[start_index:end_index]
            
            # Group the paginated screenshots based on group_by parameter
            if group_by == 'month':
                grouped_screenshots = {}
                for screenshot in paginated_screenshots:
                    month_key = screenshot['month']
                    if month_key not in grouped_screenshots:
                        grouped_screenshots[month_key] = {
                            'month': month_key,
                            'count': 0,
                            'total_size_mb': 0,
                            'screenshots': []
                        }
                    grouped_screenshots[month_key]['screenshots'].append(screenshot)
                    grouped_screenshots[month_key]['count'] += 1
                    grouped_screenshots[month_key]['total_size_mb'] += screenshot['size_mb']
                
                # Round the sizes
                for group in grouped_screenshots.values():
                    group['total_size_mb'] = round(group['total_size_mb'], 3)
                    
            elif group_by == 'year':
                grouped_screenshots = {}
                for screenshot in paginated_screenshots:
                    year_key = screenshot['year']
                    if year_key not in grouped_screenshots:
                        grouped_screenshots[year_key] = {
                            'year': year_key,
                            'count': 0,
                            'total_size_mb': 0,
                            'screenshots': []
                        }
                    grouped_screenshots[year_key]['screenshots'].append(screenshot)
                    grouped_screenshots[year_key]['count'] += 1
                    grouped_screenshots[year_key]['total_size_mb'] += screenshot['size_mb']
                
                # Round the sizes
                for group in grouped_screenshots.values():
                    group['total_size_mb'] = round(group['total_size_mb'], 3)
                    
            else:  # group_by == 'date'
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
                
                # Round the sizes and sort screenshots within each date by time
                for group in grouped_screenshots.values():
                    group['total_size_mb'] = round(group['total_size_mb'], 3)
                    group['screenshots'] = sorted(group['screenshots'], key=lambda x: x['time'], reverse=True)
            
            # Calculate activity statistics
            date_range = user_data['date_range']
            first_activity = date_range['first'].strftime("%Y-%m-%d") if date_range['first'] else None
            last_activity = date_range['last'].strftime("%Y-%m-%d") if date_range['last'] else None
            
            return {
                'email': user_data['email'],
                'display_name': user_data['display_name'],
                'original_name': user_data['original_name'],
                'total_screenshots': len(all_screenshots),  # Use actual filtered count
                'total_size_mb': round(user_data['total_size'] / (1024 * 1024), 2),
                'active_days_count': len(user_data['active_days']),
                'active_months_count': len(user_data['active_months']),
                'first_activity': first_activity,
                'last_activity': last_activity,
                'last_activity_ago': self._time_ago(date_range['last']) if date_range['last'] else 'Unknown',
                'folders': list(user_data['folders']),
                'grouped_screenshots': grouped_screenshots,
                'recent_screenshots': all_screenshots[:5],  # 5 most recent
                'status': 'active' if date_range['last'] and date_range['last'] > (datetime.now() - timedelta(days=7)).replace(tzinfo=date_range['last'].tzinfo) else 'inactive',
                'match_reason': self._get_match_reason(user_data, group_by),
                'activity_summary': {
                    'total_days': len(user_data['active_days']),
                    'total_months': len(user_data['active_months']),
                    'avg_screenshots_per_day': round(user_data['total_screenshots'] / max(len(user_data['active_days']), 1), 1),
                    'date_range_days': (date_range['last'] - date_range['first']).days if date_range['first'] and date_range['last'] else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error formatting user data: {str(e)}")
            return {
                'email': user_data.get('email', 'unknown'),
                'error': str(e)
            }
    
    def _extract_user_from_key(self, key, search_term):
        """Extract user information from S3 key"""
        try:
            parts = key.split('/')
            
            for part in parts:
                if '@' in part or search_term in part.lower():
                    # Convert from folder name to email
                    if '_at_' in part:
                        email = part.replace('_at_', '@')
                        display_name = part.replace('_at_dxdglobal.com', '').replace('_', ' ')
                    else:
                        email = part
                        display_name = part.split('@')[0] if '@' in part else part
                    
                    return {
                        'email': email,
                        'display_name': display_name,
                        'original_name': part
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting user from key {key}: {str(e)}")
            return None
    
    def _matches_search(self, user_info, search_term):
        """Check if user info matches search term"""
        if not user_info or not search_term:
            return False
        
        search_term = search_term.lower()
        
        # Check email, display name, and original name
        return (
            search_term in user_info['email'].lower() or
            search_term in user_info['display_name'].lower() or
            search_term in user_info['original_name'].lower()
        )
    
    def _time_ago(self, date_time):
        """Calculate time ago string"""
        try:
            if not date_time:
                return 'Unknown'
            
            now = datetime.now()
            if date_time.tzinfo:
                now = now.replace(tzinfo=date_time.tzinfo)
            
            diff = now - date_time
            
            if diff.days > 0:
                return f"{diff.days} days ago"
            elif diff.seconds > 3600:
                hours = diff.seconds // 3600
                return f"{hours} hours ago"
            elif diff.seconds > 60:
                minutes = diff.seconds // 60
                return f"{minutes} minutes ago"
            else:
                return "Just now"
                
        except Exception as e:
            logger.error(f"Error calculating time ago: {str(e)}")
            return 'Unknown'
    
    def _get_match_reason(self, user_data, group_by):
        """Get reason for match"""
        return f"Content match (grouped by {group_by})"
