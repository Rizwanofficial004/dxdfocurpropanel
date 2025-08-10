#!/usr/bin/env python3
"""
Test script to populate daily screenshot counts using the data you provided
"""

import os
import sys
import django
from datetime import date, datetime

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff, DailyScreenshotCount

# The data from your API response
SCREENSHOT_DATA = [
    {"email": "amirishaque67@gmail.com", "name": "Amirishaque67 User", "staff_id": "S3_AMIRISHAQUE67", "screenshot_count": 64824},
    {"email": "atakankahraman35@outlook.com", "name": "Atakankahraman35 User", "staff_id": "S3_ATAKANKAHRAMAN35", "screenshot_count": 49917},
    {"email": "begumdamlasen@gmail.com", "name": "Begumdamlasen User", "staff_id": "S3_BEGUMDAMLASEN", "screenshot_count": 244900},
    {"email": "beyza-donmez-@hotmail.com", "name": "Beyza-Donmez- User", "staff_id": "S3_BEYZA-DONMEZ-", "screenshot_count": 62},
    {"email": "bilgeryilmaz@gmail.com", "name": "Bilgeryilmaz User", "staff_id": "S3_BILGERYILMAZ", "screenshot_count": 1340},
    {"email": "cagla.shr@gmail.com", "name": "Cagla Shr", "staff_id": "S3_CAGLA.SHR", "screenshot_count": 45168},
    {"email": "danish.ali9801@gmail.com", "name": "Danish Ali9801", "staff_id": "S3_DANISH.ALI9801", "screenshot_count": 2729},
    {"email": "deniz@deluxebilisim.com", "name": "Deniz User", "staff_id": "S3_DENIZ", "screenshot_count": 5783},
    {"email": "eliff.ugrl@gmail.com", "name": "Eliff Ugrl", "staff_id": "S3_ELIFF.UGRL", "screenshot_count": 1490},
    {"email": "fatih.onk@deluxebilisim.com", "name": "Fatih Onk", "staff_id": "S3_FATIH.ONK", "screenshot_count": 20067},
    {"email": "frknaydinresmi@gmail.com", "name": "Frknaydinresmi User", "staff_id": "S3_FRKNAYDINRESMI", "screenshot_count": 625},
    {"email": "gulinsosyalmedya@gmail.com", "name": "Gulinsosyalmedya User", "staff_id": "S3_GULINSOSYALMEDYA", "screenshot_count": 13551},
    {"email": "gulsummelisa.23@gmail.com", "name": "Gulsummelisa 23", "staff_id": "S3_GULSUMMELISA.23", "screenshot_count": 128893},
    {"email": "haseebcodejourney@gmail.com", "name": "Haseebcodejourney User", "staff_id": "S3_HASEEBCODEJOURNEY", "screenshot_count": 22001},
    {"email": "huseyinturguterek@gmail.com", "name": "Huseyinturguterek User", "staff_id": "S3_HUSEYINTURGUTEREK", "screenshot_count": 17788},
    {"email": "ilahe.avci2004@gmail.com", "name": "Ilahe Avci2004", "staff_id": "S3_ILAHE.AVCI2004", "screenshot_count": 509972},
    {"email": "kevserhuseyin18@gmail.com", "name": "Kevserhuseyin18 User", "staff_id": "S3_KEVSERHUSEYIN18", "screenshot_count": 11906},
    {"email": "m.balkilic@deluxebilisim.com", "name": "M Balkilic", "staff_id": "S3_M.BALKILIC", "screenshot_count": 27910},
    {"email": "m.fidan.firat@gmail.com", "name": "M Fidan", "staff_id": "S3_M.FIDAN.FIRAT", "screenshot_count": 2319},
    {"email": "mahboub.sad@gmail.com", "name": "Mahboub Sad", "staff_id": "S3_MAHBOUB.SAD", "screenshot_count": 34969},
    {"email": "mervegucluu.0044@gmail.com", "name": "Mervegucluu 0044", "staff_id": "S3_MERVEGUCLUU.0044", "screenshot_count": 20825},
    {"email": "mirzashazif123@gmail.com", "name": "Mirzashazif123 User", "staff_id": "S3_MIRZASHAZIF123", "screenshot_count": 1003},
    {"email": "mohsinabbass688630@gmail.com", "name": "Mohsinabbass688630 User", "staff_id": "S3_MOHSINABBASS688630", "screenshot_count": 12990},
    {"email": "nawaz@dxdglobal.com", "name": "Nawaz User", "staff_id": "S3_NAWAZ", "screenshot_count": 5744},
    {"email": "omerfrkyalcin@gmail.com", "name": "Omerfrkyalcin User", "staff_id": "S3_OMERFRKYALCIN", "screenshot_count": 28822},
    {"email": "ozgunhulyakaraoglan@gmail.com", "name": "Ozgunhulyakaraoglan User", "staff_id": "S3_OZGUNHULYAKARAOGLAN", "screenshot_count": 3482},
    {"email": "selimyalcnts@gmail.com", "name": "Selimyalcnts User", "staff_id": "S3_SELIMYALCNTS", "screenshot_count": 10705},
    {"email": "tugbacalik84@gmail.com", "name": "Tugbacalik84 User", "staff_id": "S3_TUGBACALIK84", "screenshot_count": 307399},
    {"email": "yunussemrekatirci@gmail.com", "name": "Yunussemrekatirci User", "staff_id": "S3_YUNUSSEMREKATIRCI", "screenshot_count": 11039},
    {"email": "yurukelmenekse@gmail.com", "name": "Yurukelmenekse User", "staff_id": "S3_YURUKELMENEKSE", "screenshot_count": 100761},
    {"email": "zeynepbaygin60@gmail.com", "name": "Zeynepbaygin60 User", "staff_id": "S3_ZEYNEPBAYGIN60", "screenshot_count": 13264}
]

