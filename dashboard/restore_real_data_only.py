"""
Restore Real Data Only - Remove Sample Data
This script removes all sample data and keeps only real data from S3 inventory
"""

import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.append('/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff

def restore_real_data_only():
    """Remove sample data and keep only real data"""
    print("🔄 Restoring Real Data Only - Removing Sample Data")
    print("=" * 60)
    
    try:
        # First, let's see what data we currently have
        all_records = DailyScreenshotCount.objects.all()
        print(f"📊 Current database status:")
        
        # Group by date to show what we have
        from collections import defaultdict
        data_by_date = defaultdict(list)
        
        for record in all_records:
            data_by_date[record.date].append(record)
        
        for date_key in sorted(data_by_date.keys()):
            records_for_date = data_by_date[date_key]
            total_screenshots = sum(r.total_screenshots for r in records_for_date)
            print(f"   {date_key}: {len(records_for_date)} employees, {total_screenshots:,} screenshots")
        
        # The real data was from 2025-08-06 with very high screenshot counts
        # Sample data has much lower counts (100-15000 range)
        # Real data for ilahe.avci2004@gmail.com was 509,972 screenshots
        
        print(f"\n🔍 Identifying Real vs Sample Data...")
        
        # Check for the real data signature (high screenshot counts)
        real_date = None
        for date_key, records in data_by_date.items():
            for record in records:
                if record.staff.email == 'ilahe.avci2004@gmail.com' and record.total_screenshots > 500000:
                    real_date = date_key
                    print(f"   ✅ Found real data for {date_key}: {record.staff.email} = {record.total_screenshots:,} screenshots")
                    break
            if real_date:
                break
        
        if not real_date:
            print("   ❌ No real data found with expected signature")
            print("   🔍 Looking for any data with very high counts...")
            
            # Look for any date with total > 1,000,000 screenshots
            for date_key, records in data_by_date.items():
                total_for_date = sum(r.total_screenshots for r in records)
                if total_for_date > 1000000:
                    real_date = date_key
                    print(f"   ✅ Found potential real data for {date_key}: {total_for_date:,} total screenshots")
                    break
        
        if real_date:
            print(f"\n🎯 Real data identified for date: {real_date}")
            
            # Delete all data EXCEPT the real date
            deleted_count = 0
            for date_key in data_by_date.keys():
                if date_key != real_date:
                    records_to_delete = DailyScreenshotCount.objects.filter(date=date_key)
                    count = records_to_delete.count()
                    records_to_delete.delete()
                    deleted_count += count
                    print(f"   🗑️  Deleted {count} sample records for {date_key}")
            
            print(f"\n✅ SUCCESS!")
            print(f"   🗑️  Removed {deleted_count} sample records")
            print(f"   ✅ Kept real data for {real_date}")
            
            # Show final status
            remaining_records = DailyScreenshotCount.objects.filter(date=real_date)
            total_real_screenshots = sum(r.total_screenshots for r in remaining_records)
            print(f"   📊 Real data: {remaining_records.count()} employees, {total_real_screenshots:,} screenshots")
            
        else:
            print(f"\n❌ Could not identify real data")
            print(f"   🔍 All dates found:")
            for date_key, records in data_by_date.items():
                total = sum(r.total_screenshots for r in records)
                print(f"      {date_key}: {total:,} screenshots")
                
        return True
        
    except Exception as e:
        print(f"❌ Error restoring real data: {e}")
        return False

if __name__ == "__main__":
    success = restore_real_data_only()
    
    if success:
        print(f"\n🔧 Next Steps:")
        print(f"1. Test with real data only:")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-08-06&date_to=2025-08-06\" -Method GET")
        print(f"2. You should now see only real data (high screenshot counts)")
        print(f"3. For historical dates, you would need to load real S3 data")
