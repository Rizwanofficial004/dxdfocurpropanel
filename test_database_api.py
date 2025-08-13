#!/usr/bin/env python3
"""
Simple test to check API and database status
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

print("🧪 Testing Database and API Setup")
print("=" * 50)

try:
    # Test 1: Import the model
    print("✅ Step 1: Importing ScreenshotTracker model...")
    from dashboard.models import ScreenshotTracker
    print("✅ Model imported successfully")
    
    # Test 2: Check if table exists
    print("✅ Step 2: Checking database table...")
    from django.db import connection
    tables = connection.introspection.table_names()
    table_name = ScreenshotTracker._meta.db_table
    print(f"   📋 Table name: {table_name}")
    print(f"   📋 Available tables: {len(tables)} total")
    
    if table_name in tables:
        print("✅ Table exists in database")
        
        # Test 3: Query the database
        print("✅ Step 3: Querying database...")
        user_count = ScreenshotTracker.objects.count()
        print(f"   📊 Total users in ScreenshotTracker: {user_count}")
        
        if user_count > 0:
            # Show first 3 users
            users = list(ScreenshotTracker.objects.all()[:3])
            print("   👥 Sample users:")
            for i, user in enumerate(users, 1):
                print(f"   {i}. {user.user_email}: {user.screenshot_count:,} screenshots")
                
            print("✅ Database is working correctly!")
            
            # Test 4: Test the simple API function directly
            print("✅ Step 4: Testing API function directly...")
            from simple_api import simple_screenshots_api
            from django.test import RequestFactory
            
            factory = RequestFactory()
            request = factory.get('/api/actual-count-total/screenshots/')
            
            response = simple_screenshots_api(request)
            print(f"   📊 API Status Code: {response.status_code}")
            print(f"   📋 Content Type: {response.get('Content-Type')}")
            
            if response.status_code == 200:
                print("✅ API function works correctly!")
                content = response.content.decode()[:200]
                print(f"   📄 Response preview: {content}...")
            else:
                print(f"❌ API function returned error: {response.status_code}")
                print(f"   Error content: {response.content.decode()}")
        else:
            print("⚠️ Database table exists but is empty")
            print("   Run: python manage.py track_screenshots --update-now")
    else:
        print("❌ Table does not exist")
        print("   Run: python manage.py migrate")
        print(f"   Available tables: {tables[:10]}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n🏁 Test completed!")
