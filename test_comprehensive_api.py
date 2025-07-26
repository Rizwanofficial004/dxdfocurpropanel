#!/usr/bin/env python3
"""
Test Comprehensive Project Status API
Tests the new single comprehensive API with all response formats
"""

import sys
import os
import requests
import json
from datetime import datetime

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_comprehensive_api():
    """Test the comprehensive project status API"""
    print("🚀 COMPREHENSIVE PROJECT STATUS API TEST")
    print("=" * 80)
    print(f"Test Time: {datetime.now().isoformat()}")
    print("Purpose: Test single API with multiple response formats")
    print("-" * 80)
    
    base_url = "http://localhost:8000/api/projects/status/"
    
    # Test different response formats
    test_cases = [
        {
            "name": "Simple Format (Dashboard)",
            "url": f"{base_url}?format=simple",
            "description": "Just the numbers for dashboard widgets"
        },
        {
            "name": "Detailed Format",
            "url": f"{base_url}?format=detailed", 
            "description": "Counts with percentages and metadata"
        },
        {
            "name": "Breakdown Format",
            "url": f"{base_url}?format=breakdown",
            "description": "Counts with sample projects"
        },
        {
            "name": "All Format",
            "url": f"{base_url}?format=all",
            "description": "Complete comprehensive response"
        },
        {
            "name": "Breakdown with All Projects",
            "url": f"{base_url}?format=breakdown&include_projects=true",
            "description": "All projects grouped by status"
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 TEST {i}: {test_case['name']}")
        print("-" * 50)
        print(f"URL: {test_case['url']}")
        print(f"Description: {test_case['description']}")
        
        try:
            response = requests.get(test_case['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    print(f"✅ SUCCESS: {response.status_code}")
                    print(f"📊 Response size: {len(response.content)} bytes")
                    
                    # Show key data points
                    if 'not_started' in data:
                        print(f"🔵 Not Started: {data['not_started']}")
                        print(f"🟠 In Progress: {data['in_progress']}")
                        print(f"🟡 On Hold: {data['onhold']}")
                        print(f"🔴 Cancelled: {data['cancel']}")
                        print(f"🟢 Finished: {data['finished']}")
                        print(f"📋 Total: {data['total_projects']}")
                    
                    # Show additional data based on format
                    if 'percentages' in data:
                        print(f"📈 In Progress %: {data['percentages']['in_progress_percent']}%")
                    
                    if 'status_breakdown' in data:
                        breakdown = data['status_breakdown']
                        print(f"📂 Breakdown sections: {len(breakdown)}")
                    
                    results.append(True)
                else:
                    print(f"❌ FAILED: API returned success=false")
                    print(f"Error: {data.get('message', 'Unknown error')}")
                    results.append(False)
                    
            else:
                print(f"❌ FAILED: HTTP {response.status_code}")
                print(f"Response: {response.text[:200]}...")
                results.append(False)
                
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            results.append(False)
    
    # Test legacy compatibility endpoints
    print(f"\n🔄 TESTING LEGACY COMPATIBILITY ENDPOINTS")
    print("-" * 50)
    
    legacy_endpoints = [
        "http://localhost:8000/api/projects/simple-counts/",
        "http://localhost:8000/api/projects/static-status/", 
        "http://localhost:8000/api/projects/status-breakdown/"
    ]
    
    for endpoint in legacy_endpoints:
        print(f"\n🧪 Testing: {endpoint}")
        try:
            response = requests.get(endpoint, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print(f"✅ Legacy endpoint working: {endpoint.split('/')[-2]}")
                    results.append(True)
                else:
                    print(f"❌ Legacy endpoint failed: {data.get('message', 'Unknown')}")
                    results.append(False)
            else:
                print(f"❌ Legacy endpoint HTTP error: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ Legacy endpoint error: {str(e)}")
            results.append(False)
    
    # Final results
    print("\n" + "=" * 80)
    print("📊 FINAL TEST RESULTS")
    print("=" * 80)
    
    total_tests = len(results)
    passed_tests = sum(results)
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Comprehensive Project Status API is working perfectly!")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed.")
    
    print("\n🔗 RECOMMENDED API USAGE:")
    print("-" * 40)
    print("For Dashboard Widgets:")
    print("  GET /api/projects/status/?format=simple")
    print()
    print("For Detailed Analytics:")
    print("  GET /api/projects/status/?format=detailed")
    print()
    print("For Project Breakdown:")
    print("  GET /api/projects/status/?format=breakdown")
    print()
    print("For Complete Data:")
    print("  GET /api/projects/status/?format=all")
    
    print(f"\n✅ Testing completed at {datetime.now().isoformat()}")

if __name__ == '__main__':
    print("⚠️ Make sure Django server is running: python manage.py runserver")
    print("Press Enter to continue or Ctrl+C to exit...")
    try:
        input()
        test_comprehensive_api()
    except KeyboardInterrupt:
        print("\n❌ Test cancelled by user.")