def populate_test_data():
    """Populate daily screenshot counts using the provided data"""
    print("🚀 Populating daily screenshot counts with test data...")
    
    # Get today's date
    today = date.today()
    print(f"📅 Processing for date: {today}")
    
    # Clear any existing records for today
    deleted_count = DailyScreenshotCount.objects.filter(date=today).delete()[0]
    if deleted_count > 0:
        print(f"🗑️  Deleted {deleted_count} existing records for today")
    
    created_count = 0
    skipped_count = 0
    
    # Process each employee
    for emp_data in SCREENSHOT_DATA:
        try:
            email = emp_data['email']
            staff_id = emp_data['staff_id']
            screenshot_count = emp_data['screenshot_count']
            
            # Find the staff member
            staff = None
            try:
                staff = Staff.objects.get(email=email)
            except Staff.DoesNotExist:
                try:
                    staff = Staff.objects.get(staffid=staff_id)
                except Staff.DoesNotExist:
                    print(f"⚠️  No staff record found for: {email} ({staff_id})")
                    skipped_count += 1
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
            skipped_count += 1
            continue
    
    print(f"\n📊 Summary:")
    print(f"   Created: {created_count} records")
    print(f"   Skipped: {skipped_count} records")
    print(f"   Date: {today}")
    print(f"✅ Daily screenshot count population completed!")
    
    return created_count > 0

def test_daily_analytics_direct():
    """Test the daily analytics by querying the database directly"""
    print("\n🧪 Testing daily screenshot analytics (direct database query)...")
    
    try:
        today = date.today()
        
        # Get today's records
        daily_counts = DailyScreenshotCount.objects.filter(date=today).select_related('staff')
        
        if not daily_counts.exists():
            print("❌ No daily screenshot records found for today")
            return False
        
        print(f"✅ Found {daily_counts.count()} employee records for {today}")
        
        # Calculate summary statistics
        total_screenshots = sum(record.total_screenshots for record in daily_counts)
        avg_screenshots = total_screenshots / daily_counts.count() if daily_counts.count() > 0 else 0
        max_screenshots = max(record.total_screenshots for record in daily_counts)
        min_screenshots = min(record.total_screenshots for record in daily_counts)
        
        print(f"📊 Summary Statistics:")
        print(f"   Total Screenshots: {total_screenshots:,}")
        print(f"   Average Screenshots: {avg_screenshots:,.2f}")
        print(f"   Max Screenshots: {max_screenshots:,}")
        print(f"   Min Screenshots: {min_screenshots:,}")
        
        # Show top 5 employees
        print(f"\n🏆 Top 5 Employees by Screenshot Count:")
        top_employees = sorted(daily_counts, key=lambda x: x.total_screenshots, reverse=True)[:5]
        for i, record in enumerate(top_employees, 1):
            print(f"   {i}. {record.staff.email}: {record.total_screenshots:,}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing daily analytics: {str(e)}")
        return False

def test_api_endpoint():
    """Test the actual API endpoint"""
    print("\n🧪 Testing daily screenshot analytics API endpoint...")
    
    try:
        import requests
        url = "http://127.0.0.1:8000/api/analytics/daily-screenshots/"
        print(f"📡 Calling API: {url}")
        
        response = requests.get(url, timeout=30)
        
        print(f"📡 API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employees = data.get('data', {}).get('employees', [])
                summary = data.get('data', {}).get('summary', {})
                print(f"✅ API Working! Found {len(employees)} employees")
                print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
                print(f"📊 Average Screenshots: {summary.get('average_screenshots', 0)}")
                
                # Show first few employees
                print(f"\n👥 First 3 Employees:")
                for i, emp in enumerate(employees[:3], 1):
                    emp_info = emp.get('employee', {})
                    print(f"   {i}. {emp_info.get('email')}: {emp.get('total_screenshots', 0):,}")
                
                return True
            else:
                print(f"❌ API Error: {data.get('message')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing API: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("DAILY SCREENSHOT COUNT TESTING")
    print("=" * 60)
    
    # Step 1: Populate data
    if populate_test_data():
        
        # Step 2: Test database directly
        test_daily_analytics_direct()
        
        # Step 3: Test API endpoint
        test_api_endpoint()
        
        print("\n" + "=" * 60)
        print("TESTING COMPLETED!")
        print("=" * 60)
    else:
        print("❌ Failed to populate test data")
