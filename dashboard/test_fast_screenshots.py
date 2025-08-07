#!/usr/bin/env python3
"""
Test Fast Live Tracking Screenshots API
"""

import requests
import json

def test_fast_api():
    url = "http://127.0.0.1:8000/api/live-tracking/fast-screenshots/"
    
    params = {
        "limit": 30,
        "status": "all"
    }
    
    print("⚡ Testing FAST Live Tracking Screenshots API")
    print(f"🌐 URL: {url}")
    print(f"📋 Params: {params}")
    print("=" * 50)
    
    try:
        response = requests.get(url, params=params, timeout=10)
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
            print(f"   Users without Screenshots: {summary.get('users_without_screenshots', 0)}")
            print(f"   Total Screenshots: {summary.get('total_screenshots_found', 0)}")
            print(f"   API Version: {summary.get('api_version', 'N/A')}")
            
            print(f"\n👥 All Users ({len(users)}):")
            for i, user in enumerate(users, 1):
                name = user.get('display_name', 'N/A')
                email = user.get('email', 'N/A')
                status = user.get('status', 'N/A')
                has_screenshot = user.get('latest_screenshot', {}).get('has_screenshot', False)
                screenshot_status = "✅" if has_screenshot else "❌"
                screenshot_time = user.get('latest_screenshot', {}).get('timestamp', 'N/A')
                
                print(f"   {i:2d}. {name}")
                print(f"       📧 {email}")
                print(f"       📊 Status: {status}")
                print(f"       📸 Screenshot: {screenshot_status}")
                if has_screenshot:
                    print(f"       🕒 Time: {screenshot_time}")
                print()
                
            # API Info
            api_info = data.get('data', {}).get('api_info', {})
            print(f"🔧 API Info:")
            print(f"   Endpoint: {api_info.get('endpoint', 'N/A')}")
            print(f"   Optimization: {api_info.get('optimization', 'N/A')}")
            print(f"   Max Task Folders: {api_info.get('max_task_folders_per_user', 'N/A')}")
            print(f"   Max Files per Folder: {api_info.get('max_files_per_folder', 'N/A')}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Message: {error_data.get('message', 'Unknown error')}")
            except:
                print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_fast_api()
