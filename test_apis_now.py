#!/usr/bin/env python3
import requests
import json

def test_apis():
    print('🚀 Testing API Endpoints')
    print('=' * 50)
    
    base_url = 'http://127.0.0.1:8010/api'
    
    # Test 1: Basic test endpoint
    try:
        print('\n🧪 Testing: /test/')
        response = requests.get(f'{base_url}/test/', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            print(f'Response: {response.json()}')
        else:
            print(f'Error: {response.text[:200]}')
    except Exception as e:
        print(f'❌ Error: {e}')
    
    # Test 2: Ultra-fast screenshots
    try:
        print('\n🧪 Testing: /screenshots/ultra-fast/')
        response = requests.get(f'{base_url}/screenshots/ultra-fast/?limit=3', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'Total users: {data.get("total_users", 0)}')
            print(f'Users returned: {len(data.get("users", []))}')
            if data.get("users"):
                print(f'First user: {data["users"][0].get("email", "unknown")}')
                print(f'Screenshots: {len(data["users"][0].get("screenshots", []))}')
        else:
            print(f'Error: {response.text[:200]}')
    except Exception as e:
        print(f'❌ Error: {e}')
    
    # Test 3: Tracking status
    try:
        print('\n🧪 Testing: /screenshots/tracking-status/')
        response = requests.get(f'{base_url}/screenshots/tracking-status/', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'Last update: {data.get("last_update", "unknown")}')
            print(f'Total screenshots: {data.get("total_screenshots", 0)}')
            print(f'Total users: {data.get("total_users", 0)}')
        else:
            print(f'Error: {response.text[:200]}')
    except Exception as e:
        print(f'❌ Error: {e}')
    
    # Test 4: Users list
    try:
        print('\n🧪 Testing: /screenshots/users/')
        response = requests.get(f'{base_url}/screenshots/users/', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            print(f'Total users: {len(data.get("users", []))}')
            if data.get("users"):
                print(f'Sample users:')
                for user in data["users"][:3]:
                    print(f'  - {user.get("email", "unknown")}: {user.get("screenshot_count", 0)} screenshots')
        else:
            print(f'Error: {response.text[:200]}')
    except Exception as e:
        print(f'❌ Error: {e}')
    
    print('\n🎉 API Testing Complete!')

if __name__ == "__main__":
    test_apis()
