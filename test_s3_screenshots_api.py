"""
Test script for S3 Screenshots Users API
"""

import requests
import json
from datetime import datetime

def test_s3_screenshots_api():
    """Test the S3 Screenshots Users API"""
    
    # Test with the FastAPI server
    base_url = "http://localhost:8000"
    
    print("🧪 Testing S3 Screenshots Users API")
    print("=" * 60)
    
    # Test if server is running
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running")
        else:
            print(f"❌ API server not responding properly: {response.status_code}")
            return
    except requests.exceptions.RequestException:
        print("❌ API server is not running or not accessible")
        print("💡 Please start the server first: python fastapi_s3_screenshots_users.py")
        return
    
    # Test basic API call
    print("\n1. Testing basic API call...")
    try:
        response = requests.get(f"{base_url}/api/screenshots/users", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            metadata = data.get('data', {}).get('metadata', {})
            
            print(f"   ✅ Success! Found {len(users)} users")
            print(f"   📊 Total scanned objects: {metadata.get('objects_scanned', 0)}")
            
            if users:
                print(f"   👤 First user example: {users[0]['email']}")
                if 'statistics' in users[0]:
                    stats = users[0]['statistics']
                    print(f"   📁 Files: {stats['total_files']}, Size: {stats['total_size_mb']} MB")
        else:
            print(f"   ❌ Error: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
    
    # Test with search parameter
    print("\n2. Testing with search parameter...")
    try:
        response = requests.get(f"{base_url}/api/screenshots/users?search=haseeb", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            print(f"   ✅ Found {len(users)} users matching 'haseeb'")
            
            for user in users:
                print(f"   📧 {user['email']}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
    
    # Test with limit and no stats
    print("\n3. Testing with limit and no statistics...")
    try:
        response = requests.get(f"{base_url}/api/screenshots/users?limit=3&include_stats=false", timeout=30)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            print(f"   ✅ Returned {len(users)} users (limit: 3)")
            
            for user in users:
                print(f"   📧 {user['email']} ({user['display_name']})")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ API testing completed!")
    print("💡 You can also test manually at: http://localhost:8000/docs")

def test_direct_s3_connection():
    """Test direct S3 connection without API"""
    print("\n🔗 Testing direct S3 connection...")
    
    try:
        import boto3
        from botocore.exceptions import ClientError, NoCredentialsError
        
        # S3 Configuration
        S3_BUCKET_NAME = "ddsfocustime"
        AWS_ACCESS_KEY_ID = "AKIARSU6EUUWMQ5I2JWC"
        AWS_SECRET_ACCESS_KEY = "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"
        S3_REGION = "eu-west-1"
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=S3_REGION
        )
        
        # List objects in screenshots folder
        response = s3_client.list_objects_v2(
            Bucket=S3_BUCKET_NAME,
            Prefix='screenshots/',
            Delimiter='/',
            MaxKeys=10
        )
        
        if 'CommonPrefixes' in response:
            folders = [prefix['Prefix'] for prefix in response['CommonPrefixes']]
            print(f"   ✅ S3 connection successful! Found {len(folders)} user folders")
            
            for folder in folders[:3]:  # Show first 3
                user_folder = folder.replace('screenshots/', '').rstrip('/')
                email = user_folder.replace('_at_', '@')
                print(f"   📁 {email}")
        else:
            print("   ⚠️  No user folders found in screenshots directory")
            
    except NoCredentialsError:
        print("   ❌ S3 credentials not configured")
    except ClientError as e:
        print(f"   ❌ S3 access error: {e}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    # Test direct S3 connection first
    test_direct_s3_connection()
    
    # Then test API
    test_s3_screenshots_api()
