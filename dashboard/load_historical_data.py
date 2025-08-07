#!/usr/bin/env python3
"""
Historical Data Loader for Date Range Filtering
This script will scan S3 and populate the database with historical screenshot data
so that date range filtering works properly.
"""

import os
import django
import sys
from datetime import datetime, date
import boto3
from collections import defaultdict
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff
from django.db.models import Q

def parse_screenshot_filename(filename):
    """
    Parse screenshot filename to extract date and time
    Expected format: 2025-06-16_15-44-53_2025-06-16_15-44-52.webp
    """
    try:
        # Remove .webp extension
        base_name = filename.replace('.webp', '')
        
        # Split by underscore to get date parts
        parts = base_name.split('_')
        if len(parts) >= 2:
            # First part should be date: 2025-06-16
            date_str = parts[0]
            # Validate date format
            screenshot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            return screenshot_date
    except (ValueError, IndexError) as e:
        print(f"Could not parse date from filename: {filename} - {e}")
        return None
    
    return None

def scan_s3_for_historical_data():
    """
    Scan S3 bucket to find all historical screenshot data
    """
    print("🔍 Scanning S3 for historical screenshot data...")
    
    try:
        s3_client = boto3.client('s3')
        bucket_name = 'ddsfocustime'
        
        # Dictionary to store results: {email: {date: count}}
        historical_data = defaultdict(lambda: defaultdict(int))
        
        # Get all staff emails to process
        staff_list = Staff.objects.all()
        
        for staff in staff_list:
            email = staff.email.lower()
            folder_prefix = f'screenshots/{email}/'
            
            print(f"📂 Scanning folder for {email}...")
            
            try:
                # List objects in the user's folder
                paginator = s3_client.get_paginator('list_objects_v2')
                page_iterator = paginator.paginate(
                    Bucket=bucket_name,
                    Prefix=folder_prefix
                )
                
                screenshot_count = 0
                for page in page_iterator:
                    if 'Contents' in page:
                        for obj in page['Contents']:
                            filename = obj['Key'].split('/')[-1]  # Get just the filename
                            
                            # Skip if not a webp file
                            if not filename.endswith('.webp'):
                                continue
                                
                            # Parse date from filename
                            screenshot_date = parse_screenshot_filename(filename)
                            if screenshot_date:
                                historical_data[email][screenshot_date] += 1
                                screenshot_count += 1
                
                print(f"   Found {screenshot_count} screenshots for {email}")
                
            except Exception as e:
                print(f"   ❌ Error scanning {email}: {e}")
                continue
        
        return historical_data
    
    except Exception as e:
        print(f"❌ Error connecting to S3: {e}")
        return {}

def populate_database_with_historical_data(historical_data):
    """
    Populate the database with historical screenshot data
    """
    print("\n💾 Populating database with historical data...")
    
    total_records = 0
    
    for email, date_counts in historical_data.items():
        try:
            # Get staff object
            staff = Staff.objects.get(email=email)
            
            for screenshot_date, count in date_counts.items():
                # Check if record already exists
                existing_record = DailyScreenshotCount.objects.filter(
                    staff=staff,
                    date=screenshot_date
                ).first()
                
                if existing_record:
                    # Update existing record
                    existing_record.total_screenshots = count
                    existing_record.save()
                    print(f"   ✅ Updated {email} - {screenshot_date}: {count} screenshots")
                else:
                    # Create new record
                    DailyScreenshotCount.objects.create(
                        staff=staff,
                        date=screenshot_date,
                        total_screenshots=count,
                        task_folder_breakdown={},
                        s3_inventory_processed_at=datetime.now()
                    )
                    print(f"   ➕ Created {email} - {screenshot_date}: {count} screenshots")
                
                total_records += 1
        
        except Staff.DoesNotExist:
            print(f"   ⚠️ Staff not found for email: {email}")
            continue
        except Exception as e:
            print(f"   ❌ Error processing {email}: {e}")
            continue
    
    print(f"\n✅ Successfully processed {total_records} date records!")
    return total_records

def show_date_range_summary():
    """
    Show summary of available date ranges after population
    """
    print("\n📊 Date Range Summary:")
    
    from django.db.models import Min, Max, Count
    
    # Get date range
    date_range = DailyScreenshotCount.objects.aggregate(
        earliest_date=Min('date'),
        latest_date=Max('date'),
        total_unique_dates=Count('date', distinct=True),
        total_records=Count('id')
    )
    
    print(f"   📅 Earliest date: {date_range['earliest_date']}")
    print(f"   📅 Latest date: {date_range['latest_date']}")
    print(f"   📊 Unique dates: {date_range['total_unique_dates']}")
    print(f"   📈 Total records: {date_range['total_records']}")
    
    # Show top dates by activity
    print("\n📈 Top 10 dates by total screenshots:")
    from django.db.models import Sum
    
    top_dates = DailyScreenshotCount.objects.values('date').annotate(
        total_screenshots=Sum('total_screenshots'),
        employee_count=Count('staff', distinct=True)
    ).order_by('-total_screenshots')[:10]
    
    for date_data in top_dates:
        print(f"   {date_data['date']}: {date_data['total_screenshots']:,} screenshots ({date_data['employee_count']} employees)")

def main():
    print("=" * 60)
    print("🚀 HISTORICAL DATA LOADER FOR DATE RANGE FILTERING")
    print("=" * 60)
    
    # Step 1: Scan S3 for historical data
    historical_data = scan_s3_for_historical_data()
    
    if not historical_data:
        print("❌ No historical data found in S3. Please check your S3 configuration.")
        return
    
    print(f"\n📊 Found historical data for {len(historical_data)} employees")
    
    # Step 2: Populate database
    total_records = populate_database_with_historical_data(historical_data)
    
    if total_records > 0:
        # Step 3: Show summary
        show_date_range_summary()
        
        print("\n" + "=" * 60)
        print("✅ HISTORICAL DATA LOADING COMPLETE!")
        print("✅ Date range filtering will now work properly!")
        print("=" * 60)
        
        print("\n🧪 Test your date range filtering with:")
        print("   python calculate_work_time.py 2025-06-16 2025-06-20")
        print("   python calculate_work_time.py 2025-07-01 2025-07-31")
        print("   python calculate_work_time.py 2025-06-16 2025-08-06")
        
        print("\n🌐 Or test the API:")
        print("   GET /api/analytics/daily-screenshots/?date_from=2025-06-16&date_to=2025-06-20")
        print("   GET /api/analytics/daily-screenshots/?date_from=2025-07-01&date_to=2025-07-31")
    else:
        print("❌ No data was loaded. Please check for errors above.")

if __name__ == "__main__":
    main()
