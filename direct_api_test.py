#!/usr/bin/env python3
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

# Now test the API function directly
try:
    print("Testing API function directly...")
    from simple_api import simple_screenshots_api
    
    # Create a mock request
    class MockRequest:
        def __init__(self):
            self.method = 'GET'
    
    request = MockRequest()
    
    print("Calling simple_screenshots_api...")
    response = simple_screenshots_api(request)
    
    print(f"Response status: {response.status_code}")
    print(f"Response content: {response.content.decode()[:500]}...")
    
    # Parse JSON
    import json
    data = json.loads(response.content)
    
    print("\n🎯 REAL DATA RESULTS:")
    print(f"Success: {data.get('success')}")
    print(f"Total users: {data.get('total_users')}")
    print(f"Total screenshots: {data.get('total_screenshots')}")
    print(f"Status: {data.get('status')}")
    
    if 'users' in data and data['users']:
        print(f"\n👥 FIRST 3 USERS:")
        for i, user in enumerate(data['users'][:3]):
            print(f"  {i+1}. {user.get('user_email')}: {user.get('screenshot_count')} screenshots")
    
    print("\n✅ API IS WORKING! You should see real data above.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
