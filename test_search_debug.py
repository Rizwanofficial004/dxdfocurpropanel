#!/usr/bin/env python
"""
Test script to debug the search functionality
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
from apps.dashboard.intelligent_search import intelligent_search

def test_search():
    print("🔍 Testing search functionality...")
    
    # Test basic setup
    print("1. Testing intelligent search import...")
    try:
        print(f"   ✅ Intelligent search available: {intelligent_search}")
    except Exception as e:
        print(f"   ❌ Error importing intelligent search: {e}")
        return
    
    # Test view instantiation
    print("2. Testing view instantiation...")
    try:
        view = EnhancedUsersSearchView()
        print(f"   ✅ View created successfully")
    except Exception as e:
        print(f"   ❌ Error creating view: {e}")
        return
    
    # Test S3 connection
    print("3. Testing S3 client initialization...")
    try:
        # This will trigger S3 client initialization
        s3_client = view.s3_client
        print(f"   ✅ S3 client initialized")
    except Exception as e:
        print(f"   ❌ Error initializing S3 client: {e}")
        return
    
    # Test user extraction
    print("4. Testing user extraction from S3 key...")
    try:
        test_key = "users_screenshots/2025-09-01/nawaz_at_dxdglobal.com/DDSFocusPro_v1.4/2025-09-01_15-45-21.webp"
        user_info = view._extract_user_from_key(test_key, "n")
        print(f"   ✅ Extracted user: {user_info}")
        
        # Test matching
        if user_info:
            matches = view._matches_search(user_info, "n")
            print(f"   ✅ Matches search 'n': {matches}")
    except Exception as e:
        print(f"   ❌ Error testing user extraction: {e}")
        return
    
    print("✅ All tests passed!")

if __name__ == "__main__":
    test_search()
