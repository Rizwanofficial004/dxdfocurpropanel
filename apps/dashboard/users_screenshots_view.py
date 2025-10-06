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

# Simple in-memory cache for speed
_api_cache = {
    'data': None,
    'timestamp': None,
    'cache_duration': 120  # 2 minutes cache
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
        """Helper method to process a file and update users_data - OPTIMIZED FOR SPEED"""
        # Parse the key: users_screenshots/date/user_email/filename
        key_parts = obj['Key'].split('/')
        
        if len(key_parts) >= 4:
            date_part = key_parts[1]  # 2025-10-04
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
                    'screenshots': []
                }
            
            # FAST VERSION: Only store essential data, skip expensive URL generation for now
            screenshot_info = {
                'filename': filename,
                'date': date_part,
                'file_key': obj['Key'],
                'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                'last_modified': obj['LastModified'].isoformat()
            }
            
            # Add to screenshots list (limit to 5 most recent per user for speed)
            if len(users_data[user_email]['screenshots']) < 5:
                users_data[user_email]['screenshots'].append(screenshot_info)
            
            # Update user stats
            users_data[user_email]['file_count'] += 1
            users_data[user_email]['total_size'] += obj['Size']
            users_data[user_email]['dates'].add(date_part)
            
            # Track latest file (prioritize most recent)
            if (users_data[user_email]['latest_date'] is None or 
                obj['LastModified'] > users_data[user_email]['latest_date']):
                users_data[user_email]['latest_date'] = obj['LastModified']
                users_data[user_email]['latest_file'] = filename
            
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
        GET /api/dashboard/employees/
        
        Returns users_screenshots data in the exact same format as employees API
        OPTIMIZED WITH CACHING FOR SPEED
        """
        try:
            # Check cache first for speed
            current_time = time.time()
            if (_api_cache['data'] is not None and 
                _api_cache['timestamp'] is not None and 
                current_time - _api_cache['timestamp'] < _api_cache['cache_duration']):
                
                logger.info("Returning cached data for speed")
                return Response(_api_cache['data'], status=status.HTTP_200_OK)
            
            # Get comprehensive data from users_screenshots folder
            start_time = time.time()
            screenshots_data = self._get_comprehensive_screenshots_data()
            processing_time = time.time() - start_time
            
            logger.info(f"Data processing completed in {processing_time:.2f} seconds")
            
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
                    "s3_users_sample": screenshots_data['top_users'][:5]  # Top 5 users
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
                    "processing_time_seconds": processing_time
                }
            }
            
            # Cache the result for faster subsequent calls
            _api_cache['data'] = dashboard_data
            _api_cache['timestamp'] = current_time
            
            logger.info(f"Users screenshots data retrieved successfully - Total: {total_count}, Active: {active_count}, Growth: {growth_rate}% (Cached for speed)")
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
        """Get FAST dashboard data with RELIABLE data discovery from users_screenshots folder"""
        try:
            users_data = {}
            total_files = 0
            total_size = 0
            all_dates = []
            
            # FAST APPROACH: Optimized for speed with minimal but sufficient data
            
            # Reduced scan for maximum speed while maintaining accuracy
            paginator = self.s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='users_screenshots/',
                PaginationConfig={
                    'MaxItems': 500,   # Reduced for speed
                    'PageSize': 200    # Smaller pages for faster processing
                }
            )
            
            logger.info("Starting FAST scan of users_screenshots folder...")
            
            processed_files = 0
            for page in pages:
                if 'Contents' in page:
                    logger.info(f"Processing page with {len(page['Contents'])} objects")
                    for obj in page['Contents']:
                        if obj['Key'].endswith('.webp'):
                            processed_files += 1
                            self._process_file_for_users_data(obj, users_data, all_dates)
                            total_files += 1
                            total_size += obj['Size']
                            
                            # Early exit for speed - sufficient data for dashboard
                            if processed_files >= 300:  # Reduced for speed
                                logger.info(f"Found sufficient data ({processed_files} files), proceeding for speed...")
                                break
                    if processed_files >= 300:
                        break
            
            logger.info(f"Fast scan complete: {processed_files} files processed")
            
            # USE ACTUAL SCANNED DATA instead of estimates for current data
            if processed_files > 0:
                logger.info(f"Using actual scanned data: {total_files} files, {total_size/(1024*1024*1024):.2f}GB")
                # Use the actual data we scanned for more accurate current information
            else:
                # FALLBACK: If no data found, use basic reliable scan
                logger.warning("No data found in first scan, trying fallback...")
                
                try:
                    response = self.s3_client.list_objects_v2(
                        Bucket=self.bucket_name,
                        Prefix='users_screenshots/',
                        MaxKeys=500  # Increased for better current data
                    )
                    
                    if 'Contents' in response:
                        for obj in response['Contents']:
                            if obj['Key'].endswith('.webp'):
                                processed_files += 1
                                self._process_file_for_users_data(obj, users_data, all_dates)
                                total_files += 1
                                total_size += obj['Size']
                        
                        logger.info(f"Fallback scan found: {total_files} files, {total_size/(1024*1024*1024):.2f}GB")
                except Exception as e:
                    logger.error(f"Fallback scan failed: {e}")
                    # Final fallback - but still use current date
                    total_files = 0
                    total_size = 0
            
            # Calculate metrics from sample data
            total_users = len(users_data)
            active_users = len([u for u in users_data.values() if u['file_count'] > 0])
            
            logger.info(f"FAST SCAN Processing Summary:")
            logger.info(f"  - Files processed: {processed_files}")
            logger.info(f"  - Total files (scanned): {total_files}")
            logger.info(f"  - Users found: {total_users}")
            logger.info(f"  - Active users: {active_users}")
            logger.info(f"  - Date range: {min(all_dates) if all_dates else 'N/A'} to {max(all_dates) if all_dates else 'N/A'}")
            logger.info(f"  - Showing current date for live tracking: {datetime.now().strftime('%m/%d/%Y')}")
            logger.info(f"  - Processing optimized for speed")
            
            # RELIABLE GROWTH calculation
            if all_dates and len(all_dates) > 1:
                unique_dates = sorted(list(set(all_dates)), reverse=True)  # Most recent first
                
                # Simple and reliable growth calculation
                if len(unique_dates) >= 2:
                    recent_count = sum(all_dates.count(date) for date in unique_dates[:len(unique_dates)//2])
                    older_count = sum(all_dates.count(date) for date in unique_dates[len(unique_dates)//2:])
                    
                    if older_count > 0:
                        growth_rate = round(((recent_count - older_count) / older_count) * 100, 1)
                    else:
                        growth_rate = 100.0 if recent_count > 0 else 0.0
                        
                    logger.info(f"Growth: Recent ({recent_count}) vs Older ({older_count}) = {growth_rate}%")
                else:
                    growth_rate = 100.0
            else:
                growth_rate = 0.0
            
            growth_positive = growth_rate >= 0
            growth_text = f"↑{growth_rate}% growth rate" if growth_positive else f"↓{abs(growth_rate)}% decline"
            
            # REAL-TIME DATE handling - Always show current date for live tracking
            current_date = datetime.now()
            last_updated = current_date.strftime("%m/%d/%Y")
            
            # Also check for actual latest file dates from S3
            if all_dates:
                unique_dates = list(set(all_dates))
                unique_dates.sort(reverse=True)
                actual_latest_date = unique_dates[0]
                logger.info(f"Actual latest file date: {actual_latest_date}, but showing current date for live tracking: {last_updated}")
            else:
                logger.info(f"No historical dates found, showing current date for live tracking: {last_updated}")
            
            s3_last_updated = last_updated
            
            # Create top users list FAST - minimal data for speed
            top_users = []
            sorted_users = sorted(users_data.items(), key=lambda x: x[1]['file_count'], reverse=True)
            
            for user_email, data in sorted_users[:4]:  # Limit to top 4 users for speed
                # Generate URLs only for latest file to save time
                latest_screenshots = sorted(data['screenshots'], key=lambda x: x['last_modified'], reverse=True)
                latest_file = latest_screenshots[0]['filename'] if latest_screenshots else None
                latest_date = max(data['dates']) if data['dates'] else None
                latest_file_key = f"users_screenshots/{latest_date}/{user_email}/{latest_file}" if latest_file and latest_date else None
                
                # Prepare screenshots with URLs only for display (limited to 3 for speed)
                fast_screenshots = []
                for screenshot in latest_screenshots[:3]:  # Only 3 screenshots for speed
                    fast_screenshots.append({
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
                    'screenshots': fast_screenshots  # Limited screenshots for speed
                })
            
            result = {
                'total_count': total_users,
                'active_count': active_users,
                's3_users': total_users,
                's3_files': total_files,  # Use estimated total
                's3_size_gb': total_size / (1024 * 1024 * 1024),  # Use estimated total
                'growth_rate': growth_rate,
                'growth_positive': growth_positive,
                'growth_text': growth_text,
                'last_updated': last_updated,
                's3_last_updated': s3_last_updated,
                'top_users': top_users
            }
            
            logger.info(f"FAST scan completed: {total_users} users, {total_files} files (scanned), {total_size/(1024*1024*1024):.2f}GB")
            return result
            
        except Exception as e:
            logger.error(f"Error getting comprehensive screenshots data: {str(e)}")
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
