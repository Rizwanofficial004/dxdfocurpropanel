#!/usr/bin/env python3
"""
Enhanced Live Tracking API Test Script
Tests the live tracking endpoints with new filtering capabilities:
- Name filtering
- Date range filtering (today, week, month, 3months)
- Combined filters
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
API_BASE = f"{BASE_URL}/api"

def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{'='*70}")
    print(f"Testing: {test_name}")
    print(f"{'='*70}")

def print_response_summary(response):
    """Print response summary"""
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            if 'data' in data and 'live_tracking' in data['data']:
                tracking = data['data']['live_tracking']
                summary = tracking.get('summary', {})
                filters = data['data'].get('filters_applied', {})
                
                print(f"✅ Success: {data.get('message')}")
                print(f"📊 Results Summary:")
                print(f"   - Total Employees: {summary.get('total_employees', 0)}")
                print(f"   - Active Employees: {summary.get('active_employees', 0)}")
                print(f"   - Date Range: {summary.get('date_range', 'All Time')}")
                print(f"   - Total Screenshots: {summary.get('total_screenshots', 0)}")
                print(f"   - Total Working Time: {summary.get('total_working_hours', '0h 0m')}")
                
                print(f"🔍 Filters Applied:")
                print(f"   - Name: '{filters.get('name', 'None')}'")
                print(f"   - Status: '{filters.get('status', 'All')}'")
                print(f"   - Date Range: '{filters.get('date_range', 'All')}'")
                print(f"   - Limit: {filters.get('limit', 50)}")
                
                employees = tracking.get('employees', [])
                if employees:
                    print(f"👥 Employee Details:")
                    for i, emp in enumerate(employees[:3]):  # Show first 3
                        print(f"   {i+1}. {emp.get('name')} ({emp.get('email')})")
                        print(f"      Status: {emp.get('current_status')}")
                        print(f"      Task: {emp.get('current_task', {}).get('name')}")
                        print(f"      Working Time: {emp.get('time_info', {}).get('total_working_time')}")
                        print(f"      Screenshots: {emp.get('time_info', {}).get('screenshots_in_range', 0)}")
                        print(f"      Has Preview: {emp.get('screenshot', {}).get('has_preview', False)}")
                    
                    if len(employees) > 3:
                        print(f"   ... and {len(employees) - 3} more employees")
            else:
                print(json.dumps(data, indent=2))
        except Exception as e:
            print(f"Response Text: {response.text[:500]}")
            print(f"JSON Parse Error: {e}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    
    print("-" * 70)

def test_basic_live_tracking():
    """Test basic live tracking without filters"""
    print_test_header("Basic Live Tracking API")
    
    response = requests.get(f"{API_BASE}/live-tracking/")
    print_response_summary(response)
    return response.status_code == 200

def test_name_filtering():
    """Test name filtering"""
    print_test_header("Name Filtering Tests")
    
    test_names = ["amir", "deniz", "developer", "atakan"]
    
    for name in test_names:
        print(f"\n🔍 Testing name filter: '{name}'")
        response = requests.get(f"{API_BASE}/live-tracking/?name={name}")
        print_response_summary(response)

def test_date_range_filtering():
    """Test date range filtering"""
    print_test_header("Date Range Filtering Tests")
    
    date_ranges = ["today", "week", "month", "3months"]
    
    for date_range in date_ranges:
        print(f"\n📅 Testing date range: '{date_range}'")
        response = requests.get(f"{API_BASE}/live-tracking/?date_range={date_range}")
        print_response_summary(response)

def test_status_filtering():
    """Test status filtering"""
    print_test_header("Status Filtering Tests")
    
    statuses = ["Online", "Idle", "Offline"]
    
    for status in statuses:
        print(f"\n🟢 Testing status filter: '{status}'")
        response = requests.get(f"{API_BASE}/live-tracking/?status={status}")
        print_response_summary(response)

def test_combined_filters():
    """Test combined filtering"""
    print_test_header("Combined Filters Tests")
    
    filter_combinations = [
        {"name": "amir", "date_range": "today"},
        {"name": "deniz", "status": "Online"},
        {"date_range": "week", "status": "Online"},
        {"name": "developer", "date_range": "month", "status": "Online", "limit": "5"},
        {"date_range": "today", "status": "Online", "limit": "10"},
    ]
    
    for i, filters in enumerate(filter_combinations, 1):
        filter_str = "&".join([f"{k}={v}" for k, v in filters.items()])
        print(f"\n🔗 Test {i}: Combined filters - {filter_str}")
        response = requests.get(f"{API_BASE}/live-tracking/?{filter_str}")
        print_response_summary(response)

def test_edge_cases():
    """Test edge cases and error handling"""
    print_test_header("Edge Cases and Error Handling")
    
    edge_cases = [
        ("Empty name", "name="),
        ("Invalid date range", "date_range=invalid"),
        ("Invalid status", "status=InvalidStatus"),
        ("Zero limit", "limit=0"),
        ("Negative limit", "limit=-1"),
        ("Very large limit", "limit=10000"),
        ("Special characters in name", "name=@#$%"),
    ]
    
    for description, query in edge_cases:
        print(f"\n⚠️  Testing: {description}")
        response = requests.get(f"{API_BASE}/live-tracking/?{query}")
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text[:100]}")
        else:
            data = response.json()
            employees = data.get('data', {}).get('live_tracking', {}).get('employees', [])
            print(f"Employees returned: {len(employees)}")

def test_performance():
    """Test API performance"""
    print_test_header("Performance Testing")
    
    import time
    
    test_urls = [
        f"{API_BASE}/live-tracking/",
        f"{API_BASE}/live-tracking/?date_range=today",
        f"{API_BASE}/live-tracking/?name=amir&date_range=week",
        f"{API_BASE}/live-tracking/?status=Online&limit=50",
    ]
    
    for url in test_urls:
        start_time = time.time()
        response = requests.get(url)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        print(f"URL: {url.replace(API_BASE, '')}")
        print(f"Response Time: {response_time:.2f}ms")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            employees = len(data.get('data', {}).get('live_tracking', {}).get('employees', []))
            print(f"Employees: {employees}")
        
        print("-" * 40)

def main():
    """Main test function"""
    print("🚀 Enhanced Live Tracking API Test Suite")
    print(f"Testing API endpoints at: {API_BASE}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test basic functionality
    success = test_basic_live_tracking()
    
    if not success:
        print("❌ Basic API test failed. Stopping tests.")
        return
    
    # Test individual filter types
    test_name_filtering()
    test_date_range_filtering() 
    test_status_filtering()
    
    # Test combined filters
    test_combined_filters()
    
    # Test edge cases
    test_edge_cases()
    
    # Test performance
    test_performance()
    
    print(f"\n{'='*70}")
    print("🎉 Enhanced Live Tracking API Test Suite Completed")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}")
    
    print("\n📝 Summary of New Features:")
    print("✅ Name filtering - Filter employees by name/email")
    print("✅ Date range filtering - today, week, month, 3months")
    print("✅ Combined filtering - Multiple filters at once")
    print("✅ Enhanced response data - Screenshots count, time ranges")
    print("✅ Error handling - Graceful handling of invalid inputs")

if __name__ == "__main__":
    main()
