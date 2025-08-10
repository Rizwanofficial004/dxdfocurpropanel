#!/usr/bin/env python3
"""
Test the new Live Tracking API that dynamically discovers employees from S3
"""

import requests
import json

def test_live_tracking_api():
    print("🚀 Testing Live Tracking API (S3 Dynamic Discovery)")
    print("=" * 70)
    
    endpoints = [
        {
            "url": "https://dxdtime.ddsolutions.io/api/live-tracking/",
            "name": "Live Tracking - All Employees from S3",
            "description": "Dynamically discovers all employees from S3 bucket"
        },
        {
            "url": "https://dxdtime.ddsolutions.io/api/live-tracking/?limit_per_employee=3",
            "name": "Live Tracking - Limited Screenshots",
            "description": "Shows 3 latest screenshots per employee"
        },
        {
            "url": "https://dxdtime.ddsolutions.io/api/live-tracking/?status_filter=online",
            "name": "Live Tracking - Online Only",
            "description": "Filter only online employees"
        },
        {
            "url": "https://dxdtime.ddsolutions.io/api/s3-employees/",
            "name": "S3 Employees API",
            "description": "All employees discovered from S3 with pagination"
        },
        {
            "url": "https://dxdtime.ddsolutions.io/api/s3-employees/?include_screenshots=false",
            "name": "S3 Employees - Names Only",
            "description": "Just employee names without screenshot data"
        }
    ]
    
    for endpoint in endpoints:
        print(f"\n🔍 Testing: {endpoint['name']}")
        print(f"URL: {endpoint['url']}")
        print(f"Description: {endpoint['description']}")
        print("-" * 70)
        
        try:
            response = requests.get(endpoint['url'], timeout=30)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ SUCCESS!")
                
                # Live tracking API response
                if 'employees' in data.get('data', {}):
                    employees = data['data']['employees']
                    summary = data['data'].get('summary', {})
                    
                    print(f"📊 Total Employees Found: {len(employees)}")
                    print(f"📊 Summary: {summary}")
                    
                    print("\n👥 Employee Sample:")
                    for i, emp in enumerate(employees[:3]):
                        name = emp.get('name', 'Unknown')
                        email = emp.get('email', 'Unknown')
                        status = emp.get('status', 'Unknown')
                        total_screenshots = emp.get('total_screenshots', 0)
                        latest_count = len(emp.get('latest_screenshots', []))
                        
                        print(f"  {i+1}. {name} ({email})")
                        print(f"     Status: {status}")
                        print(f"     Total Screenshots: {total_screenshots}")
                        print(f"     Latest Screenshots: {latest_count}")
                        
                        if emp.get('current_screenshot'):
                            print(f"     Current Screenshot: ✅ Available")
                        else:
                            print(f"     Current Screenshot: ❌ None")
                
                # S3 employees API response
                elif 'employees' in data.get('data', {}):
                    employees = data['data']['employees']
                    pagination = data['data'].get('pagination', {})
                    
                    print(f"📊 Employees on this page: {len(employees)}")
                    print(f"📄 Pagination: {pagination}")
                    
                    print("\n👥 Employee Sample:")
                    for i, emp in enumerate(employees[:3]):
                        if isinstance(emp, dict):
                            name = emp.get('name', 'Unknown')
                            email = emp.get('email', 'Unknown')
                            print(f"  {i+1}. {name} ({email})")
                        else:
                            print(f"  {i+1}. {emp}")
                
                print(f"\n🕐 Response Time: ~{response.elapsed.total_seconds():.2f}s")
                
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    error = response.json()
                    print(f"Error Details: {error.get('message', 'Unknown error')}")
                except:
                    print(f"Raw Error: {response.text[:200]}")
                    
        except Exception as e:
            print(f"❌ Connection Error: {e}")
        
        print()

if __name__ == "__main__":
    test_live_tracking_api()
