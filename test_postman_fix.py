#!/usr/bin/env python3
"""
Quick API Test for Postman Issue
"""
import requests
import json

def test_api():
    print("🧪 TESTING FIXED API")
    print("=" * 40)
    
    url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    try:
        print(f"📡 Making request to: {url}")
        response = requests.get(url, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            data = response.json()
            
            print(f"\n🎯 RESPONSE DATA:")
            print(f"   Success: {data.get('success')}")
            print(f"   Total Users: {data.get('total_users')}")
            print(f"   Total Screenshots: {data.get('total_screenshots'):,}")
            print(f"   Status: {data.get('status')}")
            
            if data.get('users'):
                print(f"\n👤 First User:")
                user = data['users'][0]
                print(f"   Email: {user.get('user_email')}")
                print(f"   Screenshots: {user.get('screenshot_count'):,}")
                
            print("\n🎉 API IS NOW WORKING!")
            
        else:
            print(f"❌ Error {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error: {error_data}")
            except:
                print(f"Raw response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_api()
