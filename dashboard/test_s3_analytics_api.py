#!/usr/bin/env python3
"""
Test S3 User Analytics API
Simple script to test all endpoints
"""

import requests
import json
from datetime import datetime

def test_api_endpoint(url, description):
    """Test a single API endpoint"""
    print(f"\n🔍 Testing: {description}")
    print(f"📡 URL: {url}")
    print("-" * 50)
    
    try:
        start_time = datetime.now()
        response = requests.get(url, timeout=30)
        end_time = datetime.now()
        
        execution_time = (end_time - start_time).total_seconds()
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"⏱️ Response Time: {execution_time:.2f}s")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Success: {data.get('message', 'No message')}")
                    
                    # Show relevant summary data
                    if 'summary' in data:
                        summary = data['summary']
                        print(f"📊 Summary:")
                        print(f"   👥 Total Users: {summary.get('total_users', 'N/A')}")
                        print(f"   📸 Total Screenshots: {summary.get('total_screenshots', 'N/A')}")
                        print(f"   📁 Total Folders: {summary.get('total_folders', 'N/A')}")
                        print(f"   💾 Total Size: {summary.get('total_size_mb', 'N/A')} MB")
                    
                    if 'users' in data and data['users']:
                        print(f"📋 Users Found: {len(data['users'])}")
                        print("🔝 Top 3 Users by Screenshots:")
                        for i, user in enumerate(data['users'][:3], 1):
                            print(f"   {i}. {user['email']} - {user['total_screenshots']} screenshots, {user['total_folders']} folders")
                    
                    if 'user' in data:
                        user = data['user']
                        print(f"👤 User: {user['email']}")
                        print(f"📸 Screenshots: {user['total_screenshots']}")
                        print(f"📁 Folders: {user['total_folders']}")
                        print(f"💾 Size: {user['total_size_mb']} MB")
                        print(f"🕒 Last Activity: {user.get('last_activity_humanized', 'N/A')}")
                        
                        if 'insights' in data:
                            insights = data['insights']
                            print(f"💡 Insights:")
                            print(f"   📁 Most Active Folder: {insights.get('most_active_folder', 'N/A')}")
                            print(f"   📊 Avg Screenshots/Folder: {insights.get('avg_screenshots_per_folder', 'N/A')}")
                else:
                    print(f"❌ API Error: {data.get('error', 'Unknown error')}")
                    
            except json.JSONDecodeError:
                print(f"⚠️ Response is not valid JSON")
                print(f"📄 Response content (first 200 chars): {response.text[:200]}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"📄 Response: {response.text[:200]}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")

def main():
    """Run all API tests"""
    
    base_url = "http://localhost:9000"
    
    print("=" * 60)
    print("🧪 S3 USER ANALYTICS API TESTING")
    print("=" * 60)
    print(f"🎯 Base URL: {base_url}")
    print(f"🕒 Test Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Bucket Overview
    test_api_endpoint(
        f"{base_url}/api/s3/bucket-overview/",
        "Bucket Overview - High-level statistics"
    )
    
    # Test 2: User Analytics (All Users)
    test_api_endpoint(
        f"{base_url}/api/s3/user-analytics/",
        "User Analytics - All Users"
    )
    
    # Test 3: User Analytics with Filters
    test_api_endpoint(
        f"{base_url}/api/s3/user-analytics/?min_screenshots=100&limit=5",
        "User Analytics - Filtered (min 100 screenshots, limit 5)"
    )
    
    # Test 4: User Details for Haseeb
    test_api_endpoint(
        f"{base_url}/api/s3/user-details/?email=haseebcodejourney@gmail.com",
        "User Details - Haseeb (haseebcodejourney@gmail.com)"
    )
    
    # Test 5: User Details for Merve (if exists)
    test_api_endpoint(
        f"{base_url}/api/s3/user-details/?email=mervegucluu.0044@gmail.com",
        "User Details - Merve (mervegucluu.0044@gmail.com)"
    )
    
    # Test 6: Search by user name
    test_api_endpoint(
        f"{base_url}/api/s3/user-analytics/?user=haseeb",
        "User Analytics - Search for 'haseeb'"
    )
    
    # Test 7: Invalid endpoint
    test_api_endpoint(
        f"{base_url}/api/s3/invalid-endpoint/",
        "Invalid Endpoint Test (should return 404)"
    )
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETED")
    print("=" * 60)
    print(f"📋 Test Summary:")
    print(f"   🌐 Server: {base_url}")
    print(f"   📚 API Documentation: {base_url}/")
    print(f"   🔍 Main Endpoint: {base_url}/api/s3/user-analytics/")
    print("=" * 60)

if __name__ == "__main__":
    main()
