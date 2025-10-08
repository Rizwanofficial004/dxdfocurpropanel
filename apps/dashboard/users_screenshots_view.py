"""
Users Screenshots API View - Exactly like Employees API

This module provides an API endpoint that matches the exact structure
of the employees API but fetches dynamic data from users_screenshots/ folder only.
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
import os
from urllib.parse import quote
from .screenshot_parser import ScreenshotParser
import time

logger = logging.getLogger(__name__)

# Simple in-memory cache for speed - REDUCED for fresh data
_api_cache = {
    'data': None,
    'timestamp': None,
    'cache_duration': 30  # 30 seconds cache for fresher data
}


class UsersScreenshotsView(APIView):
    """
    Users Screenshots API - Matches employees API structure exactly
    Returns data from users_screenshots/ folder in the same format as employees endpoint
    URL: /api/dashboard/employees/
    """
    
    permission_classes = [AllowAny]
    
    def __init__(self):
        super().__init__()
        self.s3_client = None
        self.bucket_name = 'ddsfocustime'
        self.screenshot_parser = ScreenshotParser(self.bucket_name)
        self._initialize_s3()
    
    def _initialize_s3(self):
        """Initialize S3 client with credentials"""
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            logger.info("S3 client initialized successfully for users_screenshots API")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")

    def _process_file_for_users_data(self, obj, users_data, all_dates):
        """Helper method to process a file and update users_data - OPTIMIZED FOR CURRENT DATA"""
        # Parse the key: users_screenshots/date/user_email/filename
        key_parts = obj['Key'].split('/')
        
        if len(key_parts) >= 4:
            date_part = key_parts[1]  # 2025-10-08
            user_email = key_parts[2]  # user@domain.com
            filename = key_parts[-1]  # image file
            
            # Track user data
            if user_email not in users_data:
                users_data[user_email] = {
                    'file_count': 0,
                    'total_size': 0,
                    'dates': set(),
                    'latest_file': None,
                    'latest_date': None,
                    'latest_modified': None,
                    'screenshots': []
                }
            
            # Current screenshot info with all details
            screenshot_info = {
                'filename': filename,
                'date': date_part,
                'file_key': obj['Key'],
                'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                'last_modified': obj['LastModified'].isoformat()
            }
            
            # Add to screenshots list (keep more recent ones, limit to top 10 per user)
            users_data[user_email]['screenshots'].append(screenshot_info)
            # Sort by last modified and keep only top 10 most recent
            users_data[user_email]['screenshots'].sort(key=lambda x: x['last_modified'], reverse=True)
            users_data[user_email]['screenshots'] = users_data[user_email]['screenshots'][:10]
            
            # Update user stats
            users_data[user_email]['file_count'] += 1
            users_data[user_email]['total_size'] += obj['Size']
            users_data[user_email]['dates'].add(date_part)
            
            # Track latest file (prioritize most recent modification time)
            if (users_data[user_email]['latest_modified'] is None or 
                obj['LastModified'] > users_data[user_email]['latest_modified']):
                users_data[user_email]['latest_modified'] = obj['LastModified']
                users_data[user_email]['latest_file'] = filename
                users_data[user_email]['latest_date'] = date_part
            
            # Add to global dates list
            all_dates.append(date_part)

    def _generate_presigned_url(self, key, expires_in=3600): ##Abed - Generate URL for S3 proxy
        """
        Generate a presigned URL for a private S3 object.
        Expires in `expires_in` seconds (default 1 hour).
        """
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"Error generating presigned URL for {key}: {str(e)}")
            return None

    def _generate_direct_s3_url(self, key):
        """
        Generate a direct S3 URL without authentication parameters.
        Format: https://bucket.s3.region.amazonaws.com/key
        """
        try:
            region = 'eu-north-1'  # Your S3 bucket region
            direct_url = f"https://{self.bucket_name}.s3.{region}.amazonaws.com/{key}"
            return direct_url
        except Exception as e:
            logger.error(f"Error generating direct S3 URL for {key}: {str(e)}")
            return None


    def get(self, request):
        """
        GET /api/live-tracking/fast-screenshots/
        
        Returns users_screenshots data with FRESH S3 data
        Cache can be forced to refresh with ?refresh=true parameter
        """
        try:
            # Check for force refresh parameter
            force_refresh = request.GET.get('refresh', '').lower() == 'true'
            
            if force_refresh:
                logger.info("Force refresh requested - clearing cache")
                _api_cache['data'] = None
                _api_cache['timestamp'] = None
            
            # Check cache first for speed (unless force refresh)
            current_time = time.time()
            if (not force_refresh and 
                _api_cache['data'] is not None and 
                _api_cache['timestamp'] is not None and 
                current_time - _api_cache['timestamp'] < _api_cache['cache_duration']):
                
                logger.info("Returning cached data for speed")
                return Response(_api_cache['data'], status=status.HTTP_200_OK)
            
            # Get fresh data from users_screenshots folder
            start_time = time.time()
            screenshots_data = self._get_comprehensive_screenshots_data()
            processing_time = time.time() - start_time
            
            logger.info(f"Fresh data processing completed in {processing_time:.2f} seconds")
            
            # Format data exactly like employees API
            total_count = screenshots_data['total_count']
            active_count = screenshots_data['active_count']
            growth_rate = screenshots_data['growth_rate']
            growth_text = screenshots_data['growth_text']
            last_updated = screenshots_data['last_updated']
            s3_users_count = screenshots_data['s3_users']
            s3_files_count = screenshots_data['s3_files']
            data_source = "Users Screenshots (S3)"
            
            # Dashboard data matching employees API structure exactly
            dashboard_data = {
                "status": "success",
                "data": {
                    "total_employees": {
                        "title": "TOTAL USERS (USERS_SCREENSHOTS)",
                        "count": total_count,
                        "growth_rate": growth_text,
                        "icon": "👤"
                    },
                    "metrics": [
                        {
                            "label": "S3 Users",
                            "value": s3_users_count,
                            "type": "number"
                        },
                        {
                            "label": "Total Files", 
                            "value": s3_files_count,
                            "type": "number"
                        },
                        {
                            "label": "Storage (GB)",
                            "value": round(screenshots_data['s3_size_gb'], 2),
                            "type": "number"
                        },
                        {
                            "label": "Last Updated",
                            "value": last_updated,
                            "type": "date"
                        }
                    ],
                    "summary": {
                        "total_count": total_count,
                        "s3_users": s3_users_count,
                        "s3_files": s3_files_count,
                        "s3_size_gb": screenshots_data['s3_size_gb'],
                        "growth_rate": growth_rate,
                        "growth_percentage": f"{abs(growth_rate)}%",
                        "active_users": active_count,
                        "last_updated": last_updated,
                        "growth_positive": screenshots_data['growth_positive'],
                        "data_source": data_source
                    },
                    "data_sources": {
                        "s3_files": s3_files_count,
                        "s3_users": s3_users_count,
                        "s3_last_updated": screenshots_data['s3_last_updated'],
                        "crm_status": "Not Used",
                        "s3_status": "Connected",
                        "primary_source": "users_screenshots"
                    },
                    "s3_users_sample": screenshots_data['top_users'][:5]  # Top 5 users with current data
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "source": data_source,
                    "api_version": "3.0.0",
                    "services_status": {
                        "s3_status": "Connected",
                        "crm_status": "Not Used",
                        "primary_source": "users_screenshots"
                    },
                    "processing_time_seconds": processing_time,
                    "cache_info": {
                        "cache_duration_seconds": _api_cache['cache_duration'],
                        "force_refresh": force_refresh,
                        "data_freshness": "live" if force_refresh else "cached_or_fresh"
                    }
                }
            }
            
            # Cache the fresh result for faster subsequent calls
            _api_cache['data'] = dashboard_data
            _api_cache['timestamp'] = current_time
            
            logger.info(f"Fresh users screenshots data retrieved - Total: {total_count}, Active: {active_count}, Growth: {growth_rate}% (Force refresh: {force_refresh})")
            return Response(dashboard_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in UsersScreenshotsView: {str(e)}")
            
            # Fallback data matching employees API structure
            fallback_data = {
                "status": "success",
                "data": {
                    "total_employees": {
                        "title": "TOTAL USERS (USERS_SCREENSHOTS)",
                        "count": 0,
                        "growth_rate": "Service unavailable",
                        "icon": "👤"
                    },
                    "metrics": [
                        {
                            "label": "S3 Users",
                            "value": 0,
                            "type": "number"
                        },
                        {
                            "label": "Total Files", 
                            "value": 0,
                            "type": "number"
                        },
                        {
                            "label": "Storage (GB)",
                            "value": 0,
                            "type": "number"
                        },
                        {
                            "label": "Last Updated",
                            "value": datetime.now().strftime("%m/%d/%Y"),
                            "type": "date"
                        }
                    ],
                    "summary": {
                        "total_count": 0,
                        "s3_users": 0,
                        "s3_files": 0,
                        "s3_size_gb": 0,
                        "growth_rate": 0,
                        "growth_percentage": "0%",
                        "active_users": 0,
                        "last_updated": datetime.now().strftime("%m/%d/%Y"),
                        "growth_positive": False,
                        "data_source": "Users Screenshots (Error)"
                    },
                    "data_sources": {
                        "s3_files": 0,
                        "s3_users": 0,
                        "s3_last_updated": datetime.now().strftime("%m/%d/%Y"),
                        "crm_status": "Not Used",
                        "s3_status": "Error",
                        "primary_source": "users_screenshots"
                    },
                    "s3_users_sample": []
                },
                "meta": {
                    "timestamp": datetime.now().isoformat(),
                    "source": "Fallback Data (Service Error)",
                    "api_version": "3.0.0",
                    "error": str(e)
                }
            }
            
            return Response(fallback_data, status=status.HTTP_200_OK)
    
    def _get_comprehensive_screenshots_data(self):
        """Get FRESH dashboard data prioritizing RECENT screenshots from users_screenshots folder"""
        try:
            users_data = {}
            total_files = 0
            total_size = 0
            all_dates = []
            
            # FRESH APPROACH: Prioritize recent dates for current data
            current_date = datetime.now()
            
            # Get available date folders and prioritize recent ones
            try:
                response = self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix='users_screenshots/',
                    Delimiter='/'
                )
                
                date_folders = []
                if 'CommonPrefixes' in response:
                    for prefix in response['CommonPrefixes']:
                        folder = prefix['Prefix'].replace('users_screenshots/', '').rstrip('/')
                        if folder and '-' in folder:  # Date format like 2025-10-08
                            date_folders.append(folder)
                
                # Sort dates to process most recent first
                date_folders.sort(reverse=True)
                logger.info(f"Found {len(date_folders)} date folders, processing most recent first...")
                
                # Process recent date folders first for current data
                processed_files = 0
                for date_folder in date_folders[:15]:  # Focus on recent 15 days
                    if processed_files >= 1000:  # Increased limit for better coverage
                        break
                        
                    logger.info(f"Processing date folder: {date_folder}")
                    
                    # Get all files from this date folder
                    date_response = self.s3_client.list_objects_v2(
                        Bucket=self.bucket_name,
                        Prefix=f'users_screenshots/{date_folder}/',
                        MaxKeys=500  # Process more files per date for accuracy
                    )
                    
                    if 'Contents' in date_response:
                        for obj in date_response['Contents']:
                            if obj['Key'].endswith('.webp'):
                                processed_files += 1
                                self._process_file_for_users_data(obj, users_data, all_dates)
                                total_files += 1
                                total_size += obj['Size']
                        
                        logger.info(f"  Processed {len([o for o in date_response['Contents'] if o['Key'].endswith('.webp')])} files from {date_folder}")
                
                logger.info(f"Fresh scan complete: {processed_files} files processed from recent dates")
                
            except Exception as e:
                logger.error(f"Error in fresh scan: {e}")
                # Fallback to standard scan
                logger.warning("Using fallback scan...")
                
                response = self.s3_client.list_objects_v2(
                    Bucket=self.bucket_name,
                    Prefix='users_screenshots/',
                    MaxKeys=1000  # Increased for better current data
                )
                
                if 'Contents' in response:
                    for obj in response['Contents']:
                        if obj['Key'].endswith('.webp'):
                            processed_files += 1
                            self._process_file_for_users_data(obj, users_data, all_dates)
                            total_files += 1
                            total_size += obj['Size']
            
            # Calculate metrics from sample data
            total_users = len(users_data)
            active_users = len([u for u in users_data.values() if u['file_count'] > 0])
            
            logger.info(f"FRESH SCAN Processing Summary:")
            logger.info(f"  - Files processed: {processed_files}")
            logger.info(f"  - Total files (scanned): {total_files}")
            logger.info(f"  - Users found: {total_users}")
            logger.info(f"  - Active users: {active_users}")
            logger.info(f"  - Date range: {min(all_dates) if all_dates else 'N/A'} to {max(all_dates) if all_dates else 'N/A'}")
            logger.info(f"  - Showing current date for live tracking: {datetime.now().strftime('%m/%d/%Y')}")
            
            # RELIABLE GROWTH calculation based on recent vs older data
            if all_dates and len(all_dates) > 1:
                unique_dates = sorted(list(set(all_dates)), reverse=True)  # Most recent first
                
                # Compare recent week vs previous week
                if len(unique_dates) >= 7:
                    recent_week = unique_dates[:7]
                    previous_week = unique_dates[7:14] if len(unique_dates) >= 14 else unique_dates[7:]
                    
                    recent_count = sum(all_dates.count(date) for date in recent_week)
                    previous_count = sum(all_dates.count(date) for date in previous_week)
                    
                    if previous_count > 0:
                        growth_rate = round(((recent_count - previous_count) / previous_count) * 100, 1)
                    else:
                        growth_rate = 100.0 if recent_count > 0 else 0.0
                        
                    logger.info(f"Growth: Recent week ({recent_count}) vs Previous week ({previous_count}) = {growth_rate}%")
                else:
                    growth_rate = 100.0
            else:
                growth_rate = 0.0
            
            growth_positive = growth_rate >= 0
            growth_text = f"↑{growth_rate}% growth rate" if growth_positive else f"↓{abs(growth_rate)}% decline"
            
            # CURRENT DATE handling - Always show current date for live tracking
            current_date = datetime.now()
            last_updated = current_date.strftime("%m/%d/%Y")
            
            # Also show actual latest file date from S3
            if all_dates:
                unique_dates = list(set(all_dates))
                unique_dates.sort(reverse=True)
                actual_latest_date = unique_dates[0]
                logger.info(f"Actual latest file date: {actual_latest_date}, Current date: {last_updated}")
            
            s3_last_updated = last_updated
            
            # Create top users list with CURRENT data
            top_users = []
            sorted_users = sorted(users_data.items(), key=lambda x: x[1]['file_count'], reverse=True)
            
            for user_email, data in sorted_users[:5]:  # Top 5 users
                # Generate URLs for latest files
                latest_screenshots = sorted(data['screenshots'], key=lambda x: x['last_modified'], reverse=True)
                latest_file = latest_screenshots[0]['filename'] if latest_screenshots else None
                latest_date = max(data['dates']) if data['dates'] else None
                latest_file_key = f"users_screenshots/{latest_date}/{user_email}/{latest_file}" if latest_file and latest_date else None
                
                # Prepare current screenshots with URLs (up to 3 most recent)
                current_screenshots = []
                for screenshot in latest_screenshots[:3]:
                    current_screenshots.append({
                        'filename': screenshot['filename'],
                        'date': screenshot['date'],
                        'file_key': screenshot['file_key'],
                        'file_url': self.screenshot_parser._generate_signed_url(screenshot['file_key']),
                        'direct_url': self._generate_direct_s3_url(screenshot['file_key']),
                        'file_size_mb': screenshot['file_size_mb'],
                        'last_modified': screenshot['last_modified']
                    })
                
                top_users.append({
                    'user_email': user_email,
                    'file_count': data['file_count'],
                    'total_size_mb': round(data['total_size'] / (1024 * 1024), 2),
                    'days_active': len(data['dates']),
                    'latest_file': latest_file,
                    'latest_file_url': self.screenshot_parser._generate_signed_url(latest_file_key) if latest_file_key else None,
                    'direct_file_url': self._generate_direct_s3_url(latest_file_key) if latest_file_key else None,
                    'latest_date': latest_date,
                    'screenshots': current_screenshots
                })
            
            result = {
                'total_count': total_users,
                'active_count': active_users,
                's3_users': total_users,
                's3_files': total_files,
                's3_size_gb': total_size / (1024 * 1024 * 1024),
                'growth_rate': growth_rate,
                'growth_positive': growth_positive,
                'growth_text': growth_text,
                'last_updated': last_updated,
                's3_last_updated': s3_last_updated,
                'top_users': top_users
            }
            
            logger.info(f"FRESH scan completed: {total_users} users, {total_files} files, {total_size/(1024*1024*1024):.3f}GB")
            return result
            
        except Exception as e:
            logger.error(f"Error getting fresh screenshots data: {str(e)}")
            # Return default structure
            return {
                'total_count': 0,
                'active_count': 0,
                's3_users': 0,
                's3_files': 0,
                's3_size_gb': 0,
                'growth_rate': 0,
                'growth_positive': False,
                'growth_text': "No data available",
                'last_updated': datetime.now().strftime("%m/%d/%Y"),
                's3_last_updated': datetime.now().strftime("%m/%d/%Y"),
                'top_users': []
            }
