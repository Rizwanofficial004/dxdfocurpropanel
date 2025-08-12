#!/usr/bin/env python3
"""
Test All Screenshots API - Test the new comprehensive API
"""
import os
import sys
import django

# Add the project directory to the Python path
project_path = r"c:\Users\deniz\OneDrive\Email attachments\Masaüstü\Git-Projects\dxdfocurpropanel"
sys.path.append(project_path)

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
os.chdir(project_path)
django.setup()

# Now we can import Django modules
from django.test import RequestFactory
from dashboard.all_screenshots_api import all_screenshots_api, user_screenshots_summary_api
import json

def test_all_screenshots_api():
    """Test the new All Screenshots API"""
    print("🚀 Testing All Screenshots API")
    print("=" * 60)
    
    factory = RequestFactory()
    
    # Test Case 1: Basic all screenshots (no URLs)
    print("\n📋 Test Case 1: Get all users with basic info")
    print("-" * 40)
    
    request = factory.get('/api/screenshots/all/')
    
    try:
        response = all_screenshots_api(request)
        
        if hasattr(response, 'content'):
            data = json.loads(response.content.decode('utf-8'))
            
            print(f"📊 Status: {response.status_code}")
            print(f"✅ Success: {data.get('success')}")
            print(f"📝 Message: {data.get('message')}")
            
            if 'data' in data and data['data']:
                users = data['data'].get('users', [])
                total_users = data['data'].get('total_users', 0)
                total_screenshots = data['data'].get('total_screenshots', 0)
                
                print(f"👥 Total Users: {total_users}")
                print(f"📸 Total Screenshots: {total_screenshots}")
                
                if users:
                    print(f"\n🔍 First 3 users preview:")
                    for i, user in enumerate(users[:3], 1):
                        print(f"   {i}. {user.get('employee_email')} - {user.get('screenshot_count', 0)} screenshots")
                        if user.get('last_activity'):
                            print(f"      Last activity: {user.get('last_activity')}")
                        
    except Exception as e:
        print(f"💥 Error: {e}")
    
    # Test Case 2: Summary API (faster)
    print("\n📋 Test Case 2: Get users summary (faster)")
    print("-" * 40)
    
    request = factory.get('/api/screenshots/summary/')
    
    try:
        response = user_screenshots_summary_api(request)
        
        if hasattr(response, 'content'):
            data = json.loads(response.content.decode('utf-8'))
            
            print(f"📊 Status: {response.status_code}")
            print(f"✅ Success: {data.get('success')}")
            print(f"📝 Message: {data.get('message')}")
            
            if 'data' in data and data['data']:
                users = data['data'].get('users', [])
                total_users = data['data'].get('total_users', 0)
                total_screenshots = data['data'].get('total_screenshots', 0)
                
                print(f"👥 Total Users: {total_users}")
                print(f"📸 Total Screenshots: {total_screenshots}")
                
                if users:
                    print(f"\n🏆 Top 5 users by screenshot count:")
                    for i, user in enumerate(users[:5], 1):
                        print(f"   {i}. {user.get('employee_email')} - {user.get('screenshot_count', 0)} screenshots")
                        
    except Exception as e:
        print(f"💥 Error: {e}")
    
    # Test Case 3: All screenshots with URLs and limit
    print("\n📋 Test Case 3: Get all with URLs and limit")
    print("-" * 40)
    
    request = factory.get('/api/screenshots/all/', {
        'include_urls': 'true',
        'limit': '2',
        'sort_by': 'count'
    })
    
    try:
        response = all_screenshots_api(request)
        
        if hasattr(response, 'content'):
            data = json.loads(response.content.decode('utf-8'))
            
            print(f"📊 Status: {response.status_code}")
            print(f"✅ Success: {data.get('success')}")
            
            if 'data' in data and data['data']:
                users = data['data'].get('users', [])
                params = data['data'].get('parameters', {})
                
                print(f"⚙️ Parameters: {params}")
                print(f"👥 Users returned: {len(users)}")
                
                if users:
                    print(f"\n📸 Sample user with screenshots:")
                    user = users[0]
                    print(f"   User: {user.get('employee_email')}")
                    print(f"   Count: {user.get('screenshot_count', 0)}")
                    
                    screenshots = user.get('screenshots', [])
                    if screenshots:
                        print(f"   Screenshots (showing first 2):")
                        for i, shot in enumerate(screenshots[:2], 1):
                            print(f"     {i}. {shot.get('filename')} ({shot.get('date')} {shot.get('time')})")
                            if shot.get('url'):
                                print(f"        URL: {shot.get('url')[:50]}...")
                        
    except Exception as e:
        print(f"💥 Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 All Screenshots API Testing Complete!")
    print("\n📋 New API Endpoints Created:")
    print("   ✅ /api/screenshots/all/ - Get all users with all screenshots")
    print("   ✅ /api/screenshots/summary/ - Get users summary (faster)")
    print("\n🔧 Available Parameters:")
    print("   • include_urls=true - Include presigned URLs")
    print("   • limit=N - Limit screenshots per user")
    print("   • sort_by=name|count|date - Sort users")

if __name__ == "__main__":
    test_all_screenshots_api()
