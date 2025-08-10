#!/usr/bin/env python3
"""
Dashboard Analytics API Testing Script
======================================

This script tests all the new dashboard analytics APIs:
- Total Employees API
- Total Projects API
- Completed Projects API
- Total Tasks API
- Dashboard Summary API

Usage:
    python test_dashboard_analytics_apis.py
"""

import requests
import json
import sys
from datetime import datetime

# API Base URL
BASE_URL = "http://localhost:8000/api"  # Adjust if different
# BASE_URL = "https://your-domain.com/api"  # For production

# API Endpoints
ENDPOINTS = {
    'total_employees': '/dashboard/analytics/employees/',
    'total_projects': '/dashboard/analytics/projects/',
    'completed_projects': '/dashboard/analytics/completed-projects/',
    'total_tasks': '/dashboard/analytics/tasks/',
    'dashboard_summary': '/dashboard/analytics/summary/'
}

def test_api_endpoint(endpoint_name, endpoint_path):
    """
    Test a single API endpoint
    """
    url = f"{BASE_URL}{endpoint_path}"
    print(f"\n{'='*60}")
    print(f"Testing: {endpoint_name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        # Make GET request
        response = requests.get(url, timeout=30)
        
        # Print response details
        print(f"Status Code: {response.status_code}")
        print(f"Response Time: {response.elapsed.total_seconds():.2f} seconds")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ SUCCESS")
                print("\nResponse JSON:")
                print(json.dumps(data, indent=2))
                
                # Extract key metrics for summary
                if 'data' in data:
                    if endpoint_name == 'Total Employees':
                        count = data['data'].get('total_employees', 'N/A')
                        print(f"\n📊 Total Employees: {count}")
                    elif endpoint_name == 'Total Projects':
                        count = data['data'].get('total_projects', 'N/A')
                        print(f"\n📊 Total Projects: {count}")
                    elif endpoint_name == 'Completed Projects':
                        count = data['data'].get('completed_projects', 'N/A')
                        print(f"\n📊 Completed Projects: {count}")
                    elif endpoint_name == 'Total Tasks':
                        count = data['data'].get('total_tasks', 'N/A')
                        print(f"\n📊 Total Tasks: {count}")
                    elif endpoint_name == 'Dashboard Summary':
                        summary = data['data'].get('summary', {})
                        print("\n📊 Dashboard Summary:")
                        for key, value in summary.items():
                            if isinstance(value, dict) and 'count' in value:
                                print(f"   {key}: {value['count']}")
                        
                return True
                
            except json.JSONDecodeError:
                print("❌ ERROR: Invalid JSON response")
                print(f"Raw response: {response.text}")
                return False
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timeout")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Connection failed")
        print("Make sure the Django server is running on the correct port")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """
    Main test function
    """
    print("🚀 Starting Dashboard Analytics API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    
    results = {}
    
    # Test each endpoint
    for name, path in ENDPOINTS.items():
        display_name = name.replace('_', ' ').title()
        success = test_api_endpoint(display_name, path)
        results[name] = success
    
    # Print summary
    print(f"\n{'='*60}")
    print("📋 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(1 for success in results.values() if success)
    total = len(results)
    
    for endpoint, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{endpoint:<25} {status}")
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
