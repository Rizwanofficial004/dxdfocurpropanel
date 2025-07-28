#!/usr/bin/env python3
"""
Users Summary API - Get all users with screenshot counts, folder counts, and last update times
This API provides dashboard summary data for all users from S3
"""

import os
import sys
import django
from django.conf import settings
import json
import requests
from datetime import datetime, timezone
import pytz
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from collections import defaultdict
import time

# Add the project directory to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UsersSummaryAPI:
    """API class to get users summary with screenshot counts and folder counts"""
    
    def __init__(self):
        self.s3_client = None
        self.bucket_name = 'ddsfocustime'
        self.timezone = pytz.timezone('Europe/Istanbul')  # Turkish timezone
        self.setup_s3_client()
    
    def setup_s3_client(self):
        """Initialize S3 client with credentials"""
        try:
            # Try to use AWS credentials from environment or AWS config
            self.s3_client = boto3.client('s3')
            logger.info("✅ S3 client initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize S3 client: {e}")
            self.s3_client = None
    
    def get_crm_users(self):
        """Fetch users from CRM API to get the master user list"""
        try:
            # Use the correct CRM API endpoint
            crm_url = "https://crm.deluxebilisim.com/api/staff"  # Changed from /staffs to /staff
            logger.info(f"🔍 Fetching users from CRM: {crm_url}")
            
            response = requests.get(crm_url, timeout=10)
            response.raise_for_status()
            
            users_data = response.json()
            logger.info(f"✅ CRM API returned {len(users_data)} users")
            
            # Process CRM users
            crm_users = {}
            for user in users_data:
                email = user.get('email', '').strip().lower()
                if email:
                    crm_users[email] = {
                        'name': user.get('name', 'Unknown'),
                        'email': email,
                        'staff_id': user.get('staff_id', ''),
                        'phone': user.get('phone', ''),
                        'department': user.get('department', ''),
                        'designation': user.get('designation', ''),
                        'profile_image': user.get('profile_image', ''),
                        'rating': user.get('rating', 0)
                    }
            
            logger.info(f"📊 Processed {len(crm_users)} valid CRM users")
            return crm_users
            
        except Exception as e:
            logger.error(f"❌ Error fetching CRM users: {e}")
            # Return some test data for now
            return {
                'haseeb@deluxebilisim.com': {
                    'name': 'Haseeb Ahmed',
                    'email': 'haseeb@deluxebilisim.com',
                    'staff_id': 'EMP001',
                    'phone': '',
                    'department': 'Development',
                    'designation': 'Developer',
                    'profile_image': '',
                    'rating': 4.5
                },
                'zahra@deluxebilisim.com': {
                    'name': 'Zahra H',
                    'email': 'zahra@deluxebilisim.com',
                    'staff_id': 'EMP002',
                    'phone': '',
                    'department': 'Development',
                    'designation': 'Developer',
                    'profile_image': '',
                    'rating': 4.2
                }
            }
    
    def scan_s3_for_users(self):
        """Scan S3 bucket to get all users with their screenshot and folder data"""
        if not self.s3_client:
            logger.error("❌ S3 client not available")
            return {}
        
        try:
            logger.info(f"🔍 Scanning S3 bucket '{self.bucket_name}' for user data...")
            
            # Dictionary to store user data
            users_data = defaultdict(lambda: {
                'email': '',
                'screenshot_count': 0,
                'folder_count': 0,
                'folders': set(),
                'last_modified': None,
                'total_size_mb': 0
            })
            
            # Scan the screenshots/ prefix
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix='screenshots/',
                Delimiter='/'
            )
            
            processed_objects = 0
            
            for page in page_iterator:
                # Process common prefixes (user folders)
                if 'CommonPrefixes' in page:
                    for prefix_info in page['CommonPrefixes']:
                        user_prefix = prefix_info['Prefix']
                        # Extract email from path like 'screenshots/user@example.com/'
                        user_email = user_prefix.replace('screenshots/', '').rstrip('/')
                        
                        if '@' in user_email and '.' in user_email:
                            logger.info(f"📁 Found user folder: {user_email}")
                            users_data[user_email]['email'] = user_email
                            
                            # Now scan this user's folders and files
                            self.scan_user_data(user_email, users_data[user_email])
                
                # Also process direct objects in case there are files at root level
                if 'Contents' in page:
                    for obj in page['Contents']:
                        processed_objects += 1
                        if processed_objects % 1000 == 0:
                            logger.info(f"📊 Processed {processed_objects} objects...")
            
            logger.info(f"✅ S3 scan completed. Found {len(users_data)} users")
            
            # Convert sets to lists and calculate final stats
            final_users_data = {}
            for email, data in users_data.items():
                data['folders'] = list(data['folders'])
                data['folder_count'] = len(data['folders'])
                final_users_data[email] = dict(data)
            
            return final_users_data
            
        except Exception as e:
            logger.error(f"❌ Error scanning S3: {e}")
            return {}
    
    def scan_user_data(self, user_email, user_data):
        """Scan specific user's data in S3"""
        try:
            user_prefix = f"screenshots/{user_email}/"
            logger.info(f"📸 Scanning data for user: {user_email}")
            
            # Get all objects for this user
            paginator = self.s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=self.bucket_name,
                Prefix=user_prefix
            )
            
            for page in page_iterator:
                if 'Contents' in page:
                    for obj in page['Contents']:
                        key = obj['Key']
                        size_bytes = obj['Size']
                        last_modified = obj['LastModified']
                        
                        # Update total size
                        user_data['total_size_mb'] += size_bytes / (1024 * 1024)
                        
                        # Update last modified time
                        if user_data['last_modified'] is None or last_modified > user_data['last_modified']:
                            user_data['last_modified'] = last_modified
                        
                        # Count screenshots (image files)
                        if any(key.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                            user_data['screenshot_count'] += 1
                        
                        # Extract folder information
                        # Path structure: screenshots/user@example.com/folder_name/file.ext
                        path_parts = key.replace(user_prefix, '').split('/')
                        if len(path_parts) >= 2 and path_parts[0]:  # Has a folder
                            folder_name = path_parts[0]
                            user_data['folders'].add(folder_name)
            
            logger.info(f"✅ User {user_email}: {user_data['screenshot_count']} screenshots, {len(user_data['folders'])} folders")
            
        except Exception as e:
            logger.error(f"❌ Error scanning user {user_email}: {e}")
    
    def format_time_ago(self, timestamp):
        """Format timestamp to 'X minutes ago' format"""
        if not timestamp:
            return "Never"
        
        try:
            # Ensure timestamp is timezone-aware
            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(tzinfo=timezone.utc)
            
            # Convert to Turkish timezone
            local_timestamp = timestamp.astimezone(self.timezone)
            now = datetime.now(self.timezone)
            
            diff = now - local_timestamp
            
            if diff.days > 0:
                return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
            elif diff.seconds >= 3600:
                hours = diff.seconds // 3600
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            elif diff.seconds >= 60:
                minutes = diff.seconds // 60
                return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
            else:
                return "Just now"
                
        except Exception as e:
            logger.error(f"❌ Error formatting timestamp: {e}")
            return "Unknown"
    
    def get_users_summary(self):
        """Get comprehensive users summary with CRM data + S3 data"""
        start_time = time.time()
        logger.info("🚀 Starting users summary generation...")
        
        # Get CRM users (master list)
        crm_users = self.get_crm_users()
        
        # Get S3 data
        s3_users = self.scan_s3_for_users()
        
        # Merge CRM and S3 data
        combined_users = []
        
        # Start with CRM users and add S3 data
        for email, crm_data in crm_users.items():
            s3_data = s3_users.get(email, {})
            
            user_summary = {
                'name': crm_data['name'],
                'email': email,
                'staff_id': crm_data['staff_id'],
                'department': crm_data['department'],
                'designation': crm_data['designation'],
                'profile_image': crm_data['profile_image'],
                'rating': crm_data['rating'],
                'total_screenshots': s3_data.get('screenshot_count', 0),
                'total_folders': s3_data.get('folder_count', 0),
                'total_size_mb': round(s3_data.get('total_size_mb', 0), 2),
                'last_activity': self.format_time_ago(s3_data.get('last_modified')),
                'last_activity_raw': s3_data.get('last_modified').isoformat() if s3_data.get('last_modified') else None,
                'has_screenshots': s3_data.get('screenshot_count', 0) > 0,
                'folders_list': s3_data.get('folders', [])
            }
            combined_users.append(user_summary)
        
        # Add S3-only users (users not in CRM)
        for email, s3_data in s3_users.items():
            if email not in crm_users:
                user_summary = {
                    'name': email.split('@')[0].title(),  # Use email prefix as name
                    'email': email,
                    'staff_id': 'S3_ONLY',
                    'department': 'Unknown',
                    'designation': 'Unknown',
                    'profile_image': '',
                    'rating': 0,
                    'total_screenshots': s3_data.get('screenshot_count', 0),
                    'total_folders': s3_data.get('folder_count', 0),
                    'total_size_mb': round(s3_data.get('total_size_mb', 0), 2),
                    'last_activity': self.format_time_ago(s3_data.get('last_modified')),
                    'last_activity_raw': s3_data.get('last_modified').isoformat() if s3_data.get('last_modified') else None,
                    'has_screenshots': s3_data.get('screenshot_count', 0) > 0,
                    'folders_list': s3_data.get('folders', [])
                }
                combined_users.append(user_summary)
        
        # Sort by total screenshots (descending)
        combined_users.sort(key=lambda x: x['total_screenshots'], reverse=True)
        
        # Calculate summary statistics
        total_users = len(combined_users)
        users_with_screenshots = len([u for u in combined_users if u['has_screenshots']])
        total_screenshots_all = sum(u['total_screenshots'] for u in combined_users)
        total_folders_all = sum(u['total_folders'] for u in combined_users)
        total_size_all = sum(u['total_size_mb'] for u in combined_users)
        
        execution_time = round(time.time() - start_time, 2)
        
        response_data = {
            'success': True,
            'message': 'Users summary generated successfully',
            'data': {
                'users': combined_users,
                'summary': {
                    'total_users': total_users,
                    'users_with_screenshots': users_with_screenshots,
                    'users_without_screenshots': total_users - users_with_screenshots,
                    'total_screenshots_all_users': total_screenshots_all,
                    'total_folders_all_users': total_folders_all,
                    'total_size_mb_all_users': round(total_size_all, 2),
                    'average_screenshots_per_user': round(total_screenshots_all / total_users if total_users > 0 else 0, 1),
                    'average_folders_per_user': round(total_folders_all / total_users if total_users > 0 else 0, 1)
                }
            },
            'meta': {
                'execution_time_seconds': execution_time,
                'generated_at': datetime.now(self.timezone).isoformat(),
                'timezone': 'Europe/Istanbul',
                'bucket_scanned': self.bucket_name,
                'crm_users_count': len(crm_users),
                's3_users_count': len(s3_users)
            }
        }
        
        logger.info(f"✅ Users summary completed in {execution_time}s - {total_users} users, {total_screenshots_all} total screenshots")
        return response_data

# Django view for the API endpoint
@method_decorator(csrf_exempt, name='dispatch')
class UsersSummaryView(View):
    """Django view to handle users summary API requests"""
    
    def get(self, request):
        """Handle GET request for users summary"""
        try:
            api = UsersSummaryAPI()
            result = api.get_users_summary()
            return JsonResponse(result)
        except Exception as e:
            logger.error(f"❌ Error in UsersSummaryView: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e),
                'message': 'Failed to generate users summary'
            }, status=500)

