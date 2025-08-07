#!/usr/bin/env python3
"""
Populate Daily Screenshot Count with current totals from S3
This script will create daily screenshot count records for today using the current S3 totals
"""

import os
import sys
import django
from datetime import datetime, date

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff, DailyScreenshotCount
import boto3
import json

def count_screenshots_in_s3():
    """Count screenshots for each employee in S3"""
    print("🔄 Connecting to S3...")
    s3_client = boto3.client('s3')
    bucket_name = 'ddsfocustime'
    
    employee_counts = {}
    
    try:
        # List all objects in the bucket
        print("📊 Scanning S3 for screenshots...")
        paginator = s3_client.get_paginator('list_objects_v2')
        
        for page in paginator.paginate(Bucket=bucket_name):
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                key = obj['Key']
                
                # Check if this is a screenshot (has image extension)
                if any(key.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg']):
                    # Extract employee folder from path
                    parts = key.split('/')
                    if len(parts) >= 2:
                        employee_folder = parts[0].lower()
                        task_folder = parts[1] if len(parts) > 2 else 'default'
                        
                        if employee_folder not in employee_counts:
                            employee_counts[employee_folder] = {
                                'total': 0,
                                'task_folders': {}
                            }
                        
                        employee_counts[employee_folder]['total'] += 1
                        
                        if task_folder not in employee_counts[employee_folder]['task_folders']:
                            employee_counts[employee_folder]['task_folders'][task_folder] = 0
                        employee_counts[employee_folder]['task_folders'][task_folder] += 1
        
        print(f"✅ Found {len(employee_counts)} employees with screenshots")
        return employee_counts
        
    except Exception as e:
        print(f"❌ Error scanning S3: {str(e)}")
        return {}

def populate_daily_counts():
    """Populate DailyScreenshotCount table with current S3 data"""
    print("🚀 Starting daily screenshot count population...")
    
    # Get current S3 counts
    s3_counts = count_screenshots_in_s3()
    
    if not s3_counts:
        print("❌ No S3 data found, exiting...")
        return
    
    # Get today's date
    today = date.today()
    print(f"📅 Processing for date: {today}")
    
    # Clear any existing records for today
    deleted_count = DailyScreenshotCount.objects.filter(date=today).delete()[0]
    if deleted_count > 0:
        print(f"🗑️  Deleted {deleted_count} existing records for today")
    
    created_count = 0
    updated_count = 0
    
    # Process each employee
    for employee_folder, counts in s3_counts.items():
        try:
            # Try to find the staff member
            # First try exact match with staffid
            staff = None
            
            # Try different ways to match the employee
            possible_staffids = [
                f"S3_{employee_folder.upper()}",
                employee_folder.upper(),
                employee_folder.lower()
            ]
            
            for staffid in possible_staffids:
                try:
                    staff = Staff.objects.get(staffid=staffid)
                    break
                except Staff.DoesNotExist:
                    continue
            
            # If still not found, try email matching
            if not staff:
                email_candidates = [
                    f"{employee_folder}@gmail.com",
                    f"{employee_folder}@outlook.com",
                    f"{employee_folder}@deluxebilisim.com",
                    f"{employee_folder}@dxdglobal.com"
                ]
                
                for email in email_candidates:
                    try:
                        staff = Staff.objects.get(email=email)
                        break
                    except Staff.DoesNotExist:
                        continue
            
            if not staff:
                print(f"⚠️  No staff record found for: {employee_folder}")
                continue
            
            # Create the daily count record
            daily_count, created = DailyScreenshotCount.objects.get_or_create(
                staff=staff,
                date=today,
                defaults={
                    'total_screenshots': counts['total'],
                    'task_folder_breakdown': counts['task_folders'],
                    's3_inventory_processed_at': datetime.now()
                }
            )
            
            if created:
                created_count += 1
                print(f"✅ Created record for {staff.email}: {counts['total']} screenshots")
            else:
                # Update existing record
                daily_count.total_screenshots = counts['total']
                daily_count.task_folder_breakdown = counts['task_folders']
                daily_count.s3_inventory_processed_at = datetime.now()
                daily_count.save()
                updated_count += 1
                print(f"🔄 Updated record for {staff.email}: {counts['total']} screenshots")
                
        except Exception as e:
            print(f"❌ Error processing {employee_folder}: {str(e)}")
            continue
    
    print(f"\n📊 Summary:")
    print(f"   Created: {created_count} records")
    print(f"   Updated: {updated_count} records")
    print(f"   Total processed: {created_count + updated_count}")
    print(f"✅ Daily screenshot count population completed!")

if __name__ == "__main__":
    populate_daily_counts()
