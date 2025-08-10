#!/usr/bin/env python3
"""
Simple script to populate daily screenshot counts using existing API data
"""

import os
import sys
import django
from datetime import date, datetime
import requests
import json

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff, DailyScreenshotCount

def populate_from_api():
    """Use the existing screenshots search API to get current counts"""
    print("🚀 Populating daily counts from existing API...")
    
    try:
        # Make request to the existing API
        url = "http://127.0.0.1:8000/api/employees/screenshots/search/"
        print(f"📡 Calling API: {url}")
        
        response = requests.get(url, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ API call failed with status {response.status_code}")
            return False
        
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ API returned error: {data.get('message', 'Unknown error')}")
            return False
        
        employees = data.get('data', {}).get('employees', [])
        print(f"📊 Found {len(employees)} employees with screenshot data")
        
        # Get today's date
        today = date.today()
        print(f"📅 Processing for date: {today}")
        
        # Clear any existing records for today
        deleted_count = DailyScreenshotCount.objects.filter(date=today).delete()[0]
        if deleted_count > 0:
            print(f"🗑️  Deleted {deleted_count} existing records for today")
        
        created_count = 0
        
        # Process each employee
        for emp_data in employees:
            try:
                employee_info = emp_data.get('employee', {})
                email = employee_info.get('email')
                staff_id = employee_info.get('staff_id')
                screenshot_count = emp_data.get('screenshot_count', 0)
                
                if not email:
                    print(f"⚠️  Skipping employee without email")
                    continue
                
                # Find the staff member
                staff = None
                try:
                    staff = Staff.objects.get(email=email)
                except Staff.DoesNotExist:
                    try:
                        staff = Staff.objects.get(staffid=staff_id)
                    except Staff.DoesNotExist:
                        print(f"⚠️  No staff record found for: {email} ({staff_id})")
                        continue
                
                # Create the daily count record
                daily_count = DailyScreenshotCount.objects.create(
                    staff=staff,
                    date=today,
                    total_screenshots=screenshot_count,
                    task_folder_breakdown={},  # We don't have breakdown from this API
                    s3_inventory_processed_at=datetime.now()
                )
                
                created_count += 1
                print(f"✅ Created record for {email}: {screenshot_count:,} screenshots")
                
            except Exception as e:
                print(f"❌ Error processing employee {email}: {str(e)}")
                continue
        
        print(f"\n📊 Summary:")
        print(f"   Created: {created_count} records")
        print(f"   Date: {today}")
        print(f"✅ Daily screenshot count population completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error calling API: {str(e)}")
        return False

def test_api():
    """Test the daily screenshot analytics API"""
    print("\n🧪 Testing daily screenshot analytics API...")
    
    try:
        url = "http://127.0.0.1:8000/api/analytics/daily-screenshots/"
        response = requests.get(url, timeout=10)
        
        print(f"📡 API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                print(f"✅ API Working! Found {len(employees)} employees")
                print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
                print(f"📊 Average Screenshots: {summary.get('average_screenshots', 0)}")
            else:
                print(f"❌ API Error: {data.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error testing API: {str(e)}")

if __name__ == "__main__":
    if populate_from_api():
        test_api()
