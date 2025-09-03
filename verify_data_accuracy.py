import requests
import boto3
import json
from datetime import datetime

def verify_s3_connection():
    """Verify S3 connection and bucket access"""
    print("🔍 VERIFYING S3 CONNECTION")
    print("=" * 50)
    
    # Use the credentials from .env
    aws_access_key = "AKIARSU6EUUWMQ5I2JWC"
    aws_secret_key = "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"
    bucket_name = "ddsfocustime"
    region = "eu-north-1"
    
    try:
        # Create S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_key,
            region_name=region
        )
        
        print(f"✅ S3 Client created successfully")
        print(f"📦 Bucket: {bucket_name}")
        print(f"🌍 Region: {region}")
        
        # List objects in the bucket
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix='users_screenshots/2025-09-01/',
            MaxKeys=100
        )
        
        if 'Contents' in response:
            objects = response['Contents']
            print(f"📁 Found {len(objects)} objects in users_screenshots/2025-09-01/")
            
            # Group by user
            users = {}
            haseeb_files = []
            
            for obj in objects:
                key = obj['Key']
                print(f"  🔍 Found: {key}")
                
                if 'haseeb' in key.lower():
                    haseeb_files.append({
                        'key': key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified']
                    })
                
                # Extract user from path
                parts = key.split('/')
                if len(parts) >= 3:
                    user_folder = parts[2]
                    if user_folder not in users:
                        users[user_folder] = 0
                    users[user_folder] += 1
            
            print(f"\n👥 USERS FOUND:")
            for user, count in users.items():
                print(f"  📧 {user}: {count} files")
            
            print(f"\n🎯 HASEEB FILES ({len(haseeb_files)}):")
            for file in haseeb_files:
                print(f"  📸 {file['key']}")
                print(f"      Size: {file['size']} bytes")
                print(f"      Modified: {file['last_modified']}")
                
            return True, len(haseeb_files)
            
        else:
            print("❌ No objects found in bucket")
            return False, 0
            
    except Exception as e:
        print(f"💥 S3 Error: {e}")
        return False, 0

def test_api_vs_s3_data():
    """Compare API response with direct S3 data"""
    print(f"\n🔄 TESTING API VS S3 DATA ACCURACY")
    print("=" * 50)
    
    # Test the API
    url = "http://127.0.0.1:8000/api/users/search/?q=haseeb&start_date=2025-09-01&end_date=2025-09-02&page=1&page_size=50"
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            performance = data.get('data', {}).get('search_performance', {})
            
            print(f"✅ API Response received")
            print(f"👥 Users returned: {len(users)}")
            print(f"🔍 Objects scanned: {performance.get('objects_scanned', 'N/A')}")
            print(f"📷 Screenshots found: {performance.get('screenshots_found', 'N/A')}")
            print(f"⏱️ Search time: {performance.get('search_time_ms', 'N/A')}ms")
            
            if users:
                user = users[0]
                api_screenshots = user.get('total_screenshots', 0)
                api_email = user.get('email', 'N/A')
                api_size_mb = user.get('total_size_mb', 0)
                
                print(f"\n📊 API DATA:")
                print(f"  📧 Email: {api_email}")
                print(f"  📸 Total Screenshots: {api_screenshots}")
                print(f"  💾 Total Size: {api_size_mb} MB")
                
                # Check grouped screenshots
                grouped = user.get('grouped_screenshots', {})
                total_in_groups = 0
                for date_key, group in grouped.items():
                    count = len(group.get('screenshots', []))
                    total_in_groups += count
                    print(f"  📅 {date_key}: {count} screenshots")
                
                print(f"  🔢 Total in groups: {total_in_groups}")
                
                # Get S3 data for comparison
                s3_connected, s3_haseeb_count = verify_s3_connection()
                
                if s3_connected:
                    print(f"\n⚖️ COMPARISON:")
                    print(f"  API Screenshots: {api_screenshots}")
                    print(f"  S3 Haseeb Files: {s3_haseeb_count}")
                    
                    if api_screenshots == s3_haseeb_count:
                        print(f"  ✅ DATA MATCHES!")
                    else:
                        print(f"  ❌ DATA MISMATCH!")
                        print(f"      Difference: {abs(api_screenshots - s3_haseeb_count)} files")
                        
                        if api_screenshots < s3_haseeb_count:
                            print(f"      🔍 API might be missing some files")
                        else:
                            print(f"      🔍 API might be counting extra files")
                
            else:
                print("❌ No users returned from API")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text[:500]}...")
            
    except Exception as e:
        print(f"💥 API Test Error: {e}")

