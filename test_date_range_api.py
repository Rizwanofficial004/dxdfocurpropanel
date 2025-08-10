#!/usr/bin/env python3
"""
Test script for Screenshots by Date Range API
Tests date range filtering with start_date and end_date parameters
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/auth/login/"
SCREENSHOTS_DATE_RANGE_URL = f"{BASE_URL}/api/screenshots/date-range/"

# Test with your specific email
TEST_EMAIL = "haseebcodejourney@gmail.com"
TEST_NAME = "Haseeb"

def test_date_range_api():
    print("="*80)
    print("📅 TESTING SCREENSHOTS BY DATE RANGE API")
    print("="*80)
    
    # Test different date range scenarios
    test_scenarios = [
        {
            "name": "Single Day Range",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-22",
                "end_date": "2025-06-22",
                "limit": 10
            }
        },
        {
            "name": "One Week Range (June 22-28, 2025)",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-22",
                "end_date": "2025-06-28",
                "limit": 20
            }
        },
        {
            "name": "One Month Range (June 2025)",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-01",
                "end_date": "2025-06-30",
                "limit": 50
            }
        },
        {
            "name": "Custom Range (Based on your screenshot: 06/06/2024 – 01/01/2025)",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2024-06-06",
                "end_date": "2025-01-01",
                "limit": 100
            }
        },
        {
            "name": "Recent 7 Days",
            "params": {
                "user": TEST_EMAIL,
                "start_date": (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "limit": 30
            }
        },
        {
            "name": "By Name with Date Range",
            "params": {
                "user": "Haseeb",
                "start_date": "2025-06-20",
                "end_date": "2025-06-25",
                "limit": 15
            }
        },
        {
            "name": "With Status Filter",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-22",
                "end_date": "2025-06-25",
                "status": "Online",
                "limit": 10
            }
        }
    ]
    
    for scenario in test_scenarios:
        print(f"\n🧪 Scenario: {scenario['name']}")
        print(f"   📋 Parameters: {scenario['params']}")
        print("-" * 70)
        
        try:
            response = requests.get(SCREENSHOTS_DATE_RANGE_URL, params=scenario['params'])
            
            print(f"   📊 Status Code: {response.status_code}")
            print(f"   🔗 URL: {response.url}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    
                    if data.get('success'):
                        user_info = data.get('data', {}).get('user_info', {})
                        date_range_info = data.get('data', {}).get('date_range_info', {})
                        screenshots = data.get('data', {}).get('screenshots', [])
                        summary = data.get('data', {}).get('summary', {})
                        pagination = data.get('data', {}).get('pagination', {})
                        
                        print(f"   ✅ SUCCESS!")
                        print(f"   👤 User: {user_info.get('display_name')} ({user_info.get('email')})")
                        print(f"   🔍 Search method: {date_range_info.get('search_method')}")
                        print(f"   📅 Date range: {date_range_info.get('start_date')} to {date_range_info.get('end_date')}")
                        print(f"   📊 Total days: {date_range_info.get('total_days')}")
                        print(f"   📸 Screenshots found: {len(screenshots)} (Total: {summary.get('total_screenshots', 0)})")
                        print(f"   📈 Average per day: {summary.get('average_per_day', 0)}")
                        
                        # Show date distribution
                        date_distribution = date_range_info.get('date_distribution', {})
                        if date_distribution:
                            print(f"   📊 Date distribution:")
                            for date, count in sorted(date_distribution.items()):
                                print(f"      {date}: {count} screenshots")
                        
                        # Show status breakdown
                        status_breakdown = summary.get('status_breakdown', {})
                        print(f"   📋 Status breakdown: Online: {status_breakdown.get('online', 0)}, "
                              f"Idle: {status_breakdown.get('idle', 0)}, Offline: {status_breakdown.get('offline', 0)}")
                        
                        # Show pagination info
                        print(f"   📄 Pagination: Page {pagination.get('current_page', 1)} of {pagination.get('total_pages', 1)}")
                        
                        # Show sample screenshots
                        if screenshots:
                            print(f"   📷 Sample screenshots:")
                            for i, screenshot in enumerate(screenshots[:3]):
                                print(f"      {i+1}. {screenshot.get('filename', 'Unknown')}")
                                print(f"         📅 Date: {screenshot.get('query_date', 'Unknown')}")
                                print(f"         ⏰ Time: {screenshot.get('time_display', 'Unknown')}")
                                print(f"         💾 Size: {screenshot.get('file_size', 0)} bytes")
                                print(f"         📁 Status: {screenshot.get('status', 'Unknown')}")
                        
                    else:
                        print(f"   ❌ API Error: {data.get('message', 'Unknown error')}")
                        error_data = data.get('data', {})
                        if error_data:
                            print(f"   📄 Error details: {error_data}")
                            
                except json.JSONDecodeError:
                    print(f"   ❌ Invalid JSON response")
                    print(f"   📄 Raw response: {response.text[:500]}...")
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                print(f"   📄 Response: {response.text[:300]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")

def test_error_scenarios():
    """Test various error scenarios"""
    print("\n" + "="*80)
    print("❌ TESTING ERROR SCENARIOS")
    print("="*80)
    
    error_scenarios = [
        {
            "name": "Missing user parameter",
            "params": {
                "start_date": "2025-06-22",
                "end_date": "2025-06-25"
            }
        },
        {
            "name": "Missing start_date",
            "params": {
                "user": TEST_EMAIL,
                "end_date": "2025-06-25"
            }
        },
        {
            "name": "Missing end_date",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-22"
            }
        },
        {
            "name": "Invalid date format",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "22-06-2025",
                "end_date": "25-06-2025"
            }
        },
        {
            "name": "Start date after end date",
            "params": {
                "user": TEST_EMAIL,
                "start_date": "2025-06-25",
                "end_date": "2025-06-22"
            }
        },
        {
            "name": "Non-existent user",
            "params": {
                "user": "nonexistentuser@example.com",
                "start_date": "2025-06-22",
                "end_date": "2025-06-25"
            }
        }
    ]
    
    for scenario in error_scenarios:
        print(f"\n🔍 Error Test: {scenario['name']}")
        print(f"   📋 Parameters: {scenario['params']}")
        print("-" * 50)
        
        try:
            response = requests.get(SCREENSHOTS_DATE_RANGE_URL, params=scenario['params'])
            
            print(f"   📊 Status Code: {response.status_code}")
            
            if response.headers.get('content-type', '').startswith('application/json'):
                data = response.json()
                print(f"   💬 Message: {data.get('message', 'No message')}")
                
                if not data.get('success'):
                    print(f"   ✅ Error handled correctly")
                else:
                    print(f"   ⚠️  Expected error but got success")
            else:
                print(f"   ❌ Non-JSON response: {response.text[:200]}...")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

def show_postman_examples():
    """Show Postman examples for the new date range API"""
    print("\n" + "="*80)
    print("📮 POSTMAN EXAMPLES - DATE RANGE API")
    print("="*80)
    
    examples = [
        {
            "title": "Basic Date Range (One Week)",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/date-range/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "start_date": "2025-06-22",
                "end_date": "2025-06-28",
                "limit": 20
            }
        },
        {
            "title": "Monthly Range (June 2025)",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/date-range/",
            "params": {
                "user": "Haseeb",
                "start_date": "2025-06-01",
                "end_date": "2025-06-30",
                "limit": 50
            }
        },
        {
            "title": "Custom Range with Status Filter",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/date-range/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "start_date": "2024-06-06",
                "end_date": "2025-01-01",
                "status": "Online",
                "limit": 100
            }
        },
        {
            "title": "Recent 30 Days",
            "method": "GET",
            "url": f"{BASE_URL}/api/screenshots/date-range/",
            "params": {
                "user": "haseebcodejourney@gmail.com",
                "start_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
                "end_date": datetime.now().strftime("%Y-%m-%d"),
                "limit": 50
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
        
        print(f"\nCurl Command:")
        print(f'  curl -X GET "{full_url}"')

def main():
    print("🚀 SCREENSHOTS BY DATE RANGE API - COMPREHENSIVE TEST")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📧 Test Email: {TEST_EMAIL}")
    print(f"👤 Test Name: {TEST_NAME}")
    print(f"🕐 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test successful scenarios
    test_date_range_api()
    
    # Test error scenarios
    test_error_scenarios()
    
    # Show Postman examples
    show_postman_examples()
    
    print("\n" + "="*80)
    print("🏁 DATE RANGE API TESTS COMPLETED!")
    print("="*80)
    print("\n💡 New API Features:")
    print("   ✅ Date range filtering (start_date to end_date)")
    print("   ✅ Multi-day screenshot aggregation")
    print("   ✅ Date distribution analytics")
    print("   ✅ Average screenshots per day calculation")
    print("   ✅ Enhanced error handling for date validation")
    print("   ✅ Compatible with all user search methods (email, username, name)")
    print("   ✅ Status and task type filtering")
    print("   ✅ Comprehensive pagination and metadata")
    print("\n📮 Use the Postman examples above to test the new date range API!")

if __name__ == "__main__":
    main()
