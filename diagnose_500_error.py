#!/usr/bin/env python3
"""
Django 500 Error Diagnostic Tool
"""

import sys
import os
import traceback

# Add the project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

print("🔍 Django 500 Error Diagnostic")
print("=" * 50)

# Test 1: Django Settings Import
print("1. Testing Django Settings Import...")
try:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
    import django
    django.setup()
    print("✅ Django settings imported successfully")
except Exception as e:
    print(f"❌ Django settings error: {e}")
    traceback.print_exc()

# Test 2: Database Connection
print("\n2. Testing Database Connection...")
try:
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("SELECT 1")
    result = cursor.fetchone()
    print("✅ Database connection successful")
except Exception as e:
    print(f"❌ Database connection error: {e}")
    traceback.print_exc()

# Test 3: Models Import
print("\n3. Testing Models Import...")
try:
    from dashboard.models import ScreenshotTracker
    count = ScreenshotTracker.objects.count()
    print(f"✅ Models imported successfully - {count} records found")
except Exception as e:
    print(f"❌ Models import error: {e}")
    traceback.print_exc()

# Test 4: Simple API Import
print("\n4. Testing Simple API Import...")
try:
    from simple_api import simple_screenshots_api
    print("✅ Simple API imported successfully")
except Exception as e:
    print(f"❌ Simple API import error: {e}")
    traceback.print_exc()

# Test 5: URL Configuration
print("\n5. Testing URL Configuration...")
try:
    from django.conf import settings
    from django.urls import resolve
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/actual-count-total/screenshots/')
    
    # Test URL resolution
    resolved = resolve('/api/actual-count-total/screenshots/')
    print(f"✅ URL resolved to: {resolved.func.__name__}")
    
except Exception as e:
    print(f"❌ URL configuration error: {e}")
    traceback.print_exc()

# Test 6: API Response Test
print("\n6. Testing API Response...")
try:
    from django.test import RequestFactory
    from simple_api import simple_screenshots_api
    
    factory = RequestFactory()
    request = factory.get('/api/actual-count-total/screenshots/')
    response = simple_screenshots_api(request)
    
    print(f"✅ API Response Status: {response.status_code}")
    if hasattr(response, 'content'):
        content_length = len(response.content)
        print(f"✅ Response Content Length: {content_length} bytes")
    
except Exception as e:
    print(f"❌ API response error: {e}")
    traceback.print_exc()

print("\n" + "=" * 50)
print("🏁 Diagnostic Complete")
