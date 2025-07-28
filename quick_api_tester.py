#!/usr/bin/env python3
"""
Quick API Tester for S3 User Analytics API
"""

import requests
import json
import time

def test_endpoint(url, name, timeout=30):
    """Test a single endpoint"""
    print(f"\n🔍 Testing: {name}")
    print(f"URL: {url}")
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=timeout)
        end_time = time.time()
        
        print(f"✅ Status: {response.status_code}")
        print(f"⏱️ Time: {end_time - start_time:.2f}s")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if 'success' in data:
                    print(f"✅ Success: {data.get('success')}")
                    if 'total_users' in data:
                        print(f"👥 Total Users: {data.get('total_users')}")
                    if 'users' in data and isinstance(data['users'], list):
                        print(f"📋 Users Found: {len(data['users'])}")
                        if data['users']:
                            print(f"👤 First User: {data['users'][0].get('email', 'Unknown')}")
                    print(f"📝 Message: {data.get('message', 'No message')}")
                else:
                    print(f"📄 Response Keys: {list(data.keys())}")
            except json.JSONDecodeError:
                print(f"📄 Response Length: {len(response.text)} chars")
                print(f"📄 First 200 chars: {response.text[:200]}...")
        else:
            print(f"❌ Error: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print(f"⏰ Timeout after {timeout}s")
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error - Server not responding")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    """Test all endpoints"""
    base_url = "http://localhost:8000"
    
    print("🚀 S3 USER ANALYTICS API TESTING")
    print("=" * 50)
    
    # Test endpoints
    endpoints = [
        (f"{base_url}/", "API Documentation", 10),
        (f"{base_url}/api/s3/users-list/", "Users List (All Users)", 45),
        (f"{base_url}/api/s3/user-tasks/", "User Tasks (All Users)", 45),
        (f"{base_url}/api/s3/user-tasks/?email=haseebcodejourney@gmail.com", "User Tasks (Specific User)", 30),
        (f"{base_url}/api/s3/user-screenshots/?limit=5", "User Screenshots (Limited)", 60),
        (f"{base_url}/api/s3/user-analytics/", "User Analytics", 45),
        (f"{base_url}/api/s3/bucket-overview/", "Bucket Overview", 45),
    ]
    
    for url, name, timeout in endpoints:
        test_endpoint(url, name, timeout)
        time.sleep(2)  # Small delay between requests
    
    print("\n" + "=" * 50)
    print("🎯 API Testing Complete!")

if __name__ == "__main__":
    main()
