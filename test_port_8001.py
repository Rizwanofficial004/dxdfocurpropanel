#!/usr/bin/env python3
"""
Quick API Test - Port 8001
"""
import requests
import time

print("🚀 Testing API on port 8001...")
time.sleep(3)  # Wait for server to be ready

try:
    url = "http://127.0.0.1:8001/api/screenshots/search/"
    params = {"search": "haseeb", "limit": 3}
    
    print(f"📡 Making request to: {url}")
    print(f"📋 Parameters: {params}")
    
    response = requests.get(url, params=params, timeout=15)
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"🔗 Final URL: {response.url}")
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        data = response.json()
        print(f"🎯 Success: {data.get('success')}")
        print(f"📝 Message: {data.get('message')}")
        if 'data' in data:
            results = data['data'].get('results', [])
            print(f"📊 Results found: {len(results)}")
            if results:
                print("🔍 First result preview:")
                print(f"   - Employee: {results[0].get('employee_email', 'N/A')}")
                print(f"   - Screenshots: {results[0].get('screenshot_count', 'N/A')}")
    elif response.status_code == 302:
        print(f"🔄 Redirect to: {response.headers.get('Location', 'Unknown')}")
        print("❌ Authentication required")
    else:
        print(f"❌ Error {response.status_code}: {response.text[:300]}")
        
except Exception as e:
    print(f"💥 Error: {e}")

print("\n🏁 Test complete")
