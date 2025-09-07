"""
Enhanced Users Search API Views with Screenshots, Pagination, Date & Month Filtering

This module provides comprehensive user search functionality that searches through S3 bucket
to find users and returns their screenshots organized by date/month with pagination.
Enhanced with month filtering capabilities and intelligent Google-like search.
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
import calendar
from .intelligent_search import intelligent_search

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


class EnhancedUsersSearchView(APIView):
    """
    Enhanced Users Search API with Screenshots, Date Grouping, Pagination, Month & Year Filtering
    
    GET /api/users/search/?q=search_term&page=1&page_size=10&group_by=date&month=2025-09&year=2025
    POST /api/users/search/ with pagination and filtering options
    
    Returns users with their screenshots organized by date/month with pagination
    Supports month filtering and year filtering in addition to date range filtering
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
            logger.info("S3 client initialized successfully for enhanced users search")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")
    
    def get(self, request):
        """
        GET /api/users/search/?q=search_term&page=1&page_size=50&group_by=date&start_date=2025-09-01&end_date=2025-09-02&month=2025-09&year=2025
        
        Search for users with pagination, screenshot details, date range filtering, month filtering, and year filtering
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
        
        # NEW: Month and Year filter parameters
        month_filter = request.GET.get('month', '').strip()  # Format: YYYY-MM (e.g., 2025-09)
        year_filter = request.GET.get('year', '').strip()    # Format: YYYY (e.g., 2025)
        
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
        
        return self._perform_enhanced_search(search_query, page, page_size, group_by, start_date, end_date, month_filter, year_filter, request)
    
    def post(self, request):
        """
        POST /api/users/search/
        
        Search for users with JSON payload including pagination options, date range, month filtering, and year filtering
        """
        search_query = request.data.get('query', '').strip()
        page = int(request.data.get('page', 1))
        page_size = int(request.data.get('page_size', 50))  # Changed default to 50
        group_by = request.data.get('group_by', 'date')
        start_date = request.data.get('start_date', '')
        end_date = request.data.get('end_date', '')
        month_filter = request.data.get('month', '')  # NEW: Month filter support
        year_filter = request.data.get('year', '')    # NEW: Year filter support
        
        return self._perform_enhanced_search(search_query, page, page_size, group_by, start_date, end_date, month_filter, year_filter, request)
    
    def _perform_enhanced_search(self, search_query, page, page_size, group_by, start_date, end_date, month_filter, year_filter, request):
        """
        Perform enhanced user search with screenshots, pagination, date range filtering, month filtering, and year filtering
        """
        try:
            if not search_query:
                # Generate search suggestions from available users
                all_users = self._get_all_users_preview()
                suggestions = intelligent_search.generate_suggestions("", all_users)
                
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
                        "suggestions": suggestions[:5] if suggestions else [
                            "Try searching for: haseeb, nawaz, dxd, global",
                            "Use partial search: 'n' will match 'nawaz', 'haseeb', etc.",
                            "Fuzzy matching: 'navaz' will find 'nawaz'",
                            "Smart ranking: Results sorted by relevance"
                        ],
                        "search_tips": [
                            "✨ Smart Search: Search with just 'n' or 'm' for great results",
                            "🔍 Fuzzy Matching: 'navaz' finds 'nawaz', 'haseb' finds 'haseeb'",
                            "📊 Intelligent Ranking: Best matches appear first",
                            "🎯 Partial Matching: Any part of email or name works"
                        ]
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info(f"Enhanced search for '{search_query}' - Page: {page}, Size: {page_size}, Group: {group_by}, Month: {month_filter}, Year: {year_filter}")
            
            # Search for users with detailed screenshots
            search_results = self._search_users_with_screenshots(search_query, page, page_size, group_by, start_date, end_date, month_filter, year_filter)
            
            # Check if search failed due to invalid month filter
            if search_results.get("error") and "Invalid month filter" in search_results.get("error"):
                return Response({
                    "status": "error",
                    "message": search_results["error"],
                    "data": {
                        "users": [],
                        "total_count": 0,
                        "search_query": search_query,
                        "pagination": {
                            "page": page,
                            "page_size": page_size,
                            "total_pages": 0,
                            "has_next": False,
                            "has_previous": False
                        },
                        "error_details": {
                            "invalid_month_filter": search_results.get("validated_dates", {}).get("original_month_filter"),
                            "current_month": search_results.get("validated_dates", {}).get("current_month"),
                            "future_month_rejected": search_results.get("validated_dates", {}).get("future_month_rejected", False)
                        }
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate pagination based on screenshot count, not user count
            total_users = search_results["total_count"]
            total_screenshots = search_results.get("total_screenshots", 0)
            
            # If we have users with screenshots, base pagination on screenshot count
            if total_users > 0 and total_screenshots > 0:
                total_pages = math.ceil(total_screenshots / page_size)
                has_next = page < total_pages
                has_previous = page > 1
                
                # If current page is beyond valid screenshot pages, return empty results
                if page > total_pages:
                    search_results["users"] = []
                    total_users = 0
            else:
                total_pages = 0
                has_next = False
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
                        "total_items": total_screenshots if total_screenshots > 0 else total_users,
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
                            "month_filter": search_results.get("validated_dates", {}).get("month_filter"),
                            "month_range": search_results.get("validated_dates", {}).get("month_range"),
                            "year_filter": search_results.get("validated_dates", {}).get("year_filter"),
                            "year_range": search_results.get("validated_dates", {}).get("year_range"),
                            "original_start_date": search_results.get("validated_dates", {}).get("original_start_date"),
                            "original_end_date": search_results.get("validated_dates", {}).get("original_end_date"),
                            "original_month_filter": search_results.get("validated_dates", {}).get("original_month_filter"),
                            "original_year_filter": search_results.get("validated_dates", {}).get("original_year_filter"),
                            "date_range_applied": bool(start_date or end_date),
                            "month_filter_applied": bool(month_filter),
                            "year_filter_applied": bool(year_filter),
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
                    "api_version": "2.2.0",
                    "bucket": self.bucket_name,
                    "search_type": "enhanced_with_screenshots_month_and_year_filters",
                    "features": ["pagination", "date_grouping", "screenshots", "month_wise", "date_range_filtering", "month_filtering", "year_filtering"]
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
    
    def _parse_month_filter(self, month_filter):
        """
        Parse and validate month filter parameter
        Expected format: YYYY-MM (e.g., 2025-09)
        Returns tuple: (start_date_of_month, end_date_of_month)
        """
        if not month_filter:
            return None, None
            
        try:
            # Validate format YYYY-MM
            if not re.match(r'^\d{4}-\d{2}$', month_filter):
                logger.warning(f"Invalid month filter format: {month_filter}. Expected YYYY-MM")
                return None, None
            
            year, month = month_filter.split('-')
            year = int(year)
            month = int(month)
            
            # Validate month range
            if month < 1 or month > 12:
                logger.warning(f"Invalid month: {month}. Must be 1-12")
                return None, None
            
            # Validate year range (reasonable limits)
            current_year = datetime.now().year
            if year < 2020 or year > current_year + 1:
                logger.warning(f"Invalid year: {year}. Must be between 2020 and {current_year + 1}")
                return None, None
            
            # Get first and last day of the month
            first_day = datetime(year, month, 1).date()
            
            # Get last day of the month
            last_day_num = calendar.monthrange(year, month)[1]
            last_day = datetime(year, month, last_day_num).date()
            
            # Don't allow future months - return None for invalid future months
            today = datetime.now().date()
            current_year_month = today.strftime('%Y-%m')
            
            if first_day > today:
                logger.warning(f"Month filter {month_filter} is in the future. Current month is {current_year_month}")
                # Return None to indicate invalid month, don't auto-adjust
                return None, None
            
            # If last_day is in the future, limit to today
            if last_day > today:
                last_day = today
            
            return first_day.strftime('%Y-%m-%d'), last_day.strftime('%Y-%m-%d')
            
        except ValueError as e:
            logger.error(f"Error parsing month filter {month_filter}: {str(e)}")
            return None, None
    
    def _parse_year_filter(self, year_filter):
        """
        Parse and validate year filter parameter
        Expected format: YYYY (e.g., 2025)
        Returns tuple: (start_date_of_year, end_date_of_year)
        """
        if not year_filter:
            return None, None
            
        try:
            # Validate format YYYY
            if not re.match(r'^\d{4}$', year_filter):
                logger.warning(f"Invalid year filter format: {year_filter}. Expected YYYY")
                return None, None
            
            year = int(year_filter)
            
            # Validate year range (reasonable limits)
            current_year = datetime.now().year
            if year < 2020 or year > current_year + 1:
                logger.warning(f"Invalid year: {year}. Must be between 2020 and {current_year + 1}")
                return None, None
            
            # Get first and last day of the year
            first_day = datetime(year, 1, 1).date()
            last_day = datetime(year, 12, 31).date()
            
            # Don't allow future years - return None for invalid future years
            today = datetime.now().date()
            current_year_str = today.strftime('%Y')
            
            if first_day > today:
                logger.warning(f"Year filter {year_filter} is in the future. Current year is {current_year_str}")
                # Return None to indicate invalid year, don't auto-adjust
                return None, None
            
            # If last_day is in the future, limit to today
            if last_day > today:
                last_day = today
            
            return first_day.strftime('%Y-%m-%d'), last_day.strftime('%Y-%m-%d')
            
        except ValueError as e:
            logger.error(f"Error parsing year filter {year_filter}: {str(e)}")
            return None, None
    
    def _search_users_with_screenshots(self, search_query, page, page_size, group_by, start_date='', end_date='', month_filter='', year_filter=''):
        """
        Enhanced search with detailed screenshots, date grouping, pagination, date range filtering, month filtering, and year filtering
        """
        start_time = datetime.now()
        
        try:
            users_data = {}
            objects_scanned = 0
            total_screenshots = 0
            
            # Parse month filter first (it can override start_date and end_date)
            month_start_date = None
            month_end_date = None
            month_range = None
            
            if month_filter:
                month_start_date, month_end_date = self._parse_month_filter(month_filter)
                if month_start_date and month_end_date:
                    month_range = f"{month_start_date} to {month_end_date}"
                    logger.info(f"Month filter applied: {month_filter} ({month_range})")
                    
                    # If month filter is provided, it takes precedence over start_date/end_date
                    if not start_date and not end_date:
                        start_date = month_start_date
                        end_date = month_end_date
                        logger.info(f"Using month filter as date range: {start_date} to {end_date}")
                else:
                    # Invalid month filter - return error response
                    today = datetime.now().date()
                    current_month = today.strftime('%Y-%m')
                    logger.error(f"Invalid month filter: {month_filter}. Current month is {current_month}")
                    return {
                        'users': [],
                        'total_count': 0,
                        'total_screenshots': 0,
                        'search_time_ms': 0,
                        'objects_scanned': 0,
                        'error': f"Invalid month filter: {month_filter}. Please use current or past months only. Current month: {current_month}",
                        'validated_dates': {
                            'start_date': None,
                            'end_date': None,
                            'month_filter': None,
                            'month_range': None,
                            'original_start_date': start_date if start_date else None,
                            'original_end_date': end_date if end_date else None,
                            'original_month_filter': month_filter,
                            'current_month': current_month,
                            'future_month_rejected': True
                        }
                    }
            
            # Parse year filter (can override start_date/end_date if no month filter)
            year_start_date = None
            year_end_date = None
            year_range = None
            
            if year_filter and not month_filter:  # Year filter only applies if no month filter
                year_start_date, year_end_date = self._parse_year_filter(year_filter)
                if year_start_date and year_end_date:
                    year_range = f"{year_start_date} to {year_end_date}"
                    logger.info(f"Year filter applied: {year_filter} ({year_range})")
                    
                    # If year filter is provided and no month filter, it takes precedence over start_date/end_date
                    if not start_date and not end_date:
                        start_date = year_start_date
                        end_date = year_end_date
                        logger.info(f"Using year filter as date range: {start_date} to {end_date}")
                else:
                    # Invalid year filter - return error response
                    today = datetime.now().date()
                    current_year = today.strftime('%Y')
                    logger.error(f"Invalid year filter: {year_filter}. Current year is {current_year}")
                    return {
                        'users': [],
                        'total_count': 0,
                        'total_screenshots': 0,
                        'search_time_ms': 0,
                        'objects_scanned': 0,
                        'error': f"Invalid year filter: {year_filter}. Please use current or past years only. Current year: {current_year}",
                        'validated_dates': {
                            'start_date': None,
                            'end_date': None,
                            'year_filter': None,
                            'year_range': None,
                            'original_start_date': start_date if start_date else None,
                            'original_end_date': end_date if end_date else None,
                            'original_year_filter': year_filter,
                            'current_year': current_year,
                            'future_year_rejected': True
                        }
                    }
            
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
                                        # Apply date range filtering (including month filter)
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
            
            # Convert to list and apply intelligent ranking
            all_users = list(users_data.values())
            total_users = len(all_users)
            
            # Apply intelligent search ranking to all users
            if search_query and all_users:
                # Create user objects for intelligent search
                user_objects = []
                for user_data in all_users:
                    user_obj = {
                        'email': user_data['email'],
                        'display_name': user_data['display_name'],
                        'original_name': user_data['original_name']
                    }
                    user_objects.append(user_obj)
                
                # Get intelligent search results with scoring
                ranked_results = intelligent_search.search(search_query, user_objects, max_results=len(user_objects))
                
                # Create a mapping of email to search score and match reasons
                score_mapping = {}
                for result in ranked_results:
                    score_mapping[result['email']] = {
                        'score': result['search_score'],
                        'match_reasons': result['match_reasons']
                    }
                
                # Sort original users based on intelligent search scores
                def get_sort_key(user_data):
                    email = user_data['email']
                    if email in score_mapping:
                        return score_mapping[email]['score']
                    return 0
                
                all_users.sort(key=get_sort_key, reverse=True)
                
                # Add search metadata to users
                for user_data in all_users:
                    email = user_data['email']
                    if email in score_mapping:
                        user_data['search_score'] = score_mapping[email]['score']
                        user_data['match_reasons'] = score_mapping[email]['match_reasons']
                    else:
                        user_data['search_score'] = 0
                        user_data['match_reasons'] = ['Basic match']
            
            # Format users with screenshots (applying pagination to screenshots within each user)
            formatted_users = []
            for user_data in all_users:
                formatted_user = self._format_user_with_screenshots(user_data, group_by, page_size, page)
                if search_query and 'search_score' in user_data:
                    formatted_user['search_score'] = user_data['search_score']
                    formatted_user['match_reasons'] = user_data['match_reasons']
                formatted_users.append(formatted_user)
            
            # Calculate search time
            search_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Generate search suggestions based on query and available users
            search_suggestions = []
            if search_query and len(all_users) > 0:
                # Get all available users for suggestions
                all_available_users = self._get_all_users_preview()
                search_suggestions = intelligent_search.generate_suggestions(search_query, all_available_users)
            
            result = {
                'users': formatted_users,
                'total_count': total_users,
                'total_screenshots': total_screenshots,
                'search_time_ms': round(search_time, 2),
                'objects_scanned': objects_scanned,
                'search_metadata': {
                    'query': search_query,
                    'intelligent_search_enabled': True,
                    'ranking_applied': bool(search_query),
                    'suggestions': search_suggestions[:5] if search_suggestions else []
                },
                'validated_dates': {
                    'start_date': start_date_obj.strftime('%Y-%m-%d') if start_date_obj else None,
                    'end_date': end_date_obj.strftime('%Y-%m-%d') if end_date_obj else None,
                    'month_filter': month_filter if month_filter and month_start_date and month_end_date else None,
                    'month_range': month_range,
                    'year_filter': year_filter if year_filter and year_start_date and year_end_date else None,
                    'year_range': year_range,
                    'original_start_date': start_date if start_date else None,
                    'original_end_date': end_date if end_date else None,
                    'original_month_filter': month_filter if month_filter else None,
                    'original_year_filter': year_filter if year_filter else None
                }
            }
            
            return result
            
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
                
                # Create screenshot URL
                screenshot_url = f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"
                
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
                    'screenshot_url': screenshot_url
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
        """Extract user information from S3 key - Enhanced to find all users"""
        try:
            parts = key.split('/')
            
            # Look for email patterns in any part (don't filter by search_term yet)
            for part in parts:
                if '_at_' in part or '@' in part:
                    # Convert from folder name to email
                    if '_at_' in part:
                        email = part.replace('_at_', '@')
                        # Extract display name better
                        if '_at_gmail.com' in part:
                            display_name = part.replace('_at_gmail.com', '').replace('_', ' ')
                        elif '_at_dxdglobal.com' in part:
                            display_name = part.replace('_at_dxdglobal.com', '').replace('_', ' ')
                        else:
                            display_name = part.split('_at_')[0].replace('_', ' ')
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
        """Enhanced search matching using intelligent search engine"""
        if not user_info or not search_term:
            return False
        
        # Use intelligent search engine for scoring
        score = intelligent_search._calculate_user_score(search_term, user_info)
        
        logger.debug(f"User {user_info['email']} scored {score} for search '{search_term}'")
        
        # Lower threshold for better matching, especially for single character searches
        threshold = 20 if len(search_term) == 1 else 50
        return score > threshold
    
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
    
    def _get_all_users_preview(self):
        """Get a preview of all users for generating suggestions"""
        try:
            users = []
            
            # Quick scan of S3 to get user emails
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='users_screenshots/',
                Delimiter='/',
                PaginationConfig={'MaxItems': 100}  # Limit for performance
            )
            
            for page_data in pages:
                if 'CommonPrefixes' in page_data:
                    for prefix in page_data['CommonPrefixes']:
                        folder_path = prefix['Prefix']
                        parts = folder_path.split('/')
                        if len(parts) >= 3:
                            user_part = parts[2]  # users_screenshots/date/user/
                            if '@' in user_part or '_at_' in user_part:
                                if '_at_' in user_part:
                                    email = user_part.replace('_at_', '@')
                                    display_name = user_part.replace('_at_dxdglobal.com', '').replace('_', ' ')
                                else:
                                    email = user_part
                                    display_name = user_part.split('@')[0] if '@' in user_part else user_part
                                
                                users.append({
                                    'email': email,
                                    'display_name': display_name,
                                    'original_name': user_part
                                })
            
            return users
            
        except Exception as e:
            logger.error(f"Error getting users preview: {str(e)}")
            return []
