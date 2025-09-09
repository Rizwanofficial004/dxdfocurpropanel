"""
Users Screenshots API View - Exactly like Employees API

This module provides an API endpoint that matches the exact structure
of the employees API but fetches dynamic data from users_screenshots/ folder only.
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

logger = logging.getLogger(__name__)


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
        """
        try:
            # Get comprehensive data from users_screenshots folder
            screenshots_data = self._get_comprehensive_screenshots_data()
            
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
                    }
                }
            }
            
            logger.info(f"Users screenshots data retrieved successfully - Total: {total_count}, Active: {active_count}, Growth: {growth_rate}%")
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
        """Get comprehensive data from users_screenshots folder only"""
        try:
            users_data = {}
            total_files = 0
            total_size = 0
            all_dates = []
            
            # Use paginator to handle large datasets efficiently
            paginator = self.s3_client.get_paginator('list_objects_v2')
            
            # Only search users_screenshots folder
            pages = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='users_screenshots/',
                PaginationConfig={'MaxItems': 1000}  # Limit for performance
            )
            
            logger.info("Starting to process users_screenshots folder...")
            
            processed_files = 0
            for page in pages:
                if 'Contents' in page:
                    logger.info(f"Processing page with {len(page['Contents'])} objects")
                    for obj in page['Contents']:
                        
                        if obj['Key'].endswith('.webp'):
                            processed_files += 1
                            
                            # Parse the key: users_screenshots/date/user_email/filename
                            key_parts = obj['Key'].split('/')
                            
                            if len(key_parts) >= 4:
                                folder = key_parts[0]  # users_screenshots
                                date_part = key_parts[1]  # 2025-09-01
                                user_email = key_parts[2]  # nawaz_at_dxdglobal.com
                                filename = key_parts[-1]  # image file
                                
                                # Track user data
                                if user_email not in users_data:
                                    users_data[user_email] = {
                                        'file_count': 0,
                                        'total_size': 0,
                                        'dates': set(),
                                        'latest_file': None,
                                        'latest_date': None,
                                        'screenshots': []  # Add list to store all screenshots
                                    }
                                
                                # Create screenshot entry
                                screenshot_key = obj['Key']
                                screenshot_info = {
                                    'filename': filename,
                                    'date': date_part,
                                    'file_key': screenshot_key,
                                    'file_url': self._generate_direct_s3_url(screenshot_key),
                                    'file_size_mb': round(obj['Size'] / (1024 * 1024), 3),
                                    'last_modified': obj['LastModified'].isoformat()
                                }
                                
                                # Add to screenshots list (limit to 20 most recent per user)
                                users_data[user_email]['screenshots'].append(screenshot_info)
                                if len(users_data[user_email]['screenshots']) > 20:
                                    # Keep only the 20 most recent screenshots
                                    users_data[user_email]['screenshots'] = sorted(
                                        users_data[user_email]['screenshots'], 
                                        key=lambda x: x['last_modified'], 
                                        reverse=True
                                    )[:20]
                                
                                # Update user stats
                                users_data[user_email]['file_count'] += 1
                                users_data[user_email]['total_size'] += obj['Size']
                                users_data[user_email]['dates'].add(date_part)
                                
                                # Track latest file
                                if (users_data[user_email]['latest_date'] is None or 
                                    obj['LastModified'] > users_data[user_email]['latest_date']):
                                    users_data[user_email]['latest_date'] = obj['LastModified']
                                    users_data[user_email]['latest_file'] = filename
                                
                                # Add to totals
                                total_files += 1
                                total_size += obj['Size']
                                all_dates.append(date_part)
            
            # Calculate metrics
            total_users = len(users_data)
            active_users = len([u for u in users_data.values() if u['file_count'] > 0])
            
            logger.info(f"S3 Processing Summary:")
            logger.info(f"  - Total users found: {total_users}")
            logger.info(f"  - Active users: {active_users}")
            logger.info(f"  - Total files: {total_files}")
            logger.info(f"  - Users data: {list(users_data.keys())}")
            
            # Calculate growth (simplified - comparing today vs yesterday file counts)
            today = datetime.now().strftime("%Y-%m-%d")
            yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            today_files = all_dates.count(today)
            yesterday_files = all_dates.count(yesterday)
            
            if yesterday_files > 0:
                growth_rate = round(((today_files - yesterday_files) / yesterday_files) * 100, 2)
            else:
                growth_rate = 100.0 if today_files > 0 else 0.0
            
            growth_positive = growth_rate >= 0
            growth_text = f"↑{growth_rate}% growth rate" if growth_positive else f"↓{abs(growth_rate)}% decline"
            
            # Get latest update date
            latest_date = max(all_dates) if all_dates else datetime.now().strftime("%Y-%m-%d")
            last_updated = datetime.strptime(latest_date, "%Y-%m-%d").strftime("%m/%d/%Y")
            s3_last_updated = last_updated
            
            # Create top users list with screenshots
            top_users = []
            sorted_users = sorted(users_data.items(), key=lambda x: x[1]['file_count'], reverse=True)
            
            for user_email, data in sorted_users[:10]:
                latest_file_key = f"users_screenshots/{max(data['dates'])}/{user_email}/{data['latest_file']}" if data['latest_file'] else None
                
                # Sort screenshots by most recent first
                sorted_screenshots = sorted(
                    data['screenshots'], 
                    key=lambda x: x['last_modified'], 
                    reverse=True
                )
                
                top_users.append({
                    'user_email': user_email,
                    'file_count': data['file_count'],
                    'total_size_mb': round(data['total_size'] / (1024 * 1024), 2),
                    'days_active': len(data['dates']),
                    'latest_file': data['latest_file'],
                    'latest_file_url': self._generate_direct_s3_url(latest_file_key) if latest_file_key else None,
                    'latest_date': data['latest_date'].strftime("%Y-%m-%d") if data['latest_date'] else None,
                    'screenshots': sorted_screenshots[:10]  # Include up to 10 most recent screenshots with full paths
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
            
            logger.info(f"Processed users_screenshots: {total_users} users, {total_files} files, {total_size/(1024*1024):.2f}MB")
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
