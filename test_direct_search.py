#!/usr/bin/env python
"""
Direct API test to debug the search functionality
"""

import os
import sys
import django
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from apps.dashboard.users_search_views import EnhancedUsersSearchView
from django.test import RequestFactory

def test_direct_search():
    print("🔥 Testing direct search API call...")
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get('/api/users/search/?q=n&page_size=5')
    
    # Create view instance
    view = EnhancedUsersSearchView()
    
    print("🔍 Searching for 'n'...")
    try:
        response = view.get(request)
        data = response.data
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Total results: {data['data']['total_count']}")
        print(f"✅ Search time: {data['data']['search_performance']['search_time_ms']:.2f}ms")
        print(f"✅ Objects scanned: {data['data']['search_performance']['objects_scanned']}")
        
        if data['data']['users']:
            print("📧 Found users:")
            for user in data['data']['users']:
                print(f"   - {user['email']}")
        else:
            print("❌ No users found")
            
    except Exception as e:
        print(f"❌ Error during search: {e}")
        import traceback
        traceback.print_exc()

    print("\n🔍 Searching for 'h'...")
    try:
        request = factory.get('/api/users/search/?q=h&page_size=5')
        response = view.get(request)
        data = response.data
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Total results: {data['data']['total_count']}")
        
        if data['data']['users']:
            print("📧 Found users:")
            for user in data['data']['users']:
                print(f"   - {user['email']}")
        else:
            print("❌ No users found")
            
    except Exception as e:
        print(f"❌ Error during search: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct_search()
