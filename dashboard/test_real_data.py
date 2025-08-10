#!/usr/bin/env python3
"""
Test the updated employee APIs with real data from backend and S3
"""

import requests
import json

def test_endpoint(url, description):
    print(f"🔍 Testing: {url}")
    print(f"📝 {description}")
    print("-" * 80)
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            
            if 'data' in data:
                response_data = data['data']
                
                # For employee-cards endpoint
                if 'employee_cards' in response_data:
                    cards = response_data['employee_cards']
                    print(f"👥 Employee Cards Found: {len(cards)}")
                    
                    for i, employee in enumerate(cards):
                        print(f"\n👤 Employee {i+1}:")
                        print(f"   Name: {employee.get('name', 'N/A')}")
                        print(f"   Email: {employee.get('email', 'N/A')}")
                        print(f"   Status: {employee.get('status', 'N/A')}")
                        print(f"   Screenshots: {employee.get('productivity', {}).get('screenshots_count', 'N/A')}")
                        print(f"   Working Time: {employee.get('time_info', {}).get('working_time', 'N/A')}")
                        print(f"   Has Screenshot: {employee.get('screenshot', {}).get('has_screenshot', 'N/A')}")
                        if employee.get('screenshot', {}).get('has_screenshot'):
                            screenshot_url = employee.get('screenshot', {}).get('url', '')
                            print(f"   Screenshot URL: {screenshot_url[:100]}..." if len(screenshot_url) > 100 else screenshot_url)
                
                # For all-employees endpoint  
                elif 'employees' in response_data:
                    employees = response_data['employees']
                    print(f"👥 Employees Found: {len(employees)}")
                    
                    for i, employee in enumerate(employees):
                        print(f"\n👤 Employee {i+1}:")
                        print(f"   Name: {employee.get('name', 'N/A')}")
                        print(f"   Email: {employee.get('email', 'N/A')}")
                        print(f"   Status: {employee.get('status', 'N/A')}")
                        stats = employee.get('statistics', {})
                        print(f"   Total Screenshots: {stats.get('total_screenshots', 'N/A')}")
                        print(f"   Total Working Time: {stats.get('total_working_time', 'N/A')}")
                        screenshot_info = employee.get('latest_screenshot', {})
                        print(f"   Latest Screenshot: {screenshot_info.get('has_screenshot', 'N/A')}")
                        
                # Check summary
                if 'summary' in response_data:
                    summary = response_data['summary']
                    print(f"\n📊 Summary:")
                    print(f"   Total Found: {summary.get('total_employees_found', 'N/A')}")
                    if 'total_screenshots' in summary:
                        print(f"   Total Screenshots: {summary.get('total_screenshots', 'N/A')}")
                    if 'total_screenshots_all_employees' in summary:
                        print(f"   Total Screenshots (All): {summary.get('total_screenshots_all_employees', 'N/A')}")
                    
                    status_breakdown = summary.get('status_breakdown', {})
                    print(f"   Online: {status_breakdown.get('online', 'N/A')}")
                    print(f"   Idle: {status_breakdown.get('idle', 'N/A')}")
                    print(f"   Offline: {status_breakdown.get('offline', 'N/A')}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("=" * 80)
    print()

def main():
    print("🚀 Testing Updated Employee APIs with Real Backend Data")
    print("=" * 80)
    
    # Test the improved employee-cards API without filters (should show all)
    test_endpoint(
        "https://dxdtime.ddsolutions.io/api/employee-cards/",
        "Employee Cards - No filters (should show all screenshots)"
    )
    
    # Test with employee_filter=all (explicit all)
    test_endpoint(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?employee_filter=all",
        "Employee Cards - Explicit employee_filter=all"
    )
    
    # Test the new all-employees endpoint
    test_endpoint(
        "https://dxdtime.ddsolutions.io/api/all-employees/",
        "All Employees - Complete data without any filtering"
    )
    
    # Test with search
    test_endpoint(
        "https://dxdtime.ddsolutions.io/api/all-employees/?search_name=amir",
        "All Employees - Search for 'amir'"
    )
    
    # Test employee cards with month filter (as requested)
    test_endpoint(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?employee_filter=all&date_range=month",
        "Employee Cards - Month filter as originally requested"
    )

if __name__ == "__main__":
    main()