# Function for standalone testing
def test_users_summary_api():
    """Test the users summary API"""
    print("🧪 Testing Users Summary API...")
    
    api = UsersSummaryAPI()
    result = api.get_users_summary()
    
    print("\n📊 USERS SUMMARY API RESULT:")
    print("=" * 50)
    print(f"Success: {result['success']}")
    print(f"Total Users: {result['data']['summary']['total_users']}")
    print(f"Users with Screenshots: {result['data']['summary']['users_with_screenshots']}")
    print(f"Total Screenshots (All Users): {result['data']['summary']['total_screenshots_all_users']}")
    print(f"Total Folders (All Users): {result['data']['summary']['total_folders_all_users']}")
    print(f"Execution Time: {result['meta']['execution_time_seconds']}s")
    
    print("\n👥 TOP 10 USERS BY SCREENSHOT COUNT:")
    print("-" * 80)
    for i, user in enumerate(result['data']['users'][:10], 1):
        print(f"{i:2d}. {user['name']:<20} | {user['total_screenshots']:>6} screenshots | {user['total_folders']:>3} folders | {user['last_activity']}")
    
    print(f"\n📈 API Response Size: {len(str(result))} characters")
    return result

if __name__ == "__main__":
    # Run test when executed directly
    test_users_summary_api()
