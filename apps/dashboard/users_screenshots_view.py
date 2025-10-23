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
from django.conf import settings

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
                aws_access_key_id= getattr(settings, "AWS_ACCESS_KEY_ID", os.getenv("AWS_ACCESS_KEY_ID")),
                aws_secret_access_key= getattr(settings, "AWS_SECRET_ACCESS_KEY", os.getenv("AWS_SECRET_ACCESS_KEY")),
                region_name= getattr(settings, "AWS_REGION", os.getenv("AWS_REGION"))
            )
            logger.info("S3 client initialized successfully for users_screenshots API")
        except Exception as e:
            logger.error(f"Failed to initialize S3 client: {str(e)}")

    def _process_file_for_users_data(self, obj, users_data, all_dates):
        """Helper method to process a file and update users_data - only keep most recent screenshot"""
        key_parts = obj['Key'].split('/')
        
        if len(key_parts) >= 4:
            date_part = key_parts[1]  # 2025-10-08
            user_email = key_parts[2]  # user@domain.com
            filename = key_parts[-1]   # image.webp
            
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

            # Screenshot info
            screenshot_info = {
                'filename': filename,
                'date': date_part,
                'file_key': obj['Key'],
                'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                'last_modified': obj['LastModified'].isoformat()
            }

            # Always count total files/size/dates
            users_data[user_email]['file_count'] += 1
            users_data[user_email]['total_size'] += obj['Size']
            users_data[user_email]['dates'].add(date_part)
            all_dates.append(date_part)

            # ✅ Keep only the most recently modified screenshot
            existing_latest = users_data[user_email]['latest_modified']
            if existing_latest is None or obj['LastModified'] > existing_latest:
                users_data[user_email]['latest_modified'] = obj['LastModified']
                users_data[user_email]['latest_file'] = filename
                users_data[user_email]['latest_date'] = date_part
                users_data[user_email]['screenshots'] = [screenshot_info]            
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
        Optional query param: ?date=YYYY-MM-DD
        """
        try:
            # 1️⃣ Define force_refresh first
            force_refresh = request.GET.get('refresh', '').lower() == 'true'

            # 2️⃣ Get requested date (optional)
            requested_date = request.GET.get('date')
            if requested_date:
                try:
                    datetime.strptime(requested_date, '%Y-%m-%d')
                except ValueError:
                    return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)
            else:
                requested_date = datetime.now().strftime('%Y-%m-%d')

            # 3️⃣ Clear cache if force_refresh
            if force_refresh:
                logger.info("Force refresh requested - clearing cache")
                _api_cache['data'] = None
                _api_cache['timestamp'] = None

            # 4️⃣ Check cache
            current_time = time.time()
            if (not force_refresh and _api_cache['data'] and 
                _api_cache['timestamp'] and current_time - _api_cache['timestamp'] < _api_cache['cache_duration']):
                logger.info("Returning cached data for speed")
                return Response(_api_cache['data'], status=status.HTTP_200_OK)
            
            # Get fresh data from users_screenshots folder
            start_time = time.time()
            screenshots_data = self._get_comprehensive_screenshots_data(requested_date=requested_date)
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
                    "s3_users_sample": screenshots_data['top_users'],  # Top 5 users with current data
                    "all_users": screenshots_data.get('all_users', [])  # ALL users with screenshots
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
    
    def _get_comprehensive_screenshots_data(self, requested_date=None):
        """Get dashboard data for a specific date (latest screenshots only)"""
        try:
            users_data = {}
            total_files = 0
            total_size = 0
            all_dates = []

            if requested_date is None:
                requested_date = datetime.now().strftime('%Y-%m-%d')

            # Fetch only the specific date folder
            date_folders = [requested_date]

            logger.info(f"Processing screenshots for date: {requested_date}")

            for date_folder in date_folders:
                continuation_token = None
                while True:
                    if continuation_token:
                        response = self.s3_client.list_objects_v2(
                            Bucket=self.bucket_name,
                            Prefix=f'users_screenshots/{date_folder}/',
                            MaxKeys=1000,
                            ContinuationToken=continuation_token
                        )
                    else:
                        response = self.s3_client.list_objects_v2(
                            Bucket=self.bucket_name,
                            Prefix=f'users_screenshots/{date_folder}/',
                            MaxKeys=1000
                        )

                    if 'Contents' in response:
                        for obj in response['Contents']:
                            if obj['Key'].endswith('.webp'):
                                self._process_file_for_users_data(obj, users_data, all_dates)
                                total_files += 1

                    if response.get('IsTruncated'):
                        continuation_token = response.get('NextContinuationToken')
                    else:
                        break

            # Process metrics as before, only using this date
            total_users = len(users_data)
            active_users = len([u for u in users_data.values() if u['file_count'] > 0])
            total_size_gb = total_size / (1024*1024*1024)

            top_users = []
            for user_email, data in users_data.items():
                latest_screenshots = sorted(data['screenshots'], key=lambda x: x['last_modified'], reverse=True)
                latest_file = latest_screenshots[0]['filename'] if latest_screenshots else None
                latest_file_key = f"users_screenshots/{requested_date}/{user_email}/{latest_file}" if latest_file else None

                current_screenshots = [
                    {
                        'filename': ss['filename'],
                        'date': ss['date'],
                        'file_key': ss['file_key'],
                        'file_url': self._generate_presigned_url(ss['file_key']),
                        'direct_url': self._generate_direct_s3_url(ss['file_key']),
                        'file_size_mb': ss['file_size_mb'],
                        'last_modified': ss['last_modified']
                    } for ss in latest_screenshots
                ]

                top_users.append({
                    'user_email': user_email,
                    'file_count': data['file_count'],
                    'total_size_mb': round(data['total_size'] / (1024*1024), 2),
                    'days_active': len(data['dates']),
                    'latest_file': latest_file,
                    'latest_file_url': self._generate_presigned_url(latest_file_key) if latest_file_key else None,
                    'direct_file_url': self._generate_direct_s3_url(latest_file_key) if latest_file_key else None,
                    'latest_date': requested_date,
                    'screenshots': current_screenshots
                })

            return {
                'total_count': total_users,
                'active_count': active_users,
                's3_users': total_users,
                's3_files': total_files,
                's3_size_gb': total_size_gb,
                'growth_rate': 0,
                'growth_positive': True,
                'growth_text': "Latest screenshots for selected date",
                'last_updated': requested_date,
                's3_last_updated': requested_date,
                'top_users': top_users
            }

        except Exception as e:
            logger.error(f"Error fetching screenshots for {requested_date}: {e}")
            return {
                'total_count': 0,
                'active_count': 0,
                's3_users': 0,
                's3_files': 0,
                's3_size_gb': 0,
                'growth_rate': 0,
                'growth_positive': False,
                'growth_text': "No data available",
                'last_updated': requested_date,
                's3_last_updated': requested_date,
                'top_users': []
            }
