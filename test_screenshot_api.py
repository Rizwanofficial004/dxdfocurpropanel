#!/usr/bin/env python3
"""
API Tester for Screenshot Count APIs - Port 8010
"""

import requests
import json

def test_api(url, description):
    print(f"\n🧪 Testing: {description}")
    print(f"📡 URL: {url}")
    print("-" * 50)
    
    try:
        response = requests.get(url, timeout=10)
        print(f"✅ Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("📊 Response Data:")
            print(json.dumps(data, indent=2))
            
            # Show summary
            if 'total_users' in data:
                print(f"\n📈 Summary:")
                print(f"   👥 Total Users: {data.get('total_users', 0)}")
                print(f"   📸 Total Screenshots: {data.get('total_screenshots', 0):,}")
                
                users = data.get('users', [])
                if users:
                    print(f"   🔝 Top 5 Users:")
                    for i, user in enumerate(users[:5], 1):
                        email = user.get('user_email', user.get('user_name', 'Unknown'))
                        count = user.get('screenshot_count', 0)
                        percentage = user.get('percentage', 0)
                        print(f"      {i}. {email}: {count:,} screenshots ({percentage:.1f}%)")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Server not running or wrong port")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def main():
    print("🚀 Starting Screenshot API Tests (Port 8010)...")
    
    base_url = "http://127.0.0.1:8010"
    
    # Test different APIs
    apis = [
        (f"{base_url}/api/health/", "Health Check"),
        (f"{base_url}/api/users/screenshots-count/", "All Users Screenshot Count"),
        (f"{base_url}/api/users/screenshots-count/?limit=5", "Top 5 Users"),
        (f"{base_url}/api/users/screenshots-count/?sort_by=count&order=desc", "Users Sorted by Count"),
        (f"{base_url}/api/scheduler/status/", "Scheduler Status"),
    ]
    
    for url, description in apis:
        test_api(url, description)
    
    print("\n" + "="*60)
    print("🎉 API Testing Complete!")

if __name__ == "__main__":
    main()
