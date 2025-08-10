#!/usr/bin/env python3
"""
Test script to verify screenshots API is working with the fixed S3 function
"""

import requests
import json
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000"
LOGIN_URL = f"{BASE_URL}/api/login/"
SCREENSHOTS_URL = f"{BASE_URL}/api/screenshots/"

# Test credentials
USERNAME = "admin"
PASSWORD = "admin"
TEST_EMAIL = "haseebcodejourney@gmail.com"

def test_login():
    """Test login and get session"""
    print("🔐 Testing login...")
    
    login_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful: {data.get('message', '')}")
        return response.cookies
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def test_screenshots_api(cookies):
    """Test screenshots API with specific email"""
    print(f"\n📸 Testing screenshots API for email: {TEST_EMAIL}")
    
    # Test GET request with email parameter
    params = {
        "email": TEST_EMAIL,
        "limit": 10
    }
    
    response = requests.get(SCREENSHOTS_URL, params=params, cookies=cookies)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Screenshots API successful!")
        print(f"Success: {data.get('success')}")
        print(f"Message: {data.get('message')}")
        
        screenshots = data.get('data', {}).get('screenshots', [])
        print(f"📊 Found {len(screenshots)} screenshots")
        
        if screenshots:
            print("\n🖼️ Sample screenshot data:")
            for i, screenshot in enumerate(screenshots[:3]):  # Show first 3
                print(f"  Screenshot {i+1}:")
                print(f"    Filename: {screenshot.get('filename', 'N/A')}")
                print(f"    Date folder: {screenshot.get('date_folder', 'N/A')}")
                print(f"    Size: {screenshot.get('size', 0)} bytes")
                print(f"    Last modified: {screenshot.get('last_modified', 'N/A')}")
                print(f"    URL: {screenshot.get('url', 'N/A')[:100]}...")
                print()
        
        pagination = data.get('data', {}).get('pagination', {})
        print(f"📄 Pagination: Page {pagination.get('current_page', 1)} of {pagination.get('total_pages', 1)}")
        print(f"📊 Total found: {data.get('data', {}).get('total_found', 0)}")
        print(f"🔍 Prefix searched: {data.get('data', {}).get('prefix_searched', 'N/A')}")
        
    else:
        print(f"❌ Screenshots API failed: {response.text}")

def main():
    print("🧪 Testing Screenshots API Fix")
    print("=" * 50)
    
    # Step 1: Login
    cookies = test_login()
    if not cookies:
        print("❌ Cannot proceed without valid login")
        sys.exit(1)
    
    # Step 2: Test screenshots API
    test_screenshots_api(cookies)
    
    print("\n✅ Test completed!")

if __name__ == "__main__":
    main()
