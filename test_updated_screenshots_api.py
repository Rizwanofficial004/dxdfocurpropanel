"""
Test the updated Users Screenshots API with screenshots array
"""
import requests
import json
import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
import django
django.setup()

from apps.dashboard.users_screenshots_view import UsersScreenshotsView
from rest_framework.test import APIRequestFactory

def test_updated_api():
    """Test the updated API locally"""
    print("🧪 Testing Updated Users Screenshots API...")
    print("=" * 50)
    
    # Create a test request
    factory = APIRequestFactory()
    request = factory.get('/api/live-tracking/fast-screenshots/')
    
    # Create view instance and get response
    view = UsersScreenshotsView()
    response = view.get(request)
    
    if response.status_code == 200:
        data = response.data
        print("✅ API Response successful!")
        print(f"📊 Status: {data['status']}")
        print(f"👥 Total Users: {data['data']['summary']['s3_users']}")
        print(f"📁 Total Files: {data['data']['summary']['s3_files']}")
        print(f"💾 Storage: {data['data']['summary']['s3_size_gb']:.2f} GB")
        print()
        
        # Check if users have screenshots array
        users_sample = data['data']['s3_users_sample']
        print(f"🔍 User samples found: {len(users_sample)}")
        
        for i, user in enumerate(users_sample[:2]):  # Show first 2 users
            print(f"\n👤 User {i+1}: {user['user_email']}")
            print(f"   📁 File count: {user['file_count']}")
            print(f"   💾 Size: {user['total_size_mb']} MB")
            print(f"   📅 Days active: {user['days_active']}")
            print(f"   🕒 Latest: {user['latest_file']}")
            
            # Check screenshots array
            if 'screenshots' in user:
                screenshots = user['screenshots']
                print(f"   🖼️  Screenshots available: {len(screenshots)}")
                
                for j, screenshot in enumerate(screenshots[:3]):  # Show first 3 screenshots
                    print(f"      📸 {j+1}. {screenshot['filename']}")
                    print(f"         📅 Date: {screenshot['date']}")
                    print(f"         📏 Size: {screenshot['file_size_mb']} MB")
                    print(f"         🔗 URL: {screenshot['file_url'][:60]}...")
            else:
                print("   ❌ No screenshots array found!")
        
        print("\n" + "=" * 50)
        print("✅ Test completed successfully!")
        
        # Save sample response
        with open('updated_api_sample.json', 'w') as f:
            json.dump(data, f, indent=2)
        print("💾 Sample response saved to 'updated_api_sample.json'")
        
    else:
        print(f"❌ API Error: {response.status_code}")
        print(f"Error data: {response.data}")

if __name__ == "__main__":
    test_updated_api()
