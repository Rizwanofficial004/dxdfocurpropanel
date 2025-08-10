"""
Real S3 Screenshot Inventory Scanner
This script scans your S3 bucket and creates real date-wise screenshot counts
based on the actual dates in the screenshot filenames
"""

import os
import sys
import django
import boto3
from datetime import datetime, date
from collections import defaultdict
import re

# Setup Django
sys.path.append('/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff

def scan_real_s3_screenshots():
    """Scan S3 bucket and extract real dates from screenshot filenames"""
    print("🔍 Real S3 Screenshot Inventory Scanner")
    print("=" * 60)
    
    try:
        # Initialize S3 client
        s3_client = boto3.client('s3')
        bucket_name = 'ddsfocustime'
        
        print(f"🪣 Scanning bucket: {bucket_name}")
        print(f"📁 Looking for screenshots with date patterns...")
        
        # Get all staff members
        staff_members = {staff.email: staff for staff in Staff.objects.all()}
        print(f"👥 Found {len(staff_members)} staff members in database")
        
        # Store data by date and employee
        date_employee_counts = defaultdict(lambda: defaultdict(int))
        total_files_processed = 0
        files_with_dates = 0
        
        # Scan each employee folder
        for email in staff_members.keys():
            print(f"\n📂 Scanning {email}...")
            folder_prefix = f'screenshots/{email.lower()}/'
            
            try:
                # List objects in the employee folder
                paginator = s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(Bucket=bucket_name, Prefix=folder_prefix)
                
                employee_file_count = 0
                employee_dates = set()
                
                for page in page_iterator:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            filename = obj['Key'].split('/')[-1]
                            total_files_processed += 1
                            employee_file_count += 1
                            
                            # Extract date from filename
                            # Pattern: 2025-06-16_15-44-33_2025-06-16_15-44-52.webp
                            if filename.endswith('.webp') and '_' in filename:
                                try:
                                    # Extract the first date part
                                    date_match = re.match(r'(\d{4}-\d{2}-\d{2})_', filename)
                                    if date_match:
                                        date_str = date_match.group(1)
                                        screenshot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                                        
                                        date_employee_counts[screenshot_date][email] += 1
                                        employee_dates.add(screenshot_date)
                                        files_with_dates += 1
                                        
                                except ValueError:
                                    continue
                
                print(f"   📊 Files: {employee_file_count}, Dates found: {len(employee_dates)}")
                if employee_dates:
                    print(f"   📅 Date range: {min(employee_dates)} to {max(employee_dates)}")
                    
            except Exception as e:
                print(f"   ❌ Error scanning {email}: {e}")
                continue
        
        print(f"\n📈 SCAN RESULTS:")
        print(f"   📁 Total files processed: {total_files_processed:,}")
        print(f"   📅 Files with valid dates: {files_with_dates:,}")
        print(f"   📊 Unique dates found: {len(date_employee_counts)}")
        
        if date_employee_counts:
            all_dates = sorted(date_employee_counts.keys())
            print(f"   🗓️  Date range: {all_dates[0]} to {all_dates[-1]}")
            
            # Show summary by date
            print(f"\n📅 Date-wise summary:")
            for screenshot_date in sorted(date_employee_counts.keys())[-10:]:  # Show last 10 dates
                total_for_date = sum(date_employee_counts[screenshot_date].values())
                employee_count = len(date_employee_counts[screenshot_date])
                print(f"   {screenshot_date}: {employee_count} employees, {total_for_date:,} screenshots")
        
        return date_employee_counts, staff_members
        
    except Exception as e:
        print(f"❌ Error scanning S3: {e}")
        return {}, {}

def create_real_inventory_data(date_employee_counts, staff_members):
    """Create DailyScreenshotCount records from real S3 data"""
    print(f"\n💾 Creating Real Inventory Data")
    print("=" * 50)
    
    try:
        if not date_employee_counts:
            print("❌ No date data available to create inventory")
            return False
        
        # Clear existing data
        existing_count = DailyScreenshotCount.objects.count()
        if existing_count > 0:
            print(f"🗑️  Clearing {existing_count} existing records...")
            DailyScreenshotCount.objects.all().delete()
        
        total_created = 0
        
        # Create records for each date and employee
        for screenshot_date, employee_counts in date_employee_counts.items():
            print(f"\n📅 Processing {screenshot_date}...")
            
            date_total = 0
            for email, count in employee_counts.items():
                if email in staff_members:
                    staff = staff_members[email]
                    
                    DailyScreenshotCount.objects.create(
                        staff=staff,
                        date=screenshot_date,
                        total_screenshots=count,
                        task_folder_breakdown=f'{{"screenshots": {count}}}'
                    )
                    
                    date_total += count
                    total_created += 1
                    
            print(f"   ✅ Created {len(employee_counts)} records, {date_total:,} total screenshots")
        
        print(f"\n🎉 SUCCESS!")
        print(f"   📊 Total records created: {total_created}")
        print(f"   📅 Date range covered: {min(date_employee_counts.keys())} to {max(date_employee_counts.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating inventory data: {e}")
        return False

def main():
    """Main function to scan S3 and create real inventory"""
    print("🚀 Starting Real S3 Screenshot Inventory Process")
    print("=" * 70)
    
    # Step 1: Scan S3 for real screenshot data
    date_employee_counts, staff_members = scan_real_s3_screenshots()
    
    if not date_employee_counts:
        print("\n❌ No screenshot data found. Check S3 credentials and bucket access.")
        return False
    
    # Step 2: Create database records
    success = create_real_inventory_data(date_employee_counts, staff_members)
    
    if success:
        print(f"\n🔧 Next Steps:")
        print(f"1. Test the real date-wise API:")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/\" -Method GET")
        print(f"2. Test with date range:")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-06-01&date_to=2025-06-30\" -Method GET")
        print(f"3. You should now see real date-wise breakdown!")
    
    return success

if __name__ == "__main__":
    main()
