#!/usr/bin/env python3
"""
S3 User Analytics API Server
Provides detailed analysis of S3 bucket:
1. List of all tasks/folders for each user
2. Count of all screenshots for each user
"""

import json
import http.server
import socketserver
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs
import threading
from collections import defaultdict
import os

class S3UserAnalyticsHandler(http.server.BaseHTTPRequestHandler):
    """HTTP handler for S3 User Analytics API"""
    
    # Cache for S3 data to avoid repeated calls
    _cache = {}
    _cache_timestamp = None
    _cache_duration = 300  # 5 minutes cache
    
    def do_GET(self):
        """Handle GET requests"""
        
        # Parse the URL
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        
        if parsed_path.path == '/api/s3/user-analytics/':
            self.handle_user_analytics(query_params)
        elif parsed_path.path == '/api/s3/user-details/':
            self.handle_user_details(query_params)
        elif parsed_path.path == '/api/s3/bucket-overview/':
            self.handle_bucket_overview()
        elif parsed_path.path == '/api/s3/users-list/':
            self.handle_users_list(query_params)
        elif parsed_path.path == '/api/s3/user-tasks/':
            self.handle_user_tasks(query_params)
        elif parsed_path.path == '/api/s3/user-screenshots/':
            self.handle_user_screenshots(query_params)
        elif parsed_path.path == '/':
            self.handle_root()
        else:
            self.send_404()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def get_s3_client(self):
        """Initialize S3 client with credentials"""
        return boto3.client(
            "s3",
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
    
    def get_bucket_name(self):
        """Get the correct S3 bucket name"""
        return "ddsfocustime"
    
    def is_cache_valid(self):
        """Check if cache is still valid"""
        if not self._cache_timestamp:
            return False
        time_diff = (datetime.now() - self._cache_timestamp).total_seconds()
        return time_diff < self._cache_duration
    
    def scan_s3_bucket(self):
        """Scan S3 bucket for user data - with caching"""
        
        # Return cached data if still valid
        if self.is_cache_valid() and self._cache:
            print(f"📦 Using cached S3 data (age: {(datetime.now() - self._cache_timestamp).seconds}s)")
            return self._cache
        
        print("🔍 Scanning S3 bucket for user analytics...")
        start_time = datetime.now()
        
        try:
            s3_client = self.get_s3_client()
            bucket_name = self.get_bucket_name()
            
            # Data structures to collect information
            users_data = {}
            total_objects = 0
            
            # Scan the entire bucket
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Prefix='screenshots/'  # Focus on screenshots folder
            )
            
            print(f"📊 Analyzing bucket '{bucket_name}'...")
            
            for page in page_iterator:
                if 'Contents' not in page:
                    continue
                    
                for obj in page['Contents']:
                    key = obj['Key']
                    size = obj['Size']
                    last_modified = obj['LastModified']
                    total_objects += 1
                    
                    # Parse the S3 key structure: screenshots/user_email/folder/file
                    parts = key.split('/')
                    if len(parts) >= 4 and parts[0] == 'screenshots':
                        user_email_encoded = parts[1]  # e.g., haseebcodejourney_at_gmail.com
                        folder_name = parts[2]         # e.g., 2025-01-27
                        filename = parts[3]            # e.g., screenshot_001.webp
                        
                        # Convert encoded email back to normal format
                        user_email = user_email_encoded.replace('_at_', '@')
                        
                        # Initialize user data if not exists
                        if user_email not in users_data:
                            users_data[user_email] = {
                                'email': user_email,
                                'encoded_email': user_email_encoded,
                                'folders': {},
                                'total_screenshots': 0,
                                'total_size_bytes': 0,
                                'last_activity': None,
                                'first_activity': None
                            }
                        
                        user_data = users_data[user_email]
                        
                        # Initialize folder data if not exists
                        if folder_name not in user_data['folders']:
                            user_data['folders'][folder_name] = {
                                'folder_name': folder_name,
                                'screenshot_count': 0,
                                'total_size_bytes': 0,
                                'files': [],
                                'last_modified': None,
                                'first_modified': None
                            }
                        
                        folder_data = user_data['folders'][folder_name]
                        
                        # Update folder statistics
                        folder_data['screenshot_count'] += 1
                        folder_data['total_size_bytes'] += size
                        folder_data['files'].append({
                            'filename': filename,
                            'size_bytes': size,
                            'last_modified': last_modified.isoformat(),
                            's3_key': key
                        })
                        
                        # Update folder timestamps
                        if not folder_data['last_modified'] or last_modified.replace(tzinfo=None) > datetime.fromisoformat(folder_data['last_modified'].replace('Z', '+00:00')).replace(tzinfo=None):
                            folder_data['last_modified'] = last_modified.isoformat()
                        if not folder_data['first_modified'] or last_modified.replace(tzinfo=None) < datetime.fromisoformat(folder_data['first_modified'].replace('Z', '+00:00')).replace(tzinfo=None):
                            folder_data['first_modified'] = last_modified.isoformat()
                        
                        # Update user statistics
                        user_data['total_screenshots'] += 1
                        user_data['total_size_bytes'] += size
                        
                        # Update user timestamps
                        if not user_data['last_activity'] or last_modified.replace(tzinfo=None) > datetime.fromisoformat(user_data['last_activity'].replace('Z', '+00:00')).replace(tzinfo=None):
                            user_data['last_activity'] = last_modified.isoformat()
                        if not user_data['first_activity'] or last_modified.replace(tzinfo=None) < datetime.fromisoformat(user_data['first_activity'].replace('Z', '+00:00')).replace(tzinfo=None):
                            user_data['first_activity'] = last_modified.isoformat()
            
            # Convert folder dictionaries to sorted lists
            for user_email, user_data in users_data.items():
                folder_list = list(user_data['folders'].values())
                folder_list.sort(key=lambda x: x['last_modified'], reverse=True)
                user_data['folders_list'] = folder_list
                user_data['total_folders'] = len(folder_list)
                
                # Calculate sizes in MB
                user_data['total_size_mb'] = round(user_data['total_size_bytes'] / (1024 * 1024), 2)
                
                # Calculate activity timeframes
                if user_data['last_activity']:
                    try:
                        last_activity_time = datetime.fromisoformat(user_data['last_activity'].replace('Z', '+00:00'))
                        # Remove timezone info for comparison
                        last_activity_naive = last_activity_time.replace(tzinfo=None)
                        time_diff = datetime.now() - last_activity_naive
                        
                        if time_diff.days > 0:
                            user_data['last_activity_humanized'] = f"{time_diff.days} days ago"
                        elif time_diff.seconds > 3600:
                            hours = time_diff.seconds // 3600
                            user_data['last_activity_humanized'] = f"{hours} hours ago"
                        else:
                            minutes = time_diff.seconds // 60
                            user_data['last_activity_humanized'] = f"{minutes} minutes ago"
                    except Exception:
                        user_data['last_activity_humanized'] = "Unknown time"
                else:
                    user_data['last_activity_humanized'] = "No activity"
            
            # Sort users by total screenshots (descending)
            users_list = list(users_data.values())
            users_list.sort(key=lambda x: x['total_screenshots'], reverse=True)
            
            # Calculate total statistics
            total_users = len(users_list)
            total_screenshots = sum(user['total_screenshots'] for user in users_list)
            total_size_mb = sum(user['total_size_mb'] for user in users_list)
            total_folders = sum(user['total_folders'] for user in users_list)
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            result = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'execution_time_seconds': round(execution_time, 2),
                'bucket_name': bucket_name,
                'total_objects_scanned': total_objects,
                'summary': {
                    'total_users': total_users,
                    'total_screenshots': total_screenshots,
                    'total_folders': total_folders,
                    'total_size_mb': round(total_size_mb, 2),
                    'avg_screenshots_per_user': round(total_screenshots / total_users, 1) if total_users > 0 else 0,
                    'avg_folders_per_user': round(total_folders / total_users, 1) if total_users > 0 else 0
                },
                'users': users_list
            }
            
            # Cache the result
            self._cache = result
            self._cache_timestamp = datetime.now()
            
            print(f"✅ S3 scan completed in {execution_time:.2f}s")
            print(f"📊 Found {total_users} users, {total_screenshots} screenshots, {total_folders} folders")
            
            return result
            
        except Exception as e:
            print(f"❌ Error scanning S3: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to scan S3 bucket'
            }
    
    def handle_user_analytics(self, query_params):
        """Handle /api/s3/user-analytics/ endpoint"""
        
        # Get S3 data
        s3_data = self.scan_s3_bucket()
        
        # Filter options
        user_filter = query_params.get('user', [None])[0]
        min_screenshots = int(query_params.get('min_screenshots', [0])[0])
        limit = int(query_params.get('limit', [100])[0])
        
        if s3_data['success']:
            users = s3_data['users']
            
            # Apply filters
            if user_filter:
                users = [user for user in users if user_filter.lower() in user['email'].lower()]
            
            if min_screenshots > 0:
                users = [user for user in users if user['total_screenshots'] >= min_screenshots]
            
            # Apply limit
            if limit > 0:
                users = users[:limit]
            
            # Prepare response
            response_data = {
                'success': True,
                'message': f'Found {len(users)} users matching criteria',
                'timestamp': datetime.now().isoformat(),
                'filters_applied': {
                    'user_filter': user_filter,
                    'min_screenshots': min_screenshots,
                    'limit': limit
                },
                'summary': s3_data['summary'],
                'users': users
            }
        else:
            response_data = s3_data
        
        # Send response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode())
    
    def handle_user_details(self, query_params):
        """Handle /api/s3/user-details/ endpoint - detailed info for specific user"""
        
        user_email = query_params.get('email', [None])[0]
        
        if not user_email:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            error_response = {
                'success': False,
                'error': 'Missing required parameter: email',
                'example': '/api/s3/user-details/?email=haseebcodejourney@gmail.com'
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
            return
        
        # Get S3 data
        s3_data = self.scan_s3_bucket()
        
        if not s3_data['success']:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(s3_data, indent=2).encode())
            return
        
        # Find the specific user
        user_found = None
        for user in s3_data['users']:
            if user['email'].lower() == user_email.lower():
                user_found = user
                break
        
        if not user_found:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            error_response = {
                'success': False,
                'error': f'User not found: {user_email}',
                'available_users': [user['email'] for user in s3_data['users'][:10]]  # Show first 10
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
            return
        
        # Prepare detailed response
        response_data = {
            'success': True,
            'message': f'Detailed information for {user_email}',
            'timestamp': datetime.now().isoformat(),
            'user': user_found,
            'insights': {
                'most_active_folder': max(user_found['folders_list'], key=lambda x: x['screenshot_count'])['folder_name'] if user_found['folders_list'] else None,
                'least_active_folder': min(user_found['folders_list'], key=lambda x: x['screenshot_count'])['folder_name'] if user_found['folders_list'] else None,
                'largest_folder_by_size': max(user_found['folders_list'], key=lambda x: x['total_size_bytes'])['folder_name'] if user_found['folders_list'] else None,
                'avg_screenshots_per_folder': round(user_found['total_screenshots'] / user_found['total_folders'], 1) if user_found['total_folders'] > 0 else 0,
                'avg_size_per_screenshot_kb': round(user_found['total_size_bytes'] / user_found['total_screenshots'] / 1024, 1) if user_found['total_screenshots'] > 0 else 0
            }
        }
        
        # Send response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode())
    
    def handle_bucket_overview(self):
        """Handle /api/s3/bucket-overview/ endpoint"""
        
        # Get S3 data
        s3_data = self.scan_s3_bucket()
        
        if s3_data['success']:
            # Calculate additional insights
            users = s3_data['users']
            
            # Top users by screenshots
            top_users_by_screenshots = sorted(users, key=lambda x: x['total_screenshots'], reverse=True)[:5]
            
            # Top users by folders
            top_users_by_folders = sorted(users, key=lambda x: x['total_folders'], reverse=True)[:5]
            
            # Most recent activity
            users_with_activity = [u for u in users if u['last_activity']]
            most_recent_activity = sorted(users_with_activity, key=lambda x: x['last_activity'], reverse=True)[:5]
            
            response_data = {
                'success': True,
                'message': 'S3 bucket overview generated successfully',
                'timestamp': datetime.now().isoformat(),
                'bucket_info': {
                    'bucket_name': s3_data['bucket_name'],
                    'total_objects_scanned': s3_data['total_objects_scanned'],
                    'execution_time_seconds': s3_data['execution_time_seconds']
                },
                'summary': s3_data['summary'],
                'insights': {
                    'top_users_by_screenshots': [
                        {
                            'email': user['email'],
                            'total_screenshots': user['total_screenshots'],
                            'total_folders': user['total_folders']
                        } for user in top_users_by_screenshots
                    ],
                    'top_users_by_folders': [
                        {
                            'email': user['email'],
                            'total_folders': user['total_folders'],
                            'total_screenshots': user['total_screenshots']
                        } for user in top_users_by_folders
                    ],
                    'most_recent_activity': [
                        {
                            'email': user['email'],
                            'last_activity': user['last_activity'],
                            'last_activity_humanized': user['last_activity_humanized']
                        } for user in most_recent_activity
                    ]
                }
            }
        else:
            response_data = s3_data
        
        # Send response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(response_data, indent=2).encode())
    
    def handle_root(self):
        """Handle root endpoint with API documentation"""
        
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>S3 User Analytics API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                .endpoint { background: #f4f4f4; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .method { color: #2c5aa0; font-weight: bold; }
                .url { color: #d73502; font-family: monospace; }
                .description { color: #666; margin-top: 5px; }
                h1 { color: #333; }
                h2 { color: #2c5aa0; border-bottom: 2px solid #eee; padding-bottom: 5px; }
                .example { background: #e8f4fd; padding: 10px; border-left: 4px solid #2c5aa0; margin: 10px 0; }
                code { background: #f8f8f8; padding: 2px 4px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>🔍 S3 User Analytics API</h1>
            <p>This API provides detailed analytics from the S3 bucket including user tasks and screenshot counts.</p>
            
            <h2>📋 Available Endpoints</h2>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/user-analytics/</div>
                <div class="description">
                    <strong>Get complete user analytics with tasks and screenshot counts</strong><br>
                    Query Parameters:
                    <ul>
                        <li><code>user</code> - Filter by email (optional)</li>
                        <li><code>min_screenshots</code> - Minimum screenshot count (optional, default: 0)</li>
                        <li><code>limit</code> - Limit number of users returned (optional, default: 100)</li>
                    </ul>
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/user-analytics/" target="_blank">/api/s3/user-analytics/</a><br>
                    <strong>With filters:</strong> <a href="/api/s3/user-analytics/?user=haseeb&min_screenshots=100&limit=10" target="_blank">/api/s3/user-analytics/?user=haseeb&min_screenshots=100&limit=10</a>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/user-details/</div>
                <div class="description">
                    <strong>Get detailed information for a specific user</strong><br>
                    Query Parameters:
                    <ul>
                        <li><code>email</code> - User email (required)</li>
                    </ul>
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/user-details/?email=haseebcodejourney@gmail.com" target="_blank">/api/s3/user-details/?email=haseebcodejourney@gmail.com</a>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/bucket-overview/</div>
                <div class="description">
                    <strong>Get high-level bucket overview and insights</strong><br>
                    No parameters required.
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/bucket-overview/" target="_blank">/api/s3/bucket-overview/</a>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/users-list/</div>
                <div class="description">
                    <strong>Get list of all users with basic statistics</strong><br>
                    No parameters required.
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/users-list/" target="_blank">/api/s3/users-list/</a>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/user-tasks/</div>
                <div class="description">
                    <strong>Get list of task names for each user</strong><br>
                    Query Parameters:
                    <ul>
                        <li><code>email</code> - Filter by specific user email (optional)</li>
                    </ul>
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/user-tasks/" target="_blank">/api/s3/user-tasks/</a><br>
                    <strong>With filter:</strong> <a href="/api/s3/user-tasks/?email=haseebcodejourney@gmail.com" target="_blank">/api/s3/user-tasks/?email=haseebcodejourney@gmail.com</a>
                </div>
            </div>
            
            <div class="endpoint">
                <div class="method">GET</div>
                <div class="url">/api/s3/user-screenshots/</div>
                <div class="description">
                    <strong>Get all screenshots for each user with detailed information</strong><br>
                    Query Parameters:
                    <ul>
                        <li><code>email</code> - Filter by specific user email (optional)</li>
                        <li><code>task</code> - Filter by specific task/folder name (optional)</li>
                        <li><code>limit</code> - Limit number of screenshots per task (optional)</li>
                    </ul>
                </div>
                <div class="example">
                    <strong>Example:</strong> <a href="/api/s3/user-screenshots/" target="_blank">/api/s3/user-screenshots/</a><br>
                    <strong>With filters:</strong> <a href="/api/s3/user-screenshots/?email=haseebcodejourney@gmail.com&limit=10" target="_blank">/api/s3/user-screenshots/?email=haseebcodejourney@gmail.com&limit=10</a>
                </div>
            </div>
            
            <h2>📊 Response Format</h2>
            <p>All endpoints return JSON with the following structure:</p>
            <pre>{
    "success": true,
    "message": "Description of the response",
    "timestamp": "2025-01-28T...",
    "data": { ... }
}</pre>
            
            <h2>🎯 Key Features</h2>
            <ul>
                <li><strong>Real S3 Data:</strong> Scans actual S3 bucket for current data</li>
                <li><strong>User Task Lists:</strong> Shows all folders/tasks for each user</li>
                <li><strong>Screenshot Counts:</strong> Accurate counts per user and per folder</li>
                <li><strong>Size Analytics:</strong> File sizes in bytes and MB</li>
                <li><strong>Activity Tracking:</strong> Last activity timestamps</li>
                <li><strong>Caching:</strong> 5-minute cache to improve performance</li>
                <li><strong>CORS Enabled:</strong> Can be called from frontend applications</li>
            </ul>
            
            <p><small>🕒 Cache Duration: 5 minutes | 🗄️ Bucket: ddsfocustime | 📡 Port: 9000</small></p>
        </body>
        </html>
        """
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(html_content.encode())
    
    def handle_users_list(self, query_params):
        """Handle /api/s3/users-list/ - Get all users list"""
        try:
            # Get S3 data
            data = self.scan_s3_bucket()
            
            if not data.get('success'):
                raise Exception(data.get('error', 'Failed to scan S3'))
            
            # Extract just the user list with basic info
            users_list = []
            for user in data.get('users', []):
                user_info = {
                    'email': user.get('email', ''),
                    'email_original': user.get('email_original', ''),
                    'total_tasks': user.get('total_folders', 0),
                    'total_screenshots': user.get('total_screenshots', 0),
                    'total_size_mb': user.get('total_size_mb', 0),
                    'last_activity': user.get('last_activity', ''),
                    'last_activity_humanized': user.get('last_activity_humanized', '')
                }
                users_list.append(user_info)
            
            response_data = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'total_users': len(users_list),
                'users': users_list
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
    
    def handle_user_tasks(self, query_params):
        """Handle /api/s3/user-tasks/ - Get list of task names against each user"""
        try:
            # Get user email parameter
            email_param = query_params.get('email')
            target_email = email_param[0] if email_param else None
            
            # Get S3 data
            data = self.scan_s3_bucket()
            
            if not data.get('success'):
                raise Exception(data.get('error', 'Failed to scan S3'))
            
            users_tasks = []
            
            for user in data.get('users', []):
                if target_email and user.get('email_original', '').lower() != target_email.lower():
                    continue
                    
                user_tasks = {
                    'email': user.get('email', ''),
                    'email_original': user.get('email_original', ''),
                    'total_tasks': user.get('total_folders', 0),
                    'tasks': []
                }
                
                # Get task names from folders
                for folder in user.get('folders', []):
                    task_info = {
                        'task_name': folder.get('name', ''),
                        'task_date': folder.get('name', ''),  # Usually folder name is date
                        'screenshots_count': folder.get('file_count', 0),
                        'size_mb': round(folder.get('size_mb', 0), 2),
                        'last_modified': folder.get('last_modified', '')
                    }
                    user_tasks['tasks'].append(task_info)
                
                # Sort tasks by date (newest first)
                user_tasks['tasks'].sort(key=lambda x: x['task_date'], reverse=True)
                users_tasks.append(user_tasks)
            
            response_data = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'total_users': len(users_tasks),
                'filter_email': target_email,
                'users_tasks': users_tasks
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
    
    def handle_user_screenshots(self, query_params):
        """Handle /api/s3/user-screenshots/ - Get all screenshots against each user"""
        try:
            # Get parameters
            email_param = query_params.get('email')
            task_param = query_params.get('task')  # Optional: filter by specific task/folder
            limit_param = query_params.get('limit')
            
            target_email = email_param[0] if email_param else None
            target_task = task_param[0] if task_param else None
            limit = int(limit_param[0]) if limit_param and limit_param[0].isdigit() else None
            
            # Scan S3 for detailed file information
            s3_client = self.get_s3_client()
            bucket_name = self.get_bucket_name()
            
            users_screenshots = []
            
            # Scan the bucket for screenshots
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket=bucket_name,
                Prefix='screenshots/'
            )
            
            users_data = {}
            
            for page in page_iterator:
                if 'Contents' not in page:
                    continue
                    
                for obj in page['Contents']:
                    key = obj['Key']
                    size = obj['Size']
                    last_modified = obj['LastModified']
                    
                    # Parse: screenshots/user_email/folder/file
                    parts = key.split('/')
                    if len(parts) >= 4 and parts[0] == 'screenshots':
                        user_email_encoded = parts[1]
                        folder_name = parts[2]
                        filename = parts[3]
                        
                        # Decode email
                        user_email = user_email_encoded.replace('_at_', '@').replace('_dot_', '.')
                        
                        # Filter by email if specified
                        if target_email and user_email.lower() != target_email.lower():
                            continue
                            
                        # Filter by task if specified
                        if target_task and folder_name.lower() != target_task.lower():
                            continue
                        
                        # Initialize user data
                        if user_email not in users_data:
                            users_data[user_email] = {
                                'email': user_email,
                                'total_screenshots': 0,
                                'total_size_mb': 0,
                                'tasks': {}
                            }
                        
                        # Initialize task data
                        if folder_name not in users_data[user_email]['tasks']:
                            users_data[user_email]['tasks'][folder_name] = {
                                'task_name': folder_name,
                                'screenshots_count': 0,
                                'total_size_mb': 0,
                                'screenshots': []
                            }
                        
                        # Add screenshot info
                        screenshot_info = {
                            'filename': filename,
                            'full_path': key,
                            'size_bytes': size,
                            'size_mb': round(size / (1024 * 1024), 2),
                            'last_modified': last_modified.isoformat(),
                            'download_url': f"https://{bucket_name}.s3.amazonaws.com/{key}"
                        }
                        
                        users_data[user_email]['tasks'][folder_name]['screenshots'].append(screenshot_info)
                        users_data[user_email]['tasks'][folder_name]['screenshots_count'] += 1
                        users_data[user_email]['tasks'][folder_name]['total_size_mb'] += screenshot_info['size_mb']
                        
                        users_data[user_email]['total_screenshots'] += 1
                        users_data[user_email]['total_size_mb'] += screenshot_info['size_mb']
            
            # Convert to list format and apply limit
            for email, user_data in users_data.items():
                user_result = {
                    'email': user_data['email'],
                    'total_screenshots': user_data['total_screenshots'],
                    'total_size_mb': round(user_data['total_size_mb'], 2),
                    'total_tasks': len(user_data['tasks']),
                    'tasks': []
                }
                
                # Convert tasks to list and sort by name
                for task_name, task_data in user_data['tasks'].items():
                    task_data['total_size_mb'] = round(task_data['total_size_mb'], 2)
                    
                    # Sort screenshots by last_modified (newest first)
                    task_data['screenshots'].sort(key=lambda x: x['last_modified'], reverse=True)
                    
                    # Apply limit to screenshots if specified
                    if limit:
                        task_data['screenshots'] = task_data['screenshots'][:limit]
                    
                    user_result['tasks'].append(task_data)
                
                # Sort tasks by name
                user_result['tasks'].sort(key=lambda x: x['task_name'], reverse=True)
                users_screenshots.append(user_result)
            
            # Sort users by total screenshots (descending)
            users_screenshots.sort(key=lambda x: x['total_screenshots'], reverse=True)
            
            response_data = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'total_users': len(users_screenshots),
                'filter_email': target_email,
                'filter_task': target_task,
                'limit_per_task': limit,
                'users_screenshots': users_screenshots
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data, indent=2).encode())
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers()
            self.end_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())

    def send_404(self):
        """Send 404 response"""
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        error_response = {
            'success': False,
            'error': 'Endpoint not found',
            'available_endpoints': [
                '/api/s3/user-analytics/',
                '/api/s3/user-details/',
                '/api/s3/bucket-overview/',
                '/api/s3/users-list/',
                '/api/s3/user-tasks/',
                '/api/s3/user-screenshots/',
                '/'
            ]
        }
        self.wfile.write(json.dumps(error_response, indent=2).encode())

def test_s3_connection():
    """Test S3 connection without instantiating the handler class"""
    try:
        # Initialize S3 client
        s3_client = boto3.client(
            "s3",
            aws_access_key_id="AKIARSU6EUUWMQ5I2JWC",
            aws_secret_access_key="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",
            region_name="eu-north-1"
        )
        
        bucket_name = "ddsfocustime"
        
        # Quick test - list first few objects
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='screenshots/',
            MaxKeys=5
        )
        
        if 'Contents' in response:
            return {
                'success': True,
                'summary': {
                    'total_users': 'Initial test',
                    'total_screenshots': f"{len(response['Contents'])} objects found",
                },
                'message': 'S3 connection successful'
            }
        else:
            return {
                'success': False,
                'error': 'No objects found in screenshots folder',
                'summary': {'total_users': 0, 'total_screenshots': 0}
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': f'S3 connection failed: {str(e)}',
            'summary': {'total_users': 0, 'total_screenshots': 0}
        }

def run_server(port=9000):
    """Run the S3 Analytics API server"""
    
    print("=" * 60)
    print("🚀 S3 USER ANALYTICS API SERVER")
    print("=" * 60)
    print(f"🌐 Server starting on: http://localhost:{port}")
    print(f"📋 API Documentation: http://localhost:{port}/")
    print(f"🔍 User Analytics: http://localhost:{port}/api/s3/user-analytics/")
    print(f"👤 User Details: http://localhost:{port}/api/s3/user-details/?email=user@example.com")
    print(f"📊 Bucket Overview: http://localhost:{port}/api/s3/bucket-overview/")
    print("=" * 60)
    print("📁 S3 Bucket: ddsfocustime")
    print("🔄 Cache Duration: 5 minutes")
    print("🌍 CORS: Enabled")
    print("=" * 60)
    
    try:
        with socketserver.TCPServer(("", port), S3UserAnalyticsHandler) as httpd:
            print(f"✅ Server is running on port {port}")
            print("🔍 Starting initial S3 scan...")
            
            # Perform initial scan to populate cache using a test function
            try:
                test_scan = test_s3_connection()
                if test_scan['success']:
                    print(f"✅ Initial scan completed: {test_scan['summary']['total_users']} users, {test_scan['summary']['total_screenshots']} screenshots")
                else:
                    print(f"⚠️ Initial scan failed: {test_scan.get('error', 'Unknown error')}")
            except Exception as scan_error:
                print(f"⚠️ Initial scan failed: {str(scan_error)}")
            
            print("🎯 Press Ctrl+C to stop the server")
            print()
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")

if __name__ == "__main__":
    import sys
    
    # Allow custom port via command line argument
    port = 9000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 9000.")
    
    run_server(port)
