#!/usr/bin/env python
"""
Production Server Debugging Script for DDS Focus Time API

This script helps diagnose why the production API is returning 500 errors
while working fine locally.

Run this on your production server:
python debug_production.py
"""

import os
import sys
import django
from pathlib import Path

# Add the Django project to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')

# Setup Django
django.setup()

def check_environment():
    """Check critical environment variables and settings"""
    print("🔍 ENVIRONMENT DIAGNOSTICS")
    print("=" * 50)
    
    # Check Django settings
    from django.conf import settings
    
    print(f"✅ DEBUG: {settings.DEBUG}")
    print(f"✅ ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"✅ SECRET_KEY: {'SET' if settings.SECRET_KEY else 'NOT SET'}")
    
    # Check database connection
    print(f"✅ DATABASE: {settings.DATABASES['default']['ENGINE']}")
    print(f"✅ DB NAME: {settings.DATABASES['default']['NAME']}")
    
    # Check AWS settings
    aws_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None) or os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None) or os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = getattr(settings, 'AWS_REGION', None) or os.getenv('AWS_REGION')
    aws_bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) or os.getenv('AWS_STORAGE_BUCKET_NAME')
    
    print(f"✅ AWS_ACCESS_KEY_ID: {'SET' if aws_key else '❌ NOT SET'}")
    print(f"✅ AWS_SECRET_ACCESS_KEY: {'SET' if aws_secret else '❌ NOT SET'}")
    print(f"✅ AWS_REGION: {aws_region or '❌ NOT SET'}")
    print(f"✅ AWS_STORAGE_BUCKET_NAME: {aws_bucket or '❌ NOT SET'}")
    
    # Check installed packages
    print("\n📦 CHECKING CRITICAL PACKAGES")
    print("=" * 50)
    
    try:
        import boto3
        print("✅ boto3: INSTALLED")
    except ImportError:
        print("❌ boto3: NOT INSTALLED")
    
    try:
        import corsheaders
        print("✅ django-cors-headers: INSTALLED")
    except ImportError:
        print("❌ django-cors-headers: NOT INSTALLED")
    
    try:
        import dotenv
        print("✅ python-dotenv: INSTALLED")
    except ImportError:
        print("❌ python-dotenv: NOT INSTALLED")

def test_database():
    """Test database connection"""
    print("\n🗄️ DATABASE CONNECTION TEST")
    print("=" * 50)
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            print("✅ Database connection: SUCCESS")
            return True
    except Exception as e:
        print(f"❌ Database connection: FAILED - {e}")
        return False

def test_aws_connection():
    """Test AWS S3 connection"""
    print("\n☁️ AWS S3 CONNECTION TEST")
    print("=" * 50)
    
    try:
        import boto3
        from django.conf import settings
        
        # Get AWS credentials
        aws_key = getattr(settings, 'AWS_ACCESS_KEY_ID', None) or os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret = getattr(settings, 'AWS_SECRET_ACCESS_KEY', None) or os.getenv('AWS_SECRET_ACCESS_KEY')
        aws_region = getattr(settings, 'AWS_REGION', None) or os.getenv('AWS_REGION')
        aws_bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None) or os.getenv('AWS_STORAGE_BUCKET_NAME')
        
        if not all([aws_key, aws_secret, aws_region, aws_bucket]):
            print("❌ AWS credentials not properly configured")
            return False
        
        # Test S3 connection
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_key,
            aws_secret_access_key=aws_secret,
            region_name=aws_region
        )
        
        # Try to list objects in bucket
        response = s3_client.list_objects_v2(Bucket=aws_bucket, MaxKeys=1)
        print("✅ AWS S3 connection: SUCCESS")
        print(f"✅ Bucket '{aws_bucket}' is accessible")
        return True
        
    except Exception as e:
        print(f"❌ AWS S3 connection: FAILED - {e}")
        return False

def test_api_endpoint():
    """Test the specific API endpoint that's failing"""
    print("\n🌐 API ENDPOINT TEST")
    print("=" * 50)
    
    try:
        # Import the view function directly
        from dashboard.views_employee_screenshots import get_employee_folders
        from django.http import HttpRequest
        from django.contrib.auth.models import AnonymousUser
        
        # Create a mock request
        request = HttpRequest()
        request.method = 'GET'
        request.user = AnonymousUser()
        
        # Test the view function
        response = get_employee_folders(request, 'haseebcodejourney@gmail.com')
        print(f"✅ API endpoint test: SUCCESS - Status {response.status_code}")
        
        if hasattr(response, 'content'):
            content = response.content.decode('utf-8')
            print(f"✅ Response preview: {content[:200]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ API endpoint test: FAILED - {e}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return False

def check_url_patterns():
    """Check if URL patterns are properly configured"""
    print("\n🗺️ URL PATTERNS CHECK")
    print("=" * 50)
    
    try:
        from django.urls import resolve
        from django.urls.exceptions import Resolver404
        
        # Test the problematic URL
        test_url = '/api/screenshots/employee/haseebcodejourney@gmail.com/folders/'
        
        try:
            resolved = resolve(test_url)
            print(f"✅ URL resolution: SUCCESS")
            print(f"✅ View function: {resolved.func}")
            print(f"✅ URL args: {resolved.args}")
            print(f"✅ URL kwargs: {resolved.kwargs}")
            return True
        except Resolver404 as e:
            print(f"❌ URL resolution: FAILED - {e}")
            return False
            
    except Exception as e:
        print(f"❌ URL patterns check: FAILED - {e}")
        return False

def main():
    """Run all diagnostic tests"""
    print("🚀 DDS FOCUS TIME API - PRODUCTION DIAGNOSTICS")
    print("=" * 60)
    print(f"Python version: {sys.version}")
    print(f"Django version: {django.get_version()}")
    print()
    
    # Run all tests
    tests = [
        check_environment,
        test_database,
        test_aws_connection,
        check_url_patterns,
        test_api_endpoint
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            results.append(False)
        print()
    
    # Summary
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! The issue might be with web server configuration.")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
    
    print("\n🔧 NEXT STEPS:")
    print("1. Fix any failed tests above")
    print("2. Check web server (Apache/Nginx) error logs")
    print("3. Ensure the web server is properly configured to serve Django")
    print("4. Check file permissions on the Django project directory")
    print("5. Restart web server and Django application")

if __name__ == '__main__':
    main()
