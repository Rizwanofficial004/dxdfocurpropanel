#!/usr/bin/env python3
"""
Quick S3 API Verification Script
Tests the main endpoints to ensure they're working
"""

import requests
import json
import time

def test_endpoint(url, name, timeout=30):
    """Test a single endpoint"""
    print(f"🔍 Testing {name}...")
    print(f"   URL: {url}")
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        end_time = time.time()
        
        print(f"   ⏱️ Response time: {end_time - start_time:.2f}s")
        print(f"   📊 Status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success'):
                    print(f"   ✅ Success: {data.get('message', 'OK')}")
                    
                    # Show key metrics
                    if 'summary' in data:
                        summary = data['summary']
                        print(f"   📈 Users: {summary.get('total_users', 'N/A')}")
                        print(f"   📸 Screenshots: {summary.get('total_screenshots', 'N/A')}")
                        print(f"   📁 Folders: {summary.get('total_folders', 'N/A')}")
                    
                    if 'users' in data and data['users']:
                        print(f"   👥 Found {len(data['users'])} users")
                        
                    if 'user' in data:
                        user = data['user']
                        print(f"   👤 User: {user.get('email', 'N/A')}")
                        print(f"   📸 Screenshots: {user.get('total_screenshots', 'N/A')}")
                        
                    return True
                else:
                    print(f"   ❌ API Error: {data.get('error', 'Unknown error')}")
                    return False
                    
            except json.JSONDecodeError:
                print(f"   ❌ Invalid JSON response")
                return False
        else:
            print(f"   ❌ HTTP Error: {response.status_code}")
            print(f"   📄 Response: {response.text[:100]}...")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Connection Error: Server not running on {url}")
        return False
    except requests.exceptions.Timeout:
        print(f"   ⏱️ Timeout: Request took longer than {timeout}s")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected Error: {str(e)}")
        return False

def main():
    """Run quick verification tests"""
    
    print("=" * 60)
    print("🧪 S3 USER ANALYTICS API - QUICK VERIFICATION")
    print("=" * 60)
    
    base_url = "http://localhost:9000"
    
    # Test if server is running
    print(f"🎯 Testing server at: {base_url}")
    print()
    
    tests = [
        (f"{base_url}/", "Root Documentation", 10),
        (f"{base_url}/api/s3/bucket-overview/", "Bucket Overview", 30),
        (f"{base_url}/api/s3/user-analytics/?limit=5", "User Analytics (Limited)", 30),
        (f"{base_url}/api/s3/user-details/?email=haseebcodejourney@gmail.com", "User Details", 30),
    ]
    
    results = []
    
    for url, name, timeout in tests:
        success = test_endpoint(url, name, timeout)
        results.append((name, success))
        print()
    
    print("=" * 60)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if not success:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 ALL TESTS PASSED! Your S3 Analytics API is working correctly.")
        print()
        print("🔗 Ready to use:")
        print(f"   📚 Documentation: {base_url}/")
        print(f"   🔍 Main API: {base_url}/api/s3/user-analytics/")
        print(f"   👤 User Details: {base_url}/api/s3/user-details/?email=USER_EMAIL")
        print(f"   📊 Overview: {base_url}/api/s3/bucket-overview/")
    else:
        print("⚠️ SOME TESTS FAILED. Please check the server logs and configuration.")
        print()
        print("🔧 Troubleshooting:")
        print("   1. Make sure the server is running: python s3_user_analytics_api.py")
        print("   2. Check S3 credentials and bucket access")
        print("   3. Verify network connectivity")
        print("   4. Review server console for error messages")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
