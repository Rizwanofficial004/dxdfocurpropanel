#!/usr/bin/env python3
"""
Quick API Test - Single Request
"""
import requests
import time

print("🚀 Testing API...")
time.sleep(2)  # Wait for server to be ready

try:
    url = "http://127.0.0.1:8001/api/actual-count-total/screenshots/"
    
    print(f"📡 Making request to: {url}")
    
    response = requests.get(url, timeout=30)
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"🔗 Final URL: {response.url}")
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        data = response.json()
        print(f"Users: {data.get('total_users', 0)}")
        print(f"Screenshots: {data.get('total_screenshots', 0)}")
        print("API WORKING!")
    elif response.status_code == 302:
        print(f"🔄 Redirect to: {response.headers.get('Location', 'Unknown')}")
    else:
        print(f"❌ Error: {response.text[:300]}")
        
except Exception as e:
    print(f"💥 Error: {e}")
