"""
Fast Users API - Optimized for speed with S3 bucket integration
Endpoint: GET /api/users/search/?q=nawaz&page_size=100&page=1

This module provides an ultra-fast API for searching users and their screenshots
from the S3 bucket users_screenshots/ folder with aggressive caching and optimization.

Supported page_size options: 50, 100, 250, 300, 500 (for fast data)
"""

import logging
import time
from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from concurrent.futures import ThreadPoolExecutor, as_completed
import re

logger = logging.getLogger(__name__)

# Aggressive in-memory cache for maximum speed
_fast_cache = {
    'all_users': None,
    'timestamp': None,
    'cache_duration': 180,  # Increased to 3 minutes for better performance
    'user_index': {}  # Quick lookup by email
}


class FastUsersSearchAPI(APIView):
    """
    Ultra-fast users search API with S3 screenshots integration
    
    Query Parameters:
    - q: Search query (user name or email) - example: nawaz
    - page_size: Results per page - options: 50, 100, 250, 300, 500 (default: 100)
    - page: Page number (default: 1)
    - start_date: Start date for filtering (format: YYYY-MM-DD) - example: 2025-09-25
    - end_date: End date for filtering (format: YYYY-MM-DD) - example: 2025-10-08
    - limit: Legacy parameter (for compatibility)
    - offset: Legacy parameter (for compatibility)
    - days: Number of recent days to search (default: 3, ignored if start_date/end_date provided)
    - refresh: Force cache refresh (true/false)
    
    Examples:
    - GET /api/users/search/?q=nawaz&page_size=100&page=1
    - GET /api/users/search/?q=nawaz&start_date=2025-09-25&end_date=2025-10-08&page_size=50&page=1
    - GET /api/users/search/?q=nawaz&start_date=2025-10-01&end_date=2025-10-08&limit=10&offset=0
    """
    
    permission_classes = [AllowAny]
    
    # Allowed page sizes for fast data
    ALLOWED_PAGE_SIZES = [50, 100, 250, 300, 500]
    DEFAULT_PAGE_SIZE = 100
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = 'ddsfocustime'
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials from env or fallback"""
        try:
            # Try to get credentials from environment first, then fallback to hardcoded
            import os
            
            aws_access_key = os.getenv('AWS_ACCESS_KEY_ID', 'AKIARSU6EUUWMQ5I2JWC')
            aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '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')
            aws_region = os.getenv('AWS_DEFAULT_REGION', 'eu-north-1')
            
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
            logger.info("✓ S3 client initialized for fast users API")
        except Exception as e:
            logger.error(f"✗ Failed to initialize S3 client: {str(e)}")
            # Set client to None so we can handle gracefully
            self.s3_client = None

    def _generate_signed_url(self, key, expires_in=3600):
        """Generate presigned URL for S3 object - fast and secure"""
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            return None

    def _parse_screenshot_key(self, key, last_modified, size):
        """Fast screenshot key parsing"""
        parts = key.split('/')
        if len(parts) >= 4:
            date_part = parts[1]  # 2025-10-08
            user_email = parts[2]  # user@domain.com
            filename = parts[-1]   # screenshot.webp
            
            return {
                'date': date_part,
                'user_email': user_email,
                'filename': filename,
                'key': key,
                'size_mb': round(size / (1024 * 1024), 3),
                'last_modified': last_modified.isoformat() if hasattr(last_modified, 'isoformat') else str(last_modified),
                'url': self._generate_signed_url(key)
            }
        return None

    def _fetch_date_folder_fast(self, date_str, max_screenshots=2000):
        """Fetch screenshots from a specific date folder - optimized with limits"""
        prefix = f"users_screenshots/{date_str}/"
        screenshots = []
        
        try:
            # Use paginator for efficient fetching with early termination
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=500  # Smaller batches for faster response
            )
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        if obj['Key'].endswith('.webp') or obj['Key'].endswith('.jpg') or obj['Key'].endswith('.png'):
                            screenshot_data = self._parse_screenshot_key(
                                obj['Key'],
                                obj['LastModified'],
                                obj['Size']
                            )
                            if screenshot_data:
                                screenshots.append(screenshot_data)
                                
                                # Early termination for speed
                                if len(screenshots) >= max_screenshots:
                                    logger.info(f"  ⚡ Early termination at {max_screenshots} screenshots for {date_str}")
                                    break
                    
                    # Break outer loop too
                    if len(screenshots) >= max_screenshots:
                        break
            
            logger.info(f"  ✓ Fetched {len(screenshots)} screenshots from {date_str}")
            
        except Exception as e:
            logger.error(f"  ✗ Error fetching {date_str}: {str(e)}")
        
        return screenshots

    def _build_users_index_fast(self, days=3, start_date=None, end_date=None, force_refresh=False):
        """Build comprehensive users index with parallel processing - ULTRA FAST with date range support"""
        current_time = time.time()
        
        # Create cache key based on date range or days
        if start_date and end_date:
            cache_key = f"{start_date}_{end_date}"
        else:
            cache_key = f"days_{days}"
        
        # Check cache first - extended cache time for better performance
        if (not force_refresh and 
            _fast_cache['all_users'] is not None and 
            _fast_cache['timestamp'] is not None and 
            _fast_cache.get('cache_key') == cache_key and
            current_time - _fast_cache['timestamp'] < _fast_cache['cache_duration']):
            
            logger.info(f"⚡ Returning cached users data for {cache_key} (FAST - 3min cache)")
            return _fast_cache['all_users'], _fast_cache['user_index']
        
        # Generate date range
        date_list = []
        
        if start_date and end_date:
            # Custom date range
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                
                current = start_dt
                while current <= end_dt:
                    date_list.append(current.strftime('%Y-%m-%d'))
                    current += timedelta(days=1)
                    
                logger.info(f"🔄 Building users index for custom date range: {start_date} to {end_date} ({len(date_list)} days)")
                
            except ValueError as e:
                logger.error(f"Invalid date format: {e}")
                # Fallback to recent days
                end_dt = datetime.now()
                start_dt = end_dt - timedelta(days=days)
                
                current = start_dt
                while current <= end_dt:
                    date_list.append(current.strftime('%Y-%m-%d'))
                    current += timedelta(days=1)
                    
                logger.info(f"🔄 Fallback to recent {days} days due to invalid date format")
        else:
            # Recent days (default behavior)
            end_dt = datetime.now()
            start_dt = end_dt - timedelta(days=days)
            
            current = start_dt
            while current <= end_dt:
                date_list.append(current.strftime('%Y-%m-%d'))
                current += timedelta(days=1)
                
            logger.info(f"🔄 Building users index for last {days} days (optimized for speed)")
        
        start_time = time.time()
        logger.info(f"  📅 Scanning dates: {date_list[0]} to {date_list[-1]} ({len(date_list)} days)")
        
        # Parallel fetch using ThreadPoolExecutor for SPEED - increased workers with limits
        all_screenshots = []
        with ThreadPoolExecutor(max_workers=10) as executor:  # Increased from 8 to 10
            future_to_date = {
                executor.submit(self._fetch_date_folder_fast, date, 1500): date 
                for date in date_list
            }
            
            for future in as_completed(future_to_date):
                date = future_to_date[future]
                try:
                    screenshots = future.result()
                    all_screenshots.extend(screenshots)
                except Exception as e:
                    logger.error(f"  ✗ Failed to fetch {date}: {str(e)}")
        
        # Group by user email
        users_data = {}
        for screenshot in all_screenshots:
            email = screenshot['user_email']
            
            if email not in users_data:
                users_data[email] = {
                    'email': email,
                    'name': self._extract_name_from_email(email),
                    'screenshots': [],
                    'total_screenshots': 0,
                    'total_size_mb': 0,
                    'first_seen': screenshot['last_modified'],
                    'last_seen': screenshot['last_modified'],
                    'active_days': set()
                }
            
            users_data[email]['screenshots'].append(screenshot)
            users_data[email]['total_screenshots'] += 1
            users_data[email]['total_size_mb'] += screenshot['size_mb']
            users_data[email]['active_days'].add(screenshot['date'])
            
            # Update last seen
            if screenshot['last_modified'] > users_data[email]['last_seen']:
                users_data[email]['last_seen'] = screenshot['last_modified']
        
        # Convert to list and sort by last activity
        all_users = []
        for email, data in users_data.items():
            data['active_days'] = len(data['active_days'])
            # Sort screenshots by most recent first
            data['screenshots'].sort(key=lambda x: x['last_modified'], reverse=True)
            # Keep only recent 20 screenshots per user for response size
            data['screenshots'] = data['screenshots'][:20]
            all_users.append(data)
        
        # Sort by most recent activity
        all_users.sort(key=lambda x: x['last_seen'], reverse=True)
        
        # Build quick lookup index
        user_index = {user['email'].lower(): user for user in all_users}
        
        # Cache the results with cache key
        _fast_cache['all_users'] = all_users
        _fast_cache['user_index'] = user_index
        _fast_cache['timestamp'] = current_time
        _fast_cache['cache_key'] = cache_key  # Store cache key for validation
        
        elapsed = time.time() - start_time
        logger.info(f"✓ Users index built in {elapsed:.2f}s - {len(all_users)} users, {len(all_screenshots)} screenshots (cache key: {cache_key})")
        
        return all_users, user_index

    def _extract_name_from_email(self, email):
        """Extract display name from email"""
        try:
            # Get part before @
            local_part = email.split('@')[0]
            # Replace dots and underscores with spaces and title case
            name = local_part.replace('.', ' ').replace('_', ' ').title()
            return name
        except:
            return email

    def _search_users(self, query, all_users, user_index):
        """Fast user search with query matching"""
        if not query:
            return all_users
        
        query_lower = query.lower()
        matched_users = []
        
        for user in all_users:
            # Search in email and name
            if (query_lower in user['email'].lower() or 
                query_lower in user['name'].lower()):
                matched_users.append(user)
        
        return matched_users

    def get(self, request):
        """
        GET /api/users/search/?q=nawaz&page_size=100&page=1
        GET /api/users/search/?q=nawaz&start_date=2025-09-25&end_date=2025-10-08&limit=10&offset=0
        
        Ultra-fast user search endpoint with screenshots, optimized pagination and date range filtering
        """
        try:
            # Quick check if S3 client is available
            if not self.s3_client:
                logger.warning("⚠️ S3 client not available, returning empty response")
                return Response({
                    "status": "error",
                    "message": "S3 service temporarily unavailable",
                    "data": {
                        "users": [],
                        "pagination": {
                            "page": 1,
                            "per_page": self.DEFAULT_PAGE_SIZE,
                            "total_pages": 0,
                            "total_count": 0,
                            "returned": 0,
                            "has_next": False,
                            "has_previous": False
                        }
                    },
                    "meta": {
                        "timestamp": datetime.now().isoformat(),
                        "error": "S3 connection failed",
                        "allowed_page_sizes": self.ALLOWED_PAGE_SIZES
                    }
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            # Parse query parameters with date range and pagination support
            search_query = request.GET.get('q', '').strip()
            
            # Date range parameters
            start_date = request.GET.get('start_date', '').strip()
            end_date = request.GET.get('end_date', '').strip()
            
            # Handle both new and legacy pagination parameters
            # New pagination: page_size + page
            requested_page_size = int(request.GET.get('page_size', self.DEFAULT_PAGE_SIZE))
            page_size = requested_page_size if requested_page_size in self.ALLOWED_PAGE_SIZES else self.DEFAULT_PAGE_SIZE
            page = max(int(request.GET.get('page', 1)), 1)
            
            # Legacy pagination: limit + offset (for compatibility)
            legacy_limit = request.GET.get('limit')
            legacy_offset = request.GET.get('offset')
            
            if legacy_limit and legacy_offset:
                # Use legacy pagination if provided
                page_size = min(int(legacy_limit), 500)  # Max 500
                offset = int(legacy_offset)
                page = (offset // page_size) + 1  # Calculate page from offset
            else:
                # Use new pagination
                offset = (page - 1) * page_size
            
            days = int(request.GET.get('days', 3))  # Reduced to 3 days by default for speed
            force_refresh = request.GET.get('refresh', '').lower() == 'true'
            
            # Determine if date range is provided
            if start_date and end_date:
                logger.info(f"⚡ Fast search with date range: q='{search_query}', {start_date} to {end_date}, page_size={page_size}, page={page}")
                all_users, user_index = self._build_users_index_fast(
                    start_date=start_date, 
                    end_date=end_date, 
                    force_refresh=force_refresh
                )
            else:
                logger.info(f"⚡ Fast search with recent days: q='{search_query}', page_size={page_size}, page={page}, days={days}")
                all_users, user_index = self._build_users_index_fast(days=days, force_refresh=force_refresh)
            
            # Build/get users index (cached)
            request_start = time.time()
            
            # Search users
            matched_users = self._search_users(search_query, all_users, user_index)
            
            # Apply pagination
            total_count = len(matched_users)
            paginated_users = matched_users[offset:offset + page_size]
            
            # Calculate pagination metadata
            total_pages = (total_count + page_size - 1) // page_size  # Ceiling division
            has_next = page < total_pages
            has_previous = page > 1
            
            # Calculate response time
            response_time_ms = round((time.time() - request_start) * 1000, 2)
            
            # Build response with new pagination structure
            response_data = {
                "status": "success",
                "message": f"Fast search completed for '{search_query}'" if search_query else "All users retrieved",
                "data": {
                    "users": paginated_users,
                    "pagination": {
                        # New pagination structure
                        "page": page,
                        "per_page": page_size,
                        "total_pages": total_pages,
                        "total_count": total_count,
                        "returned": len(paginated_users),
                        "has_next": has_next,
                        "has_previous": has_previous,
                        "next_page": page + 1 if has_next else None,
                        "previous_page": page - 1 if has_previous else None,
                        
                        # Legacy support
                        "total": total_count,
                        "limit": page_size,
                        "offset": offset,
                        "has_more": has_next,
                        "next_offset": offset + page_size if has_next else None
                    },
                    "search": {
                        "query": search_query,
                        "date_range": {
                            "start_date": start_date if start_date else None,
                            "end_date": end_date if end_date else None,
                            "days_searched": days if not (start_date and end_date) else None
                        },
                        "total_matches": total_count
                    },
                    "performance": {
                        "response_time_ms": response_time_ms,
                        "cached": not force_refresh and _fast_cache['timestamp'] is not None,
                        "cache_age_seconds": round(time.time() - _fast_cache['timestamp'], 1) if _fast_cache['timestamp'] else 0,
                        "optimization": "parallel_s3_fetch_10_workers_3days_cache3min"
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "api_version": "4.3.0-date-range-support",
                    "bucket": self.bucket_name,
                    "endpoint": "/api/users/search/",
                    "allowed_page_sizes": self.ALLOWED_PAGE_SIZES,
                    "current_page_size": page_size,
                    "features": ["ultra_fast", "parallel_fetching", "optimized_caching", "presigned_urls", "custom_page_sizes", "early_termination", "date_range_filtering", "legacy_pagination_support"]
                }
            }
            
            logger.info(f"✓ Fast search completed in {response_time_ms}ms - {total_count} matches, page {page}/{total_pages}, returned {len(paginated_users)}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"✗ Error in fast users search: {str(e)}", exc_info=True)
            
            return Response({
                "status": "error",
                "message": f"Search failed: {str(e)}",
                "data": {
                    "users": [],
                    "pagination": {
                        "page": 1,
                        "per_page": self.DEFAULT_PAGE_SIZE,
                        "total_pages": 0,
                        "total_count": 0,
                        "returned": 0,
                        "has_next": False,
                        "has_previous": False
                    }
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "error": str(e),
                    "allowed_page_sizes": self.ALLOWED_PAGE_SIZES
                }
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
