"""
ScreenshotParser - Enhanced S3 screenshot parsing with signed URLs
This module provides comprehensive screenshot parsing functionality with signed URL generation for frontend accessibility.
"""

import os
import boto3
import logging
import re
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)

class ScreenshotParser:
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID", "AKIARSU6EUUWMQ5I2JWC"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", "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"),
            region_name="eu-north-1"
        )

    def _generate_signed_url(self, key, expires_in=3600):
        """Generate a pre-signed URL for private S3 objects"""
        try:
            signed_url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in
            )
            logger.info(f"Generated signed URL for {key}: {signed_url[:100]}...")
            return signed_url
        except Exception as e:
            logger.error(f"Error generating signed URL for {key}: {str(e)}")
            # Return direct URL as fallback
            return f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"

    def _parse_screenshot_details(self, key, obj):
        try:
            # Split S3 key
            parts = key.split('/')
            if len(parts) < 4:
                return None

            folder = parts[0]
            date_part = parts[1]
            user_folder = parts[2]
            filename = parts[-1]

            # Extract time from filename
            time_match = re.search(r'(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})', filename)
            if time_match:
                file_date = time_match.group(1)
                file_time = time_match.group(2).replace('-', ':')
            else:
                file_date = date_part
                file_time = "00:00:00"

            # Generate signed URL instead of raw S3 URL
            signed_url = self._generate_signed_url(key)

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
                'screenshot_url': signed_url,  # Frontend-accessible signed URL
                'direct_url': f"https://{self.bucket_name}.s3.eu-north-1.amazonaws.com/{key}"  # Direct URL for reference
            }

        except Exception as e:
            logger.error(f"Error parsing screenshot details for {key}: {str(e)}")
            return None

    def get_user_screenshots(self, user_email, limit=None):
        """Get all screenshots for a specific user with signed URLs"""
        try:
            prefix = f"users_screenshots/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            screenshots = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    if user_email in key:
                        screenshot_data = self._parse_screenshot_details(key, obj)
                        if screenshot_data:
                            screenshots.append(screenshot_data)

            # Sort by datetime (newest first)
            screenshots.sort(key=lambda x: x['datetime'], reverse=True)
            
            if limit:
                screenshots = screenshots[:limit]

            return screenshots

        except Exception as e:
            logger.error(f"Error getting screenshots for user {user_email}: {str(e)}")
            return []

    def get_latest_screenshot_for_user(self, user_email):
        """Get the latest screenshot for a specific user with signed URL"""
        screenshots = self.get_user_screenshots(user_email, limit=1)
        return screenshots[0] if screenshots else None

    def get_all_users_latest_screenshots(self):
        """Get latest screenshot for all users with signed URLs"""
        try:
            prefix = "users_screenshots/"
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            users_screenshots = {}
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    screenshot_data = self._parse_screenshot_details(key, obj)
                    
                    if screenshot_data:
                        user_email = screenshot_data['user_folder']
                        
                        # Keep only the latest screenshot for each user
                        if user_email not in users_screenshots:
                            users_screenshots[user_email] = screenshot_data
                        else:
                            # Compare datetime to keep the latest
                            current_datetime = datetime.strptime(screenshot_data['datetime'], '%Y-%m-%d %H:%M:%S')
                            existing_datetime = datetime.strptime(users_screenshots[user_email]['datetime'], '%Y-%m-%d %H:%M:%S')
                            
                            if current_datetime > existing_datetime:
                                users_screenshots[user_email] = screenshot_data

            return list(users_screenshots.values())

        except Exception as e:
            logger.error(f"Error getting all users latest screenshots: {str(e)}")
            return []

    def get_screenshots_by_date_range(self, start_date, end_date, user_email=None):
        """Get screenshots within a date range with signed URLs"""
        try:
            prefix = "users_screenshots/"
            if user_email:
                # Filter by user if specified
                prefix += f"{start_date}/{user_email}/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )

            screenshots = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    key = obj['Key']
                    screenshot_data = self._parse_screenshot_details(key, obj)
                    
                    if screenshot_data:
                        # Filter by date range
                        screenshot_date = datetime.strptime(screenshot_data['date'], '%Y-%m-%d')
                        start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                        end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                        
                        if start_dt <= screenshot_date <= end_dt:
                            # Filter by user if specified and not already filtered by prefix
                            if not user_email or screenshot_data['user_folder'] == user_email:
                                screenshots.append(screenshot_data)

            # Sort by datetime (newest first)
            screenshots.sort(key=lambda x: x['datetime'], reverse=True)
            
            return screenshots

        except Exception as e:
            logger.error(f"Error getting screenshots by date range: {str(e)}")
            return []
