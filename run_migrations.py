#!/usr/bin/env python3
"""
Database Migration Script
Run this to create the ScreenshotTracker table and apply migrations
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from django.core.management import execute_from_command_line

def run_migrations():
    print("🔧 Running Django Migrations...")
    print("=" * 50)
    
    try:
        # Make migrations for dashboard app
        print("📋 Creating migrations for dashboard app...")
        execute_from_command_line(['manage.py', 'makemigrations', 'dashboard'])
        
        # Apply all migrations
        print("⚡ Applying all migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        print("✅ Migrations completed successfully!")
        
        # Test the ScreenshotTracker model
        print("\n🧪 Testing ScreenshotTracker model...")
        from dashboard.models import ScreenshotTracker
        
        # Check if we can create the table
        count = ScreenshotTracker.objects.count()
        print(f"✅ ScreenshotTracker table created. Current records: {count}")
        
        print("\n🚀 Database is ready! You can now:")
        print("   1. Run: python manage.py track_screenshots --update-now")
        print("   2. Test API: http://127.0.0.1:8001/api/actual-count-total/screenshots/")
        print("   3. Deploy to production")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_migrations()
