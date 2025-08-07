"""
Create Super Realistic Historical Data with Real Work Patterns
This script creates much more realistic data including:
- Days off (no screenshots)
- Varying productivity levels
- Realistic work schedules
- Sick days and vacations
"""

import os
import sys
import django
from datetime import date, timedelta
import random

# Setup Django
sys.path.append('c:/Users/DDS/Desktop/back-end-work-5/dxdfocurpropanel-back-end-work-02')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import DailyScreenshotCount, Staff

def create_super_realistic_data():
    """Create super realistic data with proper work patterns"""
    print("🎯 Creating SUPER REALISTIC Historical Screenshot Data")
    print("=" * 70)
    
    try:
        # Get all staff members
        staff_members = Staff.objects.all()
        if not staff_members:
            print("❌ No staff members found.")
            return False
            
        print(f"👥 Found {staff_members.count()} staff members")
        
        # Clear existing data
        existing_count = DailyScreenshotCount.objects.count()
        if existing_count > 0:
            print(f"🗑️  Clearing {existing_count} existing records...")
            DailyScreenshotCount.objects.all().delete()
        
        # Date range
        start_date = date(2025, 6, 16)
        end_date = date(2025, 8, 6)
        
        # Calculate date range
        current_date = start_date
        dates_to_create = []
        
        while current_date <= end_date:
            dates_to_create.append(current_date)
            current_date += timedelta(days=1)
        
        print(f"📅 Creating data for {len(dates_to_create)} days")
        print(f"🗓️  Date range: {start_date} to {end_date}")
        
        # Define realistic employee work patterns
        employee_patterns = {
            'ilahe.avci2004@gmail.com': {
                'work_probability': 0.95,      # Works 95% of days
                'base_range': (8000, 15000),   # High performer
                'weekend_probability': 0.3,    # Sometimes works weekends
                'vacation_days': [(date(2025, 7, 20), date(2025, 7, 25))]  # Vacation
            },
            'tugbacalik84@gmail.com': {
                'work_probability': 0.90,
                'base_range': (5000, 10000),
                'weekend_probability': 0.2,
                'vacation_days': [(date(2025, 7, 15), date(2025, 7, 18))]
            },
            'begumdamlasen@gmail.com': {
                'work_probability': 0.88,
                'base_range': (4000, 8000),
                'weekend_probability': 0.15,
                'vacation_days': []
            },
            'gulsummelisa.23@gmail.com': {
                'work_probability': 0.85,
                'base_range': (2000, 5000),
                'weekend_probability': 0.1,
                'vacation_days': [(date(2025, 6, 25), date(2025, 6, 28))]
            },
            'amirishaque67@gmail.com': {
                'work_probability': 0.75,      # Lower work rate - as you mentioned
                'base_range': (800, 2000),
                'weekend_probability': 0.05,   # Rarely works weekends
                'vacation_days': [(date(2025, 8, 1), date(2025, 8, 6))]  # OFF this month!
            },
            'atakankahraman35@outlook.com': {
                'work_probability': 0.80,
                'base_range': (600, 1800),
                'weekend_probability': 0.08,
                'vacation_days': []
            },
            'cagla.shr@gmail.com': {
                'work_probability': 0.82,
                'base_range': (500, 1500),
                'weekend_probability': 0.12,
                'vacation_days': [(date(2025, 7, 10), date(2025, 7, 12))]
            },
            'mahboub.sad@gmail.com': {
                'work_probability': 0.78,
                'base_range': (400, 1200),
                'weekend_probability': 0.06,
                'vacation_days': []
            },
            'omerfrkyalcin@gmail.com': {
                'work_probability': 0.70,
                'base_range': (300, 900),
                'weekend_probability': 0.04,
                'vacation_days': [(date(2025, 7, 28), date(2025, 8, 2))]
            }
        }
        
        total_records = 0
        
        for target_date in dates_to_create:
            print(f"\n📅 Processing {target_date}...")
            
            daily_records = 0
            daily_total = 0
            
            # Check if it's weekend
            is_weekend = target_date.weekday() >= 5  # Saturday=5, Sunday=6
            
            for staff in staff_members:
                # Get employee pattern or use default
                if staff.email in employee_patterns:
                    pattern = employee_patterns[staff.email]
                else:
                    # Default pattern for other employees
                    pattern = {
                        'work_probability': 0.75,
                        'base_range': (200, 600),
                        'weekend_probability': 0.05,
                        'vacation_days': []
                    }
                
                # Check if employee is on vacation
                is_on_vacation = False
                for vacation_start, vacation_end in pattern['vacation_days']:
                    if vacation_start <= target_date <= vacation_end:
                        is_on_vacation = True
                        break
                
                # Skip if on vacation
                if is_on_vacation:
                    continue
                
                # Determine if employee works this day
                work_probability = pattern['work_probability']
                
                # Reduce probability on weekends
                if is_weekend:
                    work_probability = pattern['weekend_probability']
                
                # Random chance to not work (sick, personal day, etc.)
                if random.random() > work_probability:
                    continue  # Employee doesn't work this day
                
                # Calculate screenshot count for working day
                min_count, max_count = pattern['base_range']
                
                # Add realistic daily variations
                variation_factor = random.uniform(0.3, 1.8)  # 30% to 180% of base
                base_count = random.randint(min_count, max_count)
                daily_count = int(base_count * variation_factor)
                
                # Weekend reduction if working
                if is_weekend:
                    daily_count = int(daily_count * 0.4)  # Much lower on weekends
                
                # Minimum screenshots if working
                daily_count = max(50, daily_count)
                
                # Create the record
                DailyScreenshotCount.objects.create(
                    staff=staff,
                    date=target_date,
                    total_screenshots=daily_count,
                    task_folder_breakdown=f'{{"daily_work": {daily_count//2}, "projects": {daily_count//2}}}'
                )
                
                daily_records += 1
                daily_total += daily_count
                total_records += 1
            
            print(f"   ✅ {daily_records} employees worked, {daily_total:,} screenshots")
            if daily_records < staff_members.count():
                not_working = staff_members.count() - daily_records
                print(f"   🏠 {not_working} employees didn't work (vacation/sick/weekend)")
        
        print(f"\n🎉 SUCCESS! Super Realistic Data Created!")
        print(f"   📊 Total records created: {total_records}")
        print(f"   📅 Date range: {start_date} to {end_date}")
        print(f"   🗓️  Days covered: {len(dates_to_create)}")
        
        # Show sample data verification
        print(f"\n📈 Sample data verification:")
        sample_dates = [
            date(2025, 8, 1),   # Amir should be off
            date(2025, 8, 3),   # Amir should be off
            date(2025, 8, 6),   # Amir should be off
            date(2025, 7, 15),  # Some vacation days
            date(2025, 6, 22),  # Weekend
        ]
        
        for sample_date in sample_dates:
            if sample_date in dates_to_create:
                records = DailyScreenshotCount.objects.filter(date=sample_date)
                count = records.count()
                total = sum(r.total_screenshots for r in records)
                working_emails = [r.staff.email for r in records]
                
                print(f"\n   📅 {sample_date} ({'Weekend' if sample_date.weekday() >= 5 else 'Weekday'}):")
                print(f"      👥 {count} employees worked, {total:,} screenshots")
                
                # Check if Amir worked in August
                if sample_date >= date(2025, 8, 1) and 'amirishaque67@gmail.com' in working_emails:
                    print(f"      ⚠️  WARNING: Amir worked on {sample_date} (should be on vacation)")
                elif sample_date >= date(2025, 8, 1) and 'amirishaque67@gmail.com' not in working_emails:
                    print(f"      ✅ Amir is correctly on vacation")
                
                if count <= 5:  # Show who worked if few people
                    print(f"      📧 Working: {', '.join(working_emails[:3])}{'...' if len(working_emails) > 3 else ''}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating super realistic data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_super_realistic_data()
    
    if success:
        print(f"\n🔧 Test Commands:")
        print(f"1. Test August (Amir should be missing):")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-08-01&date_to=2025-08-06&format=employee_breakdown\" -Method GET")
        print(f"2. Test July (normal work):")
        print(f"   Invoke-RestMethod -Uri \"http://127.0.0.1:8000/api/analytics/date-wise-screenshots/?date_from=2025-07-01&date_to=2025-07-07&format=employee_breakdown\" -Method GET")
        print(f"3. Now you should see REALISTIC work patterns!")
