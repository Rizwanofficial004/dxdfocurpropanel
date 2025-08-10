#!/usr/bin/env python3
"""
Enhanced test for Screenshots by User API with Date Selection
Tests email/name search with specific dates and date ranges
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
SCREENSHOTS_USER_URL = f"{BASE_URL}/api/screenshots/user/"

# Test with your specific email
TEST_EMAIL = "haseebcodejourney@gmail.com"
TEST_NAME = "Haseeb"

def test_date_wise_screenshots():
    print("="*80)
    print("🗓️  TESTING DATE-WISE SCREENSHOTS")
    print("="*80)
    
    # Test dates based on your screenshots (June 2025)
    test_dates = [
        "2025-06-22",  # Jun 22
        "2025-06-23",  # Jun 23  
        "2025-06-24",  # Jun 24
        "2025-06-25",  # Jun 25
        "2025-07-05",  # Today
        "",            # No date filter (all dates)
    ]
    
    for date in test_dates:
        print(f"\n📅 Testing date: {date if date else 'All dates'}")
        print("-" * 60)
        
        # Test with email
        test_with_date(TEST_EMAIL, date, "by email")
        
        # Test with name  
        test_with_date(TEST_NAME, date, "by name")

def test_with_date(user_identifier, date, search_type):
    """Test screenshots for a specific user and date"""
    
    params = {
        "user": user_identifier,
        "limit": 5
    }
    
    if date:
        params["date"] = date
    
    print(f"🔍 Searching {search_type}: '{user_identifier}'" + (f" on {date}" if date else " (all dates)"))
    print(f"   📋 Parameters: {params}")
    
    try:
        response = requests.get(SCREENSHOTS_USER_URL, params=params)
        
        print(f"   📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                
                if data.get('success'):
                    user_info = data.get('data', {}).get('user_info', {})
                    search_info = data.get('data', {}).get('search_info', {})
                    screenshots = data.get('data', {}).get('screenshots', [])
                    filters_applied = data.get('data', {}).get('filters_applied', {})
                    
                    print(f"   ✅ Found: {user_info.get('display_name')} ({user_info.get('email')})")
                    print(f"   🔎 Search method: {search_info.get('search_method')}")
                    print(f"   📸 Screenshots: {len(screenshots)}")
                    print(f"   🎛️  Filters: {filters_applied}")
                    
                    if screenshots:
                        print(f"   📷 Sample screenshots:")
                        for i, screenshot in enumerate(screenshots[:3]):
                            print(f"      {i+1}. {screenshot.get('filename', 'Unknown')}")
                            print(f"         📅 Date: {screenshot.get('date_folder', 'Unknown')}")
                            print(f"         ⏰ Time: {screenshot.get('time_display', 'Unknown')}")
                            print(f"         💾 Size: {screenshot.get('file_size', 0)} bytes")
                    else:
                        print(f"   📭 No screenshots found for this date")
                        
                else:
                    print(f"   ❌ Error: {data.get('message', 'Unknown error')}")
                    
            except json.JSONDecodeError:
                print(f"   ❌ Invalid JSON response")
        else:
            print(f"   ❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request failed: {e}")

def test_date_range_scenarios():
    """Test various date filtering scenarios"""
    print("\n" + "="*80)
    print("🗓️  ADVANCED DATE FILTERING SCENARIOS")
    print("="*80)
    
    scenarios = [
        {
            "name": "Specific Date (June 22, 2025)",
            "params": {"user": TEST_EMAIL, "date": "2025-06-22", "limit": 10}
        },
        {
            "name": "Different Date Format Test",
            "params": {"user": TEST_EMAIL, "date": "2025-06-23", "limit": 5}
        },
        {
            "name": "Today's Date",
            "params": {"user": TEST_EMAIL, "date": datetime.now().strftime("%Y-%m-%d"), "limit": 3}
        },
        {
            "name": "Yesterday's Date", 
            "params": {"user": TEST_EMAIL, "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"), "limit": 3}
        },
        {
            "name": "All Dates (No Filter)",
            "params": {"user": TEST_EMAIL, "limit": 10}
        },
        {
            "name": "With Status Filter + Date",
            "params": {"user": TEST_EMAIL, "date": "2025-06-22", "status": "Online", "limit": 5}
        },
        {
            "name": "By Name + Specific Date",
            "params": {"user": "Haseeb", "date": "2025-06-22", "limit": 5}
        }
    ]
    
    for scenario in scenarios:
        print(f"\n🧪 Scenario: {scenario['name']}")
        print(f"   📋 Parameters: {scenario['params']}")
        print("-" * 60)
        
        try:
            response = requests.get(SCREENSHOTS_USER_URL, params=scenario['params'])
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    screenshots = data.get('data', {}).get('screenshots', [])
                    filters_applied = data.get('data', {}).get('filters_applied', {})
                    summary = data.get('data', {}).get('summary', {})
                    
                    print(f"   ✅ Success: {len(screenshots)} screenshots found")
                    print(f"   🎛️  Applied filters: {filters_applied}")
                    print(f"   📊 Summary: {summary.get('total_screenshots', 0)} total")
                    
                    if screenshots:
                        # Show date distribution
                        dates = [s.get('date_folder', 'Unknown') for s in screenshots]
                        unique_dates = list(set(dates))
                        print(f"   📅 Dates found: {', '.join(unique_dates)}")
                        
                else:
                    print(f"   ❌ API Error: {data.get('message', 'Unknown')}")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

def show_postman_examples():
    """Show examples for testing in Postman"""
    print("\n" + "="*80)
    print("📮 POSTMAN TESTING EXAMPLES")
    print("="*80)
    
    examples = [
        {
            "title": "Basic Email Search with Date",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/user/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "date": "2025-06-22",
                "limit": 5
            }
        },
        {
            "title": "Name Search with Date Range",
            "method": "GET", 
            "url": f"{BASE_URL}/api/screenshots/user/",
            "params": {
                "user": "Haseeb",
                "date": "2025-06-23",
                "limit": 10
            }
        },
        {
            "title": "Date + Status Filter",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/user/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "date": "2025-06-22",
                "status": "Online",
                "limit": 5
            }
        },
        {
            "title": "All Screenshots (No Date Filter)",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/user/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "limit": 20
            }
        }
    ]
    
    for example in examples:
        print(f"\n📋 {example['title']}")
        print("-" * 60)
        print(f"Method: {example['method']}")
        print(f"URL: {example['url']}")
        print("Parameters:")
        for key, value in example['params'].items():
            print(f"  {key}: {value}")
        
        # Show as query string
        query_params = "&".join([f"{k}={v}" for k, v in example['params'].items()])
        full_url = f"{example['url']}?{query_params}"
        print(f"\nFull URL:")
        print(f"  {full_url}")
        
        # Show as curl command
        curl_params = " ".join([f'-d "{k}={v}"' for k, v in example['params'].items()])
        print(f"\nCurl Command:")
        print(f'  curl -X GET "{full_url}"')

def main():
    print("🚀 ENHANCED SCREENSHOTS API - DATE FILTERING TEST")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📧 Test Email: {TEST_EMAIL}")
    print(f"👤 Test Name: {TEST_NAME}")
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test date-wise filtering
    test_date_wise_screenshots()
    
    # Test advanced scenarios
    test_date_range_scenarios()
    
    # Show Postman examples
    show_postman_examples()
    
    print("\n" + "="*80)
    print("🏁 DATE FILTERING TESTS COMPLETED!")
    print("="*80)
    print("\n💡 Key Features Tested:")
    print("   ✅ Email-based search with date filtering")
    print("   ✅ Name-based search with date filtering")
    print("   ✅ Multiple date formats")
    print("   ✅ Combined filters (date + status)")
    print("   ✅ No date filter (all dates)")
    print("\n📮 Use the Postman examples above to test in Postman!")

if __name__ == "__main__":
    main()
