#!/usr/bin/env python3
"""
Quick API Test Script
"""

import requests
import json

def test_endpoint(url, name):
    print(f"\n🔍 Testing: {name}")
    print(f"URL: {url}")
    print("-" * 60)
    
    try:
        response = requests.get(url, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS!")
            
            if 'data' in data and 'employee_cards' in data['data']:
                cards = data['data']['employee_cards']
                print(f"📊 Found {len(cards)} employees")
                
                for i, card in enumerate(cards[:3]):
                    name = card.get('name', 'Unknown')
                    screenshots = card.get('productivity', {}).get('screenshots_count', 0)
                    status = card.get('status', 'Unknown')
                    has_screenshot = card.get('screenshot', {}).get('has_screenshot', False)
                    print(f"  {i+1}. {name}: {screenshots} screenshots, Status: {status}, Has Current Screenshot: {has_screenshot}")
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error = response.json()
                print(f"Error Details: {error.get('message', 'Unknown error')}")
            except:
                print(f"Raw Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return False

def main():
    print("🚀 Quick API Test")
    print("=" * 60)
    
    # Test basic health check
    test_endpoint("https://dxdtime.ddsolutions.io/api/test/", "Health Check")
    
    # Test employee cards with no filters (all screenshots)
    test_endpoint("https://dxdtime.ddsolutions.io/api/employee-cards/", "Employee Cards - All Screenshots (No Filters)")
    
    # Test employee cards with your specific URL
    test_endpoint("https://dxdtime.ddsolutions.io/api/employee-cards/?employee_filter=all&date_range=month", "Employee Cards - Your Specific URL")
    
    # Test new all-employees endpoint
    test_endpoint("https://dxdtime.ddsolutions.io/api/all-employees/", "All Employees - No Date Filtering")

if __name__ == "__main__":
    main()
