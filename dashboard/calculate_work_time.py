import requests
import json
from datetime import datetime, timedelta

def get_all_employees_with_time_calculation(start_date=None, end_date=None):
    """Get all employees with screenshot counts and calculate total work time
    
    Args:
        start_date (str): Start date in YYYY-MM-DD format (optional)
        end_date (str): End date in YYYY-MM-DD format (optional)
    """
    
    print("="*80)
    print("ALL EMPLOYEES SCREENSHOT DATA WITH TIME CALCULATION")
    if start_date or end_date:
        date_info = f" (Date Range: {start_date or 'Beginning'} to {end_date or 'Today'})"
        print(date_info)
    print("="*80)
    
    try:
        # Build API URL with date parameters
        api_url = "http://127.0.0.1:8000/api/analytics/daily-screenshots/"
        params = {}
        
        if start_date:
            params['date_from'] = start_date
        if end_date:
            params['date_to'] = end_date
            
        # Get data from API
        response = requests.get(api_url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            
            print(f"📊 Found {len(employees)} employees")
            print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0):,}")
            if start_date or end_date:
                print(f"📅 Date Range: {start_date or 'Beginning'} to {end_date or 'Today'}")
                print(f"📊 Screenshots in Date Range: {summary.get('total_screenshots', 0):,}")
            
            # Common screenshot intervals (you can adjust these based on your system)
            DEFAULT_INTERVAL_SECONDS = 10  # Default 10 seconds between screenshots
            
            print(f"\n💡 Using {DEFAULT_INTERVAL_SECONDS} seconds as average interval between screenshots")
            print(f"💡 Formula: Total Time = Screenshots × {DEFAULT_INTERVAL_SECONDS} seconds")
            
            print(f"\n👥 ALL EMPLOYEES WITH TIME CALCULATION:")
            print(f"{'#':>3} {'Email':35} {'Screenshots':>12} {'Interval':>9} {'Total Time':>12} {'Work Hours':>10}")
            print("-" * 90)
            
            total_work_seconds = 0
            total_work_hours = 0
            
            for i, emp in enumerate(employees, 1):
                emp_info = emp.get('employee', {})
                email = emp_info.get('email', 'Unknown')
                screenshots = emp.get('total_screenshots', 0)
                
                # Calculate total time
                total_seconds = screenshots * DEFAULT_INTERVAL_SECONDS
                total_minutes = total_seconds / 60
                total_hours = total_seconds / 3600
                
                total_work_seconds += total_seconds
                total_work_hours += total_hours
                
                # Format time display
                if total_hours >= 1:
                    time_display = f"{total_hours:.1f}h"
                else:
                    time_display = f"{total_minutes:.0f}min"
                
                print(f"{i:3d} {email:35} {screenshots:8,} shots {DEFAULT_INTERVAL_SECONDS:6d}s {time_display:>10} {total_hours:8.1f}h")
            
            print("-" * 90)
            print(f"{'TOTALS:':>51} {summary.get('total_screenshots', 0):8,} shots {'':<10} {total_work_hours:8.1f}h")
            print(f"{'AVERAGE PER EMPLOYEE:':>51} {summary.get('average_screenshots', 0):8,.0f} shots {'':<10} {total_work_hours/len(employees):8.1f}h")
            
            # Summary statistics
            print(f"\n📈 WORK TIME SUMMARY:")
            print(f"   Total Work Time (All Employees): {total_work_hours:.1f} hours ({total_work_hours/24:.1f} days)")
            print(f"   Average Work Time per Employee: {total_work_hours/len(employees):.1f} hours")
            print(f"   Total Screenshots: {summary.get('total_screenshots', 0):,}")
            print(f"   Screenshot Interval: {DEFAULT_INTERVAL_SECONDS} seconds")
            
            # Top 10 performers
            print(f"\n🏆 TOP 10 EMPLOYEES BY WORK TIME:")
            top_employees = employees[:10]
            
            for i, emp in enumerate(top_employees, 1):
                emp_info = emp.get('employee', {})
                email = emp_info.get('email', 'Unknown')
                screenshots = emp.get('total_screenshots', 0)
                hours = (screenshots * DEFAULT_INTERVAL_SECONDS) / 3600
                
                print(f"   {i:2d}. {email:35} - {hours:6.1f} hours ({screenshots:,} screenshots)")
            
            # Alternative interval calculations
            print(f"\n🔄 ALTERNATIVE TIME CALCULATIONS:")
            print(f"{'Interval':>12} {'Total Hours':>12} {'Avg per Employee':>16}")
            print("-" * 45)
            
            for interval in [5, 10, 15, 30, 60]:
                total_alt_hours = (summary.get('total_screenshots', 0) * interval) / 3600
                avg_alt_hours = total_alt_hours / len(employees)
                print(f"{interval:8d}s {total_alt_hours:10.1f}h {avg_alt_hours:14.1f}h")
            
        else:
            print(f"❌ API ERROR: Status {response.status_code}")
            print(f"Response: {response.text[:300]}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
    
    print("\n" + "="*80)
    print("TIME CALCULATION COMPLETE!")
    print("="*80)

def get_date_range_examples():
    """Show example date range usage"""
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    print("\n" + "="*80)
    print("DATE RANGE EXAMPLES")
    print("="*80)
    print("Usage examples:")
    print(f"1. Last 7 days:  get_all_employees_with_time_calculation('{week_ago.strftime('%Y-%m-%d')}', '{today.strftime('%Y-%m-%d')}')")
    print(f"2. Last 30 days: get_all_employees_with_time_calculation('{month_ago.strftime('%Y-%m-%d')}', '{today.strftime('%Y-%m-%d')}')")
    print(f"3. Yesterday:    get_all_employees_with_time_calculation('{yesterday.strftime('%Y-%m-%d')}', '{yesterday.strftime('%Y-%m-%d')}')")
    print(f"4. Specific date: get_all_employees_with_time_calculation('2024-01-01', '2024-01-31')")
    print(f"5. All data:     get_all_employees_with_time_calculation()")
    print("="*80)

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    if len(sys.argv) == 1:
        # No arguments - show all data
        print("📊 SHOWING ALL EMPLOYEE DATA (No date filter)")
        get_all_employees_with_time_calculation()
        get_date_range_examples()
        
    elif len(sys.argv) == 2:
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            get_date_range_examples()
        else:
            # Single date argument - treat as start date
            start_date = sys.argv[1]
            print(f"📊 SHOWING EMPLOYEE DATA FROM {start_date} TO TODAY")
            get_all_employees_with_time_calculation(start_date=start_date)
            
    elif len(sys.argv) == 3:
        # Two date arguments
        start_date = sys.argv[1]
        end_date = sys.argv[2]
        print(f"📊 SHOWING EMPLOYEE DATA FROM {start_date} TO {end_date}")
        get_all_employees_with_time_calculation(start_date=start_date, end_date=end_date)
        
    else:
        print("❌ ERROR: Too many arguments")
        get_date_range_examples()
