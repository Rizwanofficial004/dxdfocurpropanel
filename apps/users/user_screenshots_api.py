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
    GET /api/users/screenshots/?q=user_email&view_mode=day&year=2025&month=10&day=6&page_size=200&offset=0
    
    Returns screenshots for a specific user with pagination and date filtering
    Supports view_mode for enhanced date filtering (day, month, year)
    Default page size: 25, Maximum: 500
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
        GET /api/users/screenshots/?q=user_email&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&offset=0&limit=50&load_more=true
        GET /api/users/screenshots/?q=user_email&view_mode=day&year=2025&month=10&day=6&page_size=200&offset=0
        
        Fetch screenshots for a specific user with pagination and date filtering
        
        Parameters:
        - q: User email (required)
        - start_date, end_date: Date range in YYYY-MM-DD format
        - view_mode: 'day', 'month', or 'year' (use with year/month/day parameters)
        - year: Specific year (use with view_mode)
        - month: Specific month (use with view_mode=day or view_mode=month)
        - day: Specific day (use with view_mode=day)
        - page, page_size: Traditional pagination
        - offset, limit, load_more: Load more pagination
        
        Supports two pagination modes:
        1. Traditional pagination: page + page_size (default)
        2. Load more pagination: offset + limit + load_more=true
        
        Default page size: 50, Maximum: 500
        Enhanced to handle .webp files and multiple date formats
        """
        try:
            # Parse parameters
            user_query = request.GET.get('q', '').strip()
            start_date = request.GET.get('start_date', '').strip()
            end_date = request.GET.get('end_date', '').strip()
            
            # New parameters for enhanced date filtering
            view_mode = request.GET.get('view_mode', '').strip().lower()
            year = request.GET.get('year', '').strip()
            month = request.GET.get('month', '').strip()
            day = request.GET.get('day', '').strip()
            
            # Check if load_more mode is requested
            load_more_mode = request.GET.get('load_more', '').lower() in ['true', '1', 'yes']
            
            if load_more_mode:
                # Load more pagination using offset + limit
                try:
                    offset = int(request.GET.get('offset', 0))
                    if offset < 0:
                        offset = 0
                except (ValueError, TypeError):
                    offset = 0
                    
                try:
                    limit = int(request.GET.get('limit', 50))
                    if limit < 10:  # Minimum 10 for load more
                        limit = 10
                    elif limit > 200:  # Maximum 200 for load more (smaller chunks)
                        limit = 200
                except (ValueError, TypeError):
                    limit = 50
                    
                page = None  # Not used in load more mode
                page_size = limit
            else:
                # Traditional page-based pagination
                try:
                    page = int(request.GET.get('page', 1))
                    if page < 1:
                        page = 1
                except (ValueError, TypeError):
                    page = 1
                    
                try:
                    page_size = int(request.GET.get('page_size', 50))
                    if page_size < 10:  # Minimum 10
                        page_size = 10
                    elif page_size > 500:  # Maximum 500 (increased to support larger requests)
                        page_size = 500
                except (ValueError, TypeError):
                    page_size = 50
                    
                offset = (page - 1) * page_size
            
            if load_more_mode:
                logger.info(f"UserScreenshots API (Load More) - Query: {user_query}, View mode: {view_mode}, Year: {year}, Month: {month}, Day: {day}, Date range: {start_date} to {end_date}, Offset: {offset}, Limit: {limit}")
            else:
                logger.info(f"UserScreenshots API (Pagination) - Query: {user_query}, View mode: {view_mode}, Year: {year}, Month: {month}, Day: {day}, Date range: {start_date} to {end_date}, Page: {page}, Page size: {page_size}")
            
            # Debug AWS configuration
            logger.info(f"AWS Config - Bucket: {self.bucket_name}, Region: {self.aws_config['region']}")
            logger.info(f"AWS Access Key configured: {'Yes' if self.aws_config['access_key'] else 'No'}")
            
            if not user_query:
                return Response({
                    "status": "error",
                    "message": "User email parameter 'q' is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Normalize user email format (handle @ vs _at_ conversion)
            normalized_user = user_query.replace('@', '_at_').lower()
            
            # Enhanced date filtering with view_mode support
            date_filter = self._parse_enhanced_date_filter(start_date, end_date, view_mode, year, month, day)
            
            # Search for user screenshots with appropriate pagination method
            if load_more_mode:
                screenshots_data = self._search_user_screenshots_load_more(normalized_user, date_filter, offset, limit)
            else:
                screenshots_data = self._search_user_screenshots_date_wise(normalized_user, date_filter, page, page_size)
            
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
    
    def _parse_enhanced_date_filter(self, start_date, end_date, view_mode, year, month, day):
        """Enhanced date filtering with view_mode support"""
        date_filter = {
            'start_date': None,
            'end_date': None,
            'start_datetime': None,
            'end_datetime': None,
            'view_mode': view_mode,
            'specific_year': year,
            'specific_month': month,
            'specific_day': day
        }
        
        # Handle view_mode with year, month, day parameters
        if view_mode and year:
            try:
                year_int = int(year)
                
                if view_mode == 'day' and month and day:
                    # Specific day view
                    month_int = int(month)
                    day_int = int(day)
                    
                    # Create start and end datetime for the specific day
                    start_dt = datetime(year_int, month_int, day_int, 0, 0, 0)
                    end_dt = datetime(year_int, month_int, day_int, 23, 59, 59)
                    
                    date_filter['start_date'] = start_dt.strftime('%Y-%m-%d')
                    date_filter['end_date'] = end_dt.strftime('%Y-%m-%d')
                    date_filter['start_datetime'] = start_dt
                    date_filter['end_datetime'] = end_dt
                    
                    logger.info(f"Day view mode: {date_filter['start_date']} (full day)")
                    
                elif view_mode == 'month' and month:
                    # Specific month view
                    month_int = int(month)
                    
                    # Create start and end datetime for the specific month
                    start_dt = datetime(year_int, month_int, 1, 0, 0, 0)
                    
                    # Calculate last day of month
                    if month_int == 12:
                        end_dt = datetime(year_int + 1, 1, 1) - timedelta(days=1)
                    else:
                        end_dt = datetime(year_int, month_int + 1, 1) - timedelta(days=1)
                    end_dt = end_dt.replace(hour=23, minute=59, second=59)
                    
                    date_filter['start_date'] = start_dt.strftime('%Y-%m-%d')
                    date_filter['end_date'] = end_dt.strftime('%Y-%m-%d')
                    date_filter['start_datetime'] = start_dt
                    date_filter['end_datetime'] = end_dt
                    
                    logger.info(f"Month view mode: {date_filter['start_date']} to {date_filter['end_date']}")
                    
                elif view_mode == 'year':
                    # Specific year view
                    start_dt = datetime(year_int, 1, 1, 0, 0, 0)
                    end_dt = datetime(year_int, 12, 31, 23, 59, 59)
                    
                    date_filter['start_date'] = start_dt.strftime('%Y-%m-%d')
                    date_filter['end_date'] = end_dt.strftime('%Y-%m-%d')
                    date_filter['start_datetime'] = start_dt
                    date_filter['end_datetime'] = end_dt
                    
                    logger.info(f"Year view mode: {date_filter['start_date']} to {date_filter['end_date']}")
                    
            except (ValueError, TypeError) as e:
                logger.warning(f"Invalid date parameters for view_mode: {e}")
                # Fall back to traditional date parsing
        
        # If view_mode parsing didn't work, fall back to traditional start_date/end_date parsing
        if not date_filter['start_date'] and not date_filter['end_date']:
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
    
    def _search_user_screenshots_date_wise(self, normalized_user, date_filter, page, page_size):
        """Search for screenshots - Date-wise scanning prioritizing recent dates"""
        try:
            logger.info(f"Date-wise search for user: {normalized_user}, page: {page}, size: {page_size}")
            logger.info(f"Date filter: {date_filter['start_date']} to {date_filter['end_date']}")
            
            # Set flag for deeper scanning when date filters are provided
            self._has_date_filter = bool(date_filter['start_date'] or date_filter['end_date'])
            
            # STEP 1: Generate date range to scan (today backwards)
            scan_dates = self._generate_scan_dates(date_filter)
            logger.info(f"Will scan {len(scan_dates)} dates starting from most recent")
            
            # STEP 2: Fetch screenshots date-wise with pagination
            screenshots, total_found = self._fetch_screenshots_date_wise(
                normalized_user, scan_dates, page, page_size
            )
            
            logger.info(f"Fetched {len(screenshots)} screenshots for page {page}")
            
            # STEP 3: Calculate pagination info
            total_pages = math.ceil(total_found / page_size) if total_found > 0 else 1
            has_next = page < total_pages
            has_previous = page > 1
            
            # Generate project folder statistics
            project_stats = self._generate_project_stats(screenshots)
            
            return {
                "status": "success",
                "message": f"Retrieved {len(screenshots)} screenshots for page {page}",
                "data": {
                    "user": {
                        "email": normalized_user.replace('_at_', '@'),
                        "normalized_email": normalized_user
                    },
                    "date_range": {
                        "start_date": date_filter['start_date'],
                        "end_date": date_filter['end_date'],
                        "view_mode": date_filter.get('view_mode'),
                        "specific_year": date_filter.get('specific_year'),
                        "specific_month": date_filter.get('specific_month'),
                        "specific_day": date_filter.get('specific_day')
                    },
                    "project_folders": project_stats,
                    "pagination": {
                        "page": page,
                        "page_size": page_size,
                        "total_pages": total_pages,
                        "total_screenshots": total_found,
                        "returned_count": len(screenshots),
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None,
                        "showing": f"Page {page} of {total_pages} ({len(screenshots)} items)"
                    },
                    "screenshots": screenshots,
                    "data_source": "S3 (Date-wise scanning from recent dates)"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in date-wise search: {str(e)}")
            return self._empty_response_page(normalized_user, date_filter, page, page_size)
    
    def _generate_scan_dates(self, date_filter):
        """Generate list of dates to scan, prioritizing recent dates"""
        today = datetime.now().date()
        scan_dates = []
        
        if date_filter['start_date'] and date_filter['end_date']:
            # Use provided date range but limit to reasonable size
            start_date = date_filter['start_datetime'].date()
            end_date = date_filter['end_datetime'].date()
            
            # Limit date range to maximum 30 days for performance
            days_diff = (end_date - start_date).days
            if days_diff > 30:
                end_date = start_date + timedelta(days=30)
                logger.info(f"Limited date range to 30 days for performance: {start_date} to {end_date}")
        else:
            # Default: scan only last 7 days for much better performance
            end_date = today
            start_date = today - timedelta(days=7)
        
        # Generate dates from most recent to oldest
        current_date = end_date
        while current_date >= start_date:
            scan_dates.append(current_date.strftime('%Y-%m-%d'))
            current_date -= timedelta(days=1)
        
        logger.info(f"Generated {len(scan_dates)} dates to scan, from {scan_dates[0]} to {scan_dates[-1]}")
        return scan_dates
    
    def _fetch_screenshots_date_wise(self, normalized_user, scan_dates, page, page_size):
        """Fetch screenshots by scanning dates from recent to old with smart pagination"""
        all_screenshots = []
        total_found = 0
        
        try:
            # Calculate how many we need for this page
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            needed_for_page = end_index
            
            # Scan each date starting from most recent
            for i, date_str in enumerate(scan_dates):
                date_screenshots = self._scan_single_date(normalized_user, date_str)
                all_screenshots.extend(date_screenshots)
                
                if len(date_screenshots) > 0:
                    logger.info(f"Found {len(date_screenshots)} screenshots for date {date_str}")
                
                # Smart early exit: if we have enough for current page + some buffer, stop scanning
                if len(all_screenshots) >= needed_for_page + 50:  # 50 item buffer
                    logger.info(f"Early exit: Found {len(all_screenshots)} screenshots, enough for page {page}")
                    break
                    
                # Also exit if we've scanned too many dates without finding much
                if i >= 10 and len(all_screenshots) < 10:  # If 10 days scanned but < 10 screenshots
                    logger.info(f"Early exit: Scanned {i+1} dates but only found {len(all_screenshots)} screenshots")
                    break
            
            # Sort by date and time (newest first)
            all_screenshots.sort(key=lambda x: x.get('last_modified', ''), reverse=True)
            total_found = len(all_screenshots)
            
            # Apply pagination
            page_screenshots = all_screenshots[start_index:end_index]
            
            logger.info(f"Date-wise scan complete: {total_found} total, returning {len(page_screenshots)} for page {page}")
            return page_screenshots, total_found
            
        except Exception as e:
            logger.error(f"Error in date-wise fetch: {str(e)}")
            return [], 0
    
    def _scan_single_date(self, normalized_user, date_str):
        """Scan screenshots for a single date efficiently with limits"""
        screenshots = []
        
        try:
            # Scan users_screenshots folder for this date
            prefix = f'users_screenshots/{date_str}/'
            
            # Determine scanning limits based on whether date filter is applied
            has_date_filter = hasattr(self, '_has_date_filter') and self._has_date_filter
            max_items = 5000 if has_date_filter else 1000
            
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=prefix,
                PaginationConfig={
                    'PageSize': 100,
                    'MaxItems': max_items  # Higher limit for date-filtered requests
                }
            )
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith('.webp'):
                            key_parts = obj['Key'].split('/')
                            if len(key_parts) >= 4:
                                user_email = key_parts[2]
                                
                                # Check if this matches our user
                                if self._user_matches(normalized_user, user_email):
                                    filename = key_parts[-1]
                                    project_folder = self._extract_project_folder(obj['Key'])
                                    
                                    screenshot_info = {
                                        'filename': filename,
                                        'date': date_str,
                                        'user_email': user_email,
                                        'folder_structure': 'users_screenshots',
                                        'project_folder': project_folder,
                                        'file_key': obj['Key'],
                                        'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                        'last_modified': obj['LastModified'].isoformat(),
                                        'screenshot_url': self._generate_signed_url(obj['Key'])
                                    }
                                    screenshots.append(screenshot_info)
                                    
                                    # Dynamic limit based on whether date filter is applied
                                    has_date_filter = hasattr(self, '_has_date_filter') and self._has_date_filter
                                    limit = 2000 if has_date_filter else 500
                                    
                                    if len(screenshots) >= limit:
                                        logger.info(f"Hit {limit} screenshot limit for date {date_str} (date filter: {has_date_filter})")
                                        return screenshots
            
        except Exception as e:
            logger.error(f"Error scanning date {date_str}: {str(e)}")
        
        return screenshots
    
    def _user_matches(self, normalized_user, user_email):
        """Check if user email matches (handle both @ and _at_ formats)"""
        return (
            normalized_user.lower() == user_email.lower() or
            normalized_user.lower() in user_email.lower() or
            user_email.lower() in normalized_user.lower()
        )
    
    def _search_user_screenshots_load_more(self, normalized_user, date_filter, offset, limit):
        """Search for screenshots - Load more pagination with offset-based approach"""
        try:
            logger.info(f"Load more search for user: {normalized_user}, offset: {offset}, limit: {limit}")
            logger.info(f"Date filter: {date_filter['start_date']} to {date_filter['end_date']}")
            
            # Set flag for deeper scanning when date filters are provided
            self._has_date_filter = bool(date_filter['start_date'] or date_filter['end_date'])
            
            # STEP 1: Generate date range to scan (today backwards)
            scan_dates = self._generate_scan_dates(date_filter)
            logger.info(f"Will scan {len(scan_dates)} dates starting from most recent")
            
            # STEP 2: Fetch screenshots with offset-based pagination
            screenshots, total_found, has_more = self._fetch_screenshots_load_more(
                normalized_user, scan_dates, offset, limit
            )
            
            logger.info(f"Load more fetch: {len(screenshots)} screenshots returned, total found: {total_found}, has_more: {has_more}")
            
            # Generate project folder statistics
            project_stats = self._generate_project_stats(screenshots)
            
            # Calculate next offset for load more
            next_offset = offset + len(screenshots) if has_more else None
            
            return {
                "status": "success",
                "message": f"Retrieved {len(screenshots)} screenshots starting from offset {offset}",
                "data": {
                    "user": {
                        "email": normalized_user.replace('_at_', '@'),
                        "normalized_email": normalized_user
                    },
                    "date_range": {
                        "start_date": date_filter['start_date'],
                        "end_date": date_filter['end_date'],
                        "view_mode": date_filter.get('view_mode'),
                        "specific_year": date_filter.get('specific_year'),
                        "specific_month": date_filter.get('specific_month'),
                        "specific_day": date_filter.get('specific_day')
                    },
                    "project_folders": project_stats,
                    "load_more": {
                        "offset": offset,
                        "limit": limit,
                        "returned_count": len(screenshots),
                        "has_more": has_more,
                        "next_offset": next_offset,
                        "total_found": total_found,
                        "showing": f"Items {offset + 1}-{offset + len(screenshots)} of {total_found if not has_more else 'many'}"
                    },
                    "screenshots": screenshots,
                    "data_source": "S3 (Load more with offset-based pagination)"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in load more search: {str(e)}")
            return self._empty_response_load_more(normalized_user, date_filter, offset, limit)
    
    def _fetch_screenshots_load_more(self, normalized_user, scan_dates, offset, limit):
        """Fetch screenshots using offset-based pagination for load more functionality"""
        all_screenshots = []
        total_skipped = 0
        
        try:
            # Calculate target: skip 'offset' items, then collect 'limit' items
            target_skip = offset
            target_collect = limit
            collected = 0
            
            # Scan each date starting from most recent
            for i, date_str in enumerate(scan_dates):
                if collected >= target_collect:
                    break
                    
                date_screenshots = self._scan_single_date(normalized_user, date_str)
                
                if len(date_screenshots) > 0:
                    logger.info(f"Found {len(date_screenshots)} screenshots for date {date_str}")
                
                # Sort this date's screenshots by time (newest first)
                date_screenshots.sort(key=lambda x: x.get('last_modified', ''), reverse=True)
                
                # Process each screenshot for offset/limit logic
                for screenshot in date_screenshots:
                    if total_skipped < target_skip:
                        # Still skipping items to reach offset
                        total_skipped += 1
                    elif collected < target_collect:
                        # Collecting items for this batch
                        all_screenshots.append(screenshot)
                        collected += 1
                    else:
                        # We have enough items for this batch
                        break
                
                # Early exit if we've collected enough
                if collected >= target_collect:
                    break
                    
                # Also exit if we've scanned too many dates without finding much
                if i >= 15 and len(all_screenshots) == 0:  # If 15 days scanned but no results
                    logger.info(f"Early exit: Scanned {i+1} dates but found no matching screenshots")
                    break
            
            # Check if there are more items available
            has_more = False
            if collected == target_collect:
                # Try to fetch one more item to see if there are more
                remaining_dates = scan_dates[i:]
                for date_str in remaining_dates:
                    date_screenshots = self._scan_single_date(normalized_user, date_str)
                    if date_screenshots:
                        # Check if we can find at least one more item beyond our current collection
                        for screenshot in date_screenshots:
                            if total_skipped + collected < offset + limit + 1:
                                has_more = True
                                break
                        if has_more:
                            break
            
            total_found = total_skipped + collected
            
            logger.info(f"Load more fetch complete: skipped {total_skipped}, collected {collected}, has_more: {has_more}")
            return all_screenshots, total_found, has_more
            
        except Exception as e:
            logger.error(f"Error in load more fetch: {str(e)}")
            return [], 0, False
    
    def _empty_response_load_more(self, normalized_user, date_filter, offset, limit):
        """Return empty response for load more pagination"""
        return {
            "status": "success",
            "message": f"No more screenshots found for user {normalized_user} at offset {offset}",
            "data": {
                "user": {
                    "email": normalized_user.replace('_at_', '@'),
                    "normalized_email": normalized_user
                },
                "date_range": {
                    "start_date": date_filter['start_date'],
                    "end_date": date_filter['end_date']
                },
                "project_folders": {"total_projects": 0, "projects": []},
                "load_more": {
                    "offset": offset,
                    "limit": limit,
                    "returned_count": 0,
                    "has_more": False,
                    "next_offset": None,
                    "total_found": offset,
                    "showing": f"No items found at offset {offset}"
                },
                "screenshots": [],
                "data_source": "S3 (No more data available)"
            }
        }
    
    def _extract_date_from_path_enhanced(self, key_parts):
        """Enhanced date extraction including Turkish month names"""
        # Turkish month mapping
        turkish_months = {
            'ocak': '01', 'şubat': '02', 'mart': '03', 'nisan': '04',
            'mayıs': '05', 'haziran': '06', 'temmuz': '07', 'ağustos': '08',
            'eylül': '09', 'ekim': '10', 'kasım': '11', 'aralık': '12'
        }
        
        # First try the original date extraction
        original_date = self._extract_date_from_path(key_parts)
        if original_date:
            return original_date
        
        # Try to extract from folder names with Turkish months
        for part in key_parts:
            part_lower = part.lower()
            
            # Look for patterns like "DDS_Ağustos_2025" or "2025_Ağustos"
            for turkish_month, month_num in turkish_months.items():
                if turkish_month in part_lower:
                    # Try to find year in the same part
                    year_match = re.search(r'(\d{4})', part)
                    if year_match:
                        year = year_match.group(1)
                        return f"{year}-{month_num}-01"  # Use first day of month
        
        # If no date found, try to extract from filename again
        filename = key_parts[-1] if key_parts else ""
        
        # Handle .webp files with timestamp format
        if filename.endswith('.webp'):
            webp_match = re.match(r'^(\d{4}-\d{2}-\d{2})_', filename)
            if webp_match:
                return webp_match.group(1)
        
        return None
    
    def _empty_response_page(self, normalized_user, date_filter, page, page_size):
        """Return empty response for page-based pagination"""
        return {
            "status": "success",
            "message": f"No screenshots found for user {normalized_user} on page {page}",
            "data": {
                "user": {
                    "email": normalized_user.replace('_at_', '@'),
                    "normalized_email": normalized_user
                },
                "date_range": {
                    "start_date": date_filter['start_date'],
                    "end_date": date_filter['end_date']
                },
                "project_folders": {"total_projects": 0, "projects": []},
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_pages": 0,
                    "total_screenshots": 0,
                    "returned_count": 0,
                    "has_next": False,
                    "has_previous": False,
                    "next_page": None,
                    "previous_page": None,
                    "showing": f"No items found on page {page}"
                },
                "screenshots": [],
                "data_source": "S3 (No matching data found)"
            }
        }
    
    # Old offset-based methods removed - now using date-wise scanning
    
    def _fetch_from_screenshots_offset(self, normalized_user, date_filter, offset, page_size):
        """Fast fetch from screenshots folder with offset support"""
        screenshots = []
        processed = 0
        collected = 0
        
        try:
            # Search ALL folders under the user (not just specific August folder)
            user_prefix = f'screenshots/{normalized_user}/'
            logger.info(f"Offset fetch: searching user folder: {user_prefix}")
            
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                PaginationConfig={'PageSize': 200}
            )
            
            for page in page_iterator:
                if collected >= page_size:
                    break
                    
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith(('.webp', '.png', '.jpg', '.jpeg')):
                            key_parts = obj['Key'].split('/')
                            if len(key_parts) >= 3:
                                screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                if self._is_date_in_range(screenshot_date, date_filter):
                                    if processed >= offset:
                                        # This is a screenshot we want
                                        project_folder = self._extract_project_folder(obj['Key'])
                                        filename = key_parts[-1]
                                        user_email = key_parts[1]
                                        
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
                                        screenshots.append(screenshot_info)
                                        collected += 1
                                        
                                        if collected >= page_size:
                                            break
                                    
                                    processed += 1
                        
        except Exception as e:
            logger.error(f"Error in offset screenshots fetch: {str(e)}")
        
        logger.info(f"Offset screenshots fetch: processed {processed}, collected {collected}")
        return screenshots
    
    def _fetch_from_users_screenshots_offset(self, normalized_user, date_filter, offset, page_size, current_count):
        """Fast fetch from users_screenshots folder with offset"""
        screenshots = []
        processed = 0
        collected = 0
        
        try:
            # Search efficiently by date if we have date filter
            if date_filter['start_date'] and date_filter['end_date']:
                start_date = date_filter['start_datetime']
                end_date = date_filter['end_datetime']
                current_date = start_date
                search_prefixes = []
                
                while current_date <= end_date:
                    date_str = current_date.strftime('%Y-%m-%d')
                    search_prefixes.append(f'users_screenshots/{date_str}/')
                    current_date += timedelta(days=1)
                
                if len(search_prefixes) > 31:
                    search_prefixes = ['users_screenshots/']
            else:
                search_prefixes = ['users_screenshots/']
            
            for prefix in search_prefixes:
                if collected >= page_size:
                    break
                    
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    PaginationConfig={'PageSize': 100}
                )
                
                for page in page_iterator:
                    if collected >= page_size:
                        break
                        
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith('.webp'):
                                key_parts = obj['Key'].split('/')
                                if len(key_parts) >= 4:
                                    user_email = key_parts[2]
                                    if self._user_matches(normalized_user, user_email):
                                        screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                        if self._is_date_in_range(screenshot_date, date_filter):
                                            if processed >= offset:
                                                # This is a screenshot we want
                                                project_folder = self._extract_project_folder(obj['Key'])
                                                filename = key_parts[-1]
                                                
                                                screenshot_info = {
                                                    'filename': filename,
                                                    'date': screenshot_date,
                                                    'user_email': user_email,
                                                    'folder_structure': 'users_screenshots',
                                                    'project_folder': project_folder,
                                                    'file_key': obj['Key'],
                                                    'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                                    'last_modified': obj['LastModified'].isoformat(),
                                                    'screenshot_url': self._generate_signed_url(obj['Key'])
                                                }
                                                screenshots.append(screenshot_info)
                                                collected += 1
                                                
                                                if collected >= page_size:
                                                    break
                                            
                                            processed += 1
        except Exception as e:
            logger.error(f"Error in offset users_screenshots fetch: {str(e)}")
        
        return screenshots
    
    def _empty_response_page(self, normalized_user, date_filter, page, page_size):
        """Return empty response for page-based pagination"""
        return {
            "status": "success",
            "message": f"No screenshots found for user {normalized_user} on page {page}",
            "data": {
                "user": {
                    "email": normalized_user.replace('_at_', '@'),
                    "normalized_email": normalized_user
                },
                "date_range": {
                    "start_date": date_filter['start_date'],
                    "end_date": date_filter['end_date']
                },
                "project_folders": {"total_projects": 0, "projects": []},
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_pages": 0,
                    "total_screenshots": 0,
                    "returned_count": 0,
                    "has_next": False,
                    "has_previous": False,
                    "next_page": None,
                    "previous_page": None,
                    "showing": f"No items found on page {page}"
                },
                "screenshots": [],
                "data_source": "S3 (No matching data found)"
            }
        }
        """Fetch ONLY the screenshots needed for current page - FAST"""
        screenshots = []
        
        try:
            # Calculate skip amount for pagination
            skip_count = (page - 1) * page_size
            target_count = page_size
            
            logger.info(f"Fast fetch: skipping {skip_count}, fetching {target_count}")
            
            # Search in both folders but stop when we have enough
            current_count = 0
            processed_count = 0
            
            # Try users_screenshots folder first
            if current_count < target_count:
                users_screenshots = self._fetch_from_users_screenshots_fast(
                    normalized_user, date_filter, skip_count, target_count, current_count
                )
                screenshots.extend(users_screenshots)
                current_count = len(screenshots)
                logger.info(f"Got {len(users_screenshots)} from users_screenshots folder")
            
            # Try screenshots folder if we need more
            if current_count < target_count:
                remaining_skip = max(0, skip_count - current_count)
                remaining_needed = target_count - current_count
                
                screenshots_folder = self._fetch_from_screenshots_fast(
                    normalized_user, date_filter, remaining_skip, remaining_needed
                )
                screenshots.extend(screenshots_folder)
                logger.info(f"Got {len(screenshots_folder)} from screenshots folder")
            
            # Remove duplicates quickly
            unique_screenshots = []
            seen = set()
            for screenshot in screenshots:
                key = (screenshot.get('filename'), screenshot.get('date'))
                if key not in seen and len(unique_screenshots) < target_count:
                    seen.add(key)
                    unique_screenshots.append(screenshot)
            
            # Sort by date (newest first)
            unique_screenshots.sort(key=lambda x: x.get('last_modified', ''), reverse=True)
            
            return unique_screenshots[:target_count]
            
        except Exception as e:
            logger.error(f"Error in fast fetch: {str(e)}")
            return []
    
    def _fetch_from_users_screenshots_fast(self, normalized_user, date_filter, skip_count, target_count, current_count):
        """Fast fetch from users_screenshots folder"""
        screenshots = []
        processed = 0
        collected = 0
        
        try:
            # Search efficiently by date if we have date filter
            if date_filter['start_date'] and date_filter['end_date']:
                start_date = date_filter['start_datetime']
                end_date = date_filter['end_datetime']
                current_date = start_date
                search_prefixes = []
                
                while current_date <= end_date:
                    date_str = current_date.strftime('%Y-%m-%d')
                    search_prefixes.append(f'users_screenshots/{date_str}/')
                    current_date += timedelta(days=1)
                
                if len(search_prefixes) > 31:
                    search_prefixes = ['users_screenshots/']
            else:
                search_prefixes = ['users_screenshots/']
            
            for prefix in search_prefixes:
                if collected >= target_count:
                    break
                    
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    PaginationConfig={'PageSize': 100}
                )
                
                for page in page_iterator:
                    if collected >= target_count:
                        break
                        
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith('.webp'):
                                key_parts = obj['Key'].split('/')
                                if len(key_parts) >= 4:
                                    user_email = key_parts[2]
                                    if self._user_matches(normalized_user, user_email):
                                        screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                        if self._is_date_in_range(screenshot_date, date_filter):
                                            if processed >= skip_count:
                                                # This is a screenshot we want
                                                project_folder = self._extract_project_folder(obj['Key'])
                                                filename = key_parts[-1]
                                                
                                                screenshot_info = {
                                                    'filename': filename,
                                                    'date': screenshot_date,
                                                    'user_email': user_email,
                                                    'folder_structure': 'users_screenshots',
                                                    'project_folder': project_folder,
                                                    'file_key': obj['Key'],
                                                    'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                                    'last_modified': obj['LastModified'].isoformat(),
                                                    'screenshot_url': self._generate_signed_url(obj['Key'])
                                                }
                                                screenshots.append(screenshot_info)
                                                collected += 1
                                                
                                                if collected >= target_count:
                                                    break
                                            
                                            processed += 1
        except Exception as e:
            logger.error(f"Error in fast users_screenshots fetch: {str(e)}")
        
        return screenshots
    
    def _fetch_from_screenshots_fast(self, normalized_user, date_filter, skip_count, target_count):
        """Fast fetch from screenshots folder with specific focus on August folder"""
        screenshots = []
        processed = 0
        collected = 0
        
        try:
            # If looking for August, go directly to the August folder we found
            if (date_filter.get('start_date', '').startswith('2025-08') or 
                date_filter.get('end_date', '').startswith('2025-08')):
                
                august_prefix = f'screenshots/{normalized_user}/DDS_Ağustos_2025_Sanal_Asistanlık_Süreci/'
                logger.info(f"Fast fetch: targeting August folder directly: {august_prefix}")
                
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=august_prefix,
                    PaginationConfig={'PageSize': 200}
                )
                
                for page in page_iterator:
                    if collected >= target_count:
                        break
                        
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith(('.webp', '.png', '.jpg', '.jpeg')):
                                key_parts = obj['Key'].split('/')
                                if len(key_parts) >= 3:
                                    screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                    if self._is_date_in_range(screenshot_date, date_filter):
                                        if processed >= skip_count:
                                            # This is a screenshot we want
                                            project_folder = self._extract_project_folder(obj['Key'])
                                            filename = key_parts[-1]
                                            user_email = key_parts[1]
                                            
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
                                            screenshots.append(screenshot_info)
                                            collected += 1
                                            
                                            if collected >= target_count:
                                                break
                                        
                                        processed += 1
            else:
                # For other dates, search normally but with limits
                user_prefix = f'screenshots/{normalized_user}/'
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=user_prefix,
                    PaginationConfig={'PageSize': 200, 'MaxItems': skip_count + target_count + 100}
                )
                
                for page in page_iterator:
                    if collected >= target_count:
                        break
                        
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith(('.webp', '.png', '.jpg', '.jpeg')):
                                key_parts = obj['Key'].split('/')
                                if len(key_parts) >= 3:
                                    screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                    if self._is_date_in_range(screenshot_date, date_filter):
                                        if processed >= skip_count:
                                            # This is a screenshot we want
                                            project_folder = self._extract_project_folder(obj['Key'])
                                            filename = key_parts[-1]
                                            user_email = key_parts[1]
                                            
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
                                            screenshots.append(screenshot_info)
                                            collected += 1
                                            
                                            if collected >= target_count:
                                                break
                                        
                                        processed += 1
                        
        except Exception as e:
            logger.error(f"Error in fast screenshots fetch: {str(e)}")
        
        logger.info(f"Fast screenshots fetch: processed {processed}, collected {collected}")
        return screenshots
    
    def _count_total_screenshots(self, normalized_user, date_filter):
        """Count total screenshots matching the criteria"""
        total_count = 0
        
        try:
            # Count in users_screenshots folder
            users_count = self._count_users_screenshots_folder(normalized_user, date_filter)
            total_count += users_count
            logger.info(f"Found {users_count} screenshots in users_screenshots folder")
            
            # Count in screenshots folder
            screenshots_count = self._count_screenshots_folder(normalized_user, date_filter)
            total_count += screenshots_count
            logger.info(f"Found {screenshots_count} screenshots in screenshots folder")
            
        except Exception as e:
            logger.error(f"Error counting total screenshots: {str(e)}")
        
        return total_count
    
    def _fetch_screenshots_for_page(self, normalized_user, date_filter, start_index, page_size):
        """Fetch only the screenshots needed for the specific page"""
        screenshots = []
        collected_count = 0
        
        try:
            # Collect from users_screenshots folder first
            if collected_count < start_index + page_size:
                users_screenshots = self._search_users_screenshots_folder(
                    normalized_user, date_filter, max_items=start_index + page_size
                )
                screenshots.extend(users_screenshots)
                collected_count = len(screenshots)
            
            # Collect from screenshots folder if needed
            if collected_count < start_index + page_size:
                remaining_needed = (start_index + page_size) - collected_count
                screenshots_folder = self._search_screenshots_folder(
                    normalized_user, date_filter, max_items=remaining_needed
                )
                screenshots.extend(screenshots_folder)
            
            # Remove duplicates
            unique_screenshots = []
            seen = set()
            for screenshot in screenshots:
                key = (
                    screenshot.get('filename'), 
                    screenshot.get('date'), 
                    screenshot.get('project_folder', 'unknown')
                )
                if key not in seen:
                    seen.add(key)
                    unique_screenshots.append(screenshot)
            
            # Sort by date (newest first)
            unique_screenshots.sort(key=lambda x: x.get('last_modified', ''), reverse=True)
            
            # Return only the page we need
            return unique_screenshots[start_index:start_index + page_size]
            
        except Exception as e:
            logger.error(f"Error fetching screenshots for page: {str(e)}")
            return []
    
    def _empty_response(self, normalized_user, date_filter, page, page_size):
        """Return empty response when no screenshots found"""
        return {
            "status": "success",
            "message": f"No screenshots found for user {normalized_user} in the specified date range",
            "data": {
                "user": {
                    "email": normalized_user.replace('_at_', '@'),
                    "normalized_email": normalized_user
                },
                "date_range": {
                    "start_date": date_filter['start_date'],
                    "end_date": date_filter['end_date']
                },
                "project_folders": {"total_projects": 0, "projects": []},
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total_pages": 0,
                    "total_screenshots": 0,
                    "has_next": False,
                    "has_previous": False,
                    "next_page": None,
                    "previous_page": None,
                    "showing": "0-0 of 0"
                },
                "screenshots": [],
                "data_source": "S3 (No matching data found)"
            }
        }
    
    def _count_users_screenshots_folder(self, normalized_user, date_filter):
        """Count screenshots in users_screenshots folder"""
        count = 0
        try:
            # Use same logic as search but just count
            if date_filter['start_date'] and date_filter['end_date']:
                start_date = date_filter['start_datetime']
                end_date = date_filter['end_datetime']
                current_date = start_date
                search_prefixes = []
                
                while current_date <= end_date:
                    date_str = current_date.strftime('%Y-%m-%d')
                    search_prefixes.append(f'users_screenshots/{date_str}/')
                    current_date += timedelta(days=1)
                
                if len(search_prefixes) > 31:
                    search_prefixes = ['users_screenshots/']
            else:
                search_prefixes = ['users_screenshots/']
            
            for prefix in search_prefixes:
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    PaginationConfig={'PageSize': 100}
                )
                
                for page in page_iterator:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if obj['Key'].endswith('.webp'):
                                key_parts = obj['Key'].split('/')
                                if len(key_parts) >= 4:
                                    user_email = key_parts[2]
                                    if self._user_matches(normalized_user, user_email):
                                        date_part = key_parts[1]
                                        if self._is_date_in_range(date_part, date_filter):
                                            count += 1
        except Exception as e:
            logger.error(f"Error counting users_screenshots: {str(e)}")
        
        return count
    
    def _count_screenshots_folder(self, normalized_user, date_filter):
        """Count screenshots in screenshots folder - COMPLETE search"""
        count = 0
        try:
            user_prefix = f'screenshots/{normalized_user}/'
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                PaginationConfig={'PageSize': 1000}  # Larger pages for counting
            )
            
            total_processed = 0
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        total_processed += 1
                        if obj['Key'].endswith(('.webp', '.png', '.jpg', '.jpeg')):
                            key_parts = obj['Key'].split('/')
                            if len(key_parts) >= 3:
                                # Extract date from path/filename using enhanced method
                                screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                if self._is_date_in_range(screenshot_date, date_filter):
                                    count += 1
                                    if count <= 5:  # Debug first few matches
                                        logger.info(f"  MATCH {count}: {obj['Key']} -> {screenshot_date}")
                
                # Log progress for large datasets
                if total_processed % 5000 == 0:
                    logger.info(f"  Processed {total_processed} files, found {count} matches so far...")
                    
        except Exception as e:
            logger.error(f"Error counting screenshots: {str(e)}")
        
        logger.info(f"Counting complete: {count} screenshots found from {total_processed} total files")
        return count
    
    def _user_matches(self, normalized_user, user_email):
        """Check if user email matches (handle both @ and _at_ formats)"""
        return (
            normalized_user.lower() == user_email.lower() or
            normalized_user.lower() in user_email.lower() or
            user_email.lower() in normalized_user.lower()
        )
    
    def _extract_date_from_path_enhanced(self, key_parts):
        """Enhanced date extraction including Turkish month names"""
        # Turkish month mapping
        turkish_months = {
            'ocak': '01', 'şubat': '02', 'mart': '03', 'nisan': '04',
            'mayıs': '05', 'haziran': '06', 'temmuz': '07', 'ağustos': '08',
            'eylül': '09', 'ekim': '10', 'kasım': '11', 'aralık': '12'
        }
        
        # First try the original date extraction
        original_date = self._extract_date_from_path(key_parts)
        if original_date:
            return original_date
        
        # Try to extract from folder names with Turkish months
        for part in key_parts:
            part_lower = part.lower()
            
            # Look for patterns like "DDS_Ağustos_2025" or "2025_Ağustos"
            for turkish_month, month_num in turkish_months.items():
                if turkish_month in part_lower:
                    # Try to find year in the same part
                    year_match = re.search(r'(\d{4})', part)
                    if year_match:
                        year = year_match.group(1)
                        return f"{year}-{month_num}-01"  # Use first day of month
        
        # If no date found, try to extract from filename again
        filename = key_parts[-1] if key_parts else ""
        
        # Handle .webp files with timestamp format
        if filename.endswith('.webp'):
            webp_match = re.match(r'^(\d{4}-\d{2}-\d{2})_', filename)
            if webp_match:
                return webp_match.group(1)
        
        return None
        """Search in users_screenshots folder structure with item limit"""
        screenshots = []
        items_processed = 0
        
        try:
            logger.info(f"DEBUG: Starting users_screenshots search for user: {normalized_user}")
            logger.info(f"DEBUG: Date filter start: {date_filter.get('start_date')}, end: {date_filter.get('end_date')}")
            logger.info(f"DEBUG: Max items to fetch: {max_items}")
            
            # Test S3 connection first
            try:
                response = self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix='users_screenshots/',
                    MaxKeys=5
                )
                logger.info(f"DEBUG: S3 connection successful. Found {len(response.get('Contents', []))} objects in users_screenshots/")
            except Exception as e:
                logger.error(f"DEBUG: S3 connection failed: {str(e)}")
                return screenshots
            
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
                if max_items and items_processed >= max_items:
                    break
                    
                logger.info(f"Searching in users_screenshots prefix: {prefix}")
                
                paginator = self.s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=self.bucket_name,
                    Prefix=prefix,
                    PaginationConfig={
                        'PageSize': 50,  # Process in chunks of 50
                        'MaxItems': max_items - items_processed if max_items else None
                    }
                )
                
                for page in page_iterator:
                    if max_items and items_processed >= max_items:
                        break
                        
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            if max_items and items_processed >= max_items:
                                break
                                
                            items_processed += 1
                            
                            if obj['Key'].endswith('.webp'):
                                # Parse key: users_screenshots/2025-09-01/user_at_domain.com/project_folder/filename.webp
                                key_parts = obj['Key'].split('/')
                                
                                if len(key_parts) >= 4:
                                    folder = key_parts[0]  # users_screenshots
                                    date_part = key_parts[1]  # 2025-09-01
                                    user_email = key_parts[2]  # user_at_domain.com
                                    filename = key_parts[-1]  # filename.webp
                                    
                                    # Debug logging for first few items
                                    if items_processed <= 5:
                                        logger.info(f"DEBUG: Processing file {items_processed}: {obj['Key']}")
                                        logger.info(f"DEBUG: Extracted user_email: {user_email}, normalized_user: {normalized_user}")
                                        logger.info(f"DEBUG: Date part: {date_part}")
                                    
                                    # Check if this matches our user (handle both @ and _at_ formats)
                                    user_matches = (
                                        normalized_user.lower() == user_email.lower() or
                                        normalized_user.lower() in user_email.lower() or
                                        user_email.lower() in normalized_user.lower()
                                    )
                                    
                                    if items_processed <= 5:
                                        logger.info(f"DEBUG: User matches: {user_matches}")
                                    
                                    if user_matches:
                                        # Check date filter using enhanced date extraction
                                        screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                        if self._is_date_in_range(screenshot_date, date_filter):
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
            
            logger.info(f"Users_screenshots search completed: {len(screenshots)} screenshots found from {items_processed} S3 objects")
            
        except Exception as e:
            logger.error(f"Error searching users_screenshots folder: {str(e)}")
        
        return screenshots
    
    def _search_screenshots_folder(self, normalized_user, date_filter, max_items=None):
        """Search in legacy screenshots folder structure - Optimized with item limit"""
        screenshots = []
        
        try:
            # Search for user folder in screenshots directory
            user_prefix = f'screenshots/{normalized_user}/'
            
            logger.info(f"Searching in screenshots folder with prefix: {user_prefix}, max_items: {max_items}")
            
            # Use streaming approach to handle large datasets
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix,
                PaginationConfig={
                    'PageSize': 50,  # Process in chunks of 50
                    'MaxItems': max_items   # Limit total items from S3
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
                                    # Check date filter using enhanced date extraction
                                    screenshot_date = self._extract_date_from_path_enhanced(key_parts)
                                    if self._is_date_in_range(screenshot_date, date_filter):
                                        # Extract project folder from path
                                        project_folder = self._extract_project_folder(obj['Key'])
                                        
                                        screenshot_info = {
                                            'filename': filename,
                                            'date': screenshot_date,  # Use the enhanced extracted date
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
                    
                    # Log progress for large datasets
                    if processed_count % 1000 == 0:
                        logger.info(f"Processed {processed_count} files, found {len(screenshots)} matching screenshots")
                        
        except Exception as e:
            logger.error(f"Error searching screenshots folder: {str(e)}")
        
        logger.info(f"Screenshots folder scan completed: {len(screenshots)} screenshots found from {processed_count} objects")
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
