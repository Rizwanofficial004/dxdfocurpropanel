#!/usr/bin/env python3
"""
Easy API Test - Test your APIs easily
====================================
"""

import requests
import json

def test_apis():
    print("🚀 Testing Screenshot APIs...")
    print("=" * 40)
    
    base_url = "http://127.0.0.1:8010/api"
    
    # Test 1: Health Check
    print("\n1️⃣ Health Check...")
    try:
        response = requests.get(f"{base_url}/test/", timeout=5)
        if response.status_code == 200:
            print("✅ API is working!")
            print(f"   {response.json()}")
        else:
            print(f"❌ Status: {response.status_code}")
    except:
        print("❌ Server not running! Start with: python manage.py runserver 127.0.0.1:8010")
        return
    
    # Test 2: User Counts
    print("\n2️⃣ User Screenshot Counts...")
    try:
        response = requests.get(f"{base_url}/users/screenshots-count/?limit=3", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Total users: {data.get('total_users', 0)}")
            print(f"✅ Total screenshots: {data.get('total_screenshots', 0):,}")
            
            for user in data.get('users', [])[:3]:
                print(f"   📊 {user['email']}: {user['screenshot_count']:,} screenshots")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"   {response.text[:100]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Scheduler Status
    print("\n3️⃣ Auto-Scheduler Status...")
    try:
        response = requests.get(f"{base_url}/scheduler/status/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            scheduler = data.get('scheduler', {})
            print(f"✅ Running: {scheduler.get('is_running')}")
            print(f"✅ Next update: {scheduler.get('next_run_time')}")
        else:
            print(f"❌ Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 40)
    print("🎉 Test Complete!")
    print("\n🌐 Browser URLs:")
    print(f"• {base_url}/test/")
    print(f"• {base_url}/users/screenshots-count/")
    print(f"• {base_url}/scheduler/status/")

if __name__ == "__main__":
    test_apis()
