"""
Simple S3 Connection Test Through API
"""

import requests
import json

def test_s3_connection():
    print("🧪 TESTING S3 CONNECTION THROUGH API")
    print("=" * 50)
    
    # Test basic API endpoints first
    endpoints = [
        ('Basic API Status', 'http://localhost:5000/api/screenshots/status'),
        ('All Users', 'http://localhost:5000/api/screenshots/all'),
    ]
    
    for name, url in endpoints:
        print(f"\n📡 Testing: {name}")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if 'total_users' in data:
                    print(f"   ✅ Found {data['total_users']} users")
                    
                    # Show first few users
                    if 'users' in data:
                        users = data['users'][:3]
                        for user in users:
                            email = user.get('email', 'Unknown')
                            count = user.get('screenshot_count', 0)
                            print(f"      • {email}: {count:,} screenshots")
                
                elif 'status' in data:
                    print(f"   Status: {data['status']}")
                    if 'error' in data:
                        print(f"   ❌ Error: {data['error']}")
                
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Request Error: {str(e)}")
    
    print(f"\n🎯 TEST SPECIFIC USER INTERVALS:")
    print("-" * 40)
    
    # Test one specific user
    test_email = "amirishaque67@gmail.com"
    url = f"http://localhost:5000/api/screenshots/user/{test_email}/intervals"
    
    print(f"Testing: {test_email}")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            status = data.get('status', 'unknown')
            print(f"API Status: {status}")
            
            if status == 'error':
                error = data.get('error', 'Unknown error')
                print(f"❌ Error: {error}")
                
                # Check if it's an S3 error
                if 'SignatureDoesNotMatch' in error:
                    print("🔧 AWS Signature Error - Credentials issue!")
                elif 'NoSuchBucket' in error:
                    print("🔧 Bucket not found - Check bucket name!")
                elif 'AccessDenied' in error:
                    print("🔧 Access denied - Check permissions!")
                    
            elif status == 'no_data':
                print("⚠️  No screenshots with valid timestamps found")
                total = data.get('total_screenshots', 0)
                print(f"   Total screenshots: {total:,}")
                
                # Check if any files were found at all
                if total > 0:
                    print("   📝 Files exist but timestamp parsing failed")
                else:
                    print("   📝 No files found in S3 folder")
                    
            elif status == 'success':
                print("🎉 SUCCESS! Found interval data")
                total = data.get('total_screenshots', 0)
                print(f"   Screenshots: {total:,}")
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"❌ Request Error: {str(e)}")
    
    print(f"\n💡 TROUBLESHOOTING TIPS:")
    print("1. Check if Flask server is running with updated credentials")
    print("2. Verify S3 bucket access and folder structure")
    print("3. Test timestamp parsing patterns")

if __name__ == "__main__":
    test_s3_connection()
