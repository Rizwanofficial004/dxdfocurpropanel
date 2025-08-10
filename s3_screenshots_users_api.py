"""
S3 Screenshots Users API
Get all users/employees who have screenshots stored in S3 bucket
"""

import boto3
import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from botocore.exceptions import ClientError, NoCredentialsError
import re
import logging

# Configure logging
logger = logging.getLogger(__name__)

# S3 Configuration
S3_BUCKET_NAME = "ddsfocustime"
AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
AWS_SECRET_ACCESS_KEY = "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"
S3_REGION = "eu-west-1"

def get_s3_client():
    """Initialize S3 client with credentials"""
    try:
        return boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=S3_REGION
        )
    except Exception as e:
        logger.error(f"Error initializing S3 client: {str(e)}")
        return None

@csrf_exempt
@require_http_methods(["GET"])
def s3_screenshots_users_api(request):
    """
    API to get all users who have screenshots in S3 bucket
    
    Query Parameters:
    - include_stats: Include detailed statistics (default: true)
    - limit: Maximum number of users to return (default: 100)
    - search: Search for specific user by email/name
    """
    
    try:
        # Get query parameters
        include_stats = request.GET.get('include_stats', 'true').lower() == 'true'
        limit = int(request.GET.get('limit', 100))
        search_term = request.GET.get('search', '').lower()
        
        # Initialize S3 client
        s3_client = get_s3_client()
        if not s3_client:
            return JsonResponse({
                "success": False,
                "message": "Failed to connect to S3",
                "data": {},
                "timestamp": datetime.now().isoformat()
            }, status=500)
        
        # Scan S3 bucket for screenshots folder
        try:
            paginator = s3_client.get_paginator('list_objects_v2')
            pages = paginator.paginate(
                Bucket=S3_BUCKET_NAME,
                Prefix='screenshots/',
                Delimiter='/'
            )
            
            users_data = {}
            total_objects_scanned = 0
            
            # Process each page
            for page in pages:
                # Get user folders from common prefixes
                if 'CommonPrefixes' in page:
                    for prefix in page['CommonPrefixes']:
                        folder_name = prefix['Prefix'].replace('screenshots/', '').rstrip('/')
                        
                        # Extract email from folder name
                        if '_at_' in folder_name:
                            email = folder_name.replace('_at_', '@')
                            username = email.split('@')[0]
                            domain = email.split('@')[1] if '@' in email else ''
                            
                            # Apply search filter
                            if search_term and search_term not in email.lower() and search_term not in username.lower():
                                continue
                            
                            # Initialize user data
                            if email not in users_data:
                                users_data[email] = {
                                    "email": email,
                                    "username": username,
                                    "domain": domain,
                                    "folder_name": folder_name,
                                    "has_screenshots": True,
                                    "screenshots_folder": f"screenshots/{folder_name}/",
                                    "display_name": username.title(),
                                    "source": "S3_Screenshots"
                                }
                                
                                if include_stats:
                                    users_data[email]["statistics"] = {
                                        "total_files": 0,
                                        "total_size_bytes": 0,
                                        "total_size_mb": 0.0,
                                        "last_modified": None,
                                        "file_types": [],
                                        "date_folders": []
                                    }
                
                # Get detailed statistics if requested
                if include_stats and 'Contents' in page:
                    for obj in page['Contents']:
                        total_objects_scanned += 1
                        key = obj['Key']
                        
                        # Extract user email from object key
                        if key.startswith('screenshots/') and '_at_' in key:
                            parts = key.split('/')
                            if len(parts) >= 2:
                                folder_name = parts[1]
                                email = folder_name.replace('_at_', '@')
                                
                                if email in users_data:
                                    stats = users_data[email]["statistics"]
                                    stats["total_files"] += 1
                                    stats["total_size_bytes"] += obj.get('Size', 0)
                                    stats["total_size_mb"] = round(stats["total_size_bytes"] / (1024 * 1024), 2)
                                    
                                    # Update last modified
                                    if not stats["last_modified"] or obj['LastModified'] > datetime.fromisoformat(stats["last_modified"].replace('Z', '+00:00')):
                                        stats["last_modified"] = obj['LastModified'].isoformat()
                                    
                                    # Extract file extension
                                    if '.' in key:
                                        ext = key.split('.')[-1].lower()
                                        if ext not in stats["file_types"]:
                                            stats["file_types"].append(ext)
                                    
                                    # Extract date folder if exists
                                    if len(parts) >= 3:
                                        date_folder = parts[2]
                                        if date_folder not in stats["date_folders"]:
                                            stats["date_folders"].append(date_folder)
            
            # Convert to list and apply limit
            users_list = list(users_data.values())
            
            # Sort by email
            users_list.sort(key=lambda x: x['email'])
            
            # Apply limit
            if limit and len(users_list) > limit:
                users_list = users_list[:limit]
            
            # Prepare response
            response_data = {
                "success": True,
                "message": f"Found {len(users_list)} users with screenshots in S3 bucket",
                "data": {
                    "users": users_list,
                    "metadata": {
                        "total_found": len(users_data),
                        "returned": len(users_list),
                        "limit_applied": limit,
                        "search_term": search_term if search_term else None,
                        "include_statistics": include_stats,
                        "s3_bucket": S3_BUCKET_NAME,
                        "screenshots_prefix": "screenshots/",
                        "objects_scanned": total_objects_scanned,
                        "scan_timestamp": datetime.now().isoformat()
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return JsonResponse(response_data, status=200)
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"S3 ClientError: {error_code} - {error_message}")
            
            return JsonResponse({
                "success": False,
                "message": f"S3 access error: {error_message}",
                "data": {},
                "error_code": error_code,
                "timestamp": datetime.now().isoformat()
            }, status=403)
            
    except NoCredentialsError:
        logger.error("S3 credentials not found")
        return JsonResponse({
            "success": False,
            "message": "S3 credentials not configured",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)
        
    except Exception as e:
        logger.error(f"Unexpected error in s3_screenshots_users_api: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Internal server error: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }, status=500)

# Test function for standalone usage
def test_s3_screenshots_users_api():
    """Test the S3 screenshots users API"""
    print("🧪 Testing S3 Screenshots Users API")
    print("-" * 50)
    
    try:
        # Simulate Django request object
        class MockRequest:
            def __init__(self, params=None):
                self.GET = params or {}
        
        # Test basic call
        print("1. Testing basic API call...")
        request = MockRequest()
        response = s3_screenshots_users_api(request)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = json.loads(response.content)
            users_count = len(data['data']['users'])
            print(f"   ✅ Found {users_count} users")
            
            # Show first user as example
            if users_count > 0:
                first_user = data['data']['users'][0]
                print(f"   📋 Example user: {first_user['email']}")
                if 'statistics' in first_user:
                    stats = first_user['statistics']
                    print(f"   📊 Files: {stats['total_files']}, Size: {stats['total_size_mb']} MB")
        else:
            print(f"   ❌ Error: {response.content}")
        
        # Test with search
        print("\n2. Testing with search parameter...")
        request = MockRequest({'search': 'haseeb'})
        response = s3_screenshots_users_api(request)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = json.loads(response.content)
            users_count = len(data['data']['users'])
            print(f"   ✅ Found {users_count} users matching 'haseeb'")
        
        # Test with limit
        print("\n3. Testing with limit parameter...")
        request = MockRequest({'limit': '1', 'include_stats': 'false'})
        response = s3_screenshots_users_api(request)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = json.loads(response.content)
            users_count = len(data['data']['users'])
            print(f"   ✅ Returned {users_count} users (limit: 1)")
        
        print("\n✅ API test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")

if __name__ == "__main__":
    test_s3_screenshots_users_api()
