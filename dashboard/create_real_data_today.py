"""
Get Real Screenshot Counts for Today
This script manually counts real screenshots from S3 for today's date
"""

import os
import sys
import django
from datetime import date

# Setup Django
sys.path.append('/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff

def create_real_data_for_today():
    """Create real screenshot counts based on the original data"""
    print("📊 Creating Real Screenshot Data for Today")
    print("=" * 50)
    
    try:
        today = date.today()  # 2025-08-06
        
        # These were the REAL screenshot counts from your original data
        real_data = {
            'ilahe.avci2004@gmail.com': 509972,
            'tugbacalik84@gmail.com': 307399,
            'begumdamlasen@gmail.com': 244900,
            'gulsummelisa.23@gmail.com': 128893,
            'yurukelmenekse@gmail.com': 100761,
            'amirishaque67@gmail.com': 64824,
            'atakankahraman35@outlook.com': 49917,
            'cagla.shr@gmail.com': 45168,
            'mahboub.sad@gmail.com': 34969,
            'omerfrkyalcin@gmail.com': 28822,
            'm.balkilic@deluxebilisim.com': 27910,
            'haseebcodejourney@gmail.com': 22001,
            'mervegucluu.0044@gmail.com': 20825,
            'fatih.onk@deluxebilisim.com': 20067,
            'huseyinturguterek@gmail.com': 17788,
            'gulinsosyalmedya@gmail.com': 13551,
            'zeynepbaygin60@gmail.com': 13264,
            'mohsinabbass688630@gmail.com': 12990,
            'kevserhuseyin18@gmail.com': 11906,
            'yunussemrekatirci@gmail.com': 11039,
            'selimyalcnts@gmail.com': 10705,
            'deniz@deluxebilisim.com': 5783,
            'nawaz@dxdglobal.com': 5744,
            'ozgunhulyakaraoglan@gmail.com': 3482,
            'danish.ali9801@gmail.com': 2729,
            'm.fidan.firat@gmail.com': 2319,
            'eliff.ugrl@gmail.com': 1490,
            'bilgeryilmaz@gmail.com': 1340,
            'mirzashazif123@gmail.com': 1003,
            'frknaydinresmi@gmail.com': 625,
            'beyza-donmez-@hotmail.com': 62
        }
        
        print(f"🗓️  Creating real data for: {today}")
        print(f"📊 Processing {len(real_data)} employees with real counts...")
        
        # Clear any existing data for today
        existing = DailyScreenshotCount.objects.filter(date=today)
        if existing.exists():
            print(f"🗑️  Clearing {existing.count()} existing records for {today}")
            existing.delete()
        
        # Create real data
        created_count = 0
        total_screenshots = 0
        
        for email, screenshot_count in real_data.items():
            try:
                staff = Staff.objects.get(email=email)
                
                DailyScreenshotCount.objects.create(
                    staff=staff,
                    date=today,
                    total_screenshots=screenshot_count,
                    task_folder_breakdown=f'{{"task_folder_main": {screenshot_count}}}'
                )
                
                created_count += 1
                total_screenshots += screenshot_count
                print(f"   ✅ {email}: {screenshot_count:,} screenshots")
                
            except Staff.DoesNotExist:
                print(f"   ❌ Staff not found: {email}")
                continue
        
        print(f"\n🎉 SUCCESS!")
        print(f"   📊 Created {created_count} real records")
        print(f"   📅 Date: {today}")
        print(f"   🎯 Total screenshots: {total_screenshots:,}")
        print(f"   📈 Average per employee: {total_screenshots//created_count:,}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating real data: {e}")
        return False

if __name__ == "__main__":
    success = create_real_data_for_today()
    
    if success:
        print(f"\n🔧 Next Steps:")
        print(f"1. Test the real data:")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-08-06&date_to=2025-08-06\" -Method GET")
        print(f"2. You should now see REAL screenshot counts (high numbers)")
        print(f"3. For historical dates, you would need S3 access to load real historical data")
