#!/usr/bin/env python3
"""
Test script for Monthly Screenshots API
Tests current month, previous month, and specific month functionality
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
MONTHLY_SCREENSHOTS_URL = f"{BASE_URL}/api/screenshots/monthly/"

# Test with your specific email
TEST_EMAIL = "haseebcodejourney@gmail.com"
TEST_NAME = "Haseeb"

def test_monthly_screenshots():
    print("="*80)
    print("📅 TESTING MONTHLY SCREENSHOTS API")
    print("="*80)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📧 Test Email: {TEST_EMAIL}")
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test scenarios for monthly data
    test_scenarios = [
        {
            "name": "Current Month (July 2025)",
            "params": {"user": TEST_EMAIL, "month": "current", "limit": 50}
        },
        {
            "name": "Previous Month (June 2025)",
            "params": {"user": TEST_EMAIL, "month": "previous", "limit": 50}
        },
        {
            "name": "Specific Month - June 2025",
            "params": {"user": TEST_EMAIL, "month": "2025-06", "limit": 100}
        },
        {
            "name": "Specific Month - May 2025",
            "params": {"user": TEST_EMAIL, "month": "2025-05", "limit": 50}
        },
        {
            "name": "Current Month by Name",
            "params": {"user": TEST_NAME, "month": "current", "limit": 30}
        },
        {
            "name": "Previous Month by Name",
            "params": {"user": TEST_NAME, "month": "previous", "limit": 30}
        },
        {
            "name": "Current Month with Status Filter",
            "params": {"user": TEST_EMAIL, "month": "current", "status": "Online", "limit": 20}
        },
        {
            "name": "Previous Month with Status Filter",
            "params": {"user": TEST_EMAIL, "month": "previous", "status": "Online", "limit": 20}
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        print(f"📋 Parameters: {scenario['params']}")
        print("-" * 60)
        
        try:
            response = requests.get(MONTHLY_SCREENSHOTS_URL, params=scenario['params'])
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"🔗 URL: {response.url}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    if data.get('success'):
                        user_info = data.get('data', {}).get('user_info', {})
                        month_info = data.get('data', {}).get('month_info', {})
                        screenshots = data.get('data', {}).get('screenshots', [])
                        summary = data.get('data', {}).get('summary', {})
                        daily_breakdown = summary.get('daily_breakdown', {})
                        
                        print(f"✅ SUCCESS!")
                        print(f"👤 User: {user_info.get('display_name')} ({user_info.get('email')})")
                        print(f"📅 Month: {month_info.get('month_name')}")
                        print(f"📊 Date Range: {month_info.get('start_date')} to {month_info.get('end_date')}")
                        print(f"📸 Total Screenshots: {summary.get('total_screenshots', 0)}")
                        print(f"📈 Average per Day: {summary.get('average_per_day', 0)}")
                        
                        if daily_breakdown:
                            print(f"📊 Daily Breakdown:")
                            sorted_days = sorted(daily_breakdown.items())
                            for date, count in sorted_days[:7]:  # Show first 7 days
                                print(f"   {date}: {count} screenshots")
                            if len(sorted_days) > 7:
                                print(f"   ... and {len(sorted_days) - 7} more days")
                        
                        if summary.get('most_active_day'):
                            print(f"🏆 Most Active Day: {summary.get('most_active_day')}")
                        
                        if screenshots:
                            print(f"📷 Sample Screenshots (showing first 3):")
                            for i, screenshot in enumerate(screenshots[:3]):
                                print(f"   {i+1}. {screenshot.get('filename', 'Unknown')}")
                                print(f"      📅 Date: {screenshot.get('date_folder')} ({screenshot.get('day_name')})")
                                print(f"      ⏰ Time: {screenshot.get('time_display')}")
                                print(f"      📊 Status: {screenshot.get('status')}")
                        
                    else:
                        print(f"❌ API Error: {data.get('message', 'Unknown error')}")
                        
                except json.JSONDecodeError:
                    print(f"❌ Invalid JSON response")
                    print(f"Raw response: {response.text[:300]}...")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                if response.text:
                    print(f"Error details: {response.text[:200]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")

def test_monthly_comparisons():
    """Test comparing current vs previous month"""
    print("\n" + "="*80)
    print("📊 MONTHLY COMPARISON TEST")
    print("="*80)
    
    comparison_data = {}
    months = ['current', 'previous']
    
    for month in months:
        print(f"\n📅 Getting data for {month} month...")
        
        params = {"user": TEST_EMAIL, "month": month, "limit": 200}
        
        try:
            response = requests.get(MONTHLY_SCREENSHOTS_URL, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    comparison_data[month] = {
                        "month_name": data.get('data', {}).get('month_info', {}).get('month_name'),
                        "total_screenshots": data.get('data', {}).get('summary', {}).get('total_screenshots', 0),
                        "average_per_day": data.get('data', {}).get('summary', {}).get('average_per_day', 0),
                        "daily_breakdown": data.get('data', {}).get('summary', {}).get('daily_breakdown', {}),
                        "status_breakdown": data.get('data', {}).get('summary', {}).get('status_breakdown', {})
                    }
                    print(f"✅ {month.title()} month data collected")
                else:
                    print(f"❌ Failed to get {month} month data")
            else:
                print(f"❌ HTTP error for {month} month: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error getting {month} month data: {e}")
    
    # Compare the data
    if len(comparison_data) == 2:
        print(f"\n📊 COMPARISON RESULTS:")
        print("-" * 60)
        
        current = comparison_data.get('current', {})
        previous = comparison_data.get('previous', {})
        
        print(f"📅 Current Month: {current.get('month_name', 'Unknown')}")
        print(f"   📸 Total Screenshots: {current.get('total_screenshots', 0)}")
        print(f"   📈 Average per Day: {current.get('average_per_day', 0)}")
        
        print(f"\n📅 Previous Month: {previous.get('month_name', 'Unknown')}")
        print(f"   📸 Total Screenshots: {previous.get('total_screenshots', 0)}")
        print(f"   📈 Average per Day: {previous.get('average_per_day', 0)}")
        
        # Calculate difference
        current_total = current.get('total_screenshots', 0)
        previous_total = previous.get('total_screenshots', 0)
        
        if previous_total > 0:
            percentage_change = ((current_total - previous_total) / previous_total) * 100
            print(f"\n📈 Month-over-Month Change:")
            print(f"   📸 Screenshots: {current_total - previous_total:+d} ({percentage_change:+.1f}%)")
            
            if percentage_change > 0:
                print(f"   🟢 Activity increased this month!")
            elif percentage_change < 0:
                print(f"   🔴 Activity decreased this month")
            else:
                print(f"   🟡 Activity remained the same")
        
        # Status comparison
        current_status = current.get('status_breakdown', {})
        previous_status = previous.get('status_breakdown', {})
        
        if current_status and previous_status:
            print(f"\n📊 Status Breakdown Comparison:")
            for status in ['online', 'idle', 'offline']:
                current_count = current_status.get(status, 0)
                previous_count = previous_status.get(status, 0)
                change = current_count - previous_count
                print(f"   {status.title()}: {current_count} (was {previous_count}, {change:+d})")

def show_monthly_api_examples():
    """Show examples for testing the monthly API"""
    print("\n" + "="*80)
    print("📮 MONTHLY API EXAMPLES FOR POSTMAN/BROWSER")
    print("="*80)
    
    current_month = datetime.now().strftime("%Y-%m")
    previous_month = (datetime.now().replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
    
    examples = [
        {
            "title": "Current Month Screenshots",
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_EMAIL}&month=current&limit=50",
            "description": "Get all screenshots for the current month"
        },
        {
            "title": "Previous Month Screenshots", 
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_EMAIL}&month=previous&limit=50",
            "description": "Get all screenshots for the previous month"
        },
        {
            "title": "Specific Month (June 2025)",
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_EMAIL}&month=2025-06&limit=100",
            "description": "Get all screenshots for June 2025"
        },
        {
            "title": "Current Month by Name",
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_NAME}&month=current&limit=30",
            "description": "Search by name for current month"
        },
        {
            "title": "Previous Month with Status Filter",
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_EMAIL}&month=previous&status=Online&limit=50",
            "description": "Get only 'Online' status screenshots for previous month"
        },
        {
            "title": "Current Month with Pagination",
            "url": f"{MONTHLY_SCREENSHOTS_URL}?user={TEST_EMAIL}&month=current&limit=20&page=2",
            "description": "Get current month screenshots with pagination"
        }
    ]
    
    for example in examples:
        print(f"\n📋 {example['title']}")
        print(f"   📄 Description: {example['description']}")
        print(f"   🔗 URL: {example['url']}")
        print("-" * 60)

def main():
    print("🚀 MONTHLY SCREENSHOTS API COMPREHENSIVE TEST")
    print(f"📅 Current Date: {datetime.now().strftime('%Y-%m-%d')}")
    print(f"📅 Current Month: {datetime.now().strftime('%B %Y')}")
    print(f"📅 Previous Month: {(datetime.now().replace(day=1) - timedelta(days=1)).strftime('%B %Y')}")
    
    # Test monthly functionality
    test_monthly_screenshots()
    
    # Test monthly comparisons
    test_monthly_comparisons()
    
    # Show API examples
    show_monthly_api_examples()
    
    print("\n" + "="*80)
    print("🏁 MONTHLY SCREENSHOTS API TESTS COMPLETED!")
    print("="*80)
    print("\n💡 Key Features Tested:")
    print("   ✅ Current month screenshots")
    print("   ✅ Previous month screenshots") 
    print("   ✅ Specific month screenshots (YYYY-MM format)")
    print("   ✅ Monthly statistics and daily breakdown")
    print("   ✅ Month-over-month comparison")
    print("   ✅ Status filtering for monthly data")
    print("   ✅ Name-based and email-based search")
    print("\n🎯 Perfect for your date navigation interface!")

if __name__ == "__main__":
    main()
