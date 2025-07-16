#!/usr/bin/env python3
"""
Live Tracking API Test Script
Tests the live tracking endpoints to ensure they're working properly.
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"  # Adjust if your Django server runs on different host/port
API_BASE = f"{BASE_URL}/api"

# Test credentials (adjust these to match your Django user)
TEST_USERNAME = "admin"  # Replace with your Django username
TEST_PASSWORD = "admin"  # Replace with your Django password

def print_test_header(test_name):
    """Print a formatted test header"""
    print(f"\n{'='*60}")
    print(f"Testing: {test_name}")
    print(f"{'='*60}")

def print_response(response, show_full_data=False):
    """Print response in a readable format"""
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    try:
        data = response.json()
        print("Response Data:")
        if show_full_data:
            print(json.dumps(data, indent=2))
        else:
            # Show summary for large responses
            if 'data' in data and 'live_tracking' in data['data']:
                live_tracking = data['data']['live_tracking']
                print(f"  Success: {data.get('success')}")
                print(f"  Message: {data.get('message')}")
                print(f"  Total Employees: {live_tracking.get('summary', {}).get('total_employees', 0)}")
                print(f"  Active Employees: {live_tracking.get('summary', {}).get('active_employees', 0)}")
                print(f"  Status Breakdown: {live_tracking.get('summary', {}).get('status_breakdown', {})}")
                print(f"  Timestamp: {data.get('timestamp')}")
                
                employees = live_tracking.get('employees', [])
                if employees:
                    print(f"\n  First 3 Employees:")
                    for i, emp in enumerate(employees[:3]):
                        print(f"    {i+1}. {emp.get('name')} ({emp.get('email')})")
                        print(f"       Status: {emp.get('current_status')}")
                        print(f"       Task: {emp.get('current_task', {}).get('name')}")
                        print(f"       Working Time: {emp.get('time_info', {}).get('total_working_time')}")
                        print(f"       Has Screenshot: {emp.get('screenshot', {}).get('has_preview', False)}")
            else:
                print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Response Text: {response.text}")
        print(f"JSON Parse Error: {e}")
    print("-" * 60)

def login_and_get_session():
    """Login and return session for authenticated requests"""
    print_test_header("Authentication Setup")
    
    session = requests.Session()
    
    # Get CSRF token first
    csrf_response = session.get(f"{BASE_URL}/admin/login/")
    
    # Login
    login_data = {
        'username': TEST_USERNAME,
        'password': TEST_PASSWORD
    }
    
    login_response = session.post(
        f"{API_BASE}/auth/login/",
        json=login_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code == 200:
        print("✓ Login successful")
        return session
    else:
        print("✗ Login failed")
        print_response(login_response)
        return None

def test_live_tracking_api(session=None):
    """Test the main live tracking API"""
    print_test_header("Live Tracking API")
    
    try:
        if session:
            response = session.get(f"{API_BASE}/live-tracking/")
        else:
            response = requests.get(f"{API_BASE}/live-tracking/")
        
        print_response(response, show_full_data=False)
        
        if response.status_code == 200:
            print("✓ Live tracking API working")
            return True
        else:
            print("✗ Live tracking API failed")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_live_tracking_with_filters(session=None):
    """Test live tracking with various filters"""
    print_test_header("Live Tracking API with Filters")
    
    filters = [
        {"status": "Online"},
        {"status": "Idle"},
        {"status": "Offline"},
        {"limit": "5"},
        {"refresh": "true"},
        {"status": "Online", "limit": "3"}
    ]
    
    for filter_params in filters:
        print(f"\nTesting with filters: {filter_params}")
        try:
            if session:
                response = session.get(f"{API_BASE}/live-tracking/", params=filter_params)
            else:
                response = requests.get(f"{API_BASE}/live-tracking/", params=filter_params)
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if 'data' in data and 'live_tracking' in data['data']:
                    employees = data['data']['live_tracking'].get('employees', [])
                    print(f"Employees returned: {len(employees)}")
                    print("✓ Filter test passed")
                else:
                    print("✗ Unexpected response format")
            else:
                print("✗ Filter test failed")
                
        except Exception as e:
            print(f"Error with filter {filter_params}: {e}")

def test_employee_details_api(session=None):
    """Test employee details API"""
    print_test_header("Employee Details API")
    
    # First get an employee ID from live tracking
    try:
        if session:
            response = session.get(f"{API_BASE}/live-tracking/?limit=1")
        else:
            response = requests.get(f"{API_BASE}/live-tracking/?limit=1")
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('data', {}).get('live_tracking', {}).get('employees', [])
            
            if employees:
                employee = employees[0]
                employee_id = employee.get('employee_id')
                employee_email = employee.get('email')
                
                print(f"Testing with Employee ID: {employee_id}")
                print(f"Testing with Employee Email: {employee_email}")
                
                # Test with employee ID
                if employee_id:
                    if session:
                        detail_response = session.get(f"{API_BASE}/live-tracking/employee/{employee_id}/")
                    else:
                        detail_response = requests.get(f"{API_BASE}/live-tracking/employee/{employee_id}/")
                    
                    print(f"Employee ID test - Status: {detail_response.status_code}")
                    if detail_response.status_code == 200:
                        print("✓ Employee details by ID working")
                    else:
                        print("✗ Employee details by ID failed")
                        print_response(detail_response)
                
                # Test with employee email
                if employee_email:
                    if session:
                        detail_response = session.get(f"{API_BASE}/live-tracking/employee/{employee_email}/")
                    else:
                        detail_response = requests.get(f"{API_BASE}/live-tracking/employee/{employee_email}/")
                    
                    print(f"Employee Email test - Status: {detail_response.status_code}")
                    if detail_response.status_code == 200:
                        print("✓ Employee details by email working")
                    else:
                        print("✗ Employee details by email failed")
                        print_response(detail_response)
            else:
                print("No employees found in live tracking to test details")
        else:
            print("Could not get employee list for details testing")
            
    except Exception as e:
        print(f"Error testing employee details: {e}")

def test_api_without_auth():
    """Test if APIs work without authentication"""
    print_test_header("Testing APIs without Authentication")
    
    # Test live tracking without auth
    try:
        response = requests.get(f"{API_BASE}/live-tracking/")
        print(f"Live Tracking without auth - Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ Live tracking works without authentication")
        elif response.status_code == 401:
            print("⚠ Live tracking requires authentication")
        else:
            print("✗ Unexpected response for unauthenticated request")
            
    except Exception as e:
        print(f"Error testing without auth: {e}")

def main():
    """Main test function"""
    print("Live Tracking API Test Suite")
    print(f"Testing API endpoints at: {API_BASE}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test without authentication first
    test_api_without_auth()
    
    # Try to login and get authenticated session
    session = login_and_get_session()
    
    # Test main live tracking API
    test_live_tracking_api(session)
    
    # Test with various filters
    test_live_tracking_with_filters(session)
    
    # Test employee details API
    test_employee_details_api(session)
    
    print(f"\n{'='*60}")
    print("Test Suite Completed")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
