"""
Enhanced S3 Pagination Utils - High Performance Implementation
Optimized for folders with 1000+ screenshots
"""
import boto3
import os
import logging
from datetime import datetime
from django.conf import settings
from django.core.cache import cache
import hashlib
import re
from .aws_utils import get_s3_client, generate_presigned_url

logger = logging.getLogger(__name__)

class S3PaginationManager:
    """
    Advanced S3 pagination manager with caching and performance optimization
    """
    
    def __init__(self):
        self.s3_client = None
        self.bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'ddsfocustime')
    
    def _get_s3_client(self):
        """Get configured S3 client using existing AWS utils"""
        if self.s3_client is None:
            try:
                self.s3_client = get_s3_client()
            except Exception as e:
                logger.error(f"Failed to create S3 client: {str(e)}")
                return None
        return self.s3_client
    
    def get_screenshots_page(self, employee_email, folder_name, page=1, limit=50, use_cache=True):
        """
        Get a specific page of screenshots with intelligent pagination strategy
        
        Args:
            employee_email: Employee email
            folder_name: S3 folder name
            page: Page number (1-based)
            limit: Screenshots per page
            use_cache: Whether to use caching
        
        Returns:
            Dict with screenshots and pagination info
        """
        start_time = datetime.now()
        
        # Get total count (cached)
        total_count = self._get_total_count(employee_email, folder_name, use_cache)
        
        # Calculate pagination info
        total_pages = max(1, (total_count + limit - 1) // limit)
        page = max(1, min(page, total_pages))
        
        # Choose pagination strategy based on folder size and page position
        if self._should_use_traditional_pagination(total_count, page, total_pages):
            screenshots = self._get_screenshots_traditional(employee_email, folder_name, page, limit)
            method = "traditional"
        else:
            screenshots = self._get_screenshots_s3_native(employee_email, folder_name, page, limit)
            method = "s3_native"
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            'screenshots': screenshots,
            'pagination': {
                "current_page": page,
                "total_pages": total_pages,
                "total_screenshots": total_count,
                "limit": limit,
                "offset": (page - 1) * limit,
                "has_next": page < total_pages,
                "has_previous": page > 1,
                "next_page": page + 1 if page < total_pages else None,
                "previous_page": page - 1 if page > 1 else None,
                "pagination_method": method
            },
            'performance': {
                'total_processing_time_ms': processing_time,
                'method_used': method,
                'recommended_for_size': total_count > 500
            }
        }
    
    def _should_use_traditional_pagination(self, total_count, page, total_pages):
        """
        Decide which pagination method to use
        Traditional: Better for small folders only  
        S3 Native: Better for large folders (500+ screenshots)
        """
        # For very large folders (1000+), always use S3 native
        if total_count >= 1000:
            return False
            
        # For large folders (500+), prefer S3 native except for first page
        if total_count >= 500:
            return page == 1  # Only use traditional for first page
        
        # For small folders, use traditional
        return total_count <= 500
    
    def _get_total_count(self, employee_email, folder_name, use_cache=True):
        """Get total screenshot count with caching"""
        cache_key = f"screenshot_count_{hashlib.md5(f'{employee_email}_{folder_name}'.encode()).hexdigest()}"
        
        if use_cache:
            cached_count = cache.get(cache_key)
            if cached_count is not None:
                return cached_count
        
        # Count all screenshots
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        total_count = 0
        continuation_token = None
        
        try:
            s3_client = self._get_s3_client()
            if not s3_client:
                return 0
                
            while True:
                params = {
                    'Bucket': self.bucket_name,
                    'Prefix': s3_prefix,
                    'MaxKeys': 1000
                }
                
                if continuation_token:
                    params['ContinuationToken'] = continuation_token
                
                response = s3_client.list_objects_v2(**params)
                
                if 'Contents' in response:
                    count = sum(1 for obj in response['Contents'] 
                               if not obj['Key'].endswith('/') and self._is_image_file(obj['Key']))
                    total_count += count
                
                if not response.get('IsTruncated', False):
                    break
                    
                continuation_token = response.get('NextContinuationToken')
            
            # Cache for 1 hour
            if use_cache:
                cache.set(cache_key, total_count, 3600)
            
            return total_count
            
        except Exception as e:
            logger.error(f"Error counting screenshots: {str(e)}")
            return 0
    
    def _get_screenshots_traditional(self, employee_email, folder_name, page, limit):
        """Traditional method: Load all, then paginate"""
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        all_screenshots = []
        continuation_token = None
        
        try:
            s3_client = self._get_s3_client()
            if not s3_client:
                return []
                
            # Load all screenshots
            while True:
                params = {
                    'Bucket': self.bucket_name,
                    'Prefix': s3_prefix,
                    'MaxKeys': 1000
                }
                
                if continuation_token:
                    params['ContinuationToken'] = continuation_token
                
                response = s3_client.list_objects_v2(**params)
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        key = obj['Key']
                        
                        if key.endswith('/') or not self._is_image_file(key):
                            continue
                        
                        screenshot = self._create_screenshot_object(key, obj)
                        all_screenshots.append(screenshot)
                
                if not response.get('IsTruncated', False):
                    break
                    
                continuation_token = response.get('NextContinuationToken')
            
            # Sort by timestamp and remove duplicates based on S3 key
            seen_keys = set()
            unique_screenshots = []
            for screenshot in all_screenshots:
                if screenshot['s3_key'] not in seen_keys:
                    seen_keys.add(screenshot['s3_key'])
                    unique_screenshots.append(screenshot)
            
            # Sort by timestamp (most recent first)
            unique_screenshots.sort(key=lambda x: x['timestamp'], reverse=True)
            
            # Apply pagination
            offset = (page - 1) * limit
            return unique_screenshots[offset:offset + limit]
            
        except Exception as e:
            logger.error(f"Error in traditional pagination: {str(e)}")
            return []
    
    def _get_screenshots_s3_native(self, employee_email, folder_name, page, limit):
        """S3 native method: Skip to the right position using continuation tokens"""
        email_prefix = employee_email.replace('@', '_at_')
        s3_prefix = f"screenshots/{email_prefix}/{folder_name}/"
        
        # Calculate how many items to skip
        skip_count = (page - 1) * limit
        
        screenshots = []
        continuation_token = None
        items_processed = 0
        seen_keys = set()  # Track unique keys to avoid duplicates
        
        try:
            s3_client = self._get_s3_client()
            if not s3_client:
                return []
                
            while len(screenshots) < limit:
                params = {
                    'Bucket': self.bucket_name,
                    'Prefix': s3_prefix,
                    'MaxKeys': min(1000, skip_count + limit * 2)
                }
                
                if continuation_token:
                    params['ContinuationToken'] = continuation_token
                
                response = s3_client.list_objects_v2(**params)
                
                if 'Contents' not in response:
                    break
                
                for obj in response['Contents']:
                    key = obj['Key']
                    
                    if key.endswith('/') or not self._is_image_file(key):
                        continue
                    
                    # Skip duplicates
                    if key in seen_keys:
                        continue
                    
                    seen_keys.add(key)
                    items_processed += 1
                    
                    # Skip items until we reach the desired page
                    if items_processed <= skip_count:
                        continue
                    
                    # Add to results
                    screenshot = self._create_screenshot_object(key, obj)
                    screenshots.append(screenshot)
                    
                    # Stop when we have enough
                    if len(screenshots) >= limit:
                        break
                
                if not response.get('IsTruncated', False) or len(screenshots) >= limit:
                    break
                    
                continuation_token = response.get('NextContinuationToken')
            
            return screenshots
            
        except Exception as e:
            logger.error(f"Error in S3 native pagination: {str(e)}")
            return []
    
    def _create_screenshot_object(self, key, s3_obj):
        """Create screenshot object with metadata"""
        filename = key.split('/')[-1]
        
        # Generate presigned URL using existing utils
        try:
            presigned_url = generate_presigned_url(key, self.bucket_name, 7200)
        except Exception as e:
            logger.warning(f"Could not generate presigned URL for {key}: {str(e)}")
            presigned_url = None
        
        # Parse metadata
        metadata = self._parse_metadata(filename, key, s3_obj)
        
        return {
            "id": self._generate_screenshot_id(key),
            "filename": filename,
            "s3_key": key,
            "presigned_url": presigned_url,
            "timestamp": metadata["timestamp"],
            "time_display": metadata["time_display"],
            "application": metadata["application"],
            "window_title": metadata["window_title"],
            "size_bytes": s3_obj.get('Size', 0),
            "size_mb": round(s3_obj.get('Size', 0) / (1024 * 1024), 2),
            "last_modified": s3_obj.get('LastModified').isoformat() if s3_obj.get('LastModified') else None,
            "file_extension": os.path.splitext(filename)[1].lower()
        }
    
    def _parse_metadata(self, filename, s3_key, s3_obj):
        """Parse screenshot metadata efficiently"""
        try:
            # Extract timestamp from filename
            timestamp_str = None
            
            # Pattern for date_time format: 2025-01-15_09-30-45.webp
            date_time_pattern = r'(\d{4}-\d{2}-\d{2})[_-](\d{2})[_-](\d{2})[_-](\d{2})'
            match = re.search(date_time_pattern, filename)
            
            if match:
                date_part = match.group(1)
                hour = match.group(2)
                minute = match.group(3)
                second = match.group(4)
                timestamp_str = f"{date_part}T{hour}:{minute}:{second}Z"
            else:
                # Use S3 last modified as fallback
                last_modified = s3_obj.get('LastModified')
                if last_modified:
                    timestamp_str = last_modified.isoformat()
                else:
                    timestamp_str = datetime.now().isoformat()
            
            # Generate time display
            try:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                time_display = dt.strftime('%I:%M %p')
            except:
                time_display = "Unknown"
            
            # Quick application detection
            filename_lower = filename.lower()
            if 'chrome' in filename_lower:
                application = "Google Chrome"
            elif 'vscode' in filename_lower or 'code' in filename_lower:
                application = "Visual Studio Code"
            elif 'teams' in filename_lower:
                application = "Microsoft Teams"
            elif 'outlook' in filename_lower:
                application = "Microsoft Outlook"
            else:
                application = "Unknown Application"
            
            return {
                "timestamp": timestamp_str,
                "application": application,
                "window_title": "Unknown",
                "time_display": time_display
            }
            
        except Exception as e:
            logger.warning(f"Error parsing metadata for {filename}: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "application": "Unknown",
                "window_title": "Unknown", 
                "time_display": "Unknown"
            }
    
    def _is_image_file(self, filename):
        """Check if file is an image"""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'}
        ext = os.path.splitext(filename.lower())[1]
        return ext in image_extensions
    
    def _generate_screenshot_id(self, s3_key):
        """Generate a unique ID for the screenshot"""
        return f"screenshot_{hashlib.md5(s3_key.encode()).hexdigest()[:12]}"
    
    def clear_cache(self, employee_email, folder_name):
        """Clear cache for a specific folder"""
        cache_key = f"screenshot_count_{hashlib.md5(f'{employee_email}_{folder_name}'.encode()).hexdigest()}"
        cache.delete(cache_key)

# Global instance
s3_pagination_manager = S3PaginationManager()
