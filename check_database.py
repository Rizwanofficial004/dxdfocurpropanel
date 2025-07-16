#!/usr/bin/env python3
"""
Script to check the actual data in the Django database
"""

import os
import sys
import django

# Add the project directory to Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff, User_Logs
from django.contrib.auth.models import User
from dashboard.get_employee_screenshots import scan_and_download_screenshots

def check_staff_data():
    print("🔍 CHECKING STAFF DATABASE")
    print("=" * 60)
    
    # Get all staff members
    staff_members = Staff.objects.all()
    print(f"📊 Total Staff Members: {staff_members.count()}")
    
    for i, staff in enumerate(staff_members[:10]):  # Show first 10
        print(f"\n👤 Staff {i+1}:")
        print(f"   ID: {staff.staffid}")
        print(f"   Name: {staff.firstname} {staff.lastname}")
        print(f"   Email: {staff.email}")
        print(f"   Active: {getattr(staff, 'is_active', 'N/A')}")
        
        # Check if they have logs
        logs_count = User_Logs.objects.filter(email=staff.email).count()
        print(f"   Logs: {logs_count}")
        
        # Check if they have screenshots (sample check)
        try:
            screenshots_data = scan_and_download_screenshots(staff.email, '', bool_flag=True)
            screenshots_count = len(screenshots_data.get('image_urls', [])) if screenshots_data else 0
            print(f"   Screenshots: {screenshots_count}")
        except Exception as e:
            print(f"   Screenshots: Error - {str(e)}")

def check_django_users():
    print("\n🔍 CHECKING DJANGO USERS")
    print("=" * 60)
    
    # Get all Django users
    users = User.objects.all()
    print(f"📊 Total Django Users: {users.count()}")
    
    for i, user in enumerate(users[:10]):  # Show first 10
        print(f"\n👤 User {i+1}:")
        print(f"   ID: {user.id}")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Active: {user.is_active}")
        print(f"   Staff: {user.is_staff}")
        print(f"   Last Login: {user.last_login}")

def check_sample_screenshots():
    print("\n🔍 CHECKING SAMPLE SCREENSHOTS")
    print("=" * 60)
    
    # Get a few staff emails and check their screenshots
    staff_emails = Staff.objects.values_list('email', flat=True)[:5]
    
    for email in staff_emails:
        print(f"\n📸 Screenshots for: {email}")
        try:
            screenshots_data = scan_and_download_screenshots(email, '', bool_flag=True)
            if screenshots_data and screenshots_data.get('image_urls'):
                screenshots = screenshots_data['image_urls']
                print(f"   Count: {len(screenshots)}")
                
                # Show first few screenshots
                for i, screenshot in enumerate(screenshots[:3]):
                    print(f"   Screenshot {i+1}: {screenshot.get('filename', 'N/A')}")
                    print(f"     URL: {screenshot.get('url', 'N/A')[:100]}...")
                    print(f"     Date: {screenshot.get('last_modified', 'N/A')}")
            else:
                print("   No screenshots found")
        except Exception as e:
            print(f"   Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 DJANGO DATABASE INSPECTION")
    print("=" * 80)
    
    check_staff_data()
    check_django_users()
    check_sample_screenshots()
    
    print("\n" + "=" * 80)
    print("✅ Database inspection complete!")
