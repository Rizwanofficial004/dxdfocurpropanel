#!/usr/bin/env python3
"""
Simple test to check if the API endpoint is accessible
"""
import requests
import time

def test_simple_api():
    """Test a simple API endpoint first"""
    print("🔍 Testing basic API connectivity...")
    
    # Test the basic API test endpoint first
    try:
        response = requests.get("https://dxdtime.ddsolutions.io/api/test/", timeout=5)
        print(f"✅ Basic API test: Status {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Basic API test failed: {e}")
    
    # Test the Level 3 API with minimal parameters
    print("\n🔍 Testing Level 3 API...")
    try:
        url = "https://dxdtime.ddsolutions.io/api/screenshots/employee/haseebcodejourney@gmail.com/folder/Create_UI_for_YouTube_AI_Automation_/?page=1&limit=1"
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=60)
        print(f"✅ Level 3 API: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            print(f"   Message: {data.get('message', 'No message')}")
            if 'data' in data and 'screenshots' in data['data']:
                screenshots = data['data']['screenshots']
                print(f"   Screenshots: {len(screenshots)}")
                if screenshots:
                    screenshot = screenshots[0]
                    print(f"   First screenshot: {screenshot.get('filename', 'N/A')}")
                    print(f"   Presigned URL: {screenshot.get('presigned_url', 'N/A')[:50]}...")
        else:
            print(f"   Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Level 3 API: Request timed out")
    except Exception as e:
        print(f"❌ Level 3 API error: {e}")

if __name__ == "__main__":
    test_simple_api()
