#!/usr/bin/env python3
"""
Test All Employee API Endpoints
===============================

This script tests all employee-related API endpoints to verify they're working correctly.
"""

import requests
import json
from datetime import datetime

def test_api_endpoint(url, description):
    """Test a single API endpoint"""
    print(f"\n🔄 Testing: {description}")
    print(f"📡 URL: {url}")
    
    try:
        response = requests.get(url, timeout=30)
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS")
            
            # Display key information
            if 'data' in data:
                data_content = data['data']
                if 'total_employees' in data_content:
                    print(f"   👥 Total Employees: {data_content['total_employees']}")
                if 'employee_list' in data_content and data_content['employee_list']:
                    print(f"   📋 Employee List Count: {len(data_content['employee_list'])}")
                    print(f"   📧 Sample Emails: {data_content['employee_list'][:3]}")
                if 'growth_percentage' in data_content:
                    print(f"   📈 Growth: {data_content['growth_percentage']}%")
                if 'objects_scanned' in data_content:
                    print(f"   🔍 Objects Scanned: {data_content['objects_scanned']}")
            
            return True, data
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Server not running")
        return False, None
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT ERROR: Request took too long")
        return False, None
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, None

def main():
    """Run all tests"""
    print("🧪 TESTING ALL EMPLOYEE API ENDPOINTS")
    print("=" * 60)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    base_url = "http://127.0.0.1:8000"
    
    # Test endpoints
    endpoints = [
        {
            "url": f"{base_url}/api/dashboard/analytics/employees/",
            "description": "Basic Employee Count API"
        },
        {
            "url": f"{base_url}/api/dashboard/analytics/employees/?include_list=true",
            "description": "Employee Count + List API"
        },
        {
            "url": f"{base_url}/api/dashboard/analytics/summary/",
            "description": "Dashboard Summary API"
        },
        {
            "url": f"{base_url}/api/dashboard/analytics/projects/",
            "description": "Total Projects API"
        },
        {
            "url": f"{base_url}/api/dashboard/analytics/completed-projects/",
            "description": "Completed Projects API"
        },
        {
            "url": f"{base_url}/api/dashboard/analytics/tasks/",
            "description": "Total Tasks API"
        }
    ]
    
    results = []
    
    for endpoint in endpoints:
        success, data = test_api_endpoint(endpoint["url"], endpoint["description"])
        results.append({
            "endpoint": endpoint["description"],
            "url": endpoint["url"],
            "success": success,
            "data": data
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for r in results if r["success"])
    total = len(results)
    
    print(f"✅ Successful: {successful}/{total}")
    print(f"❌ Failed: {total - successful}/{total}")
    
    for result in results:
        status = "✅" if result["success"] else "❌"
        print(f"{status} {result['endpoint']}")
    
    # Detailed results for successful employee endpoints
    print("\n📋 DETAILED EMPLOYEE DATA:")
    for result in results:
        if result["success"] and "Employee" in result["endpoint"]:
            data = result["data"].get("data", {})
            print(f"\n🔸 {result['endpoint']}:")
            if "total_employees" in data:
                print(f"   Total Employees: {data['total_employees']}")
            if "employee_list" in data and data["employee_list"]:
                print(f"   Employee Emails Found: {len(data['employee_list'])}")
                for i, email in enumerate(data["employee_list"][:5], 1):
                    print(f"     {i}. {email}")
                if len(data["employee_list"]) > 5:
                    print(f"     ... and {len(data['employee_list']) - 5} more")
    
    print(f"\n🏁 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
