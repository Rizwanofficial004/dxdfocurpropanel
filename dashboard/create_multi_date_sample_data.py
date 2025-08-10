"""
Create Sample Multi-Date Screenshot Data
This script creates sample data for multiple dates to demonstrate date-wise analytics
"""

import os
import sys
import django
from datetime import date, timedelta
import random

# Setup Django
sys.path.append('/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff

def create_sample_multi_date_data():
    """Create sample data for the last 7 days"""
    print("🔧 Creating Sample Multi-Date Screenshot Data")
    print("=" * 50)
    
    try:
        # Get all staff members
        staff_members = Staff.objects.all()
        if not staff_members:
            print("❌ No staff members found. Please run staff population first.")
            return
        
        print(f"📊 Found {staff_members.count()} staff members")
        
        # Create data for last 7 days
        today = date.today()
        dates_to_create = []
        
        for i in range(7):
            target_date = today - timedelta(days=i)
            dates_to_create.append(target_date)
        
        print(f"📅 Creating data for dates: {[d.isoformat() for d in dates_to_create]}")
        
        total_records_created = 0
        
        for target_date in dates_to_create:
            print(f"\n📅 Processing date: {target_date}")
            
            # Delete existing data for this date to avoid duplicates
            existing_count = DailyScreenshotCount.objects.filter(date=target_date).count()
            if existing_count > 0:
                print(f"   🗑️  Deleting {existing_count} existing records for {target_date}")
                DailyScreenshotCount.objects.filter(date=target_date).delete()
            
            # Create realistic screenshot counts for each employee
            daily_records = 0
            for staff in staff_members:
                # Simulate realistic daily screenshot counts
                # More screenshots for recent dates, fewer for older dates
                days_ago = (today - target_date).days
                base_count = random.randint(1000, 15000)  # Base daily count
                
                # Reduce count for older dates
                reduction_factor = max(0.3, 1 - (days_ago * 0.15))
                daily_count = int(base_count * reduction_factor)
                
                # Add some randomness
                daily_count += random.randint(-500, 500)
                daily_count = max(100, daily_count)  # Minimum 100 screenshots
                
                # Create the record
                DailyScreenshotCount.objects.create(
                    staff=staff,
                    date=target_date,
                    total_screenshots=daily_count,
                    task_folder_breakdown=f'{{"task_folder_1": {daily_count//2}, "task_folder_2": {daily_count//2}}}'
                )
                daily_records += 1
            
            print(f"   ✅ Created {daily_records} records for {target_date}")
            total_records_created += daily_records
        
        print(f"\n🎉 SUCCESS!")
        print(f"   📊 Total records created: {total_records_created}")
        print(f"   📅 Date range: {min(dates_to_create)} to {max(dates_to_create)}")
        print(f"\n✅ Now you can test date-wise analytics with multiple dates!")
        
        # Show summary
        print(f"\n📈 Database Summary:")
        for target_date in sorted(dates_to_create):
            count = DailyScreenshotCount.objects.filter(date=target_date).count()
            total = sum(record.total_screenshots for record in DailyScreenshotCount.objects.filter(date=target_date))
            print(f"   {target_date}: {count} employees, {total:,} total screenshots")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        return False

if __name__ == "__main__":
    success = create_sample_multi_date_data()
    
    if success:
        print(f"\n🔧 Next Steps:")
        print(f"1. Test the date-wise API:")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-08-01&date_to=2025-08-06\" -Method GET")
        print(f"2. You should now see multiple dates in the response!")
