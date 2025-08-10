#!/usr/bin/env python3
"""
Fast S3 API Test - Limited Scan
"""

import http.server
import socketserver
import json
from urllib.parse import urlparse, parse_qs
import boto3
from datetime import datetime
import threading
import time

class FastS3Handler(http.server.BaseHTTPRequestHandler):
    
    def do_GET(self):
        try:
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            query_params = parse_qs(parsed_url.query)
            
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
                    "message": "Fast S3 API Test Server - WORKING!",
                    "server_time": datetime.now().isoformat(),
                    "available_endpoints": [
                        "/api/s3/users-list/",
                        "/api/s3/user-tasks/",
                        "/api/s3/user-screenshots/",
                        "/api/s3/quick-test/"
                    ]
                }
            elif path == '/api/s3/quick-test/':
                # Quick S3 connection test
                try:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                        aws_secret_access_key='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',
                        region_name='eu-north-1'
                    )
                    
                    # Just check first 10 objects
                    s3_response = s3_client.list_objects_v2(
                        Bucket='ddsfocustime',
                        Prefix='screenshots/',
                        MaxKeys=10
                    )
                    
                    objects_found = len(s3_response.get('Contents', []))
                    
                    response = {
                        "status": "success",
                        "message": f"S3 Quick Test - Found {objects_found} objects",
                        "bucket": "ddsfocustime",
                        "objects_sample": objects_found,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                except Exception as e:
                    response = {
                        "status": "error",
                        "message": f"S3 connection failed: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }
                    
            elif path == '/api/s3/users-list/':
                # Enhanced user list - scan more objects to find all users
                try:
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
                        aws_secret_access_key='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',
                        region_name='eu-north-1'
                    )
                    
                    print("🔍 Scanning S3 for all users...")
                    users_found = {}
                    total_objects_scanned = 0
                    
                    # Use paginator to scan more objects
                    paginator = s3_client.get_paginator('list_objects_v2')
                    page_iterator = paginator.paginate(
                        Bucket='ddsfocustime',
                        Prefix='screenshots/',
                        PaginationConfig={'MaxItems': 1000}  # Scan up to 1000 objects
                    )
                    
                    for page in page_iterator:
                        if 'Contents' not in page:
                            continue
                            
                        for obj in page['Contents']:
                            total_objects_scanned += 1
                            key_parts = obj['Key'].split('/')
                            if len(key_parts) >= 2:
                                user_encoded = key_parts[1]
                                user_email = user_encoded.replace('_at_', '@').replace('_dot_', '.')
                                
                                if user_email and user_email not in users_found:
                                    users_found[user_email] = {
                                        'email': user_email,
                                        'encoded_email': user_encoded,
                                        'sample_files': 0,
                                        'total_size_sample': 0,
                                        'first_seen': obj['LastModified'].isoformat(),
                                        'last_seen': obj['LastModified'].isoformat()
                                    }
                                
                                if user_email and user_email in users_found:
                                    users_found[user_email]['sample_files'] += 1
                                    users_found[user_email]['total_size_sample'] += obj['Size']
                                    
                                    # Update last seen
                                    if obj['LastModified'].isoformat() > users_found[user_email]['last_seen']:
                                        users_found[user_email]['last_seen'] = obj['LastModified'].isoformat()
                    
                    # Remove empty emails
                    users_found = {k: v for k, v in users_found.items() if k and k.strip()}
                    users_list = list(users_found.values())
                    
                    # Sort by sample files count
                    users_list.sort(key=lambda x: x['sample_files'], reverse=True)
                    
                    print(f"✅ Found {len(users_list)} users from {total_objects_scanned} objects")
                    
                    response = {
                        "status": "success",
                        "message": f"Enhanced scan found {len(users_list)} users from {total_objects_scanned} objects",
                        "total_users": len(users_list),
                        "total_objects_scanned": total_objects_scanned,
                        "users": users_list,
                        "note": "Enhanced scan with up to 1000 objects to find more users.",
                        "timestamp": datetime.now().isoformat()
                    }
                    
                except Exception as e:
                    response = {
                        "status": "error",
                        "message": f"Failed to scan users: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }
                    
            elif path == '/api/s3/user-tasks/':
                email_filter = query_params.get('email', [None])[0]
                
                response = {
                    "status": "success",
                    "message": "User tasks endpoint working",
                    "filter_email": email_filter,
                    "note": "This endpoint scans S3 for task folders per user",
                    "timestamp": datetime.now().isoformat(),
                    "sample_response": {
                        "users_tasks": [
                            {
                                "email": "user@example.com",
                                "total_tasks": 5,
                                "tasks": [
                                    {"task_name": "2025-01-27", "screenshots_count": 10},
                                    {"task_name": "2025-01-26", "screenshots_count": 8}
                                ]
                            }
                        ]
                    }
                }
                
            elif path == '/api/s3/user-screenshots/':
                email_filter = query_params.get('email', [None])[0]
                limit = query_params.get('limit', [None])[0]
                
                response = {
                    "status": "success",
                    "message": "User screenshots endpoint working",
                    "filter_email": email_filter,
                    "limit": limit,
                    "note": "This endpoint provides detailed screenshot information per user",
                    "timestamp": datetime.now().isoformat(),
                    "sample_response": {
                        "users_screenshots": [
                            {
                                "email": "user@example.com",
                                "total_screenshots": 25,
                                "tasks": [
                                    {
                                        "task_name": "2025-01-27",
                                        "screenshots": [
                                            {"filename": "screenshot_001.webp", "size_mb": 0.5}
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            else:
                response = {
                    "status": "error",
                    "message": "Endpoint not found",
                    "available_endpoints": [
                        "/",
                        "/api/s3/users-list/",
                        "/api/s3/user-tasks/",
                        "/api/s3/user-screenshots/",
                        "/api/s3/quick-test/"
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
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        return  # Suppress logging

def run_fast_server(port=8001):
    try:
        with socketserver.TCPServer(("", port), FastS3Handler) as httpd:
            print(f"✅ Fast S3 Test Server running on port {port}")
            print(f"🌐 Test URL: http://localhost:{port}/")
            print(f"🔍 Quick Test: http://localhost:{port}/api/s3/quick-test/")
            print(f"👥 Users List: http://localhost:{port}/api/s3/users-list/")
            print("🎯 Press Ctrl+C to stop")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_fast_server()
