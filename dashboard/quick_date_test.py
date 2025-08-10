#!/usr/bin/env python3

import os
import django
import sys

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dashboard.settings')
django.setup()

from dashboard.models import DailyScreenshotCount
from django.db.models import Min, Max, Count

def test_date_ranges():
    print("=== DATABASE DATE ANALYSIS ===")
    
    # Check unique dates
    all_dates = DailyScreenshotCount.objects.values('date').distinct().order_by('date')
    print(f"Total unique dates in database: {len(all_dates)}")
    
    if len(all_dates) <= 10:  # Only print if manageable number
        for date_obj in all_dates:
            employee_count = DailyScreenshotCount.objects.filter(date=date_obj['date']).count()
            print(f"  {date_obj['date']}: {employee_count} employees")
    else:
        # Show first and last few dates
        print("First 3 dates:")
        for date_obj in all_dates[:3]:
            employee_count = DailyScreenshotCount.objects.filter(date=date_obj['date']).count()
            print(f"  {date_obj['date']}: {employee_count} employees")
        print("...")
        print("Last 3 dates:")
        for date_obj in all_dates[-3:]:
            employee_count = DailyScreenshotCount.objects.filter(date=date_obj['date']).count()
            print(f"  {date_obj['date']}: {employee_count} employees")
    
    print("\n=== TEST SPECIFIC EMPLOYEE ===")
    test_email = 'ilahe.avci2004@gmail.com'
    employee_records = DailyScreenshotCount.objects.filter(
        staff__email=test_email
    ).order_by('date')
    
    print(f"Records for {test_email}:")
    total = 0
    for record in employee_records:
        print(f"  {record.date}: {record.total_screenshots:,} screenshots")
        total += record.total_screenshots
    print(f"  TOTAL: {total:,} screenshots")
    
    print("\n=== CONCLUSION ===")
    if len(all_dates) == 1:
        print("✅ Database contains only 1 date - this explains why date ranges return the same numbers!")
        print("   When you query 2025-07-15 to 2025-08-06, you only get August 6 data.")
    else:
        print(f"✅ Database contains {len(all_dates)} dates - date range filtering should work properly.")

if __name__ == "__main__":
    test_date_ranges()
