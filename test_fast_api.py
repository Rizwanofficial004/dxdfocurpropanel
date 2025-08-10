#!/usr/bin/env python3
"""
Test the fast live tracking API
"""

import requests
import json

def test_fast_api():
    print("⚡ Testing Fast Live Tracking API")
    print("=" * 50)
    
    # Test the fast API with limited employees
    url = "https://dxdtime.ddsolutions.io/api/fast-live-tracking/?limit_employees=5"
    
    try:
        print(f"🔍 Testing: {url}")
        response = requests.get(url, timeout=15)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            employees = data.get('data', {}).get('employees', [])
            summary = data.get('data', {}).get('summary', {})
            metadata = data.get('data', {}).get('metadata', {})
            
            print(f"📊 Employees Shown: {len(employees)}")
            print(f"📊 Summary: {summary}")
            print(f"⚡ Scan Mode: {metadata.get('scan_mode', 'unknown')}")
            print(f"🕐 Response Time: ~{response.elapsed.total_seconds():.2f}s")
            
            print("\n👥 Employee Details:")
            for i, emp in enumerate(employees, 1):
                name = emp.get('name', 'Unknown')
                email = emp.get('email', 'Unknown')
                status = emp.get('status', 'Unknown')
                total_screenshots = emp.get('total_screenshots', 0)
                last_activity = emp.get('last_activity', 'Unknown')
                
                print(f"\n  {i}. {name}")
                print(f"     📧 {email}")
                print(f"     🔴 Status: {status}")
                print(f"     📸 Screenshots: {total_screenshots}")
                print(f"     🕐 Last Activity: {last_activity}")
                
                latest = emp.get('latest_screenshot')
                if latest:
                    print(f"     🖼️  Latest Screenshot: {latest.get('filename', 'N/A')}")
                    print(f"     🔗 URL: ✅ Available")
                else:
                    print(f"     🖼️  Latest Screenshot: ❌ None")
            
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
    test_fast_api()
