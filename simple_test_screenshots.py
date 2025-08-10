#!/usr/bin/env python3
"""
Simple test for Live Tracking Screenshots API
"""

import requests
import json

def test_api():
    url = "http://127.0.0.1:8000/api/live-tracking/screenshots/"
    
    params = {
        "limit": 50,
        "status": "all", 
        "latest_only": "true",
        "sort_by": "name"
    }
    
    print("📸 Testing Live Tracking Screenshots API")
    print(f"🌐 URL: {url}")
    print(f"📋 Params: {params}")
    print("=" * 50)
    
    try:
        response = requests.get(url, params=params, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            
            # Basic info
            summary = data.get('data', {}).get('summary', {})
            users = data.get('data', {}).get('users', [])
            
            print(f"\n📊 Results:")
            print(f"   Total Users: {summary.get('total_users', 0)}")
            print(f"   Users with Screenshots: {summary.get('users_with_screenshots', 0)}")
            print(f"   Total Screenshots: {summary.get('total_screenshots_found', 0)}")
            
            print(f"\n👥 First 5 Users:")
            for i, user in enumerate(users[:5], 1):
                name = user.get('display_name', 'N/A')
                email = user.get('email', 'N/A')
                has_screenshot = user.get('latest_screenshot', {}).get('has_screenshot', False)
                screenshot_status = "✅" if has_screenshot else "❌"
                print(f"   {i}. {name} ({email}) - Screenshot: {screenshot_status}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()
