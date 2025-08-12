#!/usr/bin/env python3
"""
Quick API Test - Single Request
"""
import requests
import time

print("🚀 Testing API...")
time.sleep(2)  # Wait for server to be ready

try:
    url = "http://127.0.0.1:8000/api/screenshots/search/"
    params = {"search": "test", "limit": 5}
    
    print(f"📡 Making request to: {url}")
    print(f"📋 Parameters: {params}")
    
    response = requests.get(url, params=params, timeout=10)
    
    print(f"📊 Status Code: {response.status_code}")
    print(f"🔗 Final URL: {response.url}")
    
    if response.status_code == 200:
        print("✅ SUCCESS!")
        data = response.json()
        print(f"Response: {data}")
    elif response.status_code == 302:
        print(f"🔄 Redirect to: {response.headers.get('Location', 'Unknown')}")
    else:
        print(f"❌ Error: {response.text[:300]}")
        
except Exception as e:
    print(f"💥 Error: {e}")
