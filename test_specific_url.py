#!/usr/bin/env python3
"""
Test the specific URL for employee cards API
"""

import requests
import json

def test_url(url, description):
    print(f"🔍 Testing: {url}")
    print(f"📝 Description: {description}")
    print("-" * 80)
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"📊 Response Keys: {list(data.keys())}")
            
            if 'data' in data:
                response_data = data['data']
                print(f"📈 Data Keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
                
                if 'results' in response_data:
                    results = response_data['results']
                    print(f"👥 Total Results: {len(results)}")
                    
                    for i, employee in enumerate(results[:3]):  # Show first 3
                        print(f"\n👤 Employee {i+1}:")
                        print(f"   Name: {employee.get('name', 'N/A')}")
                        print(f"   Email: {employee.get('email', 'N/A')}")
                        print(f"   Status: {employee.get('status', 'N/A')}")
                        print(f"   Has Screenshot: {employee.get('has_screenshot', 'N/A')}")
                        print(f"   Screenshot URL: {employee.get('screenshot_url', 'N/A')}")
                        print(f"   Working Time: {employee.get('working_time', 'N/A')}")
                
                if 'pagination' in response_data:
                    pagination = response_data['pagination']
                    print(f"\n📄 Pagination:")
                    print(f"   Total: {pagination.get('total', 'N/A')}")
                    print(f"   Page: {pagination.get('page', 'N/A')}")
                    print(f"   Per Page: {pagination.get('per_page', 'N/A')}")
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("=" * 80)
    print()

def main():
    print("🚀 Testing Employee Cards API - Specific URLs")
    print("=" * 80)
    
    # Test the specific URL you mentioned
    test_url(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?employee_filter=all&date_range=month",
        "Your specific URL with employee_filter=all and date_range=month"
    )
    
    # Test without any filters (should show all screenshots)
    test_url(
        "https://dxdtime.ddsolutions.io/api/employee-cards/",
        "No filters - should show all screenshots"
    )
    
    # Test with just employee_filter=all
    test_url(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?employee_filter=all",
        "Just employee_filter=all"
    )
    
    # Test with just date_range=month
    test_url(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?date_range=month",
        "Just date_range=month"
    )
    
    # Test to see all screenshots without date filtering
    test_url(
        "https://dxdtime.ddsolutions.io/api/employee-cards/?show_all=true",
        "Show all screenshots without date filtering"
    )

if __name__ == "__main__":
    main()
