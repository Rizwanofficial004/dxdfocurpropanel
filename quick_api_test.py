#!/usr/bin/env python3
"""
Quick API Test Script
Tests the most important API endpoints
"""
import requests
import json

def test_api():
    print('🚀 COMPREHENSIVE API TESTING')
    print('=' * 60)
    print('Server: http://127.0.0.1:8010')
    print('=' * 60)
    
    base_url = 'http://127.0.0.1:8010/api'
    
    # Test 1: Basic API Test
    try:
        print('\n🔍 Test 1: Basic API Health Check')
        response = requests.get(f'{base_url}/test/', timeout=10)
        print(f'   Status: {response.status_code} ✅' if response.status_code == 200 else f'   Status: {response.status_code} ❌')
        if response.status_code == 200:
            data = response.json()
            print(f'   Response: {data}')
        else:
            print(f'   Error: {response.text[:100]}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        
    # Test 2: Ultra-Fast Screenshots API
    try:
        print('\n🔍 Test 2: Ultra-Fast Screenshots API (limit=3)')
        response = requests.get(f'{base_url}/screenshots/ultra-fast/?limit=3', timeout=15)
        print(f'   Status: {response.status_code} ✅' if response.status_code == 200 else f'   Status: {response.status_code} ❌')
        if response.status_code == 200:
            data = response.json()
            print(f'   Total users in database: {data.get("total_users", 0)}')
            print(f'   Users returned: {len(data.get("users", []))}')
            if data.get('users'):
                user = data['users'][0]
                print(f'   First user: {user.get("email", "unknown")}')
                print(f'   Screenshots: {len(user.get("screenshots", []))}')
                if user.get("screenshots"):
                    screenshot = user["screenshots"][0]
                    print(f'   Sample screenshot: {screenshot.get("key", "unknown")[:50]}...')
        else:
            print(f'   Error: {response.text[:100]}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        
    # Test 3: Tracking Status
    try:
        print('\n🔍 Test 3: Tracking Status API')
        response = requests.get(f'{base_url}/screenshots/tracking-status/', timeout=10)
        print(f'   Status: {response.status_code} ✅' if response.status_code == 200 else f'   Status: {response.status_code} ❌')
        if response.status_code == 200:
            data = response.json()
            print(f'   Last update: {data.get("last_update", "unknown")}')
            print(f'   Total screenshots tracked: {data.get("total_screenshots", 0)}')
            print(f'   Total users tracked: {data.get("total_users", 0)}')
        else:
            print(f'   Error: {response.text[:100]}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        
    # Test 4: Users List
    try:
        print('\n🔍 Test 4: Users List API')
        response = requests.get(f'{base_url}/screenshots/users/', timeout=10)
        print(f'   Status: {response.status_code} ✅' if response.status_code == 200 else f'   Status: {response.status_code} ❌')
        if response.status_code == 200:
            data = response.json()
            print(f'   Total users found: {len(data.get("users", []))}')
            if data.get("users"):
                print('   Top users by screenshot count:')
                for i, user in enumerate(data["users"][:5]):
                    print(f'     {i+1}. {user.get("email", "unknown")}: {user.get("screenshot_count", 0)} screenshots')
        else:
            print(f'   Error: {response.text[:100]}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        
    # Test 5: Fast All Screenshots (with limits)
    try:
        print('\n🔍 Test 5: Fast All Screenshots API (limit_users=2)')
        response = requests.get(f'{base_url}/screenshots/fast-all/?limit_users=2', timeout=15)
        print(f'   Status: {response.status_code} ✅' if response.status_code == 200 else f'   Status: {response.status_code} ❌')
        if response.status_code == 200:
            data = response.json()
            print(f'   Users returned: {len(data.get("users", []))}')
            if data.get("users"):
                for user in data["users"]:
                    print(f'     • {user.get("email", "unknown")}: {len(user.get("screenshots", []))} screenshots')
        else:
            print(f'   Error: {response.text[:100]}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
        
    print('\n🎉 COMPREHENSIVE API TESTING COMPLETE! 🎉')
    print('=' * 60)

if __name__ == '__main__':
    test_api()
