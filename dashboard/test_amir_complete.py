"""
Test Amir's API with URL encoding and basic search
"""

import requests
import json
import urllib.parse

def test_amir_complete():
    print("🧪 COMPLETE AMIR TESTING")
    print("=" * 50)
    
    # Test 1: Basic user search for Amir
    print("1️⃣ Testing Basic User Search...")
    try:
        # URL encode the email to handle @ symbol properly
        encoded_email = urllib.parse.quote("amirishaque67@gmail.com", safe='')
        url = f"http://localhost:5000/api/screenshots/user/{encoded_email}"
        print(f"🔗 URL: {url}")
        
        response = requests.get(url)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Basic search SUCCESS!")
            print(f"   Status: {data.get('status')}")
            if data.get('found_users'):
                for user in data['found_users']:
                    print(f"   👤 {user['user_email']}: {user['screenshot_count']} screenshots")
        else:
            print(f"❌ Basic search failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Basic search error: {e}")
    
    # Test 2: Try intervals with different encoding approaches
    print("\n2️⃣ Testing Intervals with URL Encoding...")
    
    # Approach 1: URL encoded email
    try:
        encoded_email = urllib.parse.quote("amirishaque67@gmail.com", safe='')
        url = f"http://localhost:5000/api/screenshots/user/{encoded_email}/intervals"
        print(f"🔗 Encoded URL: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Intervals SUCCESS with encoding!")
            print(f"   Status: {data.get('status')}")
            if data.get('status') == 'error':
                error_msg = data.get('error', '')
                if 'SignatureDoesNotMatch' in error_msg:
                    print("   🔑 AWS Signature issue - credentials may need refresh")
                elif 'No screenshots' in error_msg:
                    print("   📸 No screenshots found for this user")
                else:
                    print(f"   ❌ Other error: {error_msg[:100]}...")
        else:
            print(f"❌ Intervals failed: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("⏱️  Request timed out - processing large dataset")
    except Exception as e:
        print(f"❌ Intervals error: {e}")
    
    # Test 3: Try details endpoint
    print("\n3️⃣ Testing Details Endpoint...")
    try:
        encoded_email = urllib.parse.quote("amirishaque67@gmail.com", safe='')
        url = f"http://localhost:5000/api/screenshots/user/{encoded_email}/details"
        print(f"🔗 Details URL: {url}")
        
        response = requests.get(url, timeout=10)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Details SUCCESS!")
            print(f"   Status: {data.get('status')}")
        else:
            print(f"❌ Details failed: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("⏱️  Details timed out")
    except Exception as e:
        print(f"❌ Details error: {e}")
    
    # Test 4: Show recommended Postman testing approach
    print("\n4️⃣ POSTMAN TESTING RECOMMENDATIONS")
    print("-" * 40)
    print("✅ URL that WORKS in Postman:")
    print(f"   GET http://localhost:5000/api/screenshots/user/{urllib.parse.quote('amirishaque67@gmail.com', safe='')}/intervals")
    print("\n📋 Or test with simpler user (no @ symbol):")
    print("   GET http://localhost:5000/api/screenshots/user/amir/intervals")
    print("   (This will search for any user containing 'amir')")
    
    print("\n🔧 If AWS errors occur:")
    print("   - Check AWS credentials in enhanced_screenshot_api.py")
    print("   - Verify S3 bucket permissions")
    print("   - Try with a user that has fewer screenshots first")

if __name__ == "__main__":
    test_amir_complete()
