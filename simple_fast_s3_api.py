#!/usr/bin/env python3
"""
Simple Fast S3 API - Just 2 Endpoints
1. Users and their task names
2. Screenshots count per user
"""

import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs
import boto3
from datetime import datetime

class SimpleFastS3Handler(http.server.BaseHTTPRequestHandler):
    
    def do_GET(self):
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Add CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            if path == '/':
                response = {
                    "status": "success",
                    "message": "Ultra Fast S3 Users API",
                    "endpoints": [
                        "GET /api/users/ - Get all users list from S3 screenshots folder",
                        "GET /api/user-tasks/ - Get tasks list for each user",
                        "GET /api/all-users-tasks/ - Comprehensive: ALL users + ALL tasks + screenshots count",
                        "GET /api/debug-structure/ - Debug S3 folder structure"
                    ],
                    "timestamp": datetime.now().isoformat()
                }
                
            elif path == '/api/users/':
                # Single endpoint: Get all users from S3 screenshots folder
                response = self.get_all_users_from_s3()
                
            elif path == '/api/user-tasks/':
                # New endpoint: Get tasks list for each user
                response = self.get_user_tasks_from_s3()
                
            elif path == '/api/all-users-tasks/':
                # Comprehensive endpoint: Get all users and all their tasks
                response = self.get_all_users_and_tasks_comprehensive()
                
            elif path == '/api/debug-structure/':
                # Debug endpoint: Show S3 structure
                response = self.debug_s3_structure()
                
            else:
                response = {
                    "status": "error",
                    "message": "Endpoint not found",
                    "available_endpoints": [
                        "/api/users/",
                        "/api/user-tasks/",
                        "/api/all-users-tasks/",
                        "/api/debug-structure/"
                    ]
                }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        except Exception as e:
            error_response = {
                "status": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(error_response, indent=2).encode())
    
    def get_all_users_from_s3(self):
        """Get all users from S3 screenshots folder - ULTRA FAST"""
        try:
            print("🔍 Ultra-fast scan for users...")
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            
            users_found = set()
            objects_scanned = 0
            
            # Super fast scan - limit to just 200 objects but use delimiter to find user folders
            try:
                # Method 1: Use delimiter to find user folders directly
                response = s3_client.list_objects_v2(
                    Bucket='ddsfocustime',
                    Prefix='screenshots/',
                    Delimiter='/',
                    MaxKeys=100
                )
                
                # Check if we get common prefixes (user folders)
                if 'CommonPrefixes' in response:
                    for prefix in response['CommonPrefixes']:
                        user_folder = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                        if user_folder and '_at_' in user_folder:
                            user_email = user_folder.replace('_at_', '@').replace('_dot_', '.')
                            users_found.add(user_email)
                
                # If delimiter method didn't work well, scan some objects
                if len(users_found) < 5:
                    paginator = s3_client.get_paginator('list_objects_v2')
                    page_iterator = paginator.paginate(
                        Bucket='ddsfocustime',
                        Prefix='screenshots/',
                        PaginationConfig={'MaxItems': 300}
                    )
                    
                    for page in page_iterator:
                        if 'Contents' not in page:
                            continue
                            
                        for obj in page['Contents']:
                            objects_scanned += 1
                            key = obj['Key']
                            # Structure: screenshots/user_email_encoded/...
                            parts = key.split('/')
                            
                            if len(parts) >= 2:
                                user_encoded = parts[1]
                                if user_encoded and '_at_' in user_encoded:
                                    user_email = user_encoded.replace('_at_', '@').replace('_dot_', '.')
                                    if '@' in user_email and '.' in user_email:
                                        users_found.add(user_email)
                
            except Exception as scan_error:
                print(f"Scan error: {scan_error}")
                return {
                    "status": "error",
                    "message": f"S3 scan failed: {str(scan_error)}",
                    "timestamp": datetime.now().isoformat()
                }
            
            # Convert to sorted list
            users_list = sorted(list(users_found))
            
            print(f"✅ Found {len(users_list)} users from {objects_scanned} objects")
            
            return {
                "status": "success",
                "message": f"Found {len(users_list)} users in S3 screenshots folder",
                "total_users": len(users_list),
                "objects_scanned": objects_scanned,
                "users": [{"email": email, "encoded_email": email.replace('@', '_at_').replace('.', '_dot_')} for email in users_list],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to get users: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def get_user_tasks_from_s3(self):
        """Get tasks list for each user from S3 screenshots folder - FAST"""
        try:
            print("🔍 Scanning for user tasks...")
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            
            users_tasks = {}
            objects_scanned = 0
            debug_users_seen = set()  # Debug: track unique users seen
            
            # Fast scan for user tasks - increase limit to find all users
            paginator = s3_client.get_paginator('list_objects_v2')
            page_iterator = paginator.paginate(
                Bucket='ddsfocustime',
                Prefix='screenshots/',
                PaginationConfig={'MaxItems': 2000}  # Increased limit to find all users
            )
            
            for page in page_iterator:
                if 'Contents' not in page:
                    continue
                    
                for obj in page['Contents']:
                    objects_scanned += 1
                    key = obj['Key']
                    
                    # Structure: screenshots/user_email_encoded/task_folder/file
                    parts = key.split('/')
                    
                    if len(parts) >= 3:
                        user_encoded = parts[1]
                        task_folder = parts[2]
                        
                        # Debug: Track all unique encoded users
                        if user_encoded and '_at_' in user_encoded:
                            debug_users_seen.add(user_encoded)
                        
                        # Decode user email - handle both encoding patterns
                        if user_encoded and '_at_' in user_encoded:
                            user_email = user_encoded.replace('_at_', '@').replace('_dot_', '.')
                            
                            if '@' in user_email and '.' in user_email and task_folder:
                                if user_email not in users_tasks:
                                    users_tasks[user_email] = {
                                        'email': user_email,
                                        'encoded_email': user_encoded,
                                        'tasks': set(),
                                        'total_tasks': 0
                                    }
                                
                                # Add task folder to user's tasks
                                users_tasks[user_email]['tasks'].add(task_folder)
            
            print(f"🔍 Debug: Found {len(debug_users_seen)} unique encoded users in S3")
            
            # Convert sets to lists and finalize data
            users_list = []
            for email, data in users_tasks.items():
                task_list = sorted(list(data['tasks']))
                users_list.append({
                    'email': email,
                    'encoded_email': data['encoded_email'],
                    'total_tasks': len(task_list),
                    'tasks': task_list
                })
            
            # Sort by email
            users_list.sort(key=lambda x: x['email'])
            
            print(f"✅ Found {len(users_list)} users with tasks from {objects_scanned} objects")
            
            return {
                "status": "success",
                "message": f"Found {len(users_list)} users with their tasks",
                "total_users": len(users_list),
                "total_tasks": sum(u['total_tasks'] for u in users_list),
                "objects_scanned": objects_scanned,
                "users": users_list,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to get user tasks: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def debug_s3_structure(self):
        """Debug: Show S3 structure to understand the data organization"""
        try:
            print("🔍 Debugging S3 structure...")
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            
            debug_info = {
                "folders_found": {},
                "sample_keys": [],
                "user_folders": set(),
                "objects_scanned": 0
            }
            
            # Scan first 100 objects to understand structure
            response = s3_client.list_objects_v2(
                Bucket='ddsfocustime',
                Prefix='screenshots/',
                MaxKeys=100
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    debug_info["objects_scanned"] += 1
                    key = obj['Key']
                    parts = key.split('/')
                    
                    # Add sample keys
                    if len(debug_info["sample_keys"]) < 10:
                        debug_info["sample_keys"].append(key)
                    
                    # Analyze folder structure
                    if len(parts) >= 2:
                        user_folder = parts[1]
                        debug_info["user_folders"].add(user_folder)
                        
                        folder_depth = len(parts) - 2  # -2 for 'screenshots' and filename
                        if folder_depth not in debug_info["folders_found"]:
                            debug_info["folders_found"][folder_depth] = []
                        debug_info["folders_found"][folder_depth].append(key)
            
            # Convert sets to lists for JSON
            debug_info["user_folders"] = sorted(list(debug_info["user_folders"]))
            
            return {
                "status": "success",
                "message": f"Found structure data from {debug_info['objects_scanned']} objects",
                "total_user_folders": len(debug_info["user_folders"]),
                "folder_depths": list(debug_info["folders_found"].keys()),
                "sample_user_folders": debug_info["user_folders"][:10],
                "sample_keys": debug_info["sample_keys"],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Debug failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def get_all_users_and_tasks_comprehensive(self):
        """Get ALL users and ALL their tasks - comprehensive scan"""
        try:
            print("🔍 Comprehensive scan: All users + all tasks...")
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                aws_secret_access_key='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',
                region_name='eu-north-1'
            )
            
            # Step 1: Get all users using delimiter method (like /api/users/)
            all_users = set()
            try:
                response = s3_client.list_objects_v2(
                    Bucket='ddsfocustime',
                    Prefix='screenshots/',
                    Delimiter='/',
                    MaxKeys=100
                )
                
                if 'CommonPrefixes' in response:
                    for prefix in response['CommonPrefixes']:
                        user_folder = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                        if user_folder and '_at_' in user_folder:
                            user_email = user_folder.replace('_at_', '@').replace('_dot_', '.')
                            all_users.add((user_email, user_folder))
            
            except Exception as e:
                print(f"Error getting users: {e}")
            
            # Step 2: For each user, scan their tasks
            users_with_tasks = []
            users_scanned = 0
            total_objects_scanned = 0
            
            for user_email, user_encoded in all_users:
                users_scanned += 1
                user_tasks = set()
                user_screenshots_count = 0
                
                try:
                    # Scan this specific user's folder for tasks
                    user_prefix = f"screenshots/{user_encoded}/"
                    
                    paginator = s3_client.get_paginator('list_objects_v2')
                    page_iterator = paginator.paginate(
                        Bucket='ddsfocustime',
                        Prefix=user_prefix,
                        PaginationConfig={'MaxItems': 1000}  # Per user limit
                    )
                    
                    for page in page_iterator:
                        if 'Contents' not in page:
                            continue
                            
                        for obj in page['Contents']:
                            total_objects_scanned += 1
                            key = obj['Key']
                            
                            # Count screenshots
                            if key.endswith(('.webp', '.png', '.jpg', '.jpeg')):
                                user_screenshots_count += 1
                            
                            # Extract task folder
                            # Structure: screenshots/user_encoded/task_folder/file
                            parts = key.split('/')
                            if len(parts) >= 3:
                                task_folder = parts[2]
                                if task_folder:  # Not empty
                                    user_tasks.add(task_folder)
                
                except Exception as user_error:
                    print(f"Error scanning user {user_email}: {user_error}")
                
                # Add user data
                task_list = sorted(list(user_tasks))
                users_with_tasks.append({
                    'email': user_email,
                    'encoded_email': user_encoded,
                    'total_tasks': len(task_list),
                    'total_screenshots': user_screenshots_count,
                    'tasks': task_list
                })
            
            # Sort by email
            users_with_tasks.sort(key=lambda x: x['email'])
            
            total_tasks = sum(u['total_tasks'] for u in users_with_tasks)
            total_screenshots = sum(u['total_screenshots'] for u in users_with_tasks)
            
            print(f"✅ Comprehensive scan: {len(users_with_tasks)} users, {total_tasks} total tasks, {total_screenshots} screenshots")
            
            return {
                "status": "success",
                "message": f"Comprehensive scan: Found {len(users_with_tasks)} users with {total_tasks} total tasks and {total_screenshots} screenshots",
                "total_users": len(users_with_tasks),
                "total_tasks": total_tasks,
                "total_screenshots": total_screenshots,
                "users_scanned": users_scanned,
                "objects_scanned": total_objects_scanned,
                "users": users_with_tasks,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Comprehensive scan failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        return  # Suppress logging

def run_simple_server(port=8000):
    try:
        with socketserver.TCPServer(("", port), SimpleFastS3Handler) as httpd:
            print("=" * 60)
            print("🚀 ULTRA FAST S3 USERS & TASKS API")
            print("=" * 60)
            print(f"✅ Server running on: http://localhost:{port}")
            print(f"📋 API Docs: http://localhost:{port}/")
            print(f"👥 Get Users: http://localhost:{port}/api/users/")
            print(f"📝 Get User Tasks: http://localhost:{port}/api/user-tasks/")
            print(f"🔥 ALL Users + Tasks: http://localhost:{port}/api/all-users-tasks/")
            print("=" * 60)
            print("🎯 Press Ctrl+C to stop")
            print()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_simple_server()
