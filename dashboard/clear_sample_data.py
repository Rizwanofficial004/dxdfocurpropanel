"""
Clear All Sample Data and Start Fresh
This script removes all screenshot count data so we can get real data
"""

import os
import sys
import django

# Setup Django
sys.path.append('/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount

def clear_all_sample_data():
    """Remove all screenshot count data"""
    print("🗑️  Clearing All Screenshot Count Data")
    print("=" * 50)
    
    try:
        # Get count before deletion
        total_records = DailyScreenshotCount.objects.count()
        print(f"📊 Found {total_records} screenshot count records")
        
        if total_records > 0:
            # Show what we're about to delete
            from collections import defaultdict
            data_by_date = defaultdict(int)
            
            for record in DailyScreenshotCount.objects.all():
                data_by_date[record.date] += 1
            
            print(f"\n📅 Records by date:")
            for date_key in sorted(data_by_date.keys()):
                count = data_by_date[date_key]
                total_screenshots = sum(r.total_screenshots for r in DailyScreenshotCount.objects.filter(date=date_key))
                print(f"   {date_key}: {count} employees, {total_screenshots:,} screenshots")
            
            # Delete all records
            print(f"\n🗑️  Deleting all {total_records} records...")
            DailyScreenshotCount.objects.all().delete()
            
            print(f"✅ All sample data cleared!")
        else:
            print(f"✅ No data to clear - database is already empty")
        
        # Verify deletion
        remaining = DailyScreenshotCount.objects.count()
        print(f"\n📊 Verification: {remaining} records remaining")
        
        return True
        
    except Exception as e:
        print(f"❌ Error clearing data: {e}")
        return False

if __name__ == "__main__":
    success = clear_all_sample_data()
    
    if success:
        print(f"\n🔧 Next Steps:")
        print(f"1. Database is now clean and ready for real data")
        print(f"2. Configure S3 credentials to load real historical data")
        print(f"3. Or use the current system for today's real data only")
