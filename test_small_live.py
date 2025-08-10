#!/usr/bin/env python3
"""
Test the live tracking API with just a few employees
"""

import requests
import json

def test_small_live_tracking():
    print("🔍 Testing Live Tracking with Limited Data")
    print("=" * 50)
    
    # Test with search to limit results
    url = "https://dxdtime.ddsolutions.io/api/live-tracking/?search=amir&limit_per_employee=2"
    
    try:
        response = requests.get(url, timeout=20)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            
            print(f"📊 Found {len(employees)} employees")
            print(f"📊 Summary: {summary}")
            
            for i, emp in enumerate(employees, 1):
                name = emp.get('name', 'Unknown')
                email = emp.get('email', 'Unknown')
                status = emp.get('status', 'Unknown')
                total_screenshots = emp.get('total_screenshots', 0)
                latest_count = len(emp.get('latest_screenshots', []))
                
                print(f"\n👤 Employee {i}: {name}")
                print(f"   📧 Email: {email}")
                print(f"   🔴 Status: {status}")
                print(f"   📸 Total Screenshots: {total_screenshots}")
                print(f"   🆕 Latest Screenshots: {latest_count}")
                
                current = emp.get('current_screenshot')
                if current:
                    print(f"   🖼️  Current Screenshot: {current.get('filename', 'N/A')}")
                    print(f"   🔗 URL Available: ✅")
                else:
                    print(f"   🖼️  Current Screenshot: ❌ None")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error = response.json()
                print(f"Error Details: {error.get('message', 'Unknown')}")
            except:
                print(f"Raw Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_small_live_tracking()
