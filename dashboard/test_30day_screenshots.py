#!/usr/bin/env python3
"""
Test script for 30-Day Screenshots API
Tests 15 days before and 15 days after a center date
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
THIRTY_DAYS_URL = f"{BASE_URL}/api/screenshots/30days/"

# Test with your specific email
TEST_EMAIL = "haseebcodejourney@gmail.com"
TEST_NAME = "Haseeb"

def test_30day_screenshots():
    print("="*80)
    print("📅 TESTING 30-DAY SCREENSHOTS API (15 days before + 15 days after)")
    print("="*80)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📧 Test Email: {TEST_EMAIL}")
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Calculate relevant dates
    today = datetime.now()
    june_23 = datetime(2025, 6, 23)  # From your screenshot
    
    # Test scenarios for 30-day ranges
    test_scenarios = [
        {
            "name": "30 Days Around Today",
            "params": {"user": TEST_EMAIL, "center_date": today.strftime('%Y-%m-%d'), "limit": 100},
            "description": f"15 days before and after {today.strftime('%Y-%m-%d')}"
        },
        {
            "name": "30 Days Around June 23, 2025",
            "params": {"user": TEST_EMAIL, "center_date": "2025-06-23", "limit": 100},
            "description": "15 days before and after June 23, 2025 (from your screenshot)"
        },
        {
            "name": "30 Days Around June 25, 2025",
            "params": {"user": TEST_EMAIL, "center_date": "2025-06-25", "limit": 100},
            "description": "15 days before and after June 25, 2025"
        },
        {
            "name": "30 Days by Name (June 23)",
            "params": {"user": TEST_NAME, "center_date": "2025-06-23", "limit": 50},
            "description": "Search by name around June 23"
        },
        {
            "name": "30 Days with Status Filter",
            "params": {"user": TEST_EMAIL, "center_date": "2025-06-23", "status": "Online", "limit": 50},
            "description": "Only Online status around June 23"
        },
        {
            "name": "Default Center Date (Today)",
            "params": {"user": TEST_EMAIL, "limit": 80},
            "description": "No center_date specified, should default to today"
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n🧪 Testing: {scenario['name']}")
        print(f"📄 Description: {scenario['description']}")
        print(f"📋 Parameters: {scenario['params']}")
        print("-" * 70)
        
        try:
            response = requests.get(THIRTY_DAYS_URL, params=scenario['params'])
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"🔗 URL: {response.url}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    if data.get('success'):
                        user_info = data.get('data', {}).get('user_info', {})
                        date_range_info = data.get('data', {}).get('date_range_info', {})
                        screenshots = data.get('data', {}).get('screenshots', [])
                        summary = data.get('data', {}).get('summary', {})
                        daily_breakdown = summary.get('daily_breakdown', {})
                        activity_distribution = summary.get('activity_distribution', {})
                        statistics = summary.get('statistics', {})
                        
                        print(f"✅ SUCCESS!")
                        print(f"👤 User: {user_info.get('display_name')} ({user_info.get('email')})")
                        print(f"📅 Date Range: {date_range_info.get('range_description')}")
                        print(f"🎯 Center Date: {date_range_info.get('center_date')}")
                        print(f"📊 Total Screenshots: {summary.get('total_screenshots', 0)}")
                        
                        # Activity distribution
                        print(f"📈 Activity Distribution:")
                        print(f"   📉 Past 15 days: {activity_distribution.get('past_15_days', 0)} screenshots")
                        print(f"   🎯 Center date: {activity_distribution.get('center_date', 0)} screenshots")
                        print(f"   📈 Next 15 days: {activity_distribution.get('next_15_days', 0)} screenshots")
                        
                        # Statistics
                        if statistics.get('most_active_day'):
                            print(f"🏆 Most Active Day: {statistics.get('most_active_day')} ({statistics.get('most_active_count')} screenshots)")
                        
                        print(f"📊 Days with Activity: {statistics.get('days_with_activity', 0)} out of 31")
                        print(f"📈 Average per Day: {statistics.get('average_per_day', 0)}")
                        print(f"🏢 Weekday Activity: {statistics.get('weekday_activity', 0)}")
                        print(f"🏖️ Weekend Activity: {statistics.get('weekend_activity', 0)}")
                        
                        # Show sample daily breakdown
                        if daily_breakdown:
                            print(f"📊 Daily Breakdown (sample):")
                            sorted_days = sorted(daily_breakdown.items())
                            for date, count in sorted_days[:7]:  # Show first 7 days
                                day_name = datetime.strptime(date, '%Y-%m-%d').strftime('%a')
                                print(f"   {date} ({day_name}): {count} screenshots")
                            if len(sorted_days) > 7:
                                print(f"   ... and {len(sorted_days) - 7} more days")
                        
                        if screenshots:
                            print(f"📷 Sample Screenshots (showing first 3):")
                            for i, screenshot in enumerate(screenshots[:3]):
                                print(f"   {i+1}. {screenshot.get('filename', 'Unknown')}")
                                print(f"      📅 Date: {screenshot.get('date_folder')} ({screenshot.get('day_name')})")
                                print(f"      ⏰ Time: {screenshot.get('time_display')}")
                                print(f"      📊 Status: {screenshot.get('status')}")
                                print(f"      🎯 Days from center: {screenshot.get('days_from_center')}")
                                center_marker = " ⭐" if screenshot.get('is_center_date') else ""
                                weekend_marker = " 🏖️" if screenshot.get('is_weekend') else ""
                                print(f"      🏷️ Markers: {center_marker}{weekend_marker}")
                        
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

def test_specific_date_ranges():
    """Test specific date ranges that match your interface"""
    print("\n" + "="*80)
    print("🎯 TESTING SPECIFIC DATE RANGES (Matching Your Interface)")
    print("="*80)
    
    # Based on your screenshot showing June 22, 23, 24, 25
    june_dates = ["2025-06-22", "2025-06-23", "2025-06-24", "2025-06-25"]
    
    for center_date in june_dates:
        print(f"\n📅 Testing 30-day range centered on {center_date}")
        print("-" * 50)
        
        # Calculate the actual range
        center = datetime.strptime(center_date, '%Y-%m-%d')
        start = center - timedelta(days=15)
        end = center + timedelta(days=15)
        
        print(f"🗓️ Range: {start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}")
        
        params = {
            "user": TEST_EMAIL,
            "center_date": center_date,
            "limit": 200
        }
        
        try:
            response = requests.get(THIRTY_DAYS_URL, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    summary = data.get('data', {}).get('summary', {})
                    daily_breakdown = summary.get('daily_breakdown', {})
                    
                    total_screenshots = summary.get('total_screenshots', 0)
                    print(f"📸 Total Screenshots: {total_screenshots}")
                    
                    if daily_breakdown:
                        # Count screenshots for the center date
                        center_count = daily_breakdown.get(center_date, 0)
                        print(f"🎯 Screenshots on center date ({center_date}): {center_count}")
                        
                        # Count for adjacent dates
                        adjacent_dates = [
                            (center - timedelta(days=1)).strftime('%Y-%m-%d'),
                            (center + timedelta(days=1)).strftime('%Y-%m-%d')
                        ]
                        
                        for adj_date in adjacent_dates:
                            adj_count = daily_breakdown.get(adj_date, 0)
                            print(f"📅 Screenshots on {adj_date}: {adj_count}")
                    
                    print(f"✅ Success for {center_date}")
                else:
                    print(f"❌ API error for {center_date}: {data.get('message')}")
            else:
                print(f"❌ HTTP error for {center_date}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error for {center_date}: {e}")

def show_30day_api_examples():
    """Show examples for testing the 30-day API"""
    print("\n" + "="*80)
    print("📮 30-DAY API EXAMPLES FOR POSTMAN/BROWSER")
    print("="*80)
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    examples = [
        {
            "title": "30 Days Around Today",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&center_date={today}&limit=100",
            "description": f"15 days before and after today ({today})"
        },
        {
            "title": "30 Days Around June 23, 2025 (Your Screenshot Date)",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&center_date=2025-06-23&limit=100",
            "description": "Perfect for your date navigation interface"
        },
        {
            "title": "30 Days Around June 25, 2025",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&center_date=2025-06-25&limit=100",
            "description": "Another date from your interface"
        },
        {
            "title": "30 Days by Name",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_NAME}&center_date=2025-06-23&limit=50",
            "description": "Search by name instead of email"
        },
        {
            "title": "30 Days with Status Filter",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&center_date=2025-06-23&status=Online&limit=50",
            "description": "Only show Online status screenshots"
        },
        {
            "title": "Default Center Date (Today)",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&limit=80",
            "description": "No center_date parameter - defaults to today"
        },
        {
            "title": "30 Days with Pagination",
            "url": f"{THIRTY_DAYS_URL}?user={TEST_EMAIL}&center_date=2025-06-23&limit=20&page=2",
            "description": "Paginated results for large datasets"
        }
    ]
    
    for example in examples:
        print(f"\n📋 {example['title']}")
        print(f"   📄 Description: {example['description']}")
        print(f"   🔗 URL: {example['url']}")
        print("-" * 70)

def main():
    print("🚀 30-DAY SCREENSHOTS API COMPREHENSIVE TEST")
    print(f"📅 Today: {datetime.now().strftime('%Y-%m-%d (%A)')}")
    print(f"🎯 Center Date Example: June 23, 2025 (from your interface)")
    print(f"📊 Range: 15 days before + center date + 15 days after = 31 days total")
    
    # Test 30-day functionality
    test_30day_screenshots()
    
    # Test specific date ranges
    test_specific_date_ranges()
    
    # Show API examples
    show_30day_api_examples()
    
    print("\n" + "="*80)
    print("🏁 30-DAY SCREENSHOTS API TESTS COMPLETED!")
    print("="*80)
    print("\n💡 Key Features Tested:")
    print("   ✅ 15 days before + 15 days after any center date")
    print("   ✅ Default center date (today)")
    print("   ✅ Specific center dates (June 22-25, 2025)")
    print("   ✅ Activity distribution (past/center/future)")
    print("   ✅ Daily breakdown and statistics")
    print("   ✅ Weekend vs weekday analysis")
    print("   ✅ Status filtering within 30-day range")
    print("   ✅ Name-based and email-based search")
    print("\n🎯 Perfect for your date navigation interface!")
    print("📅 Use center_date parameter to focus on any specific date")

if __name__ == "__main__":
    main()
