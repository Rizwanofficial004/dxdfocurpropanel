#!/usr/bin/env python3
"""
Test Total Employees API
========================

This script tests the total employees API endpoint to verify it returns
the correct count of 32 employees from S3 bucket.
"""

import requests
import json
from datetime import datetime

def test_total_employees_api():
    """
    Test the total employees API endpoint
    """
    print("🧪 TESTING TOTAL EMPLOYEES API")
    print("=" * 40)
    
    # API endpoint
    base_url = "http://127.0.0.1:8000"
    endpoint = "/api/dashboard/analytics/employees/"
    full_url = f"{base_url}{endpoint}"
    
    print(f"📡 Testing endpoint: {full_url}")
    
    try:
        # Test 1: Basic API call
        print("\n🔄 Test 1: Basic API call...")
        response = requests.get(full_url, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API call successful!")
            print(f"📊 Response Data:")
            print(json.dumps(data, indent=2))
            
            # Validate response structure
            if data.get('success'):
                employee_data = data.get('data', {})
                total_employees = employee_data.get('total_employees', 0)
                
                print(f"\n📈 RESULTS:")
                print(f"   Total Employees: {total_employees}")
                print(f"   Growth Percentage: {employee_data.get('growth_percentage', 0)}%")
                print(f"   Objects Scanned: {employee_data.get('objects_scanned', 0)}")
                print(f"   Source: {employee_data.get('source', 'Unknown')}")
                
                # Check if we got the expected count
                if total_employees == 32:
                    print("🎉 SUCCESS: Got expected count of 32 employees!")
                else:
                    print(f"⚠️  WARNING: Expected 32 employees, got {total_employees}")
            else:
                print(f"❌ API returned success=false: {data.get('message', 'Unknown error')}")
        else:
            print(f"❌ API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Is Django server running?")
        print("💡 Start server with: python manage.py runserver")
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT ERROR: API took too long to respond")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
    
    print("\n" + "=" * 40)
    
    # Test 2: API call with employee list
    print("\n🔄 Test 2: API call with employee list...")
    try:
        list_url = f"{full_url}?include_list=true"
        print(f"📡 Testing: {list_url}")
        
        response = requests.get(list_url, timeout=45)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                employee_data = data.get('data', {})
                employee_list = employee_data.get('employee_list', [])
                
                print(f"✅ Got employee list with {len(employee_list)} employees")
                print("📋 Employee List:")
                for i, email in enumerate(employee_list[:10], 1):  # Show first 10
                    print(f"   {i:2d}. {email}")
                
                if len(employee_list) > 10:
                    print(f"   ... and {len(employee_list) - 10} more employees")
                    
            else:
                print(f"❌ API returned error: {data.get('message')}")
        else:
            print(f"❌ API call failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ ERROR in Test 2: {str(e)}")

def test_api_performance():
    """
    Test API response time
    """
    print("\n⏱️  PERFORMANCE TEST")
    print("=" * 25)
    
    url = "http://127.0.0.1:8000/api/dashboard/analytics/employees/"
    
    try:
        start_time = datetime.now()
        response = requests.get(url, timeout=60)
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        
        print(f"⏱️  Response Time: {duration:.2f} seconds")
        
        if duration < 5:
            print("🚀 FAST: API responded quickly!")
        elif duration < 15:
            print("⚡ GOOD: Acceptable response time")
        else:
            print("🐌 SLOW: API took longer than expected")
            
        if response.status_code == 200:
            data = response.json()
            objects_scanned = data.get('data', {}).get('objects_scanned', 0)
            print(f"📊 Scanned {objects_scanned:,} objects in {duration:.2f}s")
            print(f"📈 Rate: {objects_scanned/duration:.0f} objects/second")
        
    except Exception as e:
        print(f"❌ Performance test failed: {str(e)}")

if __name__ == "__main__":
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run basic tests
    test_total_employees_api()
    
    # Run performance test
    test_api_performance()
    
    print(f"\n🏁 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
