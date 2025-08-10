#!/usr/bin/env python3
"""
Simple API test script
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("🧪 Testing Google-like Search APIs")
    print("=" * 50)
    
    try:
        # Test 1: Basic API test
        print("\n1. Testing basic API connectivity...")
        response = requests.get(f"{BASE_URL}/test/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Basic API working")
        else:
            print(f"❌ Basic API failed: {response.text}")
            return
        
        # Test 2: User search (existing API)
        print("\n2. Testing user search...")
        response = requests.get(f"{BASE_URL}/users/search/?q=haseeb")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            users = data.get('data', {}).get('users', [])
            print(f"✅ Found {len(users)} users")
            if users:
                print(f"   First user: {users[0].get('display_name')} ({users[0].get('email')})")
        else:
            print(f"❌ User search failed: {response.text}")
        
        # Test 3: Google-like suggestions
        print("\n3. Testing Google-like suggestions...")
        response = requests.get(f"{BASE_URL}/users/suggestions/?q=h&limit=3")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            suggestions = data.get('data', {}).get('suggestions', [])
            print(f"✅ Found {len(suggestions)} suggestions")
            for s in suggestions:
                print(f"   📝 {s.get('display_name', '')} - {s.get('email', '')}")
        else:
            print(f"❌ Suggestions failed: {response.text}")
        
        # Test 4: Screenshots by user
        print("\n4. Testing screenshots by user...")
        response = requests.get(f"{BASE_URL}/screenshots/user/?user=haseebcodejourney@gmail.com&limit=3")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            screenshots = data.get('data', {}).get('screenshots', [])
            print(f"✅ Found {len(screenshots)} screenshots")
            if screenshots:
                print(f"   First screenshot: {screenshots[0].get('task_name', '')} - {screenshots[0].get('status', '')}")
        else:
            print(f"❌ Screenshots by user failed: {response.text}")
        
        # Test 5: Complete dashboard
        print("\n5. Testing complete dashboard...")
        response = requests.get(f"{BASE_URL}/dashboard/user-data/?user=haseebcodejourney@gmail.com&limit=3")
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Unknown')}")
        
        if 'json' in response.headers.get('Content-Type', ''):
            data = response.json()
            user_info = data.get('data', {}).get('user_info', {})
            print(f"✅ Dashboard data retrieved for: {user_info.get('display_name', '')}")
            print(f"   Email: {user_info.get('email', '')}")
            print(f"   Staff ID: {user_info.get('staff_id', '')}")
        else:
            print(f"❌ Dashboard failed - returning HTML instead of JSON")
            print(f"   First 200 chars: {response.text[:200]}")
            print("   This suggests a URL routing or authentication issue")
        
        print("\n✅ API testing completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - Django server may not be running")
        print("   Run: python manage.py runserver")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_api()
