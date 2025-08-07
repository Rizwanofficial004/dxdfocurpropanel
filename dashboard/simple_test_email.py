#!/usr/bin/env python3
"""
Simple test for the specific email you mentioned
"""

import requests
import json

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
SCREENSHOTS_USER_URL = f"{BASE_URL}/api/screenshots/user/"

# Test with your specific email
TEST_EMAIL = "haseebcodejourney@gmail.com"

def test_specific_email():
    print("="*60)
    print(f"Testing screenshots for: {TEST_EMAIL}")
    print("="*60)
    
    # Test scenarios with different dates
    test_scenarios = [
        {
            "name": "All screenshots (no date filter)",
            "params": {"user": TEST_EMAIL, "limit": 5}
        },
        {
            "name": "June 22, 2025",
            "params": {"user": TEST_EMAIL, "date": "2025-06-22", "limit": 3}
        },
        {
            "name": "June 23, 2025", 
            "params": {"user": TEST_EMAIL, "date": "2025-06-23", "limit": 3}
        },
        {
            "name": "Today's date",
            "params": {"user": TEST_EMAIL, "date": "2025-07-05", "limit": 3}
        },
        {
            "name": "With status filter + date",
            "params": {"user": TEST_EMAIL, "date": "2025-06-22", "status": "Online", "limit": 3}
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n🧪 {scenario['name']}")
        print(f"📋 Parameters: {scenario['params']}")
        print("-" * 50)
        
        print(f"🔍 Making request to: {SCREENSHOTS_USER_URL}")
        
        try:
            response = requests.get(SCREENSHOTS_USER_URL, params=scenario['params'])
            
            print(f"📊 Response:")
            print(f"   Status Code: {response.status_code}")
            print(f"   URL: {response.url}")
            
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    data = response.json()
                    
                    if data.get('success'):
                        user_info = data.get('data', {}).get('user_info', {})
                        search_info = data.get('data', {}).get('search_info', {})
                        screenshots = data.get('data', {}).get('screenshots', [])
                        filters_applied = data.get('data', {}).get('filters_applied', {})
                        
                        print(f"   ✅ SUCCESS!")
                        print(f"   Found user: {user_info.get('display_name')} ({user_info.get('email')})")
                        print(f"   Search method: {search_info.get('search_method')}")
                        print(f"   Screenshots found: {len(screenshots)}")
                        print(f"   Filters applied: {filters_applied}")
                        
                        if screenshots:
                            print(f"   📸 Screenshots:")
                            for i, screenshot in enumerate(screenshots):
                                print(f"      {i+1}. {screenshot.get('filename', 'Unknown')}")
                                print(f"         📅 Date: {screenshot.get('date_folder', 'Unknown')}")
                                print(f"         ⏰ Time: {screenshot.get('time_display', 'Unknown')}")
                                print(f"         📁 Status: {screenshot.get('status', 'Unknown')}")
                        else:
                            print(f"   📭 No screenshots found for this filter")
                    else:
                        print(f"   ❌ API returned error: {data.get('message', 'Unknown error')}")
                        
                except json.JSONDecodeError:
                    print(f"   ❌ Invalid JSON response")
                    print(f"   Raw response: {response.text[:500]}...")
            else:
                print(f"   ❌ Non-JSON response (Content-Type: {response.headers.get('content-type', 'Unknown')})")
                print(f"   Raw response: {response.text[:500]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")

def test_with_login():
    print("\n" + "="*60)
    print("Testing with login authentication")
    print("="*60)
    
    # First try to login
    login_data = {
        "username": "admin@example.com",  # Change this to a valid user
        "password": "admin123"            # Change this to correct password
    }
    
    print(f"🔐 Attempting login...")
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        print(f"   Login Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                # Get session cookies
                session_cookies = response.cookies
                print(f"   ✅ Login successful!")
                
                # Now test screenshots with authentication
                params = {"user": TEST_EMAIL, "limit": 3}
                response = requests.get(SCREENSHOTS_USER_URL, params=params, cookies=session_cookies)
                
                print(f"\n📊 Authenticated request:")
                print(f"   Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(json.dumps(data, indent=2))
                else:
                    print(f"   ❌ Failed: {response.text[:300]}...")
            else:
                print(f"   ❌ Login failed: {data.get('message', 'Unknown error')}")
        else:
            print(f"   ❌ Login request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")

if __name__ == "__main__":
    print("🚀 Simple Screenshots API Test")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📧 Testing email: {TEST_EMAIL}")
    
    # Test without authentication first
    test_specific_email()
    
    # Test with authentication
    test_with_login()
    
    print("\n" + "="*60)
    print("🏁 Test completed!")
    print("="*60)
