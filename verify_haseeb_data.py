import boto3
import requests
import time

def verify_s3_haseeb_data():
    print("🔍 VERIFYING HASEEB DATA IN S3")
    print("=" * 50)
    
    try:
        # Connect to S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id='AKIARSU6EUUWMQ5I2JWC',
            aws_secret_access_key='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',
            region_name='eu-north-1'
        )
        
        print("✅ S3 Connection established")
        
        # List all objects with haseeb
        response = s3_client.list_objects_v2(
            Bucket='ddsfocustime',
            Prefix='users_screenshots/2025-09-01/',
            MaxKeys=1000
        )
        
        haseeb_files = []
        total_files = 0
        
        if 'Contents' in response:
            for obj in response['Contents']:
                total_files += 1
                key = obj['Key']
                if 'haseeb' in key.lower():
                    haseeb_files.append({
                        'key': key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified']
                    })
        
        print(f"📁 Total files scanned: {total_files}")
        print(f"🎯 Haseeb files found: {len(haseeb_files)}")
        
        for i, file in enumerate(haseeb_files, 1):
            print(f"  {i}. {file['key']}")
            print(f"     Size: {file['size']} bytes")
            print(f"     Modified: {file['last_modified']}")
        
        return len(haseeb_files)
        
    except Exception as e:
        print(f"💥 S3 Error: {e}")
        return 0

def test_api_haseeb():
    print(f"\n🔄 TESTING API FOR HASEEB")
    print("=" * 50)
    
    url = "http://127.0.0.1:8000/api/users/search/?q=haseeb&start_date=2025-09-01&end_date=2025-09-02&page=1&page_size=50"
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=30)
        response_time = round((time.time() - start_time) * 1000, 2)
        
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            performance = data.get('data', {}).get('search_performance', {})
            
            print(f"✅ API Response ({response_time}ms)")
            print(f"👥 Users found: {len(users)}")
            print(f"🔍 Objects scanned: {performance.get('objects_scanned', 'N/A')}")
            print(f"📷 Screenshots found: {performance.get('screenshots_found', 'N/A')}")
            
            if users:
                user = users[0]
                api_screenshots = user.get('total_screenshots', 0)
                email = user.get('email', 'N/A')
                size_mb = user.get('total_size_mb', 0)
                
                print(f"\n📊 USER DATA:")
                print(f"  📧 Email: {email}")
                print(f"  📸 Screenshots: {api_screenshots}")
                print(f"  💾 Size: {size_mb} MB")
                
                # Analyze grouped screenshots
                grouped = user.get('grouped_screenshots', {})
                for date_key, group in grouped.items():
                    screenshots = group.get('screenshots', [])
                    print(f"  📅 {date_key}: {len(screenshots)} screenshots")
                    
                    # Show first few screenshots
                    for i, screenshot in enumerate(screenshots[:3], 1):
                        filename = screenshot.get('filename', 'N/A')
                        time_str = screenshot.get('time', 'N/A')
                        size = screenshot.get('size_mb', 0)
                        print(f"    {i}. {filename} ({time_str}) - {size}MB")
                    
                    if len(screenshots) > 3:
                        print(f"    ... and {len(screenshots) - 3} more")
                
                return api_screenshots
            else:
                print("❌ No users found")
                return 0
                
        else:
            print(f"❌ API Error: {response.status_code}")
            return 0
            
    except Exception as e:
        print(f"💥 API Error: {e}")
        return 0

def analyze_discrepancy():
    print(f"\n📊 DATA ACCURACY ANALYSIS")
    print("=" * 50)
    
    # Get S3 count
    s3_count = verify_s3_haseeb_data()
    
    # Get API count
    api_count = test_api_haseeb()
    
    print(f"\n⚖️ FINAL COMPARISON:")
    print(f"  S3 Direct Count: {s3_count}")
    print(f"  API Return Count: {api_count}")
    
    if s3_count == api_count:
        print(f"  ✅ DATA IS ACCURATE!")
        print(f"  🎉 API correctly returns all {s3_count} Haseeb screenshots")
    else:
        difference = abs(s3_count - api_count)
        print(f"  ❌ DATA MISMATCH!")
        print(f"  📊 Difference: {difference} screenshots")
        
        if api_count < s3_count:
            print(f"  🔍 API is missing {difference} screenshots")
            print(f"  📋 Possible causes:")
            print(f"    - Date filtering too restrictive")
            print(f"    - Search logic not matching all files")
            print(f"    - File naming pattern issues")
        else:
            print(f"  🔍 API is reporting {difference} extra screenshots")
            print(f"  📋 Possible causes:")
            print(f"    - Duplicate counting")
            print(f"    - Including files from other dates")
    
    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    if s3_count != api_count:
        print(f"  1. Check date range filtering logic")
        print(f"  2. Verify file naming pattern matching")
        print(f"  3. Ensure no duplicate counting")
        print(f"  4. Validate search term matching")
    else:
        print(f"  🎯 Data is accurate - no fixes needed!")

if __name__ == "__main__":
    analyze_discrepancy()
