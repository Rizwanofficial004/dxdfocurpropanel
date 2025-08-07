#!/usr/bin/env python3
"""
Enhanced script to get all employees with screenshot counts AND time intervals
"""

import os
import sys
import django
from datetime import date, datetime
import requests

# Add the project directory to the Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_dir)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DDS.settings')
django.setup()

from dashboard.models import Staff, DailyScreenshotCount
import boto3

def calculate_user_time_intervals():
    """Calculate average time intervals between screenshots for each user"""
    print("🕒 Calculating time intervals between screenshots for each user...")
    
    try:
        # Get S3 client
        s3_client = boto3.client('s3')
        bucket_name = 'ddsfocustime'
        
        # Get all staff members
        all_staff = Staff.objects.all()
        user_intervals = []
        
        for staff in all_staff:
            try:
                email = staff.email
                s3_email_folder = email.replace('@', '_at_')
                prefix = f"screenshots/{s3_email_folder}/"
                
                print(f"🔍 Analyzing {email}...")
                
                # Get recent screenshots (last 100 for analysis)
                response = s3_client.list_objects_v2(
                    Bucket=bucket_name,
                    Prefix=prefix,
                    MaxKeys=100
                )
                
                screenshots = []
                allowed_extensions = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')
                
                # Collect screenshot timestamps
                for obj in response.get('Contents', []):
                    key = obj['Key']
                    if key.lower().endswith(allowed_extensions):
                        screenshots.append({
                            'key': key,
                            'timestamp': obj['LastModified']
                        })
                
                # Sort by timestamp
                screenshots.sort(key=lambda x: x['timestamp'])
                
                # Calculate intervals
                intervals = []
                if len(screenshots) > 1:
                    for i in range(1, len(screenshots)):
                        prev_time = screenshots[i-1]['timestamp']
                        curr_time = screenshots[i]['timestamp']
                        interval_seconds = (curr_time - prev_time).total_seconds()
                        
                        # Filter reasonable intervals (between 1 second and 1 hour)
                        if 1 <= interval_seconds <= 3600:
                            intervals.append(interval_seconds)
                
                # Calculate average interval
                if intervals:
                    avg_interval = sum(intervals) / len(intervals)
                    min_interval = min(intervals)
                    max_interval = max(intervals)
                else:
                    avg_interval = 60  # Default 60 seconds if no data
                    min_interval = 60
                    max_interval = 60
                
                # Get total screenshot count
                total_screenshots = len(screenshots)
                
                # Get from daily count if available
                try:
                    daily_count = DailyScreenshotCount.objects.get(
                        staff=staff,
                        date=date.today()
                    )
                    total_screenshots = daily_count.total_screenshots
                except DailyScreenshotCount.DoesNotExist:
                    pass
                
                # Calculate estimated total time
                estimated_total_seconds = total_screenshots * avg_interval
                estimated_hours = estimated_total_seconds / 3600
                
                user_intervals.append({
                    'email': email,
                    'name': f"{staff.firstname} {staff.lastname}",
                    'staff_id': staff.staffid,
                    'total_screenshots': total_screenshots,
                    'avg_interval_seconds': round(avg_interval, 1),
                    'min_interval_seconds': round(min_interval, 1) if intervals else 60,
                    'max_interval_seconds': round(max_interval, 1) if intervals else 60,
                    'sample_size': len(intervals),
                    'estimated_total_hours': round(estimated_hours, 2),
                    'estimated_total_minutes': round(estimated_total_seconds / 60, 1)
                })
                
                print(f"  ✅ {email}: {total_screenshots:,} screenshots, ~{avg_interval:.1f}s interval, ~{estimated_hours:.1f}h total")
                
            except Exception as e:
                print(f"  ❌ Error analyzing {staff.email}: {e}")
                # Add default data for failed analysis
                user_intervals.append({
                    'email': staff.email,
                    'name': f"{staff.firstname} {staff.lastname}",
                    'staff_id': staff.staffid,
                    'total_screenshots': 0,
                    'avg_interval_seconds': 60.0,
                    'min_interval_seconds': 60.0,
                    'max_interval_seconds': 60.0,
                    'sample_size': 0,
                    'estimated_total_hours': 0.0,
                    'estimated_total_minutes': 0.0
                })
                continue
        
        return user_intervals
        
    except Exception as e:
        print(f"❌ Error calculating intervals: {e}")
        return []

def test_enhanced_employee_data():
    """Test API and calculate time intervals"""
    
    print("="*80)
    print("ENHANCED EMPLOYEE SCREENSHOT DATA WITH TIME INTERVALS")
    print("="*80)
    
    # Get time intervals
    print("\n🕒 Calculating time intervals...")
    time_data = calculate_user_time_intervals()
    
    # Get API data
    print("\n📡 Getting API data...")
    try:
        response = requests.get("http://127.0.0.1:8000/api/analytics/daily-screenshots/", timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            api_employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            
            # Merge API data with time interval data
            print(f"\n📊 COMPLETE EMPLOYEE DATA:")
            print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
            print(f"📊 Total Employees: {len(api_employees)}")
            
            # Create lookup for time data
            time_lookup = {item['email']: item for item in time_data}
            
            print(f"\n👥 ALL EMPLOYEES WITH TIME ANALYSIS:")
            print(f"{'#':>3} {'Email':35} {'Screenshots':>12} {'Avg Interval':>12} {'Total Time':>12}")
            print("-" * 80)
            
            total_work_hours = 0
            
            for i, emp in enumerate(api_employees, 1):
                emp_info = emp.get('employee', {})
                email = emp_info.get('email')
                screenshots = emp.get('total_screenshots', 0)
                
                # Get time data
                time_info = time_lookup.get(email, {})
                avg_interval = time_info.get('avg_interval_seconds', 60.0)
                total_hours = time_info.get('estimated_total_hours', 0.0)
                
                total_work_hours += total_hours
                
                print(f"{i:3d} {email:35} {screenshots:8,} shots {avg_interval:8.1f}s {total_hours:8.1f}h")
            
            print("-" * 80)
            print(f"{'TOTAL ESTIMATED WORK TIME:':>67} {total_work_hours:8.1f}h")
            print(f"{'AVERAGE WORK TIME PER EMPLOYEE:':>67} {total_work_hours/len(api_employees):8.1f}h")
            
            # Detailed breakdown for top 10 users
            print(f"\n🔍 DETAILED TIME ANALYSIS (Top 10 Users):")
            print(f"{'Email':35} {'Screenshots':>10} {'Avg Int':>8} {'Min Int':>8} {'Max Int':>8} {'Sample':>7} {'Total Time':>12}")
            print("-" * 95)
            
            for i, emp in enumerate(api_employees[:10], 1):
                emp_info = emp.get('employee', {})
                email = emp_info.get('email')
                screenshots = emp.get('total_screenshots', 0)
                
                time_info = time_lookup.get(email, {})
                avg_int = time_info.get('avg_interval_seconds', 60.0)
                min_int = time_info.get('min_interval_seconds', 60.0)
                max_int = time_info.get('max_interval_seconds', 60.0)
                sample = time_info.get('sample_size', 0)
                total_time = time_info.get('estimated_total_minutes', 0.0)
                
                print(f"{email:35} {screenshots:8,} {avg_int:6.1f}s {min_int:6.1f}s {max_int:6.1f}s {sample:5d} {total_time:8.1f}min")
                
        else:
            print(f"❌ API ERROR: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE!")
    print("="*80)

if __name__ == "__main__":
    test_enhanced_employee_data()