def check_date_filtering_accuracy():
    """Check if date filtering is working correctly"""
    print(f"\n📅 CHECKING DATE FILTERING ACCURACY")
    print("=" * 50)
    
    test_cases = [
        {
            "start_date": "2025-09-01",
            "end_date": "2025-09-01", 
            "description": "Same day filter"
        },
        {
            "start_date": "2025-09-01",
            "end_date": "2025-09-02",
            "description": "Two day range"
        },
        {
            "start_date": "",
            "end_date": "",
            "description": "No date filter"
        }
    ]
    
    for test_case in test_cases:
        start_date = test_case["start_date"]
        end_date = test_case["end_date"]
        desc = test_case["description"]
        
        print(f"\n🧪 Testing: {desc}")
        
        # Build URL
        url = f"http://127.0.0.1:8000/api/users/search/?q=haseeb&page=1&page_size=50"
        if start_date:
            url += f"&start_date={start_date}"
        if end_date:
            url += f"&end_date={end_date}"
            
        print(f"URL: {url}")
        
        try:
            response = requests.get(url, timeout=20)
            
            if response.status_code == 200:
                data = response.json()
                users = data.get('data', {}).get('users', [])
                performance = data.get('data', {}).get('search_performance', {})
                
                if users:
                    user = users[0]
                    screenshots = user.get('total_screenshots', 0)
                    print(f"  📸 Screenshots found: {screenshots}")
                    
                    # Check date filters in response
                    search_options = data.get('data', {}).get('search_options', {})
                    date_filters = search_options.get('date_filters', {})
                    
                    print(f"  📅 Applied start_date: {date_filters.get('start_date', 'None')}")
                    print(f"  📅 Applied end_date: {date_filters.get('end_date', 'None')}")
                    print(f"  🔄 Date range applied: {date_filters.get('date_range_applied', False)}")
                    
                else:
                    print(f"  📭 No users found")
                    
            else:
                print(f"  ❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"  💥 Error: {e}")

def detailed_screenshot_analysis():
    """Analyze each screenshot in detail"""
    print(f"\n🔬 DETAILED SCREENSHOT ANALYSIS")
    print("=" * 50)
    
    url = "http://127.0.0.1:8000/api/users/search/?q=haseeb&start_date=2025-09-01&end_date=2025-09-02&page=1&page_size=50"
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            
            if users:
                user = users[0]
                grouped = user.get('grouped_screenshots', {})
                recent = user.get('recent_screenshots', [])
                
                print(f"📧 User: {user.get('email', 'N/A')}")
                print(f"📸 Total Screenshots: {user.get('total_screenshots', 0)}")
                
                for date_key, group in grouped.items():
                    screenshots = group.get('screenshots', [])
                    print(f"\n📅 Date: {date_key}")
                    print(f"🔢 Count: {len(screenshots)}")
                    print(f"💾 Total Size: {group.get('total_size_mb', 0)} MB")
                    
                    for i, screenshot in enumerate(screenshots, 1):
                        print(f"  {i}. {screenshot.get('filename', 'N/A')}")
                        print(f"     Time: {screenshot.get('time', 'N/A')}")
                        print(f"     Size: {screenshot.get('size_mb', 0)} MB")
                        print(f"     URL: {screenshot.get('screenshot_url', 'N/A')[:80]}...")
                
                print(f"\n🕐 RECENT SCREENSHOTS ({len(recent)}):")
                for i, screenshot in enumerate(recent, 1):
                    print(f"  {i}. {screenshot.get('filename', 'N/A')} - {screenshot.get('time', 'N/A')}")
                    
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    verify_s3_connection()
    test_api_vs_s3_data()
    check_date_filtering_accuracy()
    detailed_screenshot_analysis()
