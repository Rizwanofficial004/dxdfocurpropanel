#!/usr/bin/env python3
"""
Quick test of working endpoints
"""

import requests

def test_working_endpoints():
    print("🔍 Testing Working Endpoints")
    print("=" * 40)
    
    # Test the basic endpoints that we know work
    endpoints = [
        "https://dxdtime.ddsolutions.io/api/test/",
        "https://dxdtime.ddsolutions.io/api/employee-cards/",
    ]
    
    for url in endpoints:
        try:
            print(f"\n🔍 Testing: {url}")
            response = requests.get(url, timeout=10)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ SUCCESS!")
                data = response.json()
                if 'data' in data and 'employee_cards' in data.get('data', {}):
                    cards = data['data']['employee_cards']
                    print(f"📊 Found {len(cards)} employee cards")
                    for i, card in enumerate(cards[:2]):
                        name = card.get('name', 'Unknown')
                        screenshots = card.get('productivity', {}).get('screenshots_count', 0)
                        print(f"  {i+1}. {name}: {screenshots} screenshots")
                        
            else:
                print(f"❌ Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_working_endpoints()
