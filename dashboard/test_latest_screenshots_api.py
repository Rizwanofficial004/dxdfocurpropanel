#!/usr/bin/env python3
"""
Test script for Live Tracking Screenshots API
Shows latest screenshot for each user (29+ users)
"""

import requests
import json
import sys
from datetime import datetime

def test_live_tracking_screenshots_api():
    """Test the Live Tracking Screenshots API"""
    
    # API endpoint
    base_url = "http://127.0.0.1:8000"  # Change this to your Django server URL
    endpoint = "/api/live-tracking/screenshots/"
    url = f"{base_url}{endpoint}"
    
    print("📸 Testing Live Tracking Screenshots API")
    print(f"🌐 URL: {url}")
    print("=" * 60)
    
    # Test parameters
    test_params = {
        "limit": 50,           # Get up to 50 users
        "status": "all",       # Get all users regardless of status
        "latest_only": "true", # Only get latest screenshot per user
        "sort_by": "name"      # Sort by name
    }
    
    try:
        print("📡 Making API request...")
        response = requests.get(url, params=test_params, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ API Response Successful!")
            print("=" * 60)
            
            # Parse response
            success = data.get('success', False)
            message = data.get('message', 'No message')
            api_data = data.get('data', {})
            
            print(f"🎯 Success: {success}")
            print(f"💬 Message: {message}")
            print()
            
            # Summary information
            summary = api_data.get('summary', {})
            print("📊 SUMMARY:")
            print(f"   Total Users: {summary.get('total_users', 0)}")
            print(f"   Users with Screenshots: {summary.get('users_with_screenshots', 0)}")
            print(f"   Users without Screenshots: {summary.get('users_without_screenshots', 0)}")
            print(f"   Total Screenshots Found: {summary.get('total_screenshots_found', 0)}")
            print(f"   Date Scanned: {summary.get('date_scanned', 'N/A')}")
            print()
            
            # Status breakdown
            status_breakdown = api_data.get('status_breakdown', {})
            print("📈 STATUS BREAKDOWN:")
            for status, count in status_breakdown.items():
                print(f"   {status.capitalize()}: {count}")
            print()
            
            # Users data
            users = api_data.get('users', [])
            print(f"👥 USERS ({len(users)}):")
            print("-" * 60)
            
            for i, user in enumerate(users[:10], 1):  # Show first 10 users
                print(f"{i:2d}. {user.get('display_name', 'N/A')} ({user.get('email', 'N/A')})")
                print(f"    Status: {user.get('status', 'N/A')} | Staff ID: {user.get('staff_id', 'N/A')}")
                print(f"    Current Task: {user.get('current_task', 'N/A')}")
                print(f"    Current Project: {user.get('current_project', 'N/A')}")
                
                screenshot = user.get('latest_screenshot', {})
                if screenshot.get('has_screenshot'):
                    print(f"    📸 Latest Screenshot: ✅ Available")
                    print(f"    🕒 Screenshot Time: {screenshot.get('timestamp', 'N/A')}")
                    print(f"    🔗 URL: {screenshot.get('url', 'N/A')[:50]}...")
                else:
                    print(f"    📸 Latest Screenshot: ❌ Not Available")
                
                stats = user.get('screenshot_stats', {})
                print(f"    📊 Total Screenshots: {stats.get('total_screenshots', 0)}")
                print()
            
            if len(users) > 10:
                print(f"   ... and {len(users) - 10} more users")
                print()
            
            # API info
            api_info = api_data.get('api_info', {})
            print("🔧 API INFO:")
            print(f"   Endpoint: {api_info.get('endpoint', 'N/A')}")
            print(f"   Timestamp: {api_info.get('timestamp', 'N/A')}")
            print(f"   Refresh Interval: {api_info.get('refresh_interval', 'N/A')} seconds")
            print(f"   S3 Bucket: {api_info.get('s3_bucket_scanned', 'N/A')}")
            print()
            
            # Filters applied
            filters = api_data.get('filters_applied', {})
            print("🔍 FILTERS APPLIED:")
            for key, value in filters.items():
                print(f"   {key}: {value}")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Message: {error_data.get('message', 'Unknown error')}")
                if 'data' in error_data and 'error_details' in error_data['data']:
                    print(f"Error Details: {error_data['data']['error_details']}")
            except:
                print(f"Raw Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
        print("💡 Make sure your Django server is running on http://127.0.0.1:8000")
    
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def test_with_different_filters():
    """Test API with different filter combinations"""
    
    base_url = "http://127.0.0.1:8000"
    endpoint = "/api/live-tracking/screenshots/"
    
    test_cases = [
        {"name": "All Users", "params": {"limit": 50, "status": "all"}},
        {"name": "Active Users Only", "params": {"limit": 20, "status": "active"}},
        {"name": "Offline Users Only", "params": {"limit": 20, "status": "offline"}},
        {"name": "Sort by Screenshot Time", "params": {"limit": 10, "sort_by": "screenshot_time"}},
        {"name": "Sort by Email", "params": {"limit": 10, "sort_by": "email"}},
    ]
    
    print("\n" + "=" * 60)
    print("🧪 TESTING DIFFERENT FILTER COMBINATIONS")
    print("=" * 60)
    
    for test_case in test_cases:
        print(f"\n🔍 Test: {test_case['name']}")
        print(f"Parameters: {test_case['params']}")
        
        try:
            response = requests.get(f"{base_url}{endpoint}", params=test_case['params'], timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                users_count = len(data.get('data', {}).get('users', []))
                screenshots_count = data.get('data', {}).get('summary', {}).get('total_screenshots_found', 0)
                print(f"✅ Success: {users_count} users, {screenshots_count} screenshots")
            else:
                print(f"❌ Failed: Status {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Live Tracking Screenshots API Test")
    print(f"🕒 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run main test
    test_live_tracking_screenshots_api()
    
    # Run filter tests
    test_with_different_filters()
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")
    print("💡 If you see errors, make sure:")
    print("   1. Django server is running")
    print("   2. API endpoint is correctly configured")
    print("   3. S3 credentials are properly set up")
    print("   4. Database has user data")
