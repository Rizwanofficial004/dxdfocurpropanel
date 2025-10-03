#!/usr/bin/env python3

import os
import sys
import django
from datetime import datetime

# Add the parent directory to the path so we can import Django settings
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

import boto3
from botocore.exceptions import ClientError
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)  # Enable DEBUG logging
logger = logging.getLogger(__name__)

def simulate_api_call():
    """Simulate the exact API call with detailed logging"""
    
    print("🔍 Simulating API Call with Debug Logging")
    print("=" * 60)
    
    try:
        # Import the actual API view
        from apps.users.users_search_views import EnhancedUsersSearchView
        
        # Create an instance
        api_view = EnhancedUsersSearchView()
        
        # Set up the same parameters as the API call
        search_query = 'nawaz'
        start_date = '2025-10-01'
        end_date = '2025-10-03'
        
        print(f"🎯 Search parameters:")
        print(f"   Query: '{search_query}'")
        print(f"   Start date: {start_date}")
        print(f"   End date: {end_date}")
        
        # Call the search method directly
        print(f"\n🔍 Calling enhanced_search_v3...")
        
        # Enable detailed logging temporarily
        old_level = logger.level
        logger.setLevel(logging.DEBUG)
        
        result = api_view._enhanced_search_v3(
            search_query=search_query,
            start_date=start_date,
            end_date=end_date,
            group_by='date',
            page=1,
            page_size=50
        )
        
        # Restore logging level
        logger.setLevel(old_level)
        
        print(f"\n📊 Search Result Summary:")
        print(f"   Users found: {result.get('total_count', 0)}")
        print(f"   Total screenshots: {result.get('total_screenshots', 0)}")
        print(f"   Objects scanned: {result.get('objects_scanned', 0)}")
        print(f"   Search time: {result.get('search_time_ms', 0)}ms")
        
        if result.get('users'):
            for user in result['users']:
                print(f"\n👤 User: {user['email']}")
                print(f"   Screenshots: {len(user.get('screenshots', []))}")
                print(f"   Total screenshots: {user.get('total_screenshots', 0)}")
                
                if user.get('screenshots'):
                    print(f"   📸 Sample screenshots:")
                    for i, screenshot in enumerate(user['screenshots'][:3]):
                        print(f"      {i+1}. {screenshot.get('filename', 'unknown')}")
                        print(f"         Date: {screenshot.get('date', 'unknown')}")
                        print(f"         Time: {screenshot.get('time', 'unknown')}")
                        print(f"         Size: {screenshot.get('size_mb', 0)}MB")
        
        if 'error' in result:
            print(f"\n❌ Error in result: {result['error']}")
        
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simulate_api_call()