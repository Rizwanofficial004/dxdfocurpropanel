"""
Simple test for S3 Screenshots Users API
Direct testing without FastAPI dependencies
"""

import boto3
import json
from datetime import datetime
from botocore.exceptions import ClientError, NoCredentialsError

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
        print(f"Error initializing S3 client: {str(e)}")
        return None

def get_s3_screenshots_users(include_stats=True, limit=None, search_term=None):
    """
    Get all users who have screenshots in S3 bucket
    """
    
    try:
        # Initialize S3 client
        s3_client = get_s3_client()
        if not s3_client:
            return {
                "success": False,
                "message": "Failed to connect to S3",
                "data": {},
                "timestamp": datetime.now().isoformat()
            }
        
        print(f"🔍 Scanning S3 bucket: {S3_BUCKET_NAME}/screenshots/")
        
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
            
            print("📁 Discovering user folders...")
            
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
                            if search_term and search_term.lower() not in email.lower() and search_term.lower() not in username.lower():
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
            
            print(f"📊 Found {len(users_data)} user folders")
            
            # Get detailed statistics if requested
            if include_stats and users_data:
                print("📈 Gathering detailed statistics...")
                
                # Get file details for each user
                for email in users_data.keys():
                    folder_name = users_data[email]["folder_name"]
                    
                    try:
                        # List files in user's folder
                        response = s3_client.list_objects_v2(
                            Bucket=S3_BUCKET_NAME,
                            Prefix=f'screenshots/{folder_name}/',
                            MaxKeys=1000  # Limit to avoid timeout
                        )
                        
                        if 'Contents' in response:
                            for obj in response['Contents']:
                                total_objects_scanned += 1
                                key = obj['Key']
                                
                                stats = users_data[email]["statistics"]
                                stats["total_files"] += 1
                                stats["total_size_bytes"] += obj.get('Size', 0)
                                stats["total_size_mb"] = round(stats["total_size_bytes"] / (1024 * 1024), 2)
                                
                                # Update last modified
                                obj_modified = obj['LastModified'].isoformat()
                                if not stats["last_modified"] or obj_modified > stats["last_modified"]:
                                    stats["last_modified"] = obj_modified
                                
                                # Extract file extension
                                if '.' in key:
                                    ext = key.split('.')[-1].lower()
                                    if ext not in stats["file_types"]:
                                        stats["file_types"].append(ext)
                                
                                # Extract date folder if exists
                                parts = key.split('/')
                                if len(parts) >= 3:
                                    date_folder = parts[2]
                                    if date_folder and date_folder not in stats["date_folders"]:
                                        stats["date_folders"].append(date_folder)
                                        
                    except Exception as e:
                        print(f"   ⚠️ Error getting stats for {email}: {str(e)}")
            
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
                        "search_term": search_term,
                        "include_statistics": include_stats,
                        "s3_bucket": S3_BUCKET_NAME,
                        "screenshots_prefix": "screenshots/",
                        "objects_scanned": total_objects_scanned,
                        "scan_timestamp": datetime.now().isoformat()
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return response_data
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            
            return {
                "success": False,
                "message": f"S3 access error: {error_message}",
                "data": {},
                "error_code": error_code,
                "timestamp": datetime.now().isoformat()
            }
            
    except NoCredentialsError:
        return {
            "success": False,
            "message": "S3 credentials not configured",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Internal server error: {str(e)}",
            "data": {},
            "timestamp": datetime.now().isoformat()
        }

def test_api():
    """Test the S3 Screenshots Users API"""
    print("🧪 Testing S3 Screenshots Users API")
    print("=" * 60)
    
    # Test 1: Basic call
    print("\n1. Testing basic API call...")
    result = get_s3_screenshots_users()
    
    if result["success"]:
        users = result["data"]["users"]
        metadata = result["data"]["metadata"]
        
        print(f"   ✅ Success! Found {len(users)} users")
        print(f"   📊 Objects scanned: {metadata['objects_scanned']}")
        print(f"   🕐 Scan time: {metadata['scan_timestamp']}")
        
        if users:
            print(f"\n   👥 Sample users:")
            for i, user in enumerate(users[:3]):  # Show first 3
                print(f"   {i+1}. {user['email']} ({user['display_name']})")
                if 'statistics' in user:
                    stats = user['statistics']
                    print(f"      📁 Files: {stats['total_files']}, Size: {stats['total_size_mb']} MB")
                    if stats['file_types']:
                        print(f"      📷 File types: {', '.join(stats['file_types'])}")
    else:
        print(f"   ❌ Error: {result['message']}")
        return
    
    # Test 2: Search functionality
    print("\n2. Testing search functionality...")
    result = get_s3_screenshots_users(search_term="haseeb")
    
    if result["success"]:
        users = result["data"]["users"]
        print(f"   ✅ Found {len(users)} users matching 'haseeb'")
        
        for user in users:
            print(f"   📧 {user['email']}")
    else:
        print(f"   ❌ Search error: {result['message']}")
    
    # Test 3: Limited results without stats
    print("\n3. Testing limit and no statistics...")
    result = get_s3_screenshots_users(include_stats=False, limit=2)
    
    if result["success"]:
        users = result["data"]["users"]
        print(f"   ✅ Returned {len(users)} users (limit: 2, no stats)")
        
        for user in users:
            print(f"   📧 {user['email']} -> {user['screenshots_folder']}")
    else:
        print(f"   ❌ Limit test error: {result['message']}")
    
    print("\n" + "=" * 60)
    print("✅ API testing completed!")
    
    # Show usage examples
    print("\n📋 Usage Examples:")
    print("   • All users: get_s3_screenshots_users()")
    print("   • Search users: get_s3_screenshots_users(search_term='john')")
    print("   • Limited results: get_s3_screenshots_users(limit=10)")
    print("   • No statistics: get_s3_screenshots_users(include_stats=False)")

if __name__ == "__main__":
    test_api()
