#!/usr/bin/env python3
"""
Test the correct API endpoints for screenshots
"""

import requests
import json

def test_correct_endpoints():
    print("🔍 Testing CORRECT API Endpoints")
    print("=" * 50)
    
    # The URL you tried doesn't exist. Let's test the ones that do:
    
    print("❌ INCORRECT URL (doesn't exist):")
    print("   https://dxdtime.ddsolutions.io/api/screenshots/user/?user=Haseeb")
    print()
    
    print("✅ CORRECT URLs that exist:")
    print()
    
    # 1. User-specific screenshots (requires email)
    print("1️⃣ User-specific screenshots:")
    url1 = "https://dxdtime.ddsolutions.io/api/users/haseebcodejourney@gmail.com/screenshots/?date=2025-06-10&limit=5"
    print(f"   URL: {url1}")
    
    try:
        response = requests.get(url1, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print("   ⚠️  Requires authentication (login)")
        elif response.status_code == 200:
            print("   ✅ Success!")
            data = response.json()
            print(f"   Message: {data.get('message', 'No message')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # 2. General screenshots endpoint
    print("2️⃣ General screenshots:")
    url2 = "https://dxdtime.ddsolutions.io/api/screenshots/?limit=5"
    print(f"   URL: {url2}")
    
    try:
        response = requests.get(url2, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 401:
            print("   ⚠️  Requires authentication (login)")
        elif response.status_code == 200:
            print("   ✅ Success!")
            data = response.json()
            print(f"   Message: {data.get('message', 'No message')}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print()
    
    # 3. Working alternative - Employee Cards (shows screenshots)
    print("3️⃣ Employee Cards (shows screenshots):")
    url3 = "https://dxdtime.ddsolutions.io/api/employee-cards/?search_name=Haseeb&limit=5"
    print(f"   URL: {url3}")
    
    try:
        response = requests.get(url3, timeout=15)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Success!")
            data = response.json()
            print(f"   Message: {data.get('message', 'No message')}")
            
            if 'data' in data and 'employee_cards' in data['data']:
                cards = data['data']['employee_cards']
                print(f"   📊 Found {len(cards)} employee cards")
                
                for card in cards:
                    name = card.get('name', 'Unknown')
                    screenshots_count = card.get('productivity', {}).get('screenshots_count', 0)
                    has_screenshot = card.get('screenshot', {}).get('has_screenshot', False)
                    print(f"     👤 {name}: {screenshots_count} screenshots, Current: {'✅' if has_screenshot else '❌'}")
        else:
            print(f"   ❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def show_all_available_endpoints():
    print("\n📋 ALL AVAILABLE API ENDPOINTS:")
    print("=" * 50)
    
    endpoints = [
        "GET  /api/test/",
        "POST /api/auth/login/",
        "GET  /api/screenshots/ (requires auth)",
        "GET  /api/logs/ (requires auth)",
        "GET  /api/users/suggestions/",
        "GET  /api/dashboard/user-data/",
        "GET  /api/dashboard/data/",
        "GET  /api/users/search/",
        "GET  /api/users/<email>/screenshots/ (requires auth)",
        "GET  /api/users/<email>/logs/ (requires auth)",
        "GET  /api/employee-cards/",
    ]
    
    for endpoint in endpoints:
        print(f"   {endpoint}")
    
    print("\n💡 RECOMMENDATION:")
    print("   Use: /api/employee-cards/?search_name=Haseeb")
    print("   This will show Haseeb's data including screenshots!")

if __name__ == "__main__":
    test_correct_endpoints()
    show_all_available_endpoints()
